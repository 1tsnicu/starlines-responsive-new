import { Phone, Mail, MessageSquare } from "lucide-react";

const QuickSupportSection = () => {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-[12px] tracking-[0.12em] uppercase text-slate-500">Asistență rapidă</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Ajutor 24/7</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="tel:+373000000" className="rounded-md border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3"><Phone className="h-4 w-4" /><span>Telefon</span></div>
          </a>
          <a href="https://wa.me/373000000" className="rounded-md border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3"><MessageSquare className="h-4 w-4" /><span>WhatsApp</span></div>
          </a>
          <a href="mailto:support@starlines.com" className="rounded-md border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4" /><span>Email</span></div>
          </a>
        </div>
        <div className="mt-4">
          <a href="/help" className="text-sm text-teal-700 dark:text-teal-400 underline">Centru de ajutor</a>
        </div>
      </div>
    </section>
  );
};

export default QuickSupportSection;
