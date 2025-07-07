// Countdown.jsx (หรือ .tsx ก็ได้)
import { useEffect, useState } from 'react';

export default function Countdown({ deadline, onExpire , stylish }) {
  const [timeLeft, setTimeLeft] = useState({});
  const [alreadyExpired, setAlreadyExpired] = useState(false);

  useEffect(() => {
    // แปลง UTC กลับเป็น Local Time (ลบ 7 ชั่วโมง)
    const targetTime = new Date(deadline);
    
    // ถ้า deadline ใน DB เป็น UTC ที่ถูกบวก +7 ไปแล้ว ให้ลบ 7 ชั่วโมงออก
    const localTargetTime = new Date(targetTime.getTime() - (7 * 60 * 60 * 1000));
    
    const targetTimeMs = localTargetTime.getTime();
    const now = Date.now();

    if (targetTimeMs <= now && !alreadyExpired) {
      setTimeLeft({ expired: true });
      setAlreadyExpired(true);
      onExpire?.(true);
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const distance = targetTimeMs - now;

      if (distance <= 0 && !alreadyExpired) {
        clearInterval(timer);
        setTimeLeft({ expired: true });
        setAlreadyExpired(true);
        onExpire?.(true);
        return;
      }

      if (!alreadyExpired) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.expired) return "หมดเวลาแล้ว";

  return (
    <div>
    {stylish == "for dashboard" ? (
      <p className=' text-lg font-bold'> 
        <span className='!text-white block text-sm font-bold'>{timeLeft.days}:{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}</span> 
      </p>
    ):
    (
    <p className='!text-[#ff002f] text-lg font-bold'>
      เหลือเวลา 
      <span className='block  !text-[#ff002f] text-sm font-bold'>{timeLeft.days} <span className='!text-[#ff002f] text-lg'>วัน</span>  {timeLeft.hours} <span className='!text-[#ff002f] text-lg'>ชม</span>  {timeLeft.minutes} <span className='!text-[#ff002f] text-lg'>นาที</span>  {timeLeft.seconds} <span className='!text-[#ff002f] text-lg'>วิ</span></span> 
    </p>
    )
  }
    </div>
  );
}
