/**
 * API 调用模块
 */

const API = {
    // 后端 API 地址（MVP阶段使用本地）
    baseUrl: '/api',

    /**
     * 发送生成角色请求
     */
    async createGenerateTask(collageImage, parts) {
        const url = `${this.baseUrl}/generate/character`;
        console.log('发送生成请求到:', url);
        console.log('请求数据:', { collageImageLength: collageImage?.length, partsCount: parts?.length });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    collageImage: collageImage,
                    parts: parts
                })
            });

            console.log('响应状态:', response.status, response.statusText);

            if (!response.ok) {
                const text = await response.text();
                console.error('响应内容:', text);
                throw new Error(`请求失败: ${response.status} - ${text}`);
            }

            const data = await response.json();
            console.log('响应数据:', data);
            return data;
        } catch (error) {
            console.error('API 调用失败:', error);
            throw error;
        }
    },

    /**
     * 查询生成结果
     */
    async getGenerateResult(id) {
        const response = await fetch(`${this.baseUrl}/generate/${id}`);

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        return await response.json();
    },

    /**
     * 获取最近作品列表
     */
    async getRecentWorks() {
        const response = await fetch(`${this.baseUrl}/works`);

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        return await response.json();
    },

    /**
     * 健康检查
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
};

// 暴露到全局
window.API = API;
