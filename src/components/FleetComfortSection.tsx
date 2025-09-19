import { Wifi, Zap, Thermometer, Plug, Tv, Coffee } from "lucide-react";

const amenities = [
  { icon: Wifi, label: "Wi‑Fi" },
  { icon: Plug, label: "Prize 220V" },
  { icon: Thermometer, label: "Climatizare" },
  { icon: Zap, label: "USB" },
  { icon: Tv, label: "Entertainment" },
  { icon: Coffee, label: "Cafea/Apă" },
];

const FleetComfortSection = () => {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-[12px] tracking-[0.12em] uppercase text-slate-500">Flotă & Confort</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Confort la bord</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Autocare moderne, dotate pentru călătorii lungi.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {amenities.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-3">
              <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <span className="text-sm text-slate-800 dark:text-slate-200">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FleetComfortSection;
