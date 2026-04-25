import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Code2, Download, Mic, Play, Settings2 } from 'lucide-react';
import { manifestJSON, popupHTML, popupJS, contentJS, backgroundJS, base64Icon, readmeMD } from './extension-files';

export default function App() {
  const generateIconBuffer = (): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64Icon);

        // Fundo arredondado
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(0, 0, 128, 128, 24);
        } else {
            ctx.rect(0, 0, 128, 128); // Fallback
        }
        ctx.fill();

        // Desenhar forma do Microfone
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(44, 24, 40, 56, 20);
        } else {
            ctx.rect(44, 24, 40, 56);
        }
        ctx.fill();
        ctx.beginPath();
        ctx.arc(64, 52, 28, 0, Math.PI, false);
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.fillRect(58, 92, 12, 20);
        ctx.fillRect(44, 112, 40, 8);

        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl.split(',')[1]);
      } catch (err) {
        resolve(base64Icon);
      }
    });
  };

  const downloadExtension = async () => {
    const zip = new JSZip();

    zip.file('manifest.json', manifestJSON);
    zip.file('popup.html', popupHTML);
    zip.file('popup.js', popupJS);
    zip.file('content.js', contentJS);
    zip.file('background.js', backgroundJS);
    zip.file('README.md', readmeMD);
    
    const iconData = await generateIconBuffer();
    zip.file('icon.png', iconData, { base64: true });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'DubAI_Chrome_Extension.zip');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="bg-[#1E293B] border-b border-slate-700 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-5xl mx-auto w-full px-6 h-16 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Mic size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-200 leading-none mt-1">DubAI</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Chrome Extension Builder</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-12 gap-8">
        
        {/* Left Column: Explanations and Download */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#1E293B] shadow-2xl border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold tracking-tight mb-2 text-slate-200">Como funciona?</h2>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed font-medium">
              Esta extensão usa Inteligência Artificial nativa e APIs do navegador para criar uma dublagem em tempo real sobre qualquer vídeo em inglês que você estiver assistindo (por exemplo, no YouTube).
            </p>
            <ul className="text-sm text-slate-400 space-y-3 font-medium">
              <li className="flex gap-3">
                <div className="text-blue-500 shrink-0"><Code2 size={18} /></div>
                <span><strong className="text-slate-200">1. Universal Premium:</strong> Lê legendas oficiais em YouTube, Udemy, Anthropic etc. <b>Novo:</b> Agora detecta as transcrições completas na lateral (DeepLearning.ai, Coursera) sincronizando de forma perfeita e antecipada os tempos de dublagem!</span>
              </li>
              <li className="flex gap-3">
                <div className="text-blue-500 shrink-0"><Settings2 size={18} /></div>
                <span><strong className="text-slate-200">2. Modo Sem IA e Modo API:</strong> Use o "Modo Leitor Nativo" para ler legendas de conteúdo já traduzido, ou ative o "Modo Tradutor" onde os textos em inglês são enviados em lotes (a cada 6s) ao <strong>Gemma 3 / Gemini</strong> minimizando consumo.</span>
              </li>
              <li className="flex gap-3">
                <div className="text-blue-500 shrink-0"><Play size={18} /></div>
                <span><strong className="text-slate-200">3. Sincronia Dinâmica Inteligente:</strong> Quando a locução inicia, o vídeo abaixa o volume. As falas masculinas e femininas foram sintonizadas em fila. Se houver atraso na TTS, a locução acelera de forma fluída e dinâmica para alcançar a imagem!</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-[#1E293B] shadow-2xl border border-slate-700 rounded-xl p-4 text-sm font-medium">
            <span className="text-yellow-500">⚠️</span> <strong className="text-slate-200">Atenção Crítica:</strong> Modificamos a sincronia para evitar conflitos de velocidade e travamentos nos players (como o da Udemy). Lembre-se, <b>ative sempre a legenda (CC) DENTRO do site (no video player)</b>! O Windows Live Captions e Chrome Auto-translate não podem ser lidos pela extensão por bloqueios de segurança. <br/><br/>
            <b>Voz Masculina:</b> Só funcionará se o seu Windows/Mac tiver vozes masculinas em PT-BR instaladas nativamente. Senão, cairá no Google Feminino.
          </div>

          <div className="bg-[#0F172A] border border-slate-700 rounded-xl p-6 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
              <Download size={120} />
            </div>
            
            <h2 className="text-lg font-bold tracking-tight text-slate-200 mb-2 relative z-10">Obter Extensão</h2>
            <p className="text-sm text-slate-400 mb-6 relative z-10 leading-relaxed font-medium">
              Baixe o código-fonte em um pacote ZIP contendo <code className="font-mono text-blue-400">manifest.json</code>, popups e scripts necessários para rodar nativamente no Google Chrome.
            </p>
            
            <button 
              onClick={downloadExtension}
              className="relative z-10 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_15px_rgba(59,130,246,0.8)] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              <Download size={18} />
              Baixar Código Fonte (ZIP)
            </button>
          </div>

          <div className="bg-[#1E293B] shadow-2xl border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold tracking-tight mb-3 text-slate-200">Como instalar no Chrome?</h2>
            <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside marker:text-slate-500 marker:font-bold font-medium">
              <li>Extraia o pacote <b className="text-slate-200">.zip</b> baixado para uma pasta.</li>
              <li>No Chrome, acesse a URL: <code className="bg-[#0F172A] px-1.5 py-0.5 rounded border border-slate-700 text-blue-400 font-mono">chrome://extensions/</code></li>
              <li>Ative o <b className="text-slate-200">Modo do desenvolvedor</b> no canto superior direito.</li>
              <li>Clique em <b className="text-slate-200">Carregar sem compactação</b>.</li>
              <li>Selecione a pasta onde você extraiu os arquivos.</li>
              <li><strong>Importante:</strong> Após instalar, você precisa <strong className="text-blue-400">Recarregar (F5)</strong> a aba do vídeo antes de usar o popup, senão ocorrerá um erro de conexão.</li>
              <li>Pronto! A extensão DubAI aparecerá na sua barra.</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Code Previews */}
        <div className="md:col-span-7 bg-[#1E293B] shadow-2xl border border-slate-700 rounded-xl flex flex-col overflow-hidden">
          <div className="border-b border-slate-700 bg-[#0F172A] px-4 h-12 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 max-w-sm mx-4 bg-[#1E293B] rounded h-7 hidden sm:flex items-center px-3 text-xs text-slate-400 border border-slate-700 justify-center font-mono">
              Arquivos da Extensão
            </div>
            <div className="flex gap-2 invisible">
              <div className="w-3 h-3"></div>
              <div className="w-3 h-3"></div>
              <div className="w-3 h-3"></div>
            </div>
          </div>
          
          <div className="flex-1 p-0 overflow-y-auto max-h-[800px] text-xs">
            {/* Manifest */}
            <div className="bg-black text-slate-300 p-4 font-mono leading-relaxed">
              <div className="text-blue-400 mb-2 select-none border-b border-slate-800 pb-2 font-bold uppercase tracking-widest text-[10px]">📂 manifest.json</div>
              <pre><code>{manifestJSON}</code></pre>
            </div>
            
            {/* Content Script */}
            <div className="bg-black text-slate-300 p-4 font-mono leading-relaxed border-t border-slate-800">
              <div className="text-blue-400 mb-2 select-none border-b border-slate-800 pb-2 font-bold uppercase tracking-widest text-[10px]">📂 content.js</div>
              <pre><code>{contentJS}</code></pre>
            </div>
            
            {/* Background Script */}
            <div className="bg-black text-slate-300 p-4 font-mono leading-relaxed border-t border-slate-800">
              <div className="text-blue-400 mb-2 select-none border-b border-slate-800 pb-2 font-bold uppercase tracking-widest text-[10px]">📂 background.js</div>
              <pre><code>{backgroundJS}</code></pre>
            </div>
            
            {/* Popup HTML */}
            <div className="bg-black text-slate-300 p-4 font-mono leading-relaxed border-t border-slate-800">
              <div className="text-blue-400 mb-2 select-none border-b border-slate-800 pb-2 font-bold uppercase tracking-widest text-[10px]">📂 popup.html</div>
              <pre><code>{popupHTML}</code></pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

