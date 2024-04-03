const variables = {
    "Forced labor" : [
        "(debt )?bondage",
        "(abolition of )?(involuntary|indentured|bonded|forced|compulsory) (labou?r( convention)?|servitude)",
        "(modern )?slavery",
        "enslavement",
        "against (their|his|her) will",
        "voluntary employment",
        "employment is chosen freely",
        "bonded nor forced",
        "forced nor bonded",
        "Human trafficking",
        "(Human )?exploitation",
        "Exploitation",
    ],
    "Child labor" : [
        "(Worst Forms of )?child labou?r( convention)?",
        "Minimum age( convention)?",
        "minor( employees)?",
        "underage",
        "(employ )?children( employed)?",
    ],
    "Discrimination" : [
        "Discriminat(e|ion) (in)?\\(?employment and occupation\\)?( convention)?",
        "Equal (treatment|Remuneration)( convention)?",
    ],
    "Freedom of association & collective bargaining": [
        "(form|join) a trade union",
        "freedom of Association",
        "the right to organise convention",
        "(Right to )?organi(s|z)e free(ly)?",
        "trade union rights",
        "workers?(’|')?( and employers(’|')?)? organi(s|z)ations?",
    ],
    "Collective bargaining" : [
        "bargain collectively",
        "Collective Bargaining",
        "Negotiate collectively",
        "Collective negotiation",
    ],
    "Health": [
        "Healthy?" 
    ],
    "Safety": [
        "Safe(ty)?",
    ],
}

let savedText = "";
const allVariables = Object.keys(variables);

function joinRegexesArray(regexes){
    const joinedRegex = regexes.join("|")
    return joinedRegex
};

function searchForTerms(array, text) {
    const joinedRegex = joinRegexesArray(array);
    const regex = new RegExp(joinedRegex, "gi");
    let matches = [];
    let match;

    // Helper-functie om context rondom elke match te verkrijgen
    function getContext(matchIndex, matchLength) {
        const start = Math.max(0, matchIndex - 100);
        const end = Math.min(text.length, matchIndex + matchLength + 100);
        return text.substring(start, end);
    }

    while ((match = regex.exec(text)) !== null) {
        const matchText = match[0];
        const matchContext = getContext(match.index, matchText.length);
        // Voeg een object toe aan de matches lijst met de match tekst, de index, en de context
        matches.push({match: matchText, index: match.index, context: matchContext});
    }

    return matches;
};

function displayResultsInTable(resultsByCategory) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.setAttribute('border', '1');

    // Header rij met categorieën
    const header = table.createTHead();
    const headerRow = header.insertRow();

    // Voeg kolommen toe voor categorie naam, match, context en de highlight actie
    ['Categorie', 'Match', 'Context', 'Actie'].forEach(headerText => {
        let headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    const body = table.createTBody();

    Object.entries(resultsByCategory).forEach(([category, matches]) => {
        matches.forEach(match => {
            const row = body.insertRow();

            // Categorie naam
            let cell = row.insertCell();
            cell.textContent = category;

            // Match tekst
            cell = row.insertCell();
            cell.textContent = match.match;

            // Match context
            cell = row.insertCell();
            cell.textContent = match.context;

            // Highlight knop
            cell = row.insertCell();
            const highlightButton = document.createElement('button');
            highlightButton.textContent = 'Highlight';
            highlightButton.onclick = () => highlightText(match.context);
            cell.appendChild(highlightButton);
        });
    });

    const resultsDiv = document.getElementById('output');
    resultsDiv.innerHTML = ''; // Leegmaken van eerdere resultaten
    resultsDiv.appendChild(table);
};

function analyze() {
    const fileInput = document.getElementById('file');
    const input = fileInput.files[0];
    const reader = new FileReader();

    reader.readAsText(input);
    reader.onload = function() {
        const text = reader.result;
        savedText = text;
        document.getElementById("text").textContent = text;
        // Object om de resultaten per categorie op te slaan
        const resultsByCategory = {};

        // Door alle categorieën itereren
        Object.entries(variables).forEach(([category, regexArray]) => {
            // Zoek naar termen voor de huidige categorie
            const matches = searchForTerms(regexArray, text);
            // Sla de matches op onder de juiste categorie
            if (matches && matches.length > 0) {
                resultsByCategory[category] = matches;
            }
        });

        // Toon de resultaten in een tabel
        displayResultsInTable(resultsByCategory);
    };
};

function resetText () {
    document.getElementById("text").textContent = savedText;
};

function escapeRegExp(string) {
    // Escape speciale RegExp karakters
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& staat voor het hele matchende string
                 .replace(/&/g, '&amp;'); // Zet '&' om in '&amp;' voor matching in HTML
}

function highlightText(searchString) {
    resetText(); // Zet de tekst terug naar zijn originele staat

    const textElement = document.getElementById('text');
    if (!textElement) return; // Als het element niet bestaat, stop de functie

    // Escape speciale RegExp karakters in de zoekstring, inclusief omzetting van "&" naar "&amp;"
    const escapedSearchString = escapeRegExp(searchString);
    const searchRegex = new RegExp(escapedSearchString, 'gi'); // 'g' voor global search, 'i' voor case insensitive

    // Vervang het gezochte stukje tekst met een `<span>` dat de class "highlight" heeft
    const highlightedText = textElement.innerHTML.replace(searchRegex, match => `<span id="found" class="highlight">${match}</span>`);

    // Update de HTML van het textElement met de nieuwe string die de highlights bevat
    textElement.innerHTML = highlightedText;

    // Scroll naar de eerste highlight
    const highlightElement = document.getElementById('found');
    if (highlightElement) {
        highlightElement.scrollIntoView();
    }
};