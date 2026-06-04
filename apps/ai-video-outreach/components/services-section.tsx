const services = [
  {
    id: 1,
    title: "Raspberry Flavor",
    price: "2,000$",
    target: "Product Launches & Social Media",
    description:
      "Launch your new product with maximum impact. Optimized for social media, these eye-catching videos are designed to stop the scroll and spark engagement. Multi-format delivery for Instagram, TikTok, LinkedIn, and beyond.",
    image: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/services/raspberry.png",
  },
  {
    id: 2,
    title: "Vanilla Flavor",
    price: "3,000$",
    target: "Landing Pages & Service Presentations",
    description:
      "Present your entire service or brand in one captivating video. Perfect for landing pages, website headers, and company overviews. Turn complex offerings into smooth, digestible content that converts visitors into customers.",
    image: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/services/vanilla.png",
  },
  {
    id: 3,
    title: "Caramel Flavor",
    price: "4,000$",
    target: "Internal Comms & Snackable Content",
    description:
      "Perfect bite-sized content for specific company needs. Whether it's HR onboarding, fundraising decks, investor updates, or team announcements—premium snack content that's easy to share and impossible to ignore.",
    image: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/services/caramel.png",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <span className="text-sm text-accent uppercase tracking-widest mb-4 block">
            Our Services
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 text-balance">
            Every flavor of motion,
            <br />
            crafted to perfection
          </h2>
          <p className="text-muted-foreground">
            From concept to final delivery, we treat every project with the precision 
            of a master chocolatier—because exceptional results demand exceptional care.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col"
            >
              <div className="relative w-full h-[400px] mb-6">
                <img
                  src={service.image || "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/placeholder.svg"}
                  alt={service.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-foreground mb-1">
                  {service.title}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  {service.target}
                </p>
                <p className="text-accent font-medium mb-4">{service.price}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
