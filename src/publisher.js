/**
 * Copyright 2017 Infinite Automation Systems Inc.
 * http://infiniteautomation.com/
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

const uuid = require('uuid/v4');

function publisherFactory(client) {
    const MangoObject = client.MangoObject;

    return class Publisher extends MangoObject {
        
        static get defaultProperties() {
            const xid = uuid();
            return {
                xid: xid,
                name: xid + ' Name',
                enabled: false,
                publishType: 'ALL',
                cacheWarningSize: 100,
                cacheDiscardSize: 1000,
                sendSnapshot: false,
                snapshotSendPeriod: { periods: 5, type: 'SECONDS' },
                publishAttributeChanges: false,
                alarmLevels: { POLL_ABORTED: 'URGENT' }
            };
        }
        
        static get baseUrl() {
            return '/rest/v3/publishers';
        }
    };
}

module.exports = publisherFactory;
