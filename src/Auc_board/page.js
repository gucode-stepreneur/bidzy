"use client"

import { use, useEffect, useState } from "react";
import { socket } from "@/socket";
import { useParams } from "next/navigation";
import Popup from "@/Popup/page";
import Countdown from "@/Countdown/page";
import Image from "next/image";

export  function Auc_board({idArt , whichRole}) {

  const [idArtWork , setIdArtWork] = useState(null)
  const [start_price , setStartPrice] = useState(0);
  const [bidRate , setBidRate] = useState(0)
  const [highest , setHighest ] = useState(null);
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

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [winnerName , setWinnerName] = useState("")

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
    if (!idArtWork || !socket.connected) return;

    const room = `auction_${idArtWork}`;
    console.log("🎯 เตรียมเข้าห้อง:", room);

    const handleNewBid = (data) => {
      console.log("📨 ได้ bid ใหม่:", data);
      if (data.id_artwork === parseInt(idArtWork)) {
        setHistory((prev) => [data, ...prev]);
        setHighest(data.bid_amount);
        console.log("✅ อัพเดทข้อมูล bid ใหม่");
      }
    };

    // Join room
    socket.emit("join_room", room);
    console.log("✅ เข้าห้อง:", room);

    // Listen for new bids
    socket.on("new_bid", handleNewBid);

    return () => {
      socket.emit("leave_room", room);
      socket.off("new_bid", handleNewBid);
      console.log("⬅️ ออกจากห้อง:", room);
    };
  }, [idArtWork, socket.connected]);

  useEffect(() => {
    console.log("🔄 idArtWork เปลี่ยน:", idArtWork);
    console.log("📊 history อัพเดท:", history);
  }, [idArtWork, history]);


  function winner_modal(status) {

  if(status == "artist"){
    setModalType("artist");
    setShowModal(true);
    const datas = history[0]
    console.log(datas)
    const bidder_name = datas.bidder_name
    setWinnerName(bidder_name)
  }
  else if (status === "winner") {
    setModalType("winner");
    setShowModal(true);
  } else if (status === "loser") {
    setModalType("loser");
    setShowModal(true);
  }
}


  function end_auction() {
    const role = whichRole ;
    if(role == "bidder"){
      console.log("this is Bidder")
      const last_bidder = history[0].bidder_name
      console.log(last_bidder)
      if(last_bidder == userName){
        winner_modal("winner")
      }else if (last_bidder != userName){
        winner_modal("loser")
      }
    }
    else if(role == "artist"){
      winner_modal("artist")
    }
  }
  useEffect(() => {
    if (deadlineExpired == true) {
      end_auction();
    }
  }, [deadlineExpired]);


  function submitBid(e) {
    e.preventDefault();

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
      name: userName,
      id_artwork: parseInt(idArtWork),
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

  return (
    <div className="w-full h-max flex flex-col  mx-auto bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden">
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
        <div className="text-center  text-xl md:text-4xl my-auto">ยังไม่มีบิดแรก ณ ตอนนี้</div>
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
        <div className="text-center text-red-500 font-bold p-10 flex flex-col gap-4">
          <div>
            {modalType == "winner" ? "คุณชนะ !" : modalType == "loser" ? "คุณแพ้ในศึกครั้งนี้ !" : modalType == "artist" ? "งานประมูลจบแล้ว !" : "มีบั๊คเกิดขึ้น"}
          </div>
          <button className="w-[100%] bg-[#4047A1] py-4 rounded-2xl !text-white" onClick={end_auction}>
            {modalType == "winner" ? "กดเพื่อดูช่องทางติดต่อศิลปิน" : modalType == "loser" ? "กดเพื่อดูคำปลอบใจ" : modalType == "artist" ? "กดเพื่อดูช่องทางติดต่อผู้ชนะ" : "มีบั๊คเกิดขึ้น"}
          </button>
        </div>
        
        
      ) : (
        whichRole === "bidder" &&
        (isLoggedIn ? (
    <form
      onSubmit={submitBid}
      className="flex flex-col  items-start justify-center w-[100%] self-baseline mt-auto"
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
    </form> ) : (
          <Popup stylish={2} />
        ))
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
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {modalType === "winner" ? "🎉 คุณชนะการประมูล!" : modalType === "loser" ? "😢 คุณแพ้การประมูล" : "งานประมูลของคุณจบลงแล้ว"}
      </h2>
      <p className="text-gray-600 mb-6">
        {modalType === "winner"
          ? `ขอแสดงความยินดี! คุณเป็นผู้ชนะ นี่คือเฟสผู้ขาย -> ${artistName} <-` 
          : modalType == "loser"
          ? "ไม่เป็นไรนะ คุณแพ้ครับ"
          : modalType == "artist"
          ? `ขอแสดงความยินดี! งานประมูลคุณจบในราคา ${highest} นี่คือเฟสผู้ขาย -> ${winnerName} <-` 
          : "บั๊คเกิดขึ้น"
        }
      </p>
      <button
        onClick={() => setShowModal(false)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        ปิด
      </button>
    </div>
  </div>
)}


</div>

  );
}