'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RTSP = function () {
    function RTSP(_ref) {
        var _ref$username = _ref.username,
            username = _ref$username === undefined ? 'admin' : _ref$username,
            _ref$password = _ref.password,
            password = _ref$password === undefined ? 'smt12345' : _ref$password,
            _ref$ip = _ref.ip,
            ip = _ref$ip === undefined ? '192.168.1.88' : _ref$ip,
            _ref$port = _ref.port,
            port = _ref$port === undefined ? '554' : _ref$port,
            _ref$channel = _ref.channel,
            channel = _ref$channel === undefined ? 1 : _ref$channel,
            rtspDom = _ref.rtspDom,
            _ref$loadingClassName = _ref.loadingClassName,
            loadingClassName = _ref$loadingClassName === undefined ? 'ball-scale-multiple' : _ref$loadingClassName;

        _classCallCheck(this, RTSP);

        this.rtspInfo = {
            username: username,
            password: password,
            ip: ip,
            port: port,
            channel: channel,
            rtspDom: rtspDom,
            loadingClassName: loadingClassName
        };
        this.initContainer();
    }

    _createClass(RTSP, [{
        key: 'initContainer',
        value: function initContainer() {
            var _this = this;

            var getType = this.getType,
                createVideoCanvas = this.createVideoCanvas,
                createLoadingComponent = this.createLoadingComponent,
                linkServer = this.linkServer;
            var rtspDom = this.rtspInfo.rtspDom;


            if (getType(rtspDom) !== "[object HTMLDivElement]") {
                return alert('请输入正确的rtsp容器');
            }
            //视频播放状态
            this.live = false;
            //设置视频容器的宽高
            var _window = window,
                outerWidth = _window.outerWidth,
                outerHeight = _window.outerHeight;

            rtspDom.style.width = outerWidth + 'px';

            //生成视频canvas
            createVideoCanvas.call(this)
            //生成loading组件
            .then(function (m) {
                var rtspDom = _this.rtspDom,
                    showLoader = _this.showLoader;
                //创建loading元素

                createLoadingComponent.call(_this);
                //当前视频不在播放状态
                showLoader.call(_this);
                return;
            })
            //激活视频
            .then(function (m) {
                linkServer.call(_this);
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
    }, {
        key: 'createVideoCanvas',
        value: function createVideoCanvas() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                //将 canvas 添加到rtspdom中
                var rtspDom = _this2.rtspInfo.rtspDom;

                var VideoCanvas = document.createElement("canvas");
                VideoCanvas.width = '480';
                VideoCanvas.height = '270';
                var videoDomCtx = VideoCanvas.getContext("2d");

                //设置预览图
                var previewImg = new Image();
                previewImg.onload = function () {
                    videoDomCtx.drawImage(previewImg, 0, 0, 480, 270);
                };
                previewImg.src = 'http://localhost:3000/logo.png';

                _this2.videoDomCtx = videoDomCtx;
                rtspDom.appendChild(VideoCanvas);

                //绑定canvas dom到实例上
                _this2.videoDom = VideoCanvas;

                resolve('video canvas 构造成功');
            });
        }
    }, {
        key: 'createLoadingComponent',
        value: function createLoadingComponent() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                //构建  loading组件
                var rtspDom = _this3.rtspInfo.rtspDom,
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
        key: 'getType',
        value: function getType(o) {
            return {}.toString.call(o);
        }
    }, {
        key: 'linkServer',
        value: function linkServer() {
            var _this4 = this;

            var videoDom = this.videoDom,
                liveImg = this.liveImg,
                showError = this.showError,
                hideLoader = this.hideLoader;


            var rtspSocket = io(location.origin + '/192.168.1.88:554', {
                //重连次数
                reconnectionAttempts: 3,
                'timeout': 6000
            });

            var rtspSocketInfo = {
                timeoutTime: 0
            };
            //连接超时
            rtspSocket.on('connect_timeout', function () {
                if (rtspSocketInfo.timeoutTime < 3) {
                    rtspSocketInfo.timeoutTime++;
                } else {
                    showError('连接超时');
                }
            });
            //连接错误
            rtspSocket.on('connect_error', function (e) {
                if (e === 'timeout') {
                    return;
                }
                showError(e);
            });

            //连接成功之后 接收数据
            rtspSocket.on('data', function (data) {
                //如之前是在加载中 隐藏加载组件
                if (!_this4.live) {
                    hideLoader.call(_this4);
                }
                liveImg.call(_this4, data);
            });

            //在谷歌在超时的回调函数并不会起作用
            setTimeout(function () {
                if (!_this4.live) {
                    hideLoader.call(_this4);
                    showError('连接超时');
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
        key: 'fullScreen',
        value: function fullScreen() {
            var _window2 = window,
                outerWidth = _window2.outerWidth,
                outerHeight = _window2.outerHeight;
            var rtspDom = this.rtspInfo.rtspDom;
            var videoDom = this.videoDom;


            rtspDom.classList.add('full-screen');

            //视频容器xy轴偏移长度
            var excursion = Math.abs((outerWidth - outerHeight) / 2);
            //视频容器向上的偏移长度
            this.addStyle(rtspDom, {
                width: outerHeight + 'px',
                height: outerWidth + 'px',
                marginTop: excursion + 'px',
                marginLeft: -excursion + 'px'
            });
        }
    }, {
        key: 'addStyle',
        value: function addStyle(dom, styles) {
            console.log(styles);
            for (var style in styles) {
                dom.style[style] = styles[style];
            }
        }
    }, {
        key: 'showLoader',
        value: function showLoader() {
            var _rtspInfo = this.rtspInfo,
                rtspDom = _rtspInfo.rtspDom,
                loadingClassName = _rtspInfo.loadingClassName;

            this.live = false;
            rtspDom.classList.add(loadingClassName);
        }
    }, {
        key: 'hideLoader',
        value: function hideLoader() {
            var _rtspInfo2 = this.rtspInfo,
                rtspDom = _rtspInfo2.rtspDom,
                loadingClassName = _rtspInfo2.loadingClassName;

            this.live = true;
            rtspDom.classList.remove(loadingClassName);
            this.fullScreen();
        }
    }, {
        key: 'showError',
        value: function showError(e) {
            console.log(e);
        }
    }]);

    return RTSP;
}();

//let demo = new RTSPVideo();

window.onload = function () {
    var href = location.href,
        ip_port_index = href.lastIndexOf('/') + 1,
        ip_port_arr = href.substring(ip_port_index).split(':');

    //取出url中的ip和port

    var _ip_port_arr = _slicedToArray(ip_port_arr, 2),
        ip = _ip_port_arr[0],
        port = _ip_port_arr[1];

    window.rtspDom = document.getElementById('rtsp');
    //加载rtsp
    var demo = new RTSP({ ip: ip, port: port, rtspDom: rtspDom });
};
