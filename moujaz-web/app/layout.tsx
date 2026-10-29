import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "موجز | منصتك الجامعية الذكية", description: "موجز… لأن وقت الطالب ثمين", manifest:"/manifest.webmanifest", appleWebApp:{capable:true,title:"موجز",statusBarStyle:"black-translucent"}, icons:{icon:[{url:"/icons/icon-192.png",sizes:"192x192",type:"image/png"},{url:"/icons/icon-512.png",sizes:"512x512",type:"image/png"}],apple:"/icons/icon-192.png"} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body>{children}</body></html>}
