const path = require("path");
const express = require("express");
const port = process.env.PORT || 8080;
const app = express();

const buildDir = path.join(__dirname, "build");
app.use(express.static(buildDir));

app.get(/^\/.*$/, function (_req, res) {
  res.sendFile(path.join(buildDir, "index.html"));
});

app.listen(port);
