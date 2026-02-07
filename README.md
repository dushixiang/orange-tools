# 橙子工具

一个基于 React + TypeScript + Vite 构建的多功能在线工具站，提供各种实用的工具功能。

## 特性

- 所有工具都在浏览器本地运行，保护您的隐私安全
- 响应式设计，完美适配桌面端和移动端
- 实时转换，支持实时预览和转换结果

## 编译和部署

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 编译构建

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

构建完成后，dist 目录下会生成静态文件。

### Nginx 部署

1. 将 dist 目录中的文件上传到服务器

2. 配置 Nginx，示例配置如下：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名

    root /var/www/orange-tools/dist;  # 修改为你的实际路径
    index index.html;

    # 开启 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. 重启 Nginx 服务

```bash
# 测试配置文件
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
# 或
sudo service nginx restart
```

----

## 一键部署到 EdgeOne

[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https://github.com/dushixiang/orange-tools)