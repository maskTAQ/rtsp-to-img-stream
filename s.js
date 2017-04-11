Stream = require('node-rtsp-stream');
stream = new Stream({
	name: 'name',
	streamUrl: 'rtsp://admin:smt12345@192.168.1.88:554/h264/ch1/main/av_stream',
	wsPort: 9999
});