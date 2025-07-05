"use client";
import FacebookBtn from "@/components/FacebookBtn/page"
import { useSession } from "next-auth/react"

import { useRef, useState } from "react";
import Image from "next/image";
export const Popup = ({ stylish , highest }) => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const nameRef = useRef();
  const phoneRef = useRef();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const checkUser = async () => {
    if (!session?.facebookId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ facebookId: session.facebookId }),
      });
      
      const data = await response.json();
      
      if (data.exists) {
        if (data.needsPhoneNumber) {
          // ถ้ามี user แต่ไม่มีเบอร์โทร ให้แสดงฟอร์มกรอกเบอร์โทร
          setIsNewUser(true);
        } else {
          // ถ้ามี user และมีเบอร์โทรแล้ว ให้ผ่านไปเลย
          closeModal();
          window.location.reload();
        }
      } else {
        // ถ้าเป็น user ใหม่ ให้แสดงฟอร์มกรอกเบอร์โทร
        setIsNewUser(true);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNewUser = async () => {
    const phone = phoneRef.current?.value;
    
    if (!phone) {
      alert("กรุณากรอกเบอร์โทรศัพท์");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: session.userName,
          facebookId: session.facebookId,
          phone: phone
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        closeModal();
        window.location.reload();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const api = () => {
    // ถ้ามี NextAuth session ให้เช็คข้อมูลใน database
    if (session?.user?.name) {
      checkUser();
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
                ยินดีต้อนรับ {session.userName || session.user.name}!
              </p>
              <div className="text-gray-600 mb-4 text-sm">
                <p><strong>Facebook ID:</strong> {session.facebookId || 'ไม่ระบุ'}</p>
              </div>
              
              {isNewUser ? (
                <div className="text-center">
                  <p className="text-blue-600 mb-4">
                    กรุณากรอกเบอร์โทรศัพท์เพื่อดำเนินการต่อ
                  </p>
                  <input
                    type="tel"
                    placeholder="เบอร์โทรศัพท์"
                    className="block w-full px-3 py-2 border border-gray-300 rounded mb-4"
                    ref={phoneRef}
                    required
                  />
                  <button
                    type="button"
                    onClick={saveNewUser}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    กำลังตรวจสอบข้อมูล...
                  </p>
                  <button
                    type="button"
                    onClick={api}
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {isLoading ? "กำลังตรวจสอบ..." : "ดำเนินการต่อ"}
                  </button>
                </>
              )}
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
