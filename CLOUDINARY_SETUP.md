# การตั้งค่า Cloudinary ในโปรเจค Bidzy

## ขั้นตอนการตั้งค่า

### 1. สร้างบัญชี Cloudinary
1. ไปที่ [cloudinary.com](https://cloudinary.com)
2. สมัครบัญชีใหม่
3. เข้าสู่ระบบและไปที่ Dashboard

### 2. ดูข้อมูล API
ใน Dashboard ของ Cloudinary คุณจะเห็น:
- **Cloud Name**: ชื่อ cloud ของคุณ
- **API Key**: คีย์สำหรับเข้าถึง API
- **API Secret**: รหัสลับสำหรับเข้าถึง API

### 3. สร้างไฟล์ .env.local
สร้างไฟล์ `.env.local` ในโฟลเดอร์หลักของโปรเจค และใส่ข้อมูลดังนี้:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**หมายเหตุ**: แทนที่ `your_cloud_name`, `your_api_key`, และ `your_api_secret` ด้วยข้อมูลจริงจาก Cloudinary Dashboard

### 4. ติดตั้ง Dependencies
```bash
npm install cloudinary
```

### 5. ไฟล์ที่สร้างขึ้น
- `src/lib/cloudinary.js` - ไฟล์ config สำหรับ Cloudinary
- `src/app/api/upload/route.js` - API route สำหรับอัปโหลดไฟล์
- `src/app/api/delete/route.js` - API route สำหรับลบไฟล์
- `src/components/CloudinaryUpload.js` - React component สำหรับอัปโหลด
- `src/components/UploadExample.js` - ตัวอย่างการใช้งาน

## การใช้งาน

### 1. ใช้ Component ในหน้าใดก็ได้
```jsx
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function MyPage() {
  const handleUploadSuccess = (result) => {
    console.log('อัปโหลดสำเร็จ:', result.url);
  };

  const handleUploadError = (error) => {
    console.error('อัปโหลดล้มเหลว:', error);
  };

  return (
    <CloudinaryUpload 
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
    />
  );
}
```

### 2. ข้อมูลที่ได้จากการอัปโหลด
```javascript
{
  success: true,
  url: "https://res.cloudinary.com/your-cloud/image/upload/...",
  public_id: "bidzy-uploads/filename",
  format: "jpg",
  size: 12345
}
```

### 3. ลบไฟล์
```javascript
const deleteFile = async (public_id) => {
  const response = await fetch('/api/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_id }),
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('ลบไฟล์สำเร็จ');
  }
};
```

## ข้อควรระวัง

1. **อย่าลืมเพิ่ม .env.local ใน .gitignore** เพื่อไม่ให้ข้อมูลลับหลุดไป
2. **ตรวจสอบสิทธิ์การเข้าถึง** ใน Cloudinary Dashboard
3. **ตั้งค่า CORS** หากจำเป็น
4. **จำกัดขนาดไฟล์** ตามความต้องการ

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย:
1. **"Invalid API key"** - ตรวจสอบ API key และ secret
2. **"Cloud name not found"** - ตรวจสอบ cloud name
3. **"File too large"** - ตรวจสอบขนาดไฟล์ที่อัปโหลด

### การ Debug:
- ตรวจสอบ console ใน browser
- ตรวจสอบ terminal ที่รัน server
- ตรวจสอบ Cloudinary Dashboard 