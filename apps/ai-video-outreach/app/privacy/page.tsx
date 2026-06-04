import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <section className="py-24 bg-background">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-8">
              Privacy Policy
            </h1>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-6">
              Last updated: January 24, 2026
              </p>

              <div className="space-y-8 text-muted-foreground">
                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">1. Introduction</h2>
                  <p>
                    Chocomotion Studio ("we," "our," or "us") is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                    information when you visit our website or use our services.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">2. Information We Collect</h2>
                  <p className="mb-4">We may collect information about you in various ways:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Personal Information:</strong> Name, email address, company name, and other information you provide when contacting us or using our services.</li>
                    <li><strong>Usage Data:</strong> Information about how you access and use our website, including IP address, browser type, pages visited, and time spent on pages.</li>
                    <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to track activity on our website and store certain information.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">3. How We Use Your Information</h2>
                  <p className="mb-4">We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Send you updates, newsletters, and marketing communications (with your consent)</li>
                    <li>Monitor and analyze usage patterns and trends</li>
                    <li>Detect, prevent, and address technical issues</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">4. Information Sharing and Disclosure</h2>
                  <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With service providers who assist us in operating our website and conducting our business</li>
                    <li>When required by law or to protect our rights and safety</li>
                    <li>In connection with a business transfer, merger, or acquisition</li>
                    <li>With your explicit consent</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">5. Data Security</h2>
                  <p>
                    We implement appropriate technical and organizational security measures to protect your 
                    personal information. However, no method of transmission over the Internet or electronic 
                    storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">6. Your Rights</h2>
                  <p className="mb-4">You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access and receive a copy of your personal data</li>
                    <li>Rectify inaccurate or incomplete information</li>
                    <li>Request deletion of your personal data</li>
                    <li>Object to or restrict processing of your data</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">7. Cookies</h2>
                  <p>
                    We use cookies to enhance your experience on our website. You can choose to disable 
                    cookies through your browser settings, but this may affect the functionality of our website.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">8. Third-Party Links</h2>
                  <p>
                    Our website may contain links to third-party websites. We are not responsible for the 
                    privacy practices of these external sites. We encourage you to review their privacy policies.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">9. Children's Privacy</h2>
                  <p>
                    Our services are not directed to individuals under the age of 18. We do not knowingly 
                    collect personal information from children. If you believe we have collected information 
                    from a child, please contact us immediately.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">10. Changes to This Privacy Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes 
                    by posting the new Privacy Policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">11. Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <p className="mt-2">
                    <strong>Email:</strong> hello@chocomotion.studio
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

