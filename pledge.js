'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:
function $Promise() {
    this.state = 'pending';
    this.value = null;
    this.handlerGroups = [];
}

function Deferral() {

}
Deferral.prototype.resolve = function(value) {
    var self = this.$promise;
    if (self.state === 'pending') {
        self.value = value;
        self.state = 'resolved';
    }
    this.$promise.callHandlers.call(this.$promise);
    // if (self.handlerGroups.length > 0) {
    //     self.handlerGroups.forEach(function(index) {
    //      //{successCb, errorCb, forwarder}
    //      //forwarder is a new deferral
    //         if (index.successCb !== null) {
    //          var holder = self.callHandlers(index.successCb)
    //             if(holder) { 
    //              index.forwarder.$promise.value = holder;
    //              index.forwarder.$promise.state = 'resolved';
    //             }
    //         } else {
    //             index.forwarder.$promise.value = self.value;
    //             index.forwarder.$promise.state = self.state;
    //         }
    //     })
    //     self.handlerGroups = [];
    // }

}

Deferral.prototype.reject = function(value) {
    var self = this.$promise;
    if (self.state === 'pending') {
        self.value = value;
        self.state = 'rejected';
    }
    this.$promise.callHandlers.call(this.$promise);
    // if (self.handlerGroups.length > 0) {
    //     self.handlerGroups.forEach(function(index) {
    //         if (index.errorCb !== null) {
    //          var holder = self.callHandlers(index.errorCb)
    //             if(holder) { 
    //              index.forwarder.$promise.value = holder;
    //              index.forwarder.$promise.state = 'resolved';
    //             }        
    //         } else {
    //             index.forwarder.$promise.value = self.value;
    //             index.forwarder.$promise.state = self.state;
    //         }
    //     })
    //     self.handlerGroups = [];
    // }
}
$Promise.prototype.callHandlers = function() {
    var self = this;

    if (self.state !== 'pending') {
        if (self.handlerGroups.length > 0) {
            //[{successCb, errorCb, forwarder},{successCb, errorCb, forwarder},{successCb, errorCb, forwarder}]
            self.handlerGroups.forEach(function(index) {
                //{successCb, errorCb, forwarder}
                //forwarder is a new deferral
                if (self.state === 'resolved') {
                    if (index.successCb !== null) {
                        try {
                            var holder = index.successCb(self.value);
                        }
                        catch (err) {
                            //return something so we don't keep going
                            index.forwarder.$promise.value = err;
                            index.forwarder.$promise.state = 'rejected';
                        }
                        
                        if (holder) {
                            index.forwarder.$promise.value = holder;
                            index.forwarder.$promise.state = 'resolved';
                        }
                    } else {
                        index.forwarder.$promise.value = self.value;
                        index.forwarder.$promise.state = self.state;
                    }
                } else if (self.state === 'rejected') {
                    if (index.errorCb !== null) {
                        var holder = index.errorCb(self.value);
                        if (holder) {
                            index.forwarder.$promise.value = holder;
                            index.forwarder.$promise.state = 'resolved';
                        }
                    } else {
                        index.forwarder.$promise.value = self.value;
                        index.forwarder.$promise.state = self.state;
                    }
                }

            })
            self.handlerGroups = [];
        }
    }
    // if (self.state === 'resolved') {
    //  if (self.handlerGroups.length > 0) {
    //      self.handlerGroups.forEach(function(index) {
    //          self.callHandlers(index.successCb);
    //      })
    //      self.handlerGroups = [];
    //  }
    // }
    // if (self.state === 'rejected') {
    //  if (self.handlerGroups.length > 0) {
    //      self.handlerGroups.forEach(function(index) {
    //          self.callHandlers(index.errorCb);
    //      })
    //      self.handlerGroups = [];
    //  }
    // }
    // return callbackFunc(this.value);

}
$Promise.prototype.then = function(successCb, errorCb) {
    if (typeof successCb !== 'function') {
        successCb = null;
    }
    if (typeof errorCb !== 'function') {
        errorCb = null;
    }
    var forwarder = defer();
    this.handlerGroups.push({
        successCb: successCb,
        errorCb: errorCb,
        forwarder: forwarder
    })

    this.callHandlers.call(this);

    // if (this.state === 'resolved' && successCb !== null) {
    //     this.callHandlers(successCb);
    // }
    // if (this.state === 'rejected' && errorCb !== null) {
    //     this.callHandlers(errorCb);
    // }
    return forwarder.$promise;
}

$Promise.prototype.catch = function(errorCb) {
    return this.then(null, errorCb);
}

var defer = function() {
    var myDefer = new Deferral();
    myDefer.$promise = new $Promise();
    return myDefer;
}







/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/