const MapNetworkSection = () => {
  return (
    <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-[12px] tracking-[0.12em] uppercase text-slate-500">Hărți & Rețea</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Acoperire europeană</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Hub-uri principale și conexiuni. Vizualizare schematică a rețelei.</p>
        </div>
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <svg viewBox="0 0 800 400" className="w-full h-[260px] md:h-[360px]" role="img" aria-label="Rețea rute Starlines">
            <defs>
              <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
                <circle cx="3" cy="3" r="3" fill="#0f766e" />
              </marker>
            </defs>
            <rect width="800" height="400" fill="transparent" />
            <g stroke="#0f766e" strokeWidth="2" fill="none">
              <line x1="120" y1="300" x2="320" y2="200" markerEnd="url(#dot)" />
              <line x1="320" y1="200" x2="520" y2="180" markerEnd="url(#dot)" />
              <line x1="520" y1="180" x2="680" y2="260" markerEnd="url(#dot)" />
            </g>
            <g fill="#0f172a" className="dark:fill-white">
              <circle cx="120" cy="300" r="6" />
              <text x="135" y="305" fontSize="12">Chișinău</text>
              <circle cx="320" cy="200" r="6" />
              <text x="335" y="205" fontSize="12">Iași</text>
              <circle cx="520" cy="180" r="6" />
              <text x="535" y="185" fontSize="12">București</text>
              <circle cx="680" cy="260" r="6" />
              <text x="695" y="265" fontSize="12">Sofia</text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default MapNetworkSection;
