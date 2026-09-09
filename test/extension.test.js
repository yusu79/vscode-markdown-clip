const assert = require('assert');

const
	vscode = require('vscode'),
	extension = require('../extension'),
	{MarkdownDocument} = require('../src/internal/markdownDocument');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let
		originalMarkdownEngine,
		renderHTML;

	setup(() => {
		originalMarkdownEngine = extension.md;
		delete require.cache[require.resolve('../src/internal/render')];
		({renderHTML} = require('../src/internal/render'));
	});

	teardown(() => {
		extension.md = originalMarkdownEngine;
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
