import "./globals.css";
import { Kanit } from 'next/font/google';
const kanit = Kanit({ subsets: ['thai', 'latin'], weight: ['400', '700'] });


export const metadata = {
  title: "Bidzy - ประมูลงานศิลปะ",
  description: "แพลตฟอร์มประมูลงานศิลปะออนไลน์",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={kanit.className}>
        {children}
      </body>
    </html>
  );
}
