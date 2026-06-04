"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
    setMobileOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img
            src="https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/android-chrome-192x192.png"
            alt="Chocomotion"
            className="h-8 w-8"
          />
          <span className="font-serif text-2xl text-foreground tracking-tight">
            choco<span className="text-accent">motion</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a href="mailto:hello@chocomotion.studio?subject=New Project Inquiry">
            <Button size="sm" className="transition-all duration-300 hover:scale-105">Start Your Project</Button>
          </a>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <a href="mailto:hello@chocomotion.studio?subject=New Project Inquiry">
                <Button size="sm" className="transition-all duration-300 hover:scale-105 w-full">Start Your Project</Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
