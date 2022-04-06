const express = require("express");
const { parse } = require('url')
const nextApp = require("next");
const path = require('path');

const port = 8080
const isDev = process.env.NODE_ENV !== "production"

const app = nextApp({
  dev: isDev
});

const appRequestHandler = app.getRequestHandler();

const url = require("url");

const cacheableResponse = require("cacheable-response");

const parsePath = ({ path }) =>
  path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;

const ssrCache = cacheableResponse({
  get: async ({ app, query, path, req, res }) => ({
    data: await app.renderToHTML(req, res, path, query)
  }),
  getKey: ({ cacheKeys, path, req: { query }, res }) => {
    const queryKey = [...cacheKeys, "gtm_off"]
      .sort((a, b) => a.localeCompare(b))
      .reduce(
        (str, el) =>
          query.hasOwnProperty(el) ? `${str}${el}${query[el]}` : str,
        ""
      );

    return path + res.locals.city.id + queryKey;
  },
  send: ({ data, res }) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(data);
  },
  ttl: 1000 * 60 * 60 * 1 // 1 час
});

const render = (app, cacheKeys = []) => (req, res) => {
  const path = parsePath(req);

  const { query } = url.parse(req.url, true);

  return isDev || path.endsWith("operator")
    ? app.render(req, res, path, query)
    : ssrCache({ app, cacheKeys, query, path, req, res });
};

(async () => {
  await app.prepare();

  const server = express();

  server.disable("x-powered-by");

  server.get('/test.json', (req, res) => {
    const filePath = path.join(__dirname, '', 'test.json');
    console.log(filePath)
    res.sendFile(filePath)
    // return app.sendFile(filePath)
  });

  server.get("/_next/*", (req, res) => appRequestHandler(req, res));

  server.use(express.static(path.join(__dirname, 'public')));
  server.get("*", render(app));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`); // eslint-disable-line no-console
  });
})();