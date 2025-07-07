import { v4 as uuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
import cloudinary from '@/lib/cloudinary';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
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

    // อัปโหลดไฟล์ไปยัง Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'bidzy-artworks',
          public_id: `artwork-${uuid()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // แปลง Local Time เป็น UTC ก่อนบันทึก
    // datetime-local input ส่งมาเป็น Local Time (เช่น "2025-07-08T09:47")
    // ต้องแปลงเป็น UTC ก่อนบันทึกลงฐานข้อมูล
    const localDateTime = new Date(end_at); // สร้าง Date object จาก Local Time
    const utcDateTime = new Date(localDateTime.getTime() - (localDateTime.getTimezoneOffset() * 60000));

    // บันทึกข้อมูลลงฐานข้อมูล
    const artwork = await prisma.artwork.create({
      data: {
        name: name,
        art_name: art_name,
        start_price: parseInt(start_price),
        bid_rate: parseInt(bid_rate),
        fee: parseInt(fee),
        description: description,
        path: cloudinaryResult.secure_url, // ใช้ URL จาก Cloudinary แทนชื่อไฟล์
        end_at: utcDateTime
      }
    });

    return new Response(JSON.stringify({ success: true, artwork }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Create error:", error);
    return new Response(JSON.stringify({ error: "Failed to create artwork" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
