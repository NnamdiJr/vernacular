"use strict";
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const dictFile = path.join(__dirname, '..', 'all.data');

module.exports = (z, f) => {
    const input = fs.createReadStream(dictFile);
    const lineReader = readline.createInterface({ input });

    return new Promise((resolve, reject) => {
        lineReader.on('line', line => {
            z = f(z, line);
        });

        lineReader.on('close', line => {
            resolve(z);
        })
    });
};

