
const fs = require('fs');
const path = require('path');
const util = require('util');

const LOG_FILE = path.join(__dirname, '..', 'log.log');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Setp', 'Oct', 'Nov', 'Dec'];

const logHelper = (method, color, args) => {
    const date = new Date;
    let dateStr = util.format('[%s %s %s:%s:%s]',
        pad(date.getDate()),
        MONTHS[date.getMonth()],
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
    );
    if (color) dateStr = dateStr[color];

    const output = prefix(dateStr, util.format.apply(util, args));

    console[method](output);
    fs.appendFileSync(LOG_FILE, prefix(`[${method}]`, output) + '\n');
};

const log = (...args) => logHelper('log', 'bold', args);
const info = (...args) => logHelper('info', 'cyan', args);
const warn = (...args) => logHelper('warn', 'yellow', args);
const error = (...args) => logHelper('error', 'red', args);

const prefix = (str, block) => block.split('\n').map(line => `${str} ${line}`).join('\n');

const pad = num => ('00' + num).slice(-2);

module.exports = {
    LOG_FILE,
    log,
    info,
    warn,
    error,
};
