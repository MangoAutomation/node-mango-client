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
const moment = require('moment-timezone');

function pointValuesFactory(client) {

    return class PointValue {
        get baseUrl() {
            return '/rest/v2/point-values';
        }
        
        latest(options) {
            const requestBody = Object.assign({}, options);
            
            let singleXid = null;
            if (requestBody.xid) {
                singleXid = requestBody.xid;
                requestBody.xids = [singleXid];
                delete requestBody.xid;
            }
            
            return client.restRequest({
                path: `${this.baseUrl}/multiple-arrays/latest`,
                method: 'POST',
                data: requestBody
            }).then(response => {
                if (singleXid) {
                    return response.data[singleXid];
                }
                return response.data;
            });
        }
        
        latestAsSingleArray() {
            return client.restRequest({
                path: `${this.baseUrl}/single-array/latest`,
                method: 'POST',
                data: options
            }).then(response => {
                return response.data;
            });
        }

        forTimePeriod(options) {
            let url = `${this.baseUrl}/multiple-arrays/time-period`;
            if (typeof options.rollup === 'string' && options.rollup.toUpperCase() !== 'NONE') {
                url += '/' + encodeURIComponent(options.rollup.toUpperCase());
            }
            return client.restRequest({
                path: url,
                method: 'POST',
                data: options
            }).then(response => {
                return response.data;
            });
        }
        
        forTimePeriodAsSingleArray(options) {
            let url = `${this.baseUrl}/multiple-arrays/time-period`;
            if (typeof options.rollup === 'string' && options.rollup.toUpperCase() !== 'NONE') {
                url += '/' + encodeURIComponent(options.rollup.toUpperCase());
            }
            return client.restRequest({
                path: url,
                method: 'POST',
                data: options
            }).then(response => {
                return response.data;
            });
        }

        /*
         * Save point values Array of:
         *  {xid,value,dataType,timestamp,annotation}
         */
        insert(values) {
            return client.restRequest({
                path: this.baseUrl,
                method: 'POST',
                data: values
            }).then(response => {
                return response.data;
            });
        }
        
        /**
         * Delete values >= from and < to
         */
        purge(options) {
            let params = {
                to: options.to,
                from: options.from,
                timezone: options.timezone
            };

            return client.restRequest({
                path: `${this.baseUrl}/${options.xid}`,
                method: 'DELETE',
                params: this.ensureParams(params)
            }).then(response => {
                return response.data;
            });
        }

        ensureParams(userParams) {
            const params = Object.assign({}, userParams);
            if (typeof params.timezone !== 'undefined') {
                params.from = moment.tz(params.from, params.timezone).toISOString();
                params.to = moment.tz(params.to, params.timezone).toISOString();
            } else {
                params.from = moment(params.from).toISOString();
                params.to = moment(params.to).toISOString();
            }
            return params;
        }
    };
}

module.exports = pointValuesFactory;
