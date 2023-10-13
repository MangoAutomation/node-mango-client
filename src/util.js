/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
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
