'use client'

import Countdown from "@/Countdown/page";
import { useEffect, useState } from "react";
import Popup from "@/Popup/page";
import { Auc_board } from "@/Auc_board/page";
import Image from "next/image";

const page = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [idArt , setIdArt] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false);
  const [userName, setUsername] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isHave, setIsHave] = useState(false);
   const [previewImage, setPreviewImage] = useState(null); 

   const [isExpiredFromBoard, setIsExpiredFromBoard] = useState(false);

   const [modalOpen , setModalOpen] = useState(false)
   const [link , setLink] = useState('')
   const [copied, setCopied] = useState(false);

  useEffect(() => {
    const cookies = document.cookie;
    console.log(cookies);
    if (cookies.includes("token=")) {
      setIsLoggedIn(true);
    }

    function getCookie(name) {
      const cookieArray = cookies.split('; ');
      for (const cookie of cookieArray) {
        const [key, value] = cookie.split('=');
        if (key === name) return value;
      }
      return null;
    }

    const username = getCookie("token");
    setUsername(username);
    console.log(username);

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn && userName) {
      fetch("/api/findwork_seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: userName }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.length > 0) {
            const id_art = data[0].id
            setIdArt(id_art)
            setDeadline(data[0].end_at); // ✅ ใช้ setState ถูกต้อง
            setIsHave(true);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isLoggedIn, userName]);


   const handleFileChange = (e) => {
    const icon = document.getElementById('upload_icon')
    const btn = document.getElementById('upload_btn')
    icon.style.display = 'none'
    btn.style.display = 'none'
    const file = e.target.files[0];
    if (file) {
      // ล้าง URL เก่าถ้ามี เพื่อป้องกัน memory leak
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };


 const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch("/api/create", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log(result);

    // ถ้าตอบกลับมีสถานะหรือข้อมูลแสดงว่าสำเร็จ
    if (response.ok) {
       localStorage.setItem("shareAfterReload", "true");
      window.location.reload();
    }
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

  
  const share = () => {
    const link = `${window.location.origin}/auc_board/${idArt}`
    setLink(link)
    navigator.clipboard.writeText(link);
    setModalOpen(true)
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  }
  useEffect(() => {
  const shouldShare = localStorage.getItem("shareAfterReload");
  if (shouldShare === "true" && idArt) {  // รอ idArt ก่อน
    localStorage.removeItem("shareAfterReload");
    share();
  }
}, [idArt]);

  return (
    <div className="flex flex-col md:flex-row gap-10 lg:gap-30 px-10 lg:px-30 py-8 bg-gray-50 min-h-screen">
      <div className="w-[100%] h-max">
  

  <form id = "createForm"
    onSubmit={handleSubmit}
    className="bg-white p-6 rounded-2xl shadow-md  w-[100%] border border-gray-200 flex flex-col gap-5"
  >
    <div className="flex flex-row w-max gap-5">
          <Image src="/icon/BIDZY logo.png" width={100} height={100} alt="bidzy logo" />
          <p className="text-xl font-bold" style={{color : '#4047A1'}}>ช่วยคุณประมูลงานศิลปะ</p>
    </div>
    {!isLoggedIn && <Popup stylish={1} />}
    {isLoggedIn && (
      <div>
        <input
          type="file"
          id="pic"
          name="pic"
          className="absolute opacity-0 w-0 h-0"
          onChange={handleFileChange}
          accept="image/*"
          required
        />
        <label required
          htmlFor="pic"
          className={`${
            previewImage == null
              ? " w-[100%] border-[#4047A1] border-[3.5px] border-dashed  h-[300px] flex items-center justify-center text-gray-600 rounded-xl cursor-pointer"
              : "bg-transparent"
          } ${isLoaded ? "" : "opacity-50 pointer-events-none"}`}
        >
          {isLoaded ? (<div className="flex flex-col items-center justify-center ">
              <Image id='upload_icon' src="/icon/cloud-computing 1.png" width={65} height={65} alt="upload icon" />
              <Image id="upload_btn" src="/icon/Group 5.png" width={95} height={70} alt="upload icon" />
            </div>): ""}
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-4 w-[300px] h-auto object-contain rounded-xl"
            />
          )}
        </label>
      </div>
    )}

    <input
      type="text"
      name="name"
      value={isLoaded ? (userName ?? "") : ""}
      className="block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
      readOnly
      required
      placeholder="ชื่อศิลปินของคุณ"
    />
    <input
      type="text"
      name="art_name"
      className="block w-full px-4 py-2 border border-gray-300 rounded-lg"
      placeholder="ชื่อผลงานของคุณ"
      required
    />
    <input
      type="number"
      name="start_price"
      className="block w-full px-4 py-2 border border-gray-300 rounded-lg"
      placeholder="ราคาเริ่มต้น"
      required
    />
    <input
      type="number"
      name="bid_rate"
      className="block w-full px-4 py-2 border border-gray-300 rounded-lg"
      placeholder="บิดครั้งละ"
      required
    />
    <input
      type="datetime-local"
      name="end_at"
      className="block w-full px-4 py-2 border border-gray-300 rounded-lg"
      required
    />
    <input
      type="number"
      name="fee"
      className="block w-full px-4 py-2 border border-gray-300 rounded-lg"
      placeholder="ค่าจัดส่ง"
      required
    />
    <textarea
      name="description"
      placeholder="คำอธิบายภาพ"
      className="block w-full px-4 py-2 border border-gray-300 rounded-lg h-[200px]"
      required
    ></textarea>

{isHave ? (
  <>
    {isExpiredFromBoard && (
      <input
    value="เริ่มประมูลครั้งใหม่"
    type="submit"
    className="bg-[#4047A1] !text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
  />
    )}
    <div
      onClick={share}
      className="text-center !text-[#4047A1] border-1 border-[#4047A1] px-6 py-2 rounded-lg transition pointer-events-auto"
    >
      คัดลอกลิงค์
    </div>
  </>
) : !isLoggedIn ? (
  <Popup stylish={3} />
) : (
  <input
    value="เริ่มประมูล"
    type="submit"
    className="bg-[#4047A1] !text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
  />
)}

  </form>
</div>
  <div className="w-[100%]">
    <Auc_board idArt={idArt} whichRole="artist"  onDeadlineExpired={() => setIsExpiredFromBoard(true)} />
  </div>

{modalOpen && (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] text-center relative flex flex-col gap-10">
    <button
      onClick={() => setModalOpen(false)}
      className="top-0 right-0 !text-black text-3xl px-4 py-2 rounded-lg absolute">
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
            copied
              ? "bg-green-500 !text-white"
              : "bg-blue-600 hover:bg-blue-700 !text-white"
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

export default page;
