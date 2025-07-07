import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// CRON JOB: ตรวจสอบงานประมูลที่จบแล้วแต่ยังไม่แจ้งเตือน
cron.schedule("*/1 * * * *", async () => {
  try {
    const now = new Date();
    // ดึงงานที่จบแล้วและยังไม่แจ้งเตือน
    const endedArtworks = await prisma.artwork.findMany({
      where: {
        end_at: { lt: now },
        notified: false,
      },
      select: { id: true },
    });
    for (const art of endedArtworks) {
      const link = `https://bidzy-mini-mvp-env.up.railway.app/auc_board/${art.id}`;
        await fetch(`https://bidzy-mini-mvp-env.up.railway.app/api/noti-end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_artwork: art.id, link: link }),
      });
      console.log(`[CRON] Triggered noti-end for artwork`, art.id);
    }
  } catch (err) {
    console.error("[CRON] Error in noti-end trigger:", err);
  }
});

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
      
      // ตรวจสอบจำนวนผู้ใช้ในห้องหลังจากเข้า
      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
      console.log(`📊 จำนวนผู้ใช้ในห้อง ${room} หลังเข้า:`, roomSize);
      
      // ตรวจสอบว่าห้องมีอยู่จริงหรือไม่
      const roomExists = io.sockets.adapter.rooms.has(room);
      console.log(`🏠 ห้อง ${room} มีอยู่จริง:`, roomExists);
    });

    socket.on("leave_room", (room) => {
      socket.leave(room);
      console.log("⬅️ ออกจากห้อง:", room, "โดย socket:", socket.id);
    });
    
    socket.on("force_end_auction", (data) => {
      const room = `auction_${data.id_artwork}`;
      console.log(`⛔️ การประมูลถูกหยุดในห้อง ${room}`);
      console.log(`📊 ข้อมูลที่ได้รับ:`, data);
      console.log(`📊 จำนวนผู้ใช้ในห้อง ${room}:`, io.sockets.adapter.rooms.get(room)?.size || 0);
      
      // ตรวจสอบว่าห้องมีอยู่จริงหรือไม่
      const roomExists = io.sockets.adapter.rooms.has(room);
      console.log(`🏠 ห้อง ${room} มีอยู่จริง:`, roomExists);
      
      if (roomExists) {
        const socketsInRoom = io.sockets.adapter.rooms.get(room);
        console.log(`👥 Sockets ในห้อง ${room}:`, Array.from(socketsInRoom || []));
      }
      
      // ส่ง event ไปยังทุกคนในห้อง
      io.to(room).emit("auction_ended", { 
        id_artwork: data.id_artwork,
        ended_at: new Date().toISOString(),
        message: "การประมูลถูกหยุดโดยศิลปิน"
      });
      
      console.log(`✅ ส่ง auction_ended event ไปยังห้อง ${room} เรียบร้อย`);
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