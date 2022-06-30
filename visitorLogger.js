/*
 * visitorLogger - A simple visitor logger for the website
 * JavaScript Frontend
 */

// This must be done with pure JavaScript, not with jQuery

// Make an anonymous function to keep the global namespace clean
(function () {

    // API URL
    var apiURL = "https://replace.me/";

    // Generate a UUID
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    // Get SLD from current URL
    // If IP Address or localhost, return directly
    // https://www.jianshu.com/p/c96b0993b22e
    function getSubdomain() {
        try {
            let subdomain = ''
            const key = `mh_${Math.random()}`
            const expiredDate = new Date(0)
            const { domain } = document
            const domainList = domain.split('.')

            const reg = new RegExp(`(^|;)\\s*${key}=12345`)
            const ipAddressReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/

            // If IP Address or localhost, return
            if (ipAddressReg.test(domain) || domain === 'localhost') {
                return domain
            }

            const urlItems = []
            urlItems.unshift(domainList.pop())

            while (domainList.length) {
                urlItems.unshift(domainList.pop())
                subdomain = urlItems.join('.')

                const cookie = `${key}=12345;domain=.${subdomain}`
                document.cookie = cookie

                if (reg.test(document.cookie)) {
                    document.cookie = `${cookie};expires=${expiredDate}`
                    break
                }
            }

            return subdomain || document.domain
        } catch (e) {
            return document.domain
        }
    }

    // Get the visitor ID from the cookie
    // Try to use the cookie if it exists, otherwise generate a new one
    // This cookie is available in any subdomain
    function getVisitorID() {
        var visitorID = "";
        var cookieName = "visitorID";
        var cookie = document.cookie;
        var cookieArray = cookie.split(";");
        for (var i = 0; i < cookieArray.length; i++) {
            var cookiePair = cookieArray[i].split("=");
            if (cookiePair[0].trim() == cookieName) {
                visitorID = cookiePair[1];
                break;
            }
        }
        if (visitorID == "") {
            visitorID = generateUUID();
            var domain = getSubdomain();
            document.cookie = cookieName + "=" + visitorID + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; domain=" + domain + ";";
        }
        return visitorID;
    }

    // Get anything that we could get about the user and browser
    function getUserInfo() {
        var userInfo = {};
        userInfo.visitorID = getVisitorID();
        userInfo.browser = navigator.userAgent;
        userInfo.language = navigator.language;
        userInfo.platform = navigator.platform;
        userInfo.screenWidth = screen.width;
        userInfo.screenHeight = screen.height;
        userInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        userInfo.time = new Date().toISOString();
        userInfo.href = window.location.href;
        userInfo.pageTitle = document.title;
        userInfo.referrer = document.referrer;
        userInfo.viewport = {
            width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        };
        // Check for WeChat or QQ or any JSBridge
        if (window.WeixinJSBridge) {
            userInfo.wechat = true;
        }
        if (window.QQJSBridge) {
            userInfo.qq = true;
        }
        if (window.WebViewJavascriptBridge) {
            userInfo.jsbridge = true;
        }
        return userInfo;
    }

    // Get Geo Location
    // This asks the user for permission to use their location
    // If they allow it, it will return their location
    function getGeoLocation() {
        var geoLocation = {};
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                geoLocation.latitude = position.coords.latitude;
                geoLocation.longitude = position.coords.longitude;
                geoLocation.accuracy = position.coords.accuracy;
                geoLocation.time = position.timestamp;
                geoLocation.full = position;
            });
        }
        return geoLocation;
    }

    // Get Geo Location from IP Address
    // This uses the IP Address to get the user's location
    // If it can't, it will return an empty object
    function getGeoLocationFromIP() {
        var ipURL = "https://ipapi.co/json/";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", ipURL, false);
        xhr.send();
        if (xhr.status == 200) {
            var json = JSON.parse(xhr.responseText);
        }
        return json;
    }

    // Get Geo Location via Sohu API
    // Place <script src="https://pv.sohu.com/cityjson?ie=utf-8"></script> before this script
    // Get the user's location if returnCitySN exists, should not cause ReferenceError
    function getGeoLocationViaSohu() {
        var geoLocation = "unloaded";
        if (typeof (returnCitySN) == "undefined" || returnCitySN == null) {

        } else {
            geoLocation = returnCitySN;
        }
        return geoLocation;
    }

    // Get IP via WebRTC Leak Exploitation
    // https://github.com/VoidSec/WebRTC-Leak/blob/master/exploit.js
    function getIPViaWebRTCLeak() {
        var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var pc = new myPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }),
            noop = function () { },
            localIPs = {},
            ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
            key;

        var returnValue = [];

        function onNewIP(ip) {
            returnValue.push(ip);
        }

        function ipIterate(ip) {
            if (!localIPs[ip]) onNewIP(ip);
            localIPs[ip] = true;
        }

        pc.createDataChannel("");

        pc.createOffer(function (sdp) {
            sdp.sdp.split('\n').forEach(function (line) {
                if (line.indexOf('candidate') < 0) return;
                line.match(ipRegex).forEach(ipIterate);
            });
            pc.setLocalDescription(sdp, noop, noop);
        }, noop);

        pc.onicecandidate = function (ice) {
            if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
            ice.candidate.candidate.match(ipRegex).forEach(ipIterate);
        };

        return returnValue;
    }


    // Generate ext data from getUserInfo()
    function getExtData(ext) {
        var extData = {};
        extData.userInfo = getUserInfo();
        extData.ext = ext;
        extData.returnCitySN = getGeoLocationViaSohu();
        return extData;
    }

    // API Call
    // This sends the data to the API with GET
    // If it fails, it will try to load js file with data argument from the API
    // Endpoint: apiURL + "append"
    function apiCallGet(visitorID, extData) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", apiURL + "append" + "?uuid=" + visitorID + "&ext=" + JSON.stringify(extData), false);
        xhr.send();
        if (xhr.status == 200) {
            var json = JSON.parse(xhr.responseText);
            return json;
        }
        else {
            var script = document.createElement("script");
            script.src = apiURL + "?uuid=" + visitorID + "&ext=" + JSON.stringify(extData);
            document.body.appendChild(script);
        }
    }

    // API Call
    // This sends the data to the API with POST
    // If it fails, fall back to GET
    // Endpoint: apiURL + "post"
    function apiCallPost(visitorID, extData) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", apiURL + "post", false);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("uuid=" + visitorID + "&ext=" + JSON.stringify(extData));
        if (xhr.status == 200) {
            var json = JSON.parse(xhr.responseText);
            return json;
        }
        else {
            return apiCallGet(visitorID, extData);
        }
    }

    // Send the data to the API
    function sendData(ext) {
        var extData = getExtData(ext);
        var visitorID = getVisitorID();
        var json = apiCallPost(visitorID, extData);
        return json;
    }

    // Call the sendData function
    sendData("test");

})();
