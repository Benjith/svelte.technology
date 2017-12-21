const app = require('express')();
const compression = require('compression');
const sapper = require('sapper');
const serve = require('serve-static');

const { PORT = 3000 } = process.env;

console.log(`initialising server`);

const fetch = require('node-fetch');
global.fetch = (url, opts) => {
	if (url[0] === '/') url = `http://localhost:${PORT}${url}`;
	return fetch(url, opts);
};

app.use(compression({ threshold: 0 }));

app.use(serve('assets'));

app.use(sapper({
	selector: '#sapper'
}));

console.log(`starting server on port ${PORT}`);
app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
});