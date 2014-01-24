'use strict';

angular.module('aasDemo', [
  'ngRoute',
  'ngAnimate',
  'restangular',
  'aasDemo.services',
  'aasDemo.controllers',
  'aasDemo.filters'
])

.config(['$routeProvider', 'RestangularProvider', 'AaSProvider', 'apiClientId', 'apiSecret', 'apiUrl', 'filepickerKey',
  function($routeProvider, RestangularProvider, AaSProvider, apiClientId, apiSecret, apiUrl, filepickerKey) {

    $routeProvider.when('/collections', {templateUrl: 'aas_demo/partials/collections.html', controller: 'CollectionsCtrl'});
    $routeProvider.when('/collections/:collectionId', {templateUrl: 'aas_demo/partials/collection.html', controller: 'CollectionCtrl'});
    $routeProvider.when('/collections/:collectionId/files/:fileId', {templateUrl: 'aas_demo/partials/file.html', controller: 'FileCtrl'});
    $routeProvider.when('/orders', {templateUrl: 'aas_demo/partials/orders.html', controller: 'OrdersCtrl'});
    $routeProvider.when('/orders/:orderId', {templateUrl: 'aas_demo/partials/order.html', controller: 'OrderCtrl'});
    $routeProvider.otherwise({redirectTo: '/collections'});

    AaSProvider.setup({clientId: apiClientId, secret: apiSecret, serverUrl: apiUrl});
    RestangularProvider.setBaseUrl(apiUrl);
    RestangularProvider.setResponseExtractor(function(resp, operation, what, url) {
      return (operation === 'getList') ? resp[what.split('/').pop()] : resp;
    });
    
    filepicker.setKey(filepickerKey);
  }
])

.run(['$rootScope', '$location',
  function ($rootScope, $location) {
    $rootScope.$on('$routeChangeSuccess', function(){
      window['ga']('send', 'pageview', location.pathname + $location.path());
    });
  }
]);