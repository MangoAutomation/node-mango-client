/**
 * Copyright 2020 Infinite Automation Systems Inc.
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

const {assert} = require('chai');
const {merge} = require('../src/util');

describe('Utility functions', function() {
    it('Performs merge correctly', function() {
        const options = Object.freeze({
            prop1: 'abc',
            prop3: Object.freeze({
                nestedProp: 'xyz'
            }),
            arrayProp: [9]
        });
        const defaultOptions = Object.freeze({
            prop1: '123',
            prop2: true,
            prop3: Object.freeze({
                boolProp: true
            }),
            arrayProp: [1, 2, 3]
        });
        
        const merged = merge({}, defaultOptions, options);
        assert.isNotNull(merged);
        assert.isObject(merged);
        
        assert.strictEqual(merged.prop1, options.prop1);
        
        assert.strictEqual(merged.prop2, defaultOptions.prop2);
        
        assert.isNotNull(merged.prop3);
        assert.isObject(merged.prop3);
        assert.notEqual(merged.prop3, options.prop3);
        assert.notEqual(merged.prop3, defaultOptions.prop3);
        assert.lengthOf(Object.keys(merged.prop3), 2);
        assert.strictEqual(merged.prop3.nestedProp, options.prop3.nestedProp);
        assert.strictEqual(merged.prop3.boolProp, defaultOptions.prop3.boolProp);
        
        assert.isArray(merged.arrayProp);
        assert.notEqual(merged.arrayProp, options.arrayProp);
        assert.lengthOf(merged.arrayProp, options.arrayProp.length);
        assert.strictEqual(merged.arrayProp[0], options.arrayProp[0]);
    });
});
