"use client"
import React, { useState } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import Popup from '@/Popup/page';
const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userName, setUsername] = useState("");

    const [showDropdown, setShowDropdown] = useState(false);
    useEffect(() => {
      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match?.[2] || null;
      };
    
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
                    <a href='/'>
                        <div className="flex flex-row items-center justify-center gap-3 border-2 border-[#4047A1] px-4 py-2 rounded-sm">
                            <span className='!text-[#4047A1] font-bold hidden md:block'>เริ่มงานประมูลใหม่</span>
                            <span>
                                <div>
                                    <Image className='object-contain' src="/icon/play_nav.png" width={20} height={20} />
                                </div>
                            </span>
                        </div>
                    </a>
                    <a href='/seller_dashboard'>
                        <div className="flex flex-row items-center justify-center gap-3 border-2 border-[#4047A1] px-4 py-2 rounded-sm">
                            <span className='!text-[#4047A1] font-bold hidden md:block'>การประมูลทั้งหมด</span>
                            <span>
                            <div>
                                <Image className='object-contain' src="/icon/dashboard_nav.png" width={20} height={20} />
                            </div>
                            </span>
                        </div>
                    </a>
    {isLoggedIn ? (
  <div className="relative">
    <div
      onClick={() => setShowDropdown(prev => !prev)}
      className="flex flex-row items-center justify-center gap-3 border-2 border-[#4047A1] p-2 rounded-sm cursor-pointer"
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
      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
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
