"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { FaCheck, FaCrown, FaRocket, FaBolt, FaExclamationTriangle } from "react-icons/fa";

const PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    price: "$5",
    credits: 100,
    description: "Perfect for casual content creators starting to automate their scheduling.",
    features: [
      "100 publishing credits",
      "YouTube Video Publishing",
      "TikTok Video Publishing",
      "Detailed error diagnostics",
      "Immediate or scheduled posts",
    ],
    popular: false,
    Icon: FaBolt,
    iconColor: "text-amber-400 bg-amber-500/10",
    buttonId: "pricing-buy-starter",
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: "$15",
    credits: 500,
    description: "Best for active creators looking to maintain a consistent upload calendar.",
    features: [
      "500 publishing credits",
      "YouTube Video Publishing",
      "TikTok Video Publishing",
      "Detailed error diagnostics",
      "Immediate or scheduled posts",
      "Priority API queue processing",
      "Auto-retry for failed attempts",
    ],
    popular: true,
    Icon: FaRocket,
    iconColor: "text-violet-400 bg-violet-500/10",
    buttonId: "pricing-buy-pro",
  },
  {
    id: "business",
    name: "Business Pack",
    price: "$45",
    credits: 2000,
    description: "Designed for social media agencies managing multiple client channels.",
    features: [
      "2000 publishing credits",
      "YouTube Video Publishing",
      "TikTok Video Publishing",
      "Detailed error diagnostics",
      "Immediate or scheduled posts",
      "Highest priority execution queue",
      "Auto-retry for failed attempts",
      "Dedicated developer email support",
    ],
    popular: false,
    Icon: FaCrown,
    iconColor: "text-fuchsia-400 bg-fuchsia-500/10",
    buttonId: "pricing-buy-business",
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handlePurchase = async (planId) => {
    if (!session?.user) {
      signIn("google");
      return;
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create checkout session");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Could not load payment checkout link. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred initiating checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="flex-1 min-h-screen bg-zinc-950 px-6 py-16 flex flex-col items-center">
      <div className="max-w-5xl w-full flex flex-col gap-12">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Flexible <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Credit Packs</span>
          </h1>
          <p className="max-w-xl text-sm text-zinc-400 leading-relaxed">
            No monthly subscriptions, no lock-ins. Purchase credits when you need them. 
            One credit is consumed per successfully published video or scheduled post.
          </p>
        </div>

        {/* Guest mode warning if needed */}
        {!session?.user && (
          <div className="mx-auto max-w-2xl w-full bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-amber-500 text-lg shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-amber-500">Sign in required</span>
                <span className="text-[11px] text-zinc-400">Please sign in to buy credit packs for your account.</span>
              </div>
            </div>
            <button
              onClick={() => signIn("google")}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const PlanIcon = plan.Icon;
            return (
              <div
                key={plan.id}
                className={`card-premium relative p-8 flex flex-col justify-between overflow-hidden animate-fade-in ${
                  plan.popular
                    ? "border-violet-500/40 shadow-lg shadow-violet-500/5 ring-1 ring-violet-500/30"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-violet-500 text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-inner">
                    Most Popular
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {/* Title & Icon Header */}
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${plan.iconColor}`}>
                      <PlanIcon className="text-lg" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-white leading-none">{plan.name}</h3>
                      <span className="text-[10px] text-zinc-500 font-medium mt-1">One-time payment</span>
                    </div>
                  </div>

                  {/* Price & Credits display */}
                  <div className="flex items-baseline gap-2 border-b border-zinc-900 pb-5">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-zinc-400 text-xs">/ {plan.credits} Credits</span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed min-h-[40px]">{plan.description}</p>

                  {/* Feature Checklist */}
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <FaCheck className="text-[10px] text-violet-400 shrink-0 mt-1" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Purchase Button */}
                <button
                  id={plan.buttonId}
                  disabled={loadingPlan !== null}
                  onClick={() => handlePurchase(plan.id)}
                  className={`w-full mt-8 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/10 active:scale-[0.98]"
                      : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingPlan === plan.id ? "Processing..." : `Buy ${plan.credits} Credits`}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section or Info Footer */}
        <div className="mt-6 border-t border-zinc-900 pt-10 text-center flex flex-col items-center gap-2">
          <p className="text-xs text-zinc-500">
            Secure checkout powered by Stripe. Have questions or need support? Contact support@muapi.ai.
          </p>
          <p className="text-[10px] text-zinc-600">
            If a scheduled post fails due to an external service error, your consumed credit is automatically refunded to your account balance.
          </p>
        </div>
      </div>
    </main>
  );
}
