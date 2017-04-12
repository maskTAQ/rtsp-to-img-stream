const express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    rtsp = require('rtsp-ffmpeg');
server.listen(3000, function() {
    console.log('server is runing');
});
var fs = require("fs");
app.use('/src', express.static('src'));
//所有正在激活的rtsp [{token:'ip:port',count:0}]
let liveRtspStream = [];

let createNewRtsp = (rtspUrl, socketName) => {
    //rtspUrl = "rtsp://mpv.cdn3.bigCDN.com:554/bigCDN/definst/mp4:bigbuckbunnyiphone_400.mp4"

    //转码配置
    let stream = new rtsp.FFMpeg({input: rtspUrl, rate: 30, resolution: '96x54', quality: 1000});
    stream.on('start', function() {
        console.log(socketName + ' 开始转码');
    });
    stream.on('stop', function() {
        console.log(socketName + ' 结束转码');
    });

    //新建socket组
    let ns = io.of('/' + socketName);
    ns.on('connection', function(wsocket) {
        console.log(socketName + ' 新增用户连接');
        let liveRtspStreamIndex = NaN;
        for ([i, item]of liveRtspStream.entries()) {
            if (item.token === socketName) {
                liveRtspStreamIndex = i;
            }
        }

        //如果是新建立的转码组
        if (!liveRtspStreamIndex && liveRtspStreamIndex != 0) {
            liveRtspStream.push({token: socketName, count: 1});
            liveRtspStreamIndex = 0;
        } else {
            liveRtspStream[liveRtspStreamIndex].count++;
        }

        var pipeStream = function(data) {
            wsocket.emit('data', data);
        };
        stream.on('data', pipeStream);

        //当此视频源无人连接则终止转码
        wsocket.on('disconnect', function() {
            console.log(socketName + ' 断开用户连接');
            liveRtspStream[liveRtspStreamIndex].count--;
            if (liveRtspStream[liveRtspStreamIndex].count == 0) {
                stream.removeListener('data', pipeStream);
            }

        });
    });

}
const getToken = (url) => {
    let theRequest = {};
    if (url.indexOf("?") != -1) {
        let str = url.substr(url.indexOf("?") + 1);
        let strs = str.split("&");
        for (let i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;

};

//当有新用户连接 判断售票员是否在转码
io.on('connection', function(socket) {
    //获取前端传递的参数
    let params = getToken(socket.request.url).token.split('-');
    let [username,
        password,
        ip,
        port,
        channel = 1] = params;

    let rtspUrl = `rtsp://${username}:${password}@${ip}:${port}/h264/ch${channel}/main/av_stream`,
        socketName = ip + ':' + port;

    //如果当前视频流正在转码 则返回
    for ([i, item]of liveRtspStream.entries()) {
        if (item.token == socketName && item.count > 0) {
            return console.log(socketName + ' 正在转码中');
        }
    }

    //转码视频流
    return createNewRtsp(rtspUrl, socketName);
});

//激活rtsp转码 通过post请求手动激活视频源
app.post('/rtsp', function(req, res) {
    let {
        username,
        password,
        ip,
        port,
        channel = 1
    } = req.query;

    let rtspUrl = `rtsp://${username}:${password}@${ip}:${port}/h264/ch${channel}/main/av_stream`,
        socketName = ip + ':' + port;

    console.log(rtspUrl);
    //如果当前视频流正在转码 则返回
    if (liveRtspStream.includes(socketName)) {
        console.log('返回以加载的')
        return
    }

    //转码视频流
    return createNewRtsp(rtspUrl, socketName);

});

//访问吐出页面
app.get('/rtsp', function(req, res) {
    var options = {
        root: __dirname,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    res.sendFile('index.html', options, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();

        }
    });
});
