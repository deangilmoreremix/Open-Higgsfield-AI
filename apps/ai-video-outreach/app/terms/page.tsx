import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <section className="py-24 bg-background">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-8">
              Terms of Service
            </h1>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-6">
                Last updated: January 24, 2026
              </p>

              <div className="space-y-8 text-muted-foreground">
                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">1. Agreement to Terms</h2>
                  <p>
                    By accessing or using the Chocomotion Studio website and services, you agree to be 
                    bound by these Terms of Service. If you disagree with any part of these terms, 
                    you may not access our services.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">2. Use of Services</h2>
                  <p className="mb-4">You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon the rights of others</li>
                    <li>Transmit any harmful, offensive, or illegal content</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt our services</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">3. Intellectual Property</h2>
                  <p className="mb-4">
                    All content, designs, graphics, logos, and materials on our website are the property 
                    of Chocomotion Studio or its licensors and are protected by copyright, trademark, and 
                    other intellectual property laws. You may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Reproduce, distribute, or create derivative works without permission</li>
                    <li>Use our content for commercial purposes without authorization</li>
                    <li>Remove or alter any copyright or proprietary notices</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">4. Service Availability</h2>
                  <p>
                    We strive to provide reliable and uninterrupted service, but we do not guarantee that 
                    our website will be available at all times. We reserve the right to modify, suspend, 
                    or discontinue any part of our services at any time without notice.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">5. Client Projects and Deliverables</h2>
                  <p className="mb-4">
                    When you engage our services for a project:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Project terms, deliverables, and timelines will be specified in a separate agreement</li>
                    <li>Payment terms and schedules will be agreed upon before work begins</li>
                    <li>You retain ownership of your brand assets and content</li>
                    <li>We retain the right to showcase completed work in our portfolio (unless otherwise agreed)</li>
                    <li>Revisions and changes are subject to the project agreement</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">6. Payment Terms</h2>
                  <p className="mb-4">
                    Payment terms will be specified in your project agreement. Generally:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Deposits may be required before work begins</li>
                    <li>Final payment is due upon project completion and delivery</li>
                    <li>Late payments may incur additional fees</li>
                    <li>All fees are non-refundable unless otherwise specified</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">7. Limitation of Liability</h2>
                  <p>
                    To the maximum extent permitted by law, Chocomotion Studio shall not be liable for any 
                    indirect, incidental, special, consequential, or punitive damages, or any loss of profits 
                    or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, 
                    or other intangible losses resulting from your use of our services.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">8. Indemnification</h2>
                  <p>
                    You agree to indemnify and hold harmless Chocomotion Studio, its officers, directors, 
                    employees, and agents from any claims, damages, losses, liabilities, and expenses 
                    (including legal fees) arising out of or relating to your use of our services or 
                    violation of these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">9. Termination</h2>
                  <p>
                    We reserve the right to terminate or suspend your access to our services immediately, 
                    without prior notice, for any breach of these Terms or for any other reason we deem necessary.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">10. Governing Law</h2>
                  <p>
                    These Terms shall be governed by and construed in accordance with applicable laws, 
                    without regard to its conflict of law provisions.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">11. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify these Terms at any time. We will notify you of any 
                    material changes by posting the new Terms on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-4">12. Contact Information</h2>
                  <p>
                    If you have any questions about these Terms of Service, please contact us at:
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

