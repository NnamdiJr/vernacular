'use strict';
const xhr = require("xhr");

const API = 'http://api.urbandictionary.com/v0/define';


const normalize = key => key.toLowerCase().trim();

/**
 * Manages getting definitions from urban dictionary.
 */
export default class Urban {
    constructor(extractor) {
        this._cache = new Map();
        this._extractor = extractor || (x => x);
    }

    lookup(word) {
        const key = normalize(word);
        const cachedResult = this._lookupCache(key);
        if (cachedResult)
            return Promise.resolve(cachedResult);

        return this._lookupUrban(key)
            .then(this._extractor)
            .then(result => {
                this._updateCache(key, result);
                return result;
            })
    }

    _updateCache(key, result) {
        this._cache.set(key, result);
    }

    _lookupCache(key) {
        return this._cache.get(key);
    }

    _lookupUrban(key) {
        return new Promise((resolve, reject) =>
            xhr({
                url: `${API}?term=${encodeURIComponent(key)}`,
            }, (err, response, body) => {
                if (err)
                    return reject(err);

                const data = JSON.parse(body);
                if (!data)
                    return reject('invalid json')
                return resolve(data);
            }));
    }
} 


export const instance = Urban.instance = new Urban(x => {
    if (x.list && x.list[0]) {
        return x.list[0].definition;
    }
    return null;
});
