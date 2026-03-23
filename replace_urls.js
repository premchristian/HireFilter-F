const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');
const hardcodedUrl = 'https://hire-filter-backend.onrender.com';
const envVar = 'process.env.NEXT_PUBLIC_API_BASE_URL';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // We have several patterns:
    // 1. "https://hire-filter-backend.onrender.com/api/..." -> process.env.NEXT_PUBLIC_API_BASE_URL + "/api/..."
    // 2. 'https://hire-filter-backend.onrender.com/api/...' -> process.env.NEXT_PUBLIC_API_BASE_URL + '/api/...'
    // 3. `https://hire-filter-backend.onrender.com/api/...` -> `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/...`
    // 4. const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hire-filter-backend.onrender.com"; -> We can leave this as is OR just remove the fallback since the user wants the env var to be the main source of truth. Actually, it's safer to just replace "https://..." with process.env.NEXT_PUBLIC_API_BASE_URL if it's standalone, but in a fallback it becomes `process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL` which is redundant but functionally fine, or we can just replace it properly.

    // Let's use regex for each type of quote
    
    // Backticks: `https://hire-filter-backend.onrender.com/api/something` -> `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/something`
    content = content.replace(/`https:\/\/hire-filter-backend\.onrender\.com([^`]*)`/g, "`${" + envVar + "}$1`");
    
    // Double quotes: "https://hire-filter-backend.onrender.com/api/something" -> process.env.NEXT_PUBLIC_API_BASE_URL + "/api/something"
    // EXCEPT when it's already in the fallback: `process.env.NEXT_PUBLIC_API_BASE_URL || "https://hire-filter-backend.onrender.com"`
    // Let's just do a simpler search and replace for the exact string, but check context.
    
    // Let's first clean up the fallback pattern to just the env var
    content = content.replace(/process\.env\.NEXT_PUBLIC_API_BASE_URL \|\| "https:\/\/hire-filter-backend\.onrender\.com"/g, "process.env.NEXT_PUBLIC_API_BASE_URL");
    
    // Double quotes
    content = content.replace(/"https:\/\/hire-filter-backend\.onrender\.com([^"]*)"/g, (match, p1) => {
        if (p1 === "") return envVar;
        return `${envVar} + "${p1}"`;
    });

    // Single quotes
    content = content.replace(/'https:\/\/hire-filter-backend\.onrender\.com([^']*)'/g, (match, p1) => {
        if (p1 === "") return envVar;
        return `${envVar} + '${p1}'`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory(directoryPath);
console.log('Done replacing URLs.');
