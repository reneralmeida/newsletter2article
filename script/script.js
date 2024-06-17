// Waits for the DOM content to be loaded before executing the script
document.addEventListener('DOMContentLoaded', function () {
    const title = document.getElementById('title');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('emlFile');
    const dropZoneText = document.getElementById('drop-zone-text');
    const convertButton = document.getElementById('convert');
    const testLocallyButton = document.getElementById('testLocally');
    const themeSwitcher = document.getElementById('themeSwitcher');
    const footerParagraph = document.querySelector('footer p');
    const languageSelector = document.getElementById('languageSelector');
    const currentLangFlag = document.getElementById('currentLangFlag');
    let htmlContent = '';
    let selectedFileName = '';
    let selectedLanguage = 'en'; // Default language

    let translations = {};

    // Fetches the translations file from the server
    fetch('http://localhost:3000/translations.json')
        .then(response => response.json())
        .then(data => {
            translations = data;
            setLanguage('en'); // Set default language to English
        })
        .catch(error => {
            console.error('Error fetching translations:', error);
        });

    // Sets the language for the interface based on the selected language
    function setLanguage(lang) {
        selectedLanguage = lang;
        title.innerText = translations[lang].title;
        dropZoneText.innerText = translations[lang].dropZoneText;
        testLocallyButton.innerText = translations[lang].testLocallyButton;
        convertButton.innerText = translations[lang].convertButton;
        themeSwitcher.innerText = translations[lang].themeSwitcher;

        if (footerParagraph) {
            footerParagraph.innerHTML = translations[lang].footer;
        } else {
            console.error('Footer paragraph element not found');
        }

        // Update the flag image
        currentLangFlag.src = languageSelector.querySelector(`a[data-lang="${lang}"] img`).src;
        currentLangFlag.alt = translations[lang].languageName;
    }

    // Displays an alert message based on the provided key
    function showAlert(alertKey) {
        alert(translations[selectedLanguage].alerts[alertKey]);
    }

    // Toggles the display of the language selector dropdown menu
    languageSelector.addEventListener('click', (event) => {
        event.stopPropagation();
        const dropdown = languageSelector.querySelector('.dropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Hides the language selector dropdown menu when clicking outside of it
    document.addEventListener('click', (event) => {
        const dropdown = languageSelector.querySelector('.dropdown');
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        }
    });

    // Sets the language based on the selected option from the dropdown menu
    languageSelector.querySelector('.dropdown').addEventListener('click', (event) => {
        event.stopPropagation();
        const target = event.target.closest('a');
        if (target) {
            const lang = target.getAttribute('data-lang');
            setLanguage(lang);
            languageSelector.querySelector('.dropdown').style.display = 'none';
        }
    });

    // Validates if the provided .eml file has the necessary headers
    function validateEmlFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                let emailContent = event.target.result; // Store email content
                let headers = ['From:', 'To:', 'Subject:'];
                if (headers.every(header => emailContent.includes(header))) {
                    sessionStorage.setItem('emailContent', emailContent); // Store email content in sessionStorage
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
            reader.onerror = function () {
                reject(false);
            };
            reader.readAsText(file);
        });
    }

    // Detects the type of email encoding used in the .eml file
    function detectEmailType(content) {
        if (content.includes('Content-Type: multipart/')) {
            return 'MIME';
        } else if (content.includes('Content-Transfer-Encoding: quoted-printable')) {
            return 'Quoted-Printable';
        } else {
            return 'Unknown';
        }
    }

    // Decodes a string encoded with quoted-printable encoding
    function decodeQuotedPrintable(input) {
        return input.replace(/=[\r\n]+/g, '')
            .replace(/=([0-9A-Fa-f]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
    }

    // Decodes a base64 encoded string
    function decodeBase64(input) {
        return atob(input.replace(/\r?\n|\r/g, ''));
    }

    const iconv = require('iconv-lite');

    // Sanitizes the content by replacing broken characters and unwanted patterns
    function sanitizeContent(content) {
        const patterns = [
            { regex: /=\r?\n/g, replacement: '' },
            { regex: /[\u00B9\u00B2\u00B3\u2070-\u209F]/g, replacement: '' },
            { regex: /(?<=[.,!?])\s*[\d¹²³]+/g, replacement: '' },
            { regex: /=C3=81/g, replacement: 'Á' },
            { regex: /=C3=\w{2}/g, replacement: match => decodeURIComponent(match.replace(/=/g, '%')) }
        ];

        const brazilianPortuguesePatterns = [
            { regex: /Ã§/g, replacement: 'ç' },
            { regex: /Ãµ/g, replacement: 'õ' },
            { regex: /Ã³/g, replacement: 'ó' },
            { regex: /Ã©/g, replacement: 'é' },
            { regex: /Ã¡/g, replacement: 'á' },
            { regex: /Ãª/g, replacement: 'ê' },
            { regex: /Ã£/g, replacement: 'ã' },
            { regex: /Ã/g, replacement: 'à' },
            { regex: /Á/g, replacement: 'Á' },
            { regex: /É/g, replacement: 'É' },
            { regex: /Í/g, replacement: 'Í' },
            { regex: /Ó/g, replacement: 'Ó' },
            { regex: /Ú/g, replacement: 'Ú' },
            { regex: /Â/g, replacement: 'Â' },
            { regex: /Ê/g, replacement: 'Ê' },
            { regex: /Î/g, replacement: 'Î' },
            { regex: /Ô/g, replacement: 'Ô' },
            { regex: /Û/g, replacement: 'Û' },
            { regex: /Ã/g, replacement: 'Ã' },
            { regex: /Õ/g, replacement: 'Õ' }
        ];

        const allPatterns = patterns.concat(brazilianPortuguesePatterns);

        function replaceBrokenChars(offset, string) {
            for (const pattern of allPatterns) {
                if (pattern.regex.test(string.slice(offset))) {
                    return string.slice(offset).replace(pattern.regex, pattern.replacement);
                }
            }
            return '';  // Default replacement if no pattern matches
        }

        // Replace "Hello, [Name]" with "Hello, Reader", handling broken lines and spaces
        content = content.replace(/Hello\s*(=[\r\n]+)?(\s*=\s*[\r\n]+)?\s*([^,\r\n]+)\s*(=[\r\n]+)?(,\s*=\s*[\r\n]+)?\s*,?/gi, 'Hello, Reader');

        content = iconv.decode(Buffer.from(content, 'binary'), 'utf-8').replace(/�/g, replaceBrokenChars);
        return content;
    }

    // Extracts HTML content from a MIME email
    function extractHtmlFromMIME(mimeContent) {
        const boundaryMatch = mimeContent.match(/boundary="([^"]+)"/);
        if (!boundaryMatch) {
            console.error('No boundary found in the .eml file');
            return '';
        }

        const boundary = boundaryMatch[1];
        const parts = mimeContent.split(new RegExp(`--${boundary}`));
        let htmlContent = '';

        for (let part of parts) {
            if (part.includes('Content-Type: text/html')) {
                const encodingMatch = part.match(/Content-Transfer-Encoding: ([^\s]+)/);
                const encoding = encodingMatch ? encodingMatch[1].trim() : '7bit';
                const contentStart = part.indexOf('\r\n\r\n');
                if (contentStart === -1) continue;
                let htmlPart = part.substring(contentStart + 4).trim();

                if (encoding === 'base64') {
                    htmlContent = decodeBase64(htmlPart);
                } else if (encoding === 'quoted-printable') {
                    htmlContent = decodeQuotedPrintable(htmlPart);
                } else {
                    htmlContent = htmlPart;
                }
                break;
            }
        }

        return htmlContent;
    }

    // Parses an email encoded with quoted-printable and returns the HTML content
    function parseQuotedPrintableEmail(content) {
        const start = content.indexOf('\r\n\r\n') + 4;
        let htmlContent = content.substring(start).trim();
        htmlContent = decodeQuotedPrintable(htmlContent);
        htmlContent = sanitizeContent(htmlContent);
        return htmlContent;
    }

    // Parses a MIME email and returns the HTML content
    function parseMIMEEmail(content) {
        let htmlContent = extractHtmlFromMIME(content);
        htmlContent = sanitizeContent(htmlContent);
        return htmlContent;
    }

    // Removes specific sections from the content based on provided patterns
    function removeSections(content, patterns) {
        for (let pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                content = content.substring(0, match.index);
                break;
            }
        }
        return content;
    }

    // Handles the file selection and initiates validation and processing
    function handleFileSelect(files) {
        const file = files[0];
        if (file && file.name.endsWith('.eml')) {
            selectedFileName = file.name.replace('.eml', '');  // Store the selected file name
            validateEmlFile(file).then(isValid => {
                if (isValid) {
                    fileInput.files = files;
                    dropZoneText.textContent = `Selected file: ${file.name}`;
                    let emailContent = sessionStorage.getItem('emailContent');
    
                    try {
                        emailContent = sanitizeContent(emailContent);
                        const emailType = detectEmailType(emailContent);
    
                        if (emailType === 'Quoted-Printable') {
                            htmlContent = parseQuotedPrintableEmail(emailContent);
                        } else if (emailType === 'MIME') {
                            htmlContent = parseMIMEEmail(emailContent);
                        } else {
                            showAlert('validEmlError');;
                            htmlContent = '';
                        }
    
                        const reminderPatterns = [
                            // Brazilian Portuguese
                            /Gerenciar Assinatura/i,
                            /Política de privacidade/i,
                            /Cancelar inscrição/i,
                            /Cancelar assinatura/i,
                            /Este e-mail é um canal importante para conversarmos com nossa comunidade/i,
                            /Clique em cancelar a inscrição/i,             
                            /Configurações de privacidade/i, 
                            /Cancelar notificação/i,         
                            /Gerenciar preferências/i,       
                            /Cancelar comunicação/i,         
                            /Remover assinatura/i,           
                            /Se preferir não receber e-mails/i,           
                            /Caso não queira mais receber/i,           
                        
                            // Spanish
                            /Gestionar Suscripción/i,
                            /Cancelar suscripción/i,
                            /Si ya no quieres recibir nuestros correos/i,
                            /Este correo es un canal importante para comunicarnos con nuestra comunidad/i,
                            /Haz clic en cancelar la suscripción/i,
                            /Este correo electrónico fue enviado a/i,
                            /Para cancelar tu suscripción/i,
                            /Si deseas darte de baja/i,
                            /Puedes darte de baja/i,
                            /Dejar de recibir estos correos/i,
                            /Gestiona tu suscripción/i,
                            /Ver este correo en tu navegador/i,
                            /Revisar preferencias de suscripción/i,
                            /Contáctenos/i,
                            /Síguenos en/i,
                            /Términos y condiciones/i,
                            /Política de privacidad/i,
                        
                            // English
                            /If you no longer want to receive our emails/i,
                            /If you don't want to receive this type of email/i,
                            /This email was sent to/i,
                            /Unsubscribe/i,
                            /To cancel your subscription/i,
                            /If you wish to unsubscribe/i,
                            /You can opt out/i,
                            /Stop receiving these emails/i,
                            /Manage your subscription/i,
                            /View this email in your browser/i,
                            /Review subscription preferences/i,
                            /Contact us/i,
                            /Follow us on/i,
                            /Privacy policy/i,
                            /Disable activity summary/i,
                            /If you no longer wish to receive these emails/i,
                            /This message as sent to/i,
                            /Disable all emails/i
                        ];                    
    
                        htmlContent = removeSections(htmlContent, reminderPatterns);
    
                        if (!htmlContent) {
                            showAlert('htmlContentError');
                        }
    
                        // Clear sensitive content from memory
                        sessionStorage.removeItem('emailContent');
                    } catch (error) {
                        if (error instanceof TypeError && error.message.includes('string.slice')) {
                            showAlert('unsupportedEmailError');
                        } else {
                            throw error;
                        }
                    }
                } else {
                    showAlert('validEmlError');
                    fileInput.value = '';
                    dropZoneText.textContent = 'Drag & drop your .eml file here, or click to select';
                }
            });
        } else {
            showAlert('validEmlError');
        }
    }

    // Handles the click event on the drop zone to trigger file input click
    dropZone.addEventListener('click', () => fileInput.click());

    // Adds dragover event to the drop zone
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    // Adds dragleave event to the drop zone
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    // Handles the file drop event
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFileSelect(e.dataTransfer.files);
    });

    // Handles the file input change event
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files);
    });

    // Generates the article content for the email
    function generateArticleContent(data, isTestLocally) {
        const tempDiv = document.createElement('div');
        tempDiv.classList.add('article');
        tempDiv.innerHTML = htmlContent;
    
        tempDiv.querySelectorAll('*').forEach(el => {
            if (el.tagName === 'H1') {
                el.classList.add('header1');
            } else if (el.tagName === 'H2') {
                el.classList.add('header2');
            } else if (el.tagName === 'P') {
                el.classList.add('paragraph');
            }
        });
    
        let footerContent = translations[selectedLanguage].footer;
    
        let shareButtons = '';
        if (!isTestLocally) {
            shareButtons = `
                <div class="share-buttons facebook">
                    <button onclick="shareOnFacebook()">
                        <img src="./img/facebook.webp" alt="Share on Facebook">
                    </button>
                </div>
                <div class="share-buttons twitter">
                    <button onclick="shareOnTwitter()">
                        <img src="./img/twitter.webp" alt="Share on Twitter">
                    </button>
                </div>
                <script>
                    function shareOnFacebook() {
                        const url = '${data.filePath}';
                        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
                    }
    
                    function shareOnTwitter() {
                        const url = '${data.filePath.replace(/ /g, '%20')}';
                        window.open('https://x.com/intent/post?url=' + encodeURIComponent(url), '_blank');
                    }
                </script>
            `;
        }
    
        return `
            <html>
            <head>
                <title>${selectedFileName}</title>
                <link rel="icon" href="./img/favicon.ico">
                <link rel="stylesheet" type="text/css" href="./css/article.css">
            </head>
            <body class="dark-mode">
                ${tempDiv.outerHTML}
                ${shareButtons}
                <footer>
                    ${footerContent}
                </footer>
            </body>
            </html>
        `;
    }     
    
    // Handles the click event for the test locally button
    testLocallyButton.addEventListener('click', () => {
        if (!fileInput.files.length || !htmlContent) {
            showAlert('validEmlError');
            return;
        }
    
        const newTab = window.open();
        if (newTab) {
            const content = generateArticleContent({}, true);
            newTab.document.write(content);
            newTab.document.close();
        } else {
            showAlert('popupError');
        }
    });    

    // Handles the click event for the convert button
    convertButton.addEventListener('click', () => {
        if (!fileInput.files.length || !htmlContent) {
            showAlert('validEmlError');
            return;
        }
    
        fetch('http://localhost:3000/save-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ htmlContent, fileName: selectedFileName }),
        })
        .then(response => response.json())
        .then(data => {
            if (!data.filePath) {
                showAlert('noFilePathError');
                return;
            }
    
            const newTab = window.open();
            if (newTab) {
                const content = generateArticleContent(data, false);
                newTab.document.write(content);
                newTab.document.close();
            } else {
                showAlert('popupError');
            }
    
            // Clear htmlContent to remove sensitive information
            htmlContent = '';
        })
        .catch((error) => {
            console.error('Error:', error);
            showAlert('processingError');
        });
    });       
    
    // Toggles the theme between light and dark modes
    themeSwitcher.addEventListener('click', function () {
        document.body.classList.toggle('light-mode');
    });
});