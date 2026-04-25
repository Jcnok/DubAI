export const manifestJSON = `{
  "manifest_version": 3,
  "name": "DubAI - Dublagem em Tempo Real",
  "version": "1.3.0",
  "description": "Lê as legendas dinamicamente, traduz usando a API do Gemini e dubla os vídeos.",
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon.png",
      "48": "icon.png",
      "128": "icon.png"
    }
  },
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": [
        "content.js"
      ]
    }
  ]
}`;

export const popupHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DubAI Chrome Extension</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      width: 320px;
      margin: 0;
      padding: 16px;
      background-color: #f9fafb;
      color: #111827;
    }
    h2 {
      margin-top: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #3b82f6; /* Blue 500 */
      display: flex;
      align-items: center;
      gap: 8px;
    }
    label {
      display: block;
      margin-top: 12px;
      margin-bottom: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    input[type="text"], input[type="password"] {
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
    }
    select {
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-top: 4px;
    }
    input[type="range"] {
      width: 100%;
      margin-top: 4px;
    }
    .value-display {
      font-size: 0.75rem;
      color: #6b7280;
      float: right;
    }
    .btn {
      width: 100%;
      padding: 10px;
      margin-top: 16px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      color: white;
      transition: background-color 0.2s;
    }
    .btn-start { background-color: #3b82f6; }
    .btn-start:hover { background-color: #2563eb; }
    .btn-stop { background-color: #ef4444; display: none; }
    .btn-stop:hover { background-color: #dc2626; }
    .footer {
      margin-top: 16px;
      font-size: 0.75rem;
      color: #9ca3af;
      text-align: center;
    }
    .cc-alert {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 0.75rem;
      padding: 8px;
      border-radius: 6px;
      margin-top: 12px;
      font-weight: 500;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <h2>🎙️ DubAI (v1.2)</h2>
  <p style="font-size: 0.875rem; color: #4b5563; margin-top: -8px;">Transcriação Dinâmica</p>

  <label for="opMode">Modo de Operação</label>
  <select id="opMode">
    <option value="translate">Tradutor IA (Requer ApiKey)</option>
    <option value="read">Leitor Nativo (Sem API)</option>
  </select>

  <div id="apiKeyContainer">
    <label for="apiKey">Gemini API Key</label>
    <input type="password" id="apiKey" placeholder="Sua chave do Google Gemini">
  </div>

  <label for="voicePref">Locutor</label>
  <select id="voicePref">
    <option value="female">Feminina (Padrão)</option>
    <option value="male">Masculina</option>
  </select>

  <label for="speed">Velocidade <span id="speedVal" class="value-display">1.1x</span></label>
  <input type="range" id="speed" min="0.5" max="2.0" step="0.1" value="1.1">

  <label for="pitch">Tom de Voz <span id="pitchVal" class="value-display">1.0</span></label>
  <input type="range" id="pitch" min="0.1" max="2.0" step="0.1" value="1.0">

  <label style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; cursor: pointer; font-size: 0.8rem; background: #e5e7eb; padding: 6px; border-radius: 4px;">
    <input type="checkbox" id="useSync" checked style="width: auto; margin: 0;">
    Sincronização Forçada (Pausa o Vídeo)
  </label>

  <div class="cc-alert">
    ⚠️ <strong>Dica:</strong> Ative a legenda do player nativo do vídeo para podermos ler!
  </div>

  <button id="btnStart" class="btn btn-start">Iniciar Dublagem</button>
  <button id="btnStop" class="btn btn-stop">Parar Dublagem</button>
  <button id="btnDownload" class="btn" style="display: none; background: #4b5563; margin-top: 8px;">📥 Baixar Transcrição</button>

  <div class="footer">O download direto de áudio nativo não é suportado pelos navegadores, mas você pode baixar o texto.</div>

  <script src="popup.js"></script>
</body>
</html>`;

export const popupJS = `document.addEventListener('DOMContentLoaded', () => {
  const opModeSelect = document.getElementById('opMode');
  const voicePrefSelect = document.getElementById('voicePref');
  const apiKeyInput = document.getElementById('apiKey');
  const apiKeyContainer = document.getElementById('apiKeyContainer');
  const speedInput = document.getElementById('speed');
  const pitchInput = document.getElementById('pitch');
  const speedVal = document.getElementById('speedVal');
  const pitchVal = document.getElementById('pitchVal');
  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');
  const btnDownload = document.getElementById('btnDownload');
  const useSyncCheckbox = document.getElementById('useSync');

  function triggerUpdate() {
    chrome.storage.local.get(['isDubbing'], async (res) => {
      if (res.isDubbing) {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (tab && tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            opMode: opModeSelect.value,
            voicePref: voicePrefSelect.value,
            speed: parseFloat(speedInput.value),
            pitch: parseFloat(pitchInput.value),
            useSync: useSyncCheckbox.checked
          });
        }
      }
    });
  }

  // Toggle API key visibility based on mode
  opModeSelect.addEventListener('change', () => {
    if (opModeSelect.value === 'read') {
      apiKeyContainer.style.display = 'none';
      pitchInput.parentElement.style.display = 'block'; // Ensure pitch is visible
    } else {
      apiKeyContainer.style.display = 'block';
    }
  });

  // Carregar dados salvos
  chrome.storage.local.get(['opMode', 'voicePref', 'geminiApiKey', 'dubSpeed', 'dubPitch', 'isDubbing', 'useSync'], (res) => {
    if (res.useSync !== undefined) useSyncCheckbox.checked = res.useSync;
    if (res.opMode) {
        opModeSelect.value = res.opMode;
        opModeSelect.dispatchEvent(new Event('change'));
    }
    if (res.voicePref) voicePrefSelect.value = res.voicePref;
    if (res.geminiApiKey) apiKeyInput.value = res.geminiApiKey;
    if (res.dubSpeed) {
      speedInput.value = res.dubSpeed;
      speedVal.innerText = res.dubSpeed + 'x';
    }
    if (res.dubPitch) {
      pitchInput.value = res.dubPitch;
      pitchVal.innerText = res.dubPitch;
    }
    if (res.isDubbing) {
      btnStart.style.display = 'none';
      btnStop.style.display = 'block';
      btnDownload.style.display = 'block';
    }
  });

  // Atualizar visualização dos sliders
  speedInput.addEventListener('input', (e) => speedVal.innerText = e.target.value + 'x');
  pitchInput.addEventListener('input', (e) => pitchVal.innerText = e.target.value);
  
  speedInput.addEventListener('change', triggerUpdate);
  pitchInput.addEventListener('change', triggerUpdate);
  voicePrefSelect.addEventListener('change', triggerUpdate);
  useSyncCheckbox.addEventListener('change', triggerUpdate);

  btnDownload.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab && tab.id) {
       chrome.tabs.sendMessage(tab.id, { action: 'getTranscript' }, (response) => {
          if (response && response.transcript) {
             const blob = new Blob([response.transcript], { type: 'text/plain' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = 'transcricao_dubAI.txt';
             a.click();
             URL.revokeObjectURL(url);
          } else {
             alert('Nenhuma transcrição encontrada ainda.');
          }
       });
    }
  });

  // Iniciar Dublagem
  btnStart.addEventListener('click', async () => {
    const opMode = opModeSelect.value;
    const voicePref = voicePrefSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const speed = parseFloat(speedInput.value);
    const pitch = parseFloat(pitchInput.value);

    if (opMode === 'translate' && !apiKey) {
      alert("Por favor, insira uma API Key do Gemini no Modo Tradutor.");
      return;
    }

    const payload = {
      action: 'start',
      opMode,
      voicePref,
      apiKey,
      speed,
      pitch
    };

    chrome.storage.local.set({
      opMode,
      voicePref,
      geminiApiKey: apiKey,
      dubSpeed: speed,
      dubPitch: pitch,
      useSync: useSyncCheckbox.checked,
      isDubbing: true
    });

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab && tab.id) {
      try {
        // Tenta injetar o content script na aba atual caso já não esteja (página antiga aberta antes da instalação)
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }).catch(e => console.log('Script injection info:', e));

        await chrome.tabs.sendMessage(tab.id, payload);
        btnStart.style.display = 'none';
        btnStop.style.display = 'block';
        btnDownload.style.display = 'block';
      } catch (err) {
        alert("Erro: O Chrome bloqueou a conexão. Abra um vídeo normal ou recarregue a aba (F5) e tente novamente.");
        chrome.storage.local.set({ isDubbing: false });
        console.error("Connection error:", err);
      }
    }
  });

  // Parar Dublagem
  btnStop.addEventListener('click', async () => {
    chrome.storage.local.set({ isDubbing: false });
    
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab && tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'stop' });
      } catch (err) {
        console.error("Connection error:", err);
      }
    }

    btnStop.style.display = 'none';
    btnDownload.style.display = 'none';
    btnStart.style.display = 'block';
  });
});`;

export const contentJS = `// Evita re-declaração de variáveis caso o script seja injetado mais de uma vez
if (typeof window.hasDubAIListener === 'undefined') {
  window.hasDubAIListener = true;

  let isDubbing = false;
  let opMode = 'translate';
  let voicePref = 'female';
  let useSync = true;
  let apiKey = '';
  let fullTranscript = "";
  let dubSpeed = 1.15;
  let dubPitch = 1.0;
  let originalVolume = 1.0;
  let originalPlaybackRate = 1.0;

  let masterCaptionString = "";
  let lastProcessedIndex = 0;
  let domObserver;
  let translationInterval;
  let ttsQueueCount = 0;
  
  // Transcrição Prévia (DeepLearning.ai / Coursera)
  let isUsingPreTranscript = false;
  let preTranscriptCues = [];
  let lastSpokenCueIdx = -1;
  let timeUpdateListener = null;

  let appOverlay = null;

  function showStatus(msg, isError = false) {
    if (!appOverlay) {
        appOverlay = document.createElement('div');
        appOverlay.style.position = 'fixed';
        appOverlay.style.top = '20px';
        appOverlay.style.right = '20px';
        appOverlay.style.zIndex = '2147483647';
        appOverlay.style.padding = '10px 16px';
        appOverlay.style.borderRadius = '8px';
        appOverlay.style.fontFamily = 'sans-serif';
        appOverlay.style.fontSize = '14px';
        appOverlay.style.fontWeight = 'bold';
        appOverlay.style.pointerEvents = 'none';
        appOverlay.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        document.body.appendChild(appOverlay);
    }
    appOverlay.style.background = isError ? '#ef4444' : '#3b82f6';
    appOverlay.style.color = '#fff';
    appOverlay.innerText = "🎙️ DubAI: " + msg;
  }

  function hideStatus() {
     if (appOverlay) {
         appOverlay.remove();
         appOverlay = null;
     }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'start') {
      opMode = request.opMode || 'translate';
      voicePref = request.voicePref || 'female';
      useSync = request.useSync !== false; // default true
      apiKey = request.apiKey;
      dubSpeed = request.speed;
      dubPitch = request.pitch;
      isDubbing = true;
      startDubbing();
      sendResponse({ status: "started" });
    } else if (request.action === 'stop') {
      isDubbing = false;
      stopDubbing();
      sendResponse({ status: "stopped" });
    } else if (request.action === 'updateSettings') {
      opMode = request.opMode;
      voicePref = request.voicePref;
      useSync = request.useSync !== false;
      dubSpeed = request.speed;
      dubPitch = request.pitch;
      sendResponse({ status: "updated" });
    } else if (request.action === 'getTranscript') {
      sendResponse({ transcript: fullTranscript });
    }
    return true; 
  });

  function mergeCaptions(oldText, newText) {
    if (!oldText) return newText;
    if (!newText) return oldText;
    
    const oldEnding = oldText.length > 200 ? oldText.slice(-200) : oldText;
    let overlap = 0;
    let minLen = Math.min(oldEnding.length, newText.length);
    
    for (let i = minLen; i > 0; i--) {
        if (oldEnding.endsWith(newText.substring(0, i))) {
            overlap = i;
            break;
        }
    }
    
    if (overlap === 0) return oldText + ' ' + newText;
    return oldText + newText.substring(overlap);
  }

  function extractFullTranscript() {
        let lines = document.body.innerText.split('\\n').map(l => l.trim());
        let tempCues = [];
        let lastTime = -1;
        let currentText = [];
        const timeRegexExact = /^\\[?(\\d{1,2}):(\\d{2})(?::(\\d{2}))?\\]?$/;
        const timeRegexInline = /^\\[?(\\d{1,2}):(\\d{2})(?::(\\d{2}))?\\]?\\s+(.*)$/;

        const parseT = (m) => {
            let p1 = parseInt(m[1]), p2 = parseInt(m[2]);
            return m[3] ? p1*3600 + p2*60 + parseInt(m[3]) : p1*60 + p2;
        };

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (!line) continue;
            
            let exactMatch = line.match(timeRegexExact);
            if (exactMatch) {
               if (lastTime >= 0 && currentText.length > 0) {
                   tempCues.push({ time: lastTime, text: currentText.join(' ').trim() });
               }
               currentText = [];
               lastTime = parseT(exactMatch);
               continue;
            }
            
            let inlineMatch = line.match(timeRegexInline);
            if (inlineMatch) {
               if (lastTime >= 0 && currentText.length > 0) {
                   tempCues.push({ time: lastTime, text: currentText.join(' ').trim() });
               }
               currentText = [inlineMatch[4]];
               lastTime = parseT(inlineMatch);
               continue;
            }

            if (lastTime >= 0) {
               // Limpa sujeira de tempo no meio do texto (ex: NoteGPT)
               let cleanLine = line.replace(/\\[?\\b\\d{1,2}:\\d{2}(?::\\d{2})?\\b\\]?/g, '').replace(/\\s+/g, ' ').trim();
               if (cleanLine) currentText.push(cleanLine);
            }
        }
        if (lastTime >= 0 && currentText.length > 0) {
            tempCues.push({ time: lastTime, text: currentText.join(' ').trim() });
        }
        
        let validCues = [];
        let seenTimes = new Set();
        let prevTime = -1;
        
        for (let cue of tempCues) {
            if (cue.text.length < 2) continue;
            // Verifica se a sequência faz sentido (tempo aumenta sequencialmente)
            if (cue.time > prevTime && cue.time < prevTime + 600) {
                if (!seenTimes.has(cue.time)) {
                    seenTimes.add(cue.time);
                    validCues.push({ ...cue, translatedText: null, translating: false });
                } else {
                    validCues[validCues.length-1].text += " " + cue.text;
                }
                prevTime = cue.time;
            } else if (validCues.length === 0) {
                seenTimes.add(cue.time);
                validCues.push({ ...cue, translatedText: null, translating: false });
                prevTime = cue.time;
            }
        }
        
        // Exige pelo menos 6 frases válidas sequenciais pra assumir que é um transcript estruturado real
        if (validCues.length > 5) {
            return validCues;
        }
        return [];
  }

  function startDubbing() {
    const video = document.querySelector('video');
    if (!video) {
      alert('Nenhum vídeo encontrado na página atual.');
      chrome.storage.local.set({ isDubbing: false });
      return;
    }

    showStatus("Aguardando ativação das legendas...");
    originalVolume = video.volume;
    originalPlaybackRate = video.playbackRate;
    masterCaptionString = "";
    fullTranscript = "";
    lastProcessedIndex = 0;
    ttsQueueCount = 0;

    preTranscriptCues = extractFullTranscript();
    if (preTranscriptCues.length > 5) {
        isUsingPreTranscript = true;
        showStatus("🎓 Transcrição Oficial Detectada (" + preTranscriptCues.length + " blocos)", false);
        lastSpokenCueIdx = -1;
        
        const handleTimeUpdate = () => {
            if (!isDubbing) return;
            const video = document.querySelector('video');
            if (!video) return;
            
            let currentCueIdx = preTranscriptCues.findIndex((c, i, arr) => 
                video.currentTime >= c.time && (i === arr.length-1 || video.currentTime < arr[i+1].time)
            );
            
            if (currentCueIdx !== -1 && currentCueIdx !== lastSpokenCueIdx) {
                 lastSpokenCueIdx = currentCueIdx;
                 let cue = preTranscriptCues[currentCueIdx];
                 
                 let textToSpeak = opMode === 'read' ? cue.text : (cue.translatedText || cue.text);
                 
                 // Fallback translation if not pre-translated yet and using translate mode
                 if (opMode === 'translate' && !cue.translatedText) {
                     triggerTranslation(cue.text);
                 } else {
                     showStatus(\`Legenda: \${currentCueIdx+1}/\${preTranscriptCues.length}\`, false);
                     speakPortuguese(textToSpeak);
                 }
            }
        };

        const translateAhead = () => {
            if (opMode !== 'translate' || !apiKey) return;
            const video = document.querySelector('video');
            if (!video) return;
            
            let currentIdx = preTranscriptCues.findIndex((c, i, arr) => 
                video.currentTime >= c.time && (i === arr.length-1 || video.currentTime < arr[i+1].time)
            );
            if (currentIdx === -1) currentIdx = 0;
            
            let toTranslate = preTranscriptCues.slice(currentIdx, currentIdx + 8).filter(c => !c.translatedText && !c.translating);
            if (toTranslate.length === 0) return;
            
            toTranslate.forEach(c => c.translating = true);
            
            let payload = toTranslate.map(c => \`[ID_\${c.time}] \${c.text}\`).join('\\n');
            
            chrome.runtime.sendMessage({
               action: 'translateText',
               text: payload,
               apiKey: apiKey,
               isPreTranscript: true
            }, (response) => {
               if (response && response.translated) {
                   let lines = response.translated.split('\\n');
                   lines.forEach(line => {
                       let m = line.match(/\\[ID_(\\d+)\\]\\s*(.*)/);
                       if (m) {
                           let time = parseInt(m[1]);
                           let tCue = preTranscriptCues.find(c => c.time === time);
                           if (tCue) {
                               tCue.translatedText = m[2].trim();
                               tCue.translating = false;
                           }
                       }
                   });
               } else {
                   toTranslate.forEach(c => c.translating = false);
               }
            });
        };
        
        timeUpdateListener = handleTimeUpdate;
        video.addEventListener('timeupdate', timeUpdateListener);
        if (opMode === 'translate') {
            translationInterval = setInterval(translateAhead, 3000);
            translateAhead();
        }
        return; // skips mutation observer logic entirely
    }

    domObserver = new MutationObserver(() => {
      // .ytp-caption-window-container = YouTube
      // .captions-text = Generic
      // [data-purpose="captions-cue-text"] = Udemy
      // .vjs-text-track-display, .vjs-text-track-cue = Video.js
      // .plyr__captions = Plyr
      // .shaka-text-wrapper, .shaka-text-container = Shaka Player
      // .jw-text-track-display = JWPlayer
      const ytContainer = document.querySelector('.ytp-caption-window-container, .captions-text, [data-purpose="captions-cue-text"], .vjs-text-track-display, .vjs-text-track-cue, .plyr__captions, .shaka-text-wrapper, .shaka-text-container, .jw-text-track-display');
      if (ytContainer) {
          let currentCaptions = ytContainer.innerText.replace(/\\n/g, ' ').replace(/\\s+/g, ' ').trim();
          if (currentCaptions && !masterCaptionString.endsWith(currentCaptions)) {
              masterCaptionString = mergeCaptions(masterCaptionString, currentCaptions);
              checkAndTriggerTranslation();
          }
      }
      
      if (video && video.textTracks) {
           for (let i = 0; i < video.textTracks.length; i++) {
               let activeCues = video.textTracks[i].activeCues;
               if (activeCues && activeCues.length > 0) {
                   let cueText = Array.from(activeCues).map(c => c.text).join(' ').replace(/\\n/g, ' ').replace(/\\s+/g, ' ').trim();
                   if (cueText && !masterCaptionString.endsWith(cueText)) {
                       masterCaptionString = mergeCaptions(masterCaptionString, cueText);
                       checkAndTriggerTranslation();
                   }
               }
           }
      }
    });

    domObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

    // Fallback: traduz cada 6 segundos caso não haja pontuação no texto para engatilhar
    translationInterval = setInterval(() => {
      let textToProcess = masterCaptionString.substring(lastProcessedIndex).trim();
      if (textToProcess.length > 5) {
        triggerTranslation(textToProcess);
      }
    }, 6000); 
  }

  function checkAndTriggerTranslation() {
      let unprocessed = masterCaptionString.substring(lastProcessedIndex).trim();
      if (unprocessed.length > 25 && /[.?!]$/.test(unprocessed)) {
          triggerTranslation(unprocessed);
      } else if (unprocessed.length > 80 || (unprocessed.length > 40 && (!document.querySelector('video') || document.querySelector('video').paused))) {
          triggerTranslation(unprocessed);
      }
  }

  function triggerTranslation(text) {
      lastProcessedIndex = masterCaptionString.length;
      
      if (opMode === 'read') {
          showStatus("Lendo legenda (Sem API)...", false);
          fullTranscript += text + "\\n\\n";
          speakPortuguese(text);
          return;
      }
      
      showStatus("Traduzindo bloco...", false);
      
      chrome.runtime.sendMessage({
         action: 'translateText',
         text: text,
         apiKey: apiKey
      }, (response) => {
         if (chrome.runtime.lastError) {
             showStatus("Erro de Rede", true);
             return;
         }
         if (response && response.translated) {
             fullTranscript += response.translated + "\\n\\n";
             speakPortuguese(response.translated);
         } else if (response && response.error) {
             if (response.error.includes("429")) {
                showStatus("Limite da API Atingido (Aguarde...)", true);
             } else {
                showStatus("Erro na API", true);
                console.error("DubAI API Error:", response.error);
             }
         }
      });
  }

  function stopDubbing() {
    if (domObserver) domObserver.disconnect();
    if (translationInterval) clearInterval(translationInterval);
    if (timeUpdateListener) {
        const video = document.querySelector('video');
        if (video) video.removeEventListener('timeupdate', timeUpdateListener);
        timeUpdateListener = null;
    }
    isUsingPreTranscript = false;
    window.speechSynthesis.cancel();
    hideStatus();
    
    const video = document.querySelector('video');
    if (video) {
      video.volume = originalVolume; 
    }
  }

  function speakPortuguese(text) {
    const cleanText = text.replace(/\\*\\*|\\*|\\_|\\#|\\"/g, '').replace(/\\[?\\b\\d{1,2}:\\d{2}(?::\\d{2})?\\b\\]?/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    
    let currentRate = parseFloat(dubSpeed) || 1.15;
    if (ttsQueueCount > 0 && useSync) {
        // Acelera se tiver muita coisa na fila pra tentar alcançar
        currentRate = Math.min(2.5, currentRate * 1.25);
    }
    utterance.rate = currentRate;
    utterance.pitch = parseFloat(dubPitch) || 1.0;
    
    let voices = window.speechSynthesis.getVoices();
    let ptVoices = voices.filter(v => v.lang.startsWith('pt'));
    if (ptVoices.length === 0) ptVoices = voices; // fallback
    
    let chosenVoice = null;

    if (voicePref === 'male') {
       // Prioridade masculina (Microsoft Thiago ou Antonio)
       chosenVoice = ptVoices.find(v => v.name.includes('Antonio') || v.name.includes('Thiago') || v.name.includes('Daniel') || v.name.toLowerCase().includes('male'));
    } else {
       // Prioridade absoluta feminina na voz do Google (a melhor)
       chosenVoice = ptVoices.find(v => v.name.includes('Google') && v.lang === 'pt-BR');
    }
    
    if (!chosenVoice) { 
       chosenVoice = ptVoices.find(v => v.name.includes('Francisca') || v.name.toLowerCase().includes('female')) || ptVoices[0];
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onstart = () => {
      const video = document.querySelector('video');
      if (video) {
        if (video.volume > 0.1) originalVolume = video.volume;
        video.volume = Math.max(0.05, originalVolume * 0.15); 
      }
      showStatus("Falando...", false);
    };

    utterance.onend = () => {
      ttsQueueCount = Math.max(0, ttsQueueCount - 1);
      const video = document.querySelector('video');
      if (video && ttsQueueCount === 0) {
        video.volume = originalVolume; 
        if (useSync && video.paused && isDubbing && video.dataset.dubPaused === "true") {
            video.play();
            video.dataset.dubPaused = "false";
        }
        showStatus("Lendo legendas...", false);
      }
    };

    utterance.onerror = () => {
      ttsQueueCount = Math.max(0, ttsQueueCount - 1);
    };

    ttsQueueCount++;
    
    const video = document.querySelector('video');
    // Forçar pausa inteligente se tiver fila acumulando e sincronia ativada
    if (useSync && ttsQueueCount > 1 && video && !video.paused) {
        video.pause();
        video.dataset.dubPaused = "true";
        showStatus("Sincronizando (Vídeo Pausado)...", false);
        
        let waitInt = setInterval(() => {
            if (ttsQueueCount <= 1 || !isDubbing) {
                if (video.paused && isDubbing && video.dataset.dubPaused === "true") {
                    video.play();
                    video.dataset.dubPaused = "false";
                }
                clearInterval(waitInt);
            }
        }, 500);
    }
    
    window.speechSynthesis.speak(utterance);
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
} // Fim da guarda de escopo
`;

export const backgroundJS = `chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translateText') {
    handleTranslation(request.text, request.apiKey, request.isPreTranscript)
      .then(result => sendResponse({ translated: result }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Asynchronous mode
  }
});

async function handleTranslation(text, apiKey, isPreTranscript) {
  // Modelos ordenados do maior capacidade (e free quota alta se disponível) para o menor
  const modelsToTry = [
      'gemma-3-27b-it', // Lançamento recente (alta quota possível)
      'gemini-3.1-flash-lite', 
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp' // fallback extremo
  ];
  let lastError = null;

  const systemPrompt = isPreTranscript 
      ? "Você é um tradutor. Traduza o texto a seguir do inglês para o Português e RETORNE MANTENDO A EXATA MARCAÇÃO [ID_NUMERO] no Início de CADA Frase original! Mantenha a mesma quantidade de IDs.\\n\\nTexto:\\n" + text
      : "Você atua como um tradutor de legendas contínuas em tempo real. Traduza o trecho a seguir do inglês para o português. O tom deve ser natural, casual e dinâmico. Retorne APENAS a tradução em texto simples, sem aspas. Não adicione emojis ou notas. Texto: " + text;

  for (const modelName of modelsToTry) {
     const url = \`https://generativelanguage.googleapis.com/v1beta/models/\${modelName}:generateContent?key=\${apiKey}\`;
     
     try {
       const response = await fetch(url, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           contents: [{
             parts: [
               { text: systemPrompt }
             ]
           }],
           generationConfig: {
              temperature: 0.3, // Menos alucinação
           }
         })
       });

       if (response.ok) {
          const data = await response.json();
          const textOut = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (textOut) return textOut;
       } else {
          lastError = new Error(\`HTTP \${response.status}\`);
          if (response.status === 429 || response.status === 404) {
             console.warn(\`Model \${modelName} rate limited (429) or not found (404), trying next...\`);
             continue; // Tenta o próximo modelo
          }
       }
     } catch(e) {
        lastError = e;
     }
  }

  throw lastError || new Error("Nenhum modelo disponível para traduzir o texto (Limites atingidos ou erro)");
}
`;

export const base64Icon = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfqAw0UDjB65+a4AAABkklEQVRYw+2ZMW7CQBBF/xY06SgFUkWKNAk1JSeg5AA0nICSA3AAEqroOAUSFSVEUqQI0qSjdYBEkZDAXuy1ZyeR1i//vB3tf8bjm13jAgvESABIQoI5Jphghq3y/2xLijXmmCCRoO+qNwxQYYYV1igB8AHgB4BfAKyy/mEDF1gAAZAAkKCFY5xjvI2Z21xggTmWmGGAX2ywxxFHHKPCHEPMMcYRRxzxv8RsgAIGDDEfE0wxQYlZhngVbICfASZYwF12qLDDBb71/v8v0AE9+s+5p0aNGjVq1BjhAQ+49HjAQY0aNWrUqLEHAgxwwAG2uKNEiRY2b4NngH5M4S/AEyDDKHwT1Bzwz9kAf+yCmkO+L9Ac8A7qDngOdQe8gpoDnkDdAa+g5oA3UHPAF6g74BXUHPAF6g74AnUHXIPmXmAGNAc8g5oDXkHdAc+h7oBXUHPAG6g54AvUHfAKag74AnUHXIPmXmAG9NwLvIKae4E3UHMv8AVq7gVeQc29wBeouRdoA/z/i/K0wT8A/X3w1Q73Y+EAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjYtMDMtMTNUMjA6MTQ6MTArMDA6MDCh2KjPAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI2LTAzLTEzVDIwOjE0OjQ4KzAwOjAwv4/dIgAAAABJRU5ErkJggg==";

export const readmeMD = `<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/mic.svg" width="80" alt="DubAI Logo" />
  <h1>🎙️ DubAI</h1>
  <p><strong>Dublagem de Vídeo em Tempo Real Diretamente no Navegador</strong></p>

  <p>
    <a href="https://juliookuda.github.io/dubai-extension/"><img alt="Site Oficial" src="https://img.shields.io/badge/Site_Oficial-GitHub_Pages-2ea44f?style=flat-square&logo=github&logoColor=white" /></a>
    <img alt="Chrome Extension" src="https://img.shields.io/badge/Chrome_Extension-v1.3.0-4285F4?style=flat-square&logo=google-chrome&logoColor=white" />
    <img alt="Gemini Integration" src="https://img.shields.io/badge/Powered_by-Gemini_&_Gemma-1A73E8?style=flat-square&logo=googlebard&logoColor=white" />
    <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-success?style=flat-square" />
    <img alt="License MIT" src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
    <img alt="Vanilla JS" src="https://img.shields.io/badge/Vanilla-JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  </p>
</div>

---

O **DubAI** é uma extensão inteligente e *open-source* para Google Chrome capaz de extrair legendas dinâmicas de plataformas de vídeo (YouTube, Udemy, Coursera, DeepLearning.ai, Anthropic) e gerar uma dublagem sintetizada hiper-realista em Português-BR. Tudo isso em tempo real, utilizando a API do Google ("Gemma 3" ou "Gemini Flash") e algoritmos avançados de sincronização de fala.

Seja para estudar tutoriais complexos ou acompanhar palestras internacionais, o DubAI quebra a barreira do idioma sem os custos proibitivos de plataformas fechadas.

## 📑 Índice
- [🌐 Acesso Rápido](#-acesso-rápido)
- [🌟 Principais Recursos](#-principais-recursos)
- [📦 Como Instalar (Modo Desenvolvedor)](#-como-instalar-modo-desenvolvedor)
- [⚙️ Como Usar na Prática](#%EF%B8%8F-como-usar-na-prática)
- [🗂️ Estrutura do Projeto](#-estrutura-do-projeto)
- [🧠 Arquitetura e Fluxo (Mermaid)](#-arquitetura-e-fluxo)
- [🛡️ Privacidade e Segurança](#%EF%B8%8F-privacidade-e-segurança)
- [🤝 Como Contribuir](#-como-contribuir)
- [📝 Licença](#-licença)
- [📫 Contato](#-contato)

---

## 🌐 Acesso Rápido
👉 **[Acesse o Site Oficial (GitHub Pages) do Projeto para Download da Extensão Pronta](https://juliookuda.github.io/dubai-extension/)**

---

## 🌟 Principais Recursos

- **Tradução com IA Otimizada:** Envia blocos de texto contextuais para preservar precisão na tradução, suportando a nova família *Gemma 3* e a API padrão do *Gemini*.
- **Leitor Nativo (Zero Custo):** Permite dublagem de legendas já traduzidas pelas próprias plataformas, usando apenas a síntese de voz offline do sistema.
- **Detecção Avançada (Pre-Transcript):** Localiza e detecta transcrições completas da barra lateral em estruturas de LMS (ex: Coursera, DeepLearning.ai). Isso faz o carregamento prévio da tradução impedindo falhas de buffer em cursos técnicos acelerados.
- **Sincronização Dinâmica Inteligente:** A IA acelera matematicamente ou pausa momentaneamente o player do seu vídeo para garantir que a imagem não atropele a locução narrativa.
- **Audio Ducking Customizado:** O volume original do vídeo é reduzido automaticamente (*ducking*) enquanto o DubAI fala, e volta ao normal imediatamente nos silêncios.
- **Download de Transcrições:** Compile a transcrição inteira do vídeo do momento, gerando um \`.txt\` ideal para consultas com LLMs locais de estudo.

---

## 📦 Como Instalar (Modo Desenvolvedor)

A DubAI ainda não está listada na Chrome Web Store. Para utilizá-la gratuitamente, você deve fazer o download do pacote oficial:

1. **Baixe o pacote:** Acesse o [Site Oficial do projeto](https://juliookuda.github.io/dubai-extension/), clique no botão azul **"Download Extensão (.zip)"**.
2. **Extraia os arquivos:** Extraia o conteúdo deste arquivo \`.zip\` para uma **pasta fixa** no seu computador (uma pasta que você não vá apagar depois).
3. **Abra as extensões:** Abra o Google Chrome e digite na barra de endereços: \`chrome://extensions/\`.
4. **Habilite permissões:** No canto superior direito, ative a chave **Modo do Desenvolvedor** (Developer mode).
5. **Carregue o pacote:** Clique no botão **Carregar sem compactação** (Load unpacked) no canto superior esquerdo.
6. **Selecione a pasta:** Escolha a pasta raiz onde você acabou de extrair os arquivos (a pasta que contém o arquivo \`manifest.json\`).
7. **Pronto:** O ícone do DubAI aparecerá na sua barra de extensões superior. Fixe-o no painel para acesso rápido.

**🚨 Segurança Crítica:** Imediatamente após a instalação, acesse a página de qualquer vídeo online e **atualize a página (pressione F5)**. Isso é necessário para inicializar a barreira de comunicação do Google Chrome (\`Service Worker Messaging\`) de forma orgânica.

---

## ⚙️ Como Usar na Prática

1. **Configuração da API:** Clique no ícone 🎙️ na barra do navegador. Altere o "Modo de Operação" para **Tradutor IA**. Informe a sua [Google AI Studio API Key](https://aistudio.google.com/app/apikey) (é seguro, fica no armazenamento local Chrome).
2. **Ative a Legenda no Vídeo:** Acesse o player (YouTube, Udemy, etc.) e ative a opção **CC (Closed Captions) / Legendas do Áudio Original**. O DubAI *lê as engrenagens da web*, então precisa que a legenda esteja aparecendo (mesmo que você depois a oculte via CSS, o elemento deve existir no DOM).
3. **Inicie a Magia:** Clique em **Iniciar Dublagem** na janela da extensão. 
4. **Personalize a Fala:** Ajuste *Tradução*, *Tom de Voz* e escolha uma *Voz Masculina/Feminina* baseada no catálogo do seu Sistema Operacional.

---

## 🗂️ Estrutura do Projeto

O código do DubAI segue as boas práticas do Manifest V3 do Google, separando as lógicas de forma limpa:

\`\`\`text
├── manifest.json       # O "coração" da extensão. Define permissões (activeTab, storage) e os scripts
├── popup.html          # Interface do usuário (janela que abre ao clicar no ícone)
├── popup.js            # Lógica que controla a UI da extensão, botões, e salva preferências
├── popup.css           # Estilos e design Minimalista (Aparência, cores, botões)
├── content.js          # Injetado na página do vídeo. Fica "escutando" as legendas no DOM e falando (TTS)
├── background.js       # Service Worker de fundo. Lida isoladamente com requisições HTTPS para a API do Gemini
├── README.md           # A documentação que você está lendo agora.
├── CONTRIBUTING.md     # Guia de passos de como a comunidade pode ajudar a evoluir o app
└── LICENSE             # Licença open-source MIT
\`\`\`

---

## 🧠 Arquitetura e Fluxo

Para que não tenhamos vazamento de API KEYs no *DOM / front-end* dos sites, adotamos a seguinte arquitetura de mensagens:

\`\`\`mermaid
sequenceDiagram
    participant P as Player de Vídeo (User Tab)
    participant C as Content Script (Lê Legenda)
    participant B as Background Worker
    participant G as Gemini / Gemma API (Google)
    participant S as SpeechSynthesis (TTS)

    P->>C: Exibe trecho [00:15] "Welcome to AI"
    C->>C: Detecta mudança no DOM
    C->>B: chrome.runtime.sendMessage("Welcome to AI", API_KEY)
    B->>G: POST /gemini:generateContent
    G-->>B: Retorna Tradução: "Bem vindo à IA"
    B-->>C: sendResponse("Bem vindo à IA")
    C->>S: window.speechSynthesis.speak("Bem vindo à IA")
    S-->>P: Ajusta volume (Ducking) e Toca Áudio
\`\`\`

---

## 🛡️ Privacidade e Segurança

Seus dados permanecem apenas na sua máquina.

1. **Local Storage First:** Suas chaves de API, preferências de velocidade e modo são salvos via \`chrome.storage.local\`. Nenhum dado sobe para os nossos servidores (porque não temos nenhum!).
2. **Agnóstico a Infraestrutura:** As chamadas à inteligência do modelo do Google são feitas isoladamente no Service Worker (\`background.js\`). Isso blinda a extensão de *Cross-Site Scripting* em players potencialmente modificados de terceiros.
3. **Leitura Pura do DOM:** Sem injeções ou scripts mirabolantes de engenharia reversa. Se a legenda está rolando no site, nós lemos a camada exterior e processamos suavemente sem prejudicar a reprodução (DRM ou cache protegido).

---

## 🤝 Como Contribuir

O DubAI é feito pela comunidade para a comunidade. Se você achou um bug no sincronismo, quer ajudar a melhorar as RegExp lógicas de texto do Coursera/YouTube ou apenas melhorar algo visual, veja o nosso **[Guia de Contribuição](CONTRIBUTING.md)**.

⭐ **Gostou do projeto? Considere dar uma estrela neste repositório! É o maior incentivo que a comunidade open-source pode receber.** ⭐

---

## 📝 Licença
Distribuído sob a licença **MIT**. Você pode baixar, modificar, recriar a arquitetura e rentabilizar de forma livre. Veja o arquivo de [Licença (LICENSE)](LICENSE) para obter todos os detalhes da permissão.

---

## 📫 Contato
### **Júlio Okuda**

- 📧 **E-mail:** [julio.okuda@gmail.com](mailto:julio.okuda@gmail.com)
- 💡 Participe da discussão, abra issues e mande PRs e torne a educação baseada em vídeos mais acessível globalmente.

<div align="center">
  <p>Feito com paixão à educação e Inteligência Artificial. ❤️</p>
</div>
`;
