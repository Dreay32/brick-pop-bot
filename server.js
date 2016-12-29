
require('colors');

const http = require('http');

const express = require('express');
const bodyParser = require('body-parser');

const init = app => {
    app.use(bodyParser.text());
    app.use(bodyParser.json());

    app.use('/', express.static('src'));
};

module.exports = init;

if (!module.parent) {
    const app = express();
    const server = http.createServer(app);

    init(app);

    server.listen(process.env.PORT || 1271, error => {
        if (error) throw error;
        console.info('Listening on: %s'.bold, server.address().port.toString().green);
    });
}
