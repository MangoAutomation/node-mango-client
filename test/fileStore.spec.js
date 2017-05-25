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

const config = require('./setup');
const fs = require('fs');
const tmp = require('tmp');
const crypto = require('crypto');
const path = require('path');

describe('Test File Store endpoints', function() {
    before('Login', config.login);


    it('Lists all file stores', () => {
        return client.restRequest({
            path: '/rest/v2/file-stores',
            method: 'GET',
        }).then(response => {
          assert.isArray(response.data);
          expect(response.data).to.contain('default');
        });
    });

    it('Uploads a random binary file to default store', () => {
        const uploadFile = tmp.fileSync();
        const fileBaseName = path.basename(uploadFile.name);
        const randomBytes = crypto.randomBytes(1024);
        fs.writeFileSync(uploadFile.name, randomBytes);

        return client.restRequest({
            path: '/rest/v2/file-stores/default/terry/debug',
            method: 'POST',
            uploadFiles: [uploadFile.name]
        }).then(response => {
            uploadFile.removeCallback();
            assert.strictEqual(response.data[0], `terry/debug/${fileBaseName}`);

            // file uploaded OK, now download it and compare
            return client.restRequest({
                path: `/rest/v2/file-stores/default/${response.data[0]}`,
                method: 'GET',
                dataType: 'buffer',
                headers: {
                    'Accept': 'application/octet-stream'
                }
            }).then(response => {
                assert.strictEqual(response.headers['content-type'], 'application/octet-stream;charset=utf-8');
                assert.strictEqual(response.headers['content-disposition'], `attachment; filename="${fileBaseName}"`);
                assert.strictEqual(Buffer.compare(randomBytes, response.data), 0,
                    'downloaded file does not match the uploaded file');
            });
        });
    });

    it('Uploads a random .png file to default store, tests download=false', function() {
        const uploadFile = tmp.fileSync({postfix: '.png'});
        const fileBaseName = path.basename(uploadFile.name);
        const randomBytes = crypto.randomBytes(1024);
        fs.writeFileSync(uploadFile.name, randomBytes);

        return client.restRequest({
            path: '/rest/v2/file-stores/default/terry/debug',
            method: 'POST',
            uploadFiles: [uploadFile.name]
        }).then(response => {
            uploadFile.removeCallback();
            assert.strictEqual(response.data[0], `terry/debug/${fileBaseName}`);

            // file uploaded OK, now download it and compare
            return client.restRequest({
                path: `/rest/v2/file-stores/default/${response.data[0]}`,
                method: 'GET',
                dataType: 'buffer',
                headers: {
                    'Accept': '*/*'
                },
                params: {
                    download: false
                }
            }).then(response => {
                assert.strictEqual(response.headers['content-type'], 'image/png;charset=utf-8');
                assert.strictEqual(response.headers['content-disposition'], `inline; filename="${fileBaseName}"`);
                assert.strictEqual(Buffer.compare(randomBytes, response.data), 0,
                    'downloaded file does not match the uploaded file');
            });
        });
    });

    it('Downloads an unknown file extension with application/octet-stream MIME type', function() {
        const uploadFile = tmp.fileSync({postfix: '.mango-test'});
        const fileBaseName = path.basename(uploadFile.name);
        const randomBytes = crypto.randomBytes(1024);
        fs.writeFileSync(uploadFile.name, randomBytes);

        return client.restRequest({
            path: '/rest/v2/file-stores/default/terry/debug',
            method: 'POST',
            uploadFiles: [uploadFile.name]
        }).then(response => {
            uploadFile.removeCallback();
            assert.strictEqual(response.data[0], `terry/debug/${fileBaseName}`);

            // file uploaded OK, now download it and compare
            return client.restRequest({
                path: `/rest/v2/file-stores/default/${response.data[0]}`,
                method: 'GET',
                dataType: 'buffer',
                headers: {
                    'Accept': '*/*'
                }
            }).then(response => {
                assert.strictEqual(response.headers['content-type'], 'application/octet-stream;charset=utf-8');
                assert.strictEqual(response.headers['content-disposition'], `attachment; filename="${fileBaseName}"`);
                assert.strictEqual(Buffer.compare(randomBytes, response.data), 0,
                    'downloaded file does not match the uploaded file');
            });
        });
    });

    it('Downloads an unknown file extension with application/octet-stream MIME type even if Accept header is set', function() {
        const uploadFile = tmp.fileSync({postfix: '.mango-test'});
        const fileBaseName = path.basename(uploadFile.name);
        const randomBytes = crypto.randomBytes(1024);
        fs.writeFileSync(uploadFile.name, randomBytes);

        return client.restRequest({
            path: '/rest/v2/file-stores/default/terry/debug',
            method: 'POST',
            uploadFiles: [uploadFile.name]
        }).then(response => {
            uploadFile.removeCallback();
            assert.strictEqual(response.data[0], `terry/debug/${fileBaseName}`);

            // file uploaded OK, now download it and compare
            return client.restRequest({
                path: `/rest/v2/file-stores/default/${response.data[0]}`,
                method: 'GET',
                dataType: 'buffer',
                headers: {
                    'Accept': 'mango/test-mime'
                }
            }).then(response => {
                assert.strictEqual(response.headers['content-type'], 'application/octet-stream;charset=utf-8');
                assert.strictEqual(response.headers['content-disposition'], `attachment; filename="${fileBaseName}"`);
                assert.strictEqual(Buffer.compare(randomBytes, response.data), 0,
                    'downloaded file does not match the uploaded file');
            });
        });
    });

    it('Downloads the correct MIME type when using wildcard Accept header', function() {
        const uploadFile = tmp.fileSync({postfix: '.js'});
        const fileBaseName = path.basename(uploadFile.name);
        const randomBytes = crypto.randomBytes(1024);
        fs.writeFileSync(uploadFile.name, randomBytes);

        return client.restRequest({
            path: '/rest/v2/file-stores/default/terry/debug',
            method: 'POST',
            uploadFiles: [uploadFile.name]
        }).then(response => {
            uploadFile.removeCallback();
            assert.strictEqual(response.data[0], `terry/debug/${fileBaseName}`);

            // file uploaded OK, now download it and compare
            return client.restRequest({
                path: `/rest/v2/file-stores/default/${response.data[0]}`,
                method: 'GET',
                dataType: 'buffer',
                headers: {
                    'Accept': '*/*'
                }
            }).then(response => {
                assert.strictEqual(response.headers['content-type'], 'application/javascript;charset=utf-8');
                assert.strictEqual(response.headers['content-disposition'], `attachment; filename="${fileBaseName}"`);
                assert.strictEqual(Buffer.compare(randomBytes, response.data), 0,
                    'downloaded file does not match the uploaded file');
            });
        });
    });

    it('Downloads the correct MIME type when using application/* Accept header', function() {
        const uploadFile = tmp.fileSync({postfix: '.css'});
        const fileBaseName = path.basename(uploadFile.name);
        const randomBytes = crypto.randomBytes(1024);
        fs.writeFileSync(uploadFile.name, randomBytes);

        return client.restRequest({
            path: '/rest/v2/file-stores/default/terry/debug',
            method: 'POST',
            uploadFiles: [uploadFile.name]
        }).then(response => {
            uploadFile.removeCallback();
            assert.strictEqual(response.data[0], `terry/debug/${fileBaseName}`);

            // file uploaded OK, now download it and compare
            return client.restRequest({
                path: `/rest/v2/file-stores/default/${response.data[0]}`,
                method: 'GET',
                dataType: 'buffer',
                headers: {
                    'Accept': 'application/*;q=0.5'
                }
            }).then(response => {
                assert.strictEqual(response.headers['content-type'], 'text/css;charset=utf-8');
                assert.strictEqual(response.headers['content-disposition'], `attachment; filename="${fileBaseName}"`);
                assert.strictEqual(Buffer.compare(randomBytes, response.data), 0,
                    'downloaded file does not match the uploaded file');
            });
        });
    });

    it('Returns 416 Not Acceptable when Accept header does not match the file\'s MIME type', function() {
        const uploadFile = tmp.fileSync({postfix: '.txt'});
        const fileBaseName = path.basename(uploadFile.name);
        const randomBytes = crypto.randomBytes(1024);
        fs.writeFileSync(uploadFile.name, randomBytes);

        return client.restRequest({
            path: '/rest/v2/file-stores/default/terry/debug',
            method: 'POST',
            uploadFiles: [uploadFile.name]
        }).then(response => {
            uploadFile.removeCallback();
            assert.strictEqual(response.data[0], `terry/debug/${fileBaseName}`);

            // file uploaded OK, now download it and compare
            return client.restRequest({
                path: `/rest/v2/file-stores/default/${response.data[0]}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/javascript'
                },
                dataType: 'buffer'
            }).then(response => {
                throw new Error('Returned successful response', response.status);
            }, error => {
                assert.strictEqual(error.response.statusCode, 406);
            });
        });
    });
});
