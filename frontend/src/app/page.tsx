"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";

export default function HomePage() {
  const router = useRouter();
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TipNaDen.cz",
    description: "Události a akce v České republice",
    url: "https://tipnaden.cz",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://tipnaden.cz/events?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const categories = [
    { name: "Koncerty", displayName: "Koncerty", icon: "🎵" },
    { name: "Divadla", displayName: "Divadla", icon: "🎭" },
    { name: "Festivaly", displayName: "Festivaly", icon: "🎪" },
    { name: "Sport", displayName: "Sport", icon: "⚽" },
    { name: "Výstavy", displayName: "Výstavy", icon: "🎨" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-screen">
          
          {/* Logo & Nadpis */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                TipNaDen.cz
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl">
              Objevte nejlepší akce a události v celé České republice. Koncerty,
              divadla, festivaly a mnohem víc – všechno na jednom místě.
            </p>
          </div>

          {/* Search Bar s našeptáváním */}
          <SearchWithSuggestions className="w-full max-w-3xl" size="large" />

          {/* Quick Suggestions */}
          <div className="mt-12 w-full max-w-4xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="text-yellow-400" size={24} />
              <h2 className="text-2xl font-bold text-white">
                Populární kategorie
              </h2>
              <Sparkles className="text-yellow-400" size={24} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    router.push(
                      `/events?search=${encodeURIComponent(category.name)}`
                    );
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-600 hover:border-slate-500"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <p className="text-white font-semibold text-lg">
                      {category.displayName}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}