# Node.js Mango API Client

Mango Automation REST API client for Node.js written in ES6.

## Usage
**Run "npm install mango-client" first**

```
const MangoClient = require('mango-client');

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

```
