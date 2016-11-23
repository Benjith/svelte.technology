const cache = {};

export default function getComponentFromGist ( id ) {
	let cancelled = false;

	if ( !cache[ id ] ) {
		cache[ id ] = fetch( `https://api.github.com/gists/${id}` )
			.then( r => r.json() )
			.then( gist => {
				const sourceFile = gist.files[ 'component.html' ];
				const source = sourceFile && sourceFile.content;

				const jsonFile = gist.files[ 'data.json' ];
				const json = jsonFile && jsonFile.content;

				return {
					id,
					source,
					json: json || '{}'
				};
			})
			.catch( err => {
				cache[ id ] = null;
				throw err;
			});
	}

	const promise = cache[ id ].then( component => {
		if ( cancelled ) throw new Error( `Request was cancelled` );
		return component;
	});

	promise.cancel = () => {
		cancelled = true;
	};

	return promise;
}
