"use client";

import { analytics } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getEvent, Event } from "@/lib/api";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  ArrowLeft,
  ExternalLink,
  User,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await getEvent(slug);
        setEvent(data);
      } catch (err) {
        console.error(err);
        setError("Nepodařilo se načíst detail události");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchEvent();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("cs-CZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="h-[500px] bg-slate-800/50 animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 text-lg mb-6">
              {error || "Událost nenalezena"}
            </p>
            <Button
              onClick={() => router.push("/events")}
              className="bg-white text-slate-900 hover:bg-slate-200"
            >
              <ArrowLeft className="mr-2" size={16} />
              Zpět na seznam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 pt-6 max-w-6xl">
        <Button
          onClick={() => router.push("/events")}
          variant="ghost"
          className="text-white hover:text-slate-300 hover:bg-slate-800/50 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Zpět na události
        </Button>
      </div>

      <div className="relative h-[500px] overflow-hidden">
        {event.media?.mainImage ? (
          <>
            <Image
              src={event.media.mainImage}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/30" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <Calendar size={150} className="text-slate-700/50" />
          </div>
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 max-w-6xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl text-white font-bold">
                  O události
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed text-lg">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-2xl">
                  <MapPin size={28} className="text-blue-400" />
                  Místo konání
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="text-2xl font-bold text-white">
                  {event.location.name}
                </h3>
                <p className="text-slate-300 text-lg">
                  📍 {event.location.address}
                </p>
                <p className="text-slate-400 text-lg">
                  🏙️ {event.location.city}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl py-8 shadow-2xl font-bold rounded-2xl"
              onClick={() => {
                // ✅ TRACKING: Kliknutí na koupit lístek
                analytics.clickTicket(event.title, event._id);

                // Otevři ticketing URL
                if (event.source?.sourceUrl) {
                  window.open(event.source.sourceUrl, "_blank");
                }
              }}
            >
              <Ticket className="mr-3" size={28} />
              Koupit lístek
              <ExternalLink className="ml-3" size={24} />
            </Button>

            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <Calendar size={24} className="text-blue-400" />
                  Datum a čas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-sm text-slate-400 mb-2 font-semibold">
                    Datum
                  </p>
                  <p className="font-bold text-white text-xl capitalize">
                    {formatDate(event.dateTime.start)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2 font-semibold">
                    Čas
                  </p>
                  <p className="font-bold text-white text-xl flex items-center gap-2">
                    <Clock size={20} className="text-blue-400" />
                    {formatTime(event.dateTime.start)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <Tag size={24} className="text-blue-400" />
                  Vstupné
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.pricing.isFree ? (
                  <p className="text-4xl font-bold text-green-400">ZDARMA</p>
                ) : (
                  <p className="text-4xl font-bold text-white">
                    {event.formattedPrice}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <User size={24} className="text-blue-400" />
                  Pořadatel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-white text-xl mb-4">
                  {event.organizer?.name || "Neznámý pořadatel"}
                </p>
                {event.organizer?.email && (
                  <a
                    href={`mailto:${event.organizer.email}`}
                    className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2"
                  >
                    <ExternalLink size={18} />
                    Kontaktovat
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
