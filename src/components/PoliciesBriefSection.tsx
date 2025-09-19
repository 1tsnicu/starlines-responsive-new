const cards = [
  { title: "Bagaje", desc: "Un bagaj de cală + unul de mână incluse. Opțiuni extra disponibile." },
  { title: "Anulare", desc: "Anulare flexibilă conform politicilor operatorului." },
  { title: "Check‑in", desc: "Bilet electronic. Prezintă QR la îmbarcare." },
  { title: "Siguranță", desc: "Standarde stricte de întreținere și conducere." },
];

const PoliciesBriefSection = () => {
  return (
    <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-[12px] tracking-[0.12em] uppercase text-slate-500">Politici pe scurt</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Călătorești informat</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <div key={c.title} className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{c.title}</h3>
              <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PoliciesBriefSection;
