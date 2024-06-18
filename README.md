<div align="center">
  <h1>📩Newsletter2Article📋</h1>
  <a href="https://github.com/reneralmeida/newsletter2article/blob/main/readme.pt-br.md">PT-BR</a>
</div>

This application came to fruition as a result of my want to share investigative reportage I usually only receive via newsletters. The idea and first sketch of the software started early April 2024,
more information on the why and a few other bits in the following LinkedIn article: [Newsletter2Article](https://www.linkedin.com/pulse/newsletter2article-in-browser-application-rener-almeida-qqh3f)

The code pushed to this repo is the finished version I used locally, after this version was done, I spent another couple of weeks testing hosting and tweaking the deployed version found in the repo's description.
Rest assured that the code you see here is still 90% of what's live, one of the main reasons I intended to open-source this is for the transparency that nothing is being done with the sensitive header information present
in .elm files.

In the past when I've used some converter websites to see how well they worked it always bothered me that since their source is closed, I had no idea if the header information of my email provider/client was safe.
The pure intent of Newsletter2Article is to decode .elm files, preserve the intact content found inside html tags and print it as an accessible page (newsletter2article.github.io/newsletter2article/name of the article.html).

Everything that is not inside html tags is cleared from memory after processing. There are several checks to make sure only valid .emls are accepted, though just how well those checks will perform I've yet to see.
I urge that users of the application be responsible, more about that at [Articles](https://github.com/newsletter2article), otherwise I might have to take the website down and serve the articles I intend to share in the future through my personal GitHub Page.

## Local usage instructions

### Prerequisites

### .eml Files (7-bit ASCII, Content-Type: Quote Printable / MIME Multipart)

 1. To use this application, you need .eml files from your email client. Here's how to download them:

      Gmail and Outlook:
       - Open the email you want to save.
       - Click on the three dots (More) in the top-right corner of the email.
       - Select "Download message".
       - The email will be downloaded as an .eml file.

Standards like 8-bit encoding, BinHex and UUEncode have not been tested and will not work.
Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/reneralmeida/Newsletter2Article.git
   cd Newsletter2Article
   ``` 

2. Install the necessary npm packages:

   ```bash
    npm install express browserify body-parser fs path cors iconv-lite
   ``` 

### Running the Application

1. Start the backend server:

   ```bash
    cd script
    node server.js
   ```
   
 2. Open index.html in your browser to use the frontend interface.

Keep in mind that given the use of browserify, any change to the frontend code needs the following command to be applied:
```
npx browserify script.js -o bundle.js
```

### Known issues / Limitations / Tips

Given that I took an aggressive approach in how I dealt with sensitive links (Unsubscribe, privacy policy, etc.) some newsletters
content might be broken if said links are right at the beginning of the email. So always be sure to use the test locally button,
the content printed in the new tab is exactly how your article will be saved once generated. If that's your case or the phrasing used
for such links differs from the patterns currently coded you can always open your .eml file in a text editor, use CTRL+F to find the
lines that are leaking and manually remove them. If you don't feel like doing so, please, don't generate and share articles with the personalized
links, do so at your own risk.
As stated in the prerequisites section, the main focus of this is decoding Quote-Printable and MIME Multi-Part, it has a function to properly decode Base64 sections as well but other than that if your email is 8 bits encoded or of some other standard your .eml file will be rejected.
Also, if you plan on sharing your generated article on Twitter/X, make sure to name your .eml with plain text, without special characters. That social media website has poor URL handling, it breaks on en dashes (–) for instance. From my tests, Facebook doesn't have that problem.

The "Convert to Article" button posts the extracted untouched html into a GitHub Page set repo, so if you just clicked it and can't see an image preview when sharing, give it a minute with the generated tab open, the lack of preview means GitHub is still building the page.

### Disclaimer

The purpose of this application is preserving the intellectual content of newsletters in full and exposing it in a hosted web page so it can be seen by a wider audience. No violation of copyright is intended, only fair use. I for one will only share articles that I consider of the utmost importance to be public, widespread knowledge. 

### Contributing

Contributions are welcome of course, but given my slightly modified deployed version I might choose to incorporate
changes as branches instead of merging. I'm sure there's also better, more efficient ways of handling some aspects of the application, so if you're reading this and think you can hone it to be leaner and also support other types of email encoding, have at it. Just respect the license and keep the open-source ethos.