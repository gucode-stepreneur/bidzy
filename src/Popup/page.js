"use client";
import FacebookBtn from "@/components/FacebookBtn/page"
import { useSession, signOut } from "next-auth/react"
import { useEffect } from "react";
import { useRef, useState } from "react";
import Image from "next/image";

export const Popup = ({ stylish , highest }) => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userHasPhone, setUserHasPhone] = useState(false);
  const [forcePhoneCheck, setForcePhoneCheck] = useState(false);
  const phoneRef = useRef();

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    if (forcePhoneCheck) {
      return;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (status === "loading") return;
    
    if (session?.user?.name) {
      checkUserImmediately();
    }
  }, [session, status]);

  const checkUserImmediately = async () => {
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
          setIsNewUser(true);
          setForcePhoneCheck(true);
          setIsOpen(true);
        } else {
          setUserHasPhone(true);
          setIsLoaded(true);
          setForcePhoneCheck(false);
        }
      } else {
        setIsNewUser(true);
        setForcePhoneCheck(true);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          setIsNewUser(true);
          setForcePhoneCheck(true);
        } else {
          setUserHasPhone(true);
          setIsLoaded(true);
          setForcePhoneCheck(false);
          closeModal();
        }
      } else {
        setIsNewUser(true);
        setForcePhoneCheck(true);
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
      const requestData = {
        name: session.userName || session.user?.name,
        facebookId: session.facebookId,
        phone: phone
      };
      
      console.log("Sending data to API:", requestData);
      
      const response = await fetch("/api/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUserHasPhone(true);
        setIsLoaded(true);
        setForcePhoneCheck(false);
        closeModal();
        alert("บันทึกเบอร์โทรศัพท์เรียบร้อยแล้ว!");
      } else {
        console.error("API Error:", data);
        alert(`เกิดข้อผิดพลาด: ${data.error || 'ไม่ทราบสาเหตุ'}`);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
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
        {!forcePhoneCheck && (
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-black font-bold"
          >
            X
          </button>
        )}

        <div className="p-4">
          {session?.user ? (
            <div className="text-center">
              <p className="text-green-600 font-semibold mb-4">
                ยินดีต้อนรับ {session.userName || session.user?.name || 'ผู้ใช้'}!
              </p>
              <div className="text-gray-600 mb-4 text-sm">
                <p><strong>Facebook ID:</strong> {session.facebookId || 'ไม่ระบุ'}</p>
              </div>
              
              {isNewUser ? (
                <div className="text-center">
                  {forcePhoneCheck && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                      <strong>สำคัญ!</strong> กรุณากรอกเบอร์โทรศัพท์เพื่อใช้งานระบบ
                    </div>
                  )}
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
              ) : userHasPhone ? (
                <div className="text-center">
                  <p className="text-green-600 mb-4">
                    ข้อมูลครบถ้วนแล้ว
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    กำลังตรวจสอบข้อมูล...
                  </p>
                  <button
                    type="button"
                    onClick={checkUser}
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {isLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบข้อมูล"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                กรุณาเข้าสู่ระบบด้วย Facebook
              </p>
              <FacebookBtn />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
