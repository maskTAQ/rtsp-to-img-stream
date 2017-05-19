//let demo = new RTSPVideo();

window.onload = function() {
    /*
  url取参数-> 解密[加密解密取消掉了] ->调用RTSP
  */
    const GetRequest = () => {
        let url = location.search; //获取url中"?"符后的字串
        let theRequest = {};
        if (url.indexOf("?") != -1) {
            let str = url.substr(1);
            let strs = str.split("&");
            for (let i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    }
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
    var {username, password, ip, port, channel} = JSON.parse(params.params);
    const rtspDom = document.getElementById('rtsp');
    //加载rtsp

    let demo = new RTSP({
        username: username,
        password: password,
        ip: ip,
        port: port,
        channel: channel,
        rtspDom,
        loadingClassName: 'ball-scale-multiple'
    }, {
        //缩略图路径
        thumbnailPath: '/src/img/logo.png'
    });
}
