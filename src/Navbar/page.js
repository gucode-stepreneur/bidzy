"use client"
import React, { useState } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import Popup from '@/Popup/page';
import { Kanit } from 'next/font/google';
const kanit = Kanit({ subsets: ['thai', 'latin'], weight: ['400', '700'] });
const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userName, setUsername] = useState("");

  const [isOpen , setIsOpen] = useState(false)
  const [isArtist , setIsArtist] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
  };

    const [showDropdown, setShowDropdown] = useState(false);
    useEffect(() => {
      
      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match?.[2] || null;
      };

      const isArtist = getCookie('artist')
      if(isArtist == "true"){
        setIsArtist(true)
      }
    
      const token = getCookie('token');
      if (token) {
        console.log("ชื่อผู้ใช้จาก cookie:", token);
        setUsername(token);
        setIsLoggedIn(true);
        setIsLoaded(true);
      }
    }, []);
  
  return (
          <nav className="fixed w-full left-0 top-0 bg-white/80 backdrop-blur-xl z-100 border-b border-blue-100/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-[100px] h-max self-center my-auto">
                    <Image 
                      className="object-contain" 
                      src="/icon/BIDZY logo.png" 
                      width={1000} 
                      height={500} 
                      alt="Bidzy logo" 
                    />
                  </div>
                  <div>
                    <h1 className="text-lg !text-[#4047A1] font-bold hidden lg:block">
                      ช่วยคุณประมูลงานศิลปะง่ายขึ้น
                    </h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* create auction button */}
                <div
                  onClick={() => {
                    if (isArtist == false) {
                      setIsOpen(true);
                    } else if(isArtist == true){
                      window.location.href = '/';
                    }
                  }}
                  className={`flex hover:scale-105 hover:shadow-2xl hover:brightness-110 active:scale-95 animate-bounce flex-row items-center justify-center shadow-lg gap-3 border-2 border-[#4047A1] px-4 py-2 rounded-sm ${kanit.className}`}
                  style={{ cursor: 'pointer' }}
                >
                  <span className='!text-[#4047A1] font-bold hidden md:block'>เริ่มงานประมูลใหม่</span>
                  <span>
                    <div>
                      <Image className='object-contain' src="/icon/play_nav.png" width={20} height={20} alt='play' />
                    </div>
                  </span>
                </div>
                {/* go to seller dashboard button */}
                <div
                  onClick={() => {
                    if (isArtist == false) {
                      setIsOpen(true);
                    } else if(isArtist == true) {
                      window.location.href = '/seller_dashboard';
                    }
                  }}
                  className="flex flex-row items-center justify-center shadow-sm gap-3 border-2 border-[#4047A1] px-4 py-2 rounded-sm"
                  style={{ cursor: 'pointer' }}
                >
                  <span className='!text-[#4047A1] font-bold hidden md:block'>การประมูลทั้งหมด</span>
                  <span>
                    <div>
                      <Image className='object-contain' src="/icon/dashboard_nav.png" width={20} height={20} alt='dash icon' />
                    </div>
                  </span>
                </div>

    {isArtist == false && (
      <div  id="modal"
      className={`z-[999999] fixed flex items-center justify-center top-0 left-[50%] transform -translate-x-1/2 w-[100vw] h-[100vh] bg-black/90 shadow-lg ${
        isOpen ? "block" : "hidden"
      }`}>
        <button
                    onClick={closeModal}
                    className="absolute top-5 right-5 !text-white text-2xl font-bold z-11"
                  >
                    ✕
      </button>
          <div className=" z-150 p-6 max-w-md w-full mx-auto bg-white rounded-lg shadow-md">
            <div>
              <div className="flex flex-col gap-4">
                <Image src="/icon/bidzyMascot.png" alt='bidzy tiktok mascot' width={220} height={220} className='self-center w-[220px] h-auto object-contain' />
                <div className='text-center text-md  tracking-wider'>
                  <span className='block'>อยากประมูลงานเองหรอคะ?</span>
                  <span>ติดต่อ พี่พีชสุดหล่อได้เลยค่ะ</span>
                </div>
                <button  onClick={() => window.open('https://www.tiktok.com/@peachpearapat', '_blank')} className='flex flex-row gap-2 self-center items-center rounded-lg w-max px-4 py-1  justify-center bg-[#4047A1]'>
                  <div className='!text-white'>สมัครเป็นศิลปิน</div>
                  <Image src="/icon/tiktok.png" alt='tiktok icon' width={40}  height={40}/>
                </button>
              </div>
            </div>
          </div>
      </div>
    )}
                    
    {isLoggedIn ? (
  <div className="relative">
    <div
      onClick={() => setShowDropdown(prev => !prev)}
      className="flex flex-row items-center justify-center shadow-sm gap-3 border-2 border-[#4047A1] p-2 rounded-sm cursor-pointer"
    >
      <Image
        className="object-contain"
        src="/icon/user_nav.png"
        width={20}
        height={20}
        alt="User icon"
      />
    </div>

    {showDropdown && (
      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-sm z-50">
        <button
          onClick={() => {
            document.cookie = "token=; max-age=0";
            window.location.href = "/";
          }}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          ออกจากระบบ
        </button>
      </div>
    )}
  </div>
) : (
  <Popup stylish={4} />
)}



                </div>
              </div>
            </div>
          </nav>
  );
};

export default Navbar;
