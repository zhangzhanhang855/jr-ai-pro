const express = require('express');
const axios = require('axios');
const cors = require('cors'); // 解决 iPad 前端访问后端的跨域问题

const app = express();
app.use(express.json());
app.use(cors()); // 允许你的前端网页跨域调用这个接口

// 定义一个给 iPad 调用的接口
app.post('/api/get-cookie', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '请输入用户名和密码' });
    }

    try {
        // 1. 模拟向小网站的登录接口发送 POST 请求
        // 💡 注意：你需要用浏览器的开发者工具（F12）看一下小网站真实的登录网址和参数名
        const loginUrl = 'https://example-small-site.com/api/login'; 
        
        const response = await axios.post(loginUrl, {
            user: username,       // 根据小网站实际的参数名修改
            pwd: password         // 根据小网站实际的参数名修改
        }, {
            timeout: 5000,
            validateStatus: () => true // 允许读取非 200 的状态码
        });

        // 2. 从响应头（Headers）中提取 Set-Cookie
        const rawCookies = response.headers['set-cookie'];

        if (!rawCookies || rawCookies.length === 0) {
            return res.status(400).json({ error: '登录可能失败，未能在响应中捕获到 Cookie' });
        }

        // 3. 将原始的 Cookie 数组解析为你想要的 JSON 格式
        const parsedCookies = rawCookies.map(cookieStr => {
            // cookieStr 格式通常为: "session_id=abc123xyz; Path=/; HttpOnly"
            const parts = cookieStr.split(';')[0].split('=');
            return {
                name: parts[0].trim(),
                value: parts.slice(1).join('=').trim()
            };
        });

        // 4. 把解析好的 JSON 结果吐给 iPad 前端
        return res.json({
            success: true,
            domain: 'example-small-site.com',
            cookies: parsedCookies
        });

    } catch (error) {
        console.error('服务器提取失败:', error.message);
        return res.status(500).json({ error: '服务器内部错误: ' + error.message });
    }
});

// 启动后端服务，监听 3000 端口
app.listen(3000, () => {
    console.log('Cookie 提取服务已在 http://localhost:3000 启动');
});
