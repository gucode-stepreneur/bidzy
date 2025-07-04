import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const artist_name = data?.artist_name;
    const skip = data?.skip || 0;
    const take = data?.take || 10;

    if (!artist_name) {
      return new Response(JSON.stringify({
        error: "Missing artist name",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fetch_artwork = await prisma.artwork.findMany({
      where: { name: artist_name },
      orderBy: { start_at: 'desc' },
      skip: skip,    // เพิ่ม skip
      take: take,    // เพิ่ม take
      include: {
        bidHistories: {
          orderBy: { bid_at: 'desc' }
        }
      }
    });

    return new Response(JSON.stringify({
      artworks: fetch_artwork,
      total: fetch_artwork.length,
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
