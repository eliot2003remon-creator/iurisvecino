import React, { useState } from 'react';
import { Scale, FileText, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, Loader2, Sparkles, DollarSign } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeLegalQuery } from './services/gemini';

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState<null | 'aviso' | 'privacidad' | 'terminos'>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await analyzeLegalQuery({ query });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado al procesar tu consulta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500/30 pb-16 relative">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                IURISVECINO
              </span>
              <span className="text-[10px] block font-medium tracking-widest text-blue-400 uppercase mt-[-2px]">
                Legal AI Engine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-full text-xs text-slate-300 font-medium shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Fase Alpha de Validación
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <section className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              ¿Te está <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">jodiendo</span> tu vecino?
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Analizamos tus estatutos y actas bajo el marco estricto de la Ley de Propiedad Horizontal para ofrecerte una resolución técnica y jurídica inmediata.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-850 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl bg-slate-800/30 backdrop-blur-sm">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Describe tu conflicto o pega los hechos:
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: El vecino del 3ºB ha cerrado la terraza común sin permiso de la junta y genera ruidos a altas horas..."
                className="w-full h-44 bg-slate-900/90 border border-slate-700/70 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none leading-relaxed shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 border border-blue-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando jurisprudencia...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar Dictamen Técnico
                </>
              )}
            </button>
          </form>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 items-start">
            <HelpCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">Objetivo de consulta personalizada</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nuestra IA legal ha sido entrenada con la LPH de España y sentencias del Tribunal Supremo para mapear mayorías e impugnaciones de forma automatizada.
              </p>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: RESULTADO */}
        <section className="lg:col-span-7 w-full space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs font-medium text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 min-h-[450px]">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Panel de Resultados Legal Engine
                </span>
              </div>
              {result && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wide">
                  Borrador Emitido
                </span>
              )}
            </div>

            <div className="p-6 lg:p-8 overflow-y-auto prose prose-slate max-w-none text-sm leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-xl prose-h2:text-base prose-h3:text-sm prose-strong:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700">
              {loading ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="h-12 w-12 rounded-full border-2 border-t-blue-600 border-r-indigo-500 animate-spin flex items-center justify-center">
                    <Scale className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Indexando base de datos jurídica...</p>
                </div>
              ) : result ? (
                <ReactMarkdown>{result}</ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-24 text-slate-400">
                  <Scale className="h-8 w-8 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700">Esperando consulta legal</p>
                </div>
              )}
            </div>

            {result && !loading && (
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 border-t border-slate-800 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
                <div>
                  <h4 className="text-sm font-bold tracking-tight">¿Deseas emitir este documento oficial?</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Descarga el Dictamen Oficial Certificado con membrete en PDF.</p>
