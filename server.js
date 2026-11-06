const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e5 });

const PORT = Number(process.env.PORT || 3000);
const MAX_PLAYERS = 20;
const players = new Map();

app.use(express.static(path.join(__dirname, "public")));

function cleanName(value) {
  return String(value || "Khách").replace(/[<>]/g, "").trim().slice(0, 18) || "Khách";
}
function snapshot() {
  return [...players.values()];
}

io.on("connection", (socket) => {
  socket.on("join", (payload, ack) => {
    if (players.has(socket.id)) return;
    if (players.size >= MAX_PLAYERS) {
      if (typeof ack === "function") ack({ ok: false, message: "Phòng đã đủ 20 người." });
      socket.disconnect(true);
      return;
    }

    const player = {
      id: socket.id,
      name: cleanName(payload && payload.name),
      x: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 8,
      rotation: 0,
      color: ["#e0a458", "#7ca6d8", "#8dbb8a", "#c58cc8", "#d77d72"][Math.floor(Math.random() * 5)]
    };
    players.set(socket.id, player);
    socket.emit("currentPlayers", snapshot());
    socket.broadcast.emit("playerJoined", player);
    if (typeof ack === "function") ack({ ok: true, count: players.size });
    io.emit("playerCount", players.size);
    io.emit("systemMessage", `${player.name} đã vào chùa.`);
  });

  socket.on("move", (data) => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    // Server-side bounds and numeric validation.
    const x = Number(data.x), z = Number(data.z), rotation = Number(data.rotation);
    if (![x, z, rotation].every(Number.isFinite)) return;
    p.x = Math.max(-24, Math.min(24, x));
    p.z = Math.max(-24, Math.min(24, z));
    p.rotation = rotation;
    socket.broadcast.emit("playerMoved", p);
  });

  socket.on("chatMessage", (raw) => {
    const p = players.get(socket.id);
    if (!p) return;
    const message = String(raw || "").trim().slice(0, 180);
    if (!message) return;
    io.emit("chatMessage", { name: p.name, message, at: Date.now() });
  });

  socket.on("disconnect", () => {
    const p = players.get(socket.id);
    if (!p) return;
    players.delete(socket.id);
    io.emit("playerLeft", socket.id);
    io.emit("playerCount", players.size);
    io.emit("systemMessage", `${p.name} đã rời chùa.`);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Temple Multiplayer running: http://localhost:${PORT}`);
  console.log(`LAN clients: http://<IP-may-chu>:${PORT}`);
});