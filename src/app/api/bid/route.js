import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, bid_amount, id_artwork, link } = data;

    // Input validation
    if (!name || !bid_amount || !id_artwork) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate bid amount
    const numericBidAmount = Number(bid_amount);
    if (isNaN(numericBidAmount) || numericBidAmount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid bid amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if artwork exists first
    const find_artist = await prisma.artwork.findUnique({
      where: { id: id_artwork },
      select: { 
        name: true,
        art_name: true,
      },
    });

    if (!find_artist) {
      return new Response(JSON.stringify({ error: "Artwork not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ 1. สร้าง bid แล้วเก็บ response ที่ได้
    const newBid = await prisma.bidHistory.create({
      data: {
        bidder_name: name,
        bid_amount: numericBidAmount,
        id_artwork,
      },
    });

    const allBidders = await prisma.bidHistory.findMany({
      where: { id_artwork: id_artwork },
      select: { bidder_name: true },
      distinct: ['bidder_name'],
    });

    const artist = await prisma.user.findUnique({
      where: { name: find_artist.name },
      select: { phone: true },
    });

    const bidderNames = allBidders.map(b => b.bidder_name);

    const matchedUsers = await prisma.user.findMany({
      where: {
        name: { in: bidderNames },
        phone: { not: null },
      },
      select: { phone: true },
    });

    const phoneNumbers = matchedUsers.map(u => u.phone);

    const artistMessage = `สวัสดีครับ คุณ${find_artist.name} งานศิลปะ "${find_artist.art_name}" มีคนมาบิดเพิ่ม ลิงค์ ${link || 'N/A'}`;
    const bidderMessage = `มีคนบิดมากกว่าคุณ บิดเป็นจำนวน ${numericBidAmount} "${find_artist.art_name}" ลิงค์ ${link || 'N/A'}`;

    // ✅ 2. ดึงข้อมูลอีกทีก็จาก ID ที่เราเพิ่งได้มาเลย
    const fetchCreatedBid = await prisma.bidHistory.findUnique({
      where: { id: newBid.id },
    });

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
    
    // ส่งหา artist
    if (artist?.phone) {
      try {
        const params = new URLSearchParams();
        params.set('msisdn', formatPhone(artist.phone));
        params.set('message', artistMessage);
        params.set('sender', 'Bidzy');
        params.set('shorten_url', 'true');
      
        await fetch('https://api-v2.thaibulksms.com/sms', {
          method: 'POST',
          headers,
          body: params
        });
      } catch (smsError) {
        console.error('Failed to send SMS to artist:', smsError);
      }
    }
    
    // ส่งหา bidder ทั้งหมดทีเดียว
    if (phoneNumbers.length > 0) {
      try {
        const allPhones = phoneNumbers.map(p => formatPhone(p)).join(',');
        const params = new URLSearchParams();
        params.set('msisdn', allPhones);
        params.set('message', bidderMessage);
        params.set('sender', 'Bidzy');
        params.set('shorten_url', 'true');
      
        await fetch('https://api-v2.thaibulksms.com/sms', {
          method: 'POST',
          headers,
          body: params
        });
      } catch (smsError) {
        console.error('Failed to send SMS to bidders:', smsError);
      }
    }

    return new Response(JSON.stringify(fetchCreatedBid), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Bid creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}
