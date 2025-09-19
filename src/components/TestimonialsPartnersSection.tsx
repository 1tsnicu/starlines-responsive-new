import { Star } from "lucide-react";

const TestimonialsPartnersSection = () => {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <p className="text-[12px] tracking-[0.12em] uppercase text-slate-500">Testimoniale</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Clienți mulțumiți</h2>
            <div className="mt-6 space-y-6">
              {["Rapid și eficient.", "Proces clar și ușor.", "Recomand!"].map((q, i) => (
                <blockquote key={i} className="rounded-md border border-slate-200 dark:border-slate-800 p-5">
                  <div className="flex items-center gap-2 text-amber-500"><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /></div>
                  <p className="mt-3 text-slate-800 dark:text-slate-200">{q}</p>
                  <footer className="mt-2 text-sm text-slate-500">— Pasager verificat</footer>
                </blockquote>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[12px] tracking-[0.12em] uppercase text-slate-500">Parteneri & Plăți</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {["/visa.svg", "/mastercard.svg", "/applepay.svg", "/maestro.svg"].map((src) => (
                <div key={src} className="h-14 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                  <img src={src} alt={src.replace('/', '').replace('.svg','')} className="h-6 object-contain" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsPartnersSection;
