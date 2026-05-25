import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, FileText, Upload, ShieldCheck, Search, FileWarning, 
  Loader2, Download, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeLegalQuery } from './services/gemini';

interface LegalResult {
  query: string;
  response: string;
  timestamp: string;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<LegalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeModal, setActiveModal] = useState<null | 'aviso' | 'privacidad' | 'terminos'>(null);
  const [loadingStep, setLoadingStep] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          setFileBase64(base64String);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      setLoadingStep('Cruzando datos con la LPH...');
      const responseText = await analyzeLegalQuery({
        query,
        fileBase64: fileBase64 || undefined,
        fileMimeType: file?.type || undefined
      });
      setResult({ query, response: responseText, timestamp: new Date().toLocaleString() });
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar el dictamen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-8 md:px-16 shrink-0 sticky top-0 z-40 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 rounded flex items-center justify-center shadow-lg shadow-slate-900/10">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">IurisVecino</h1>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest -mt-0.5">LegalTech Solutions</p>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!result ? (
          /* LANDING */
          <motion.main 
            key="landing"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex-grow flex items-center justify-center py-12 px-6 md:px-16"
          >
            <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded">
                  <ShieldCheck className="w-3.5 h-3.5" /> Protocolo IA • LPH 2026
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 leading-tight">
                  ¿Conflictos con tu <br/> <span className="text-blue-600 italic font-normal">comunidad?</span>
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed">Analizamos tu caso bajo el marco de la Ley de Propiedad Horizontal y Jurisprudencia del Tribunal Supremo.</p>
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 select-none">Consulta de Registro</h3>
                  <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Tu nombre" className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none" />
                    <button type="button" className="w-full py-2.5 bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-widest rounded">Registrar en Base de Datos</button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200 shadow-xl rounded p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase block">Descripción del Conflicto</label>
                  <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej: Ruidos por obras los domingos..." className="w-full h-44 p-5 bg-slate-50 border border-slate-200 rounded focus:border-blue-600 outline-none resize-none text-sm leading-relaxed" />
                </div>
                <div onClick={() => fileInputRef.current?.click()} className="border border-dashed border-slate-200 rounded p-6 cursor-pointer bg-slate-50 hover:bg-white transition-all text-center">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <Upload className="w-4 h-4 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{file ? file.name : 'Subir Estatutos (Opcional)'}</p>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded flex items-center gap-2 text-rose-700 text-xs font-bold uppercase">
                    <FileWarning className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button onClick={handleAnalyze} disabled={isAnalyzing || !query.trim()} className="w-full bg-slate-900 text-white text-xs font-bold py-5 rounded flex items-center justify-center gap-3 hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg disabled:bg-slate-100 disabled:text-slate-400">
                  {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> {loadingStep.toUpperCase()}</> : <><Search className="w-4 h-4" /> Generar Dictamen Técnico</>}
                </button>
              </div>
            </div>
          </motion.main>
        ) : (
          /* RESULTADOS */
          <motion.div 
            key="results"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex-grow flex h-[calc(100vh-136px)] overflow-hidden"
          >
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <h1 className="text-sm font-black text-slate-900 uppercase">Sistema Online</h1>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Estado Evidencia</label>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded text-xs font-bold text-blue-950 truncate">
                  {file ? `[✓] ${file.name}` : 'Análisis por Texto Directo'}
                </div>
              </div>
              <button onClick={() => setResult(null)} className="w-full bg-slate-950 text-white text-[11px] font-bold py-3.5 rounded uppercase tracking-widest mt-auto">Nueva Consulta</button>
            </aside>

            <main className="flex-grow flex flex-col relative bg-slate-100/50 overflow-y-auto pb-32">
              <div className="p-8 md:p-12">
                <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-md rounded p-12 min-h-[1000px] prose prose-slate prose-sm font-serif text-slate-800 leading-relaxed text-justify">
                  <ReactMarkdown components={{
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded text-xs font-sans text-slate-700 not-italic my-4" {...props} />
                  }}>
                    {result.response}
                  </ReactMarkdown>
                </div>
              </div>

              {/* BARRA MONETIZACIÓN */}
              <div className="fixed bottom-14 left-80 right-0 bg-slate-900 text-white p-5 shadow-2xl border-t border-slate-950 z-30">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Download className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Dictamen Premium en PDF</h4>
                      <p className="text-[10px] text-slate-400">Descarga el documento certificado con membrete legal por 19,99€.</p>
                    </div>
                  </div>
                  <button onClick={() => alert('Pasarela Stripe Simulada - 19,99 €')} className="bg-blue-600 px-5 py-2.5 rounded text-xs font-bold hover:bg-blue-500 transition-all uppercase tracking-widest shadow-lg shadow-blue-600/30 flex items-center gap-2">
                    Emitir PDF (19,99€)
                  </button>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STICKY FOOTER LEGAL */}
      <footer className="h-14 border-t border-slate-200 bg-white flex items-center justify-between px-8 md:px-16 text-[10px] text-slate-400 font-bold uppercase tracking-widest fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-slate-300" />
          <span>IURISVECINO © 2026. PROTOTIPO MVP.</span>
        </div>
        <div className="flex gap-6">
          <button onClick={() => setActiveModal('aviso')} className="hover:text-blue-600 transition-colors cursor-pointer">Aviso Legal</button>
          <button onClick={() => setActiveModal('privacidad')} className="hover:text-blue-600 transition-colors cursor-pointer">Privacidad</button>
          <button onClick={() => setActiveModal('terminos')} className="hover:text-blue-600 transition-colors cursor-pointer">Términos</button>
        </div>
      </footer>

      {/* MODALES EN PANTALLA */}
      <AnimatePresence>
        {activeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-slate-700">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Documentación Legal</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-200 rounded cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 overflow-y-auto text-xs leading-relaxed space-y-4 text-justify text-slate-600">
                {activeModal === 'aviso' && (
                  <>
                    <p className="font-black text-slate-900 uppercase">1. Entorno de Validación</p>
                    <p>Este Sitio Web (https://iurisvecino.vercel.app/) opera como una simulación y prototipo tecnológico para el análisis predictivo de datos. Contacto técnico centralizado a través de: iurisvecino.soporte@gmail.com.</p>
                    <p className="font-black text-slate-900 uppercase">2. Uso Obligatorio</p>
                    <p>El acceso otorga la condición de usuario, comprometiéndose a introducir únicamente hechos lícitos y absteniéndose de realizar envíos automatizados perjudiciales para la plataforma.</p>
                  </>
                )}
                {activeModal === 'privacidad' && (
                  <>
                    <p className="font-black text-slate-900 uppercase">1. Tratamiento Confidencial</p>
                    <p>Las consultas se procesan en tiempo real de forma serverless mediante la infraestructura cifrada de Google AI Studio. No se indexan, almacenan ni comercializan bases de datos personales a terceros con fines publicitarios.</p>
                    <p className="font-black text-slate-900 uppercase">2. Supresión</p>
                    <p>Al no retener información comercial identificable, cualquier solicitud sobre trazas operativas puede enviarse al correo de soporte técnico unificado: iurisvecino.soporte@gmail.com.</p>
                  </>
                )}
                {activeModal === 'terminos' && (
                  <>
                    <p className="font-black text-rose-600 uppercase">⚠️ Cláusula Imperativa de Exención de Responsabilidad</p>
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-slate-700 space-y-2 leading-relaxed">
                      <p><strong>Naturaleza:</strong> El pre-dictamen informatizado es el resultado de un análisis predictivo basado en modelos de Inteligencia Artificial.</p>
                      <p><strong>No Asesoramiento:</strong> Este informe es puramente informativo. <strong className="text-slate-900 underline">No constituye, ni sustituye bajo ningún concepto, el dictamen vinculante, el asesoramiento personalizado o la defensa formal por parte de un abogado colegiado en ejercicio.</strong></p>
                      <p><strong>Responsabilidad:</strong> El operador declina cualquier responsabilidad por las decisiones particulares adoptadas de forma privada por el usuario en su comunidad de vecinos.</p>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t border-slate-100 p-3 flex justify-end bg-slate-50">
                <button onClick={() => setActiveModal(null)} className="bg-slate-900 text-white text-xs font-semibold py-1.5 px-4 rounded-lg cursor-pointer hover:bg-slate-800">Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
