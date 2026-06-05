const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = 3000;

// Activation de la compression GZIP (rend le chargement 3x plus rapide)
app.use(compression());

// Servir les fichiers statiques avec cache
app.use(express.static(__dirname, {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log('\n✅ SERVEUR URBAIN CAR - WAKAPASS');
    console.log(`📍 Adresse locale : http://localhost:${PORT}`);
    console.log(`📱 Accès sur mobile : http://192.168.${getLocalIP()}:${PORT}`);
    console.log('\n🚀 Appuyez sur Ctrl+C pour arrêter le serveur\n');
});

function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'xxx.xxx.xxx.xxx';
}
