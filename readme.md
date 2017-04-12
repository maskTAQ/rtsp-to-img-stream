# 需求
    现要将apicloud构建的App用react-native进行重构,但是因为app内需要加载rtsp的视频流,
    所以先要解决如何在react-native中加载rtsp的视频流。

## 大概思路
1. 利用react-native WebView组件加载网页,在网页中显示rtsp的视频流。
2. 因为h5现不支持rtsp的流,所以要将rtsp流转码。
3. 设想过将rtsp的流转成rtmp的流,之后用video.js加载视频,在pc端可以。但是在移动端失败[测试过小米,华为]。
4. 将rtsp流利用ffempeg转成图片流在利用socket进行传输,前端加载图片。
5. 尝试过动态改变过img的src属性来实现,但是体验太差,后转为canvas进行渲染,体验良好。

````javascript
![缺陷]因为转成图片之后暂不支持音频;对转码硬件的需求和带宽的要求。
````

    感谢开源,让生活更美好。$ npm install https://github.com/agsh/rtsp-ffmpeg.git
## 实现
    基于rtsp-ffmpeg的二次封装。
## 使用说明
    npm install && npm start

    激活后台硬件转码
    发送post请求至http://localhost:3000/rtsp/ip:port[暂时不对参数做要求默认提供一个rtsp源]

    输入网址浏览
    http://localhost:3000/rtsp/ip:port

    let demo = new RTSP(
      //必须参数
      {
        username: '',
        password: '',
        ip: '',
        port: '',
        //缺省值为1
        channel: 1,
        //视频加载的dom对象
        rtspDom,
        //loading样式 缺省值为'ball-scale-multiple'
        loadingClassName: 'ball-scale-multiple'
    },
    //可选参数
    {
        //缩略图路径 缺省值为'/src/img/logo.png'
        thumbnailPath: '/src/img/logo.png'
    });
