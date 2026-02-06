// Ajoute cette fonction avant parseCV
function cleanJsonResponse(text) {
    // Enlève les backticks et "json"
    return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}
