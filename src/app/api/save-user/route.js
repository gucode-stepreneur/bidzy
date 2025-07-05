import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, facebookId, phone } = body;

    if (!name || !facebookId || !phone) {
      return new Response(
        JSON.stringify({ error: "Name, Facebook ID, and phone are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // บันทึกข้อมูลผู้ใช้ใหม่
    const user = await prisma.user.create({
      data: {
        name,
        fbId: facebookId,
        phone: parseInt(phone)
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      user 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error saving user:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 