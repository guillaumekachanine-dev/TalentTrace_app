# Offres d'emploi EXPERIS pour tester CV Analyzer

## Offre 1 : Développeur Python Senior

```json
{
  "title": "Développeur Python Senior",
  "domain": "IT",
  "level": "Senior",
  "skills": ["Python", "FastAPI", "Django", "PostgreSQL", "AWS", "Docker", "Kubernetes"],
  "location": "Sophia-Antipolis (télétravail possible)",
  "description": "Nous cherchons un développeur Python Senior expérimenté pour rejoindre notre équipe R&D. Vous serez responsable de l'architecture et du développement de nos microservices cloud. Vous devez avoir minimum 5 ans d'expérience en Python et AWS."
}
```

**Pour tester :** Charger `example-cv.txt` → Devrait avoir ~85% score

---

## Offre 2 : Consultant Fonctionnel ERP

```json
{
  "title": "Consultant Fonctionnel ERP",
  "domain": "Consulting",
  "level": "Confirmé",
  "skills": ["SAP", "ERP", "Processus métier", "Gestion de projets", "Documentation fonctionnelle"],
  "location": "Sophia-Antipolis",
  "description": "Consultante/Consultant pour missions de configuration et déploiement ERP chez nos clients grands comptes. Vous accompagnerez les clients sur la définition de leurs processus métier et l'optimisation de leur ERP."
}
```

---

## Offre 3 : Chargé de Recrutement IT

```json
{
  "title": "Chargé de Recrutement IT",
  "domain": "HR",
  "level": "Confirmé",
  "skills": ["Recrutement IT", "Sourcing", "LinkedIn", "Gestion de candidats", "Relationnel client"],
  "location": "Sophia-Antipolis",
  "description": "Rejoignez notre équipe recrutement spécialisée dans le placement IT. Vous serez responsable du sourcing, de la présélection et du suivi des candidats pour les besoins IT de nos clients."
}
```

---

## Offre 4 : Ingénieur Réseau Cloud

```json
{
  "title": "Ingénieur Réseau Cloud",
  "domain": "IT",
  "level": "Senior",
  "skills": ["AWS", "Azure", "Networking", "Terraform", "VPN", "Sécurité réseau"],
  "location": "Sophia-Antipolis",
  "description": "Ingénieur réseau spécialisé dans l'infrastructure cloud. Vous gérez l'architecture réseau, la sécurité et l'optimisation pour nos clients cloud AWS/Azure."
}
```

---

## Offre 5 : Product Owner Logiciel

```json
{
  "title": "Product Owner Logiciel",
  "domain": "IT",
  "level": "Senior",
  "skills": ["Agile", "JIRA", "Gestion de backlog", "Communication", "Analyse métier"],
  "location": "Sophia-Antipolis",
  "description": "Product Owner pour piloter la roadmap d'un produit SaaS en croissance. Vous collaborerez avec stakeholders, devs et clients pour définir et prioriser les features."
}
```

---

## Comment utiliser

### Méthode 1 : Copy-paste dans l'app

1. Ouvrez l'app CV Analyzer
2. Tab "Créer une Offre"
3. Remplissez les champs manuellement en vous basant sur les exemples

### Méthode 2 : Import JSON (Phase 2)

Sera implémenté pour importer directement ces offres.

### Méthode 3 : Offres du CRM (Phase 3)

Connexion directe à Salesforce EXPERIS pour importer les offres actives.

---

## Testing Checklist

- [ ] Créer offre "Développeur Python Senior"
- [ ] Charger `example-cv.txt`
- [ ] Analyser → Score devrait être 80%+ ✓
- [ ] Exporter en Word
- [ ] Vérifier fiche générée

---

**Conseil:** Pour vos vrais CVs, préférez les format PDF/DOCX à TXT.
Cet exemple en TXT est juste pour démonstration rapide.
