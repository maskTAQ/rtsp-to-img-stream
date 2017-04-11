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
        this.init()
    }

    init() {
        const {
            getType,
            createVideoCanvas,
            createLoadingComponent,
            createToolbar,
            linkServer,
            showLoader
        } = this;
        const {
            rtspDom
        } = this.rtspInfo;

        if (getType(rtspDom) !== "[object HTMLDivElement]") {
            return alert('请输入正确的rtsp容器');
        }

        //初始化视频播放状态
        showLoader.call(this);

        //初始化全屏状态
        this.fullScreenStatus = false;

        //初始化toolbar按钮组
        this.toolbarButtonGroup = {
            fullScreenButtomDom: null
        };

        //设置视频容器的宽高
        let {
            outerWidth,
            outerHeight
        } = window;
        rtspDom.style.width = outerWidth + 'px';
        rtspDom.style.height = window.outerWidth * 9 / 16 + 'px';
        //生成视频canvas
        createVideoCanvas.call(this)
            //生成loading组件
            .then(m => {
                const {
                    rtspDom,
                    showLoader
                } = this;
                //创建loading元素
                return createLoadingComponent.call(this);
            })
            //生成工具条
            .then(m => {
                return createToolbar.call(this);
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
            const {
                rtspDom
            } = this.rtspInfo;
            const VideoCanvas = document.createElement("canvas");
            VideoCanvas.width = '480';
            VideoCanvas.height = '270';
            const videoDomCtx = VideoCanvas.getContext("2d");

            //设置预览图
            const previewImg = new Image();
            previewImg.onload = function() {
                videoDomCtx.drawImage(previewImg, 0, 0, 480, 270);
            };
            previewImg.src = '/src/img/logo.png';

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
            let {
                rtspDom
            } = this.rtspInfo,
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
            //创建全屏按钮图标
            const fullScreenButtonIcon = document.createElement("i");
            fullScreenButtonIcon.className = 'full-screen-button-icon';
            fullScreenButton.appendChild(fullScreenButtonIcon);

            //将toolbar添加到rtsp容器中
            rtspDom.appendChild(toolBarWrapperDom);

            //点击显示工具条
            this.tapToolBarShow(rtspDom, toolBarWrapperDom);


            resolve('toolbar构造成功');
        });
    }
    tapToolBarShow(rtspDom, toolBarWrapperDom) {
        //这里的闭包是存储定时器的id
        rtspDom.addEventListener('click', (() => {
            let toolbarShowTimeoutId = NaN;
            return () => {
                const isToolbarShow = Boolean(Number(toolBarWrapperDom.style.opacity));
                if (isToolbarShow) {
                    toolBarWrapperDom.style.opacity = '0';
                    clearTimeout(toolbarShowTimeoutId);
                } else {
                    toolBarWrapperDom.style.opacity = '1';
                    toolbarShowTimeoutId = setTimeout(() => {
                        toolBarWrapperDom.style.opacity = '0';
                    }, 3000)
                }
            }

        })());
    }
    getType(o) {
        return ({}).toString.call(o);
    }
    linkServer() {
        const {
            videoDom,
            liveImg,
            showError,
            hideLoader
        } = this;

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
        const {
            videoDomCtx
        } = this;
        var bytes = new Uint8Array(data);

        var blob = new Blob([bytes], {
            type: 'application/octet-binary'
        });

        var url = URL.createObjectURL(blob);

        var img = new Image;
        img.onload = function() {
            URL.revokeObjectURL(url);
            videoDomCtx.drawImage(img, 0, 0, 480, 270);
        };
        img.src = url;
    }
    toggleFullScreen = () => {
        const {
            outerWidth,
            outerHeight
        } = window;

        const rtspDom = this.rtspInfo.rtspDom;
        const videoDom = this.videoDom;

        const {
            width,
            height
        } = rtspDom.style;



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
        const {
            rtspDom,
            loadingClassName
        } = this.rtspInfo;
        this.live = false;
        rtspDom.classList.add(loadingClassName);

    }
    hideLoader() {
        const {
            rtspDom,
            loadingClassName
        } = this.rtspInfo;
        this.live = true;
        rtspDom.classList.remove(loadingClassName);
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
        port
    ] = ip_port_arr;
    window.rtspDom = document.getElementById('rtsp');
    //加载rtsp
    let demo = new RTSP({
        ip,
        port,
        rtspDom
    });
}
