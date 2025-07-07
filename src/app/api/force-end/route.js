// POST /api/force-end
// body: { id_artwork: number }
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { id_artwork } = await req.json();

    // เช็คว่างานศิลปะมีอยู่จริงและดึงข้อมูล
    const artwork = await prisma.artwork.findUnique({
      where: { id: id_artwork },
      select: { 
        name: true,
        art_name: true,
        notified: true,
      },
    });

    if (!artwork) {
      return new Response(JSON.stringify({ error: "Artwork not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // อัปเดตฐานข้อมูลให้งานนี้หมดเวลา
    await prisma.artwork.update({
      where: { id: id_artwork },
      data: {
        end_at: new Date().toISOString(), // ใช้ UTC string
      },
    });

    // เช็คว่าเคยแจ้งเตือนแล้วหรือยัง
    if (!artwork.notified) {
      // ดึงข้อมูลผู้ประมูลทั้งหมด
      const allBidders = await prisma.bidHistory.findMany({
        where: { id_artwork: id_artwork },
        select: { bidder_name: true },
        distinct: ['bidder_name'],
      });

      // หาเบอร์โทรศิลปิน
      const artist = await prisma.user.findUnique({
        where: { name: artwork.name },
        select: { phone: true },
      });

      // หาเบอร์โทรผู้ประมูลทั้งหมด
      const bidderNames = allBidders.map(b => b.bidder_name);
      const matchedUsers = await prisma.user.findMany({
        where: {
          name: { in: bidderNames },
          phone: { not: null },
        },
        select: { phone: true },
      });

      const phoneNumbers = matchedUsers.map(u => u.phone);

      // เตรียมข้อความ SMS
      const link = `https://bidzy-mini-mvp-env.up.railway.app/auc_board/${id_artwork}`;
      const artistMessage = `สวัสดีครับ คุณ${artwork.name} การประมูลงานศิลปะ "${artwork.art_name}" ได้สิ้นสุดแล้ว ลิงค์ ${link}`;
      const bidderMessage = `การประมูลงานศิลปะ "${artwork.art_name}" ได้สิ้นสุดแล้ว ลิงค์ ${link}`;

      // SMS API configuration
      const auth = Buffer.from(
        `${process.env.THAIBULKSMS_API_KEY}:${process.env.THAIBULKSMS_API_SECRET}`
      ).toString('base64');

      const headers = {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      };

      function formatPhone(phone) {
        const str = phone.toString();
        if (str.startsWith('+66')) return str;
        if (str.startsWith('66')) return '+' + str;
        if (str.startsWith('0')) return '+66' + str.slice(1);
        return '+66' + str;
      }

      const smsResults = {
        artist: false,
        bidders: false,
        totalSent: 0
      };
      
      // ส่ง SMS ไปยังศิลปิน
      if (artist?.phone) {
        try {
          const params = new URLSearchParams();
          params.set('msisdn', formatPhone(artist.phone));
          params.set('message', artistMessage);
          params.set('sender', 'AVIATE');
          params.set('shorten_url', 'true');
        
          const response = await fetch('https://api-v2.thaibulksms.com/sms', {
            method: 'POST',
            headers,
            body: params
          });

          if (response.ok) {
            smsResults.artist = true;
            smsResults.totalSent++;
          }
        } catch (smsError) {
          console.error('Failed to send SMS to artist:', smsError);
        }
      }
      
      // ส่ง SMS ไปยังผู้ประมูลทั้งหมด
      if (phoneNumbers.length > 0) {
        try {
          const allPhones = phoneNumbers.map(p => formatPhone(p)).join(',');
          const params = new URLSearchParams();
          params.set('msisdn', allPhones);
          params.set('message', bidderMessage);
          params.set('sender', 'AVIATE');
          params.set('shorten_url', 'true');
        
          const response = await fetch('https://api-v2.thaibulksms.com/sms', {
            method: 'POST',
            headers,
            body: params
          });

          if (response.ok) {
            smsResults.bidders = true;
            smsResults.totalSent += phoneNumbers.length;
          }
        } catch (smsError) {
          console.error('Failed to send SMS to bidders:', smsError);
        }
      }

      // อัปเดต notified = true
      await prisma.artwork.update({
        where: { id: id_artwork },
        data: { notified: true },
      });

      return new Response(JSON.stringify({ 
        status: "ended",
        message: "Auction ended and notifications sent",
        artwork: artwork.art_name,
        artist: artwork.name,
        totalBidders: bidderNames.length,
        smsResults
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // เคยแจ้งเตือนแล้ว
      return new Response(JSON.stringify({ 
        status: "ended",
        message: "Auction ended (already notified)",
        artwork: artwork.art_name,
        artist: artwork.name
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error('Force end auction error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}
