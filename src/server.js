const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// 🔥 Detectar automáticamente la carpeta
const distFolder = fs.readdirSync(path.join(__dirname, 'dist'))[0];
const distPath = path.join(__dirname, 'dist', distFolder, 'browser');

console.log('Using dist path:', distPath);

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});