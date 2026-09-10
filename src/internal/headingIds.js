const
	headingCleanupConfigured = Symbol('markdownClipHeadingCleanupConfigured'),
	headingTag = /<h[1-6]\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,
	markerAttributeName = 'data-markdown-clip-heading',
	explicitIdAttributeName = 'data-markdown-clip-explicit-id',
	markerAttribute = new RegExp(`\\s${markerAttributeName}\\s*=\\s*(?:"[^"]*"|'[^']*')`, 'i'),
	explicitIdAttribute = new RegExp(`\\s${explicitIdAttributeName}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'),
	idAttribute = /\sid\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

function configureHeadingIds(md) {
	if (md.renderer[headingCleanupConfigured]) return;

	const originalRender = md.renderer.render;
	md.renderer.render = function(tokens, options, env) {
		if (!env || !env.markdownClip) {
			return originalRender.call(this, tokens, options, env);
		}

		const headings = markMarkdownHeadings(tokens);
		let html;
		try {
			html = originalRender.call(this, tokens, options, env);
		} finally {
			restoreHeadingTokens(headings);
		}

		return normalizeRenderedHeadingIds(html, env.markdownClip.removeHeadingId);
	};
	md.renderer[headingCleanupConfigured] = true;
}

function markMarkdownHeadings(tokens) {
	return tokens
		.filter(token => token.type === 'heading_open')
		.map(token => {
			const
				attrs = token.attrs ? token.attrs.map(attribute => [...attribute]) : token.attrs,
				id = token.attrGet('id');

			token.attrSet(markerAttributeName, 'true');
			if (id !== null) token.attrSet(explicitIdAttributeName, id);

			return {token, attrs};
		});
}

function restoreHeadingTokens(headings) {
	headings.forEach(({token, attrs}) => {
		token.attrs = attrs;
	});
}

function normalizeRenderedHeadingIds(html, removeHeadingId) {
	return html.replace(headingTag, tag => {
		if (!markerAttribute.test(tag)) return tag;

		const
			explicitId = tag.match(explicitIdAttribute),
			automaticIds = [...tag.matchAll(idAttribute)];
		let cleanedTag = tag
			.replace(markerAttribute, '')
			.replace(explicitIdAttribute, '')
			.replace(idAttribute, '');

		const id = explicitId ? explicitId[1] : !removeHeadingId && automaticIds.length ? automaticIds[0][1] : null;
		if (!id) return cleanedTag;

		const
			closing = cleanedTag.endsWith('/>') ? '/>' : '>',
			opening = cleanedTag.slice(0, -closing.length).trimEnd();

		return `${opening} id=${id}${closing}`;
	});
}

module.exports = {configureHeadingIds};
