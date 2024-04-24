let variables = {
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
"forced labour",

    ],
    "Child labour" : [
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
};
// Globaal object om originele teksten op te slaan
let savedTexts = {};

const codesOfConduct = [
    "Kopie van Agnico Eagle Mines Ltd CC.txt",
    "Kopie van Agnico Eagle Mines Ltd SC.txt",
    "Kopie van Bank of Montreal CC.txt",
    "Kopie van Bank of Montreal SC.txt",
    "Kopie van BCE Inc CC.txt",
    "Kopie van BCE Inc SC.txt",
    "Kopie van Cameco Corp CC.txt",
    "Kopie van Cameco Corp SC.txt",
    "Kopie van Canadian Tire Corporation Ltd CC.txt",
    "Kopie van Canadian Tire Corporation Ltd SC.txt",
    "Kopie van CGI Inc CC.txt",
    "Kopie van CGI Inc SC.txt",
    "Kopie van Dollarama Inc CC.txt",
    "Kopie van Dollarama Inc SC.txt",
    "Kopie van Enbridge Inc CC.txt",
    "Kopie van Enbridge Inc SC.txt",
    "Kopie van Franco-Nevada Corp CC.txt",
    "Kopie van Franco-Nevada Corp SC.txt",
    "Kopie van Hydro One Ltd CC.txt",
    "Kopie van Hydro One Ltd SC.txt",
    "Kopie van Kinross Gold Corp CC.txt",
    "Kopie van Kinross Gold Corp SC.txt",
    "Kopie van Magna International Inc CC.txt",
    "Kopie van Magna International Inc SC.txt",
    "Kopie van Manulife Financial Corp CC.txt",
    "Kopie van Manulife Financial Corp SC.txt",
    "Kopie van Nutrien Ltd CC.txt",
    "Kopie van Nutrien Ltd SC.txt",
    "Kopie van Open Text Corp CC.txt",
    "Kopie van Open Text Corp SC.txt",
    "Kopie van Power Corporation of Canada CC.txt",
    "Kopie van Power Corporation of Canada SC.txt",
    "Kopie van SNC-Lavalin Group Inc CC.txt",
    "Kopie van SNC-Lavalin Group Inc SC 1.txt",
    "Kopie van Suncor Energy Inc CC.txt",
    "Kopie van Suncor Energy Inc SC.txt",
    "Kopie van Thomson Reuters Corp CC.txt",
    "Kopie van Thomson Reuters Corp SC.txt",
    "Kopie van Wheaton Precious Metals Corp CC.txt",
    "Kopie van Wheaton Precious Metals Corp SC.txt",
];
const allResults = {};
const allVariables = Object.keys(variables);
const webAppURL = "https://script.google.com/macros/s/AKfycbxIWAawYoA85OJiBRioZjRvmWzcFl1IevRBE5LfR7iXkZMXfU70FYgmETKqWwcwqYtq/exec";
const form = document.forms['researchForm'];
const nextButton = document.getElementById('next');
const previousButton = document.getElementById('previous');
const container = document.getElementById('questionContainer');

let currentCode = 0;
let currentID = "1";
let savedText = "";
let allIDs = [];
let currentStandardIndex = 0;

function loadFileRegExp() {
    const input = document.getElementById('RegExpfileInput');
    if (!input.files.length) {
        alert('Selecteer eerst een bestand.');
        return;
    }

    let file = input.files[0];

    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        const sections = content.split('\n\r');
        const newVariables = {};

        sections.forEach(section => {
            const lines = section.trim().split('\n');
            if (lines.length > 1) {
                const key = lines[0].trim();
                const regexps = lines.slice(1).map(line => line.replaceAll("\\\\", "\\").trim()).filter(line => line.length > 0);
                newVariables[key] = regexps;
            }
        });

        // Toon de geladen data
        document.getElementById('fileContent').innerText = JSON.stringify(newVariables, null, 2);
            
        // set variables to the loaded variables
        variables = newVariables;
    };

    reader.readAsText(file);

};
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
function displayResultsInTable(resultsByCategory, textParagraph, index) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.setAttribute('border', '1');

    // Header rij met categorieën
    const header = table.createTHead();
    const headerRow = header.insertRow();

    // Voeg kolommen toe voor categorie naam, match, context en de highlight actie
    ['Categorie', 'Match', 'Context', 'Actie'].forEach(headerText => {
        let headerCell = document.createElement('th');
        headerCell.innerText = headerText;
        headerRow.appendChild(headerCell);
    });

    const body = table.createTBody();

    Object.entries(resultsByCategory).forEach(([category, matches]) => {
        matches.forEach(match => {
            const row = body.insertRow();

            // Categorie naam
            let cell = row.insertCell();
            cell.innerText = category;

            // Match tekst
            cell = row.insertCell();
            cell.innerText = match.match;

            // Match context
            cell = row.insertCell();
            cell.innerText = match.context;

            // Highlight knop
            cell = row.insertCell();
            const highlightButton = document.createElement('button');
            highlightButton.innerText = 'Highlight';
            highlightButton.onclick = () => highlightText(match.context, textParagraph, index);
            cell.appendChild(highlightButton);
        });
    });
    
    return table
};
async function analyze() {
    const fileInput = document.getElementById('file');
    const allOutputs = document.getElementById('allOutputs');
    const containers = new Array(fileInput.files.length); // Vooraf gedefinieerde array voor de containers

    let fileReaders = Array.from(fileInput.files).map((file, index) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsText(file);
            reader.onload = function() {
                const resultsByCategory = {};
                const containerDiv = document.createElement('div');
                containerDiv.classList.add('containerDiv');
                containerDiv.id = 'container-' + index; // Unieke ID

                const textParagraph = document.createElement('p');
                textParagraph.innerText = reader.result;
                textParagraph.classList.add('textParagraph');

                savedTexts[index] = reader.result;

                Object.entries(variables).forEach(([category, regexArray]) => {
                    const matches = searchForTerms(regexArray, reader.result);
                    if (matches && matches.length > 0) {
                        resultsByCategory[category] = matches;
                    }
                });

                allResults[file.name] = resultsByCategory;

                const minimizeButton = document.createElement('button');
                minimizeButton.innerText = 'Maximaliseer';
                minimizeButton.className = 'minimizeButton';
                minimizeButton.onclick = toggleTextSize;

                const resetReadableButton = document.createElement('button');
                resetReadableButton.innerText = 'Reset';
                resetReadableButton.className = 'resetButton';
                resetReadableButton.onclick = () => resetText(textParagraph, index, true);

                const table = displayResultsInTable(resultsByCategory, textParagraph, index);
                table.className = 'table';

                containerDiv.appendChild(minimizeButton);
                containerDiv.appendChild(resetReadableButton);
                containerDiv.appendChild(textParagraph);
                containerDiv.appendChild(table);
                
                containers[index] = containerDiv; // Sla het containerDiv op in de juiste volgorde

                resolve();
            };
        });
    });

    await Promise.all(fileReaders); // Wacht tot alle bestanden zijn verwerkt

    // Voeg nu alle containers toe aan het DOM in de correcte volgorde
    containers.forEach(container => {
        if (container) allOutputs.appendChild(container);
        container.querySelector('.minimizeButton').click(); // Minimaliseer de tekst na toevoeging
    });

    generateOverviewTable(allResults); // Genereer de overzichtstabel na verwerking van alle bestanden
}

function generateOverviewTable() {
    const allCategories = new Set(); // Set om alle unieke categorieën op te slaan

    // Verzamel alle categorieën uit allResults
    Object.values(allResults).forEach(result => {
        Object.keys(result).forEach(category => {
            allCategories.add(category);
        });
    });

    // Maak de tabel en header
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    const firstCell = headerRow.insertCell();
    firstCell.innerText = 'Document';

    // Voeg een kolom toe voor elke categorie in de header
    allCategories.forEach(category => {
        const cell = headerRow.insertCell();
        cell.innerText = category;
    });

    //headerRow.insertCell().innerText = 'Upload'; // Voeg een extra kolom toe voor de upload knop

    // Voeg een rij toe voor elk document
    Object.entries(allResults).forEach(([fileName, categories]) => {
        const row = table.insertRow();
        const fileNameCell = row.insertCell();
        fileNameCell.innerText = fileName;

        const rowData = {}; // Dit object zal de data voor de huidige rij bevatten

        // Controleer elke categorie en voeg een 1 of 0 toe
        allCategories.forEach(category => {
            const cell = row.insertCell();
            const value = categories.hasOwnProperty(category) ? '1' : '0';
            cell.innerText = value;
            rowData[category] = value; // Voeg data toe aan het JSON object
        });
        
        // const uploadCell = row.insertCell();
        // const uploadButton = document.createElement('button');
        // uploadButton.innerText = 'Upload';
        // // add ID to the data
        // rowData['ID'] = currentID;
        // uploadButton.onclick = async () => {
        //     const response = await submitJsonData(rowData); // Verzend de specifieke rij data
        //     console.log(response);
        // }
        // uploadCell.appendChild(uploadButton);
    });

    // Voeg de tabel toe aan de pagina
    const outputDiv = document.getElementById('summaryOutput');
    outputDiv.innerHTML = ''; // Leeg de bestaande inhoud indien aanwezig
    outputDiv.appendChild(table);
}

function toggleTextSize(event) {
    const parent = event.target.parentElement;
    const paragraph = parent.querySelector('.textParagraph');
    if (paragraph.style.maxHeight === '100px') {
        paragraph.style.maxHeight = 'none'; // Uitklappen
        event.target.innerText = 'Minimaliseer';
    } else {
        paragraph.style.maxHeight = '100px'; // Inklappen
        event.target.innerText = 'Maximaliseer';
    }
};

function resetText(textParagraph, index, readAble = false) {
    if (readAble) {
        textParagraph.innerText = savedTexts[index]; // Herstel de originele tekst
    } else {
        textParagraph.innerHTML = savedTexts[index]; // Herstel de originele HTML van elk tekstblok
    }
};

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape speciale RegExp karakters
                 .replace(/&/g, '&amp;'); // Zet '&' om in '&amp;' voor matching in HTML
};

function highlightText(searchString, textParagraph, index) {
    resetText(textParagraph, index); // Zet de teksten terug naar hun originele staat

    const escapedSearchString = escapeRegExp(searchString);
    const searchRegex = new RegExp(escapedSearchString, 'gi'); // 'g' voor global search, 'i' voor case insensitive


    textParagraph.innerHTML = textParagraph.innerHTML.replace(searchRegex, match => `<span class="highlight">${match}</span>`);


    // Scroll naar de eerste highlight als die er is
    const highlightElement = document.querySelector('.highlight');
    if (highlightElement) {
        highlightElement.scrollIntoView();
    }
};