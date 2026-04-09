// =============================
// PLANORA FRONTEND (GITHUB READY)
// Next.js + Tailwind + shadcn/ui
// =============================

// 1. INSTALL INSTRUCTIONS
// ----------------------
// npx create-next-app@latest planora
// cd planora
// npm install
// npx shadcn-ui@latest init
// npx shadcn-ui@latest add button card input textarea

// 2. REPLACE /app/page.tsx WITH THIS FILE

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PlanoraApp() {
  const [location, setLocation] = useState("");
  const [preferences, setPreferences] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("premium");
  const [plan, setPlan] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, preferences, mode, email })
      });

      const data = await res.json();
      window.location.href = data.url;
    } catch {
      setError("Payment failed. Try again.");
    }
  };

  const generatePreview = async () => {
    if (!location) {
      setError("Please enter a destination");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, preferences, mode })
      });

      const data = await res.json();

      setPreview({ days: [data.days?.[0] || []] });
      setPlan(data);
    } catch {
      setError("Failed to generate trip");
    }

    setLoading(false);
  };

  const shareTrip = async () => {
    const text = `This planned my entire ${location} trip better than Google ✈️`;

    if (navigator.share) {
      await navigator.share({ title: "Planora", text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text + " " + window.location.href);
      alert("Copied! Share it ✈️");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">

      {/* HERO */}
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-5xl font-serif tracking-wide">Planora</h1>

        <p className="text-gray-400 mt-3 text-lg">
          Effortless travel, perfectly planned.
        </p>

        <p className="text-gray-500 mt-2 text-sm">
          Get a complete itinerary with hotels, dining, and experiences — in seconds.
        </p>

        <p className="text-green-400 text-xs mt-3">⭐ Trusted by travelers worldwide</p>
      </div>

      {/* FORM */}
      <Card className="w-full max-w-xl p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
        <CardContent className="flex flex-col gap-4">

          <Input
            placeholder="Destination (e.g. Paris, Tokyo...)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-white/10 border-none"
          />

          <Input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 border-none"
          />

          <Textarea
            placeholder="Preferences (luxury, food, adventure...)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="bg-white/10 border-none"
          />

          <div className="flex gap-2">
            {["standard", "premium ⭐", "luxury"].map((m) => (
              <Button
                key={m}
                onClick={() => setMode(m)}
                className={mode === m ? "bg-white text-black" : "bg-white/10"}
              >
                {m}
              </Button>
            ))}
          </div>

          <Button onClick={generatePreview} className="bg-white text-black text-lg">
            Design My Trip
          </Button>

          {loading && (
            <p className="text-center text-gray-400 text-sm">Designing your itinerary ✨</p>
          )}

          {error && (
            <p className="text-center text-red-400 text-sm">{error}</p>
          )}

        </CardContent>
      </Card>

      {/* PREVIEW */}
      {preview && (
        <div className="mt-12 w-full max-w-3xl">

          <h2 className="text-xl mb-4 text-center">Preview Experience</h2>

          {preview.days.map((day: any[], index: number) => (
            <Card key={index} className="bg-white/5 mb-4">
              <CardContent>
                {day.map((item: any, i: number) => (
                  <div
                    key={i}
                    className={`mb-3 ${i >= 2 ? "blur-sm opacity-60" : ""}`}
                  >
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="text-center mt-6">
            <Button onClick={handleCheckout} className="bg-white text-black text-lg px-6 py-3">
              Unlock Full Plan ($9)
            </Button>
          </div>
        </div>
      )}

      {/* SHARE */}
      {plan && (
        <div className="mt-10 text-center">
          <Button onClick={shareTrip} className="bg-white text-black">
            Share My Trip
          </Button>
        </div>
      )}

    </div>
  );
}

