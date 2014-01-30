'use strict';

var aasCtrls = angular.module('aasDemo.controllers', ['ui.bootstrap', 'dialogs', 'angular-directive-select-usstates', 'aasDemo.services']);

// Top-level controller for bootstrap alerts.
aasCtrls.controller('AlertCtrl', ['$scope', 
  function($scope) {
    $scope.alerts = [];

    $scope.$on('$routeChangeStart', function() {$scope.alerts = []});

    $scope.successAlert = function(msg) {
      $scope.alerts.push({type: 'success', msg: msg});
    };

    $scope.errorAlert = function(msg) {
      $scope.alerts.push({type: 'danger', msg: msg});
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
  }
]);

// Controller for Create Collection dialog.
aasCtrls.controller('CreateCollectionCtrl', ['$scope', '$modalInstance',
  function($scope, $modalInstance) {
    $scope.discType = "dvd_4_7G";

    $scope.cancel = function() {
      $modalInstance.dismiss('canceled');
    };
  
    $scope.create = function() {
      $modalInstance.close($scope.discType);
    };
  }
]);

// Controller for Create Order dialog.
aasCtrls.controller('CreateOrderCtrl', ['$scope', '$modalInstance',
  function($scope, $modalInstance) {
    $scope.stateSelect = { selectedState: null };
    $scope.ship_to = {};

    $scope.cancel = function() {
      $modalInstance.dismiss('canceled');
    };
  
    $scope.create = function() {
      var order = {
        title: $scope.title,
        ship_to: $scope.ship_to,
        no_disc: $scope.no_disc
      };
      order.ship_to.state = $scope.stateSelect.selectedState;

      $modalInstance.close(order);
    };
  }
]);

// Controller for top-level Collections list.
aasCtrls.controller('CollectionsCtrl', ['$scope', '$dialogs', 'Collections', 
  function($scope, $dialogs, Collections) {
    Collections.list($scope.collections = []);

    $scope.createCollection = function(evt) {
      evt.target.blur();

      var dlg = $dialogs.create('aas_demo/partials/create_collection_dialog.html', 'CreateCollectionCtrl', {}, {});
      dlg.result.then(function(discType) {
        Collections.create(discType, function(resp) {
          $scope.collections.splice(0, 0, resp);
        }, function(resp) {
          $dialogs.error(resp.data.error);
        });
      });
    };

    $scope.removeCollection = function(collection) {
      var dlg = $dialogs.confirm('Please Confirm', 'Delete collection ' + collection.id + '?');
      dlg.result.then(function(btn){
        var ix = _.findIndex($scope.collections, function(o){return o === collection});
        $scope.collections.splice(ix, 1);
        Collections.remove(collection.id, angular.noop, function(resp) {
          $dialogs.error(resp.data.error);
          $scope.collections.splice(ix, 0, collection);
        });
      });
    };
  }
]);

// Controller for individual Collections.
aasCtrls.controller('CollectionCtrl', ['$scope', '$routeParams', '$dialogs', '$interval', 'Collections', 'Files', 'Orders', 'upload_bucket', 'upload_path',
  function($scope, $routeParams, $dialogs, $interval, Collections, Files, Orders, upload_bucket, upload_path) {
    function loadCollection() {
      Collections.show($scope.collection = $scope.collection || {}, $routeParams.collectionId);
    }
    loadCollection();

    function loadFiles() {
      Files.list($scope.files = $scope.files || [], $routeParams.collectionId, pollUntilFilesCopied);
    }
    loadFiles();

    $scope.allFilesCopied = false;
    function checkAllFilesCopied() {
      $scope.allFilesCopied = ! _.any($scope.files, function(file) {return file.s3_copy_status == 'copying'});
      if ($scope.allFilesCopied && $scope.collection.s3_copy_status == 'copying') {
        loadCollection();
      }
      return $scope.allFilesCopied;
    }

    var filePoller = null;
    function pollUntilFilesCopied() {
      if (! checkAllFilesCopied() && ! filePoller) {
        filePoller = $interval(function() {
          if (! checkAllFilesCopied()) {
            loadFiles();
          }
          else {
            $interval.cancel(filePoller);
            filePoller = null;
          }
        }, 5000)
      }
    }

    $scope.canOrder = function() {
      return $scope.collection.upload_status == 'complete';
    }

    $scope.canComplete = function() {
      return $scope.collection.upload_status == 'ready' && $scope.allFilesCopied;
    }

    $scope.createOrder = function(evt) {
      evt.target.blur();

      var dlg = $dialogs.create('aas_demo/partials/create_order_dialog.html', 'CreateOrderCtrl', {}, {});
      dlg.result.then(function(order) {
        order.collection_id = $scope.collection.id;

        Orders.create(order, function(resp) {
          $scope.successAlert('Order created (ID ' + resp.id + ')')
          // $dialogs.notify('Order Created', 'Order ID ' + resp.id);
        }, function(resp) {
          $dialogs.error(resp.data.error);
        });
      });
    };

    $scope.completeCollection = function(evt) {
      evt.target.blur();

      var dlg = $dialogs.confirm('Please Confirm', 'Set collection upload status complete?');
      dlg.result.then(function(btn){
        Collections.complete($scope.collection.id, function(resp) {
          _.extend($scope.collection, resp);
        }, function(resp) {
          $dialogs.error(resp.data.error);
        });
      });
    };

    $scope.removeFile = function(file) {
      var dlg = $dialogs.confirm('Please Confirm', 'Delete file ' + file.path + ' (' + file.id + ')?');
      dlg.result.then(function(btn){
        var ix = _.findIndex($scope.files, function(o){return o === file});
        $scope.files.splice(ix, 1);
        Files.remove(file.collection_id, file.id, loadCollection, function(resp) {
          $dialogs.error(resp.data.error);
          $scope.files.splice(ix, 0, file);
        });
      });
    };

    $scope.addFiles = function() {
      var pickerOpts = {
        folders: true,
        multiple: true
      };
      
      var storeOpts = {
        location: 'S3',
        path: upload_path,
        container: upload_bucket
      };

      filepicker.pickAndStore(pickerOpts, storeOpts, function(blobs) {
        blobs.forEach(function(blob) {
          Files.s3_copy_create($scope.collection.id, blob.path || blob.filename, '/' + blob.container + '/' + blob.key, function(resp) {
            $scope.files.splice(0, 0, resp);
            pollUntilFilesCopied();
          }, function(resp) {
            $dialogs.error(resp.data.error);
          });
        });
        loadCollection();
      }, function(err) {
        if (! err.code || err.code != 101 /* no files chosen */) {
          $dialogs.error("Error uploading files.  Please try again.");
        }
      });

    };
  }
]);

// Controller for individual Files.
aasCtrls.controller('FileCtrl', ['$scope', '$routeParams', 'Files', 'FileParts',
  function($scope, $routeParams, Files, FileParts) {
    Files.show($scope.file = {}, $routeParams.collectionId, $routeParams.fileId);
    FileParts.list($scope.parts = [], $routeParams.collectionId, $routeParams.fileId);
  }
]);

// Controller for top-level Orders list.
aasCtrls.controller('OrdersCtrl', ['$scope', 'Orders', 
  function($scope, Orders) {
    Orders.list($scope.orders = []);
  }
]);

// Controller for individual Orders.
aasCtrls.controller('OrderCtrl', ['$scope', '$routeParams', 'Orders', 
  function($scope, $routeParams, Orders) {
    Orders.show($scope.order = {}, $routeParams.orderId);
  }
]);

