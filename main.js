const fs = require('fs');
const readline = require('readline');

function extractWordsFromLine(line) {
    // Split the line into individual words using whitespace characters
    const words = line.split(/\s+/);

    // Filter out any empty strings
    const filteredWords = words.filter(word => word.length > 0);

    return filteredWords;
}

let variables = {}; // Store variable names and their values

async function processFile(filePath) {
    try {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity, // Read entire lines
        });

        for await (const line of rl) {
            if (line.includes('print')) {
                const wordsInLine = extractWordsFromLine(line);
                const printIndices = wordsInLine.reduce((indices, word, index) => {
                    if (word.toLowerCase() === 'print') {
                        indices.push(index);
                    }
                    return indices;
                }, []);

                printIndices.forEach(printIndex => {
                    if (printIndex < wordsInLine.length - 1) {
                        const nextWord = wordsInLine[printIndex + 1];
                        if (variables.hasOwnProperty(nextWord)) {
                            console.log(`${variables[nextWord]}`);
                        } else {
                            console.log(`${nextWord}`);
                        }
                    }
                });
            }

            if (line.includes('var')) {
                processVarDeclaration(line);
            }

            if (line.includes('vijay')) {
                console.log("Vijay is a Great Person");
            }

            // Stop searching the line when a semicolon is encountered
            if (line.includes(';')) {
                break;
            }
        }

        console.log('Finished processing the file.');
    } catch (error) {
        console.error('Error reading the file:', error.message);
    }
}

function processVarDeclaration(line) {
    if (line.includes('var')) {
        const wordsInLine = extractWordsFromLine(line);
        const varIndices = wordsInLine.reduce((indices, word, index) => {
            if (word.toLowerCase() === 'var') {
                indices.push(index);
            }
            return indices;
        }, []);

        varIndices.forEach(varIndex => {
            if (varIndex < wordsInLine.length - 1) {
                const varName = wordsInLine[varIndex + 1];
                const value = wordsInLine[varIndex + 3];
                variables[varName] = value;
                console.log(`new var ${varName} = ${value}`);
            }
        });
    }
}

const filePath = 'testing.vs'; // Replace with your actual file path
processFile(filePath);
