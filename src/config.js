"use strict";

const host = 'most-vernacular.azurewebsites.net'

export default {
    host: host,
    server: `http://${host}`,
    socket: `ws://${host}`
};