"use strict";
const mapCase = require('map-case');
const words = require('./words');
const natural = require('natural');

const nounInflector = new natural.NounInflector();

/**
 * 
 */
const synonymResponse = (token, synonym) => {
    const response = { token: token.token };
    const id = token.id;
    if (typeof id === 'number' || typeof id === 'string')
        response.id = id;
    if (synonym)
        response.synonym = synonym;
    return response;
};


const sub = (trie, str) => {
    let open = [];
    let best = { list: null, weight: 0, i: 0 };
    let i = 0;
    for (let token of str) {
        let c = words.normalizeWord(token.token);
        if (!c.match(words.word_re_full)) {
            best.list = { value: { token: token.token, id: token.id }, rest: best.list };
            ++i;
            continue;
        }
        
        // Try additional normalization
        if (!trie[c])
            c = nounInflector.singularize(c);
        
        // Try to add entries from dictionary for current key.
        if (trie[c]) {
            open.push({
                list: best.list,
                rest: trie,
                weight: best.weight,
                i: i
            });
        }
        
        best.list = { value: { token: token.token, id: token.id }, rest: best.list };
        ++best.weight;

        // Update existing working nodes
        const new_open = [];
        for (let o of open) {
            const next = o.rest[c];
            if (next) {
                if (o.weight < best.weight && words.end in next) {
                    const tokens = str.slice(o.i, i + 1);
                    best = {
                        weight: o.weight,
                        list: {
                            value: {
                                synonym: next[words.end],
                                tokens: tokens,
                                id: tokens.map(x => x.id).join('-')
                            },
                            rest: o.list
                        }
                    };
                }
                new_open.push({
                    list: o.list,
                    rest: next,
                    weight: o.weight,
                    i: o.i
                });
            }
        }
        ++i;
        open = new_open;
    }
    const out = [];
    for (let x = best.list; x; x = x.rest) {
        out.push(x.value);
    }
    out.reverse();
    return out;
};



/**
 * 
 */
const thesurusizeTokens = module.exports.tokens = (trie, tokens) => {
    tokens = tokens
        .filter(x => x && typeof x.token === 'string' && x.token.length)

    // const tokenValues = tokens.map(x => x.token);
    //  const taggedWords = _.zip(tagger.tag(tokenValues), tokens);
    return Promise.resolve(sub(trie, tokens));
    return new Promise((resolve, reject) =>
        async.map(taggedWords, (pair, callback) => {
            const tagged = pair[0];
            const token = pair[1];

            if (!tagged)
                return callback(null, synonymResponse(token, null));

            const word = tagged[0];
            const tag = tagged[1];

            if (!word.match(WORD_RE) || goodTags.indexOf(tag) === -1)
                return callback(null, synonymResponse(token, null));

            let newWord = thesurusizeWord(search, word, selector);
            return callback(null, synonymResponse(token, newWord));
        }, (err, results) => {
            if (err)
                return reject(err);
            return resolve(results);
        }));
};

/**
 * 
 */
const thesurusizeText = module.exports.text = (trie, text) => {
    const tokens = text.split(WORD_RE).filter(x => x.length).map(word => ({ token: word }));
    return thesurusizeTokens(trie, tokens)
        .then(result => result.map(x => x.synonym || x.token).join(''));
};

