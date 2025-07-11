"use client"

import { use, useEffect, useState } from "react";
import { socket } from "@/socket";
import { useParams } from "next/navigation";
import Popup from "@/Popup/page";
import Countdown from "@/Countdown/page";
import Image from "next/image";
import { Auc_board } from "@/Auc_board/page";
import Navbar from "@/Navbar/page";

export default function auc_detail(){
    const [artName , setArtName] = useState('กำลังชื่อมต่อ ...')
    const [bidRate , setBidRate] = useState(0)
    const [path , setPath] = useState('')
    const [description , setDescription] = useState('กำลังเชื่อมต่อ ...')
    const [deadline , setEnd] = useState("")
    const [fee , setFee] = useState('กำลังเชื่อมต่อ ...')
    const [idArtWork , setIdArtWork] = useState(null)
    const [sellerName , setSellerName] = useState('กำลังเชื่อมต่อ ...')
    const [start_price , setStartPrice] = useState(0);
    const [highest , setHighest ] = useState(null);
    

    const [isImageFull, setIsImageFull] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const params = useParams();

    // ฟังก์ชันสำหรับจัดการ URL รูปภาพ
    function getImageUrl(path) {
      if (!path) return null;
      
      // ถ้าเป็น URL ของ Cloudinary (เริ่มต้นด้วย https://res.cloudinary.com)
      if (path.startsWith('https://res.cloudinary.com')) {
        return path;
      }
      
      // ถ้าเป็นชื่อไฟล์เก่า (ไม่มี http:// หรือ https://)
      if (!path.startsWith('http://') && !path.startsWith('https://')) {
        return `/uploads/${path}`;
      }
      
      return path;
    }

    useEffect(()=>{
      const idFromSlug = params.id; // ดึงจาก path
      if (!idFromSlug) return;
      setIdArtWork(idFromSlug);
      
      if(idFromSlug){
        setIsLoading(true);
        fetch('/api/findwork_board', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ idFromSlug })
        })
        .then(response => response.json())
        .then(data => {
           const deadline = data.deadline.end_at ?? "";
           const start_price = data.deadline.start_price ?? 0;
           const bid_rate = data.deadline.bid_rate ?? 0;
           const fee = data.deadline.fee ?? 0;
           const artName = data.deadline.art_name ?? '...'
           const description = data.deadline.description  ?? ""
           const sellerName = data.deadline.name ?? "ไม่เจอชื่อศิลปิน"
           const path = data.deadline.path ?? '';
           console.log("📊 ข้อมูลทั้งหมด สำหรับโชว์งานศิลปะ:", data)
           console.log(description , "คำอธิบาย")
           console.log("⏰ deadline:", deadline)
           console.log("📈 bid_rate:", bid_rate)
           setPath(path)
           setBidRate(bid_rate)
           setFee(fee)
           setStartPrice(start_price)
           setArtName(artName)
           setSellerName(sellerName)
           setDescription(description)
           setEnd(deadline)
           setIsLoading(false);
        })
        .catch(error => {
          console.log(error);
          setIsLoading(false);
        });
      }
    }, [params.id]);




    

  return  <div className="flex flex-col md:flex-row gap-10 lg:gap-30 px-10 lg:px-30 py-10 bg-gray-50 min-h-screen pt-25">
            <Navbar />
            <div className="w-[100%] flex flex-col gap-5">
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4047A1] mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
                </div>
              ) : (
                <>
                  <div className="text-xl text-center">
                    <span className=" font-bold">ศิลปิน : </span><span className="text-2xl font-bold !text-[#4047A1]">{sellerName}</span>
                  </div>
              <div className="w-[100%] flex justify-center border-[#4047A1] border-[0.5px] border-dashed relative">
                <div className="w-[50%] h-max overflow-hidden self-center">
                  {getImageUrl(path) ? (
                    <Image
                      src={getImageUrl(path)}
                      width={2000}
                      height={2000}
                      className="object-contain w-full h-full"
                      alt="ภาพศิลปะ"
                    />
                  ) : (
                    <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">🖼️</div>
                        <p className="text-gray-500">ไม่มีรูปภาพ</p>
                      </div>
                    </div>
                  )}
                </div>
                {getImageUrl(path) && (
                  <button
                    onClick={() => setIsImageFull(true)}
                    className="right-0 bottom-0 absolute"
                  >
                    <Image src="/icon/scalePic.png" alt="ปุ่มเพิ่มขนาดภาพ" width={30} height={30} />
                  </button>
                )}
              </div>
              <div className="text-lg font-medium text-gray-700  text-center">
                <span className="text-gray-500 font-bold">ชื่อภาพ :</span> <span className="text-2xl font-bold !text-[#4047A1]">{artName}</span> 
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2 justify-center items-center p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
                  <div className="text-gray-500 text-sm">ราคาเริ่มต้น</div>
                  <div className="text-lg font-bold">{start_price}</div>
                </div>
                <div className="flex flex-col gap-2 justify-center items-center p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
                  <div className="text-gray-500 text-sm">บิดครั้งละ</div>
                  <div className="text-lg font-bold">{bidRate}</div>
                </div>
                <div className="flex flex-col gap-2 justify-center items-center p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
                  <div className="text-gray-500 text-sm">ค่าจัดส่ง</div>
                  <div className="text-lg font-bold">{fee}</div>
                </div>
                <div className="flex flex-col gap-2 justify-center items-center p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
                  <div className="text-gray-500 text-sm">วันที่ปิดประมูล</div>
                      <div className="text-md font-bold text-center">
                        {deadline ? new Date(deadline).toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        }) : ""} น.
                      </div>
                </div>
              </div>

              <div className="border border-gray-300 px-10 py-10 rounded-xl bg-white shadow-sm h-max overflow-y-auto">
                <div className="text-gray-500 font-medium mb-2">คำอธิบายภาพ :</div>
                <div className="text-gray-700">{description}</div>
              </div>
                </>
              )}
            </div>

            <Auc_board idArt={idArtWork} whichRole="bidder"/>
            {isImageFull && getImageUrl(path) && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-10000000 flex items-center justify-center ">
                  <button
                    onClick={() => setIsImageFull(false)}
                    className="absolute top-5 right-5 !text-white text-2xl font-bold"
                  >
                    ✕
                  </button>
                  <Image
                    src={getImageUrl(path)}
                    width={2000}
                    height={2000}
                    alt="ภาพเต็มจอ"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
          </div>


}


