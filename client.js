window.onload = function() {
	var rtspCanvas = document.getElementsByTagName('canvas')[0],
		rtspCtx = rtspCanvas.getContext("2d"),
		windowWidth = window.innerWidth,
		widthHeight = window.innerHeight;


	rtspCanvas.style.width = windowWidth;

	var divSocket = io(location.origin + '/192.168.1.88:554');
	divSocket.on('data', function(data) {

		var bytes = new Uint8Array(data);

		var blob = new Blob([bytes], {
			type: 'application/octet-binary'
		});

		var url = URL.createObjectURL(blob);

		var img = new Image;
		img.onload = function() {
			URL.revokeObjectURL(url);
			rtspCtx.drawImage(img, 0, 0, 320, 240);
		};
		img.src = url;

		//image.src = 'data:image/jpeg;base64,' + base64ArrayBuffer(bytes);
	});
}