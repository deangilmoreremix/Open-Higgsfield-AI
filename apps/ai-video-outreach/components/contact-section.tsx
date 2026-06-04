"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <section id="contact" className="py-24 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <span className="text-sm text-primary-foreground/70 uppercase tracking-widest mb-4 block">
              Contact
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mb-6">
              Ready to create something
              <br />
              absolutely irresistible?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md">
              Whether you have a project in mind or just want to explore possibilities, 
              we'd love to chat. Let's start the conversation that transforms your vision into motion.
            </p>

            <div className="space-y-4">
              <div>
                <span className="text-sm text-primary-foreground/60 uppercase tracking-widest">Email</span>
                <p className="text-lg">hello@chocomotion.studio</p>
              </div>
              <div>
                <span className="text-sm text-primary-foreground/60 uppercase tracking-widest">Phone</span>
                <p className="text-lg">+33 1 42 68 53 00</p>
              </div>
              <div>
                <span className="text-sm text-primary-foreground/60 uppercase tracking-widest">Address</span>
                <p className="text-lg">Paris, France</p>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="text-sm text-primary-foreground/80 mb-2 block">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm text-primary-foreground/80 mb-2 block">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="text-sm text-primary-foreground/80 mb-2 block">
                  Company (optional)
                </label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>

              <div>
                <label htmlFor="message" className="text-sm text-primary-foreground/80 mb-2 block">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your project..."
                  rows={5}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2"
              >
                Send Message
                <ArrowRight size={18} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
