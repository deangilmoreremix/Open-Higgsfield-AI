const clients = [
  { name: "@mail", logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/@mail.png" },
  { name: "ClickUp", logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/clickup.png" },
  { name: "Altana", logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/altana.png" },
  { name: "HubSpot", logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/hubspot.png" },
  { name: "Prosperian", logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/prosperian.png" },
  { name: "Notion", logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/notion.png" },
  { name: "Slack", logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/slack.png" },
]

export function ClientsSection() {
  // Duplicate clients array multiple times for seamless loop
  const duplicatedClients = [...clients, ...clients, ...clients]

  return (
    <section className="py-16 border-y border-border bg-secondary/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by the world's most iconic brands to create motion that moves markets
        </p>
        
        <div className="relative w-full overflow-hidden">
          <div className="flex items-center gap-8 md:gap-16 animate-scroll">
            {duplicatedClients.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className="flex-shrink-0 flex items-center justify-center h-12 md:h-16 opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                <img
                  src={client.logo}
                  alt={client.name}
                  className="h-full w-auto max-w-[120px] md:max-w-[150px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
