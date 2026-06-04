"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Check, ExternalLink, Mail, TrendingUp, Users, Zap, BarChart3 } from "lucide-react"
import Image from "next/image"
import type { Company, DemoVideo } from "@/lib/types"

interface ProspectLandingProps {
  company: Company
  demoVideo: DemoVideo | null
}

export function ProspectLanding({ company, demoVideo }: ProspectLandingProps) {
  const [showPlayButton, setShowPlayButton] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      setTimeout(() => {
        if (videoRef.current && videoRef.current.paused) {
          setShowPlayButton(true)
        }
      }, 500)
    }
  }, [])

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setShowPlayButton(false)
    }
  }

  const handleVideoError = () => {
    setShowPlayButton(true)
  }

  const handleVideoCanPlay = () => {
    if (videoRef.current && !videoRef.current.paused) {
      setShowPlayButton(false)
    }
  }

  const handleVideoPlaying = () => {
    setShowPlayButton(false)
  }

  const handleVideoPause = () => {
    setShowPlayButton(true)
  }

  const hasVideo = demoVideo && company.videoStatus !== "none"
  const isVideoReady = company.videoStatus === "demo_finished" || company.videoStatus === "final"

  return (
    <main className="min-h-screen">
      {/* Hero Section with Video */}
      <section className="relative min-h-screen flex items-center justify-center pt-8 pb-16 overflow-hidden">
        {/* Decorative background elements using Chocomotion colors */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-20 bg-primary" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 bg-accent" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-10">
          {/* Hero Heading with Logo */}
          <div className="text-center mb-10">
            <h1 className="font-serif gap-5 text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-2 h-12 md:h-16 lg:h-20 flex items-center justify-center">
              <span>Hello </span>
              {company.logoUrl && (
                <Image
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  width={200}
                  height={200}
                  className="inline-block align-middle h-[0.7em] w-auto mx-1"
                  unoptimized
                />
              )}
              <span>!</span>
            </h1>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
              <span>We made a video </span>
              <span className="text-accent">just for you</span>
            </h2>
          </div>

          {/* Video Player */}
          {hasVideo && isVideoReady && demoVideo ? (
            <div className="max-w-4xl mx-auto mb-12 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-auto"
                  onError={handleVideoError}
                  onCanPlay={handleVideoCanPlay}
                  onPlaying={handleVideoPlaying}
                  onPause={handleVideoPause}
                >
                  <source src={demoVideo.videoLink} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {showPlayButton && (
                  <button
                    onClick={handlePlayClick}
                    className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity hover:bg-background/90 group"
                    aria-label="Play video"
                  >
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 group-hover:scale-110">
                      <Play className="w-12 h-12 ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-2xl relative bg-muted aspect-video flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/20">
                  <Play className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground text-lg">
                  {company.videoStatus === "none" && "Your personalized video is being prepared..."}
                  {company.videoStatus === "demo_scheduled" && "Your demo video is scheduled for creation..."}
                  {company.videoStatus === "demo_started" && "Your demo video is being created..."}
                  {company.videoStatus === "final_progress" && "Your final video is in progress..."}
                </p>
              </div>
            </div>
          )}

          {/* Description below video */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground text-pretty text-center mb-12">
            Watch how Chocomotion can help {company.name} captivate your audience
            with motion design that moves markets.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="mailto:hello@chocomotion.studio?subject=I%20want%20to%20work%20with%20Chocomotion"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Let&apos;s Talk
            </a>
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg border-2 border-primary text-primary hover:bg-muted transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              Visit {company.name}
            </a>
          </div>
        </div>
      </section>

      {/* Why Animated Video Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
              Why animated video?
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
              In a world of endless scrolling, animated videos cut through the noise. 
              They transform complex ideas into compelling stories that your audience—
              <span className="text-primary font-medium">{company.targetAudience}</span>—
              actually wants to watch and share.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-background rounded-2xl p-6 text-center shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="font-serif text-4xl text-primary mb-2">85%</div>
              <p className="text-sm text-muted-foreground">higher conversion rate with video on landing pages</p>
            </div>
            <div className="bg-background rounded-2xl p-6 text-center shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div className="font-serif text-4xl text-accent mb-2">95%</div>
              <p className="text-sm text-muted-foreground">of viewers retain messages from video vs. 10% from text</p>
            </div>
            <div className="bg-background rounded-2xl p-6 text-center shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="font-serif text-4xl text-primary mb-2">200+</div>
              <p className="text-sm text-muted-foreground">videos delivered by Chocomotion to brands worldwide</p>
            </div>
            <div className="bg-background rounded-2xl p-6 text-center shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div className="font-serif text-4xl text-accent mb-2">12x</div>
              <p className="text-sm text-muted-foreground">more shares for video content on social media</p>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-background rounded-2xl p-8 md:p-10 shadow-sm border text-center">
            <p className="text-lg md:text-xl text-foreground leading-relaxed text-pretty mb-6">
              {company.valueProp}
            </p>
            <p className="text-muted-foreground">
              We&apos;ve done our homework on {company.name}. Now let us show you what&apos;s possible.
            </p>
          </div>
        </div>
      </section>

      {/* Key Offerings Section */}
      {company.features && company.features.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-serif text-3xl md:text-4xl text-foreground text-center mb-4">
              What we can put forward
            </h3>
            <p className="text-center text-muted-foreground mb-12">
              Your key offerings that we can bring to life through motion:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {company.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 rounded-xl bg-background border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/20">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground font-medium pt-2">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
            Ready to bring your brand to life?
          </h3>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Let&apos;s create motion design that captures the essence of {company.name}
            and connects with your audience.
          </p>
          <a
            href="mailto:hello@chocomotion.studio?subject=I%20want%20to%20work%20with%20Chocomotion"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-primary text-primary-foreground font-medium text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Mail className="w-6 h-6" />
            Get Started
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            Made with care by{" "}
            <a
              href="https://chocomotion.agency"
              className="text-primary hover:text-foreground transition-colors"
            >
              Chocomotion
            </a>
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
