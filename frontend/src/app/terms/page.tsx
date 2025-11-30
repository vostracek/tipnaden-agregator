export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Podmínky použití</h1>
        
        <div className="text-slate-300 space-y-6 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Popis služby</h2>
            <p>
              TipNaDen.cz je platforma pro objevování událostí v České republice. Agregujeme informace
              o koncertech, divadlech, festivalech a dalších akcích z veřejně dostupných zdrojů.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Použití služby</h2>
            <p>
              Používáním této webové stránky souhlasíte s těmito podmínkami. Službu smíte používat pouze
              v souladu s platnými zákony České republiky.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Uživatelský účet</h2>
            <p>
              Pro využívání některých funkcí je nutná registrace. Jste odpovědní za bezpečnost svého účtu
              a hesla. Musíte být starší 18 let nebo mít souhlas zákonného zástupce.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Informace o událostech</h2>
            <p>
              Informace o událostech jsou agregované z externích zdrojů. Nezaručujeme úplnou přesnost
              všech údajů. Ceny, data a dostupnost se mohou změnit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Autorská práva</h2>
            <p>
              Veškerý obsah webu včetně designu, loga a textů je chráněn autorským právem.
              Data o jednotlivých událostech patří jejich původním pořadatelům.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Zřeknutí se odpovědnosti</h2>
            <p>
              Službu poskytujeme jak je. Neneseme odpovědnost za škody vzniklé používáním webu
              nebo nesprávnými informacemi z externích zdrojů.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Změny podmínek</h2>
            <p>
              Vyhrazujeme si právo tyto podmínky kdykoliv změnit. Změny budou zveřejněny na této stránce
              a vstoupí v platnost okamžitě.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Kontakt</h2>
            <p>
              Pro dotazy ohledně podmínek použití nás kontaktujte na{' '}
              <a href="mailto:info@tipnaden.cz" className="text-blue-400 hover:text-blue-300 underline">
                info@tipnaden.cz
              </a>
            </p>
          </section>

          <p className="text-slate-500 text-sm mt-8">
            Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}
          </p>
        </div>
      </div>
    </div>
  );
}