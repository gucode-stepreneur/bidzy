import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import twilio from 'twilio';

export async function POST(request) {
  function formatPhone(phone) {
    let str = phone.toString();
  
    if (str.startsWith("+")) {
      return str; // เบอร์มี +66 อยู่แล้ว
    }
    if (str.startsWith("0")) {
      return "+66" + str.slice(1); // ลบ 0 นำหน้า แล้วเติม +66
    }
    // กรณีไม่มี 0 หรือ + นำหน้า เช่น 808285042
    return "+66" + str;
  }
  
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
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

    const allBidders = await prisma.bidHistory.findMany({
      where: { id_artwork : id_artwork },
      select: { bidder_name: true },
      distinct: ['bidder_name'],
    });

    const find_artist = await prisma.artwork.findUnique({
      where: { id: id_artwork },
      select: { name: true,
        art_name: true,
       },
    });

    const artist = await prisma.user.findUnique({
      where: { name: find_artist.name},
      select: { phone: true },
    });

    const bidderNames = allBidders.map(b => b.bidder_name);

    // 3. หาหมายเลขโทรศัพท์ของผู้ใช้ที่ชื่ออยู่ใน bidderNames
    const matchedUsers = await prisma.user.findMany({
      where: {
        name: { in: bidderNames },
        phone: { not: null },
      },
      select: { phone: true },
    });

    const phoneNumbers = matchedUsers.map(u => u.phone);

    const artistMessage = `สวัสดีครับ คุณ${find_artist.name} งานศิลปะ "${find_artist.art_name}" มีคนมาบิดเพิ่ม ลิงค์ ${data.link}`;
    const bidderMessage = `มีคนบิดมากกว่าคุณ บิดเป็นจำนวน ${bid_amount} "${find_artist.art_name}" ลิงค์ ${data.link}`;
    


    // ✅ 2. ดึงข้อมูลอีกทีก็จาก ID ที่เราเพิ่งได้มาเลย
    const fetchCreatedBid = await prisma.bidHistory.findUnique({
      where: { id: newBid.id },
    });

    if (artist?.phone) {
      await client.messages.create({
        body: artistMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formatPhone(artist.phone),
      });
    }
    
    // ส่ง SMS ไปหาผู้ประมูลทั้งหมด (bidder)
    for (const phone of phoneNumbers) {
      await client.messages.create({
        body: bidderMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formatPhone(phone),
      });
    }

    
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
