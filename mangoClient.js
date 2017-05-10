/**
 * Created by Jared on 5/3/2017.
 */

const http = require('http');
const https = require('https');
const querystring = require('querystring');
const cookie = require('cookie');
const uuidV4 = require('uuid/v4');

class MangoClient {
    constructor(options) {
        // generating an initial XSRF token mitigates the need to perform an initial request just to retrieve the XSRF-TOKEN cookie
        // mango now uses stateless double submission CRSF/XSRF protection so we can generate this client side
        this.cookies = {
            'XSRF-TOKEN': uuidV4()
        };

        const agentOpts = {
            host: options.host,
            port: options.port,
            rejectUnauthorized: options.rejectUnauthorized == null ? true : !!options.rejectUnauthorized
        };

        if (options.protocol === 'https') {
            this.secure = true;
            this.agent = new https.Agent(agentOpts);
        } else {
            this.agent = new http.Agent(agentOpts);
        }
    }

    login(username, password) {
        return this.restRequest({
            path: '/rest/v2/login',
            method: 'POST',
            data: {
                username: username,
                password: password
            }
        });
    }

    getPointValue(xid) {
        return this.getPointValues(xid, 1).then(response => {
            response.data = response.data[0];
            return response;
        });
    }

    getPointValues(xid, number) {
        return this.restRequest({
            path: '/rest/v1/point-values/' + encodeURIComponent(xid) + '/latest',
            params: {
                limit: number
            }
        });
    }

    getDataPoint(xid) {
        return this.restRequest({
            path: '/rest/v1/data-points/' + encodeURIComponent(xid)
        });
    }

    getDataSource(xid) {
        return this.restRequest({
            path: '/rest/v1/data-sources/' + encodeURIComponent(xid)
        });
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

            const requestMethod = this.secure ? https.request : http.request;
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
                        reject(responseData);
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
