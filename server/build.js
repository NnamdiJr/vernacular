"use strict";
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const words = require('./words');


const build = (file) => {
    console.log("Building trie");
    const input = fs.createReadStream(file);
    const lineReader = readline.createInterface({ input });

    const data = {};
    
    return new Promise((resolve, reject) => {
        lineReader.on('line', line => {
            const normalizedLine = words.normalizeLine(line);
            
            const keys = words.getWords(normalizedLine);
            
            // Skip non-exact 1 word entries
            if (keys.length === 1 && keys[0] !== normalizedLine)
                return;
            
            let d = data;
            for (const key of keys) {
                d = d[key] = d[key] || {};
            }

            d[words.end] = line;
        });

        lineReader.on('close', line => {
            console.log('Finished trie')
            resolve(data);
        })
    });
};

module.exports = build(path.join(__dirname, '..', 'all.data'));