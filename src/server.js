const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Subir un nivel desde src/ al wwwroot/
const baseDir = path.join(__dirname, '..');
const distFolder = fs.readdirSync(path.join(baseDir, 'dist'))[0];
const distPath = path.join(baseDir, 'dist', distFolder, 'browser');

console.log('Base directory:', baseDir);
console.log('Using dist path:', distPath);

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});