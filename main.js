const fs = require('fs');
const readline = require('readline');

function extractWordsFromLine(line) {
    const words = line.split(/\s+/);
    const filteredWords = words.filter(word => word.length > 0);
    return filteredWords;
}

let variables = {};
let usingSystem = false;
let usingSystemExtras = false;

async function processFile(filePath) {
    try {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        for await (const line of rl) {
            if (line.includes('print') && usingSystem) {
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

            if ((line.includes('add') || line.includes('subtract')) && usingSystem) {
                const wordsInLine = extractWordsFromLine(line);
                const operation = wordsInLine[0];
                const operand1 = isNaN(wordsInLine[1]) ? variables[wordsInLine[1]] : parseFloat(wordsInLine[1]);
                const operand2 = isNaN(wordsInLine[2]) ? variables[wordsInLine[2]] : parseFloat(wordsInLine[2]);
                const result = performOperation(operation, operand1, operand2);
                console.log(`Result of ${operation} operation: ${result}`);
            }

            if (line.includes('var') && usingSystem) {
                processVarDeclaration(line);
            }

            if (line.includes('using System') && usingSystem == false) {
                usingSystem = true;
                console.log(filePath + ' is using System');
            }

            if (line.includes('using System.Extras')) {
                usingSystemExtras = true;
                console.log(filePath + ' is using System.Extras');
            }

            if (line.includes(';') && usingSystem) {
                break;
            }
        }

        console.log('Finished processing the file.');
        if (usingSystem == false && usingSystemExtras == false) {
            console.log(filePath + " Is not using System and System.Extras please add the proper usings at the top of your file");
        }
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
                const value = isNaN(wordsInLine[varIndex + 3]) ? wordsInLine[varIndex + 3] : parseFloat(wordsInLine[varIndex + 3]);
                variables[varName] = value;
                console.log(`new var ${varName} = ${value}`);
            }
        });
    }
}

function performOperation(operation, operand1, operand2) {
    switch (operation) {
        case 'add':
            return operand1 + operand2;
        case 'subtract':
            return operand1 - operand2;
        default:
            console.log(`Unsupported operation: ${operation}`);
            return null;
    }
}

const filePath = 'testing.vs';
processFile(filePath);
