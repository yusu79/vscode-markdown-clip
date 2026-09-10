const vscode = require('vscode');
const {clearTimeout, setTimeout} = require('timers');

const
	diagnosticSource = 'Markdown Clip',
	diagnosticCode = 'duplicate-heading-id',
	updateDelay = 150;

class DuplicateHeadingIdDiagnostics {
	constructor(diagnostics = vscode.languages.createDiagnosticCollection('markdown-clip')) {
		this._markdownIt = undefined;
		this._pendingUpdates = new Map();
		this._diagnostics = diagnostics;
		this._disposables = [
			vscode.workspace.onDidOpenTextDocument(document => this.update(document)),
			vscode.workspace.onDidChangeTextDocument(event => this.scheduleUpdate(event.document)),
			vscode.workspace.onDidCloseTextDocument(document => this.delete(document)),
			vscode.window.onDidChangeActiveTextEditor(editor => {
				if (editor) this.update(editor.document);
			}),
		];
	}

	setMarkdownIt(md) {
		this._markdownIt = md;
		vscode.workspace.textDocuments.forEach(document => this.update(document));
	}

	scheduleUpdate(document) {
		if (document.languageId !== 'markdown') {
			this.delete(document);
			return;
		}

		const
			key = document.uri.toString(),
			pendingUpdate = this._pendingUpdates.get(key);

		if (pendingUpdate) clearTimeout(pendingUpdate);
		this._pendingUpdates.set(key, setTimeout(() => {
			this._pendingUpdates.delete(key);
			if (!document.isClosed) this.update(document);
		}, updateDelay));
	}

	update(document) {
		if (document.languageId !== 'markdown') {
			this.delete(document);
			return;
		}
		if (!this._markdownIt) return;

		try {
			const
				tokens = this._markdownIt.parse(document.getText(), Object.create(null)),
				explicitIds = collectExplicitHeadingIds(document, tokens),
				counts = countIds(explicitIds),
				diagnostics = explicitIds
					.filter(item => counts.get(item.id) > 1)
					.map(item => createDiagnostic(item));

			this._diagnostics.set(document.uri, diagnostics);
		} catch (error) {
			void error;
			this._diagnostics.delete(document.uri);
		}
	}

	delete(document) {
		const
			key = document.uri.toString(),
			pendingUpdate = this._pendingUpdates.get(key);

		if (pendingUpdate) {
			clearTimeout(pendingUpdate);
			this._pendingUpdates.delete(key);
		}
		this._diagnostics.delete(document.uri);
	}

	dispose() {
		this._pendingUpdates.forEach(pendingUpdate => clearTimeout(pendingUpdate));
		this._pendingUpdates.clear();
		this._disposables.forEach(disposable => disposable.dispose());
		this._diagnostics.dispose();
	}
}

function collectExplicitHeadingIds(document, tokens) {
	return tokens
		.filter(token => token.type === 'heading_open' && token.map && token.attrGet('id') !== null)
		.map(token => findExplicitId(document, token, token.attrGet('id')))
		.filter(item => item !== undefined);
}

function findExplicitId(document, token, id) {
	const marker = `#${id}`;

	for (let lineNumber = token.map[0]; lineNumber < token.map[1]; lineNumber++) {
		const
			line = document.lineAt(lineNumber),
			character = line.text.lastIndexOf(marker);

		if (character >= 0) {
			return {
				id,
				range: new vscode.Range(lineNumber, character, lineNumber, character + marker.length),
			};
		}
	}

	return undefined;
}

function countIds(explicitIds) {
	return explicitIds.reduce((counts, item) => {
		counts.set(item.id, (counts.get(item.id) || 0) + 1);
		return counts;
	}, new Map());
}

function createDiagnostic(item) {
	const diagnostic = new vscode.Diagnostic(
		item.range,
		vscode.l10n.t('Heading ID "{0}" is duplicated in this document. IDs must be unique.', item.id),
		vscode.DiagnosticSeverity.Warning
	);

	diagnostic.source = diagnosticSource;
	diagnostic.code = diagnosticCode;
	return diagnostic;
}

module.exports = {DuplicateHeadingIdDiagnostics};
