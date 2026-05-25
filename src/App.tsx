import React, { useState } from 'react';
import { Scale, FileText, AlertTriangle, Lightbulb, ShieldCheck, Mail, HelpCircle, ArrowRight, Loader2, Sparkles, DollarSign } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeLegalQuery } from './services/gemini';

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para controlar las ventanas emergentes legales (Modales)
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500/30">
      {/* HEADER PREMIUM */}
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 border border-blue-500/20 disabled:border-transparent"
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

          {/* CAJA INFORMATIVA */}
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 items-start">
            <HelpCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">Objetivo de consulta personalizada</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nuestra IA legal ha sido entrenada con la LPH de España y sentencias del Tribunal Supremo para mapear mayorías, impugnaciones y acciones de cesación de forma automatizada.
              </p>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: RESULTADO MAQUETADO */}
        <section className="lg:col-span-7 h-full flex flex-col">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs font-medium text-rose-400 flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 min-h-[500px]">
            {/* CABECERA DEL INFORME SIMULADO */}
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

            {/* CUERPO DEL DICTAMEN EN MARKDOWN */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto prose prose-slate max-w-none text-sm leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-xl prose-h2:text-base prose-h3:text-sm prose-strong:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-blue-500/20 animate-ping absolute"></div>
                    <div className="h-12 w-12 rounded-full border-2 border-t-blue-600 border-r-indigo-500 animate-spin flex items-center justify-center">
                      <Scale className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700">Indexando base de datos jurídica...</p>
                    <p className="text-xs text-slate-400">Analizando normativas aplicables y configurando formato premium</p>
                  </div>
                </div>
              ) : result ? (
                <ReactMarkdown>{result}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-24 text-slate-400">
                  <div className="bg-slate-100 p-4 rounded-2xl text-slate-400 border border-slate-200/60 shadow-inner">
                    <Scale className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <p className="text-sm font-semibold text-slate-700">Esperando consulta legal</p>
                    <p className="text-xs text-slate-400">Introduce los hechos a la izquierda para redactar el pre-dictamen informatizado automatizado.</p>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÓN DE MONETIZACIÓN DEBAJO DEL FOLIO */}
            {result && !loading && (
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 lg:p-5 border-t border-slate-800 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-xl text-blue-400 hidden sm:block">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">¿Deseas emitir este documento oficial?</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Descarga el Dictamen Oficial Certificado con membrete legal en PDF.</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert('¡Simulación de Pasarela de Pagos!\n\nAquí redirigiremos al usuario a tu enlace real de Stripe Checkout por un importe de 19,99 €.')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5 whitespace-nowrap border border-blue-400/20 shrink-0"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  Emitir Documento (19,99€)
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER ADAPTADO CON MODALES ACCESIBLES */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-slate-600" />
            <span>IURISVECINO © 2026. VERSIÓN DE PRUEBAS AUTOMATIZADA.</span>
          </div>
          <div className="flex gap-6 font-medium">
            <button onClick={() => setActiveModal('aviso')} className="hover:text-slate-300 transition focus:outline-none">
              Aviso Legal
            </button>
            <button onClick={() => setActiveModal('privacidad')} className="hover:text-slate-300 transition focus:outline-none">
              Política de Privacidad
            </button>
            <button onClick={() => setActiveModal('terminos')} className="hover:text-slate-300 transition focus:outline-none">
              Términos y Exenciones
            </button>
          </div>
        </div>
      </footer>

      {/* COMPONENTE VENTANA EMERGENTE (MODAL REUTILIZABLE) */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-slate-300 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera del modal */}
            <div className="border-b border-slate-800 p-4 flex items-center justify-between bg-slate-900/50">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                {activeModal === 'aviso' && 'Aviso Legal y Condiciones de Uso'}
                {activeModal === 'privacidad' && 'Política de Privacidad y RGPD'}
                {activeModal === 'terminos' && 'Condiciones de Contratación y Exención de Responsabilidad'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 h-7 w-7 rounded-lg flex items-center justify-center text-sm transition font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto text-sm space-y-4 leading-relaxed">
              {activeModal === 'aviso' && (
                <>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">1. Información del Entorno de Pruebas</p>
                  <p>El presente Sitio Web (<span className="text-blue-400">https://iurisvecino.vercel.app/</span>) opera única y exclusivamente en calidad de plataforma tecnológica y prototipo funcional en fase de validación y desarrollo técnico de mercado (MVP).</p>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">2. Canales de Contacto Directo</p>
                  <p>Para cualquier comunicación, sugerencia, consulta o incidencia relacionada con el funcionamiento técnico de la plataforma, los usuarios pueden dirigirse de forma directa y exclusiva a través del correo electrónico habilitado para el soporte del sistema: <span className="text-white font-medium">iurisvecino.soporte@gmail.com</span>.</p>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">3. Condiciones Generales de Uso</p>
                  <p>El acceso y uso de este portal atribuye la condición de usuario. El usuario se compromete a realizar un uso lícito, diligente y adecuado de las cajas de consulta, comprometiéndose a no introducir intencionadamente datos falsos, abusivos, maliciosos o de carácter injurioso.</p>
                </>
              )}

              {activeModal === 'privacidad' && (
                <>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">1. Finalidad y Tratamiento Automatizado</p>
                  <p>Los datos descriptivos en formato de texto introducidos por los usuarios en la caja de entrada son procesados de forma estrictamente confidencial, automatizada e inmediata. Su único propósito técnico es servir como variables de contexto para estructurar el pre-dictamen informatizado a través de la infraestructura de la API de Google AI Studio.</p>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">2. Seguridad de Datos y No Comercialización</p>
                  <p>Este sistema no almacena registros persistentes de bases de datos indexables con fines publicitarios, perfiles de mercadotecnia ni realiza ningún tipo de cesión comercial de los conflictos planteados a terceras empresas o bufetes de abogados ajenos al proyecto.</p>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">3. Ejercicio de Derechos (ARCO)</p>
                  <p>Al operar como una arquitectura serverless sin almacenamiento masivo de datos de carácter personal identificable, los usuarios pueden solicitar cualquier aclaración o la supresión técnica de notas de soporte escribiendo al correo del sistema: <span className="text-white font-medium">iurisvecino.soporte@gmail.com</span>.</p>
                </>
              )}

              {activeModal === 'terminos' && (
                <>
                  <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">⚠️ Cláusula Imperativa de Exención de Responsabilidad</p>
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 text-slate-300 space-y-2">
                    <p><strong className="text-white">Naturaleza del Informe:</strong> El pre-dictamen, desglose de artículos, semáforos e informes visualizados en la pantalla de la aplicación o descargados a través de la opción simulada de PDF constituyen una simulación informatizada generada de forma 100% automatizada mediante modelos predictivos de Inteligencia Artificial.</p>
                    <p><strong className="text-white">No Sustitución Letrada:</strong> Este servicio automatizado de orientación rápida tiene fines puramente informativos y didácticos. <strong className="text-white underline">No constituye, ni sustituye bajo ningún concepto, el asesoramiento legal personalizado, el dictamen vinculante o la defensa formal en juicio por parte de un abogado colegiado en ejercicio</strong>.</p>
                    <p><strong className="text-white">Ausencia de Responsabilidad:</strong> La plataforma y sus desarrolladores declinan cualquier responsabilidad por decisiones particulares, disputas de comunidad, impagos de cuotas o acciones legales que el usuario decida emprender de forma privada basándose en la lectura de este informe. Para cualquier acción legal vinculante, se recomienda acudir a un abogado colegiado.</p>
                  </div>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">2. Condiciones de Pago Simuladas</p>
                  <p>El importe de la descarga ampliada (19,99 €) está configurado mediante entornos simulados de prueba. Al tratarse de un suministro de contenido digital de consumo instantáneo y ejecución inmediata a petición del usuario, no asiste el derecho de desistimiento una vez el sistema emita el documento definitivo.</p>
                </>
              )}
            </div>

            {/* Pie del modal */}
            <div className="border-t border-slate-800 p-3 flex justify-end bg-slate-900/30 shrink-0">
              <button 
                onClick={() => setActiveModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 px-4 rounded-xl transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
