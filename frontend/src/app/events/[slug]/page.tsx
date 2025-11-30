import type { Metadata } from 'next';
import { getEvent, Event } from '@/lib/api';
import EventDetailContent from './content';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> // ✅ Promise!
}): Promise<Metadata> {
  try {
    const { slug } = await params; // ✅ Await params!
    const event = await getEvent(slug);
    
    if (!event) {
      return {
        title: 'Událost nenalezena',
      };
    }

    return {
      title: event.title,
      description: event.shortDescription || event.description.substring(0, 160),
      openGraph: {
        title: event.title,
        description: event.shortDescription || event.description.substring(0, 160),
        type: 'website',
        url: `https://tipnaden.cz/events/${event.seo.slug}`,
        images: event.media?.mainImage ? [
          {
            url: event.media.mainImage,
            width: 1200,
            height: 630,
            alt: event.title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: event.shortDescription || event.description.substring(0, 160),
        images: event.media?.mainImage ? [event.media.mainImage] : [],
      },
    };
  } catch {
    return {
      title: 'Událost nenalezena',
    };
  }
}

function EventStructuredData({ event }: { event: Event }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    image: event.media?.mainImage || '',
    startDate: event.dateTime.start,
    endDate: event.dateTime.end || event.dateTime.start,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location.address,
        addressLocality: event.location.city,
        addressCountry: 'CZ'
      }
    },
    offers: {
      '@type': 'Offer',
      url: event.source?.sourceUrl || '',
      price: event.pricing.isFree ? '0' : event.pricing.priceFrom || '0',
      priceCurrency: event.pricing.currency || 'CZK',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString()
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer?.name || 'TipNaDen.cz',
      url: 'https://tipnaden.cz'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> // ✅ Promise!
}) {
  const { slug } = await params; // ✅ Await params!
  let event = null;
  
  try {
    event = await getEvent(slug);
  } catch {
    // Event se načte v client komponentě
  }

  return (
    <>
      {event && <EventStructuredData event={event} />}
      <EventDetailContent slug={slug} />
    </>
  );
}