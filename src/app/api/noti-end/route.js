import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const { id_artwork, link } = data;

    // Input validation
    if (!id_artwork) {
      return new Response(JSON.stringify({ error: "Missing artwork ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if artwork exists and get notified status
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

    // If already notified, do not send again
    if (artwork.notified) {
      return new Response(JSON.stringify({
        success: true,
        message: "Already notified",
        artwork: artwork.art_name,
        artist: artwork.name,
        notified: true
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all unique bidders for this artwork
    const allBidders = await prisma.bidHistory.findMany({
      where: { id_artwork: id_artwork },
      select: { bidder_name: true },
      distinct: ['bidder_name'],
    });

    // Find artist phone number
    const artist = await prisma.user.findUnique({
      where: { name: artwork.name },
      select: { phone: true },
    });

    // Get all bidder phone numbers
    const bidderNames = allBidders.map(b => b.bidder_name);
    const matchedUsers = await prisma.user.findMany({
      where: {
        name: { in: bidderNames },
        phone: { not: null },
      },
      select: { phone: true },
    });

    const phoneNumbers = matchedUsers.map(u => u.phone);

    // Prepare SMS messages
    const artistMessage = `สวัสดีครับ คุณ${artwork.name} การประมูลงานศิลปะ "${artwork.art_name}" ได้สิ้นสุดแล้ว ลิงค์ ${link || 'N/A'}`;
    const bidderMessage = `การประมูลงานศิลปะ "${artwork.art_name}" ได้สิ้นสุดแล้ว ลิงค์ ${link || 'N/A'}`;

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
    
    // Send SMS to artist
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
    
    // Send SMS to all bidders
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

    // Mark as notified
    await prisma.artwork.update({
      where: { id: id_artwork },
      data: { notified: true },
    });

    return new Response(JSON.stringify({
      success: true,
      message: "End-of-auction notifications sent",
      artwork: artwork.art_name,
      artist: artwork.name,
      totalBidders: bidderNames.length,
      smsResults,
      notified: true
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('End-of-auction notification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
} 