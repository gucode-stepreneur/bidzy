import { useEffect, useRef, useState } from "react";

export default function Push() {
  const [showPush, setShowPush] = useState(true);
  const pushRef = useRef();

  // ฟัง scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setShowPush(true);
      } else {
        setShowPush(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ฟังก์ชันเมื่อกดปุ่ม
  const push_to_bottom = () => {
    window.location.href = '#board';
    setShowPush(false);
  };

  return (
    <>
      {/* ...content... */}
      {showPush && (
        <div
          id="push"
          ref={pushRef}
          className=" md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full  bg-gradient-to-br from-[#4047A1] to-[#6C63FF] shadow-2xl flex items-center justify-center text-white text-3xl font-bold cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-2xl active:scale-95 z-50 animate-bounce"
          onClick={push_to_bottom}
          title="เลื่อนไปด้านล่าง"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path className="!text-white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </>
  );
}
