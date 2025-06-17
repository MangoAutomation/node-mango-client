/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
 */

const { v4: uuid } = require('uuid');

function eventDetectorFactory(client) {
    const MangoObject = client.MangoObject;

    return class EventDetector extends MangoObject {
        static get defaultProperties() {
            const xid = uuid();
            return {
                xid: xid,
                name: xid + ' Name',
                alarmLevel: 'NONE',
            };
        }

        static get baseUrl() {
            return '/rest/v3/event-detectors';
        }

        static createEventDetector(dataPointId, type) {
            const xid = uuid();
            switch (type) {
                case 'BINARY_STATE':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        state: true,
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'BINARY_STATE',
                    });
                case 'NO_UPDATE':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'NO_UPDATE',
                    });
                case 'NO_CHANGE':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'NO_CHANGE',
                    });
                case 'STATE_CHANGE_COUNT':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        changeCount: 2,
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'STATE_CHANGE_COUNT',
                    });
                case 'ALPHANUMERIC_REGEX_STATE':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        state: '.*',
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'ALPHANUMERIC_REGEX_STATE',
                    });
                case 'ANALOG_CHANGE':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        checkIncrease: true,
                        checkDecrease: false,
                        limit: 15,
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'ANALOG_CHANGE',
                    });
                case 'HIGH_LIMIT':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        resetLimit: 10, //Cannot be below the limit if notHigher
                        useResetLimit: true,
                        notHigher: false,
                        limit: 15,
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'HIGH_LIMIT',
                    });
                case 'LOW_LIMIT':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        resetLimit: 10, //Cannot be below the limit if !notLower
                        useResetLimit: true,
                        notLower: true,
                        limit: 15,
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'LOW_LIMIT',
                    });
                case 'RANGE':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        high: 100,
                        low: 50,
                        withinRange: true,
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'RANGE',
                    });
                case 'NEGATIVE_CUSUM':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        limit: 50,
                        weight: 100,
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'NEGATIVE_CUSUM',
                    });
                case 'POSITIVE_CUSUM':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        limit: 10,
                        weight: 50,
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'POSITIVE_CUSUM',
                    });
                case 'SMOOTHNESS':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        limit: 100,
                        boxcar: 3,
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'SMOOTHNESS',
                    });
                case 'MULTISTATE_STATE':
                    return new this({
                        xid: xid,
                        name: xid + ' Name',
                        state: 1,
                        duration: {
                            periods: 10,
                            type: 'SECONDS',
                        },
                        alarmLevel: 'NONE',
                        detectorSourceType: 'DATA_POINT',
                        sourceId: dataPointId,
                        detectorType: 'MULTISTATE_STATE',
                    });
            }
        }
    };
}

module.exports = eventDetectorFactory;
