
const axios = require('axios');

const KEY = process.env.IFTT_MAKER_KEY;

const sendHook = hook => axios.post(`https://maker.ifttt.com/trigger/${hook}/with/key/${KEY}`);

module.exports = {
    sendHook,
};
