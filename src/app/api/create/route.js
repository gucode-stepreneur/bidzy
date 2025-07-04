import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // ✅


export async function POST(request) {
  const formData = await request.formData();
    const file = formData.get("pic");
  const name = formData.get("name");
  const art_name = formData.get("art_name");
  const start_price = formData.get("start_price");
  const bid_rate = formData.get("bid_rate");
  const end_at = formData.get("end_at");
  const fee = formData.get("fee");
  const description = formData.get("description");

  if (!file || typeof file === "string") {
    return new Response(JSON.stringify({ error: "No image uploaded" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // สร้างชื่อไฟล์และ path
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${uuid()}-${file.name}`;
  const uploadPath = path.join(process.cwd(), "public/uploads", filename);

  await writeFile(uploadPath, buffer);

  try {
  const artwork = await prisma.artwork.create({
    data: {
      name: name,
      art_name: art_name,
      start_price: parseInt(start_price),
      bid_rate: parseInt(bid_rate),
      fee: parseInt(fee),
      description: description,
      path: filename,
      end_at: new Date(end_at)
    }
  });

  return new Response(JSON.stringify({ success: true, artwork }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });


} catch (error) {
  console.error("Create error:", error); // ดูใน terminal
  return new Response(JSON.stringify({ error: "Failed to create artwork" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

}
