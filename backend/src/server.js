import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const server = createApp().listen(port, host, () => {
  console.info(`To-Do API listening on http://${host}:${port}`);
});

server.on("error", (error) => {
  console.error("To-Do API failed to start:", error);
  process.exitCode = 1;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    server.close((error) => {
      if (error) {
        console.error("To-Do API failed to shut down cleanly:", error);
        process.exitCode = 1;
      }
    });
  });
}
