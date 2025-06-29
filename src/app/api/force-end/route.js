// POST /api/force-end
// body: { id_artwork: number }
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export async function POST(req) {
  const { id_artwork } = await req.json();

  // อัปเดตฐานข้อมูลให้งานนี้หมดเวลา
  await prisma.artwork.update({
    where: { id: id_artwork },
    data: {
      end_at: new Date(), // ให้หมดเวลาทันที
    },
  });

  return new Response(JSON.stringify({ status: "ended" }), {
    status: 200,
  });
}
