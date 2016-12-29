
const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, '..', 'variables.json');

if (!fs.existsSync(STORAGE_FILE)) fs.writeFileSync(STORAGE_FILE, '{}');

const setVar = (key, value) => {
    const data = Object.assign({}, getAllVars(), {
        [key]: {
            value,
            date: (new Date()).toISOString(),
        },
    });
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 4));
};

const getVar = key => getAllVars()[key];

const getAllVars = () => JSON.parse(fs.readFileSync(STORAGE_FILE));

module.exports = {
    STORAGE_FILE,

    setVar,
    getVar,
    getAllVars,
};
