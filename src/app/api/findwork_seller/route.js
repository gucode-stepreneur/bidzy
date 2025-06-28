import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
  const data = await request.json();
  const name = data.name;

  const find_work_for_seller = await prisma.artwork.findMany({
    where: { name: name },
    orderBy: {
      start_at: 'desc'  // ✅ เรียงจากใหม่ไปเก่า
    }
  });

  return new Response(JSON.stringify(find_work_for_seller), {
    headers: { "Content-Type": "application/json" },
  });
}
