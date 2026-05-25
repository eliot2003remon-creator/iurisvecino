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
  
  // Estado para los textos legales (Modales)
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
      
      {/* HEADER ORIGINAL */}
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
          /* DISEÑO LANDING ORIGINAL */
          <motion.main 
            key="landing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                <p className="text-slate-500 font-medium leading-relaxed">Analizamos tu caso bajo el marco de la Ley de Propiedad Horizontal y Jurisprudencia del Tribunal
