import type { Metadata } from 'next';
import EventsPageContent from './content';

export const metadata: Metadata = {
  title: 'Události a akce',
  description: 'Prohlédněte si všechny koncerty, divadla, festivaly a sportovní akce v České republice. Filtrujte podle kategorie, města a data.',
  openGraph: {
    title: 'Události a akce | TipNaDen.cz',
    description: 'Prohlédněte si všechny koncerty, divadla, festivaly a sportovní akce v České republice.',
    url: 'https://tipnaden.cz/events',
  },
};

export default function EventsPage() {
  return <EventsPageContent />;
}