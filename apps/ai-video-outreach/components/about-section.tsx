const galleryImages = [
  { src: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/about/working.png", alt: "Our team working" },
  { src: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/about/talkin.png", alt: "Team discussion" },
  { src: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/about/fun.png", alt: "Having fun" },
  { src: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/about/woman.png", alt: "Team member" },
  { src: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/about/workplace.png", alt: "Our workspace" },
  { src: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/about/working2.png", alt: "Creative process" },
  { src: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/about/working3.png", alt: "Team collaboration" },
  { src: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/about/working4.png", alt: "Team at work" },
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <span className="text-sm text-accent uppercase tracking-widest mb-4 block">
            Our Story
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 text-balance">
            Where movement meets
            <br />
            pure obsession
          </h2>
          <p className="text-muted-foreground mb-4">
            Chocomotion was born from a simple belief: motion design should be as satisfying 
            as perfectly crafted chocolate. Rich, smooth, and absolutely unforgettable.
          </p>
          <p className="text-muted-foreground">
            Our team of animators, designers, and storytellers brings decades of combined 
            experience across branding, broadcast, and digital. We obsess over every frame, 
            every transition, every detail—because that's what separates good from legendary.
          </p>
        </div>

        {/* Image Gallery - Responsive multi-row layout */}
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
            <div className="shrink-0 w-[48%] sm:w-[40%] md:w-[400px] h-48 sm:h-56 md:h-64 relative rounded-xl overflow-hidden bg-secondary">
              <img
                src={galleryImages[0].src}
                alt={galleryImages[0].alt}
                className="w-full h-full object-cover scale-130"
              />
            </div>
            <div className="shrink-0 w-[48%] sm:w-[25%] md:w-[250px] h-48 sm:h-56 md:h-64 relative rounded-xl overflow-hidden bg-secondary">
              <img
                src={galleryImages[1].src}
                alt={galleryImages[1].alt}
                className="w-full h-full object-cover scale-130"
              />
            </div>
            <div className="shrink-0 w-[48%] sm:w-[32%] md:w-[320px] h-48 sm:h-56 md:h-64 relative rounded-xl overflow-hidden bg-secondary">
              <img
                src={galleryImages[2].src}
                alt={galleryImages[2].alt}
                className="w-full h-full object-cover scale-130"
              />
            </div>
            <div className="shrink-0 w-[48%] sm:w-[20%] md:w-[200px] h-48 sm:h-56 md:h-64 relative rounded-xl overflow-hidden bg-secondary">
              <img
                src={galleryImages[3].src}
                alt={galleryImages[3].alt}
                className="w-full h-full object-cover scale-130"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
            <div className="shrink-0 w-[48%] sm:w-[28%] md:w-[280px] h-48 sm:h-56 md:h-64 relative rounded-xl overflow-hidden bg-secondary">
              <img
                src={galleryImages[4].src}
                alt={galleryImages[4].alt}
                className="w-full h-full object-cover scale-130"
              />
            </div>
            <div className="shrink-0 w-[48%] sm:w-[38%] md:w-[380px] h-48 sm:h-56 md:h-64 relative rounded-xl overflow-hidden bg-secondary">
              <img
                src={galleryImages[5].src}
                alt={galleryImages[5].alt}
                className="w-full h-full object-cover scale-130"
              />
            </div>
            <div className="shrink-0 w-[48%] sm:w-[22%] md:w-[220px] h-48 sm:h-56 md:h-64 relative rounded-xl overflow-hidden bg-secondary">
              <img
                src={galleryImages[6].src}
                alt={galleryImages[6].alt}
                className="w-full h-full object-cover scale-130"
              />
            </div>
            <div className="shrink-0 w-[48%] sm:w-[35%] md:w-[350px] h-48 sm:h-56 md:h-64 relative rounded-xl overflow-hidden bg-secondary">
              <img
                src={galleryImages[7].src}
                alt={galleryImages[7].alt}
                className="w-full h-full object-cover scale-130"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
