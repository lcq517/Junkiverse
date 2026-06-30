/**
 * Canvas 拼贴编辑器模块
 */

const CanvasEditor = {
    canvas: null,
    ctx: null,
    parts: [], // 部件列表
    selectedPart: null, // 当前选中部件
    isDragging: false,
    isRotating: false,
    isScaling: false,
    dragOffset: { x: 0, y: 0 },
    lastTouchDistance: 0,

    /**
     * 初始化编辑器
     */
    init() {
        this.canvas = document.getElementById('editor-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 设置画布尺寸
        this.resize();

        // 绑定事件
        this.bindEvents();

        // 初始绘制
        this.render();
    },

    /**
     * 调整画布尺寸
     */
    resize() {
        const wrapper = document.querySelector('.canvas-wrapper');
        const maxWidth = wrapper.clientWidth - 32;
        const maxHeight = Math.min(window.innerHeight * 0.5, 400);

        // 设置画布尺寸
        this.canvas.width = Math.min(360, maxWidth);
        this.canvas.height = Math.min(480, maxHeight);

        this.render();
    },

    /**
     * 添加部件
     */
    addPart(imageData, name = '部件') {
        const part = {
            id: Date.now(),
            name: name,
            image: new Image(),
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: 80,
            height: 80,
            rotation: 0,
            scale: 1,
            zIndex: this.parts.length,
            selected: false
        };

        // 加载图片
        part.image.onload = () => {
            // 根据图片尺寸调整部件大小
            const ratio = part.image.width / part.image.height;
            if (ratio > 1) {
                part.width = 80;
                part.height = 80 / ratio;
            } else {
                part.height = 80;
                part.width = 80 * ratio;
            }
            this.render();
        };
        part.image.src = imageData;

        this.parts.push(part);
        this.render();
        this.updatePartsTray();

        // 选中新部件
        this.selectPart(part);
    },

    /**
     * 更新部件托盘
     */
    updatePartsTray() {
        const list = document.getElementById('parts-list');
        list.innerHTML = '';

        this.parts.forEach(part => {
            const thumb = document.createElement('div');
            thumb.className = 'part-thumb' + (part.selected ? ' selected' : '');
            thumb.dataset.id = part.id;

            const img = document.createElement('img');
            img.src = part.image.src;
            thumb.appendChild(img);

            thumb.onclick = () => this.selectPart(part);

            list.appendChild(thumb);
        });
    },

    /**
     * 选择部件
     */
    selectPart(part) {
        // 取消之前的选中
        this.parts.forEach(p => p.selected = false);

        // 选中新的
        if (part) {
            part.selected = true;
        }

        this.selectedPart = part;
        this.updatePartsTray();
        this.render();
    },

    /**
     * 删除选中部件
     */
    deleteSelected() {
        if (!this.selectedPart) {
            Toast.show('请先选择要删除的部件');
            return;
        }

        this.parts = this.parts.filter(p => p.id !== this.selectedPart.id);
        this.selectedPart = null;
        this.updatePartsTray();
        this.render();
    },

    /**
     * 上移图层
     */
    bringForward() {
        if (!this.selectedPart) return;

        const maxZ = Math.max(...this.parts.map(p => p.zIndex));
        if (this.selectedPart.zIndex < maxZ) {
            this.selectedPart.zIndex++;
            this.render();
        }
    },

    /**
     * 下移图层
     */
    sendBackward() {
        if (!this.selectedPart) return;

        if (this.selectedPart.zIndex > 0) {
            this.selectedPart.zIndex--;
            this.render();
        }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onPointerMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onPointerUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onPointerUp.bind(this));

        // 触摸事件
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));

        // 窗口大小变化
        window.addEventListener('resize', () => this.resize());
    },

    /**
     * 获取点击位置的部件
     */
    getPartAtPoint(x, y) {
        // 从顶层开始遍历
        const sorted = [...this.parts].sort((a, b) => b.zIndex - a.zIndex);

        for (const part of sorted) {
            if (this.isPointInPart(x, y, part)) {
                return part;
            }
        }
        return null;
    },

    /**
     * 判断点是否在部件内
     */
    isPointInPart(x, y, part) {
        // 简化的碰撞检测（矩形）
        const hw = (part.width * part.scale) / 2;
        const hh = (part.height * part.scale) / 2;

        return x >= part.x - hw &&
               x <= part.x + hw &&
               y >= part.y - hh &&
               y <= part.y + hh;
    },

    /**
     * 获取相对于画布的坐标
     */
    getCanvasPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    },

    // ============ 鼠标事件 ============

    onPointerDown(e) {
        const point = this.getCanvasPoint(e);
        const part = this.getPartAtPoint(point.x, point.y);

        if (part) {
            this.selectPart(part);
            this.isDragging = true;
            this.dragOffset = {
                x: point.x - part.x,
                y: point.y - part.y
            };

            // 将选中部件置顶
            const maxZ = Math.max(...this.parts.map(p => p.zIndex));
            part.zIndex = maxZ + 1;
        } else {
            this.selectPart(null);
        }
    },

    onPointerMove(e) {
        if (!this.isDragging || !this.selectedPart) return;

        const point = this.getCanvasPoint(e);
        this.selectedPart.x = point.x - this.dragOffset.x;
        this.selectedPart.y = point.y - this.dragOffset.y;

        // 限制在画布内
        const hw = (this.selectedPart.width * this.selectedPart.scale) / 2;
        const hh = (this.selectedPart.height * this.selectedPart.scale) / 2;
        this.selectedPart.x = Math.max(hw, Math.min(this.canvas.width - hw, this.selectedPart.x));
        this.selectedPart.y = Math.max(hh, Math.min(this.canvas.height - hh, this.selectedPart.y));

        this.render();
    },

    onPointerUp() {
        this.isDragging = false;
    },

    // ============ 触摸事件 ============

    onTouchStart(e) {
        e.preventDefault();

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const point = this.getCanvasPoint(touch);
            const part = this.getPartAtPoint(point.x, point.y);

            if (part) {
                this.selectPart(part);
                this.isDragging = true;
                this.dragOffset = {
                    x: point.x - part.x,
                    y: point.y - part.y
                };

                const maxZ = Math.max(...this.parts.map(p => p.zIndex));
                part.zIndex = maxZ + 1;
            }
        } else if (e.touches.length === 2 && this.selectedPart) {
            // 双指缩放
            this.lastTouchDistance = this.getTouchDistance(e.touches);
        }
    },

    onTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && this.isDragging && this.selectedPart) {
            const touch = e.touches[0];
            const point = this.getCanvasPoint(touch);
            this.selectedPart.x = point.x - this.dragOffset.x;
            this.selectedPart.y = point.y - this.dragOffset.y;

            const hw = (this.selectedPart.width * this.selectedPart.scale) / 2;
            const hh = (this.selectedPart.height * this.selectedPart.scale) / 2;
            this.selectedPart.x = Math.max(hw, Math.min(this.canvas.width - hw, this.selectedPart.x));
            this.selectedPart.y = Math.max(hh, Math.min(this.canvas.height - hh, this.selectedPart.y));

            this.render();
        } else if (e.touches.length === 2 && this.selectedPart) {
            // 双指缩放
            const distance = this.getTouchDistance(e.touches);
            const delta = distance / this.lastTouchDistance;
            this.selectedPart.scale = Math.max(0.3, Math.min(3, this.selectedPart.scale * delta));
            this.lastTouchDistance = distance;
            this.render();
        }
    },

    onTouchEnd() {
        this.isDragging = false;
    },

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // ============ 渲染 ============

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 按 zIndex 排序并绘制部件
        const sorted = [...this.parts].sort((a, b) => a.zIndex - b.zIndex);

        sorted.forEach(part => {
            ctx.save();

            // 移动到部件中心
            ctx.translate(part.x, part.y);
            ctx.rotate(part.rotation * Math.PI / 180);
            ctx.scale(part.scale, part.scale);

            // 绘制图片
            const w = part.width;
            const h = part.height;

            ctx.drawImage(part.image, -w / 2, -h / 2, w, h);

            // 绘制选中框
            if (part.selected) {
                ctx.strokeStyle = '#0071e3';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
                ctx.setLineDash([]);
            }

            ctx.restore();
        });
    },

    /**
     * 导出拼贴图为 Base64
     */
    exportToImage() {
        // 创建一个临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // 填充白色背景
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // 按 zIndex 排序并绘制
        const sorted = [...this.parts].sort((a, b) => a.zIndex - b.zIndex);

        sorted.forEach(part => {
            tempCtx.save();
            tempCtx.translate(part.x, part.y);
            tempCtx.rotate(part.rotation * Math.PI / 180);
            tempCtx.scale(part.scale, part.scale);

            const w = part.width;
            const h = part.height;
            tempCtx.drawImage(part.image, -w / 2, -h / 2, w, h);

            tempCtx.restore();
        });

        return tempCanvas.toDataURL('image/png');
    },

    /**
     * 获取部件数据（用于发送给后端）
     */
    getPartsData() {
        return this.parts.map(part => ({
            name: part.name,
            x: part.x / this.canvas.width,
            y: part.y / this.canvas.height,
            rotation: part.rotation,
            scale: part.scale,
            zIndex: part.zIndex
        }));
    },

    /**
     * 清空编辑器
     */
    clear() {
        this.parts = [];
        this.selectedPart = null;
        this.render();
        this.updatePartsTray();
    }
};

// 暴露到全局
window.CanvasEditor = CanvasEditor;
