const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

const distPath = path.join(__dirname, 'dist/tfg/browser');

// Servir archivos estáticos
app.use(express.static(distPath, {
  maxAge: '1y',
  index: false // IMPORTANTE
}));

// Todas las rutas → Angular
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});