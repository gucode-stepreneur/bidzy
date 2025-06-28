import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, bid_amount, id_artwork } = data;

    // ✅ 1. สร้าง bid แล้วเก็บ response ที่ได้ (แน่นอนว่าเป็นของเรา)
    const newBid = await prisma.bidHistory.create({
      data: {
        bidder_name: name,
        bid_amount: Number(bid_amount),
        id_artwork,
      },
    });

    // ✅ 2. ดึงข้อมูลอีกทีก็จาก ID ที่เราเพิ่งได้มาเลย
    const fetchCreatedBid = await prisma.bidHistory.findUnique({
      where: { id: newBid.id },
    });

    // ✅ 3. ส่งกลับ client
    return new Response(JSON.stringify(fetchCreatedBid), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
