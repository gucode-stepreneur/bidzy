"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Countdown from '@/Countdown/page';
import Navbar from '@/Navbar/page';

const Dashboard = () => {
  const [skip, setSkip] = useState(0);    // เก็บจำนวนที่ข้ามไปแล้ว
  const take = 10;                        // โหลดทีละ 10 รายการ
  const [hasMore, setHasMore] = useState(true);  // เช็คว่ามีข้อมูลเพิ่มไหม

  const [userName, setUsername] = useState('no name for now');
  const [artWork, setArtWork] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  // ไม่ต้องใช้ defaultPath แล้ว เพราะ item.path จะเป็น URL ของ Cloudinary

  const [modalOpen , setModalOpen] = useState(false)
  const [link , setLink] = useState('')
  const [copied, setCopied] = useState(false);

  
  useEffect(() => {
    const cookies = document.cookie;
    function getCookie(name) {
      const cookieArray = cookies.split('; ');
      for (const cookie of cookieArray) {
        const [key, value] = cookie.split('=');
        if (key === name) return value;
      }
      return null;
    }

    const username = getCookie("token");
    if (username) {
      setUsername(username);
      setIsLoggedIn(true);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
  if (userName !== "no name for now") {
    loadArtworks(true);
  }
}, [userName]);

  const loadArtworks = (reset = false) => {
  const currentSkip = reset ? 0 : skip;
  fetch('/api/findwork_dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist_name: userName, skip: currentSkip, take }),
  })
  .then(response => response.json())
  .then(data => {
    if (reset) {
      setArtWork(data.artworks || []);
      setSkip(take);
    } else {
      setArtWork(prev => [...prev, ...(data.artworks || [])]);
      setSkip(prev => prev + take);
    }
    if (!data.artworks || data.artworks.length < take) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  })
  .catch(error => console.error("Error fetching artwork:", error));
}


  function link_work (idArtwork) {
    const link = `${window.location.origin}/auc_board/${idArtwork}`;
    window.location = link;
  }

  function check_end(endTimeString) {
    const now = new Date();
    const endTime = new Date(endTimeString);
    return now > endTime; // true = หมดเวลาแล้ว, false = ยังไม่หมด
  }

  const share = (id_art) => {
    const link = `${window.location.origin}/auc_board/${id_art}`;
    setLink(link);
    navigator.clipboard.writeText(link);
    setModalOpen(true);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function timeAgo(dateString) {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now - then;

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "เมื่อสักครู่";
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    return `${diffDays} วันที่แล้ว`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br pt-20 from-slate-50 via-blue-50 to-indigo-100 relative">
      <Navbar />
      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            งานประมูลทั้งหมดของคุณ
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            จัดการและติดตามผลงานศิลปะของคุณในแพลตฟอร์มประมูลออนไลน์
          </p>
        </div>

        {/* Content */}
        {artWork.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-3">ยังไม่มีงานศิลปะ</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              เริ่มต้นการเดินทางด้วยการอัปโหลดผลงานศิลปะแรกของคุณ
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              เพิ่มงานศิลปะ
            </button>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artWork.map((item, index) => {
              const isExpired = check_end(item.end_at);
              const link_icon = isExpired ? '/icon/link_gray.png' : '/icon/link.png';
              const cardColor = isExpired ? '#A0A0A0' : '#4047A1';
              const textColorClass = isExpired ? '!text-gray-500' : '!text-[#4047A1]';
              const borderColorClass = isExpired ? 'border-gray-400' : 'border-[#4047A1]';
              const buttonBgClass = isExpired ? 'bg-gray-400 text-white' : 'bg-[#4047A1] text-white';

              return (
                <div
                  key={index}
                  className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/50 hover:border-blue-200/50 transform hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <div className="aspect-square relative bg-gradient-to-br from-blue-50 to-indigo-50">
                      <Image
                        src={item.path}
                        alt={item.art_name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Status Badge */}
                      {isExpired ? (
                        <div className="absolute top-4 left-4 bg-white border border-black text-[15px] px-3 py-1 rounded-full">
                          <Countdown deadline={item.end_at} />
                        </div>
                      ) : (
                        <div className="absolute top-4 left-4 bg-red-700 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100">
                          <Countdown deadline={item.end_at} stylish="for dashboard" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                      {item.art_name}
                    </h3>

                    {/* description */}
                    <div className='mb-4 flex flex-col gap-2'>
                      <div className='flex flex-row gap-2 items-center '>
                        <span>
                          <div
                            className="flex items-center justify-center w-[30px] h-[30px] rounded-full"
                            style={{ backgroundColor: cardColor }}
                          >
                            <Image
                            alt='user icon'
                              src="/icon/user.png"
                              className='object-contain w-full h-full p-[8px]'
                              width={30}
                              height={30}
                            />
                          </div>
                        </span>
                        <span>{Object.keys(item.bidHistories || {}).length}</span>
                      </div>
                      <div className='flex flex-row gap-2 items-center '>
                        <span>
                          <div
                            className="flex items-center justify-center w-[30px] h-[30px] rounded-full"
                            style={{ backgroundColor: cardColor }}
                          >
                            <Image
                            alt='coin icon'
                              src="/icon/coin.png"
                              className='object-contain w-full h-full p-[8px]'
                              width={30}
                              height={30}
                            />
                          </div>
                        </span>
                        <span>{item.bidHistories[0]?.bid_amount || item.start_price}</span>
                      </div>
                      <div className='flex flex-row gap-2 items-center '>
                        <span className={textColorClass}>เริ่มเมื่อ : {timeAgo(item.start_at)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => link_work(item.id)}
                        className={`flex-1 p-3 !text-white  rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${buttonBgClass}`}
                      >
                        ดูงานประมูล
                      </button>
                      <button
                        onClick={() => share(item.id)}
                        className={` border mb-0 rounded-xl p-3 py-2 flex items-center justify-center gap-2 ${borderColorClass}`}
                      >
                        <span className={textColorClass}>คัดลอกลิงค์</span>
                        <Image
                          src={`${link_icon}`}
                          width={20}
                          height={20}
                          alt="link icon"
                          className="object-contain"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {hasMore && artWork.length > 0 && (
  <div className="flex justify-center mt-8">
    <button
      onClick={() => loadArtworks(false)}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      โหลดเพิ่ม
    </button>
  </div>
)}

        {/* Stats Bar */}
        {artWork.length > 0 && (
          <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {artWork.length}
                </div>
                <div className="text-slate-600">ผลงานทั้งหมด</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {artWork.length}
                </div>
                <div className="text-slate-600">กำลังประมูล</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  0
                </div>
                <div className="text-slate-600">ขายแล้ว</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] text-center relative flex flex-col gap-10">
            <button
              onClick={() => setModalOpen(false)}
              className="top-0 right-0 !text-black text-3xl px-4 py-2 rounded-lg absolute"
            >
              ×
            </button>
            <div className="w-[100px] h-full mx-auto ">
              <Image src="/icon/correct.png" width={1000} height={1000} alt="mascot" className="object-contain" /> 
            </div>
            <div className="font-bold text-md">การประมูลเริ่มแล้ว แชร์ลิงค์ไปหานักประมูลเลย</div>
            <div className="flex flex-row">
              <div className="text-sm text-gray-800 bg-gray-100 px-4 py-3 rounded-l-xl break-words w-full font-mono text-center flex items-center">
                {link}
              </div>
              <button
                onClick={share}
                className={`px-5 py-2 rounded-r-xl w-max  text-sm font-semibold transition-all shadow-md hover:scale-105 ${
                  copied ? "bg-green-500 !text-white" : "bg-blue-600 hover:bg-blue-700 !text-white"
                }`}
              >
                {copied ? "คัดลอกเรียบร้อย" : "คัดลอกลิงก์"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
