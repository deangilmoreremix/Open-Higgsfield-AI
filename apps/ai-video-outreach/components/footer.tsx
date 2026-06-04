export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/android-chrome-192x192.png"
                alt="Chocomotion"
                className="h-8 w-8"
                loading="eager"
                crossOrigin="anonymous"
              />
              <span className="font-serif text-2xl text-background tracking-tight">
                choco<span className="text-accent">motion</span>
              </span>
            </div>
            <p className="text-background/60 text-sm">
              Premium motion design studio crafting irresistibly smooth animations 
              that bring brands to life.
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-4">
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-sm text-background/40 hover:text-background transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-background/40 hover:text-background transition-colors">
                Terms of Service
              </a>
            </div>
            <p className="text-sm text-background/40">
              © 2026 Chocomotion Studio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
