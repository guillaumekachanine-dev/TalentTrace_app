# 🚀 Installation CV Analyzer - Guide Simple (10 min)

## Étape 1 : Préparer l'environnement (3 min)

### Vérifier que vous avez Node.js

**Windows :**
1. Ouvrez Command Prompt (Win+R, tapez `cmd`)
2. Tapez : `node --version`
3. Si vous voyez une version (ex: v18.x.x) → ✓ OK
4. Sinon → téléchargez sur https://nodejs.org/ (version LTS)

**Mac/Linux :**
```bash
node --version
```

---

## Étape 2 : Obtenir une clé API gratuite (3 min)

1. Allez sur https://console.anthropic.com/
2. Créez un compte (c'est gratuit)
3. Vérifiez votre email
4. Dans Dashboard, allez sur "API Keys"
5. Cliquez "Create Key"
6. **Copiez la clé** (elle commence par `sk-ant-...`)
7. Gardez-la précieusement, vous en aurez besoin

> 💰 Prix : Gratuit jusqu'à 5M tokens. ~0.01€ par 100 CVs analysés après.

---

## Étape 3 : Installer CV Analyzer (2 min)

### Windows :

1. **Téléchargez** le dossier `cv-analyzer`
2. **Double-cliquez** sur `start.bat`
3. Une fenêtre Command Prompt s'ouvre
4. Attendez "Installation des dépendances..." (peut prendre 30 sec)
5. Quand ça dit "Demarrage du serveur", c'est bon !

### Mac/Linux :

```bash
# 1. Naviguez dans le dossier
cd cv-analyzer

# 2. Donnez la permission au script
chmod +x start.sh

# 3. Lancez
./start.sh
```

---

## Étape 4 : Configurer la clé API (1 min)

**Si le script demande de configurer .env :**

1. Un fichier `.env` s'ouvre (ou est créé)
2. Trouvez la ligne : `ANTHROPIC_API_KEY=`
3. Remplacez par votre clé :
   ```
   ANTHROPIC_API_KEY=sk-ant-xyz123...
   ```
4. Sauvegardez le fichier
5. Appuyez sur ENTER dans la fenêtre de commande

---

## Étape 5 : Vérifier que ça marche (1 min)

1. **Ouvrez votre navigateur**
2. **Tapez dans la barre :** `http://localhost:3000`
3. Vous devriez voir l'interface CV Analyzer 🎉

Si vous voyez une erreur "Cannot connect" :
- Vérifiez que la fenêtre de commande est toujours ouverte
- Vérifiez qu'il n'y a pas d'erreur rouge en rouge
- Attendez quelques secondes et rafraîchissez (F5)

---

## 🎯 Premier test (2 min)

### 1. Créer une offre d'emploi

Cliquez sur tab **"Créer une Offre"**

Remplissez comme ceci (exemple rapide) :

```
Titre: Développeur Python
Domaine: IT
Niveau: Senior
Compétences: Python, Django, PostgreSQL, AWS
Localisation: Sophia-Antipolis
Description: Recrutement pour projet cloud
```

Cliquez **"Créer l'offre d'emploi"** ✓

### 2. Analyser un CV

**Option A :** Vous avez un PDF/Word
- Cliquez sur tab **"CV Candidat"**
- Drag-drop votre CV ou cliquez pour sélectionner
- Choisissez l'offre créée
- Cliquez **"Analyser le CV"**
- Attendez 2-3 secondes
- Vous voyez les résultats et pouvez exporter en Word

**Option B :** Vous n'avez pas de CV
- Utilisez `example-cv.txt` dans le dossier cv-analyzer
- Même processus que ci-dessus

### 3. Exporter en Word

Cliquez sur **"Exporter en Word"** pour créer une fiche Word

Un fichier `.docx` se télécharge → Parfait pour partager !

---

## ✅ Checklist de succès

- [ ] Node.js installé (tapez `node -v` en cmd)
- [ ] Clé API Anthropic obtenue
- [ ] Fichier `.env` configuré avec la clé
- [ ] `start.bat` (ou `start.sh`) lancé sans erreur
- [ ] http://localhost:3000 accessible dans navigateur
- [ ] Offre d'emploi créée
- [ ] CV analysé avec score
- [ ] Fichier Word exporté avec succès

Si tout ✓ → **Vous êtes prêt(e) ! 🚀**

---

## 🆘 Problèmes courants

### "Port 3000 already in use"

Vous avez une autre app qui utilise le port 3000.

**Solution :**
1. Fermez la fenêtre de commande
2. Tuez le processus :
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   
   # Mac/Linux
   lsof -i :3000
   kill -9 [PID]
   ```
3. Relancez `start.bat` ou `start.sh`

### "ANTHROPIC_API_KEY not set"

Vous avez oublié de configurer .env

**Solution :**
1. Ouvrez le fichier `.env` dans le dossier cv-analyzer
2. Ajoutez votre clé : `ANTHROPIC_API_KEY=sk-ant-...`
3. Sauvegardez
4. Relancez

### "Cannot connect to localhost:3000"

La fenêtre de commande est fermée ou a crashé.

**Solution :**
- Relancez `start.bat` (ou `./start.sh`)
- Attendez que ça dise "Demarrage du serveur..."
- Rafraîchissez votre navigateur (F5)

### "Error reading file" lors de l'analyse

Le CV n'a pas pu être lu.

**Solutions :**
- Vérifiez que c'est un vrai PDF/DOCX (pas image)
- Essayez avec `example-cv.txt` pour tester
- Fichier doit être < 10MB

---

## 📞 Besoin d'aide ?

Contactez Dosta ou vérifiez la section Support du README.md

---

**Bonne analyse ! 🎉**

*Prêt(e) à analyser 100+ candidats/jour au lieu de 30 ?*
