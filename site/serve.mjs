// Local preview server for dist/ (zero dependencies). Supports Range
// requests, which Safari needs to play video.  node serve.mjs [port]
import { createServer } from "node:http";
import { createReadStream, statSync, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const ROOT = "dist";
const PORT = Number(process.argv[2] || 4321);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".png": "image/png", ".mp4": "video/mp4", ".webm": "video/webm",
};

createServer((req, res) => {
  let path = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  let file = join(ROOT, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  let status = 200;
  if (!existsSync(file)) { file = join(ROOT, "404.html"); status = 404; }
  const size = statSync(file).size;
  const type = TYPES[extname(file)] || "application/octet-stream";
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (range && status === 200) {
    const start = range[1] ? Number(range[1]) : size - Number(range[2]);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(status, { "Content-Type": type, "Content-Length": size, "Accept-Ranges": "bytes" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`matteflux.com preview: http://localhost:${PORT}`));
