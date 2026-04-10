"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PlanoraApp() {
  const [location, setLocation] = useState("");
  const [preferences, setPreferences] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [images, setImages] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const isPaid =
    typeof window !== "undefined" &&
    window.location.search.includes("success");

  // IMAGE FETCH (SAFE)
  const getImage = async (query: string) => {
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
          query
        )}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_KEY}`
      );
      const data = await res.json();
      return data?.urls?.regular || "https://picsum.photos/600/400";
    } catch {
      return "https://picsum.photos/600/400";
    }
  };

  // PREVIEW (FREE)
  const generatePreview = async () => {
    if (!location) return;

    setLoading(true);

    const items = [
      {
        name: "Luxury Hotel Check-in",
        description: "Arrive and unwind in a premium hotel experience.",
      },
      {
        name: "Explore Iconic Landmarks",
        description: "Visit must-see attractions and hidden gems.",
      },
      {
        name: "Fine Dining Experience",
        description: "Enjoy a top-rated restaurant curated for you.",
      },
      {
        name: "Private Guided Tour",
        description: "Exclusive guided experience with a local expert.",
      },
    ];

    setPreview({ days: [items] });

    const newImages: any = {};
    for (const item of items) {
      newImages[item.name] = await getImage(item.name + " " + location);
    }

    setImages(newImages);
    setLoading(false);
  };

  // FULL AI PLAN
  const generateFullPlan = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, preferences }),
      });

      const data = await res.json();
      setPreview(data);

      const newImages: any = {};
      for (const day of data.days) {
        for (const item of day) {
          newImages[item.name] = await getImage(
            item.name + " " + location
          );
        }
      }

      setImages(newImages);
    } catch {
      alert("AI failed — try again");
    }

    setLoading(false);
  };

  // STRIPE CHECKOUT
  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, preferences }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  // AUTO UNLOCK
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const loc = params.get("location");
    const prefs = params.get("preferences");

    if (success) {
      if (loc) setLocation(loc);
      if (prefs) setPreferences(prefs);
      generateFullPlan();
    }
  }, []);

  // PDF EXPORT
  const downloadPDF = () => {
    if (!preview) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(22);
    doc.text("Planora Luxury Itinerary", 20, y);
    y += 10;

    preview.days.forEach((day: any[], i: number) => {
      doc.setFontSize(16);
      doc.text(`Day ${i + 1}`, 20, y);
      y += 8;

      day.forEach((item: any) => {
        doc.setFontSize(12);
        doc.text(`• ${item.name}`, 20, y);
        y += 6;

        doc.setTextColor(100);
        doc.text(item.description, 25, y);
        y += 8;

        doc.setTextColor(0);
      });

      y += 5;
    });

    doc.save("planora-itinerary.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white p-6 flex flex-col items-center">

      {/* HERO */}
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-6xl font-serif tracking-wide">Planora</h1>
        <p className="text-gray-400 mt-4 text-lg">
          Luxury travel, intelligently designed.
        </p>
        <p className="text-gray-500 mt-2 text-sm">
          AI-crafted itineraries with hotels, dining, and unforgettable experiences.
        </p>
      </div>

      {/* FORM */}
      <Card className="w-full max-w-xl p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
        <CardContent className="flex flex-col gap-4">

          <Input
            placeholder="Destination (Paris, Tokyo, Dubai...)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-white/10 border-none"
          />

          <Textarea
            placeholder="Preferences (luxury, food, adventure...)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="bg-white/10 border-none"
          />

          <Button
            onClick={generatePreview}
            className="bg-white text-black text-lg rounded-xl"
          >
            Design My Trip
          </Button>

          {loading && (
            <p className="text-center text-gray-400 text-sm">
              Designing your itinerary ✨
            </p>
          )}
        </CardContent>
      </Card>

      {/* RESULTS */}
      {preview && (
        <div className="mt-14 w-full max-w-4xl">

          <h2 className="text-2xl mb-6 text-center">
            {isPaid ? "Your Luxury Itinerary" : "Preview Experience"}
          </h2>

          {preview.days.map((day: any[], index: number) => (
            <div key={index} className="grid md:grid-cols-2 gap-6">
              {day.map((item: any, i: number) => (
                <Card
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  <img
                    src={images[item.name] || "https://picsum.photos/600/400"}
                    alt={item.name}
                    className={`w-full h-48 object-cover ${
                      !isPaid && i >= 2 ? "blur-sm opacity-70" : ""
                    }`}
                  />

                  <CardContent className="p-4">
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-gray-400 text-sm">
                      {item.description}
                    </p>

                    {!isPaid && i >= 2 && (
                      <p className="text-yellow-400 text-xs mt-2">
                        🔒 Unlock full itinerary
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}

          {/* PAY BUTTON */}
          {!isPaid && (
            <div className="text-center mt-12">
              <Button
                onClick={handleCheckout}
                className="bg-white text-black text-lg px-10 py-4 rounded-xl shadow-xl"
              >
                Unlock Full Luxury Plan ($9)
              </Button>
              <p className="text-gray-500 text-sm mt-3">
                Full itinerary • Premium experiences • Instant access
              </p>
            </div>
          )}

          {/* PDF BUTTON */}
          {isPaid && (
            <div className="text-center mt-12">
              <Button
                onClick={downloadPDF}
                className="bg-white text-black px-6 py-3 rounded-xl"
              >
                Download Your Luxury PDF
              </Button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}