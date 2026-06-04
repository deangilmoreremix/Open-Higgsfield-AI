import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ 
  variable: "--font-inter", 
  subsets: ["latin"], 
  display: "swap" 
});

export const metadata = {
  title: "Free AI Social Media Scheduler - MuAPI",
  description: "Schedule and publish AI-generated videos directly to YouTube and TikTok.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full w-full dark">
      <body className={`${inter.variable} ${inter.className} h-full w-full flex flex-col antialiased bg-zinc-950 text-zinc-100`}>
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
