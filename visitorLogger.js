/*
 * visitorLogger - A simple visitor logger for the website
 * JavaScript Frontend
 */

// This must be done with pure JavaScript, not with jQuery

// API URL
var apiURL = "http://localhost/append";

// Generate a UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 获取当前 URL 二级域名
 * 如果当前是 IP 地址，则直接返回 IP Address
 * https://www.jianshu.com/p/c96b0993b22e
 */
function getSubdomain() {
    try {
        let subdomain = ''
        const key = `mh_${Math.random()}`
        const expiredDate = new Date(0)
        const { domain } = document
        const domainList = domain.split('.')

        const reg = new RegExp(`(^|;)\\s*${key}=12345`)
        const ipAddressReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/

        // 若为 IP 地址、localhost，则直接返回
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

// Generate ext data from getUserInfo()
function getExtData() {
    var extData = {};
    extData.userInfo = getUserInfo();
    extData.test = "test";
    return extData;
}

// API Call
// This sends the data to the API with GET
// If it fails, it will try to load js file with data argument from the API
function apiCall(visitorID, extData) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiURL + "?uuid=" + visitorID + "&ext=" + JSON.stringify(extData), false);
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


// Send the data to the API
function sendData() {
    var extData = getExtData();
    var visitorID = getVisitorID();
    var json = apiCall(visitorID, extData);
    return json;
}

// Call the sendData function
sendData();
