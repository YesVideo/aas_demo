# AAS Demo

This is a simple web app that demonstrates accessing [YesVideo Archive as a Service (AaS)](https://aas.yesvideo.com) from JavaScript.

Note that this site is intended only as a demonstration of accessing AaS from JavaScript, as it would be unusual to provide this as a direct web
interface to end users. For other sample code demonstrating server-side access to YesVideo AaS, see
[aas_samples](https://github.com/YesVideo/aas_samples).

This demo is implemented as a single page app using [angular.js](http://angularjs.org/). All REST calls to AaS are in
`app/assets/javascripts/services.js`. To simplify this demo, file uploads are handled by [filepicker.io](http://filepicker.io).

To deploy the site locally, just copy all these files to a web server and then copy `app/assets/config-template.js` to `app/assets/config.js` and edit
with your own AaS credentials. In addition, if you want to use the file upload functionality, you'll also have to sign up for a a filepicker.io
account and add that access key to `app/assets/config.js`.

This demo site is also incorporated directly into [https://aas.yesvideo.com](https://aas.yesvideo.com/aas_demo), to let you play with the service without setting up any of this code yourself.  The site is packaged as a Rails Gem for this purpose (when hosted standalone, only the `app/assets` files are needed).