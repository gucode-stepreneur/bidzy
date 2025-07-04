"use client";
import FacebookBtn from "@/components/FacebookBtn/page"
import { useSession } from "next-auth/react"

import { useRef, useState } from "react";
import Image from "next/image";
export const Popup = ({ stylish , highest }) => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const nameRef = useRef();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const api = () => {
    // ถ้ามี NextAuth session ให้ใช้ชื่อจาก session
    if (session?.user?.name) {
      closeModal();
      window.location.reload();
      return;
    }

    // ถ้าไม่มี session ให้ใช้ระบบเดิม (ป้อนชื่อเอง)
    const name = nameRef.current?.value;

    if (!name) {
      alert("กรุณาป้อนชื่อก่อนส่ง");
      return;
    }

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((data) => {
         closeModal();
        window.location.reload(); 
      })
      .catch((err) => console.log(err));
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
        <FacebookBtn />
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-black font-bold"
        >
          X
        </button>

        <div className="p-4">
          {session?.user ? (
            <div className="text-center">
              <p className="text-green-600 font-semibold mb-4">
                ยินดีต้อนรับ {session.user.name}!
              </p>
              <p className="text-gray-600 mb-4">
                คุณได้เข้าสู่ระบบแล้ว สามารถดำเนินการต่อได้เลย
              </p>
              <button
                type="button"
                onClick={api}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                ดำเนินการต่อ
              </button>
            </div>
          ) : (
            <>
              <label>*จำชื่อที่ป้อนไว้ให้ดีนะครับ*</label>
              <input
                type="text"
                placeholder="ป้อนชื่อที่จำได้"
                className="block w-full px-3 py-2 border border-gray-300 rounded mb-2"
                name="name"
                ref={nameRef}
                required
              />
              <button
                type="button"
                onClick={api}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                ส่งข้อมูล
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
