/**
 * Created by Jared on 5/11/2017.
 */

let config;
try {
    config = require('./config.json');
} catch (e) {
    config = {};
}

config.username = config.username || 'admin';
config.password = config.password || 'admin';

global.chai = require('chai');
global.assert = chai.assert;

const MangoClient = require('../src/mangoClient');
global.client = new MangoClient(config);
global.DataSource = client.DataSource;
global.DataPoint = client.DataPoint;
global.User = client.User;

module.exports = config;