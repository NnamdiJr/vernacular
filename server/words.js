"use strict";

module.exports.end = '$END$';

const word_re = module.exports.word_re = /([\w']+)/g;
const word_re_full = module.exports.word_re_full = /^([\w']+)$/g;

const normalizeLine = module.exports.normalizeLine = line =>
    line.toLowerCase().trim();

const normalizeWord = module.exports.normalizeWord = word =>
    word.toLowerCase().trim();

const getWords = module.exports.getWords = line =>
    line.match(word_re)
        .map(normalizeWord)
        .filter(x => x.length);
