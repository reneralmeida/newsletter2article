<div align="center">
  <h1>📩Newsletter2Article📋</h1>
</div>

Este aplicativo surgiu como resultado do meu desejo de compartilhar reportagens investigativas que geralmente recebo apenas via newsletters. A ideia e o primeiro esboço do software começaram no início de abril de 2024, mais informações sobre o motivo e alguns outros detalhes no seguinte artigo do LinkedIn: [Newsletter2Article](https://nodejs.org/)

O código presente neste repositório é a versão final que usei localmente. Após finalizar esta versão, passei algumas semanas testando a hospedagem e ajustando a versão implantada encontrada na descrição do repositório. Fique tranquilo que o código que você vê aqui ainda é 90% do que está ativo. Um dos principais motivos para abrir o código é garantir a transparência de que nada está sendo feito com as informações sensíveis do cabeçalho presentes nos arquivos .eml.

No passado, quando usei alguns sites conversores para ver como funcionavam, sempre me incomodava que, como o código-fonte era fechado, eu não tinha ideia se as informações do cabeçalho do meu provedor/cliente de e-mail estavam seguras. A intenção do Newsletter2Article é decodificar arquivos .eml, preservar o conteúdo intacto encontrado dentro das tags html e imprimi-lo como uma página acessível (newsletter2article.github.io/newsletter2article/nome do artigo.html).

Tudo que não está dentro das tags html é limpo da memória após o processamento. Existem várias verificações para garantir que apenas arquivos .eml válidos sejam aceitos, embora só o tempo dirá quão bem essas verificações funcionarão. Peço encarecidamente que os usuários do aplicativo sejam responsáveis. Mais sobre isso em [Artigos](https://github.com/newsletter2article), caso contrário, poderei ter que tirar o site do ar e compartilhar os artigos que pretendo no futuro através da minha página pessoal no GitHub.

## Instruções para uso local

### Pré-requisitos

### Arquivos .eml (7-bit ASCII, Content-Type: Quote Printable / MIME Multipart)

 1. Para usar este aplicativo, você precisa de arquivos .eml do seu cliente de e-mail. Veja como baixá-los:

      Gmail e Outlook:
       - Abra o e-mail que deseja salvar.
       - Clique nos três pontos (Mais) no canto superior direito do e-mail.
       - Selecione "Baixar mensagem".
       - O e-mail será baixado como um arquivo .eml.

Padrões como 8-bit, Binhex e UUEncode não foram testados e não funcionarão.
Certifique-se de ter [Node.js](https://nodejs.org/) e [npm](https://www.npmjs.com/) instalados em sua máquina.

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/reneralmeida/Newsletter2Article.git
   cd Newsletter2Article
   ``` 

2. Instale os pacotes npm necessários:

   ```bash
    npm install express browserify body-parser fs path cors iconv-lite
   ``` 

### Rodando a aplicação

1. Inicie o servidor backend:

   ```bash
    cd script
    node server.js
   ```
   
 2. Abra index.html no seu navegador para usar a interface frontend.

Tenha em mente que, dado o uso do browserify, qualquer alteração no código frontend precisa do seguinte comando para ser aplicada:
```
npx browserify script.js -o bundle.js
```

### Pormenores / Limitações / Dicas

Como adotei uma abordagem agressiva em como lidei com links sensíveis (Cancelar inscrição, política de privacidade, etc.), o conteúdo de algumas newsletters pode ser quebrado se esses links estiverem logo no início do e-mail. Portanto, sempre se certifique de usar o botão de testar localmente, o conteúdo exibido na nova aba é exatamente como seu artigo será salvo uma vez gerado. Se esse for o seu caso ou se a redação usada para tais links diferir dos padrões atualmente codificados, você pode abrir seu arquivo .eml em um editor de texto, usar CTRL+F para encontrar as linhas que estão vazando e removê-las manualmente. Se não quiser fazer isso, por favor, não gere e compartilhe artigos com os links personalizados, faça isso por sua conta e risco.
Como dito nos pré-requisitos, o foco principal da aplicação é decodificar conteúdo Quote-Printable e MIME Multi-Part, há uma função específica para lidar com Base64 também mas fora isto se seu email for 8-bit ou algum outro padrão, seu arquivo .eml será rejeitado.
Além disso, se você planeja compartilhar seu artigo no Twitter/X, certifique-se de nomear seu arquivo .eml com texto simples, sem caracteres especiais. Esse site não lida bem com certas URLs, ele falha em travessões (–), por exemplo. Pelos meus testes, o Facebook não tem esse problema.

O botão "Converter para Artigo" faz o post do artigo gerado em um repositório com GitHub Pages configurado, se você acabou de clicá-lo e o link está sem imagem, espere um minuto com a aba aberta, a falta de imagem indica que a página está sendo buildada pelo GitHub.

### Aviso Legal

O objetivo desta aplicação é preservar o conteúdo intelectual das newsletters na íntegra e expô-lo em uma página web hospedada para que possa ser visto por um público mais amplo. Não há intenção de violar direitos autorais, apenas uso justo. Eu, por exemplo, compartilharei apenas artigos que considero de extrema importância serem difundidos, de conhecimento público.

### Contribuindo

Contribuições são bem-vindas, mas dada a minha versão modificada implantada, posso optar por incorporar mudanças como branches em vez de fazer merge. Tenho certeza de que também existem maneiras melhores e mais eficientes de lidar com alguns aspectos da aplicação, então, se você está lendo isto e acha que pode aprimorá-la para ser mais enxuta e também suportar outros tipos de codificação de e-mail, vá em frente. Apenas respeite a licença e mantenha o espírito de código aberto.