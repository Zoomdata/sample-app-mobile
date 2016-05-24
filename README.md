# zd-data-app-02

Try this application live at https://developer.zoomdata.com/sample/mobile.  **Credentials:** zoomdata/zoomdata

This is a mobile data app example using the Zoomdata v2.2 with its SDK v2.0 to query the Real Time Sales datasource hosted by a Zoomdata instance at pubsdk.zoomdata.com.  It leverages Ionic/Angular as its mobile framework.


## Commands

### Development Environment Setup
* Node js is a pre-requisite
* Ionic and dependencies
```
  sudo npm install -g ionic
  sudo npm install -g cordova
  sudo npm install -g ios-sim
  sudo npm install -g ios-deploy
```
* Install the Ionic CLI
```
	npm install -g ionic
```
* Install the cordova-plugin-screen-orientation plugin.  Reference: https://github.com/gbenvenuti/cordova-plugin-screen-orientation
```
	cordova plugin add cordova-plugin-screen-orientation
```
* Install the inApp Browser plug-in
```
	cordova plugin add cordova-plugin-inappbrowser
```
* Clone this repo
* Start the ionic client tool
```
	ionic serve
```
* To run the emulator:
```
// defaults to iPhone 6S
ionic emulate ios -l
```
For iPad emulation, specify the target:
```
ionic emulate ios --target=iPad-Air
```

Reference: http://ionicframework.com/docs/overview/#download

### Production Deployment

* Open the www/js/app.js file and set the "production" constant to "true" at the end of the file
* Copy all contents of the www folder to your web server or follow normal instructions to deploy on GitHub Pages
* Try it out! This application is deployed at location specified above.
