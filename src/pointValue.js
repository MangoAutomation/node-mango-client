/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
 */

const moment = require('moment-timezone');

function pointValuesFactory(client) {

    return class PointValue {
        get baseUrl() {
            return '/rest/v3/point-values';
        }
        
        toRequestBody(options) {
            const requestBody = Object.assign({}, options);
            if (requestBody.xid) {
                requestBody.xids = [requestBody.xid];
                delete requestBody.xid;
            }
            
            if (requestBody.from) {
                let from = moment(requestBody.from);
                if (requestBody.timezone) {
                    from = from.tz(requestBody.timezone);
                }
                requestBody.from = from.toISOString();
            }
            
            if (requestBody.to) {
                let to = moment(requestBody.to);
                if (requestBody.timezone) {
                    to = to.tz(requestBody.timezone);
                }
                requestBody.to = to.toISOString();
            }

            return requestBody;
        }
        
        latest(options) {
            const requestBody = this.toRequestBody(options);
            
            return client.restRequest({
                path: `${this.baseUrl}/multiple-arrays/latest`,
                method: 'POST',
                data: requestBody
            }).then(response => {
                if (options.xid) {
                    return response.data[options.xid];
                }
                return response.data;
            });
        }
        
        latestAsSingleArray(options) {
            if (options.xid) {
                return this.latest(options);
            }
            const requestBody = this.toRequestBody(options);

            return client.restRequest({
                path: `${this.baseUrl}/single-array/latest`,
                method: 'POST',
                data: requestBody
            }).then(response => {
                return response.data;
            });
        }

        forTimePeriod(options) {
            const requestBody = this.toRequestBody(options);
            
            let url = `${this.baseUrl}/multiple-arrays/time-period`;
            if (typeof options.rollup === 'string' && options.rollup.toUpperCase() !== 'NONE') {
                url += '/' + encodeURIComponent(options.rollup.toUpperCase());
            }
            
            return client.restRequest({
                path: url,
                method: 'POST',
                data: requestBody
            }).then(response => {
                if (options.xid) {
                    return response.data[options.xid];
                }
                return response.data;
            });
        }
        
        forTimePeriodAsSingleArray(options) {
            if (options.xid) {
                return this.forTimePeriod(options);
            }
            const requestBody = this.toRequestBody(options);
            
            let url = `${this.baseUrl}/single-array/time-period`;
            if (typeof options.rollup === 'string' && options.rollup.toUpperCase() !== 'NONE') {
                url += '/' + encodeURIComponent(options.rollup.toUpperCase());
            }

            return client.restRequest({
                path: url,
                method: 'POST',
                data: requestBody
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
        
        set(options) {
            return client.restRequest({
                path: `${this.baseUrl}/${options.xid}`,
                method: 'PUT',
                data: options
            }).then(response => {
                return response.data;
            });
        }
        
        /**
         * Delete values >= from and < to
         */
        purge(options) {
            return client.restRequest({
                path: `${this.baseUrl}/${encodeURIComponent(options.xid)}`,
                method: 'DELETE',
                params: this.toRequestBody({
                    to: options.to,
                    from: options.from,
                    timezone: options.timezone
                })
            }).then(response => {
                return response.data;
            });
        }
    };
}

module.exports = pointValuesFactory;
