'use strict';

var aasFilters = angular.module('aasDemo.filters', []);

// Simple angular filter to translate Collection.type enum values to UI-friendly strings.
aasFilters.filter('collectionType', function() {
  return function(val) {
    if (val == 'dvd_4_7G') {
      return 'DVD';
    }
    else if (val == 'blu_ray_25G') {
      return 'Blu-ray';
    }
    else {
      return val;
    }
  }
});

// Angular filter to translate bytes to human friendly kilo/mega/gigabytes.
aasFilters.filter('bytes', function() {
  return function(val) {
    var bytes = parseInt(val, 10),
        metric = ['', '', 'K', 'M', 'G'],
        resInt,
        resVal,
        decimals = 0;

    if ((bytes.toString() === 'NaN') || (bytes == 0)) {
      return 0;
    }
    else {
      resInt = Math.floor(Math.log(bytes) / Math.log(1024));

      if (resInt >= 2) {
        decimals = 1;
      }

      resVal = (bytes / Math.pow(1024, Math.floor(resInt))).toFixed(decimals);
      return resVal + metric[resInt + 1];
    }
  }
});
