/**
 * Created by Jared on 5/10/2017.
 */

function dataSourceFactory(client) {
    const MangoObject = client.MangoObject;

    return class DataSource extends MangoObject {
        static get baseUrl() {
            return '/rest/v1/data-sources';
        }
    }
}

module.exports = dataSourceFactory;
