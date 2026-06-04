import "./globals.css";
import { Providers } from "@/components/Providers";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Open AI UGC — AI UGC Video Ads (Arcads & MakeUGC Alternative)",
  description:
    "Open AI UGC is an open-source alternative to Arcads and MakeUGC. Generate scroll-stopping AI UGC video ads with realistic AI actors, scripts, and voiceovers — powered by Veo 3.1, Seedance, Grok Video, and more.",
  keywords: [
    "AI UGC",
    "UGC ads",
    "AI actors",
    "AI video ads",
    "Arcads alternative",
    "MakeUGC alternative",
    "AI video generator",
    "text to video",
    "image to video",
  ],
};

export default function RootLayout({ children }) {
  const theme = 'light';

  return (
    <html lang="en" className="h-dvh w-full transition-colors duration-500" data-theme={theme}>
      <body className={`${inter.className} h-full w-full flex flex-col antialiased transition-colors duration-500`}>
        <Providers>
          <NavbarWrapper />
          <div className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
