class RTSP {
    constructor({
        username = 'admin',
        password = 'smt12345',
        ip = '192.168.1.88',
        port = '554',
        channel = 1,
        rtspDom,
        loadingClassName = 'ball-scale-multiple'
    }) {

        this.rtspInfo = {
            username,
            password,
            ip,
            port,
            channel,
            rtspDom,
            loadingClassName
        };
        this.initContainer()
    }

    initContainer() {
        const {getType, createVideoCanvas, createLoadingComponent, linkServer} = this;
        const {rtspDom} = this.rtspInfo;

        if (getType(rtspDom) !== "[object HTMLDivElement]") {
            return alert('请输入正确的rtsp容器');
        }
        //视频播放状态
        this.live = false;
        //设置视频容器的宽高
        let {outerWidth, outerHeight} = window;
        rtspDom.style.width = outerWidth + 'px';

        //生成视频canvas
        createVideoCanvas.call(this)
        //生成loading组件
            .then(m => {
            const {rtspDom, showLoader} = this;
            //创建loading元素
            createLoadingComponent.call(this);
            //当前视频不在播放状态
            showLoader.call(this);
            return
        })
        //激活视频
            .then(m => {
            linkServer.call(this);
        });
        // let rtspCanvas = document.getElementsByTagName('canvas')[0],
        //     windowWidth = window.innerWidth,
        //     widthHeight = window.innerHeight;

        //挂载ctx对象
        // this.videoDomCtx = rtspCanvas.getContext("2d");
        //
        // rtspCanvas.style.width = windowWidth > 500
        //     ? '480px'
        //     : windowWidth + 'px';

        //链接socket服务
        //  this.linkSocket();
    }
    createVideoCanvas() {
        return new Promise((resolve, reject) => {
            //将 canvas 添加到rtspdom中
            const {rtspDom} = this.rtspInfo;
            const VideoCanvas = document.createElement("canvas");
            VideoCanvas.width = '480';
            VideoCanvas.height = '270';
            const videoDomCtx = VideoCanvas.getContext("2d");

            //设置预览图
            const previewImg = new Image();
            previewImg.onload = function() {
                videoDomCtx.drawImage(previewImg, 0, 0, 480, 270);
            };
            previewImg.src = 'http://localhost:3000/logo.png';

            this.videoDomCtx = videoDomCtx;
            rtspDom.appendChild(VideoCanvas);

            //绑定canvas dom到实例上
            this.videoDom = VideoCanvas;

            resolve('video canvas 构造成功');
        });
    }
    createLoadingComponent() {
        return new Promise((resolve, reject) => {
            //构建  loading组件
            let {rtspDom} = this.rtspInfo,
                loadersDomArr = [];
            for (var i = 0; i < 3; i++) {
                const loaderDom = document.createElement("div");
                loaderDom.className = 'loader';
                loadersDomArr.push(loaderDom);
            }
            loadersDomArr.forEach(loaderDom => {
                rtspDom.appendChild(loaderDom);
            });

            resolve('loading组件构造成功');
        });
    }
    getType(o) {
        return ({}).toString.call(o);
    }
    linkServer() {
        const {videoDom, liveImg, showError, hideLoader} = this;

        const rtspSocket = io(location.origin + '/192.168.1.88:554', {
            //重连次数
            reconnectionAttempts: 3,
            'timeout': 6000
        });

        const rtspSocketInfo = {
            timeoutTime: 0
        }
        //连接超时
        rtspSocket.on('connect_timeout', () => {
            if (rtspSocketInfo.timeoutTime < 3) {
                rtspSocketInfo.timeoutTime++
            } else {
                showError('连接超时');
            }
        });
        //连接错误
        rtspSocket.on('connect_error', (e) => {
            if (e === 'timeout') {
                return
            }
            showError(e);
        });

        //连接成功之后 接收数据
        rtspSocket.on('data', data => {
            //如之前是在加载中 隐藏加载组件
            if (!this.live) {
                hideLoader.call(this);
            }
            liveImg.call(this, data);
        });

        //在谷歌在超时的回调函数并不会起作用
        setTimeout(() => {
            if (!this.live) {
                hideLoader.call(this);
                showError('连接超时');
            }
        }, 15000);
    }
    liveImg(data) {
        const {videoDomCtx} = this;
        var bytes = new Uint8Array(data);

        var blob = new Blob([bytes], {type: 'application/octet-binary'});

        var url = URL.createObjectURL(blob);

        var img = new Image;
        img.onload = function() {
            URL.revokeObjectURL(url);
            videoDomCtx.drawImage(img, 0, 0, 480, 270);
        };
        img.src = url;
    }
    fullScreen() {
        const {outerWidth, outerHeight} = window;
        const {rtspDom} = this.rtspInfo;
        const {videoDom} = this;

        rtspDom.classList.add('full-screen');

        //视频容器xy轴偏移长度
        const excursion = Math.abs((outerWidth - outerHeight) / 2);
        //视频容器向上的偏移长度
        this.addStyle(rtspDom, {
            width: outerHeight + 'px',
            height: outerWidth + 'px',
            marginTop: excursion + 'px',
            marginLeft: -excursion + 'px'
        });
    }
    addStyle(dom, styles) {
        console.log(styles)
        for (let style in styles) {
            dom.style[style] = styles[style];
        }
    }
    showLoader() {
        const {rtspDom, loadingClassName} = this.rtspInfo;
        this.live = false;
        rtspDom.classList.add(loadingClassName);

    }
    hideLoader() {
        const {rtspDom, loadingClassName} = this.rtspInfo;
        this.live = true;
        rtspDom.classList.remove(loadingClassName);
        this.fullScreen();
    }
    showError(e) {
        console.log(e);
    }
}

//let demo = new RTSPVideo();

window.onload = function() {
    const href = location.href,
        ip_port_index = href.lastIndexOf('/') + 1,
        ip_port_arr = href.substring(ip_port_index).split(':');

    //取出url中的ip和port
    const [ip,
        port] = ip_port_arr;
    window.rtspDom = document.getElementById('rtsp');
    //加载rtsp
    let demo = new RTSP({ip, port, rtspDom});
}
