"use client"

import { useState, useRef, useEffect } from "react"
import { Play } from "lucide-react"

export function HeroSection() {
  const [showPlayButton, setShowPlayButton] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check if video autoplay failed after a short delay
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
      setIsPlaying(true)
      setShowPlayButton(false)
    }
  }

  const handleVideoError = () => {
    setShowPlayButton(true)
  }

  const handleVideoLoadStart = () => {
    setShowPlayButton(false)
  }

  const handleVideoCanPlay = () => {
    if (videoRef.current && !videoRef.current.paused) {
      setShowPlayButton(false)
      setIsPlaying(true)
    }
  }

  const handleVideoPlaying = () => {
    setShowPlayButton(false)
    setIsPlaying(true)
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
    setShowPlayButton(true)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 text-center">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground leading-tight mb-8 text-balance">
          Motion design that
          <br />
          <span className="text-accent">moves markets</span>
        </h1>

        <div className="max-w-4xl mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl relative">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto"
            onError={handleVideoError}
            onLoadStart={handleVideoLoadStart}
            onCanPlay={handleVideoCanPlay}
            onPlaying={handleVideoPlaying}
            onPause={handleVideoPause}
          >
            <source src="https://cdn.pixabay.com/video/2016/08/18/4572-179384394_large.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {showPlayButton && (
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity hover:bg-background/90 group"
              aria-label="Play video"
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent text-background shadow-lg transition-transform hover:scale-110 group-hover:scale-110">
                <Play className="w-10 h-10 ml-1" fill="currentColor" />
              </div>
            </button>
          )}
        </div>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 text-pretty">
          We craft irresistibly smooth animations that captivate audiences, 
          elevate brands, and deliver results that taste like success.
        </p>
      </div>
    </section>
  )
}
