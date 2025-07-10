"use client";
import { useEffect } from "react";
import { useRef, useState } from "react";
import Image from "next/image";

export const Popup = ({ stylish , highest }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [forcePhoneCheck, setForcePhoneCheck] = useState(false);
  const phoneRef = useRef();
  const [userName, setUsername] = useState(null);
  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match?.[2] || null;
    };
  
    const token = getCookie('token');
    if (token) {
      console.log("ชื่อผู้ใช้จาก cookie:", token);
      setUsername(token);
    }
  }, []);



  const handleLogout = async () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };

  return (
    <div>
     {stylish == 1 ? (
  <div>
    <input
      type="file"
      id="pic"
      name="pic"
      className="hidden"
      accept="image/*"
      required
    />
    <label
      className="w-[100%] border-[#4047A1] border-[3.5px] border-dashed h-[300px] flex items-center justify-center text-gray-600 rounded-xl cursor-pointer"
      onClick={openModal}
    >
      <Image id='upload_icon' src="/icon/cloud-computing 1.png" width={65} height={65} alt="upload_icon" />
      <Image id="upload_btn" src="/icon/Group 5.png" width={95} height={70} alt="upload_icon"/>
    </label>
  </div>
) : stylish == 2 ? (
    <div
      className="flex flex-col  items-start justify-center w-[100%] self-baseline h-full mt-7"
    >
      <div className="text-center text-xl text-green-600 ml-5">
        <span className="text-lg ">บิดสูงสุด :</span> <span className="text-black font-bold">{highest}</span><span> บาท</span>
      </div>
      <div className="flex flex-row w-[100%] p-5 pt-2">
        <input
        type="number"
        name="bid_amount"
        required
        placeholder="จำนวนบิด"
        className="px-4 py-2 w-full border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
        type="button"
        onClick={openModal}
        className="w-full sm:w-[60px] h-[42px] bg-[#4047A1] hover:bg-blue-700 !text-white rounded-r-lg font-semibold shadow transition-all"
        >
        บิด
        </button>
      </div>
    </div>
) : stylish == 3 ? (
  <button
    onClick={openModal}
    className="bg-blue-600 w-full !text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
  >
    เริ่มประมูล
  </button>
) : stylish == 4? (
  <div className="">
      <div
        onClick={openModal}
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
    </div>
) : null}


      <div
        id="modal"
        className={`z-[999999] fixed top-10 left-[50%] transform -translate-x-1/2 w-[50vw] h-[80vh] bg-white shadow-lg ${
          isOpen ? "block" : "hidden"
        }`}
      >
     

        <div className="p-4">
          {userName == null && (
            <form>
              <input type="text" name="username" placeholder="Username" />
              <input type="password" name="password" placeholder="Password" />
              <input type="text" name="phone" placeholder="Phone" />
              <button type="submit">Login</button>
              <button onClick={closeModal}>ยกเลิก</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
