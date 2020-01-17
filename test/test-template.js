// {{path.summary}} - {{path.description}}
{{#if path.deprecated}}
// DEPRECATED
{{/if}}
it('{{path.method}} {{apiDocs.basePath}}{{path.path}}', function() {
    return client.restRequest({
        method: '{{path.method}}',
        path: '{{apiDocs.basePath}}{{path.path}}',
        {{#if (has_param_type path.parameters "query")}}
        params: {
            {{#each path.parameters}}
            {{#if (eq in "query")}}
            {{name}}: undefined{{#unless @last}},{{/unless}} // {{description}}, required = {{required}}, type = {{type}}, default = {{default}}
            {{/if}}
            {{/each}}
        }
        {{/if}}
        {{#if (has_param_type path.parameters "body")}}
        data:
        {{print_schema (find_body_schema path.parameters)}}
        {{/if}}
    }).then(response => {
        {{#with (find_success_response path.responses)}}
        // {{description}}
        assert.strictEqual(response.status, {{statusCode}});
        {{#if schema}}
        {{print_assertions schema "response.data"}}
        {{/if}}
        {{/with}}
    });
});
