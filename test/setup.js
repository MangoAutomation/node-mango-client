/**
 * Created by Jared on 5/11/2017.
 */

const path = require('path');

const config = {username: 'admin', password: 'admin'};

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    { name: 'config-file', alias: 'c', type: String },
    { name: 'username', alias: 'u', type: String },
    { name: 'password', alias: 'p', type: String },
    { name: 'host', alias: 'h', type: String },
    { name: 'port', type: Number  },
    { name: 'protocol', type: String },
    { name: 'reject-unauthorized', type: Boolean }
];
const commandLineOptions = commandLineArgs(optionDefinitions);

const configPath = path.resolve(commandLineOptions['config-file'] || 'config.json');
console.log(configPath);
try {
    let configFileOptions = require(configPath);
    Object.assign(config, configFileOptions);
} catch (e) {
}

Object.assign(config, commandLineOptions);

global.chai = require('chai');
global.assert = chai.assert;

const MangoClient = require('../src/mangoClient');
global.client = new MangoClient(config);
global.DataSource = client.DataSource;
global.DataPoint = client.DataPoint;
global.User = client.User;

module.exports = config;