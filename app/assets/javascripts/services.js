'use strict';

/*
  This file contains angular services for accessing the AaS API. The AaS factory handles basic authentication, while the remaining factories handle
  access to the various object types. We use Restangular (https://github.com/mgonto/restangular) to simplify the REST calls.
 */

var aasServices = angular.module('aasDemo.services', ['restangular']);

aasServices.provider('AaS', function() {
  
  var _config, authReq;
    
  // The app calls this at initialization time in order to set the AaS credentials.
  this.setup = function(config) {
    _config = config;
  }

  this.$get = function($http, Restangular) {
    return {
      // Authenticates against AaS (if we haven't already) and then executes the specified then callback.
      auth: function(then) {
        authReq = authReq || $http.post(
          (_config.serverUrl || 'https://aas.yesvideo.com') + '/oauth/token',
          {'grant_type': 'client_credentials'},
          {
            responseType: 'json',
            headers: {Authorization: 'Basic ' + btoa(_config.clientId + ':' + _config.secret)}
          }
        ).success(function(resp) {
          Restangular.setDefaultHeaders({
            Authorization: 'Bearer ' + resp.access_token
          })
        });
        
        return authReq.then(then);
      },

      // Returns a Restangular element based at the specified path.
      restFrom: function(path) {
        return Restangular.one(path);
      },

      // Executes the rest function and then populates the result array into tgt and calls success (or err).
      getArr: function(tgt, rest, success, err) {
        this.auth(rest).then(function(resp) {
          resp.forEach(function(obj) {tgt.push(obj)});
          _.extend(tgt, resp);
          success && success();
        }, err);
      },

      // Executes the rest function and then populates the result object into tgt and calls success (or err).
      getObj: function(tgt, rest, success, err) {
        this.auth(rest).then(function(resp) {
          _.extend(tgt, resp);
          success && success();
        }, err);
      }
    }
  }
});

// REST API for Collections
aasServices.factory('Collections', ['AaS',
  function(aas) {
    var rest = aas.restFrom('api/v1');

    return {
      list: function(tgt, success, err) {
        aas.getArr(tgt, function() {return rest.getList('collections')}, success, err);
      },
      show: function(tgt, collectionId, success, err) {
        aas.getObj(tgt, function() {return rest.one('collections', collectionId).get()}, success, err);
      },
      create: function(type, success, err) {
        aas.auth(function() {rest.all('collections').post({type: type}).then(success, err)});
      },
      remove: function(collectionId, success, err) {
        aas.auth(function() {rest.one('collections', collectionId).remove().then(success, err)});
      },
      complete: function(collectionId, success, err) {
        aas.auth(function() {rest.one('collections', collectionId).put({upload_status: 'complete'}).then(success, err)});
      }
    }
  }
]);

// REST API for Files
aasServices.factory('Files', ['AaS',
  function(aas) {
    var rest = aas.restFrom('api/v1/collections');

    return {
      list: function(tgt, collectionId, success, err) {
        aas.getArr(tgt, function() {return rest.one(collectionId).getList('files')}, success, err);
      },
      show: function(tgt, collectionId, fileId, success, err) {
        aas.getObj(tgt, function() {return rest.one(collectionId).one('files', fileId).get()}, success, err);
      },
      s3_copy_create: function(collectionId, path, s3_source, success, err) {
        aas.auth(function() {rest.one(collectionId).all('files').post({path: path, s3_source: s3_source}).then(success, err)});
      },
      remove: function(collectionId, fileId, success, err) {
        aas.auth(function() {rest.one(collectionId).one('files', fileId).remove().then(success, err)});
      }
    }
  }
]);

// REST API for FileParts
aasServices.factory('FileParts', ['AaS',
  function(aas) {
    var rest = aas.restFrom('api/v1/collections');

    return {
      list: function(tgt, collectionId, fileId, success, err) {
        aas.getArr(tgt, function() {return rest.one(collectionId).one('files', fileId).getList('parts')}, success, err);
      },
      show: function(tgt, collectionId, fileId, partId, success, err) {
        aas.getObj(tgt, function() {return rest.one(collectionId).one('files', fileId).one('parts', partId).get()}, success, err);
      }
    }
  }
]);

// REST API for Orders
aasServices.factory('Orders', ['AaS',
  function(aas) {
    var rest = aas.restFrom('api/v1');

    return {
      list: function(tgt, success, err) {
        aas.getArr(tgt, function() {return rest.getList('orders')}, success, err);
      },
      show: function(tgt, orderId, success, err) {
        aas.getObj(tgt, function() {return rest.one('orders', orderId).get()}, success, err);
      },
      create: function(order, success, err) {
        aas.auth(function() {rest.all('orders').post(order).then(success, err)});
      }
    }
  }
]);
