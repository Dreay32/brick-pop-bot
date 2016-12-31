
require('colors');

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const BUILD_PATH = path.join(__dirname, 'build');
const MANIFEST_PATH = BUILD_PATH + '/manifest.json';

const init = app => {
    app.use(bodyParser.text());
    app.use(bodyParser.json());

    app.options('*', cors()); // include before other routes
    app.use(cors());

    app.get('/', (req, res) => {
        res.sendFile(BUILD_PATH + '/' + getManifest()['index.html']);
    });

    app.get('/inject', (req, res) => {
       res.sendFile(path.join(__dirname, 'src', 'inject.js'));
    })

    app.use('/', express.static(BUILD_PATH));
};

const getManifest = () => JSON.parse('' + fs.readFileSync(MANIFEST_PATH));

module.exports = init;

if (!module.parent) {
    const app = express();
    const server = http.createServer(app);
    const httpsServer = https.createServer({
        key: fs.readFileSync('config/server.key', 'utf8'),
        cert: fs.readFileSync('config/server.crt', 'utf8'),
    }, app);

    init(app);

    const initServer = (badge, srv, port) => {
        srv.listen(port, error => {
            if (error) throw error;
            console.info('%s Listening on: %s'.bold, badge, srv.address().port.toString().green);
        });
    };

    initServer(`[${'HTTP'.green}]`, server, process.env.PORT || 1271);
    initServer(`[${'HTTPS'.cyan}]`, httpsServer, process.env.HTTPS_PORT || 1272);
}
