/**
 * Copyright 2017 Infinite Automation Systems Inc.
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

const http = require('http');
const https = require('https');
const querystring = require('querystring');
const cookie = require('cookie');
const uuidV4 = require('uuid/v4');

const DataSourceFactory = require('./dataSource');
const DataPointFactory = require('./dataPoint');
const UserFactory = require('./user');
const MangoObjectFactory = require('./mangoObject');

class MangoClient {
    constructor(options) {
        options = options || {};

        // generating an initial XSRF token mitigates the need to perform an initial request just to retrieve the XSRF-TOKEN cookie
        // mango now uses stateless double submission CRSF/XSRF protection so we can generate this client side
        this.cookies = {
            'XSRF-TOKEN': uuidV4()
        };

        if (options.agent) {
            this.agent = options.agent;
            return;
        }

        const agentOpts = {
            host: options.host || 'localhost',
            port: options.port || (options.protocol === 'https' ? 8443 : 8080),
            rejectUnauthorized: options.rejectUnauthorized == null ? true : !!options.rejectUnauthorized,
            keepAlive: true
        };

        if (options.protocol === 'https') {
            this.agent = new https.Agent(agentOpts);
        } else {
            this.agent = new http.Agent(agentOpts);
        }

        this.MangoObject = MangoObjectFactory(this);
        this.DataSource = DataSourceFactory(this);
        this.DataPoint = DataPointFactory(this);
        this.User = UserFactory(this);
    }

    restRequest(optionsArg) {
        return new Promise((resolve, reject) => {
            let bodyData;

            if (optionsArg.data) {
                bodyData = JSON.stringify(optionsArg.data);
            }

            const options = {
                path : optionsArg.path,
                agent: this.agent,
                method : optionsArg.method || 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            };

            if (optionsArg.params) {
                options.path += '?' + querystring.stringify(optionsArg.params);
            }

            if (bodyData) {
                options.headers['Content-Type'] = 'application/json';
                options.headers['Content-Length'] = Buffer.byteLength(bodyData);
            }

            if (this.cookies['XSRF-TOKEN']) {
                options.headers['X-XSRF-TOKEN'] = this.cookies['XSRF-TOKEN'];
            }

            const requestCookies = [];
            Object.keys(this.cookies).forEach(name => {
                requestCookies.push(cookie.serialize(name, this.cookies[name]));
            });
            if (requestCookies.length) {
                options.headers['Cookie'] = requestCookies.join(';');
            }

            const requestMethod = this.agent.protocol === 'https:' ? https.request : http.request;
            const request = requestMethod(options, response => {
                const responseData = {
                    status: response.statusCode,
                    data: null
                };

                const responseCookies = response.headers['set-cookie'];
                if (responseCookies && responseCookies.length) {
                    const setCookieObject = cookie.parse(responseCookies.join(';'));
                    Object.keys(setCookieObject).forEach(name => {
                        this.cookies[name] = setCookieObject[name];
                    });
                }

                response.setEncoding('utf8');

                let stringData = '';
                response.on('data', chunk => stringData += chunk);

                response.on('end', () => {
                    if (stringData) {
                        responseData.data = JSON.parse(stringData);
                    }

                    if (response.statusCode < 400) {
                        resolve(responseData);
                    } else {
                        throw new Error(`Mango HTTP error - ${response.statusCode} ${response.statusMessage}`);
                    }
                });
            });

            request.on('error', error => reject(error));

            if (bodyData) {
                request.write(bodyData);
            }
            request.end();
        });
    }
}

module.exports = MangoClient;
