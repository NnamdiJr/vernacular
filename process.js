#!/usr/bin/env node
/**
 * Simple script used to extract all occurrences of Urban Dictionary words from
 * example texts.
 */
"use strict";
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const sub = require('./server/sub');
const trie = require('./server/build');
const words = require('./server/words');

const END_OF_SENTANCE = /(((\.|!|\?)(\s|"|\-\-|\r\n|\n|$))|(\r\n\r\n|\n\n))/;

/**
 * Convert array of tokens to a string.
 */
const toText = (x) => {
    if (x.tokens)
        return x.tokens.map(x => x.token).join('');
    return x.token;
};

const flattenToken = (token) =>
    token.tokens || [token];

/**
 * Find sentance context before `start`.
 */
const getPre = (tokens, start, max_context) => {
    const output = [];
    let done = false;
    for (let i = start; i >= 0 && !done && output.length < max_context; --i) {
        for (const {token} of flattenToken(tokens[i]).reverse()) {
            if (token.match(END_OF_SENTANCE)) {
                done = true;
                break;
            }
            output.unshift(token);
        }
    }

    return output.join('');
};

/**
 * Find sentance context before `start`.
 */
const getPost = (tokens, start, max_context) => {
   const output = [];
    let done = false;
    for (let i = start, len = tokens.length; i < len && !done && output.length < max_context; ++i) {
        for (const {token} of flattenToken(tokens[i])) {
            if (token.match(END_OF_SENTANCE)) {
                done = true;
                output.push('.')
                break;
            }
            output.push(token);
        }
    }

    return output.join('');
};

/**
 * Get the sentance around a found entry.
 */
const getContext = (tokens, found, max_context) => {
    const i = found.i;
    return {
        pre: getPre(tokens, i - 1, max_context),
        word: toText(found),
        post: getPost(tokens, i + 1, max_context)
    };
};

const getEntry = (tokens, found, max_context) => {
    const context = getContext(tokens, found, max_context);
    context.synonym = found.synonym;
    context.i = found.i;
    return context;
}

const getEntries = (tokens, indicies, max_context) =>
    indicies.map(x => getEntry(tokens, x, max_context));

/**
 * Filter and order the results from `sub`.
 */
const processResult = (tokens, min_length) => {
    let indicies = [];
    let i = 0;
    for (const t of tokens) {
        const numWords = (t.tokens || []).reduce(
            (sum, c) => c.token.match(words.word_re_full) ? sum + 1 : sum,
            0);
        if (numWords >= min_length)
            indicies.push({
                i: i,
                tokens: t.tokens,
                synonym: t.synonym
            });
        ++i;
    }

    indicies.sort((a, b) => b.tokens.length - a.tokens.length);
    return {
        tokens: tokens,
        indicies: indicies
    };
};

/**
 * Write the result to a file.
 */
const outputEntries = (entries, outputFile) =>
    fs.writeFile(outputFile, JSON.stringify(entries, null, 4), (err) => {
        if (err)
            console.error(err);
    });


const processFile = (input, output, argv) => {
    const data = fs.readFileSync(input, 'utf-8');
    const tokens = data.split(words.word_re).map(x => ({ token: x }));

    return trie.then(trie => sub.tokens(trie, tokens))
        .then(x => processResult(x, +argv.min_length))
        .then(x => getEntries(x.tokens, x.indicies, +argv.max_context))
        .then(x => outputEntries(x, output))
        .catch(console.error);
};

const argv = require('yargs')
    .usage('Usage: $0 input_file -o output_file --min_length=[num] --max_context=[num]')
    .demand(1)
    .demand('o')
    .alias('o', 'output')
    .describe('o', 'output file')
    
    .default('min_length', 1)
    .describe('min_length', 'minimum length matches to find')
    .default('max_context', 100)
    .describe('max_context', 'maximum length of surrounding context to use')
    .argv;

const input = argv._[0];

if (fs.lstatSync(input).isDirectory()) {
    let files = fs.readdirSync(input);
    files = files.filter(x => fs.lstatSync(path.join(input, x)).isFile());
    
    const getFile = (files) => {
        if (!files.length)
            return Promise.resolve(null);
        
        const file = files[0];
        const name = path.basename(file, '.txt');
        console.log(name);
        processFile(path.join(input, file), path.join(argv.output, name + '.json'), argv)
            .then(x => getFile(files.slice(1)))
    };
    getFile(files);
} else {
    processFile(input, argv.output, argv);
}
