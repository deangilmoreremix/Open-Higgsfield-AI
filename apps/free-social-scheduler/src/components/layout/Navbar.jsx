"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { SiVercel } from "react-icons/si";
import { FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import clsx from "clsx";

const navLinks = [
  { name: "Workspace", href: "/" },
  { name: "Integrations", href: "/integrations" },
  { name: "Gallery", href: "/gallery" },
  { name: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  const deployUrl = "https://vercel.com/new/clone?repository-url=https://github.com/SamurAIGPT/free-ai-social-media-scheduler";

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse-ring" />
          AI SCHEDULER
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "text-sm font-medium transition-colors hover:text-white",
                  isActive ? "text-white" : "text-zinc-400"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Desktop profile & credentials */}
        <div className="hidden md:flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
                Credits: {session.user.credits ?? 0}
              </span>
              <div className="h-8 w-8 rounded-full overflow-hidden border border-zinc-700">
                <img src={session.user.image || "/default-avatar.png"} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <button
                onClick={() => signOut()}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="px-4 py-1.5 text-xs font-semibold text-zinc-950 bg-white rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Sign in
            </button>
          )}

          <a
            href={deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-all font-bold text-[9px] tracking-wider uppercase shadow-lg"
          >
            <SiVercel className="text-[10px]" />
            Deploy
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
        >
          {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* Mobile Absolute Dropdown Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-[200] bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-800 flex flex-col p-6 gap-4 animate-fade-in md:hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "text-sm font-medium py-2 transition-colors hover:text-white border-b border-zinc-900",
                  isActive ? "text-white" : "text-zinc-400"
                )}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="flex flex-col gap-4 mt-2 pt-2">
            {session?.user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-zinc-700">
                    <img src={session.user.image || "/default-avatar.png"} alt="Profile" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{session.user.name}</span>
                    <span className="text-[10px] text-zinc-500">{session.user.email}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-violet-500/10 border border-violet-500/20 px-3 py-2 rounded-lg">
                  <span className="text-xs text-zinc-400">Available Balance</span>
                  <span className="text-xs font-bold text-violet-400">{session.user.credits ?? 0} Credits</span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  signIn("google");
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs font-semibold text-zinc-950 bg-white rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Sign in with Google
              </button>
            )}

            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-all font-bold text-[10px] tracking-wider uppercase"
            >
              <SiVercel className="text-xs" />
              Deploy to Vercel
            </a>
          </div>
        </div>
      )}
      </div>
    </nav>
  );
}
