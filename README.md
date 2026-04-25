# 🎙️ DubAI - Dublagem de Vídeo em Tempo Real (Chrome Extension)

O **DubAI** é uma extensão inteligente para Google Chrome capaz de extrair legendas dinâmicas de plataformas de vídeo (YouTube, Udemy, Anthropic, Coursera, DeepLearning.ai) e gerar uma dublagem sintetizada hiper-realista em Português-BR usando a API do Google ("Gemma 3" ou "Gemini Flash") e algoritmos dinâmicos de sincronização de fala.

## 🌟 Principais Recursos
- **Tradução com IA Otimizada**: Envia pequenos blocos de texto contextuais para preservar precisão na tradução, suportando a nova família _Gemma 3_, além da API padrão do _Gemini_.
- **Leitor Nativo (Zero Custo)**: Permite dublagem de legendas já nativamente traduzidas pelas plataformas (ex: vídeos já dublados no menu do YouTube), usando apenas síntese offline.
- **Detecção Avançada (Pre-Transcript)**: Localiza e detecta transcrições completas da barra lateral em estruturas de LMS (ex: Coursera, DeepLearning.ai). Isso faz o carregamento prévio da tradução impedindo falhas em cursos técnicos acelerados.
- **Sincronização Dinâmica Inteligente**: A extensão utiliza a API de áudio nativa do Chrome. Se a voz demorar ou ficar muito acumulada no buffer, a IA acelera matematicamente ou pausa momentaneamente o player do seu vídeo para garantir que a imagem não atropele o narrador!
- **Audio Ducking Customizado**: O volume nativo do vídeo é reduzido automaticamente (ducking) enquanto a IA fala, e volta ao normal imediatamente nos intervalos silenciosos!
- **Download das Transcrições**: Um clique é o suficiente para compilar a transcrição inteira do decorrer de seu vídeo, gerando um .txt ideal para ferramentas LLMs.

## 🚀 Como Instalar (Modo Desenvolvedor)

A DubAI ainda não está listada na Chrome Web Store. Para utilizá-la gratuitamente através do repositório/build:

1. Baixe o último build através do pacote em **.zip** via plataforma e extraia-o para uma *pasta fixa*.
2. Abra o Chrome e navegue pela barra de endereço até: \`chrome://extensions/\`.
3. No canto superior direito da tela, ative a chave chamada **Modo do Desenvolvedor**.
4. Clique no botão **Carregar sem compactação** (ou *Load unpacked*).
5. Selecione a *pasta fixa* onde você extraiu a DubAI.
6. A extensão fará parte da vida útil do seu navegador. 

**🚨 Segurança Crítica:** Imediatamente após a instalação, abra qualquer conteúdo com vídeo no seu navegador e **pressione F5 (Recarregar a página)**. Isto evita erros do \`Chrome Message Sender\` travando a interface ao ser chamada com sessões órfãs.

## ⚙️ Como Usar na Prática

1. **Configuração da API**: Clique no ícone \`🎙️ DubAI\` na barra do seu navegador. Mude o "Modo de Operação" para \`Tradutor IA\`. Preencha de forma segura utilizando sua própria [Google API Key provida no AI Studio](https://aistudio.google.com/app/apikey).
2. **Ativando a Legenda do Vídeo**: A mágica dessa extensão é o _DOM reading_. Ou seja, a sua plataforma de vídeos **deve** expor palavras na tela de modo visível ou oculto. Acesse a engrenagem do player do vídeo, ative a opção **CC (Closed Captions) / Legendas originais do áudio**!
3. Pressione \`Iniciar Dublagem\`. A partir desse momento, tudo deve estar contínuo e orgânico. Em certas plataformas o delay cognitivo pode durar apenas de 1 a 6 segundos inicialmente.
4. Ajuste na interface o **Tom (Pitch)** e **Velocidade**. Note que o \`DubAI\` respeita o uso de vozes instaladas no seu Sistema Operacional Windows ou macOS. Vozes nativas femininas como a Microsoft Francisca, Google Português Brasil ou masculinas são alinhadas na seleção de \`Locutor\`.

## 🛡️ Qualidade, Privacidade e Arquitetura

O código implementado pela DubAI preza por:
*   **Total Privacidade**: Nenhum dado é mandado ou cacheado para servidores obscuros fora do \`generativelanguage.googleapis.com\`. As chaves de API estão seguradas pelo \`chrome.storage.local\` offline.
*   **Agnóstico a Infraestrutura**: A ferramenta ignora abstrações confusas. As chamadas ao modelo do Gemini usam as diretrizes nativas rest \`fetch\` em Background Service Worker.
*   **Sem injecões obscuras**: O \`content.js\` trabalha puramente lendo a interface sem modificar chaves vitais da Web Application.
