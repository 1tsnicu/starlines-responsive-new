import { Building2 } from "lucide-react";

const B2BSection = () => {
  return (
    <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <p className="text-[12px] tracking-[0.12em] uppercase text-slate-500">Corporate & Grupuri</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Soluții pentru companii și grupuri</h2>
            <p className="mt-3 text-slate-700 dark:text-slate-300">Transport dedicat pentru evenimente, navetă angajați sau turism. Oferim contracte personalizate și termene flexibile.</p>
          </div>
          <div className="flex lg:justify-end">
            <a href="/b2b" className="inline-flex items-center justify-center rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400">Solicită ofertă</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default B2BSection;
