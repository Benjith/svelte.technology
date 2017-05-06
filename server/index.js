const path = require( 'path' );
const express = require( 'express' );
const compression = require( 'compression' );
const servePage = require( './servePage.js' );

const dev = !!process.env.DEV;

const app = express();

const root = path.resolve( __dirname, '..' );

app.use( compression({ threshold: 0 }) );

function renderComponent ( file, data ) {
	if ( dev ) {
		const rollup = require( 'rollup' );
		const json = require( 'rollup-plugin-json' );
		const svelte = require( 'rollup-plugin-svelte' );
		const resolve = require( 'rollup-plugin-node-resolve' );

		return rollup.rollup({
			entry: `${root}/shared/${file}.html`,
			plugins: [
				resolve(),
				json(),
				svelte({
					generate: 'ssr',
					css: false
				})
			]
		}).then( bundle => {
			const { code } = bundle.generate({
				format: 'iife',
				moduleName: 'SvelteComponent'
			});

			const SvelteComponent = eval( `(function () { ${code}; return SvelteComponent; })()` );

			return SvelteComponent.render( data );
		});
	}

	return require( `./${file}.js` ).render( data );
}

app.get( '/', ( req, res ) => {
	servePage( res, {
		title: 'Svelte • The magical disappearing UI framework',
		nav: renderComponent( 'components/Nav', { route: 'index' }),
		route: renderComponent( 'routes/Index' )
	}).catch( err => {
		console.log( err.stack ); // eslint-disable-line no-console
	});
});

app.use( ( req, res, next ) => {
	if ( req.url.slice( -1 ) === '/' && req.url.length > 1 ) {
		res.redirect( 301, req.url.slice( 0, -1 ) );
	} else {
		next();
	}
});

app.get( '/blog', ( req, res ) => {
	const posts = require( `${root}/public/blog.json` );

	servePage( res, {
		title: 'Svelte • The magical disappearing UI framework',
		nav: renderComponent( 'components/Nav', { route: 'blog' }),
		route: renderComponent( 'routes/BlogIndex', { posts })
	}).catch( err => {
		console.log( err.stack ); // eslint-disable-line no-console
	});
});

app.use( express.static( 'service-worker/dist' ) );
app.use( express.static( 'client/dist', { maxAge: dev ? '1s' : '1y' }));

app.use( '/examples', express.static( 'public/examples', {
	maxAge: 60 * 1000
}));

app.use( express.static( 'public', {
	maxAge: 1000 * 60 * 60 * 24 // one day
}));

app.get( '/blog/:slug', ( req, res ) => {
	const post = require( `${root}/public/blog/${req.params.slug}.json` );

	servePage( res, {
		title: `${post.metadata.title} • Svelte`,
		nav: renderComponent( 'components/Nav', { route: 'blog' }),
		route: renderComponent( 'routes/BlogPost', { post })
	}).catch( err => {
		console.log( err.stack ); // eslint-disable-line no-console
	});
});

app.get( '/guide', ( req, res ) => {
	const sections = require( `${root}/public/guide.json` );

	servePage( res, {
		title: 'Learn Svelte',
		nav: renderComponent( 'components/Nav', { route: 'guide' }),
		route: renderComponent( 'routes/Guide', { sections })
	}).catch( err => {
		console.log( err.stack ); // eslint-disable-line no-console
	});
});

app.get( '/repl', ( req, res ) => {
	servePage( res, {
		title: 'Svelte REPL',
		nav: renderComponent( 'components/Nav', { route: 'repl' }),
		route: renderComponent( 'routes/Repl/index' ) // TODO is there any point? just render an empty box instead?
	}).catch( err => {
		console.log( err.stack ); // eslint-disable-line no-console
	});
});

app.listen( 3000, () => {
	console.log( 'listening on localhost:3000' ); // eslint-disable-line no-console
});