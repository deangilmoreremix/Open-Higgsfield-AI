import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ClientsSection } from "@/components/clients-section"
import { WorkSection } from "@/components/work-section"
import { ServicesSection } from "@/components/services-section"
import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { LoadingScreen } from "@/components/loading-screen"

export default function Home() {
  return (
    <main className="min-h-screen">
      <LoadingScreen />
      <Navbar />
      <HeroSection />
      <ClientsSection />
      <WorkSection />
      <ServicesSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
