"use client";
import { useEffect } from "react";
import { useRef, useState } from "react";
import Image from "next/image";

export const Popup = ({ stylish , highest }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoggedInAlert, setShowLoggedInAlert] = useState(false);

  const [isLoggedIn , setIsLoggedIn] = useState(false)

  const [userName, setUsername] = useState(null);
  // เพิ่ม state สำหรับ input
  const [inputUsername, setInputUsername] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // เพิ่ม state สำหรับ error

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

  const handleSubmit = async () => {

     // เช็ค required
  if (!inputUsername.trim()) {
    setErrorMsg("กรุณากรอกชื่อ facebook");
    return;
  }
  if (!inputPhone.trim()) {
    setErrorMsg("กรุณากรอกเบอร์โทร");
    return;
  }
  // เช็คเบอร์โทร: ต้อง 10 หลักและขึ้นต้นด้วย 0
  if (!/^0[0-9]{9}$/.test(inputPhone.trim())) {
    setErrorMsg("กรุณากรอกเบอร์โทร 10 หลักและขึ้นต้นด้วย 0");
    return;
  }

  setErrorMsg(""); // ล้าง error ถ้าผ่าน
    const username = inputUsername;
    const phone = inputPhone;

    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, phone }),
    });

    const data = await response.json();
    if (data.success) {
      // Set cookie ฝั่ง client ด้วย JS เพื่อความแน่นอน
      document.cookie = `token=${encodeURIComponent(data.user.name)}; path=/; max-age=${60*60*24}`;
      setUsername(data.user.name); // เพิ่มบรรทัดนี้
      closeModal();
      setIsLoggedIn(true); // <<< เพิ่มบรรทัดนี้
      setShowLoggedInAlert(true); // เปิด modal แจ้งเตือน
    } else {
      setErrorMsg('login ไม่สำเร็จ อาจกรอกเบอร์หรือชื่อเฟสผิดพลาด'); // set error message
      console.error('Login failed:', data.message);
    }
  };


  const handleLogout = async () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };
  function closeAlert(){
    setShowLoggedInAlert(false);
    window.location.reload();
  }

  return (
    <div>
      {isLoggedIn == true && (
      <div  id="logged-in-alert-modal"
      className={`z-[999999] fixed flex items-center justify-center top-0 left-[50%] transform -translate-x-1/2 w-[100vw] h-[100vh] bg-black/90 shadow-lg ${
        showLoggedInAlert ? "block" : "hidden"
      }`}>
        <button
                    onClick={closeAlert}
                    className="absolute top-5 right-5 !text-white text-2xl font-bold z-11"
                  >
                    ✕
      </button>
          <div className=" z-150 p-6 max-w-md w-full mx-auto bg-white rounded-lg shadow-md">
            <div>
              <div className="flex flex-col gap-4">
                <Image src="/icon/bidzycry.png" alt='bidzy tiktok mascot' width={220} height={220} className='self-center w-[220px] h-auto object-contain' />
                <div className='text-center text-md mb-6  tracking-wider px-2 sm:px-10'>
                  <span className='block'>ขณะนี้ระบบอยู่ระหว่างทดสอบ อาจไม่ได้รับ SMS แจ้งเตือนในบางกรณี แนะนำให้ตรวจสอบเว็บไซต์เป็นระยะ เพื่อไม่พลาดข้อมูลสำคัญค่ะ</span>
                </div>
              </div>
            </div>
          </div>  
      </div>
    )}

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
      className="w-[100%] border-[#4047A1] border-[3.5px] border-dashed h-[300px] flex flex-col items-center justify-center text-gray-600 rounded-xl cursor-pointer"
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
    className="bg-[#4047A1] w-full !text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
  >
    เริ่มประมูล
  </button>
) : stylish == 4? (
  <div className="flex flex-col md:block items-center gap-2 md:gap-0 relative">
    <div
        onClick={openModal}
        className="flex flex-row items-center justify-center gap-3 relative border-2 border-[#4047A1] p-2 rounded-sm cursor-pointer"
      >
        <Image
          className="object-contain"
          src="/icon/user_nav.png"
          width={20}
          height={20}
          alt="User icon"
        />
    <div className='absolute bottom-0 right-0 transform translate-x-1/3 rounded-full translate-y-1/3 w-[15px] h-[15px] bg-gray-500 animate-ping'
    style={{ 
      animationDelay: '1s',
      animationDuration: '1s',
       animationTimingFunction: 'cubic-bezier(1, 0, 1, 1)',
       animationIterationCount: 5,   
     }}
    ></div>
      </div>
    <div className='text-[10px] block md:hidden'>ล็อคอิน</div>


    </div>
) : null}


      <div
        id="modal"
        className={`z-[999999] fixed flex items-center justify-center top-0 left-[50%] transform -translate-x-1/2 w-[100vw] h-[100vh] bg-black/90 shadow-lg ${
          isOpen ? "block" : "hidden"
        }`}
      >
     

       <div className=" z-150 p-6 max-w-md w-full mx-auto bg-white rounded-lg shadow-md">
  {userName == null && (
    <div className="z-150">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">ลงชื่อเข้าใช้</h2>
      {errorMsg && (
        <div className="mb-2 text-center text-red-600 font-semibold bg-red-50 border border-red-200 rounded p-2 animate-pulse text-sm">
          {errorMsg}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <label className="text-sm text-gray-600">
          *ชื่อ facebook ต้องเป๊ะเท่านั้นนะครับ
        </label>
        <input
          type="text"
          name="username"
          placeholder="ชื่อ facebook"
          id="username-input"
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          value={inputUsername}
          onChange={e => setInputUsername(e.target.value)}
          required
        />
        <label className="text-sm text-gray-600">
          *เบอร์โทร โปรดใส่ให้ถูกเพื่อรับการแจ้งเตือน
        </label>
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          id="phone-input"
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          value={inputPhone}
          onChange={e => setInputPhone(e.target.value)}
          required
        />
        <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 !text-white px-4 py-2 rounded-md hover:bg-blue-700 transition w-full sm:w-auto"
          >
            Login
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition w-full sm:w-auto"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  )}
</div>


      </div>
      
    </div>
  );
};

export default Popup;
