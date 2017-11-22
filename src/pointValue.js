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
        baseUrl() {
            return '/rest/v2/point-values/';
        }

        /**
         * Get values for multiple points
         */
        getPointValuesMultiple(xids, singleArray, params) {
            var params = this.ensureParams(params);
            var url;
            if(singleArray){
                url = this.baseUrl() + 'single-array/time-period/';
            }else
                url = this.baseUrl() + 'multiple-arrays/time-period/';

            for(var i=0; i<xids.length; i++){
                url += xids[i];
                if(i < xids.length - 1)
                    url += ',';
            }
            return client.restRequest({
                path: url,
                method: 'GET',
                params: params,
            }).then(response => {
                return response.data;
            });
        }

        /**
         * Get values for multiple points
         */
        getRollupPointValuesMultiple(xids, rollup, singleArray, params) {
            var params = this.ensureParams(params);
            var url;
            if(singleArray){
                url = this.baseUrl() + 'single-array/time-period/';
            }else
                url = this.baseUrl() + 'multiple-arrays/time-period/';

            for(var i=0; i<xids.length; i++){
                url += xids[i];
                if(i < xids.length - 1)
                    url += ',';
            }
            url += '/' + rollup;
            return client.restRequest({
                path: url,
                method: 'GET',
                params: params,
            }).then(response => {
                return response.data;
            });
        }

        /**
         * Get values for multiple points
         */
        getRollupPointValuesMultipleCsv(xids, singleArray, params) {
            var params = this.ensureParams(params);
            var url;
            if(singleArray){
                url = this.baseUrl() + 'single-array/time-period/';
            }else
                url = this.baseUrl() + 'multiple-arrays/time-period/';

            for(var i=0; i<xids.length; i++){
                url += xids[i];
                if(i < xids.length - 1)
                    url += ',';
            }
            url += '/' + rollup;
            return client.restRequest({
                path: url,
                method: 'GET',
                headers: {'Accept': 'text/csv'},
                params: params,
                dataType: 'string'
            }).then(response => {
                return response.data;
            });
        }

        /**
         * Get values for multiple points
         */
        getPointValuesMultipleCsv(xids, singleArray, params) {
            var params = this.ensureParams(params);
            var url;
            if(singleArray){
                url = this.baseUrl() + 'single-array/time-period/';
            }else
                url = this.baseUrl() + 'multiple-arrays/time-period/';

            for(var i=0; i<xids.length; i++){
                url += xids[i];
                if(i < xids.length - 1)
                    url += ',';
            }
            var headers = {'Accept': 'text/csv'};
            return client.restRequest({
                path: url,
                method: 'GET',
                headers: headers,
                params: params,
                dataType: 'string'
            }).then(response => {
                return response.data;
            });
        }

        /**
         * Get point values for one point
         */
        getPointValues(xid, params) {
            var params = this.ensureParams(params);
            return client.restRequest({
                path: this.baseUrl() + 'time-period/' + xid,
                method: 'GET',
                params: params,
            }).then(response => {
                return response.data;
            });
        }

        /**
         * Get point values for one point as csv
         */
        getPointValuesCsv(xid, params) {
            var params = this.ensureParams(params);
            var headers = {'Accept': 'text/csv'};
            return client.restRequest({
                path: this.baseUrl() + 'time-period/' + xid,
                method: 'GET',
                headers: headers,
                params: params,
                dataType: 'string'
            }).then(response => {
                return response.data;
            });
        }

        /**
         * Get point values for one point
         */
        getRollupPointValues(xid, rollup, params) {
            var params = this.ensureParams(params);
            return client.restRequest({
                path: this.baseUrl() + 'time-period/' + xid + '/' + rollup,
                method: 'GET',
                params: params
            }).then(response => {
                return response.data;
            });
        }

        /*
         * Save point values Array of:
         *  {xid,value,dataType,timestamp,annotation}
         */
        savePointValues(values){
            return client.restRequest({
                path: this.baseUrl(),
                method: 'POST',
                data: values
            }).then(response => {
                return response.data;
            });
        }
        /**
         * Delete values >= from and < to
         */
        deletePointValues(xid, params){
            var params = this.ensureParams(params);
            return client.restRequest({
                path: this.baseUrl() + xid,
                method: 'DELETE',
                params: params
            }).then(response => {
                return response.data;
            });
        }

        /**
         * Generate historical incrementing data 0,1,...count-1 up
         * to now with the timestamp incrementing pollPeriod ms
         * each time.
         *
         * historicalData = {
         *      values = [data for point],
         *      from: date,
         *      to: date
         *  };
         */
        generateIncrementalNumericData(xid, count, pollPeriod, timezone){
            var data = {};
            if(Array.isArray(xid)){
                var to = moment.tz(moment(), timezone);
                var from = moment.tz(to.valueOf() - ((count - 1) * pollPeriod), timezone)
                for(var j=0; j<xid.length; j++){
                    data[xid[j]] = {
                        values: [],
                        to: to,
                        from: from,
                    };
                    var timestamp = from.valueOf();
                    var value = 0.0;
                    for(var i=0; i<count; i++){
                        data[xid[j]].values.push({
                            xid: xid[j],
                            value: value,
                            timestamp: timestamp,
                            dataType: 'NUMERIC'
                        });
                        timestamp = timestamp + pollPeriod;
                        value++;
                    }
                }
            }else{
                var data = {};
                data.values = [];
                data.to = moment.tz(moment(), timezone);
                data.from = moment.tz(data.to.valueOf() - ((count - 1) * pollPeriod), timezone);
                var timestamp = data.from.valueOf();
                var value = 0.0;
                for(var i=0; i<count; i++){
                    data.values.push({
                        xid: xid,
                        value: value,
                        timestamp: timestamp,
                        dataType: 'NUMERIC'
                    });
                    timestamp = timestamp + pollPeriod;
                    value++;
                }
            }
            return data;
        }

        ensureParams(params){
            if(typeof params.timezone !== 'undefined'){
                params.from = moment.tz(params.from, params.timezone).toISOString();
                params.to = moment.tz(params.to, params.timezone).toISOString();
            } else{
                params.from = moment(params.from).toISOString();
                params.to = moment(params.to).toISOString();
            }
            return params;
        }

        /*
         * Helper to ouptut a nice easy to read string date time with offset
         */
        printMoment(label, dateTime){
            console.log(label + dateTime.format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
        }
    };
}

module.exports = pointValuesFactory;
