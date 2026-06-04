"use client";

import { motion } from "framer-motion";
import { FiCheck, FiZap, FiStar, FiShield, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    description: "Begin your manifestation journey",
    features: [
      "10 Credits included",
      "Standard Rendering speed",
      "Basic Video Models",
      "Standard Resolution",
      "Public Gallery Storage"
    ],
    cta: "Start Free",
    popular: false,
    color: "slate",
    credits: 10
  },
  {
    name: "Pro Studio",
    price: "$19.99",
    period: "/mo",
    description: "For active professional creators",
    features: [
      "500 Credits monthly",
      "Seedance 2.0 Priority Access",
      "HD Rendering (1080p)",
      "Priority Manifestation Queue",
      "Private Studio Workspace",
      "Commercial Usage License"
    ],
    cta: "Go Pro",
    popular: true,
    color: "primary",
    credits: 500
  },
  {
    name: "Elite Creator",
    price: "$49.99",
    period: "/mo",
    description: "Scale your creative operations",
    features: [
      "1500 Credits monthly",
      "Native Synchronized Audio",
      "4K Ultra-HD Output",
      "Multi-shot Generation",
      "API Access for Workflows",
      "24/7 Priority Support"
    ],
    cta: "Go Elite",
    popular: false,
    color: "slate",
    credits: 1500
  }
];

export default function PricingPage() {
  const handlePurchase = async (plan) => {
    if (plan.price === "Free") {
      alert("You already have access to the Starter plan!");
      return;
    }

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("[PURCHASE_ERROR]", error);
      alert("Something went wrong with the checkout process. Please try again.");
    }
  };
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 text-sm font-medium"
          >
            <FiZap className="text-xs" />
            Pricing Plans
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tighter text-foreground uppercase"
          >
            Fuel your <span className="text-primary-500">Creativity</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted font-medium text-sm md:text-base leading-relaxed"
          >
            Choose the manifestation plan that fits your studio workflow. 
            From solo creators to global creative teams.
          </motion.p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className={`relative flex flex-col p-8 rounded bg-glass-bg backdrop-blur-3xl border-2 ${
                plan.popular ? "border-primary-500 shadow-2xl shadow-primary-500/10" : "border-glass-border"
              } transition-all hover:scale-[1.02]`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-primary-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="space-y-6 mb-8">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-[11px] text-muted font-medium leading-relaxed">{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted font-bold text-sm">{plan.period}</span>}
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${plan.popular ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-400"}`}>
                      <FiCheck className="text-[10px]" />
                    </div>
                    <span className="text-xs font-medium text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handlePurchase(plan)}
                size="lg"
                className={`w-full !rounded font-black text-[10px] tracking-widest uppercase py-6 transition-all ${
                  plan.popular 
                    ? "!bg-primary-500 !text-white hover:!bg-primary-600 shadow-xl shadow-primary-500/20" 
                    : "!bg-slate-100 !text-slate-900 hover:!bg-slate-200"
                }`}
              >
                {plan.cta} <FiArrowRight className="ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="bg-glass-bg border border-glass-border rounded p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h4 className="text-2xl font-black text-foreground uppercase tracking-tight">Need a custom credit package?</h4>
            <p className="text-xs text-muted font-medium leading-relaxed">
              If your creative volume exceeds our pro plans, we offer dynamic bulk credit packages 
              tailored to your production cycle. Connect with our studio engineers today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-muted">
              <div className="flex items-center gap-2">
                <FiShield className="text-primary-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <FiStar className="text-primary-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
