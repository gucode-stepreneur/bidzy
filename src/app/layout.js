import "./globals.css";
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })



export const metadata = {
  title: "Bidzy - ประมูลงานศิลปะ",
  description: "แพลตฟอร์มประมูลงานศิลปะออนไลน์",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
     <body className={inter.className}>
  {children}
    </body>
    </html>
  );
}
