const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 มีคนเชื่อมต่อ", socket.id);

    socket.on("join_room", (room) => {
      socket.join(room);
      console.log("➡️ เข้าห้อง:", room, "โดย socket:", socket.id);
    });

    socket.on("leave_room", (room) => {
      socket.leave(room);
      console.log("⬅️ ออกจากห้อง:", room, "โดย socket:", socket.id);
    });

    socket.on("new_bid", (data) => {
      const room = `auction_${data.id_artwork}`; // ใช้ id_artwork เป็นชื่อ room
      console.log("📢 ส่ง bid ไปที่ห้อง:", room, "ข้อมูล:", data);
      
      // ✅ เปลี่ยนจาก socket.to เป็น io.to เพื่อส่งไปยังทุกคนในห้องรวมถึงคนที่ส่ง
      io.to(room).emit("new_bid", data);
      
      console.log("✅ ส่งข้อมูลเรียบร้อยไปยังห้อง:", room);
    });

    socket.on("disconnect", () => {
      console.log("🔴 มีคนตัดการเชื่อมต่อ:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});