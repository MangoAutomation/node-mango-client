/**
 * Copyright 2019 Infinite Automation Systems Inc.
 * http://infiniteautomation.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const defer = function() {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
};

const merge = function(dest, ...srcs) {
    if (dest == null || typeof dest !== 'object') dest = {};

    for (let src of srcs) {
        if (src == null || typeof src !== 'object') continue;

        for (let [key, value] of Object.entries(src)) {
            if (value == null || typeof value !== 'object') {
                dest[key] = value;
            } else if (Array.isArray(value)) {
                dest[key] = value.slice();
            } else {
                dest[key] = merge(dest[key], value);
            }
        }
    }

    return dest;
};

const camelCase = function(input, splitOn = '-') {
    return input.split(splitOn)
        .map((str, i) => {
            if (i > 0) {
                return str.charAt(0).toUpperCase() + str.slice(1)
            } else {
                return str;
            }
        })
        .join('');
};

const dashCase = function(input, splitOn = /(?=[A-Z])/) {
    return input.split(splitOn)
        .map((str, i) => {
            return str.toLowerCase();
        })
        .join('-');
};

const parseNumber = function(value) {
    return Number.parseInt(value, 10);
};

const parseBoolean = function(value) {
    return value.toLowerCase() === 'true';
};

const printHelp = function(optionsInfo) {
    const tableData = Object.entries(optionsInfo).map(([key, info]) => {
        return {
            argument: `--${dashCase(key)}`,
            type: info.type || 'string',
            required: info.required || false,
            description: info.description,
            'default': info.defaultValue
        };
    });
    console.table(tableData);
};

const parseArguments = function(args, optionsInfo) {
    const options = {};
    args.forEach(arg => {
        const matches = /^--(.*?)(?:=(.*))?$/.exec(arg);
        if (!matches) throw new Error(`Unknown argument ${arg}`);

        const [dashName, value] = matches.slice(1);
        const name = camelCase(dashName);

        const info = optionsInfo[name];
        if (!info) throw new Error(`Unknown option ${name}`);

        if (info.type === 'boolean') {
            if (value === undefined) {
                options[name] = true;
            } else {
                options[name] = parseBoolean(value);
            }
        } else if (info.type === 'number') {
            options[name] = parseNumber(value);
        } else if (info.type === 'regex') {
            options[name] = new RegExp(value, info.regexFlags);
        } else if (info.type === 'array') {
            const split = value.split(/\s*,\s*/);
            if (info.arrayType === 'boolean') {
                options[name] = split.map(parseBoolean);
            } else if (info.arrayType === 'number') {
                options[name] = split.map(parseNumber);
            } else {
                options[name] = split;
            }
        } else {
            options[name] = value || '';
        }
    });

    Object.entries(optionsInfo).forEach(([name, info]) => {
        if (!options.hasOwnProperty(name)) {
            if (info.required) {
                throw new Error(`Option ${name} is required`);
            } else if (info.hasOwnProperty('defaultValue')) {
                options[name] = info.defaultValue;
            }
        }
    });

    if (options.help) {
        printHelp(optionsInfo);
        process.exit(0);
    }

    return options;
};

module.exports = {defer, merge, parseArguments, dashCase, camelCase};