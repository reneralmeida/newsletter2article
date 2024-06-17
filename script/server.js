const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware to handle CORS
app.use(cors()); // Allow all origins for local development

// const limiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour
//     max: 5, // limit each IP to 5 requests per windowMs
//     message: 'Too many articles created from this IP, please try again after an hour'
// });

app.use(bodyParser.json({ limit: '10mb' })); // Increase payload limit if needed

// Route to serve translations.json
app.get('/translations.json', (req, res) => {
    const filePath = path.join(__dirname, 'translations.json');
    res.sendFile(filePath);
});

app.post('/save-article', (req, res) => {
    const { htmlContent, fileName } = req.body;
    const articlesDir = path.join(__dirname, '../articles');
    if (!fs.existsSync(articlesDir)) {
        fs.mkdirSync(articlesDir);
    }
    const filePath = path.join(articlesDir, `${fileName}.html`);

    fs.writeFile(filePath, htmlContent, (err) => {
        if (err) {
            console.error('Error saving the file:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            console.log(`File saved: ${filePath}`);
            res.status(200).json({ message: 'File saved successfully', filePath: `http://localhost:${port}/${fileName}.html` });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
