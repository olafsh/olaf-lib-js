import { readFileSync } from "node:fs";
import { createServer } from "node:https";

const key = readFileSync("./key.pem");
const cert = readFileSync("./cert.pem");

const httpsServer = createServer(
  {
    key,
    cert,
  },
  (req, res) => {
    if (req.method === "GET") {
      let content;
      if (["", "/"].includes(req.url)) {
        content = readFileSync("./public/index.html");
      } else if (req.url === "/index.js") {
        content = readFileSync("./public/index.js");
      } else if (req.url === "/authorize.js") {
        content = readFileSync("./public/authorize.js");
      } else if (req.url.startsWith("/authorize")) {
        content = readFileSync("./public/authorize.html");
      } else {
        res.writeHead(404).end();
        return;
      }

      res.writeHead(200, {
        "content-type": req.url.includes(".js") ? "text/javascript" : "text/html",
      });
      res.write(content);
      res.end();
    } else {
      res.writeHead(404).end();
    }
  }
);

const host = process.env.HOST;
const port = process.env.PORT || 3000;

httpsServer.listen(port, () => {
  console.log(`server listening at https://${host}:${port}`);
});
