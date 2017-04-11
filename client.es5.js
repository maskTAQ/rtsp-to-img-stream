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
        this.init();
    }

    _createClass(RTSP, [{
        key: 'init',
        value: function init() {
            var _this = this;

            var getType = this.getType,
                createVideoCanvas = this.createVideoCanvas,
                createLoadingComponent = this.createLoadingComponent,
                createToolbar = this.createToolbar,
                linkServer = this.linkServer,
                showLoader = this.showLoader;
            var rtspDom = this.rtspInfo.rtspDom;


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
            var _window = window,
                outerWidth = _window.outerWidth,
                outerHeight = _window.outerHeight;

            rtspDom.style.width = outerWidth + 'px';
            rtspDom.style.height = window.outerWidth * 9 / 16 + 'px';
            //生成视频canvas
            createVideoCanvas.call(this)
            //生成loading组件
            .then(function (m) {
                var rtspDom = _this.rtspDom,
                    showLoader = _this.showLoader;
                //创建loading元素

                return createLoadingComponent.call(_this);
            })
            //生成工具条
            .then(function (m) {
                return createToolbar.call(_this);
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
        key: 'createToolbar',
        value: function createToolbar() {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                var rtspDom = _this4.rtspInfo.rtspDom;
                //创建toolbar容器
                var toolBarWrapperDom = document.createElement("span");
                toolBarWrapperDom.className = 'tool-bar';
                //创建全屏按钮
                var fullScreenButton = document.createElement("button");
                fullScreenButton.className = 'full-screen-button';
                //这里的闭包是存储 容器的宽高信息
                var toggleFullScreen = _this4.toggleFullScreen().bind(_this4);
                fullScreenButton.addEventListener('click', function () {
                    toggleFullScreen();
                });
                toolBarWrapperDom.appendChild(fullScreenButton);
                //创建全屏按钮图标
                var fullScreenButtonIcon = document.createElement("i");
                fullScreenButtonIcon.className = 'full-screen-button-icon';
                fullScreenButton.appendChild(fullScreenButtonIcon);

                //将toolbar添加到rtsp容器中
                rtspDom.appendChild(toolBarWrapperDom);

                //点击显示工具条
                _this4.tapToolBarShow(rtspDom, toolBarWrapperDom);

                resolve('toolbar构造成功');
            });
        }
    }, {
        key: 'tapToolBarShow',
        value: function tapToolBarShow(rtspDom, toolBarWrapperDom) {
            //这里的闭包是存储定时器的id
            rtspDom.addEventListener('click', function () {
                var toolbarShowTimeoutId = NaN;
                return function () {
                    var isToolbarShow = Boolean(Number(toolBarWrapperDom.style.opacity));
                    if (isToolbarShow) {
                        toolBarWrapperDom.style.opacity = '0';
                        clearTimeout(toolbarShowTimeoutId);
                    } else {
                        toolBarWrapperDom.style.opacity = '1';
                        toolbarShowTimeoutId = setTimeout(function () {
                            toolBarWrapperDom.style.opacity = '0';
                        }, 3000);
                    }
                };
            }());
        }
    }, {
        key: 'getType',
        value: function getType(o) {
            return {}.toString.call(o);
        }
    }, {
        key: 'linkServer',
        value: function linkServer() {
            var _this5 = this;

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
                if (!_this5.live) {
                    hideLoader.call(_this5);
                }
                liveImg.call(_this5, data);
            });

            //在谷歌在超时的回调函数并不会起作用
            setTimeout(function () {
                if (!_this5.live) {
                    hideLoader.call(_this5);
                    showError('连接超时');
                }
            }, 15000);
        }
    }, {
        key: 'liveImg',
        value: function liveImg(data) {
            var videoDomCtx = this.videoDomCtx;

            var bytes = new Uint8Array(data);

            var blob = new Blob([bytes], {
                type: 'application/octet-binary'
            });

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

var _initialiseProps = function _initialiseProps() {
    var _this6 = this;

    this.toggleFullScreen = function () {
        var _window2 = window,
            outerWidth = _window2.outerWidth,
            outerHeight = _window2.outerHeight;


        var rtspDom = _this6.rtspInfo.rtspDom;
        var videoDom = _this6.videoDom;

        var _rtspDom$style = rtspDom.style,
            width = _rtspDom$style.width,
            height = _rtspDom$style.height;

        //视频容器xy轴偏移长度

        var excursion = Math.abs((outerWidth - outerHeight) / 2);
        return function () {
            if (_this6.fullScreenStatus) {
                rtspDom.classList.remove('full-screen');
                _this6.addStyle(rtspDom, {
                    width: width,
                    height: height,
                    marginTop: 0,
                    marginLeft: 0
                });
            } else {
                rtspDom.classList.add('full-screen');
                _this6.addStyle(rtspDom, {
                    width: outerHeight + 'px',
                    height: outerWidth + 'px',
                    marginTop: excursion + 'px',
                    marginLeft: -excursion + 'px'
                });
            }
            _this6.fullScreenStatus = !_this6.fullScreenStatus;
        };
    };
};

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
    var demo = new RTSP({
        ip: ip,
        port: port,
        rtspDom: rtspDom
    });
};
