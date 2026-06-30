/**
 * AI 抠图功能模块
 * 使用 @imgly/background-removal
 */

const BackgroundRemover = {
    removedImageData: null,
    isProcessing: false,

    /**
     * 执行抠图
     * @param {string} imageData - 图片数据（Base64 或 URL）
     * @returns {Promise<string>} - 抠图后的图片数据（Base64 PNG）
     */
    async remove(imageData) {
        if (this.isProcessing) {
            throw new Error('正在处理中，请稍候');
        }

        this.isProcessing = true;
        this.showLoading(true);

        try {
            console.log('开始抠图处理...');

            // 使用 imgly 抠图库
            const result = await removeBackground(imageData, {
                progress: (key, current, total) => {
                    console.log(`抠图进度: ${key} - ${current}/${total}`);
                    this.updateProgress(current / total);
                },
                output: {
                    format: 'image/png',
                    quality: 0.9
                }
            });

            // result 是 Blob，转换为 Base64
            const base64 = await this.blobToBase64(result);
            this.removedImageData = base64;

            console.log('抠图完成');
            return base64;

        } catch (error) {
            console.error('抠图失败:', error);
            throw error;
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
        }
    },

    /**
     * Blob 转 Base64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    /**
     * 显示/隐藏加载中
     */
    showLoading(show) {
        const spinner = document.getElementById('removing-spinner');
        const image = document.getElementById('removed-image');
        const confirmBtn = document.getElementById('btn-confirm-remove');

        if (show) {
            spinner.style.display = 'flex';
            image.style.display = 'none';
            confirmBtn.disabled = true;
        } else {
            spinner.style.display = 'none';
        }
    },

    /**
     * 更新进度（模拟）
     */
    updateProgress(progress) {
        // imgly 库会自己更新进度，这里可以显示
        const tip = document.querySelector('#removing-spinner p');
        if (tip) {
            const percent = Math.round(progress * 100);
            tip.textContent = `正在 AI 抠图... ${percent}%`;
        }
    },

    /**
     * 显示抠图结果
     */
    showResult(imageData) {
        const image = document.getElementById('removed-image');
        const confirmBtn = document.getElementById('btn-confirm-remove');

        image.src = imageData;
        image.style.display = 'block';
        confirmBtn.disabled = false;
    },

    /**
     * 获取抠图结果
     */
    getResult() {
        return this.removedImageData;
    }
};

// 暴露到全局
window.BackgroundRemover = BackgroundRemover;
