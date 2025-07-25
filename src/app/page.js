'use client'

import Countdown from "@/Countdown/page";
import { useEffect, useState } from "react";
import Popup from "@/Popup/page";
import { Auc_board } from "@/Auc_board/page";
import Image from "next/image";
import Navbar from "@/Navbar/page";
import { useRef } from "react"; // เพิ่มเข้าไป 

const page = () => {
  const inputRef = useRef(null); // สร้าง ref

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [idArt , setIdArt] = useState(null)
  const [hasSelectedDate, setHasSelectedDate] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userName, setUsername] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isHave, setIsHave] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // เพิ่ม state สำหรับ loading 

  const [reMindImg , setReMindImg] = useState(false)


   const [modalOpen , setModalOpen] = useState(false)
   const [link , setLink] = useState('')
   const [copied, setCopied] = useState(false);

   useEffect(() => {
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match?.[2] || null;
    };
  
    const token = getCookie('token');
    if (token) {
      console.log("ชื่อผู้ใช้จาก cookie:", token);
      const username = decodeURIComponent(token)
      setUsername(username);
      setIsLoggedIn(true);
    }else{
      setIsLoggedIn(false);
      setUsername("");
    }
    setIsLoaded(true);

    window.addEventListener('scroll', ()=>{
      const scrolled = window.scrollY;
      if(scrolled >= 300){
        setReMindImg(true)
      }else if(scrolled < 300){
        setReMindImg(false)
      }
    })
  }, []);

  useEffect(() => {
    document.cookie = "artist=true; path=/; max-age=25920000";
  }, []);

  

   const handleFileChange = (e) => {
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
  
  // ป้องกันการกดซ้ำ
  if (isSubmitting) return;
  
  setIsSubmitting(true);
  const form = e.target;
  const formData = new FormData(form);

  // แปลงเวลาท้องถิ่นเป็น UTC ก่อนส่ง
  const localEndAt = formData.get("end_at");
  if (localEndAt) {
    const utcEndAt = new Date(localEndAt).toISOString();
    formData.set("end_at", utcEndAt);
  }

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
    } else {
      // ถ้าไม่สำเร็จ ให้ reset loading state
      setIsSubmitting(false);
      alert("เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง");
    }
  } catch (error) {
    console.error("Upload failed:", error);
    setIsSubmitting(false);
    alert("เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง");
  }
};

  
  

  return (
    <div className="flex flex-col md:flex-row gap-10 lg:gap-30 px-10 lg:px-30 py-8  bg-gray-50 min-h-screen " id='header'>
      <Navbar />
      <div className="w-[100%] h-max mt-25 ">
  

  <form id = "createForm"
    onSubmit={handleSubmit}
    className="bg-white p-6 rounded-2xl shadow-md  w-[100%] max-w-[550px] border border-gray-200 flex flex-col gap-5 mx-auto"
  >
    <div className="flex flex-row w-max gap-5">
          <p className="text-lg font-bold" style={{color : '#4047A1'}}>มาอัพโหลดผลงานกันเลย</p>
    </div>
    {!isLoggedIn && <Popup stylish={1} />}
    {isLoggedIn && (
      <div>
        <input
          type="file"
          id="pic"
          name="pic"
          disabled={isSubmitting}
          className="absolute opacity-0 w-0 h-0"
          onChange={handleFileChange}
          accept="image/*"
          required
        />
        <label
          htmlFor="pic"
          className={`${
            previewImage == null
              ? `w-[100%] border-[#4047A1] border-[3.5px] border-dashed h-[300px] flex items-center justify-center text-gray-600 rounded-xl transition-all duration-300 ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                    : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'
                }`
              : "bg-transparent"
          } ${isLoaded ? "" : "opacity-50 pointer-events-none"}`}
        >
          {isLoaded && !previewImage ? (
            <div className="flex flex-col items-center justify-center">
              <Image src="/icon/cloud-computing 1.png" width={65} height={65} alt="upload icon" />
              <Image src="/icon/Group 5.png" width={95} height={70} alt="upload icon" />
            </div>
          ) : null}
          {previewImage && (
            <div className="flex flex-col items-center">
              <img
                src={previewImage}
                alt="Preview"
                className="w-[80%] h-auto object-contain rounded-xl shadow-lg"
              />
            </div>
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
      disabled={isSubmitting}
      className={`block w-full px-4 py-2 border border-gray-300 rounded-lg ${
        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
      placeholder="ชื่อผลงานของคุณ"
      required
    />
    <input
      type="number"
      name="start_price"
      disabled={isSubmitting}
      className={`block w-full px-4 py-2 border border-gray-300 rounded-lg ${
        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
      placeholder="ราคาเริ่มต้น"
      required
    />
    <input
      type="number"
      name="bid_rate"
      disabled={isSubmitting}
      className={`block w-full px-4 py-2 border border-gray-300 rounded-lg ${
        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
      placeholder="บิดขั้นต่ำ"
      required
    />
    <div className="relative" >
      <label htmlFor="end_at" className="block w-full h-full absolute top-2 left-4 pointer-events-auto !text-black/50 z-10"   onClick={() => inputRef.current?.showPicker?.()}>
      {hasSelectedDate ? "" : "เลือกวันจบประมูล"}
        </label>
    <input
    id="end_at"
      type="datetime-local"
      ref={inputRef}
      name="end_at"
      disabled={isSubmitting}
      onChange={(e) => setHasSelectedDate(!!e.target.value)} 
      className={`block w-full  px-4 py-2 border border-gray-300 rounded-lg ${
        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
      }${
        hasSelectedDate ? '!text-black' : '!text-white' 
      }`}
      required
    />
    </div>
    <input
      type="number"
      name="fee"
      disabled={isSubmitting}
      className={`block w-full px-4 py-2 border border-gray-300 rounded-lg ${
        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
      placeholder="ค่าจัดส่ง"
      required
    />
    <textarea
      name="description"
      disabled={isSubmitting}
      className={`block w-full px-4 py-2 border border-gray-300 rounded-lg h-[200px] ${
        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
      placeholder="คำอธิบายภาพ"
      required
    ></textarea>
    {/*if user logged in */}
    { !isLoggedIn ? (
      <Popup stylish={3} />
    ) : (
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          isSubmitting 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-[#4047A1] text-white hover:bg-blue-700 cursor-pointer transform hover:scale-105'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>กำลังอัปโหลด...</span>
          </>
        ) : (
          <span className="!text-white">เริ่มประมูล</span>
        )}
      </button>
    )}
  </form>
</div>
  


  {/* show remind image */}
  {reMindImg == true && previewImage != null ? (
    <div className="w-[50px] h-[50px] fixed top-30 left-2 rounded-md md:hidden " onClick={() => {window.location = '#header'}}>
      <Image  width={50} height={50} src={previewImage} className="rounded-md w-full h-full object-contain" alt="remind image"/> 
    </div>
  ):
  (
    <div className="hidden"></div>
  )}
</div>

  );
};

export default page;
