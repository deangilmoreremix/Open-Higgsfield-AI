import './globals.css';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
export const metadata = { title: 'AI Studio Hub', description: 'All AI studios in one place' };
export default function RootLayout({ children }) {
  return (<html lang="en" className={inter.variable}><body className="bg-[#050505] text-white font-sans antialiased">{children}</body></html>);
}