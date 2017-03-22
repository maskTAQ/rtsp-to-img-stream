const app = require('express')(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  rtsp = require('rtsp-ffmpeg');
server.listen(3000, function() {
  console.log('server is runing');
});



// stream = new rtsp.FFMpeg({
//   input: 'rtsp://admin:smt12345@192.168.1.88:554/h264/ch1/main/av_stream',
//   rate: 1,
//   resolution: '320x240',
//   quality: 10
// });
// io.on('connection', function(socket) {
//   var pipeStream = function(data) {
//     socket.emit('data', data);
//   };
//   stream.on('data', pipeStream);
//   socket.on('disconnect', function() {
//     stream.removeListener('data', pipeStream);
//   });
// });
// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

//所有正在激活的rtsp
let liveSocketNames = [];

let createNewRtsp = (rtspUrl, socketName) => {
  let stream = new rtsp.FFMpeg({
    input: rtspUrl,
    rate: 60,
    resolution: '160x120',
    quality: 100
  });
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

app.get('/rtsp', function(req, res) {
  if (!liveSocketNames.includes(req.query.socketName)) {
    return res.json({
      status: 0,
      message: '标识符错误或者未激活'
    });
  }
  console.log();
  return res.sendFile(__dirname + '/index.html');
})