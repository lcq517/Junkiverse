/**
 * 主应用模块
 */

const App = {
    currentPage: 'home',
    workId: null,
    pollingInterval: null,

    /**
     * 初始化应用
     */
    init() {
        console.log('废物星人改造计划初始化...');

        // 注册工具函数
        window.Toast = Toast;
    },

    /**
     * 页面导航
     */
    navigate(page) {
        // 停止相机（如果正在运行）
        if (this.currentPage === 'camera') {
            Camera.stopCamera();
        }

        // 停止轮询
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // 显示目标页面
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;

            // 页面初始化
            this.onPageShow(page);
        }
    },

    /**
     * 页面显示时的处理
     */
    onPageShow(page) {
        switch (page) {
            case 'camera':
                Camera.init();
                break;
            case 'removebg':
                this.showRemoveBgPreview();
                break;
            case 'editor':
                CanvasEditor.init();
                break;
            case 'generating':
                this.startGenerating();
                break;
        }
    },

    // ============ 拍照相关 ============

    /**
     * 从相册选择
     */
    selectFromGallery() {
        Camera.selectFromGallery();
    },

    /**
     * 翻转相机
     */
    flipCamera() {
        Camera.flipCamera();
    },

    /**
     * 拍摄照片
     */
    capturePhoto() {
        const imageData = Camera.capturePhoto();
        if (imageData) {
            this.navigate('removebg');
        }
    },

    // ============ 抠图相关 ============

    /**
     * 显示抠图预览
     */
    async showRemoveBgPreview() {
        const imageData = Camera.getLastImage();
        if (!imageData) {
            Toast.show('请先拍摄或选择图片');
            this.navigate('camera');
            return;
        }

        try {
            // 显示原图
            document.getElementById('removed-image').src = imageData;
            document.getElementById('removed-image').style.display = 'block';
            document.getElementById('removing-spinner').style.display = 'none';

            // 执行抠图
            const removedImageData = await BackgroundRemover.remove(imageData);

            // 显示抠图结果
            BackgroundRemover.showResult(removedImageData);

            Toast.show('抠图完成！');

        } catch (error) {
            console.error('抠图失败:', error);
            Toast.show('抠图失败，请重试');
            document.getElementById('removing-spinner').style.display = 'none';
        }
    },

    /**
     * 确认抠图，进入编辑页
     */
    confirmRemove() {
        const removedImage = BackgroundRemover.getResult();
        if (!removedImage) {
            Toast.show('请先完成抠图');
            return;
        }

        // 清空编辑器，添加抠图结果作为第一个部件
        CanvasEditor.clear();
        CanvasEditor.addPart(removedImage, '主体');

        this.navigate('editor');
    },

    // ============ 编辑器相关 ============

    /**
     * 添加部件（返回拍照页）
     */
    addPart() {
        this.navigate('camera');
    },

    /**
     * 删除选中部件
     */
    deleteSelected() {
        CanvasEditor.deleteSelected();
    },

    /**
     * 上移图层
     */
    bringForward() {
        CanvasEditor.bringForward();
    },

    /**
     * 下移图层
     */
    sendBackward() {
        CanvasEditor.sendBackward();
    },

    // ============ 生成相关 ============

    /**
     * 生成角色
     */
    async generateCharacter() {
        if (CanvasEditor.parts.length === 0) {
            Toast.show('请先添加至少一个部件');
            return;
        }

        // 禁用按钮
        const btn = document.getElementById('btn-generate');
        btn.disabled = true;
        btn.textContent = '生成中...';

        try {
            // 导出拼贴图
            const collageImage = CanvasEditor.exportToImage();
            const parts = CanvasEditor.getPartsData();

            console.log('发送生成请求...');

            // 调用后端 API
            const response = await API.createGenerateTask(collageImage, parts);

            console.log('生成任务创建成功:', response);

            this.workId = response.id;
            this.navigate('generating');

        } catch (error) {
            console.error('生成请求失败:', error);
            Toast.show('生成失败: ' + error.message);

            // 恢复按钮
            btn.disabled = false;
            btn.textContent = '生成角色 ✨';
        }
    },

    /**
     * 开始轮询生成结果
     */
    startGenerating() {
        if (!this.workId) {
            Toast.show('生成任务ID不存在');
            this.navigate('home');
            return;
        }

        let progress = 0;
        const tips = [
            '正在召唤创意能量...',
            '废品星人正在觉醒...',
            '正在组装角色属性...',
            '生成档案故事中...',
            '即将完成！'
        ];

        const progressFill = document.getElementById('progress-fill');
        const tipEl = document.getElementById('generating-tip');

        // 模拟进度条动画
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 15;
                progressFill.style.width = Math.min(progress, 90) + '%';

                const tipIndex = Math.min(Math.floor(progress / 20), tips.length - 1);
                tipEl.textContent = tips[tipIndex];
            }
        }, 500);

        // 轮询结果
        this.pollingInterval = setInterval(async () => {
            try {
                const result = await API.getGenerateResult(this.workId);
                console.log('轮询结果:', result);

                if (result.status === 'DONE') {
                    // 生成完成
                    clearInterval(progressInterval);
                    clearInterval(this.pollingInterval);

                    progressFill.style.width = '100%';
                    tipEl.textContent = '生成完成！';

                    setTimeout(() => {
                        this.showResult(result);
                    }, 500);

                } else if (result.status === 'FAILED') {
                    // 生成失败
                    clearInterval(progressInterval);
                    clearInterval(this.pollingInterval);

                    Toast.show('生成失败: ' + result.errorMessage);
                    this.navigate('editor');

                    // 恢复按钮
                    document.getElementById('btn-generate').disabled = false;
                    document.getElementById('btn-generate').textContent = '生成角色 ✨';
                }

            } catch (error) {
                console.error('轮询失败:', error);
            }
        }, 2000);
    },

    /**
     * 显示生成结果
     */
    showResult(result) {
        document.getElementById('result-image').src = result.characterImage;
        document.getElementById('result-name').textContent = result.characterName;
        document.getElementById('result-story').textContent = result.characterStory;

        this.navigate('result');
    },

    // ============ 结果页相关 ============

    /**
     * 保存图片
     */
    saveImage() {
        const image = document.getElementById('result-image');

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `废物星人-${Date.now()}.png`;
        link.href = image.src;
        link.click();

        Toast.show('图片已保存');
    },

    /**
     * 复制链接
     */
    shareToClipboard() {
        const text = `${document.getElementById('result-name').textContent}\n${document.getElementById('result-story').textContent}`;

        navigator.clipboard.writeText(text).then(() => {
            Toast.show('已复制到剪贴板');
        }).catch(() => {
            Toast.show('复制失败');
        });
    },

    /**
     * 再来一个
     */
    createAnother() {
        // 清空状态
        this.workId = null;
        CanvasEditor.clear();

        // 返回拍照页
        this.navigate('camera');
    }
};

/**
 * Toast 提示
 */
const Toast = {
    show(message, duration = 2000) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
};

// 暴露到全局
window.App = App;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
