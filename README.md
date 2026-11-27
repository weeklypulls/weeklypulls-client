# weeklypulls-client

React + antd single-page app for [weeklypulls.com](https://weeklypulls.com), built with Vite.
It talks to the [weeklypulls-data](https://github.com/weeklypulls/weeklypulls-data) API.

## Development

Requires Node 22.

```sh
npm install
VITE_API_URL=http://127.0.0.1:8000/ npm start   # defaults to https://api.weeklypulls.com/
npm run check                                   # typecheck, lint, format check
```

## Production

`npm run build` writes `build/`, and `npm run prod` serves it with a small Express
server (`server.cjs`) that falls back to `index.html` for client-side routes.

Hosted on Railway (service `client`). `VITE_API_URL` is set there as a build variable.
