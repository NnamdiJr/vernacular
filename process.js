/**
 * Simple script used to extract all occurrences of Urban Dictionary words from
 * example texts.
 */
"use strict";
const fs = require('fs');
const sub = require('./server/sub');
const trie = require('./server/build');
const words = require('./server/words');

const MIN_LENGTH = 3;

const MAX_CONTEXT = 50;
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
const getPre = (tokens, start) => {
    const output = [];
    let done = false;
    for (let i = start; i >= 0 && !done && output.length < MAX_CONTEXT; --i) {
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
const getPost = (tokens, start) => {
   const output = [];
    let done = false;
    for (let i = start, len = tokens.length; i < len && !done && output.length < MAX_CONTEXT; ++i) {
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
const getContext = (tokens, found) => {
    const i = found.i;
    return {
        pre: getPre(tokens, i - 1),
        word: toText(found),
        post: getPost(tokens, i + 1)
    };
};

const getEntry = (tokens, found) => {
    const context = getContext(tokens, found);
    context.synonym = found.synonym;
    context.i = found.i;
    return context;
}

const getEntries = (tokens, indicies) =>
    indicies.map(x => getEntry(tokens, x));

const processResult = (tokens) => {
    let indicies = [];
    let i = 0;
    for (const t of tokens) {
        if (t.tokens && t.tokens.length > MIN_LENGTH)
            indicies.push({ i: i, tokens: t.tokens, synonym: t.synonym });
        ++i;
    }

    indicies.sort((a, b) => b.tokens.length - a.tokens.length);
    return {
        tokens: tokens,
        indicies: indicies
    };
};


const outputEntries = (file, entries) => {
    fs.writeFileSync(`./samples/${file}.json`, JSON.stringify(entries, null, 4));
};


process.argv.slice(2).forEach(file => {
    console.log(file);

    const data = fs.readFileSync(`./examples/${file}.txt`, 'utf-8');
    const tokens = data.split(words.word_re).map(x => ({ token: x }));

    trie.then(trie => sub.tokens(trie, tokens))
        .then(processResult)
        .then(x => getEntries(x.tokens, x.indicies))
        .then(x => outputEntries(file, x))
        .catch(x => console.error(x));
});