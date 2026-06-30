/**
 * 废物星人改造计划 - 后端服务（Node.js 版本）
 * 使用内置模块，无需依赖
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// 作品存储（内存版）
const works = new Map();
let workIdCounter = 1;

// 作品状态
const WorkStatus = {
  GENERATING: 'GENERATING',
  DONE: 'DONE',
  FAILED: 'FAILED'
};

// 随机角色名
const prefixes = ['瓶', '盖', '纽', '扣', '发', '绳', '纸', '盒', '废', '物', '星', '人'];
const suffixes = ['侠', '怪', '人', '星', '灵', '王', '神', '君', '者', '士'];
const personalities = ['热情似火', '冷静沉稳', '神秘莫测', '活泼可爱', '高冷傲娇', '温柔善良', '调皮捣蛋'];
const occupations = ['环保卫士', '美食猎人', '时间旅者', '梦境守护者', '星际漫游者', '废品修复师', '创意设计师'];
const catchphrases = ['废物也能发光！', '拼凑的力量！', '我是最特别的！', '废物改造，永不止步！', '每个废品都有灵魂！', '环保从我做起！'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCharacterName(parts) {
  let name = '';
  if (parts && parts.length > 0) {
    for (const part of parts) {
      if (part.name && part.name.length > 0) {
        name += part.name.charAt(0);
        if (name.length >= 2) break;
      }
    }
  }
  if (name.length < 2) {
    name = randomFrom(prefixes) + randomFrom(prefixes);
  }
  name += randomFrom(suffixes);
  return name;
}

function generateCharacterStory(characterName) {
  const personality = randomFrom(personalities);
  const occupation = randomFrom(occupations);
  const catchphrase = randomFrom(catchphrases);
  const id = Math.floor(Math.random() * 9000) + 1000;

  return `【废物星人档案 #${id}】\n\n` +
    `姓名：${characterName}\n` +
    `性格：${personality}\n` +
    `职业：${occupation}\n\n` +
    `诞生于一个平凡的午后，被主人从垃圾桶边缘拯救回来。从此立志要证明：即使是废物，也有独一无二的价值！\n\n` +
    `口头禅：${catchphrase}`;
}

function generateCharacterImage() {
  // Mock 生成一个随机颜色的占位图 URL
  const colors = ['4CAF50', '2196F3', 'FF9800', 'E91E63', '9C27B0', '00BCD4', '8BC34A'];
  const color = randomFrom(colors);
  return `https://via.placeholder.com/400x600/${color}/FFFFFF?text=Character+Image`;
}

// 创建作品
function createWork(collageImage, parts) {
  const id = workIdCounter++;
  const work = {
    id,
    collageImage: collageImage || null,
    characterImage: null,
    characterName: null,
    characterStory: null,
    status: WorkStatus.GENERATING,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  works.set(id, work);

  // 异步生成
  setTimeout(() => {
    generateWork(id, parts);
  }, 2000);

  return work;
}

// 生成作品
function generateWork(id, parts) {
  const work = works.get(id);
  if (!work) return;

  try {
    const characterName = generateCharacterName(parts);
    const characterImage = generateCharacterImage();
    const characterStory = generateCharacterStory(characterName);

    work.characterName = characterName;
    work.characterImage = characterImage;
    work.characterStory = characterStory;
    work.status = WorkStatus.DONE;
    work.updatedAt = new Date().toISOString();

    console.log(`作品 #${id} 生成完成：${characterName}`);
  } catch (err) {
    work.status = WorkStatus.FAILED;
    work.errorMessage = err.message;
    work.updatedAt = new Date().toISOString();
    console.error(`作品 #${id} 生成失败：`, err);
  }
}

// 获取作品
function getWork(id) {
  return works.get(id);
}

// 获取最近作品
function getRecentWorks(limit = 10) {
  const list = Array.from(works.values());
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list.slice(0, limit);
}

// CORS 响应头
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// JSON 响应
function sendJSON(res, statusCode, data) {
  setCORS(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

// 解析请求体
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // 限制 20MB
      if (body.length > 20 * 1024 * 1024) {
        reject(new Error('请求体过大'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// 格式化时间
function formatDate(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// MIME 类型映射
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// 静态文件服务
function serveStatic(req, res, urlPath) {
  let filePath = urlPath === '/' ? '/index.html' : urlPath;
  filePath = path.join(FRONTEND_DIR, filePath);

  // 防止路径遍历
  const normalizedPath = path.normalize(filePath);
  const resolvedFrontendDir = path.resolve(FRONTEND_DIR);
  const resolvedPath = path.resolve(normalizedPath);

  console.log('静态文件请求:', urlPath, '->', resolvedPath);

  if (!resolvedPath.startsWith(resolvedFrontendDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      console.error('静态文件读取失败:', resolvedPath, err.code);
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server Error');
      }
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// 转换为响应对象
function toResponse(work) {
  return {
    id: work.id,
    status: work.status,
    characterImage: work.characterImage,
    characterName: work.characterName,
    characterStory: work.characterStory,
    errorMessage: work.errorMessage,
    createdAt: formatDate(work.createdAt)
  };
}

// 创建服务器
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const urlPath = url.pathname;

  // 预检请求
  if (req.method === 'OPTIONS') {
    setCORS(res);
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // 健康检查
    if (urlPath === '/api/health' && req.method === 'GET') {
      sendJSON(res, 200, {
        status: 'UP',
        service: 'junkiverse-backend'
      });
      return;
    }

    // 创建生成任务
    if (urlPath === '/api/generate/character' && req.method === 'POST') {
      const body = await parseBody(req);
      const work = createWork(body.collageImage, body.parts || []);
      console.log(`创建生成任务 #${work.id}，部件数量：${body.parts?.length || 0}`);
      sendJSON(res, 200, toResponse(work));
      return;
    }

    // 查询生成结果
    const generateMatch = urlPath.match(/^\/api\/generate\/(\d+)$/);
    if (generateMatch && req.method === 'GET') {
      const id = parseInt(generateMatch[1]);
      const work = getWork(id);
      if (!work) {
        sendJSON(res, 404, { error: '作品不存在', type: 'NotFoundException' });
        return;
      }
      sendJSON(res, 200, toResponse(work));
      return;
    }

    // 获取最近作品
    if (urlPath === '/api/works' && req.method === 'GET') {
      const recent = getRecentWorks(10);
      sendJSON(res, 200, recent.map(toResponse));
      return;
    }

    // 非 /api 开头的请求，当作静态文件处理
    if (!urlPath.startsWith('/api/') && req.method === 'GET') {
      serveStatic(req, res, urlPath);
      return;
    }

    // 404
    sendJSON(res, 404, { error: 'Not Found', path: urlPath });

  } catch (err) {
    console.error('请求处理错误：', err);
    sendJSON(res, 400, { error: err.message, type: 'RuntimeException' });
  }
});

// 启动服务器
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`\n`);
  console.log(`======================================`);
  console.log(`  废物星人改造计划 - 后端服务已启动`);
  console.log(`======================================`);
  console.log(`  地址: http://localhost:${PORT}`);
  console.log(`  健康检查: http://localhost:${PORT}/api/health`);
  console.log(`======================================`);
  console.log(`\n`);
});

module.exports = server;
