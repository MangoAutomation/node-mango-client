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
        getPointValuesMultiple(xids, useRendered, bothRenderedAndRaw, unitConversion,
          dateTimeFormat, from, to, timezone, limit, singleArray) {
            var params = this.toParams(useRendered, bothRenderedAndRaw, unitConversion,
              dateTimeFormat, from, to, timezone, limit);
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
        getRollupPointValuesMultiple(xids, useRendered, bothRenderedAndRaw, unitConversion,
            dateTimeFormat, from, to, timezone, rollup, timePeriods, timePeriodType, singleArray) {
            var params = this.toParams(useRendered, bothRenderedAndRaw, unitConversion,
                dateTimeFormat, from, to, timezone, null, timePeriods, timePeriodType);
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
        getRollupPointValuesMultipleCsv(xids, useRendered, bothRenderedAndRaw, unitConversion,
            dateTimeFormat, from, to, timezone, rollup, timePeriods, timePeriodType, singleArray) {
            var params = this.toParams(useRendered, bothRenderedAndRaw, unitConversion,
                dateTimeFormat, from, to, timezone, null, timePeriods, timePeriodType);
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
        getPointValuesMultipleCsv(xids, useRendered, bothRenderedAndRaw, unitConversion,
          dateTimeFormat, from, to, timezone, limit, singleArray) {
            var params = this.toParams(useRendered, bothRenderedAndRaw, unitConversion,
              dateTimeFormat, from, to, timezone, limit);
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
        getPointValues(xid, useRendered, bothRenderedAndRaw, unitConversion,
            dateTimeFormat, from, to, timezone, limit) {
            var params = this.toParams(useRendered, bothRenderedAndRaw, unitConversion,
                dateTimeFormat, from, to, timezone, limit);
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
        getPointValuesCsv(xid, useRendered, bothRenderedAndRaw, unitConversion,
            dateTimeFormat, from, to, timezone, limit) {
            var params = this.toParams(useRendered, bothRenderedAndRaw, unitConversion,
                dateTimeFormat, from, to, timezone, limit);
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
        getRollupPointValues(xid, useRendered, bothRenderedAndRaw, unitConversion,
            dateTimeFormat, from, to, timezone, rollup, timePeriods, timePeriodType) {
            var params = this.toParams(useRendered, bothRenderedAndRaw, unitConversion,
                dateTimeFormat, from, to, timezone, null, timePeriods, timePeriodType);
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
        deletePointValues(xid, from, to, timezone){
            var params = this.toParams(null, null, null, null, from, to, timezone);
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

        toParams(useRendered, bothRenderedAndRaw, unitConversion, dateTimeFormat,
            from, to, timezone, limit, timePeriods, timePeriodType, singleArray){
            var params = {};
            if(typeof useRendered !== 'undefined' && useRendered !== null){
                params.useRendered = useRendered;
            }
            if(typeof bothRenderedAndRaw !== 'undefined' && bothRenderedAndRaw !== null){
                params.bothRenderedAndRaw = bothRenderedAndRaw;
            }
            if(typeof unitConversion !== 'undefined' && unitConversion !== null){
                params.unitConversion = unitConversion;
            }
            if(typeof dateTimeFormat !== 'undefined' && dateTimeFormat !== null){
                params.dateTimeFormat = dateTimeFormat;
            }
            if(typeof timezone !== 'undefined' && timezone !== null){
                params.from = moment.tz(from, timezone).toISOString();
                params.to = moment.tz(to, timezone).toISOString();
                params.timezone = timezone;
            } else{
                params.from = moment(from).toISOString();
                params.to = moment(to).toISOString();
            }
            if(typeof limit !== 'undefined' && limit !== null){
                params.limit = limit;
            }
            if(typeof timePeriodType !== 'undefined' && timePeriodType !== null){
                params.timePeriodType = timePeriodType;
            }
            if(typeof timePeriods !== 'undefined' && timePeriods !== null){
                params.timePeriods = timePeriods;
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
