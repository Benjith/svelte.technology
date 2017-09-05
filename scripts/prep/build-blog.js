const fs = require( 'fs' );
const path = require( 'path' );
const hljs = require( 'highlight.js' );
const hasha = require( 'hasha' );
const { updateManifest, mkdirp } = require( './utils.js' );
const marked = require( 'marked' );

const root = path.resolve( __dirname, '../..' );

const posts = fs.readdirSync( `${root}/content/blog` )
	.map( file => {
		if ( file[0] === '.' || path.extname( file ) !== '.md' ) return;

		const markdown = fs.readFileSync( `${root}/content/blog/${file}`, 'utf-8' );

		const match = /---\n([\s\S]+?)\n---/.exec( markdown );
		const frontMatter = match[1];
		const content = markdown.slice( match[0].length );

		const metadata = {};
		frontMatter.split( '\n' ).forEach( pair => {
			const colonIndex = pair.indexOf( ':' );
			metadata[ pair.slice( 0, colonIndex ).trim() ] = pair.slice( colonIndex + 1 ).trim();
		});

		const date = new Date( metadata.pubdate );
		metadata.dateString = date.toDateString();

		const html = marked( content.replace( /^\t+/gm, match => match.split( '\t' ).join( '  ' ) ) )

		// console.log(html);

			.replace( /<pre><code class="lang-(\w+)">([\s\S]+?)<\/code><\/pre>/g, ( match, lang, value ) => {
				const highlighted = hljs.highlight( lang, value ).value;
				return `<pre class="lang-${lang}"><code>${highlighted}</code></pre>`;
			});

		return {
			html,
			metadata,
			slug: file.replace( /^[\d-]+/, '' ).replace( /\.md$/, '' )
		};
	})
	.sort((a, b) => {
		return a.metadata.pubdate < b.metadata.pubdate ? 1 : -1;
	});

const preview = posts.map( post => {
	return { slug: post.slug, metadata: post.metadata };
});

const previewJson = JSON.stringify( preview );
const hash = hasha(previewJson, { algorithm: 'md5' });
fs.writeFileSync( `${root}/build/blog.${hash}.json`, previewJson );
updateManifest({ 'blog.json': `blog.${hash}.json` });

// TODO hash individual posts?
mkdirp(`${root}/public/blog`);
posts.forEach( post => {
	fs.writeFileSync( `${root}/public/blog/${post.slug}.json`, JSON.stringify( post ) );
});

const months = ',Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split( ',' );

function formatPubdate ( str ) {
	const [ y, m, d ] = str.split( '-' );
	return `${d} ${months[m]} ${y}`;
}

const rss = `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
	<title>Svelte blog</title>
	<link>https://svelte.technology/blog</link>
	<description>News and information about the magical disappearing UI framework</description>
	<image>
		<url>https://svelte.technology/favicon.png</url>
		<title>Svelte</title>
		<link>https://svelte.technology/blog</link>
	</image>
	${posts.map( post => `
		<item>
			<title>${post.metadata.title}</title>
			<link>https://svelte.technology/blog/${post.slug}</link>
			<description>${post.metadata.description}</description>
			<pubDate>${formatPubdate(post.metadata.pubdate)}</pubDate>
		</item>
	` )}
</channel>

</rss>
`
.replace( />[^\S]+/gm, '>' )
.replace( /[^\S]+</gm, '<' )
.trim();

fs.writeFileSync( `${root}/public/blog/rss.xml`, rss );