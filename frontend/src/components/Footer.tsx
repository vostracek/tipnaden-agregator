import Link from 'next/link';
import { Calendar, Mail, MapPin, Tag, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: 'Koncerty', slug: 'koncerty' },
    { name: 'Divadla', slug: 'divadla' },
    { name: 'Festivaly', slug: 'festivaly' },
    { name: 'Sport', slug: 'sport' },
    { name: 'Výstavy', slug: 'vystavy' },
  ];

  const cities = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec'];

  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo, popis, kontakty */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Calendar
                className="text-blue-400 group-hover:scale-110 transition-transform"
                size={28}
              />
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                TipNaDen.cz
              </h3>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Objevte nejlepší akce a události v celé České republice. Všechno na jednom místě.
            </p>

            {/* Kontakty */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail size={16} className="text-blue-400" />
                <a href="mailto:info@tipnaden.cz" className="hover:text-white transition-colors">
                  info@tipnaden.cz
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone size={16} className="text-blue-400" />
                <a href="tel:+420734136481" className="hover:text-white transition-colors">
                  +420 734 136 481
                </a>
              </div>
            </div>

            {/* Sociální sítě */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com/tipnaden"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://instagram.com/tipnaden"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="https://tiktok.com/@tipnaden"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 hover:bg-black rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigace */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">Navigace</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Domů
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Všechny události
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  O nás
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategorie */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Tag size={18} className="text-blue-400" />
              Kategorie
            </h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/events?search=${category.slug}`}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Města */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-blue-400" />
              Města
            </h4>
            <ul className="space-y-2">
              {cities.map((city) => (
                <li key={city}>
                  <Link
                    href={`/events?city=${city}`}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dolní lišta */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} TipNaDen.cz. Všechna práva vyhrazena.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-slate-500 hover:text-white transition-colors text-sm"
              >
                Ochrana osobních údajů
              </Link>
              <Link
                href="/terms"
                className="text-slate-500 hover:text-white transition-colors text-sm"
              >
                Podmínky použití
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
