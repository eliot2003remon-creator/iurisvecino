import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, FileText, Upload, ShieldCheck, Search, FileWarning, 
  Loader2, Download, X, HelpCircle
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

  // Estados para el buzón de consulta personalizada
  const [nombreForm, setNombreForm] = useState('');
  const [emailForm, setEmailForm] = useState('');
  const [detalleForm, setDetalleForm] = useState('');

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

  // 🛠️ FUNCIÓN DE CONEXIÓN CON GOOGLE SHEETS INYECTADA:
  const handleEnviarBuzon = async () => {
    if (!nombreForm.trim() || !emailForm.trim()) {
      alert('Por favor, rellena al menos el Nombre y el Correo Electrónico.');
      return;
    }

    try {
      // ⚠️ CAMBIA ESTE TEXTO POR TU URL REAL DE GOOGLE APPS SCRIPT:
      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVNlc09u0vgAz7h563JczdVRnpjMxqacLAmT9xKeBCL16bEBXaIn_L24J-f2_Q3zQ7/exec';

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Evita bloqueos por restricciones de CORS de Google
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombreForm,
          email: emailForm,
          detalle: detalleForm
        }),
      });

      alert('¡Solicitud enviada y registrada en Google Sheets correctamente!');
      setNombreForm('');
      setEmailForm('');
      setDetalleForm('');
    } catch (err) {
      console.error('Error al sincronizar con Sheets:', err);
      alert('Hubo un problema al enviar los datos a la hoja de cálculo.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative pb-14">
      
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
          /* LANDING CON BUZÓN */
          <motion.main 
            key="landing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-grow flex items-center justify-center py-12 px-6 md:px-16"
          >
            <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-12 items-start">
              
              {/* BLOQUE IZQUIERDO: BUZÓN DE CONSULTA */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded">
                  <ShieldCheck className="w-3.5 h-3.5" /> Protocolo IA • LPH 2026
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 leading-tight">
                  ¿Conflictos con tu <br/> <span className="text-blue-600 italic font-normal">comunidad?</span>
                </h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">Analizamos tu caso bajo el marco de la Ley de Propiedad Horizontal y Jurisprudencia del Tribunal Supremo.</p>
                
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    Solicitar Consulta Personalizada
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={nombreForm} 
                        onChange={(e) => setNombreForm(e.target.value)} 
                        placeholder="Ej: Juan Pérez Gómez" 
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:border-slate-400" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</label>
                      <input 
                        type="email" 
                        value={emailForm} 
                        onChange={(e) => setEmailForm(e.target.value)} 
                        placeholder="Ej: juan@correo.com" 
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:border-slate-400" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Detalle de su consulta</label>
                      <textarea 
                        value={detalleForm} 
                        onChange={(e) => setDetalleForm(e.target.value)} 
                        placeholder="Escribe brevemente los datos adicionales de tu caso..." 
                        className="w-full h-20 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:border-slate-400 resize-none" 
                      />
                    </div>
                    {/* 🛠️ BOTÓN ACTUALIZADO PARA ACTIVAR LA FUNCIÓN REAL DE SHEETS: */}
                    <button 
                      type="button" 
                      onClick={handleEnviarBuzon}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all cursor-pointer"
                    >
                      Enviar Solicitud
                    </button>
                  </div>
                </div>
              </div>

              {/* BLOQUE DERECHO: DETECTOR IA */}
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
          /* PANTALLA RESULTADOS CORREGIDA */
          <motion.div 
            key="results"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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

              {/* MONETIZACIÓN */}
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

      {/* FOOTER TOTALMENTE COMPLETO Y FIJO */}
      <footer className="h-14 border-t border-slate-200 bg-white flex items-center justify-between px-8 md:px-16 text-[10px] text-slate-400 font-bold uppercase tracking-widest fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-slate-300" />
          <span>IURISVECINO © 2026. PROTOTIPO MVP.</span>
        </div>
        <div className="
