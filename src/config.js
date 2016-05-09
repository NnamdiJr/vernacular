"use strict";

const host = 'localhost:3000'//'most-vernacular.azurewebsites.net'

export default {
    host: host,
    server: `http://${host}`,
    socket: `ws://${host}`
};