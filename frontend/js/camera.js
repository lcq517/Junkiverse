/**
 * 拍照/相册功能模块
 */

const Camera = {
    video: null,
    canvas: null,
    stream: null,
    facingMode: 'environment', // 默认后置摄像头
    lastImageData: null,

    /**
     * 初始化相机
     */
    async init() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');

        try {
            await this.startCamera();
        } catch (error) {
            console.error('相机初始化失败:', error);
            Toast.show('无法访问相机，请检查权限设置');
        }
    },

    /**
     * 启动相机
     */
    async startCamera() {
        // 停止之前的流
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: this.facingMode,
                width: { ideal: 1080 },
                height: { ideal: 1920 }
            }
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            await this.video.play();
        } catch (error) {
            console.error('启动相机失败:', error);
            throw error;
        }
    },

    /**
     * 翻转相机
     */
    async flipCamera() {
        this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
        await this.startCamera();
    },

    /**
     * 拍摄照片
     */
    capturePhoto() {
        const video = this.video;
        const canvas = this.canvas;

        // 设置画布尺寸与视频一致
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 绘制当前帧
        const ctx = canvas.getContext('2d');

        // 如果是前置摄像头，需要翻转
        if (this.facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 保存图片数据
        this.lastImageData = canvas.toDataURL('image/png');

        return this.lastImageData;
    },

    /**
     * 从相册选择
     */
    selectFromGallery() {
        document.getElementById('file-input').click();
    },

    /**
     * 处理文件选择
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            Toast.show('请选择图片文件');
            return;
        }

        // 检查文件大小（限制 10MB）
        if (file.size > 10 * 1024 * 1024) {
            Toast.show('图片大小不能超过 10MB');
            return;
        }

        // 读取文件
        const reader = new FileReader();
        reader.onload = (e) => {
            this.lastImageData = e.target.result;
            // 跳转到抠图预览
            App.navigate('removebg');
        };
        reader.readAsDataURL(file);

        // 清空 input 以允许重新选择同一文件
        event.target.value = '';
    },

    /**
     * 获取最后拍摄/选择的图片
     */
    getLastImage() {
        return this.lastImageData;
    },

    /**
     * 停止相机
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }
};

// 暴露到全局
window.Camera = Camera;
