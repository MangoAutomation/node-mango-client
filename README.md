# Node.js Mango API Client

Mango Automation REST API client for Node.js written in ES6.

## Usage
**Run "npm install mango-client"**

```
const MangoClient = require('mango-client');

const client = new MangoClient({
    protocol: 'https',
    host: 'localhost',
    port: 8443,
    // uncomment if using self signed certificate
    //rejectUnauthorized: false
});

client.login('admin', 'admin').then(response => {
    console.log(`Logged in as '${response.data.username}'.`);
    return client.getPointValue('internal_mango_num_data_points');
}).then(response => {
    console.log(`There are ${response.data[0].value} data points.`);
});
```
