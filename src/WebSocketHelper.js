/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

class WebSocketHelper {
    constructor(client) {
        this.client = client;
        this.deferreds = [];
        this.openDeferred = config.defer();
        this.errorDeferred = config.defer();
        this.closeDeferred = config.defer();
    }
    
    open(options) {
        this.ws = this.client.openWebSocket(options);
        
        this.ws.on('open', event => {
            this.openDeferred.resolve(event);
        });
        
        this.ws.on('error', error => {
            this.openDeferred.reject(error);
            this.errorDeferred.resolve(error);
            this.ws.close();
        });
        
        this.ws.on('close', (code, reason) => {
            const codeAndReason = {code, reason};
            
            this.deferreds = this.deferreds.filter(d => {
                d.deferred.reject(codeAndReason);
            });
            
            this.closeDeferred.resolve(codeAndReason);
        });
        
        this.ws.on('message', msgStr => {
            const msg = JSON.parse(msgStr);

            this.deferreds = this.deferreds.filter(d => {
                try {
                    if (!d.matches(msg)) {
                        return true;
                    }
                } catch (e) {
                    d.deferred.reject(e);
                }
                d.deferred.resolve(msg);
            });
        });
        
        return this.openDeferred.promise;
    }
    
    close() {
        if (!this.ws) {
            return Promise.reject();
        }
        
        this.ws.close();
        return this.closeDeferred.promise;
    }
    
    closeNoError() {
        return this.close().then(null, e => null);
    }
    
    matchMessage(matches) {
        const deferred = config.defer();
        this.deferreds.push({
            deferred,
            matches
        });
        return deferred.promise;
    }
    
    send(message) {
        if (!this.ws) {
            return Promise.reject();
        }
        
        let jsonMsg;
        try {
            jsonMsg = JSON.stringify(message);
        } catch (e) {
            return Promise.reject(e);
        }

        const sendDeferred = config.defer();
        this.ws.send(jsonMsg, error => {
            if (error != null) {
                sendDeferred.reject(error);
            } else {
                sendDeferred.resolve();
            }
        });
        return sendDeferred.promise;
    }
    
    request(message, matches) {
        if (!this.ws) {
            return Promise.reject();
        }
        
        if (message.messageType === 'REQUEST' && !matches) {
            const sequenceNumber = message.sequenceNumber || 0;
            matches = r => r.messageType === 'RESPONSE' && r.sequenceNumber === sequenceNumber;
        }
        
        // add the response matcher before sending the request message
        const p = this.matchMessage(matches);
        
        return this.send(message).then(() => {
            return p;
        });
    }
    
    matchNotification(matches) {
        return this.matchMessage(msg => msg.messageType === 'NOTIFICATION' && matches(msg));
    }
}

module.exports = WebSocketHelper;