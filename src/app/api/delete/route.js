import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function DELETE(request) {
  try {
    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json(
        { error: 'ไม่พบ public_id' },
        { status: 400 }
      );
    }

    // ลบไฟล์จาก Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'ลบไฟล์สำเร็จ',
      });
    } else {
      throw new Error('ไม่สามารถลบไฟล์ได้');
    }

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบไฟล์' },
      { status: 500 }
    );
  }
} 