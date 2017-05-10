/**
 * Created by Jared on 5/3/2017.
 */

const MangoClient = require('./mangoClient');

const client = new MangoClient({
    protocol: 'https',
    host: 'localhost',
    port: 8443,
    rejectUnauthorized: false
});

client.login('admin', 'admin').then(response => {
    console.log(`Logged in as '${response.data.username}'.`);
    return client.getPointValue('internal_mango_num_data_points');
}).then(response => {
    console.log(`There are ${response.data.value} data points.`);

    // you can perform any arbitrary rest request like this
    return client.restRequest({
        path: '/rest/v1/data-points/internal_mango_num_data_points'
    });
}).then(response => {
    console.log(`The data point's name is '${response.data.name}'`);
});
