"use strict";

const bodyParser = require('body-parser')
const express = require('express');

const trie = require('./server/build');
const Noise = require('./server/noise');
const sub = require('./server/sub');

const PORT = process.env.port || 3000;
const MAX_LENGTH = 10000;


const app = express();
const  expressWs = require('express-ws')(app);

app.use(bodyParser.json())
app.use(logErrors);

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    next();
});

app.post('/api/text', (req, res) => {
    const body = req.body;
    if (!body || !body.text)
        return res.send({
            error: "No text entry provided"
        });

    if (body.text.length > MAX_LENGTH)
        return res.send({
            error: "Too much text provided"
        });

    trie.then(trie =>
        sub.text(trie, body.text)
            .then(result =>
                res.send({
                    text: result
                })))
        .catch(err =>
            res.send({
                error: '' + err.stack
            }));
});

app.post('/api/tokens', (req, res) => {
    const body = req.body;
    if (!body || !body.tokens)
        return res.send({
            error: "No tokens provided"
        });

    if (body.tokens.length > MAX_LENGTH)
        return res.send({
            error: "Too many tokens provided"
        });

    trie.then(trie =>
        sub.tokens(trie, body.tokens)
            .then(result =>
                res.send({
                    tokens: result
                })))
        .catch(err =>
            res.send({
                error: '' + err.stack
            }));
});


const server = require('http').Server(app);
const io = require('socket.io')(server);

const noise = new Noise();


app.ws('/noise', (ws, req) => {
    const handle = word => ws.send(word);
    req.on("close",  () => {
        noise.removeListener(handle);
    });
    noise.addListener(handle);
});

app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});