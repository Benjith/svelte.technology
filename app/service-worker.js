import { assets, shell, routes, timestamp } from './manifest/service-worker.js';

const ASSETS = `cache${timestamp}`;

const to_cache = shell.concat(assets);
const cached = new Set(to_cache);

self.addEventListener('install', event => {
	event.waitUntil(
		caches
			.open(ASSETS)
			.then(cache => cache.addAll(to_cache))
			.then(() => {
				self.skipWaiting();
			})
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(async keys => {
			for (const key of keys) {
				if (key !== ASSETS) await caches.delete(key);
			}

			await self.clients.claim();
		})
	);
});

self.addEventListener('fetch', event => {
	const url = new URL(event.request.url);
	if (!/^https?/.test(url.protocol)) return;
	if (event.request.method === 'POST') return;

	// ignore dev server requests
	if (url.hostname === self.location.hostname && url.port !== self.location.port) return;

	// always serve assets and webpack-generated files from cache
	if (url.host === self.location.host && cached.has(url.pathname)) {
		event.respondWith(caches.match(event.request));
		return;
	}

	// for everything else, try the cache first, falling back to
	// network if item is not in cache
	event.respondWith(
		caches
			.open(`offline${timestamp}`)
			.then(async cache => {
				let response = await cache.match(event.request);
				if (response) return response;

				response = await fetch(event.request);
				if (response) cache.put(event.request, response.clone());
				return response;
			})
	);
});
