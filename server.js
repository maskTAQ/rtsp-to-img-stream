/*
思路说明
1. 通过post请求激活->新建视频源组[客户端连接socket 地址为 ip:port?username:password:ip:port]
2. 当有新的socket连接并且是视频组的第一次连接则开始转码
3. 当视频组最后一个用户断开则停止解码
*/
//项目依赖
const express = require('express');
const rtsp = require('rtsp-ffmpeg');
const bodyParser = require('body-parser');

//启动 socket服务
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(3000, function() {
    console.log('server is runing');
});

//解析post参数
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

//资源目录
app.use('/src', express.static('src'));

//所有正在激活的视频组 [{token:'ip:port',count:0}]
let liveRtspStream = [];

//解析socket的登录参数判断是否合法
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
//新建视频组
let createNewRtsp = (rtspUrl, socketName, loginInfo) => {
    //rtspUrl = "rtsp://admin:smt12345@117.64.146.57:554/h264/ch1/main/av_stream"

    //转码配置
    let stream = new rtsp.FFMpeg({input: rtspUrl, rate: 10, resolution: '48x27', quality: 50});
    stream.on('start', function() {
        console.log(socketName + ' 开始转码');
    });
    stream.on('stop', function() {
        console.log(socketName + ' 结束转码');
    });

    //新建socket组
    let ns = io.of('/' + socketName);
    ns.on('connection', function(wsocket) {
        //判断登录信息是否合法 不合法退出 合法发送实时的图片流
        let token = getToken(wsocket.request.url).token;
        let [un,
            pw,
            ip,
            pt] = token.split(':');

        const verifyParams = {
            username: un,
            password: pw,
            ip: ip,
            port: pt
        };

        for (let item in verifyParams) {
            if (loginInfo[item] != verifyParams[item]) {
                wsocket.emit('login_error', `${item}参数错误`);
                return console.log(`${item}参数错误`);
            }
        }

        console.log(socketName + ' 新增用户连接');
        //初始化当前视频组的索引值
        let liveRtspStreamIndex = NaN;
        for ([i, item]of liveRtspStream.entries()) {
            if (item.token === socketName) {
                //更新当前视频组的索引值
                liveRtspStreamIndex = i;
            }
        }
        //更新视频组的用户数量
        liveRtspStream[liveRtspStreamIndex].count++;
        console.log(liveRtspStream);
        //实时转码通过socket传输数据
        let pipeStream = function(data) {
            wsocket.emit('data', data);
        };
        stream.on('data', pipeStream);

        //用户断开连接
        wsocket.on('disconnect', function() {
            console.log(socketName + ' 断开用户连接');
            //更新视频组的连接数
            liveRtspStream[liveRtspStreamIndex].count--;
            console.log(liveRtspStream);

            //每当用户断开连接 就注销对应的回调函数 当绑定的回调函数数量为0 rtsp-ffmpeg内部会停止转码
            stream.removeListener('data', pipeStream);
        });
    });

}

//当有新用户连接 判断售票员是否在转码 通过socket连接触发
// io.on('connection', function(socket) {
//     //获取前端传递的参数
//     let params = getToken(socket.request.url).token.split('-');
//     let [username,
//         password,
//         ip,
//         port,
//         channel = 1] = params;
//
//     let rtspUrl = `rtsp://${username}:${password}@${ip}:${port}/h264/ch${channel}/main/av_stream`,
//         socketName = ip + ':' + port;
//
//     //如果当前视频组已激活 则返回
//     for ([i, item]of liveRtspStream.entries()) {
//         if (item.token == socketName && item.count > 0) {
//             console.log(liveRtspStream);
//             return console.log(socketName + ' 正在转码中');
//         }
//     }
//
//     //转码视频流
//     return createNewRtsp(rtspUrl, socketName);
// });

//激活rtsp转码 通过post请求手动激活视频源
app.post('/rtsp', function(req, res) {
    let {
        username,
        password,
        ip,
        port,
        channel = 1
    } = req.body;

    if (!username || !password || !ip || !port) {
        return res.json({Status: 0, Message: '请完成填写登录信息', Data: req.body});
    }

    const rtspUrl = `rtsp://${username}:${password}@${ip}:${port}/h264/ch${channel}/main/av_stream`;
    const socketName = ip + ':' + port;

    //如果当前视频组已激活 则返回
    for ([i, item]of liveRtspStream.entries()) {
        if (item.token == socketName) {
            console.log(socketName + ' 正在转码中');
            res.json({Status: 1, Message: '此视频流已激活'});
            return;
        }
    }

    //转码视频流
    liveRtspStream.push({token: socketName, count: 0});
    res.json({Status: 1, Message: '激活成功'});
    return createNewRtsp(rtspUrl, socketName, req.body);

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
