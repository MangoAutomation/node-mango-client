/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
 */

const { v4: uuid } = require('uuid');

function dataPointFactory(client) {
    const MangoObject = client.MangoObject;

    return class DataPoint extends MangoObject {
        
        static get defaultProperties() {
            const xid = uuid();
            return {
                xid : xid,
                name: xid + ' Name',
                enabled : false,
                deviceName : xid + ' Name',
                dataSourceXid : null,
                useIntegralUnit : false,
                useRenderedUnit : false,
                readPermission : '',
                setPermission : '',
                chartColour : '',
                rollup : 'NONE',
                plotType : 'STEP',
                loggingProperties : {
                    loggingType: 'ALL',
                    discardExtremeValues: false,
                    discardLowLimit: null,
                    discardHighLimit: null,
                    cacheSize: 1
                },
                textRenderer : {
                    useUnitAsSuffix: false,
                    suffix: 'test',
                    type: 'textRendererPlain' 
                },
                pointLocator : {
                    settable: false,
                },
                purgeOverride : false,
                purgePeriod : {
                    periods : 1,
                    type : 'YEARS'
                },
                unit : '',
                integralUnit : 's',
                renderedUnit : '',
            };
        }
        
        static get baseUrl() {
            return '/rest/v3/data-points';
        }

        static getValue(xid) {
            return this.getValues(xid, 1).then(data => {
                return data[0];
            });
        }

        static getValues(xid, number) {
            return client.restRequest({
                path: '/rest/v3/point-values/' + encodeURIComponent(xid) + '/latest',
                params: {
                    limit: number
                }
            }).then(response => {
                return response.data;
            });
        }
        
        static setEnabled(xid, enabled, restart) {
            let encodedXid = encodeURIComponent(xid);
            
            return client.restRequest({
                path: `${this.baseUrl}/enable-disable/${encodedXid}`,
                method: 'PUT',
                params: {
                    enabled,
                    restart
                }
            }).then(response => {
                return enabled;
            });
        }
        
        static getTags(xid) {
            let encodedXid = encodeURIComponent(xid);
            
            return client.restRequest({
                path: `/rest/v3/data-point-tags/point/${encodedXid}`,
                method: 'GET'
            }).then(response => {
                return response.data;
            });
        }
        
        static setTags(xid, tags) {
            let encodedXid = encodeURIComponent(xid);
            
            return client.restRequest({
                path: `/rest/v3/data-point-tags/point/${encodedXid}`,
                method: 'POST',
                data: tags
            }).then(response => {
                return response.data;
            });
        }
        
        static addTags(xid, tags) {
            let encodedXid = encodeURIComponent(xid);
            
            return client.restRequest({
                path: `/rest/v3/data-point-tags/point/${encodedXid}`,
                method: 'PUT',
                data: tags
            }).then(response => {
                return response.data;
            });
        }

        getValue() {
            return this.constructor.getValue(this.xid);
        }

        getValues(number) {
            return this.constructor.getValues(this.xid, number);
        }
        
        setEnabled(...args) {
            return this.constructor.setEnabled(this.xid, ...args).then(enabled => {
                this.enabled = enabled;
                return this;
            });
        }
        
        getTags() {
            return this.constructor.getTags(this.xid).then(tags => {
                this.tags = tags;
                return this;
            });
        }
        
        setTags(tags) {
            return this.constructor.setTags(this.xid, tags).then(tags => {
                this.tags = tags;
                return this;
            });
        }
        
        addTags(tags) {
            return this.constructor.addTags(this.xid, tags).then(tags => {
                this.tags = tags;
                return this;
            });
        }
    };
}

module.exports = dataPointFactory;
