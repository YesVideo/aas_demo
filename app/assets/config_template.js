// This file configures the aasDemo app with your AaS and filepicker.io credentials

angular.module('aasDemo')
  .constant('apiClientId', 'your AaS client ID (from https://aas.yesvideo.com/users/edit)')
  .constant('apiSecret', 'your AaS secret (from https://aas.yesvideo.com/users/edit)')
  .constant('filepickerKey', 'your filepicker.io key (from https://developers.inkfilepicker.com/apps)');


// (There's no need to modify the following config)

angular.module('aasDemo')
  .constant('apiUrl', 'https://aas.yesvideo.com');

angular.module('aasDemo.controllers')
  .constant('upload_bucket', 'yv-aas-prod')
  .constant('upload_path', 'filepicker_tmp/');
