'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RTSP = function () {
    function RTSP(_ref, optional) {
        var _ref$username = _ref.username,
            username = _ref$username === undefined ? RTSP.required('username') : _ref$username,
            _ref$password = _ref.password,
            password = _ref$password === undefined ? RTSP.required('password') : _ref$password,
            _ref$ip = _ref.ip,
            ip = _ref$ip === undefined ? RTSP._required('ip') : _ref$ip,
            _ref$port = _ref.port,
            port = _ref$port === undefined ? RTSP.required('port') : _ref$port,
            _ref$channel = _ref.channel,
            channel = _ref$channel === undefined ? 1 : _ref$channel,
            _ref$rtspDom = _ref.rtspDom,
            rtspDom = _ref$rtspDom === undefined ? RTSP.required('rtspDom') : _ref$rtspDom,
            _ref$loadingClassName = _ref.loadingClassName,
            loadingClassName = _ref$loadingClassName === undefined ? 'ball-scale-multiple' : _ref$loadingClassName;

        _classCallCheck(this, RTSP);

        _initialiseProps.call(this);

        this.rtspInfo = {
            username: username,
            password: password,
            ip: ip,
            port: port,
            channel: channel,
            rtspDom: rtspDom,
            loadingClassName: loadingClassName
        };
        this.config = Object.assign({
            thumbnailPath: '/src/img/logo.png'
        }, optional);

        this.init();
    }

    _createClass(RTSP, [{
        key: 'init',
        value: function init() {
            var _this2 = this;

            var rtspDom = this.rtspInfo.rtspDom;


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
            };
            //设置视频容器的宽高
            var _window = window,
                outerWidth = _window.outerWidth,
                outerHeight = _window.outerHeight;

            rtspDom.style.width = outerWidth + 'px';
            rtspDom.style.height = window.outerWidth * 9 / 16 + 'px';
            //生成视频canvas
            this.createVideoCanvas()
            //生成loading组件
            .then(function (m) {
                var rtspDom = _this2.rtspDom,
                    showLoader = _this2.showLoader;
                //创建loading元素

                return _this2.createLoadingComponent();
            })
            //生成工具条
            .then(function (m) {
                return _this2.createToolbar();
            })
            //激活视频
            .then(function (m) {
                _this2.linkServer();
            });
        }
    }, {
        key: 'createVideoCanvas',
        value: function createVideoCanvas() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                //将 canvas 添加到rtspdom中
                var _this = _this3;
                var rtspDom = _this3.rtspInfo.rtspDom;

                var VideoCanvas = document.createElement("canvas");
                VideoCanvas.width = '480';
                VideoCanvas.height = '270';
                var videoDomCtx = VideoCanvas.getContext("2d");

                //设置预览图
                var previewImg = new Image();
                previewImg.onload = function () {
                    //在视频加载失败的时候显示错误信息 不显示缩略图 加载缩略图是异步的
                    !_this.error && videoDomCtx.drawImage(previewImg, 0, 0, 480, 270);
                };
                previewImg.src = _this3.config.thumbnailPath;

                _this3.videoDomCtx = videoDomCtx;
                rtspDom.appendChild(VideoCanvas);

                //绑定canvas dom到实例上
                _this3.videoDom = VideoCanvas;

                resolve('video canvas 构造成功');
            });
        }
    }, {
        key: 'createLoadingComponent',
        value: function createLoadingComponent() {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                //构建  loading组件
                var rtspDom = _this4.rtspInfo.rtspDom,
                    loadersDomArr = [];

                for (var i = 0; i < 3; i++) {
                    var loaderDom = document.createElement("div");
                    loaderDom.className = 'loader';
                    loadersDomArr.push(loaderDom);
                }
                loadersDomArr.forEach(function (loaderDom) {
                    rtspDom.appendChild(loaderDom);
                });

                resolve('loading组件构造成功');
            });
        }
    }, {
        key: 'createToolbar',
        value: function createToolbar() {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                var rtspDom = _this5.rtspInfo.rtspDom;
                //创建toolbar容器
                var toolBarWrapperDom = document.createElement("span");
                toolBarWrapperDom.className = 'tool-bar';
                //创建全屏按钮
                var fullScreenButton = document.createElement("button");
                fullScreenButton.className = 'full-screen-button';
                //这里的闭包是存储 容器的宽高信息
                var toggleFullScreen = _this5.toggleFullScreen().bind(_this5);
                fullScreenButton.addEventListener('click', function () {
                    toggleFullScreen();
                });
                toolBarWrapperDom.appendChild(fullScreenButton);

                //创建视频播放停止按钮
                var playStopButton = document.createElement("button");
                playStopButton.className = 'play-stop-button';
                playStopButton.addEventListener('click', function () {
                    _this5.doubleTabTogglePlay();
                });
                toolBarWrapperDom.appendChild(playStopButton);
                //将toolbar添加到rtsp容器中
                rtspDom.appendChild(toolBarWrapperDom);

                //处理单机和双击事件
                _this5.tabEventListener(rtspDom, toolBarWrapperDom);
                resolve('toolbar构造成功');
            });
        }
    }, {
        key: 'tabEventListener',
        value: function tabEventListener(rtspDom, toolBarWrapperDom) {
            var _this6 = this;

            var tabInterval = 0;
            rtspDom.addEventListener('click', function () {
                //距离上次点击间隔小于300ms 属于双击
                if (Date.now() - tabInterval < 300) {
                    //取消单击的方法
                    clearTimeout(_this6.timeoutId.tabInterval);
                    //重置时间间隔避免下次单机也判断为双击
                    tabInterval = 0;
                    //执行双击的方法
                    console.log(rtspDom);
                    _this6.doubleTabTogglePlay();
                    console.log('双击');
                } else {
                    tabInterval = Date.now();
                    _this6.timeoutId.tabInterval = setTimeout(function () {
                        //执行单击的方法
                        console.log('单击');
                        _this6.tapToolBarShow(toolBarWrapperDom);
                    }, 300);
                }
            });
        }
    }, {
        key: 'tapToolBarShow',
        value: function tapToolBarShow(toolBarWrapperDom) {
            //根据toolbar的透明度来判断是否显示
            var isToolbarShow = Boolean(Number(toolBarWrapperDom.style.opacity));

            if (isToolbarShow) {
                toolBarWrapperDom.style.opacity = '0';
                clearTimeout(this.timeoutId.toolbar);
            } else {
                toolBarWrapperDom.style.opacity = '1';
                //3s之后自动隐藏toolbar
                this.timeoutId.toolbar = setTimeout(function () {
                    toolBarWrapperDom.style.opacity = '0';
                }, 3000);
            }
        }
    }, {
        key: 'doubleTabTogglePlay',
        value: function doubleTabTogglePlay() {
            var rtspDom = this.rtspInfo.rtspDom;
            //如果当前视频正在加载 return

            if (Array.from(rtspDom.classList).includes(this.rtspInfo.loadingClassName)) {
                return console.log(1);
            }
            if (this.live) {
                this.stop();
            } else {
                this.play();
            }
        }
    }, {
        key: 'play',
        value: function play() {
            var rtspDom = this.rtspInfo.rtspDom;

            this.showLoader();
            rtspDom.classList.remove('stop');
            rtspDom.classList.add('play');
            //激活连接
            this.rtspSocket.connect();
        }
    }, {
        key: 'stop',
        value: function stop() {
            var rtspDom = this.rtspInfo.rtspDom;

            rtspDom.classList.add('stop');
            rtspDom.classList.remove('play');
            //断开socket连接
            this.rtspSocket.disconnect();
            this.live = false;
        }
    }, {
        key: 'getType',
        value: function getType(o) {
            return {}.toString.call(o);
        }
    }, {
        key: 'linkServer',
        value: function linkServer() {
            var _this7 = this;

            var _rtspInfo = this.rtspInfo,
                username = _rtspInfo.username,
                password = _rtspInfo.password,
                ip = _rtspInfo.ip,
                port = _rtspInfo.port,
                channel = _rtspInfo.channel;
            //用于后台验证登录信息是否正确

            var token = username + ':' + password + ':' + ip + ':' + port + ':' + channel;
            //凭借socket地址 ip:port 是对应的socket视频组 token为登录信息
            var url = location.origin + '/' + ip + ':' + port + '?token=' + token;
            var rtspSocket = io(url, {
                //重连次数
                reconnectionAttempts: 3,
                //超时时间
                'timeout': 6000
            });

            //将socket实例绑定到实例上
            this.rtspSocket = rtspSocket;
            //用于判断已经尝试重连次数
            var rtspSocketInfo = {
                timeoutTime: 0
            };

            rtspSocket.on('login_error', function () {
                _this7.showError('登录失败,请检查登录信息!');
            });
            //连接超时
            rtspSocket.on('connect_timeout', function () {
                if (rtspSocketInfo.timeoutTime < 3) {
                    rtspSocketInfo.timeoutTime++;
                } else {
                    _this7.showError('连接超时');
                }
            });
            //连接错误
            rtspSocket.on('connect_error', function (e) {
                if (e === 'timeout') {
                    return;
                }
                _this7.showError(e);
            });

            //连接成功之后 接收数据
            rtspSocket.on('data', function (data) {
                //如之前是在加载中 隐藏加载组件
                if (!_this7.live) {
                    _this7.hideLoader();
                }
                _this7.liveImg(data);
            });

            //在谷歌在超时的回调函数并不会起作用
            setTimeout(function () {
                if (!_this7.live) {
                    _this7.hideLoader();
                    _this7.showError('连接超时');
                }
            }, 15000);
        }
    }, {
        key: 'liveImg',
        value: function liveImg(data) {
            var videoDomCtx = this.videoDomCtx;

            var bytes = new Uint8Array(data);

            var blob = new Blob([bytes], { type: 'application/octet-binary' });

            var url = URL.createObjectURL(blob);

            var img = new Image();
            img.onload = function () {
                URL.revokeObjectURL(url);
                videoDomCtx.drawImage(img, 0, 0, 480, 270);
            };
            img.src = url;
        }
    }, {
        key: 'addStyle',
        value: function addStyle(dom, styles) {
            for (var style in styles) {
                dom.style[style] = styles[style];
            }
        }
    }, {
        key: 'showLoader',
        value: function showLoader() {
            var _rtspInfo2 = this.rtspInfo,
                rtspDom = _rtspInfo2.rtspDom,
                loadingClassName = _rtspInfo2.loadingClassName;

            this.live = false;
            rtspDom.classList.add(loadingClassName);
            rtspDom.classList.remove('load-error');
        }
    }, {
        key: 'hideLoader',
        value: function hideLoader() {
            var _rtspInfo3 = this.rtspInfo,
                rtspDom = _rtspInfo3.rtspDom,
                loadingClassName = _rtspInfo3.loadingClassName;

            this.live = true;
            rtspDom.classList.remove(loadingClassName);
        }
    }, {
        key: 'showError',
        value: function showError(e) {
            var videoDomCtx = this.videoDomCtx;
            var _rtspInfo4 = this.rtspInfo,
                rtspDom = _rtspInfo4.rtspDom,
                loadingClassName = _rtspInfo4.loadingClassName;

            videoDomCtx.clearRect(0, 0, 480, 270);
            videoDomCtx.fillStyle = '#e9230b';
            videoDomCtx.font = '24px 微软雅黑';
            videoDomCtx.textAlign = 'center';
            videoDomCtx.fillText(e, 240, 147);

            //更新状态
            this.live = false;
            this.error = true;
            rtspDom.classList.add('load-error');
            rtspDom.classList.remove(loadingClassName);
        }
    }], [{
        key: 'required',
        value: function required(name) {
            throw new Error(name + '\u53C2\u6570\u662F\u5FC5\u987B\u7684');
        }
    }]);

    return RTSP;
}();

//let demo = new RTSPVideo();

var _initialiseProps = function _initialiseProps() {
    var _this8 = this;

    this.toggleFullScreen = function () {
        var _window2 = window,
            outerWidth = _window2.outerWidth,
            outerHeight = _window2.outerHeight;


        var rtspDom = _this8.rtspInfo.rtspDom;
        var videoDom = _this8.videoDom;

        var _rtspDom$style = rtspDom.style,
            width = _rtspDom$style.width,
            height = _rtspDom$style.height;

        //视频容器xy轴偏移长度

        var excursion = Math.abs((outerWidth - outerHeight) / 2);
        return function () {
            if (_this8.fullScreenStatus) {
                rtspDom.classList.remove('full-screen');
                _this8.addStyle(rtspDom, {
                    width: width,
                    height: height,
                    marginTop: 0,
                    marginLeft: 0
                });
            } else {
                rtspDom.classList.add('full-screen');
                _this8.addStyle(rtspDom, {
                    width: outerHeight + 'px',
                    height: outerWidth + 'px',
                    marginTop: excursion + 'px',
                    marginLeft: -excursion + 'px'
                });
            }
            _this8.fullScreenStatus = !_this8.fullScreenStatus;
        };
    };
};

window.onload = function () {
    /*
    url取参数->解码->调用RTSP
    */
    var GetRequest = function GetRequest() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = {};
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    };
    var urlUnencrypt = function urlUnencrypt(code) {
        code = unescape(code);
        var c = String.fromCharCode(code.charCodeAt(0) - code.length);
        for (var i = 1; i < code.length; i++) {
            c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
        }
        return c;
    };
    var params = GetRequest();

    try {
        //从url中取参数
        var _JSON$parse = JSON.parse(urlUnencrypt(params.token)),
            username = _JSON$parse.username,
            password = _JSON$parse.password,
            ip = _JSON$parse.ip,
            port = _JSON$parse.port,
            channel = _JSON$parse.channel;
    } catch (e) {
        alert('地址非法');
    }
    var rtspDom = document.getElementById('rtsp');
    //加载rtsp

    var demo = new RTSP({
        username: username,
        password: password,
        ip: ip,
        port: port,
        channel: channel,
        rtspDom: rtspDom,
        loadingClassName: 'ball-scale-multiple'
    }, {
        //缩略图路径
        thumbnailPath: '/src/img/logo.png'
    });
};
