import React, { useState, useEffect } from 'react';
import { User, SupportTicket } from '../types';
import { LifeEngineService } from '../services/lifeEngineStorage';
import { t } from '../services/translations';

interface QuestionsTabProps {
  user: User;
  lang: 'uz' | 'ru' | 'en';
}

export const QuestionsTab: React.FC<QuestionsTabProps> = ({ user, lang }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      const list = await LifeEngineService.getUserTickets(user.id);
      setTickets(list);
    };
    load();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setSubmitting(true);
    const newTicket = await LifeEngineService.createTicket(
      user.id,
      user.displayName || user.username,
      question.trim()
    );
    setTickets(prev => [newTicket, ...prev]);
    setQuestion('');
    setSubmitting(false);
  };

  const faqs = [
    {
      q: 'Yulduzlar nimaga kerak va ular qanday sarflanadi?',
      a: 'Life Engine Pro tizimida har kuni hisobingizdan 1 ta yulduz yechiladi. Bu barcha vositalardan to\'liq foydalanish va bulutli sinxronlash imkoniyatini ta\'minlaydi.'
    },
    {
      q: 'Ma\'lumotlarim telefonim yoki brauzerim o\'zgarganda yo\'qolib qolmaydimi?',
      a: 'Yo\'q, "Bulut bilan sinxronlash" tugmasini bosganingizda barcha vazifalar, odatlar va tarixingiz xavfsiz Firestore serverida saqlanadi.'
    },
    {
      q: 'Oflayn rejimda ishlaydimi?',
      a: 'Ha, tizim to\'liq Progressive Web App (PWA) standartida qurilgan bo\'lib, internetsiz ham vazifalarni belgilashingiz mumkin.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto animate-slide-up space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest block w-fit mb-3">
          Yordam Markazi
        </span>
        <h2 className="text-2xl md:text-3xl font-black">
          Savollar va Qo'llab-quvvatlash
        </h2>
        <p className="text-xs text-blue-200 mt-1 max-w-md">
          Ilovadan foydalanish bo'yicha savollaringiz bo'lsa, to'g'ridan-to'g'ri admin va mutaxassislarga murojaat qiling.
        </p>
      </div>

      {/* Ask Question Form */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Adminga Savol Yuborish
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={3}
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Savolingizni yoki taklifingizni bu yerga yozing..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs md:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500"
          ></textarea>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
          >
            {submitting ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
            <span>Yuborish</span>
          </button>
        </form>

        {/* Existing Tickets */}
        {tickets.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Sizning Murojaatlaringiz
            </h5>
            {tickets.map(t => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.question}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    t.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {t.status === 'replied' ? 'Javob berildi' : 'Kutilmoqda'}
                  </span>
                </div>
                {t.answer && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl mt-2">
                    <strong>Admin javobi:</strong> {t.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
          Ko'p Beriladigan Savollar (FAQ)
        </h4>
        {faqs.map((f, i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
            <h5 className="text-xs font-black text-slate-900 dark:text-white mb-1">
              {f.q}
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
