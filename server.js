const fs = require("fs/promises");
const http = require("http");
const path = require("path");

const root = __dirname;
const galleryDir = path.join(root, "images", "gallery");
const port = Number(process.env.PORT) || 3000;
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

const mimeTypes = {
  ".aac": "audio/aac",
  ".css": "text/css; charset=utf-8",
  ".flac": "audio/flac",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".webm": "audio/webm",
  ".webp": "image/webp",
  ".avif": "image/avif"
};

function send(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  response.end(body);
}

async function listGallery(response) {
  try {
    const entries = await fs.readdir(galleryDir, { withFileTypes: true });
    const images = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => imageExtensions.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name) => ({
        name,
        src: `/images/gallery/${encodeURIComponent(name)}`
      }));

    send(response, 200, JSON.stringify(images), mimeTypes[".json"]);
  } catch (error) {
    send(response, 200, "[]", mimeTypes[".json"]);
  }
}

async function serveFile(requestUrl, response) {
  const pathname = decodeURIComponent(new URL(requestUrl, `http://localhost:${port}`).pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(root)) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    send(response, 200, file, mimeTypes[extension] || "application/octet-stream");
  } catch (error) {
    send(response, 404, "Not found");
  }
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/api/gallery")) {
    listGallery(response);
    return;
  }

  serveFile(request.url, response);
});

server.listen(port, () => {
  console.log(`Monthsary gift running at http://localhost:${port}`);
});
