import { app, server } from "./lib/socket.js";
import session from 'express-session';
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const clientCache = createClient({ 
  socket: {
    host: app.locals.secrets.REDIS_HOST,
    port: 6379,
  }
});

clientCache.on("error", (err) => console.error("Redis Client Error", err));
await clientCache.connect();

const store = new RedisStore({
  client: clientCache,
  prefix: "sess:",
});

app.use(session({
  secret: app.locals.secrets.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    maxAge: Number(app.locals.secrets.SESSION_EXPIRE),
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  }
}));
app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);

server.listen(5001, () => {
  console.log(`Server is running on PORT: ${5001}`);
});