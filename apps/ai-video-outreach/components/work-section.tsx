"use client"

import { useState, useEffect, useRef } from "react"
import { Play } from "lucide-react"

const projects = [
  {
    id: 1,
    company: "Slack",
    logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/slack.png",
    flavor: "Vanilla Flavor",
    description: "Vanilla flavor video for presenting the essential package. Perfect for startups and growing brands ready to make their mark. Includes concept development, storyboard, and HD delivery.",
    video: "https://cdn.pixabay.com/video/2020/07/03/43781-436252322_large.mp4",
  },
  {
    id: 2,
    company: "Notion",
    logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/notion.png",
    flavor: "Rasberry Flavor",
    description: "Rasberry flavor video for presenting our most popular choice. Built for marketing campaigns and product launches that demand attention. Includes advanced motion graphics, original music, and multi-format deliverables.",
    video: "https://cdn.pixabay.com/video/2021/05/18/74457-552236120_large.mp4",
  },
  {
    id: 3,
    company: "ClickUp",
    logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/clickup.png",
    flavor: "Vanilla Flavor",
    description: "Vanilla flavor video for presenting the essential package. Perfect for startups and growing brands ready to make their mark. Includes concept development, storyboard, and HD delivery.",
    video: "https://cdn.pixabay.com/video/2020/03/14/33698-398277503_large.mp4",
  },
  {
    id: 4,
    company: "Prosperian",
    logo: "https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/clients/prosperian.png",
    flavor: "Caramel Flavor",
    description: "Caramel flavor video for presenting the complete premium experience. For brands that refuse to compromise. Includes 3D animation, full creative direction, and strategic partnership.",
    video: "https://cdn.pixabay.com/video/2019/03/30/22464-328008656_large.mp4",
  },
]

export function WorkSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [showPlayButtons, setShowPlayButtons] = useState<Record<number, boolean>>({})
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    // Autoplay all videos on mount
    videoRefs.current.forEach((video, index) => {
      if (video) {
        video.play().catch(() => {
          // Autoplay was prevented, show play button
          setShowPlayButtons(prev => ({ ...prev, [index + 1]: true }))
        })
        
        // Check if video is paused after a short delay (indicates autoplay failed)
        setTimeout(() => {
          if (video.paused) {
            setShowPlayButtons(prev => ({ ...prev, [index + 1]: true }))
          }
        }, 500)
      }
    })
  }, [])

  const handlePlayClick = (projectId: number) => {
    const video = videoRefs.current[projectId - 1]
    if (video) {
      video.play()
      setShowPlayButtons(prev => ({ ...prev, [projectId]: false }))
    }
  }

  const handleVideoError = (projectId: number) => {
    setShowPlayButtons(prev => ({ ...prev, [projectId]: true }))
  }

  const handleVideoCanPlay = (projectId: number) => {
    const video = videoRefs.current[projectId - 1]
    if (video && !video.paused) {
      setShowPlayButtons(prev => ({ ...prev, [projectId]: false }))
    }
  }

  const handleVideoPlaying = (projectId: number) => {
    setShowPlayButtons(prev => ({ ...prev, [projectId]: false }))
  }

  const handleVideoPause = (projectId: number) => {
    setShowPlayButtons(prev => ({ ...prev, [projectId]: true }))
  }

  return (
    <section id="work" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <span className="text-sm text-accent uppercase tracking-widest mb-4 block">
              Example work
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground text-balance">
              Crafted with passion,
              <br />
              delivered with impact
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <video
                ref={(el) => { videoRefs.current[project.id - 1] = el }}
                src={project.video}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
                onError={() => handleVideoError(project.id)}
                onCanPlay={() => handleVideoCanPlay(project.id)}
                onPlaying={() => handleVideoPlaying(project.id)}
                onPause={() => handleVideoPause(project.id)}
              />

              {/* Play button overlay */}
              {showPlayButtons[project.id] && (
                <button
                  onClick={() => handlePlayClick(project.id)}
                  className="absolute inset-0 flex items-center justify-center bg-foreground/60 backdrop-blur-sm transition-opacity hover:bg-foreground/70 z-10"
                  aria-label={`Play ${project.company} video`}
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-background shadow-lg transition-transform hover:scale-110">
                    <Play className="w-8 h-8 ml-1" fill="currentColor" />
                  </div>
                </button>
              )}

              {/* Project info overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent">
                {/* Bottom section that slides up on hover */}
                <div
                  className={`transition-all duration-300 ease-out ${
                    hoveredId === project.id
                      ? "translate-y-0"
                      : "translate-y-24"
                  }`}
                >
                  {/* Logo and Flavor label */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={project.logo}
                      alt={project.company}
                      className="h-8 w-auto brightness-0 invert"
                    />
                    <span className="text-xs text-primary-foreground/90 uppercase tracking-widest font-medium">
                      {project.flavor}
                    </span>
                  </div>

                  {/* Description that appears on hover */}
                  <p
                    className={`text-sm text-primary-foreground/90 transition-all duration-300 ${
                      hoveredId === project.id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
