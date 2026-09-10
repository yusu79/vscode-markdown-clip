const assert = require('assert');
const {setTimeout} = require('timers');

const
	MarkdownIt = require('markdown-it'),
	markdownItAttrs = require('markdown-it-attrs'),
	vscode = require('vscode'),
	extension = require('../extension'),
	{GetConfig} = require('../src/configs/getConfig'),
	{DuplicateHeadingIdDiagnostics} = require('../src/internal/duplicateHeadingIdDiagnostics'),
	{configureHeadingIds} = require('../src/internal/headingIds'),
	{MarkdownDocument} = require('../src/internal/markdownDocument');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let
		originalMarkdownEngine,
		originalGetConfig,
		renderHTML;

	setup(() => {
		originalMarkdownEngine = extension.md;
		originalGetConfig = GetConfig.get;
		delete require.cache[require.resolve('../src/internal/render')];
		({renderHTML} = require('../src/internal/render'));
	});

	teardown(() => {
		extension.md = originalMarkdownEngine;
		GetConfig.get = originalGetConfig;
	});

	test('warns every occurrence of a duplicated explicit heading ID', async () => {
		const
			document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: [
					'# First {#same}',
					'## Second {.class #same}',
					'### Third {#same}',
					'#### Other {#other}',
				].join('\n'),
			}),
			{diagnostics, service} = createDuplicateHeadingIdDiagnostics(document);

		try {
			assert.strictEqual(diagnostics.length, 3);
			assert.deepStrictEqual(
				diagnostics.map(diagnostic => document.getText(diagnostic.range)),
				['#same', '#same', '#same']
			);
			for (const diagnostic of diagnostics) {
				assert.strictEqual(diagnostic.severity, vscode.DiagnosticSeverity.Warning);
				assert.strictEqual(diagnostic.source, 'Markdown Clip');
				assert.strictEqual(diagnostic.code, 'duplicate-heading-id');
			}
		} finally {
			service.dispose();
		}
	});

	test('ignores unique explicit IDs, automatic IDs, and ID syntax in code blocks', async () => {
		const
			document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: [
					'# Automatic ID',
					'# Unique {#same}',
					'```md',
					'# Code example {#same}',
					'```',
				].join('\n'),
			}),
			{diagnostics, service} = createDuplicateHeadingIdDiagnostics(document);

		try {
			assert.deepStrictEqual(diagnostics, []);
		} finally {
			service.dispose();
		}
	});

	test('scopes explicit heading IDs to each document', async () => {
		const
			firstDocument = await vscode.workspace.openTextDocument({language: 'markdown', content: '# First {#shared}'}),
			secondDocument = await vscode.workspace.openTextDocument({language: 'markdown', content: '# Second {#shared}'}),
			store = createDiagnosticStore(),
			service = new DuplicateHeadingIdDiagnostics(store);

		try {
			service.setMarkdownIt(new MarkdownIt().use(markdownItAttrs));
			assert.deepStrictEqual(store.get(firstDocument.uri), []);
			assert.deepStrictEqual(store.get(secondDocument.uri), []);
		} finally {
			service.dispose();
		}
	});

	test('clears duplicate heading ID warnings after the document is edited', async () => {
		const
			document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: ['# First {#same}', '# Second {#same}'].join('\n'),
			}),
			store = createDiagnosticStore(),
			service = new DuplicateHeadingIdDiagnostics(store),
			edit = new vscode.WorkspaceEdit();

		try {
			service.setMarkdownIt(new MarkdownIt().use(markdownItAttrs));
			assert.strictEqual(store.get(document.uri).length, 2);

			edit.replace(
				document.uri,
				new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length)),
				['# First {#same}', '# Second {#other}'].join('\n')
			);
			assert.strictEqual(await vscode.workspace.applyEdit(edit), true);
			await delay(250);

			assert.deepStrictEqual(store.get(document.uri), []);
		} finally {
			service.dispose();
		}
	});

	test('passes copy settings through a new markdownClip env for each render', async () => {
		const
			calls = [],
			document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: ['---', 'title: Settings', '---', 'Body'].join('\n'),
			}),
			markdownDocument = new MarkdownDocument(document, '');
		let settings = {
			removeHeadingId: true,
			removeVSCodeAttributes: false,
		};

		GetConfig.get = name => settings[name];
		extension.md = {
			render(content, env) {
				calls.push({content, env});
				return content;
			},
		};

		renderHTML(markdownDocument);
		settings = {
			removeHeadingId: false,
			removeVSCodeAttributes: true,
		};
		renderHTML(markdownDocument);

		assert.deepStrictEqual(calls.map(call => call.env.markdownClip), [
			{removeHeadingId: true, removeVSCodeAttributes: false},
			{removeHeadingId: false, removeVSCodeAttributes: true},
		]);
		assert.notStrictEqual(calls[0].env, calls[1].env);
		assert.notStrictEqual(calls[0].env.markdownClip, calls[1].env.markdownClip);
		assert.deepStrictEqual(calls[0].env.frontmatter, {title: 'Settings'});
	});

	test('removes only the Mermaid preview configuration span from copied HTML', async () => {
		const
			document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: '```mermaid\ngraph TD\n```',
			}),
			markdownDocument = new MarkdownDocument(document, '');

		extension.md = {
			render() {
				return [
					'<span data-config="{&quot;theme&quot;:&quot;vscode&quot;}" aria-hidden="true" id="markdown-mermaid"></span>',
					'<pre><code class="language-mermaid">graph TD</code></pre>',
					'<p><span id="markdown-mermaid">Authored content</span></p>',
					'<p><span aria-hidden="true">Other hidden content</span></p>',
				].join('\n');
			},
		};

		assert.strictEqual(renderHTML(markdownDocument), [
			'<pre><code class="language-mermaid">graph TD</code></pre>',
			'<p><span id="markdown-mermaid">Authored content</span></p>',
			'<p><span aria-hidden="true">Other hidden content</span></p>',
		].join('\n'));
	});

	test('removes VS Code line metadata from copied HTML while preserving other attributes', async () => {
		const
			document = await vscode.workspace.openTextDocument({language: 'markdown', content: '# Heading'}),
			markdownDocument = new MarkdownDocument(document, '');

		GetConfig.get = name => name === 'removeVSCodeAttributes';
		extension.md = {
			render() {
				return [
					'<h1 data-line="7" class="code-line custom" dir="auto">Heading</h1>',
					"<p class='before code-line after' data-line='8' data-other='kept'>Body</p>",
					'<blockquote class="code-line">Quote</blockquote>',
					'<div class="untouched  spacing">No line metadata</div>',
					'<code>data-line="literal" class="code-line"</code>',
				].join('\n');
			},
		};

		assert.strictEqual(renderHTML(markdownDocument), [
			'<h1 class="custom" dir="auto">Heading</h1>',
			"<p class='before after' data-other='kept'>Body</p>",
			'<blockquote>Quote</blockquote>',
			'<div class="untouched  spacing">No line metadata</div>',
			'<code>data-line="literal" class="code-line"</code>',
		].join('\n'));
	});

	test('keeps VS Code line metadata when removal is disabled', async () => {
		const
			document = await vscode.workspace.openTextDocument({language: 'markdown', content: 'Body'}),
			markdownDocument = new MarkdownDocument(document, ''),
			html = '<p data-line="7" class="code-line custom" dir="auto">Body</p>';

		GetConfig.get = () => false;
		extension.md = {render: () => html};

		assert.strictEqual(renderHTML(markdownDocument), html);
	});

	test('removes an automatic heading ID only from copied HTML', () => {
		const
			md = createMarkdownItDouble(),
			token = createToken('heading_open', [['class', 'heading']]);

		configureHeadingIds(md);

		assert.strictEqual(renderTokens(md, [token], {markdownClip: {removeHeadingId: true}}), '<h1 class="heading">');
		assert.deepStrictEqual(token.attrs, [['class', 'heading']]);
	});

	test('preserves an explicit heading ID set by a parser plugin', () => {
		const
			md = createMarkdownItDouble(),
			token = createToken('heading_open', [['id', 'custom-id'], ['class', 'heading']]);

		configureHeadingIds(md);

		assert.strictEqual(
			renderTokens(md, [token], {markdownClip: {removeHeadingId: true}}),
			'<h1 class="heading" id="custom-id">'
		);
		assert.deepStrictEqual(token.attrs, [['id', 'custom-id'], ['class', 'heading']]);
	});

	test('prefers an explicit heading ID when automatic IDs are enabled', () => {
		const
			md = createMarkdownItDouble(),
			token = createToken('heading_open', [['id', 'custom-id'], ['class', 'heading']]);

		configureHeadingIds(md);

		assert.strictEqual(
			renderTokens(md, [token], {markdownClip: {removeHeadingId: false}}),
			'<h1 class="heading" id="custom-id">'
		);
		assert.deepStrictEqual(token.attrs, [['id', 'custom-id'], ['class', 'heading']]);
	});

	test('keeps one automatic heading ID when automatic IDs are enabled', () => {
		const
			md = createMarkdownItDouble(),
			token = createToken('heading_open', []);

		configureHeadingIds(md);

		assert.strictEqual(
			renderTokens(md, [token], {markdownClip: {removeHeadingId: false}}),
			'<h1 id="automatic-heading">'
		);
	});

	test('keeps heading rendering unchanged outside copied HTML', () => {
		const
			md = createMarkdownItDouble(),
			token = createToken('heading_open', []);

		configureHeadingIds(md);

		assert.strictEqual(
			renderTokens(md, [token], {}),
			'<h1 id="automatic-heading" id="automatic-heading-2">'
		);
	});

	test('keeps authored HTML and non-heading IDs', () => {
		const
			md = createMarkdownItDouble(),
			tokens = [
				{type: 'html_block', content: '<h1 id="manual-id" class="manual">Manual</h1>'},
				createToken('paragraph_open', [['id', 'paragraph-id']], 'p'),
			];

		configureHeadingIds(md);

		assert.strictEqual(
			renderTokens(md, tokens, {markdownClip: {removeHeadingId: true}}),
			'<h1 id="manual-id" class="manual">Manual</h1><p id="paragraph-id">'
		);
	});

	test('cleans full-document and selection HTML with both copy settings enabled', async () => {
		const scenarios = await createClipboardScenarios();

		GetConfig.get = () => true;
		extension.md = createIntegratedMarkdownEngine();

		for (const scenario of scenarios) {
			const html = renderHTML(scenario.markdownDocument);

			assert.strictEqual(scenario.markdownDocument.content, clipboardFixture);
			assert.ok(!html.includes('id="markdown-mermaid"'), scenario.name);
			assert.ok(!html.includes('data-line='), scenario.name);
			assert.ok(!html.includes('code-line'), scenario.name);
			assert.match(html, /<h1 class="heading" dir="auto">Automatic ID<\/h1>/, scenario.name);
			assert.match(html, /<h1 class="heading" dir="auto" id="explicit-id">Explicit ID<\/h1>/, scenario.name);
			assert.match(html, /<p class="paragraph" dir="auto">Body<\/p>/, scenario.name);
			assert.match(html, /<blockquote dir="auto">/, scenario.name);
			assert.match(html, /<code class="language-mermaid">graph TD/, scenario.name);
		}
	});

	test('keeps configured attributes in full-document and selection HTML when removal is disabled', async () => {
		const scenarios = await createClipboardScenarios();

		GetConfig.get = () => false;
		extension.md = createIntegratedMarkdownEngine();

		for (const scenario of scenarios) {
			const html = renderHTML(scenario.markdownDocument);

			assert.ok(!html.includes('id="markdown-mermaid"'), scenario.name);
			assert.match(html, /<h1 data-line="0" class="code-line heading" dir="auto" id="automatic-id">Automatic ID<\/h1>/, scenario.name);
			assert.match(html, /<h1 data-line="1" class="code-line heading" dir="auto" id="explicit-id">Explicit ID<\/h1>/, scenario.name);
			assert.match(html, /<p data-line="2" class="code-line paragraph" dir="auto">Body<\/p>/, scenario.name);
			assert.match(html, /<blockquote data-line="4" class="code-line" dir="auto">/, scenario.name);
			assert.ok(!html.includes('id="explicit-id" id='), scenario.name);
		}
	});

	test('isolates cleanup settings across consecutive full-document and selection renders', async () => {
		const
			[fullDocument, selection] = await createClipboardScenarios(),
			settings = {
				removeHeadingId: true,
				removeVSCodeAttributes: true,
			};

		GetConfig.get = name => settings[name];
		extension.md = createIntegratedMarkdownEngine();

		const cleaned = renderHTML(fullDocument.markdownDocument);
		settings.removeHeadingId = false;
		settings.removeVSCodeAttributes = false;
		const preserved = renderHTML(selection.markdownDocument);
		settings.removeHeadingId = true;
		settings.removeVSCodeAttributes = true;
		const cleanedAgain = renderHTML(fullDocument.markdownDocument);

		assert.ok(!cleaned.includes('data-line='));
		assert.ok(!cleaned.includes('id="automatic-id"'));
		assert.ok(preserved.includes('data-line="0"'));
		assert.ok(preserved.includes('id="automatic-id"'));
		assert.strictEqual(cleanedAgain, cleaned);
	});

	test('passes the full front matter to a plugin when rendering the full document', async () => {
		const
			calls = [],
			document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: [
					'---',
					'title: Full document',
					'otherPlugin:',
					'  nested:',
					'    value: enabled',
					'---',
					'# Body',
				].join('\n'),
			}),
			markdownDocument = new MarkdownDocument(document, '');

		useFrontmatterReader(calls);

		assert.strictEqual(renderHTML(markdownDocument), 'enabled:# Body');
		assert.strictEqual(calls[0].content, '# Body');
		assert.deepStrictEqual(calls[0].env.frontmatter, {
			title: 'Full document',
			otherPlugin: {
				nested: {
					value: 'enabled',
				},
			},
		});
	});

	test('uses the original document front matter when rendering a selection', async () => {
		const
			calls = [],
			document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: [
					'---',
					'otherPlugin:',
					'  nested:',
					'    value: selected',
					'---',
					'Prefix **selection** suffix',
				].join('\n'),
			}),
			line = document.lineAt(5).text,
			start = line.indexOf('**selection**'),
			selection = new vscode.Selection(5, start, 5, start + '**selection**'.length),
			markdownDocument = new MarkdownDocument(document, document.getText(selection));

		useFrontmatterReader(calls);

		assert.strictEqual(renderHTML(markdownDocument), 'selected:**selection**');
		assert.strictEqual(calls[0].content, '**selection**');
		assert.strictEqual(calls[0].env.frontmatter.otherPlugin.nested.value, 'selected');
	});

	test('uses an empty front matter object when front matter is missing, empty, or null', async () => {
		const
			calls = [],
			sources = [
				'Body without front matter',
				['---', '---', 'Body with empty front matter'].join('\n'),
				['---', 'null', '---', 'Body with null front matter'].join('\n'),
			];

		useFrontmatterReader(calls);

		for (const source of sources) {
			const
				document = await vscode.workspace.openTextDocument({language: 'markdown', content: source}),
				markdownDocument = new MarkdownDocument(document, '');

			renderHTML(markdownDocument);
		}

		assert.strictEqual(calls.length, 3);
		for (const call of calls) {
			assert.deepStrictEqual(call.env.frontmatter, {});
		}
	});

	test('does not reuse the env or front matter from the previous document', async () => {
		const
			calls = [],
			firstDocument = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: ['---', 'otherPlugin:', '  nested:', '    value: first', '---', 'First'].join('\n'),
			}),
			secondDocument = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: 'Second',
			});

		useFrontmatterReader(calls);
		renderHTML(new MarkdownDocument(firstDocument, ''));
		renderHTML(new MarkdownDocument(secondDocument, ''));

		assert.notStrictEqual(calls[0].env, calls[1].env);
		assert.deepStrictEqual(calls[0].env.frontmatter, {
			otherPlugin: {
				nested: {
					value: 'first',
				},
			},
		});
		assert.deepStrictEqual(calls[1].env.frontmatter, {});
	});

	test('protects parsed metadata from plugin mutations across renders', async () => {
		const
			calls = [],
			document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: ['---', 'otherPlugin:', '  nested:', '    value: original', '---', 'Body'].join('\n'),
			}),
			markdownDocument = new MarkdownDocument(document, ''),
			markdownEngine = {
				render(content, env) {
					calls.push({
						env,
						valueBeforeMutation: env.frontmatter.otherPlugin.nested.value,
					});
					env.frontmatter.otherPlugin.nested.value = 'mutated';
					env.pluginScratch = true;
					return content;
				},
			};

		extension.md = markdownEngine;
		renderHTML(markdownDocument);
		renderHTML(markdownDocument);

		assert.strictEqual(extension.md, markdownEngine);
		assert.deepStrictEqual(Object.keys(markdownEngine), ['render']);
		assert.notStrictEqual(calls[0].env, calls[1].env);
		assert.notStrictEqual(calls[0].env.frontmatter, markdownDocument.meta.data);
		assert.deepStrictEqual(calls.map(call => call.valueBeforeMutation), ['original', 'original']);
		assert.deepStrictEqual(markdownDocument.meta.data, {
			otherPlugin: {
				nested: {
					value: 'original',
				},
			},
		});
	});

	test('keeps markdown-it env references separate from front matter references', async () => {
		const
			calls = [],
			document = await vscode.workspace.openTextDocument({
				language: 'markdown',
				content: ['---', 'references:', '  source: frontmatter', '---', 'Body'].join('\n'),
			}),
			markdownDocument = new MarkdownDocument(document, '');

		extension.md = {
			render(content, env) {
				env.references = {
					LINK: {
						href: 'https://example.com',
					},
				};
				calls.push({content, env});
				return content;
			},
		};
		renderHTML(markdownDocument);

		assert.deepStrictEqual(calls[0].env.frontmatter.references, {
			source: 'frontmatter',
		});
		assert.deepStrictEqual(calls[0].env.references, {
			LINK: {
				href: 'https://example.com',
			},
		});
		assert.notStrictEqual(calls[0].env.references, calls[0].env.frontmatter.references);
		assert.deepStrictEqual(markdownDocument.meta.data.references, {
			source: 'frontmatter',
		});
	});
});

function useFrontmatterReader(calls) {
	extension.md = {
		render(content, env) {
			const
				pluginConfig = env.frontmatter.otherPlugin,
				value = pluginConfig ? pluginConfig.nested.value : 'none';

			calls.push({content, env});
			return `${value}:${content}`;
		},
	};
}

function createDuplicateHeadingIdDiagnostics(document) {
	const
		store = createDiagnosticStore(),
		service = new DuplicateHeadingIdDiagnostics(store);

	service.setMarkdownIt(new MarkdownIt().use(markdownItAttrs));
	return {diagnostics: store.get(document.uri), service};
}

function createDiagnosticStore() {
	const entries = new Map();

	return {
		set(uri, diagnostics) {
			entries.set(uri.toString(), diagnostics);
		},
		delete(uri) {
			entries.delete(uri.toString());
		},
		get(uri) {
			return entries.get(uri.toString()) || [];
		},
		dispose() {
			entries.clear();
		},
	};
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const clipboardFixture = [
	'# Automatic ID',
	'# Explicit ID {#explicit-id}',
	'Body',
	'',
	'> Quote',
	'',
	'```mermaid',
	'graph TD',
	'```',
].join('\n');

async function createClipboardScenarios() {
	const
		fullSource = ['---', 'title: Full document', '---', clipboardFixture].join('\n'),
		selectionSource = ['---', 'title: Selection', '---', 'Before', clipboardFixture, 'After'].join('\n'),
		fullDocument = await vscode.workspace.openTextDocument({language: 'markdown', content: fullSource}),
		selectionDocument = await vscode.workspace.openTextDocument({language: 'markdown', content: selectionSource}),
		startOffset = selectionDocument.getText().indexOf(clipboardFixture),
		endOffset = startOffset + clipboardFixture.length,
		selection = new vscode.Selection(
			selectionDocument.positionAt(startOffset),
			selectionDocument.positionAt(endOffset)
		);

	return [
		{name: 'full document', markdownDocument: new MarkdownDocument(fullDocument, '')},
		{name: 'selection', markdownDocument: new MarkdownDocument(selectionDocument, selectionDocument.getText(selection))},
	];
}

function createIntegratedMarkdownEngine() {
	const
		md = new MarkdownIt({html: true}).use(markdownItAttrs),
		renderRule = (tokens, index, options, env, self) => self.renderToken(tokens, index, options),
		originalRender = md.render.bind(md);

	md.renderer.rules.heading_open = (tokens, index, options, env, self) => {
		const
			token = tokens[index],
			automaticId = tokens[index + 1].content.toLowerCase().replace(/\s+/g, '-');

		token.attrs = [
			...(token.attrs || []),
			['id', automaticId],
			['data-line', String(token.map[0])],
			['class', 'code-line heading'],
			['dir', 'auto'],
		];
		return renderRule(tokens, index, options, env, self);
	};
	md.renderer.rules.paragraph_open = (tokens, index, options, env, self) => {
		const token = tokens[index];

		token.attrs = [
			...(token.attrs || []),
			['data-line', String(token.map[0])],
			['class', 'code-line paragraph'],
			['dir', 'auto'],
		];
		return renderRule(tokens, index, options, env, self);
	};
	md.renderer.rules.blockquote_open = (tokens, index, options, env, self) => {
		const token = tokens[index];

		token.attrs = [
			...(token.attrs || []),
			['data-line', String(token.map[0])],
			['class', 'code-line'],
			['dir', 'auto'],
		];
		return renderRule(tokens, index, options, env, self);
	};

	configureHeadingIds(md);
	md.render = (source, env) => [
		'<span id="markdown-mermaid" aria-hidden="true" data-config="{}"></span>',
		originalRender(source, env),
	].join('\n');

	return md;
}

function createMarkdownItDouble() {
	return {
		renderer: {
			render(tokens) {
				return tokens.map(token => {
					if (token.type === 'html_block') return token.content;

					if (token.type === 'heading_open') {
						token.attrSet('id', 'automatic-heading');
						token.attrs.push(['id', 'automatic-heading-2']);
					}

					return serializeToken(token);
				}).join('');
			},
		},
	};
}

function createToken(type, attrs, tag = 'h1') {
	return {
		type,
		tag,
		attrs,
		attrGet(name) {
			const attribute = this.attrs && this.attrs.find(item => item[0] === name);
			return attribute ? attribute[1] : null;
		},
		attrSet(name, value) {
			const attribute = this.attrs && this.attrs.find(item => item[0] === name);
			if (attribute) {
				attribute[1] = value;
			} else {
				this.attrs = this.attrs || [];
				this.attrs.push([name, value]);
			}
		},
	};
}

function renderTokens(md, tokens, env) {
	return md.renderer.render(tokens, {}, env);
}

function serializeToken(token) {
	const attributes = (token.attrs || [])
		.map(attribute => ` ${attribute[0]}="${escapeAttribute(attribute[1])}"`)
		.join('');
	return `<${token.tag}${attributes}>`;
}

function escapeAttribute(value) {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
