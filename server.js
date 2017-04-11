const app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    rtsp = require('rtsp-ffmpeg');
server.listen(3000, function() {
    console.log('server is runing');
});

//所有正在激活的rtsp
let liveSocketNames = [];

let createNewRtsp = (rtspUrl, socketName) => {
    rtspUrl = "rtsp://mpv.cdn3.bigCDN.com:554/bigCDN/definst/mp4:bigbuckbunnyiphone_400.mp4"
    let stream = new rtsp.FFMpeg({input: rtspUrl, rate: 30, resolution: '960x540', quality: 1000});
    stream.on('start', function() {
        console.log(rtspUrl + ' started');
    });
    stream.on('stop', function() {
        console.log(rtspUrl + ' stopped');
    });

    let ns = io.of('/' + socketName);
    ns.on('connection', function(wsocket) {
        console.log('connected to ' + rtspUrl);
        var pipeStream = function(data) {
            wsocket.emit('data', data);
        };
        stream.on('data', pipeStream);

        wsocket.on('disconnect', function() {
            console.log('disconnected from  ' + rtspUrl);
            let remove_i = liveSocketNames.findIndex(function(url) {
                return url == rtspUrl;
            });
            liveSocketNames.slice(remove_i, 1);

            stream.removeListener('data', pipeStream);
        });
    });

    liveSocketNames.push(socketName);
    //return res.sendFile(__dirname + '/index.html');
}

//激活rtsp转码
app.post('/rtsp', function(req, res) {
    let {
        username = 'admin',
        password = 'smt12345',
        ip = '192.168.1.88',
        port = '554',
        channel = 1
    } = req.query;

    let rtspUrl = `rtsp://${username}:${password}@${ip}:${port}/h264/ch${channel}/main/av_stream`,
        socketName = ip + ':' + port;

    console.log(rtspUrl)

    if (liveSocketNames.includes(rtspUrl)) {
        console.log('返回以加载的')
        return //res.sendFile(__dirname + '/index.html?socketName=' + socketName);
    }

    return createNewRtsp(rtspUrl, socketName);

});

//访问吐出页面
app.get('/rtsp', function(req, res) {
    if (!liveSocketNames.includes(req.query.socketName)) {
        return res.json({status: 0, message: '标识符错误或者未激活'});
    }
    return res.sendFile(__dirname + '/index.html');
})

app.get('/rtsp/:name', function(req, res) {
    var options = {
        root: __dirname,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    console.log(req.params);
    let fileName = req.params.name;
    res.sendFile('index.html', options, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
            console.log('Sent:', fileName);
        }
    });
})

app.get('/:script', function(req, res) {
    var options = {
        root: __dirname,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    let scriptName = req.params.script;
    res.sendFile(scriptName, options, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
    });
});
