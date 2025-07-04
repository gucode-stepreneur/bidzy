'use client'

import Countdown from "@/Countdown/page";
import { useEffect, useState } from "react";
import Popup from "@/Popup/page";
import { Auc_board } from "@/Auc_board/page";
import Image from "next/image";
import Navbar from "@/Navbar/page";

const page = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [idArt , setIdArt] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false);
  const [userName, setUsername] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isHave, setIsHave] = useState(false);
   const [previewImage, setPreviewImage] = useState(null); 


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


    // ถ้าตอบกลับมีสถานะหรือข้อมูลแสดงว่าสำเร็จ
    if (response.ok) {
      const result = await response.json();
      console.log(result);
      const id_art = result.artwork.id
      setIdArt(id_art)
      const link = `${window.location.origin}/auc_board/${id_art}`
       localStorage.setItem("shareAfterReload", "true");
      window.location = link;
      
    }
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

  
 

  return (
    <div className="flex flex-col md:flex-row gap-10 lg:gap-30 px-10 lg:px-30 py-8  bg-gray-50 min-h-screen">
      <Navbar />
      <div className="w-[100%] h-max mt-25">
  

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
    {/*if user logged in */}
    { !isLoggedIn ? (
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
  




</div>

  );
};

export default page;
