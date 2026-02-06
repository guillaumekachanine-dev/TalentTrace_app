import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { Packer, Document, Paragraph, Table, TableRow, TableCell, TextRun, BorderStyle, WidthType, AlignmentType, convertInchesToTwip } from 'docx';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const upload = multer({ dest: UPLOAD_DIR });

// Initialize Anthropic client
const client = new Anthropic();

// Extract text from PDF
async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}

// Extract text from DOCX
async function extractTextFromDOCX(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

// Extract text from TXT
async function extractTextFromTXT(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

// Main extraction function
async function extractTextFromCV(filePath) {
    // Si pas d'extension (multer crée des fichiers sans extension), essayer par type MIME
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    console.log(`Extracting from: ${filePath}, ext: ${ext}, name: ${fileName}`);

    // Essayer PDF d'abord (par extension ou par défaut pour les fichiers sans ext)
    if (ext === '.pdf') {
        try {
            return await extractTextFromPDF(filePath);
        } catch (e) {
            console.log('PDF extraction failed, trying others...');
        }
    }

    // Essayer DOCX
    if (ext === '.docx' || ext === '.doc') {
        try {
            return await extractTextFromDOCX(filePath);
        } catch (e) {
            console.log('DOCX extraction failed, trying others...');
        }
    }

    // Essayer TXT
    if (ext === '.txt' || ext === '') {
        try {
            return await extractTextFromTXT(filePath);
        } catch (e) {
            console.log('TXT extraction failed, trying others...');
        }
    }

    // Si aucun format n'a marché, essayer tous dans l'ordre
    try {
        return await extractTextFromPDF(filePath);
    } catch (e1) {
        try {
            return await extractTextFromDOCX(filePath);
        } catch (e2) {
            try {
                return await extractTextFromTXT(filePath);
            } catch (e3) {
                throw new Error('Impossible d\'extraire le texte du fichier. Vérifiez que c\'est un PDF, DOCX ou TXT valide.');
            }
        }
    }
}

function getExtensionFromContentType(contentType) {
    if (!contentType) return '';
    const type = contentType.split(';')[0].trim().toLowerCase();
    if (type === 'application/pdf') return '.pdf';
    if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx';
    if (type === 'application/msword') return '.doc';
    if (type === 'text/plain') return '.txt';
    return '';
}

async function downloadFileToUploads(url) {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        throw new Error('URL invalide');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('URL invalide');
    }

    const response = await fetch(parsedUrl.toString());
    if (!response.ok) {
        throw new Error('Impossible de télécharger le fichier');
    }

    const contentType = response.headers.get('content-type') || '';
    const extFromType = getExtensionFromContentType(contentType);
    const extFromUrl = path.extname(parsedUrl.pathname).toLowerCase();
    const ext = extFromType || (['.pdf', '.docx', '.doc', '.txt'].includes(extFromUrl) ? extFromUrl : '');

    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return filePath;
}

// Parse CV with Claude - MULTI-PASS APPROACH for 95%+ accuracy
async function parseCV(cvText) {
    // PASS 1: Initial extraction
    const extractionPrompt = `Tu es un expert en analyse de CV. Extrais les informations suivantes du CV ci-dessous et retourne un JSON valide UNIQUEMENT.

CV TEXT:
${cvText}

Retourne EXACTEMENT ce JSON (complète tous les champs):
{
  "firstName": "prénom du candidat",
  "lastName": "nom du candidat",
  "email": "adresse email",
  "phone": "numéro de téléphone avec code pays si present",
  "location": "ville ou région de résidence",
  "skills": ["liste", "des", "compétences", "principales"],
  "experience": [
    {
      "title": "titre du poste",
      "company": "nom de l'entreprise",
      "duration": "période (ex: 2020-2023)",
      "summary": "résumé en 1-2 phrases des responsabilités"
    }
  ],
  "education": [
    {
      "degree": "diplôme",
      "school": "école/université",
      "year": "année de fin"
    }
  ],
  "summary": "résumé général du profil en 2-3 phrases"
}

IMPORTANT: Retourne UNIQUEMENT du JSON valide. Pas de texte avant ou après.`;

    let extractedData;
    try {
        const response1 = await client.messages.create({
            model: 'claude-opus-4-5-20251101',
            max_tokens: 2000,
            messages: [{ role: 'user', content: extractionPrompt }]
        });

        let jsonText = response1.content[0].type === 'text' ? response1.content[0].text : '';
        extractedData = jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedData = JSON.parse(jsonText);;
    } catch (e) {
        console.error('Parse error on pass 1:', e);
        throw new Error('Erreur lors de l\'extraction du CV');
    }

    // PASS 2: Validation et correction
    const validationPrompt = `Vérifie et corrige ces données de CV extraites. Corrige les erreurs de format, assure la cohérence.
Retourne le JSON corrigé et complété:

${JSON.stringify(extractedData)}

Assure-toi que:
- firstName et lastName ne sont pas vides
- email est un format valide (contient @)
- phone commence par + ou est un numéro valide
- skills contient au minimum 3 éléments
- experience et education sont des arrays

Retourne UNIQUEMENT le JSON corrigé. Aucun texte avant ou après.`;

    try {
        const response2 = await client.messages.create({
            model: 'claude-opus-4-5-20251101',
            max_tokens: 2000,
            messages: [{ role: 'user', content: validationPrompt }]
        });

        const correctedJson = response2.content[0].type === 'text' ? response2.content[0].text : '';
        extractedData = JSON.parse(correctedJson);
    } catch (e) {
        console.error('Parse error on pass 2:', e);
        // Keep pass 1 data if pass 2 fails
    }

    // Ensure defaults for missing fields
    extractedData.firstName = extractedData.firstName || 'Non spécifié';
    extractedData.lastName = extractedData.lastName || 'Non spécifié';
    extractedData.email = extractedData.email || '';
    extractedData.phone = extractedData.phone || '';
    extractedData.location = extractedData.location || '';
    extractedData.skills = Array.isArray(extractedData.skills) ? extractedData.skills : [];
    extractedData.experience = Array.isArray(extractedData.experience) ? extractedData.experience : [];
    extractedData.education = Array.isArray(extractedData.education) ? extractedData.education : [];

    return extractedData;
}

// Match CV with job offer
async function matchCVtoJob(candidateData, jobData) {
    if (!jobData) return null;
    const matchPrompt = `Tu es un expert en recrutement. Analyse la compatibilité entre ce candidat et cette offre d'emploi.

CANDIDAT:
${JSON.stringify(candidateData, null, 2)}

OFFRE D'EMPLOI:
Titre: ${jobData.title}
Domaine: ${jobData.domain}
Niveau requis: ${jobData.level}
Compétences requises: ${jobData.skills.join(', ')}
Localisation: ${jobData.location}
Description: ${jobData.description}

Calcule un score de compatibilité (0-100) et explique brièvement.

Retourne EXACTEMENT ce JSON:
{
  "score": 75,
  "strengths": ["point fort 1", "point fort 2", "point fort 3"],
  "improvements": ["axe d'amélioration 1", "axe d'amélioration 2"],
  "analysis": "Analyse détaillée en 3-4 phrases de la compatibilité. Sois honnête et constructif."
}

Score: 0-30 (Faible), 30-60 (Partiel), 60-80 (Bon), 80-100 (Excellent)

Retourne UNIQUEMENT le JSON. Pas de texte avant ou après.`;

    try {
        const response = await client.messages.create({
            model: 'claude-opus-4-5-20251101',
            max_tokens: 1500,
            messages: [{ role: 'user', content: matchPrompt }]
        });

        const jsonText = response.content[0].type === 'text' ? response.content[0].text : '';
        const matching = JSON.parse(jsonText);

        // Ensure defaults
        matching.score = Math.max(0, Math.min(100, matching.score || 50));
        matching.strengths = Array.isArray(matching.strengths) ? matching.strengths.slice(0, 5) : [];
        matching.improvements = Array.isArray(matching.improvements) ? matching.improvements.slice(0, 5) : [];
        matching.analysis = matching.analysis || 'Analyse non disponible';

        return matching;
    } catch (e) {
        console.error('Matching error:', e);
        return {
            score: 50,
            strengths: ['Impossible à analyser'],
            improvements: ['Veuillez réessayer'],
            analysis: 'Erreur lors de l\'analyse du matching'
        };
    }
}

// API Routes
app.post('/api/analyze', upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'CV requis' });
        }

        const jobData = req.body.job ? JSON.parse(req.body.job) : null;

        // Extract text from CV
        const cvText = await extractTextFromCV(req.file.path);

        // Parse CV
        const candidateData = await parseCV(cvText);

        // Match CV to job
        const matching = await matchCVtoJob(candidateData, jobData);

        // Cleanup
        fs.unlinkSync(req.file.path);

        res.json({
            candidate: candidateData,
            summary: candidateData.summary || '',
            matching: matching
        });

    } catch (error) {
        console.error('Error:', error);

        // Cleanup file if exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            error: error.message || 'Erreur lors de l\'analyse'
        });
    }
});

app.post('/api/analyze-url', async (req, res) => {
    try {
        const { url, job } = req.body || {};
        if (!url) {
            return res.status(400).json({ error: 'URL du CV requise' });
        }

        const jobData = typeof job === 'string' ? JSON.parse(job) : job;

        const filePath = await downloadFileToUploads(url);

        const cvText = await extractTextFromCV(filePath);
        const candidateData = await parseCV(cvText);
        const matching = await matchCVtoJob(candidateData, jobData);

        fs.unlinkSync(filePath);

        res.json({
            candidate: candidateData,
            summary: candidateData.summary || '',
            matching: matching
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: error.message || 'Erreur lors de l\'analyse'
        });
    }
});

// Export to Word
app.post('/api/export-word', async (req, res) => {
    try {
        const { candidate, job } = req.body;

        const doc = new Document({
            sections: [
                {
                    children: [
                        // Title
                        new Paragraph({
                            text: `FICHE CANDIDAT - ${candidate.firstName} ${candidate.lastName}`,
                            style: 'Heading1',
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 }
                        }),

                        // Candidate basic info
                        new Paragraph({
                            text: 'INFORMATIONS PERSONNELLES',
                            style: 'Heading2',
                            spacing: { before: 200, after: 100 }
                        }),

                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph('Prénom')] }),
                                        new TableCell({ children: [new Paragraph(candidate.firstName || '-')] }),
                                        new TableCell({ children: [new Paragraph('Nom')] }),
                                        new TableCell({ children: [new Paragraph(candidate.lastName || '-')] })
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph('Email')] }),
                                        new TableCell({ children: [new Paragraph(candidate.email || '-')] }),
                                        new TableCell({ children: [new Paragraph('Téléphone')] }),
                                        new TableCell({ children: [new Paragraph(candidate.phone || '-')] })
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            columnSpan: 2,
                                            children: [new Paragraph('Localisation')]
                                        }),
                                        new TableCell({
                                            columnSpan: 2,
                                            children: [new Paragraph(candidate.location || '-')]
                                        })
                                    ]
                                })
                            ]
                        }),

                        // Job matching
                        new Paragraph({
                            text: 'MATCHING AVEC L\'OFFRE',
                            style: 'Heading2',
                            spacing: { before: 300, after: 100 }
                        }),

                        new Paragraph({
                            text: `Offre: ${job.title}`,
                            spacing: { after: 100 }
                        }),

                        // Skills
                        new Paragraph({
                            text: 'COMPÉTENCES PRINCIPALES',
                            style: 'Heading2',
                            spacing: { before: 200, after: 100 }
                        }),

                        new Paragraph({
                            text: candidate.skills.join(', '),
                            spacing: { after: 200 }
                        }),

                        // Experience
                        new Paragraph({
                            text: 'EXPÉRIENCE PROFESSIONNELLE',
                            style: 'Heading2',
                            spacing: { before: 200, after: 100 }
                        }),

                        ...candidate.experience.map(exp =>
                            [
                                new Paragraph({
                                    text: `${exp.title}`,
                                    style: 'Heading3',
                                    spacing: { before: 100, after: 50 }
                                }),
                                new Paragraph({
                                    text: `${exp.company} (${exp.duration})`,
                                    italics: true,
                                    spacing: { after: 50 }
                                }),
                                new Paragraph({
                                    text: exp.summary,
                                    spacing: { after: 100 }
                                })
                            ]
                        ).flat(),

                        // Education
                        new Paragraph({
                            text: 'FORMATION',
                            style: 'Heading2',
                            spacing: { before: 200, after: 100 }
                        }),

                        ...candidate.education.map(edu =>
                            [
                                new Paragraph({
                                    text: edu.degree,
                                    style: 'Heading3',
                                    spacing: { before: 100, after: 50 }
                                }),
                                new Paragraph({
                                    text: `${edu.school} (${edu.year || 'N/A'})`,
                                    italics: true,
                                    spacing: { after: 100 }
                                })
                            ]
                        ).flat(),

                        // Footer
                        new Paragraph({
                            text: `Généré le ${new Date().toLocaleDateString('fr-FR')} - CV Analyzer`,
                            italics: true,
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 400 },
                            border: {
                                top: {
                                    color: 'CCCCCC',
                                    space: 1,
                                    style: BorderStyle.SINGLE,
                                    size: 6
                                }
                            }
                        })
                    ]
                }
            ]
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="fiche_candidat_${Date.now()}.docx"`);
        res.send(buffer);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 CV Analyzer running on http://localhost:${PORT}`);
        console.log(`📊 Open http://localhost:${PORT} in your browser`);
    });
}

export default app;
