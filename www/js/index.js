/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        //app.receivedEvent('deviceready');

        var app_token = ""; // <= SEU APP TOKEN AQUI
        var server = "https://api.inngage.com.br/v1";
        var jsonData = "";

        console.log("Device is ready");

        var push = PushNotification.init({
            "android": {
                "senderID": "", // <= SEU SENDER ID AQUI
                "icon": "icon",
                "iconColor": "white"
            },
            "ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {}
        });

        push.on('registration', function (data) {
            
            console.log("Registration event: " + data.registrationId);
                    
            $("#gcm_id").html(data.registrationId);
            
            alert(data.registrationId);

            navigator.geolocation.getCurrentPosition(function success(position) {

                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                jsonData = JSON.stringify({
                    "registerGeolocationRequest": {
                        "uuid": device.uuid,
                        "lat": latitude,
                        "lon": longitude
                    }
                });
                console.log("Sending location data to server: " + jsonData);
                $.post(server + "/geolocation/", jsonData)
                        .done(function (response) {
                            console.log("Server response: " + JSON.stringify(response));
                        })
                        .fail(function () {
                            console.log("A communication error occurred while sending data to the server (1401).");
                        });
            }, function error(error) {
                console.log("An error occurred while obtaining the user location (1402).");
            });
            cordova.getAppVersion(function (version) {

                jsonData = JSON.stringify({
                    "registerSubscriberRequest": {
                        "identifier": device.uuid,
                        "registration": data.registrationId,
                        "platform": device.platform.toLowerCase(),
                        "sdk": 3,
                        "app_token": app_token,
                        "device_model": device.model,
                        "device_manufacturer": device.manufacturer,
                        "os_language": navigator.language,
                        "os_version": device.cordova,
                        "app_version": version,
                        "uuid": device.uuid
                    }
                });
                console.log("Sending data to server: " + jsonData);
                
                $.post(server + "/subscription/", jsonData)
                        .done(function (response) {
                            console.log("Server response: " + JSON.stringify(response));
                        })
                        .fail(function () {
                            console.log("A communication error occurred while sending data to the server (1403).");
                        });
            });
        });

        push.on('notification', function (data) {

            console.log("Notification received :" + JSON.stringify(data));

            jsonData = JSON.stringify({
                "notificationRequest": {
                    "id": data.additionalData.id,
                    "app_token": app_token
                }
            });
            
            console.log("Sending callback to server: " + jsonData);

            $.post(server + "/notification/", jsonData)

                    .done(function (response) {
                        console.log("Server response: " + JSON.stringify(response));
                    })
                    .fail(function () {
                        console.log("A communication error occurred while sending data to the server (1404).");
                    });

            navigator.notification.alert(data.message,
                    function () {
                    },
                    data.title,
                    "Confirmar"
                    );
        });

        push.on('error', function (e) {
            console.log("An generic error occurred (1405).");
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();