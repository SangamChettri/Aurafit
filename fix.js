const fs = require('fs');
const filePath = 'frontend/src/screens/workout/WorkoutLogScreen.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// Find the second "import React..."
let reactImportCount = 0;
let secondImportLineIdx = -1;

for (let i = 0; i < 30; i++) {
    if (lines[i] && lines[i].startsWith("import React")) {
        reactImportCount++;
        if (reactImportCount === 2) {
            secondImportLineIdx = i;
            break;
        }
    }
}

if (secondImportLineIdx !== -1) {
    // Delete lines 14 to 26 (indices 13 to 25)
    // Wait, the index of second import is 13 (line 14)
    // And "import { useNavigation, useRoute }" is at line 26 (index 25)
    let endIdx = -1;
    for (let i = secondImportLineIdx; i < lines.length; i++) {
        if (lines[i].includes("@react-navigation/native")) {
            endIdx = i;
            break;
        }
    }

    if (endIdx !== -1) {
        lines.splice(secondImportLineIdx, endIdx - secondImportLineIdx + 1);
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log("Fixed successfully!");
    } else {
        console.log("Could not find end of duplicate imports.");
    }
} else {
    console.log("No duplicate React import found.");
}
