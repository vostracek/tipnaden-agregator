export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Ochrana osobních údajů</h1>
        
        <div className="text-slate-300 space-y-6 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Správce osobních údajů</h2>
            <p>
              Provozovatelem webové stránky TipNaDen.cz je Lukáš Vostrý.<br/>
              Email: info@tipnaden.cz
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Jaké údaje zpracováváme</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Emailová adresa (při registraci)</li>
              <li>Jméno a profilový obrázek (z účtu Clerk)</li>
              <li>IP adresa (automaticky při návštěvě)</li>
              <li>Cookies pro fungování webu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Účel zpracování</h2>
            <p>
              Vaše osobní údaje používáme pro provoz webu, autentifikaci uživatelů a zlepšení našich služeb.
              Data nesdílíme s třetími stranami kromě nezbytných služeb (Clerk pro přihlášení).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Vaše práva</h2>
            <p>
              Máte právo na přístup ke svým údajům, jejich opravu nebo smazání. Pro uplatnění práv nás kontaktujte
              na info@tipnaden.cz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookies</h2>
            <p>
              Používáme pouze technické cookies nutné pro fungování webu. Nepoužíváme reklamní cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Kontakt</h2>
            <p>
              Pro dotazy ohledně ochrany osobních údajů nás kontaktujte na{' '}
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