/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  FileText, 
  Upload, 
  ShieldCheck, 
  Search, 
  FileWarning, 
  Loader2
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.type.startsWith('text/')) {
        setError('Por favor, sube un archivo PDF o de texto.');
        return;
      }
      setFile(selectedFile);
      setError(null);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFileBase64(base64String);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError('Por favor, describe tu consulta o conflicto.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const responseText = await analyzeLegalQuery({
        query,
        fileBase64: fileBase64 || undefined,
        fileMimeType: file?.type || undefined
      });

      setResult({
        query,
        response: responseText,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setQuery('');
    setFile(null);
    setFileBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col"
          >
            {/* Minimalist Landing Header */}
            <header className="h-20 border-b border-slate-200 bg-white flex items-center px-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-black tracking-tighter text-slate-800 uppercase">IurisVecino</h1>
              </div>
              <div className="ml-auto hidden md:flex items-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="text-slate-200">/</span>
                <a href="#" className="hover:text-primary">Estatutos</a>
                <span className="text-slate-200">/</span>
                <a href="#" className="hover:text-primary">LPH</a>
                <span className="text-slate-200">/</span>
                <a href="#" className="hover:text-primary">Jurisprudencia</a>
              </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6 bg-slate-50">
              <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-8 py-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-primary text-[10px] font-bold uppercase tracking-widest rounded-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    SISTEMA IURISVECINO IA
                  </div>
                  <h2 className="text-5xl md:text-6xl font-serif font-black text-slate-900 leading-[0.95] tracking-tight">
                    ¿Te está jodiendo <br/> 
                    <span className="text-primary italic">tu vecino?</span>
                  </h2>
                  <p className="text-base text-slate-500 leading-relaxed max-w-md">
                    Analizamos sus estatutos y actas bajo el prisma de la Ley de Propiedad Horizontal para ofrecerle una resolución técnica y neutral.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolución</h4>
                      <p className="text-xs font-semibold text-slate-700">Argumentos basados en jurisprudencia real.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full" />
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documentos</h4>
                      <p className="text-xs font-semibold text-slate-700">Escaneado inteligente de PDF y actas.</p>
                    </div>
                  </div>

                  {/* FORMULARIO DE CONTACTO AUTOMATIZADO CON GOOGLE SHEETS */}
                  <div style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '40px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b', marginBottom: '16px' }}>
                      Solicitud de Consulta Personalizada
                    </h3>
                    <form 
                      action="https://script.google.com/macros/s/AKfycbzMRnFCo3wcZM6We3ijOlcmLKBSX1X5DiZnWykmKSkYVFJ3Cmmg-qc6rUOu_ozfmHE/exec" 
                      method="POST" 
                      target="hidden_iframe"
                      onSubmit={() => { (window as any).submitted = true; }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      <input 
                        type="text" 
                        name="nombre" 
                        placeholder="Nombre completo" 
                        style={{ padding: '10px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '2px', backgroundColor: '#f8fafc', outline: 'none' }} 
                        required 
                      />
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="Correo electrónico" 
                        style={{ padding: '10px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '2px', backgroundColor: '#f8fafc', outline: 'none' }} 
                        required 
                      />
                      <textarea 
                        name="mensaje" 
                        placeholder="Describe detalladamente el problema con tu comunidad..." 
                        style={{ padding: '10px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '2px', backgroundColor: '#f8fafc', outline: 'none', minHeight: '80px', resize: 'none' }} 
                        required 
                      ></textarea>
                      
                      <button 
                        type="submit" 
                        style={{ padding: '12px', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                      >
                        Enviar Caso a la Base de Datos
                      </button>
                    </form>

                    <iframe 
                      name="hidden_iframe" 
                      id="hidden_iframe" 
                      style={{ display: 'none' }} 
                      onLoad={() => {
                        if ((window as any).submitted) {
                          alert('¡Tu consulta ha sido enviada a IurisVecino con éxito!');
                          (window as any).submitted = false;
                          window.location.reload();
                        }
                      }}
                    ></iframe>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-sm p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Consulta Legal</label>
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Describa el conflicto (ej: ruidos, pets, derramas...)"
                      className="w-full h-40 p-5 bg-slate-50 border border-slate-100 rounded-sm focus:ring-0 focus:border-primary transition-all outline-hidden resize-none text-sm text-slate-800 placeholder:text-slate-300 font-medium"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Adjuntar Contexto</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border border-dashed rounded-sm p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3
                        ${file ? 'border-primary bg-blue-50/30' : 'border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white'}`}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.txt" className="hidden" />
                      {file ? (
                        <>
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded flex items-center justify-center shadow-sm">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{file.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-300" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subir Estatutos / Actas</p>
                        </>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-sm flex items-center gap-3 text-red-700 text-xs font-bold uppercase tracking-tight">
                      <FileWarning className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-slate-900 text-white text-xs font-bold py-5 rounded-sm flex items-center justify-center gap-3 hover:bg-slate-800 disabled:opacity-50 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/20 active:translate-y-px"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        EJECUTANDO ANÁLISIS...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        GENERAR DICTAMEN
                      </>
                    )}
                  </button>
                </div>
              </div>
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex overflow-hidden"
          >
            {/* Sidebar Results View */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase">IurisVecino</h1>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reportes de Conflicto</p>
              </div>
              
              <div className="p-6 flex-grow overflow-y-auto space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Documento Analizado</label>
                  {file ? (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-blue-100 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-blue-900 truncate">{file.name}</div>
                        <div className="text-[9px] text-blue-600 font-mono tracking-tighter">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No se adjuntó documentación adicional.</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Consulta Origen</label>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed italic pr-2 border-l-2 border-slate-100 pl-4 py-1">
                    "{result.query}"
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <div className="bg-slate-50 border border-slate-100 rounded p-4">
                      <h5 className="text-[10px] font-bold text-slate-900 mb-2 uppercase flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        Garantía de Rigor
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Este análisis integra la Ley de Propiedad Horizontal vigente y sentencias recientes del Tribunal Supremo.
                      </p>
                   </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100">
                <button
                  onClick={resetAnalysis}
                  className="w-full bg-slate-900 text-white text-[11px] font-bold py-3 rounded-sm text-center hover:bg-slate-800 transition-colors uppercase tracking-widest"
                >
                  NUEVO ANÁLISIS
                </button>
              </div>
            </aside>

            {/* Main Result Content */}
            <main className="flex-grow flex flex-col bg-slate-50 overflow-hidden">
              <header className="h-16 border-b border-slate-200 flex items-center justify-between px-10 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dictamen ID:</span>
                  <span className="text-[10px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded tracking-tighter">
                    PH-{Math.random().toString(36).substring(7).toUpperCase()}
                  </span>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100 tracking-widest uppercase">
                  SISTEMA ONLINE - IA FIABLE
                </div>
              </header>

              <div className="flex-grow overflow-y-auto p-10 pb-32">
                <div className="max-w-4xl mx-auto">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-slate-200 shadow-sm rounded-sm p-12 min-h-[calc(100vh-200px)]"
                  >
                    <div className="markdown-body">
                      <ReactMarkdown>{result.response}</ReactMarkdown>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Sticky Disclaimer Footer */}
              <footer className="bg-white border-t border-slate-200 p-8 fixed bottom-0 left-80 right-0 z-20">
                <div className="max-w-4xl mx-auto flex items-center gap-6">
                  <div className="w-10 h-10 rounded bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                    <FileWarning className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight uppercase font-bold tracking-tight max-w-xl">
                    Este análisis es una asistencia de IA. No constituye un dictamen vinculante. Se recomienda consultar con un abogado colegiado para acciones judiciales.
                  </p>
                  <div className="ml-auto">
                     <button className="px-6 py-3 bg-primary text-white text-[11px] font-bold rounded shadow-sm hover:bg-blue-800 uppercase tracking-widest transition-all hover:-translate-y-px active:translate-y-0">
                       SOLICITAR SEGUNDA OPINIÓN
                     </button>
                  </div>
                </div>
              </footer>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
