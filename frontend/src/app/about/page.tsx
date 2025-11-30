import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Search, Sparkles, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'O nás | TipNaDen.cz',
  description: 'Zjistěte více o TipNaDen.cz - platformě pro objevování nejlepších událostí v České republice.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            O <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">TipNaDen.cz</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Vaše brána ke všem nejlepším událostem v České republice
          </p>
        </div>

        {/* Mission */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-12 hover:border-slate-600/50 transition-colors">
          <h2 className="text-3xl font-bold text-white mb-4">Naše mise</h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            TipNaDen.cz vznikl s jedním jasným cílem: <strong className="text-white">zjednodušit objevování událostí</strong> po celé České republice. 
            Věříme, že každý by měl mít snadný přístup k nejlepším koncertům, festivalům, divadlům, sportovním akcím a mnoha dalším eventům.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Search className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Snadné vyhledávání</h3>
            <p className="text-slate-300">
              Najděte přesně to, co hledáte díky pokročilým filtrům a inteligentnímu vyhledávání.
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aktuální data</h3>
            <p className="text-slate-300">
              Každý den přidáváme stovky nových událostí z celé České republiky.
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-green-500/50 transition-all hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="text-green-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Personalizace</h3>
            <p className="text-slate-300">
              Přizpůsobte si zážitek podle svých preferencí a oblíbených kategorií.
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-orange-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro všechny</h3>
            <p className="text-slate-300">
              Ať už jste fanoušek hudby, divadla, sportu nebo kultury - najdete tu to své.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 border border-slate-700 hover:from-slate-600 hover:to-slate-700 transition-all">
          <h2 className="text-3xl font-bold text-white mb-4">
            Připraveni objevovat?
          </h2>
          <p className="text-lg text-slate-300 mb-6">
            Prohlédněte si tisíce událostí a najděte tu perfektní pro vás!
          </p>
          <Link href="/events">
            <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors text-lg shadow-xl">
              Zobrazit všechny události →
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 text-center">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
            <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
            <div className="text-slate-300 text-sm">Událostí</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
            <div className="text-slate-300 text-sm">Měst</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-green-500/50 transition-colors">
            <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-slate-300 text-sm">Aktualizace</div>
          </div>
        </div>
      </div>
    </div>
  );
}