import client from './client/rollup.config.js';
import codemirror from './client/rollup.config.codemirror.js';
import serviceWorker from './service-worker/rollup.config.js';
import server from './server/rollup.config.js';

export default [
	client,
	codemirror,
	serviceWorker,
	server
];