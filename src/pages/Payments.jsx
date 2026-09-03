import React, { useEffect, useState } from "react";
import { Check, ShieldCheck, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { PRICING_PLANS } from "../data/plans";
import { Card, Badge, Button, SectionHeading } from "../components/ui";
import RibbonBackground from "../components/RibbonBackground";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Payments = () => {
  const [processingPlan, setProcessingPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
    loadRazorpayScript();
  }, []);

  const handlePayment = async (plan) => {
    try {
      setProcessingPlan(plan.id);
      setSuccessMsg("");

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        alert("Unable to load Razorpay payment gateway. Please check your internet connection.");
        setProcessingPlan(null);
        return;
      }

      const response = await fetch(`${API}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.amount, currency: "INR" }),
      });

      const data = await response.json();
      if (!data.success || !data.order) {
        alert(data.message || "Could not create payment order. Please try again.");
        setProcessingPlan(null);
        return;
      }

      let userName = "Member";
      let userEmail = "member@example.com";
      try {
        const stored = JSON.parse(localStorage.getItem("skillswapUser") || "{}");
        if (stored.name) userName = stored.name;
        if (stored.email) userEmail = stored.email;
      } catch {}

      const rzpKey = data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TWq7ZdJzZgvhZG";

      const options = {
        key: rzpKey,
        amount: data.order.amount,
        currency: data.order.currency || "INR",
        name: "SkillSwap",
        description: `${plan.name} Plan Activation`,
        handler: async (paymentResponse) => {
          try {
            await fetch(`${API}/api/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentResponse),
            });
          } catch {}
          setSuccessMsg(`🎉 Success! Your ${plan.name} plan has been activated!`);
          setProcessingPlan(null);
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: { color: "#7C3AED" },
        modal: {
          ondismiss: () => setProcessingPlan(null),
        },
      };

      if (data.isRealRazorpayOrder && data.order?.id) {
        options.order_id = data.order.id;
      }

      const razor = new window.Razorpay(options);
      razor.on("payment.failed", (response) => {
        alert(`Payment failed: ${response.error.description || "Transaction was declined."}`);
        setProcessingPlan(null);
      });
      razor.open();
    } catch (err) {
      console.error("Payment error", err);
      alert("Payment gateway failed to initialize. Please try again in a few seconds.");
      setProcessingPlan(null);
    }
  };

  return (
    <div className="relative bg-[#FAF9FF] dark:bg-[#07070C] px-4 py-16 md:py-24 min-h-screen overflow-hidden transition-colors duration-300">
      <RibbonBackground variant="pricing" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <SectionHeading
          eyebrow="Premium options"
          eyebrowIcon={<Sparkles size={13} />}
          title="Grow faster on SkillSwap"
          subtitle="Free gets you everything you need to swap skills. These add-ons help serious learners and teachers get noticed faster."
        />

        {successMsg && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-center justify-center font-bold text-base shadow-sm">
            <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-7 items-start mt-10">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              data-aos="fade-up"
              className={`relative z-10 p-8 rounded-3xl border bg-white dark:bg-[#151522] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col ${
                plan.highlighted
                  ? "border-violet-600 dark:border-violet-500 ring-2 ring-violet-500/20 md:-translate-y-2"
                  : "border-gray-200 dark:border-[#2C2C40]"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3.5 left-8 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">{plan.tagline}</p>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">/ {plan.period}</span>
              </div>

              <ul className="space-y-3.5 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Check size={17} className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.amount ? (
                <Button
                  onClick={() => handlePayment(plan)}
                  variant={plan.highlighted ? "primary" : "secondary"}
                  fullWidth
                  disabled={processingPlan === plan.id}
                  size="md"
                >
                  {processingPlan === plan.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> Initializing...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </Button>
              ) : (
                <Button variant="secondary" fullWidth disabled size="md">
                  {plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div
          data-aos="fade-up"
          className="relative z-10 max-w-xl mx-auto mt-14 p-6 rounded-2xl bg-white dark:bg-[#151522] border border-gray-200 dark:border-[#2C2C40] flex items-center gap-4 text-left shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-base">Secure Razorpay Payments</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
              All transactions are encrypted with 256-bit SSL and processed securely via Razorpay. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
