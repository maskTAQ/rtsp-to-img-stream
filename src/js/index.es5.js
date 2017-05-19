"use strict";

//let demo = new RTSPVideo();

window.onload = function () {
    /*
    url取参数-> 解密[加密解密取消掉了] ->调用RTSP
    */
    var GetRequest = function GetRequest() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = {};
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    };
    // const urlUnencrypt = (code) => {
    //     code = unescape(code);
    //     let c = String.fromCharCode(code.charCodeAt(0) - code.length);
    //     for (let i = 1; i < code.length; i++) {
    //         c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
    //     }
    //     return c;
    // }
    // const params = GetRequest();
    //
    // try {
    //     //从url中取参数
    //     var {username, password, ip, port, channel} = JSON.parse(urlUnencrypt(params.token));
    // } catch (e) {
    //     alert('地址非法');
    // }

    var params = GetRequest();

    var _JSON$parse = JSON.parse(params.params),
        username = _JSON$parse.username,
        password = _JSON$parse.password,
        ip = _JSON$parse.ip,
        port = _JSON$parse.port,
        channel = _JSON$parse.channel;

    var rtspDom = document.getElementById('rtsp');
    //加载rtsp

    var demo = new RTSP({
        username: username,
        password: password,
        ip: ip,
        port: port,
        channel: channel,
        rtspDom: rtspDom,
        loadingClassName: 'ball-scale-multiple'
    }, {
        //缩略图路径
        thumbnailPath: '/src/img/logo.png'
    });
};
