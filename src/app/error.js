'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      console.error('NextAuth Error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          เกิดข้อผิดพลาดในการเข้าสู่ระบบ
        </h1>
        <p className="text-gray-600 mb-6">
          {error === 'Configuration' && 'การตั้งค่าระบบไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ'}
          {error === 'AccessDenied' && 'การเข้าถึงถูกปฏิเสธ กรุณาลองใหม่อีกครั้ง'}
          {error === 'Verification' && 'การยืนยันตัวตนล้มเหลว กรุณาลองใหม่อีกครั้ง'}
          {!error && 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง'}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          กลับไปหน้าแรก
        </button>
      </div>
    </div>
  );
} 