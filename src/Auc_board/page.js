"use client"

import { use, useEffect, useState } from "react";
import { socket } from "@/socket";
import { useParams } from "next/navigation";
import Popup from "@/Popup/page";
import Countdown from "@/Countdown/page";
import Image from "next/image";

export  function Auc_board({idArt , whichRole , onDeadlineExpired}) {

  const [idArtWork , setIdArtWork] = useState(null)
  const [start_price , setStartPrice] = useState(0);
  const [bidRate , setBidRate] = useState(0)
  const [highest , setHighest ] = useState(0);
   const [deadlineExpired, setDeadlineExpired] = useState(false)
  const [deadline , setEnd] = useState("")  
  const [isTimeOut , setTimeOut] = useState(false)
  const [artistName , setArtistName] = useState("")
  const [history , setHistory] = useState([]);

  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUsername] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const params = useParams();


  const [role , setRole] = useState('bidder')
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [winnerName , setWinnerName] = useState("")

  {/* about sharing */}
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
      setUsername(token);
      setIsLoggedIn(true);
      setIsLoaded(true);
    }else{
      setIsLoggedIn(false);
      setUsername("");
    }
  }, []);


  useEffect(() => {
    
    const idFromSlug = idArt; 
    
    
    setIdArtWork(idFromSlug);

    if(idFromSlug){
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
         const start_price = data.deadline.start_price;
         const bid_rate = data.deadline.bid_rate;
         const seller_name = data.deadline.name;
         // ✅ ตรวจสอบว่ามี bid history หรือไม่
         const highest_from_back_end = data.history.length > 0 
           ? data.history[0].bid_amount 
           : start_price; // ใช้ start_price ถ้าไม่มี bid history
         
         const history = data.history
         console.log("💰 ราคาสูงสุด:", highest_from_back_end)
         console.log("📊 ข้อมูลทั้งหมด:", data)
         console.log("⏰ deadline:", deadline)
         console.log("📈 bid_rate:", bid_rate)
         setArtistName(seller_name)
         setHistory(history)
         setBidRate(bid_rate)
         setHighest(highest_from_back_end)
         setEnd(deadline)
      })
      .catch(error => console.log(error));
    }
  }, [idArt]);

  // Socket connection management
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      console.log("✅ เชื่อมต่อ socket สำเร็จ");

      // Join room after connection if we have idArtWork
      if (idArtWork) {
        const room = `auction_${idArtWork}`;
        socket.emit("join_room", room);
        console.log("✅ เข้าห้องหลังจากเชื่อมต่อ:", room);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
      console.log("❌ ตัดการเชื่อมต่อ socket");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    
    // If already connected, trigger onConnect
    if (socket.connected) {
      onConnect();
    }
    
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [idArtWork]);

  // Room management and bid listening
  useEffect(() => {
    if (!idArtWork || !socket.connected) {
      console.log("❌ ไม่สามารถเข้าห้องได้:", { idArtWork, socketConnected: socket.connected });
      return;
    }

    const room = `auction_${idArtWork}`;
    console.log("🎯 เตรียมเข้าห้อง:", room);
    console.log("👤 User Role:", role);
    console.log("🔗 Socket Connected:", socket.connected);

    const handleNewBid = (data) => {
      console.log("📨 ได้ bid ใหม่:", data);
      if (data.id_artwork === parseInt(idArtWork)) {
        setHistory((prev) => [data, ...prev]);
        setHighest(data.bid_amount);
        console.log("✅ อัพเดทข้อมูล bid ใหม่");
      }
    };

    const handleAuctionEnded = (data) => {
      console.log("🔔 รับ event auction_ended จาก server แล้ว!", data);
      console.log("🎯 ข้อมูลที่ได้รับ:", data);
      setDeadlineExpired(true);
      // ไม่ต้อง override deadline ด้วยเวลาปัจจุบัน
      // setEnd(new Date().toISOString());
      
      // แสดงข้อความตามข้อมูลที่ได้รับจาก server
      const message = data?.message || "การประมูลถูกหยุดโดยศิลปิน ระบบจะรีเฟรชหน้าให้อัตโนมัติ";
      alert(message);
      
      // รีเฟรชหน้าหลังจาก delay เล็กน้อย
      setTimeout(() => {
        console.log("🔄 รีเฟรชหน้า...");
        window.location.reload();
      }, 1000);
    };

    // Join room
    socket.emit("join_room", room);
    console.log("✅ เข้าห้อง:", room);

    // Listen for new bids
    socket.on("new_bid", handleNewBid);
    console.log("👂 เริ่มฟัง new_bid event");
    
    // Listen for auction ended
    socket.on("auction_ended", handleAuctionEnded);
    console.log("👂 เริ่มฟัง auction_ended event");

    return () => {
      socket.emit("leave_room", room);
      socket.off("new_bid", handleNewBid);
      socket.off("auction_ended", handleAuctionEnded);
      console.log("⬅️ ออกจากห้อง:", room);
    };
  }, [idArtWork, socket.connected, role]);

  useEffect(() => {
    console.log("🔄 idArtWork เปลี่ยน:", idArtWork);
    console.log("📊 history อัพเดท:", history);
  }, [idArtWork, history]);

  {/* check role */}
  useEffect(()=>{
    console.log("🔍 เช็ค Role:", {
      isLoggedIn,
      userName,
      idArtWork,
      artistName,
      whichRole
    });
    
    if(isLoggedIn == true && userName != "" && idArtWork != null && artistName != ""){
      if(artistName == userName){
        setRole('artist')
        console.log("🎨 ผู้ใช้เป็นศิลปินของงานนี้:", userName);
      } else {
        setRole('bidder')
        console.log("👤 ผู้ใช้เป็นผู้บิด:", userName);
      }
    } else if (whichRole) {
      // ถ้าไม่มีข้อมูลครบ ให้ใช้ whichRole ที่ส่งมา
      setRole(whichRole)
      console.log("📋 ใช้ whichRole ที่ส่งมา:", whichRole);
    }
  },[artistName, isLoggedIn, userName, idArtWork, whichRole])


 function winner_modal(status) {
  if (status === "artist") {
    setModalType("artist");
    setShowModal(true);

    if (history.length > 0 && history[0]?.bidder_name) {
      const bidder_name = history[0].bidder_name;
      console.log("🎯 ผู้ชนะคือ:", bidder_name);
      setWinnerName(bidder_name);
    } else {
      console.warn("⚠️ ไม่พบข้อมูลผู้ชนะ");
      setWinnerName("ไม่พบผู้ชนะ");
    }

  } else if (status === "winner") {
    setModalType("winner");
    setShowModal(true);
  } else if (status === "loser") {
    setModalType("loser");
    setShowModal(true);
  }
}



  function end_auction() {
  
  if (role == "bidder") {
    console.log("this is Bidder");

    if (history.length > 0 && history[0]?.bidder_name) {
      const last_bidder = history[0].bidder_name;
      console.log(last_bidder);

      if (last_bidder == userName) {
        winner_modal("winner");
      } else {
        winner_modal("loser");
      }
    } else {
      console.warn("ยังไม่มี bid ในระบบ");
    }

  } else if (role == "artist") {
    winner_modal("artist");
  }
}

 useEffect(() => {
  if (deadlineExpired == true) {
    end_auction();
    onDeadlineExpired?.(); // ⬅️ แจ้งแม่ว่าหมดเวลาแล้ว
  }
}, [deadlineExpired]);


  function submitBid(e) {
    e.preventDefault();

    // ✅ เช็ค role ก่อน - ศิลปินไม่สามารถบิดงานตัวเองได้
    if (role === "artist") {
      alert("ศิลปินไม่สามารถบิดงานของตัวเองได้");
      return;
    }

    const bid_amount = parseInt(e.target.bid_amount.value);
    const currentHighest = highest || 0;

    // ✅ เงื่อนไขเช็คก่อนส่ง
    if (bid_amount <= currentHighest) {
      alert("จำนวนบิดต้องมากกว่าราคาปัจจุบัน");
      return;
    }

    if ((bid_amount - currentHighest) < bidRate) {
      alert(`ต้องบิดเพิ่มอย่างน้อย ${bidRate} บาทจากราคาปัจจุบัน`);
      return;
    }

    const data = {
      bid_amount,
      name: userName || "unknown",
      id_artwork: parseInt(idArtWork),
      link:`${window.location.origin}/auc_board/${idArt}`,
    };

    fetch("/api/bid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("✅ ได้ bid ใหม่จาก server:", data);

      // ✅ ส่งข้อมูลไปยัง socket server
      if (socket.connected) {
        socket.emit("new_bid", data);
        console.log("📤 ส่งข้อมูล bid ไปยัง server");
      } else {
        console.warn("❌ ยังไม่เชื่อมต่อ socket, new_bid ไม่ถูกส่ง");
      }

      // Clear input
      e.target.bid_amount.value = "";
    })
    .catch((error) => {
      console.error("❌ เกิดข้อผิดพลาดในการส่ง bid:", error);
    });
  }

async function forceEndAuction() {
  const confirmEnd = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการหยุดการประมูลทันที?");
  if (!confirmEnd) return;

  try {
    console.log("🔄 เริ่มหยุดการประมูลสำหรับ artwork ID:", idArtWork);
    
    const response = await fetch("/api/force-end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_artwork: parseInt(idArtWork) }),
    });

    if (response.ok) {
      console.log("✅ การประมูลถูกหยุดเรียบร้อยแล้ว");
      setDeadlineExpired(true);
      // ไม่ต้อง override deadline ด้วยเวลาปัจจุบัน
      // setEnd(new Date().toISOString());

      // แจ้ง server ว่าหยุดประมูลแล้ว ให้ส่ง event ไปยังผู้ที่อยู่ในห้อง
      if (socket.connected) {
        const eventData = { id_artwork: parseInt(idArtWork) };
        console.log("📤 ส่ง force_end_auction event:", eventData);
        socket.emit("force_end_auction", eventData);
      } else {
        console.error("❌ Socket ไม่เชื่อมต่อ ไม่สามารถส่ง event ได้");
      }
    } else {
      console.error("❌ หยุดการประมูลไม่สำเร็จ");
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
  }
}

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
    <div className="w-full h-max flex flex-col  mx-auto  pb-10 relative bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden">
    <div className="text-center py-5">
       <Countdown
        deadline={deadline}
        onExpire={(isExpired) => {
          if (isExpired) setDeadlineExpired(true);
        }}
      />
    </div>
    <div className="h-[400px]  overflow-y-auto pt-5  p-4 space-y-3 border-t-1 border-b-1 border-dashed border-[#4047A1]">
      {history.length === 0 && (
        <div className="flex items-center justify-center text-xl md:text-4xl h-full">
          {deadlineExpired
            ? "หมดเวลาโดยไม่มีคนบิด"
            : "ยังไม่มีบิดแรก ณ ตอนนี้"}
        </div>
      )}     
      {history.slice(0, 5).map((item, index) => (
  <div
    key={item.id}
    className={`flex flex-row justify-between px-4 py-7 bg-white border rounded-lg shadow-sm ${
      index === 0 ? 'border-[#4047A1] !shadow-[0_1px_10px_0px_#4047A1]' : 'border-black'
    }`}
  >
    <div  className={`text-lg font-bold mr-1 ${
          index === 0 ? '!text-[#4047A1]' : 'text-black'
        }`}
    >{item.bidder_name}
    </div>
    <div>
      <span
        className={`text-2xl font-bold mr-10 ${
          index === 0 ? '!text-[#4047A1]' : '!text-gray-600'
        }`}
      >
        {item.bid_amount}
      </span>
      <span className="text-lg text-gray-600">บาท</span>
    </div>
  </div>
))}

    </div>
     {deadlineExpired ? (
        <div className="text-center  pt-5 flex flex-col gap-4">
          <button className="bg-[#4047A1] m-6 mb-0 rounded-xl p-3 py-4 !text-white flex items-center justify-center gap-2" onClick={end_auction}>
            {modalType == "winner" ? "กดเพื่อดูช่องทางติดต่อศิลปิน" : modalType == "loser" ? "กดเพื่อดูคำปลอบใจ" : modalType == "artist" ? "กดเพื่อดูช่องทางติดต่อผู้ชนะ" : "ไม่มีผู้ชนะ"}
          </button>
        </div>
        
        
      ) : role === "bidder" && isLoggedIn ? (
          <form
            onSubmit={submitBid}
            className="flex flex-col  items-start justify-center w-[100%] self-baseline  h-full mt-7"
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
              <input
              type="submit"
              value="บิด"
              className="w-full sm:w-[60px] h-[42px] bg-[#4047A1] hover:bg-blue-700 !text-white rounded-r-lg font-semibold shadow transition-all"
              />
            </div>
          </form>
        ) : role === "bidder" && !isLoggedIn ? (
          <Popup stylish={2} highest={highest} />
        ) : null
        }
      

     
       

    {role == "artist" && (
    <button
      onClick={share}
      className="border-[#4047A1] border m-6 mb-0 rounded-xl p-3 !text-[#4047A1] flex items-center justify-center gap-2"
    >
      <span className="!text-[#4047A1]">คัดลอกลิงค์</span>
      <Image
        src="/icon/link.png"
        width={20}
        height={20}
        alt="link icon"
        className="object-contain"
      />
    </button>
    )}

    {role == "artist" && deadlineExpired == false &&  (
      <button
        onClick={forceEndAuction}
        className="bg-red-700 border m-6 mb-0 rounded-xl p-3 !text-white flex items-center justify-center gap-2"
      >
        หยุดการประมูล
      </button>
    )}
  
 {/* สำหรับเช็ค socket
  <div className="bg-gray-100 border-t border-gray-300 p-4 text-center text-sm text-gray-600">
    Status:{" "}
    <span className={isConnected ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
      {isConnected ? "connected" : "disconnected"}
    </span>{" "}
    | Transport: <span className="font-medium">{transport}</span>
  </div>
*/}
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

{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] text-center relative">
      <button
        onClick={() => setShowModal(false)}
        className=" top-0 right-0 !text-black text-3xl px-4 py-2 rounded-lg absolute"
      >
        x
      </button>
      <div className="w-[200px] h-full mx-auto ">
        <Image src="/icon/bidzy_end_mascot.png" width={1000} height={1000} alt="mascot" className="object-contain" /> 
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4">
        {modalType === "winner" ? "🎉 คุณชนะการประมูล!" : modalType === "loser" ? "😢 คุณแพ้การประมูล" : "งานประมูลของคุณจบลงแล้ว"}
      </h2>
      <p className="text-gray-600 mb-6">  
        {modalType === "winner" 
          ? `ขอแสดงความยินดี! คุณเป็นผู้ชนะ` 
          : modalType == "loser"
          ? "ไม่เป็นไรนะ คุณแพ้ครับ"
          : modalType == "artist"
          ? `ขอแสดงความยินดี! งานประมูลคุณจบในราคา ${highest} บาท` 
          : "บั๊คเกิดขึ้น"
        }
      </p>
     {(modalType === "winner" || modalType === "artist") && (
        <div className="w-full h-max px-4 py-2 bg-[#4047A1] !text-white rounded-md text-center">
          {modalType === "winner" ? `ชื่อเฟสบุ๊คศิลปิน : ${artistName}` : `ชื่อเฟสบุ๊คผู้ชนะ : ${winnerName}`}
        </div>
      )}

    </div>
  </div>
)}


</div>

  );
}