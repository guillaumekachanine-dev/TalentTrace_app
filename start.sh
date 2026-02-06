#!/bin/bash

echo "🚀 CV Analyzer - Quick Start"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "Téléchargez-le sur : https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js détecté : $(node --version)"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env non trouvé"
    echo "Création du fichier .env..."
    cp .env.example .env
    echo ""
    echo "📌 IMPORTANT : Éditez .env et ajoutez votre clé API Anthropic"
    echo "   Vous pouvez l'obtenir gratuitement sur : https://console.anthropic.com/"
    echo ""
    read -p "Appuyez sur ENTER après avoir configuré .env..."
fi

# Install dependencies
echo "📦 Installation des dépendances..."
npm install --silent

echo ""
echo "✓ Installation complète!"
echo ""
echo "🌐 Démarrage du serveur..."
echo "     Application disponible sur : http://localhost:3000"
echo ""
echo "💡 Tips:"
echo "   - Ouvrez http://localhost:3000 dans votre navigateur"
echo "   - Créez d'abord une offre d'emploi"
echo "   - Puis chargez des CVs pour les analyser"
echo ""

npm start
