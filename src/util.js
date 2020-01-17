/**
 * Copyright 2019 Infinite Automation Systems Inc.
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

const defer = function() {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
};

const merge = function(dest, ...srcs) {
    if (dest == null || typeof dest !== 'object') dest = {};

    for (let src of srcs) {
        if (src == null || typeof src !== 'object') continue;

        for (let [key, value] of Object.entries(src)) {
            if (value == null || typeof value !== 'object') {
                dest[key] = value;
            } else if (Array.isArray(value)) {
                dest[key] = value.slice();
            } else {
                dest[key] = merge(dest[key], value);
            }
        }
    }

    return dest;
};

module.exports = {defer, merge};