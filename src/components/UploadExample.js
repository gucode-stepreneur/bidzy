'use client';

import { useState } from 'react';
import CloudinaryUpload from './CloudinaryUpload';

export default function UploadExample() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');

  const handleUploadSuccess = (result) => {
    setUploadedFiles(prev => [...prev, result]);
    setError('');
    console.log('อัปโหลดสำเร็จ:', result);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    console.error('อัปโหลดล้มเหลว:', errorMessage);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ตัวอย่างการอัปโหลดไฟล์ด้วย Cloudinary</h1>
      
      <div className="mb-8">
        <CloudinaryUpload 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>ข้อผิดพลาด:</strong> {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">ไฟล์ที่อัปโหลดแล้ว</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <img 
                  src={file.url} 
                  alt={`Uploaded file ${index + 1}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="text-sm text-gray-600">
                  <p><strong>URL:</strong> {file.url}</p>
                  <p><strong>Format:</strong> {file.format}</p>
                  <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                  <p><strong>Public ID:</strong> {file.public_id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 