const path = require("path");
const express = require("express");
const port = process.env.PORT || 8080;
const app = express();
app.disable("x-powered-by");

const buildDir = path.join(__dirname, "build");
const indexHtml = path.join(buildDir, "index.html");

// Vite's hashed bundles never change, so browsers can keep them for a year.
app.use(
  "/assets",
  express.static(path.join(buildDir, "assets"), { immutable: true, maxAge: "1y" })
);
// A missing chunk (e.g. from before a deploy) is a 404, never index.html.
app.use("/assets", (_req, res) => {
  res.status(404).type("text/plain").send("Not found");
});

// Other static files (favicon, etc.); index.html always revalidates so a new
// deploy is picked up on the next load.
app.use(
  express.static(buildDir, {
    setHeaders(res, filePath) {
      if (filePath === indexHtml) res.setHeader("Cache-Control", "no-cache");
    },
  })
);

// Paths that look like files (have an extension) and weren't found above are
// real 404s; everything else is a client-side route.
app.get(/\.[a-z0-9]+$/i, (_req, res) => {
  res.status(404).type("text/plain").send("Not found");
});

app.get(/^\/.*$/, (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(indexHtml);
});

app.listen(port);
