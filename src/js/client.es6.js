class RTSP {
    constructor({
        username = RTSP.required('username'),
        password = RTSP.required('password'),
        ip = RTSP._required('ip'),
        port = RTSP.required('port'),
        channel = 1,
        rtspDom = RTSP.required('rtspDom'),
        loadingClassName = 'ball-scale-multiple'
    }, optional) {

        this.rtspInfo = {
            username,
            password,
            ip,
            port,
            channel,
            rtspDom,
            loadingClassName
        };
        this.config = Object.assign({
            thumbnailPath: '/src/img/logo.png'
        }, optional);

        this.init();
    }
    static required(name) {
        throw new Error(`${name}参数是必须的`);
    }
    init() {
        const {rtspDom} = this.rtspInfo;

        if (this.getType(rtspDom) !== "[object HTMLDivElement]") {
            return alert('请输入正确的rtsp容器');
        }

        //初始化视频加载状态
        this.showLoader();
        rtspDom.classList.add('play');
        //初始化全屏状态
        this.fullScreenStatus = false;
        //初始化视频状态
        this.error = false;
        //初始化定时器id
        this.timeoutId = {
            //一段时间后隐藏toolbar
            toolbar: NaN,
            //判断是单击还是双击
            tabInterval: NaN
        }
        //设置视频容器的宽高
        let {outerWidth, outerHeight} = window;
        rtspDom.style.width = outerWidth + 'px';
        rtspDom.style.height = window.outerWidth * 9 / 16 + 'px';
        //生成视频canvas
        this.createVideoCanvas()
        //生成loading组件
            .then(m => {
            const {rtspDom, showLoader} = this;
            //创建loading元素
            return this.createLoadingComponent();
        })
        //生成工具条
            .then(m => {
            return this.createToolbar();
        })
        //激活视频
            .then(m => {
            this.linkServer();
        });
    }
    createVideoCanvas() {
        return new Promise((resolve, reject) => {
            //将 canvas 添加到rtspdom中
            const _this = this;
            const {rtspDom} = this.rtspInfo;
            const VideoCanvas = document.createElement("canvas");
            VideoCanvas.width = '480';
            VideoCanvas.height = '270';
            const videoDomCtx = VideoCanvas.getContext("2d");

            //设置预览图
            const previewImg = new Image();
            previewImg.onload = function() {
                //在视频加载失败的时候显示错误信息 不显示缩略图 加载缩略图是异步的
                !_this.error && videoDomCtx.drawImage(previewImg, 0, 0, 480, 270);
            };
            previewImg.src = this.config.thumbnailPath;

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
    createToolbar() {
        return new Promise((resolve, reject) => {
            const rtspDom = this.rtspInfo.rtspDom;
            //创建toolbar容器
            const toolBarWrapperDom = document.createElement("span");
            toolBarWrapperDom.className = 'tool-bar';
            //创建全屏按钮
            const fullScreenButton = document.createElement("button");
            fullScreenButton.className = 'full-screen-button';
            //这里的闭包是存储 容器的宽高信息
            let toggleFullScreen = this.toggleFullScreen().bind(this);
            fullScreenButton.addEventListener('click', () => {
                toggleFullScreen();
            });
            toolBarWrapperDom.appendChild(fullScreenButton);

            //创建视频播放停止按钮
            const playStopButton = document.createElement("button");
            playStopButton.className = 'play-stop-button';
            playStopButton.addEventListener('click', () => {
                this.doubleTabTogglePlay();
            });
            toolBarWrapperDom.appendChild(playStopButton);
            //将toolbar添加到rtsp容器中
            rtspDom.appendChild(toolBarWrapperDom);

            //处理单机和双击事件
            this.tabEventListener(rtspDom, toolBarWrapperDom);
            resolve('toolbar构造成功');
        });
    }
    tabEventListener(rtspDom, toolBarWrapperDom) {
        let tabInterval = 0;
        rtspDom.addEventListener('click', () => {
            //距离上次点击间隔小于300ms 属于双击
            if (Date.now() - tabInterval < 300) {
                //取消单击的方法
                clearTimeout(this.timeoutId.tabInterval);
                //重置时间间隔避免下次单机也判断为双击
                tabInterval = 0;
                //执行双击的方法
                this.doubleTabTogglePlay();
                console.log('双击');
            } else {
                tabInterval = Date.now();
                this.timeoutId.tabInterval = setTimeout(() => {
                    //执行单击的方法
                    console.log('单击');
                    this.tapToolBarShow(toolBarWrapperDom);
                }, 300);

            }
        });
    }
    tapToolBarShow(toolBarWrapperDom) {
        //根据toolbar的透明度来判断是否显示
        const isToolbarShow = Boolean(Number(toolBarWrapperDom.style.opacity));

        if (isToolbarShow) {
            toolBarWrapperDom.style.opacity = '0';
            clearTimeout(this.timeoutId.toolbar);
        } else {
            toolBarWrapperDom.style.opacity = '1';
            //3s之后自动隐藏toolbar
            this.timeoutId.toolbar = setTimeout(() => {
                toolBarWrapperDom.style.opacity = '0';
            }, 3000);
        }
    }
    doubleTabTogglePlay() {
        const {rtspDom} = this.rtspInfo;
        //如果当前视频正在加载 return
        if ([].slice.call(rtspDom.classList).includes(this.rtspInfo.loadingClassName)) {
            return console.log(1);
        }
        if (this.live) {
            this.stop();
        } else {
            this.play();
        }

    }
    play() {
        this.showLoader();
        rtspDom.classList.remove('stop');
        rtspDom.classList.add('play');
        //激活连接
        this.rtspSocket.connect();
    }
    stop() {
        rtspDom.classList.add('stop');
        rtspDom.classList.remove('play');
        //断开socket连接
        this.rtspSocket.disconnect();
        this.live = false;
    }
    getType(o) {
        return ({}).toString.call(o);
    }
    linkServer() {
        const {username, password, ip, port, channel} = this.rtspInfo;
        const token = `${username}-${password}-${ip}-${port}-${channel}`;
        //token跟的值是用于后台登录转码源的参数
        const url = `${location.origin}/${ip}:${port}?token=${token}/ss`;
        this.rtspSocket = io(url, {
            //重连次数
            reconnectionAttempts: 3,
            'timeout': 6000
        });
        console.log(this.rtspSocket)
        const rtspSocketInfo = {
                timeoutTime: 0
            },
            rtspSocket = this.rtspSocket;
        //连接超时
        rtspSocket.on('connect_timeout', () => {
            if (rtspSocketInfo.timeoutTime < 3) {
                rtspSocketInfo.timeoutTime++
            } else {
                this.showError('连接超时');
            }
        });
        //连接错误
        rtspSocket.on('connect_error', (e) => {
            if (e === 'timeout') {
                return
            }
            this.showError(e);
        });

        //连接成功之后 接收数据
        rtspSocket.on('data', data => {
            //如之前是在加载中 隐藏加载组件
            if (!this.live) {
                this.hideLoader();
            }
            this.liveImg(data);
        });

        //在谷歌在超时的回调函数并不会起作用
        setTimeout(() => {
            if (!this.live) {
                this.hideLoader();
                this.showError('连接超时');
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
    toggleFullScreen = () => {
        const {outerWidth, outerHeight} = window;

        const rtspDom = this.rtspInfo.rtspDom;
        const videoDom = this.videoDom;

        const {width, height} = rtspDom.style;

        //视频容器xy轴偏移长度
        const excursion = Math.abs((outerWidth - outerHeight) / 2);
        return () => {
            if (this.fullScreenStatus) {
                rtspDom.classList.remove('full-screen');
                this.addStyle(rtspDom, {
                    width: width,
                    height: height,
                    marginTop: 0,
                    marginLeft: 0
                });
            } else {
                rtspDom.classList.add('full-screen');
                this.addStyle(rtspDom, {
                    width: outerHeight + 'px',
                    height: outerWidth + 'px',
                    marginTop: excursion + 'px',
                    marginLeft: -excursion + 'px'
                });
            }
            this.fullScreenStatus = !this.fullScreenStatus;
        }
    }
    addStyle(dom, styles) {
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
    }
    showError(e) {
        const {videoDomCtx} = this;
        const {rtspDom, loadingClassName} = this.rtspInfo;
        videoDomCtx.clearRect(0, 0, 480, 270);
        videoDomCtx.fillStyle = '#e9230b';
        videoDomCtx.font = '48px 微软雅黑';
        videoDomCtx.textAlign = 'center';
        videoDomCtx.fillText('登录失败', 240, 159);

        //更新状态
        this.live = false;
        this.error = true;
        rtspDom.classList.add('load-error');
        rtspDom.classList.remove(loadingClassName);
    }
}

//let demo = new RTSPVideo();

window.onload = function() {
    /*
  url取参数->解码->调用RTSP
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
    const urlUnencrypt = (code) => {
        code = unescape(code);
        let c = String.fromCharCode(code.charCodeAt(0) - code.length);
        for (let i = 1; i < code.length; i++) {
            c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
        }
        return c;
    }
    const params = GetRequest();

    try {
        //从url中取参数
        var {username, password, ip, port, channel} = JSON.parse(urlUnencrypt(params.token));
    } catch (e) {
        alert('地址非法');
    }
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
