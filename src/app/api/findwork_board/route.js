import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const id = Number(data.idFromSlug);

    console.log("🧪 id ที่ส่งมา:", id, typeof id);

    const fetch_history_by_id = await prisma.bidHistory.findMany({
      where: { id_artwork: id },
      orderBy: { bid_at: 'desc' },
      take: 5,
    });

    const fetch_deadline_by_id = await prisma.artwork.findUnique({
      where: { id: id },
    });

    console.log("✅ ประวัติ:", fetch_history_by_id);
    console.log("✅ ข้อมูล deadline:", fetch_deadline_by_id);

    return new Response(JSON.stringify({
      history: fetch_history_by_id,
      deadline: fetch_deadline_by_id,
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Prisma Error:", err);
    return new Response(JSON.stringify({
      error: err.message,
      stack: err.stack,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
