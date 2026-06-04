import './globals.css';
export const metadata = { title: 'CinemaStudio - Open Generative AI', description: 'AI Studio' };
export default function RootLayout({ children }) {
  return (<html lang="en"><body className="bg-black text-white">{children}</body></html>);
}
