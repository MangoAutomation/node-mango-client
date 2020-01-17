/**
 * Copyright 2020 Infinite Automation Systems Inc.
 * http://infiniteautomation.com/
 */

const TestGenerator = require('./TestGenerator.js');
const fileTemplatePath = require.resolve('./file-template.js');
const testTemplatePath = require.resolve('./test-template.js');
const {parseArguments} = require('../src/util');
const {createClient, login} = require('./testHelper');
const client = createClient();

const options = parseArguments(process.argv.slice(2), {
    basePath: {required: true},
    overwrite: {type: 'boolean', defaultValue: false},
    tag: {},
    fileTemplate: {defaultValue: fileTemplatePath},
    testTemplate: {defaultValue: testTemplatePath}
});

login(client).then(user => {
    return client.restRequest({
        path: `${options.basePath}/swagger/v2/api-docs`
    });
}).then(response => {
    const apiDocs = response.data;
    const generator = new TestGenerator(options, apiDocs);

    if (options.tag) {
        return generator.generateTests(options.tag);
    } else {
        return Promise.all(apiDocs.tags.map(t => generator.generateTests(t.name)));
    }
}).catch(e => {
    console.error(e);
    process.exit(1);
});
