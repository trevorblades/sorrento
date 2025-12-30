import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { List } from "./components/List";

const app = new Hono();

app.get("/", (c) => {
  return c.html(<List />);
});

app.get(
  "/ws",
  upgradeWebSocket(() => {
    return {
      onMessage: (event, ws) => {
        console.log(`Message from client: ${event.data}`);
        ws.send("Hello from server!");
      },
      onClose: () => {
        console.log("Connection closed");
      },
    };
  }),
);

export default {
  fetch: app.fetch,
  websocket,
};
