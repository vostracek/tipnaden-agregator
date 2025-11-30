'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Event } from '@/lib/api';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { analytics } from '@/lib/analytics';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClick = () => {
    // ✅ DEBUG ERROR - pouze v development mode
    if (process.env.NODE_ENV === 'development' && event.title === 'TEST_ERROR') {
      throw new Error('Test render error - EventCard debug');
    }

    // Analytics tracking
    analytics.clickEvent(event.title, event._id);
    
    // Navigate to event detail
    router.push(`/events/${event.seo.slug}`);
  };

  return (
    <Card 
      className="overflow-hidden bg-slate-800/40 border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Event Image */}
      <div className="relative h-64 overflow-hidden">
        {event.media?.mainImage ? (
          <Image
            src={event.media.mainImage}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <Calendar className="text-slate-600" size={64} />
          </div>
        )}
        
        {/* Category Badge */}
        <div 
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md"
          style={{ 
            backgroundColor: `${event.category.color}20`,
            color: event.category.color || '#fff',
            border: `1px solid ${event.category.color}40`
          }}
        >
          {event.category.name}
        </div>

        {/* Featured Badge */}
        {event.isFeatured && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500/90 rounded-full text-xs font-bold text-slate-900">
            ⭐ Doporučujeme
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        {event.shortDescription && (
          <p className="text-slate-300 line-clamp-3 text-sm">
            {event.shortDescription}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 text-slate-400">
          {/* Date & Time */}
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            <span className="text-sm">
              {formatDate(event.dateTime.start)}
            </span>
            {event.dateTime.start && (
              <>
                <Clock size={18} className="text-blue-400 ml-2" />
                <span className="text-sm">
                  {formatTime(event.dateTime.start)}
                </span>
              </>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-red-400" />
            <span className="text-sm">
              {event.location.name}, {event.location.city}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">
              {event.pricing.isFree ? (
                <span className="text-green-400">Zdarma</span>
              ) : (
                <span>
                  {event.pricing.priceFrom && event.pricing.priceTo ? (
                    `${event.pricing.priceFrom} - ${event.pricing.priceTo} ${event.pricing.currency}`
                  ) : event.pricing.priceFrom ? (
                    `Od ${event.pricing.priceFrom} ${event.pricing.currency}`
                  ) : (
                    'Cena neuvedena'
                  )}
                </span>
              )}
            </span>
            
            <span className="text-sm text-slate-400 group-hover:text-blue-400 transition-colors">
              Více info →
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
