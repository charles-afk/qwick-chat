import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const app = express();
const corsOptions = {
  origin: "https://qwick-chat.com",
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded());

const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;
  console.log(userSocketMap);
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

const client = new SecretsManagerClient({
  region: "us-east-1",
});

async function getSecret() {
  const secret_name = "QWICK-CHAT-SECRETS";
  const command = new GetSecretValueCommand({ SecretId: secret_name });
  const response = await client.send(command);
  if (response.SecretString) return JSON.parse(response.SecretString);
  return Buffer.from(response.SecretBinary, "base64").toString("ascii");
}

let cachedSecret = null;

async function loadSecrets() {
  if (!cachedSecret) cachedSecret = await getSecret();
  return cachedSecret;
}

async function start() {
  const secrets = await loadSecrets();
  app.locals.secrets = secrets;
}

await start();

export { io, app, server };