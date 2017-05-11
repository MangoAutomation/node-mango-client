/**
 * Created by Jared on 5/10/2017.
 */

function dataPointFactory(client) {
    const MangoObject = client.MangoObject;

    return class DataPoint extends MangoObject {
        static get baseUrl() {
            return '/rest/v1/data-points';
        }

        static getValue(xid) {
            return this.getValues(xid, 1).then(data => {
                return data[0];
            });
        }

        static getValues(xid, number) {
            return client.restRequest({
                path: '/rest/v1/point-values/' + encodeURIComponent(xid) + '/latest',
                params: {
                    limit: number
                }
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
    }
}

module.exports = dataPointFactory;
