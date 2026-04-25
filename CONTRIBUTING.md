# Contribuindo para o DubAI

Primeiramente, obrigado pelo interesse em contribuir com o DubAI! Nós adoramos contribuições da comunidade, sejam elas correções de bugs, novas funcionalidades ou melhorias na documentação.

## 🌟 Como posso contribuir?

### Reportando Bugs
- Verifique se o bug já não foi reportado nas *Issues*.
- Se não, abra uma nova *Issue* fornecendo detalhes claros: plataforma de vídeo, mensagens de erro no console (\`F12\`), passos para reproduzir e comportamento esperado.

### Sugerindo Novas Funcionalidades
- Tem uma ideia brilhante? Abra uma *Issue* descrevendo-a detalhadamente. Explique por que seria útil para a maioria dos usuários da extensão.

### Enviando Código (Pull Requests)
1. Faça um Fork do repositório.
2. Crie uma branch para a sua funcionalidade/correção (\`git checkout -b feature/minha-feature-incrivel\`).
3. Faça suas alterações e certifique-se de manter a coerência do código (siga os padrões estabelecidos).
4. Pratique *Test-Driven Development* se aplicável, ou ao menos teste manualmente nas principais plataformas (YouTube, Udemy).
5. Faça o commit de suas alterações (\`git commit -m 'feat: Adiciona integração com plataforma X'\`).
6. Envie para o seu fork (\`git push origin feature/minha-feature-incrivel\`).
7. Abra um *Pull Request* no repositório original.

## 🛠️ Boas Práticas e Padrões de Código

- Nosso manifesto se baseia na **Manifest V3**. Certifique-se de não injetar dependências legadas.
- O projeto prioriza a API de **Speech Synthesis Nativa do Navegador**. Evite adicionar bibliotecas pesadas de terceiros para áudio a menos que seja um opt-in configurável.
- Respeite o fluxo de isolamento do Chrome: O \`content.js\` (injeção na tela) nunca deve ter a chave da API do modelo de linguagem. O \`background.js\` é que faz as chamadas via \`fetch\`.
- Use nomes de variáveis e funções em inglês no código para facilitar manutenção global, mas a interface (os arquivos HTML e de layout) deve focar primeiramente em Português-BR para nosso público-alvo inicial.

## 🌱 Ambiente de Desenvolvimento

Para rodar localmente após o clone:
1. Extraia e garanta que todos os arquivos estejam em uma pasta.
2. Acesse \`chrome://extensions\` no Google Chrome.
3. Ative o "Modo do desenvolvedor".
4. Clique em "Carregar sem compactação" (Load unpacked) e selecione a pasta do projeto.
5. Para qualquer mudança nos arquivos \`content.js\` ou \`background.js\`, clique na engrenagem de recarregar a extensão dentro de \`chrome://extensions\` e dê `F5` na aba do vídeo em que está testando.

Obrigado por ajudar a tornar a internet mais acessível a todos! 🚀
