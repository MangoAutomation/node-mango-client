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

    it('Uploads a file to default store', () => {
        const uploadFile = tmp.fileSync();
        const randomBytes = crypto.randomBytes(1024);
        fs.writeFileSync(uploadFile.name, randomBytes);

        return client.restRequest({
            path: '/rest/v2/file-stores/default/terry/debug',
            method: 'POST',
            uploadFiles: [uploadFile.name]
        }).then(response => {
            // file uploaded OK, now download it and compare
            return client.restRequest({
                path: `/rest/v2/file-stores${response.data[0]}`,
                method: 'GET',
                dataType: 'buffer'
            }).then(response => {
                assert.strictEqual(Buffer.compare(randomBytes, response.data), 0,
                    'downloaded file does not match the uploaded file');

                uploadFile.removeCallback();
            });
        });
    });
});
