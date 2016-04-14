# zd-data-app-02

This is a mobile data app example using the Zoomdata v2.2 with its SDK v2.0 to query the Real Time Sales datasource hosted by a Zoomdata instance at pubsdk.zoomdata.com.  It leverages Ionic/Angular as its mobile framework.

## Commands

* Node js is a pre-requisite
* Install the Ionic CLI
```
	npm install -g ionic
```
* Clone this repo
* Install the cordova-plugin-screen-orientation plugin.  Reference: https://github.com/gbenvenuti/cordova-plugin-screen-orientation
```
	cordova plugin add cordova-plugin-screen-orientation
```
* Install the inApp Browser plug-in
```
	cordova plugin add cordova-plugin-inappbrowser
```
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