"use strict";
var shuffle = require('shuffle-array');
const build = require('./load_dict');

const INTERVAL = 250;

class Noise {
    constructor() {
        this.updateTimeout = 0;
        this.index = 0;
        this.listeners = new Set();

        this.words = build([], (arr, c) => {
            arr.push(c);
            return arr;
        }).then(shuffle);
    }

    addListener(res) {
        this.listeners.add(res);
        if (!this.updateTimeout) {
            this.updateTimeout = setInterval(() => this.updateListeners(), INTERVAL);
        }
    }

    removeListener(req) {
        this.listeners.delete(req);
        if (this.listeners.length === 0) {
            clearInterval(this.updateTimeout);
            this.updateTimeout = null;
        }
    }

    updateListeners() {
        this.words.then(words => {
            ++this.index;
            this.index %= words.length;
            
            const word = words[this.index];
            for (const res of this.listeners) {
                res.write('id: ' + this.index + '\n');
                res.write("data: " + word + '\n\n');
            }
        });
    }
}

module.exports = Noise;