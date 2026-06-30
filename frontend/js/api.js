/**
 * API 调用模块
 */

const API = {
    // 后端 API 地址（MVP阶段使用本地）
    baseUrl: 'http://localhost:8080/api',

    /**
     * 发送生成角色请求
     */
    async createGenerateTask(collageImage, parts) {
        const response = await fetch(`${this.baseUrl}/generate/character`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                collageImage: collageImage,
                parts: parts
            })
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        return await response.json();
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
