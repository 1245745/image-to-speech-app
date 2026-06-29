$env:Path = "$PWD\node_modules\.bin;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "=== 图片转语音应用部署脚本 ===" -ForegroundColor Cyan

Write-Host "`n1. 构建项目..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
npm run build:h5

if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}

Write-Host "构建成功！" -ForegroundColor Green

Write-Host "`n2. 复制 PWA 文件..." -ForegroundColor Yellow
Copy-Item -Path "public\manifest.json" -Destination "dist\manifest.json" -ErrorAction SilentlyContinue
Copy-Item -Path "src\service-worker.js" -Destination "dist\service-worker.js" -ErrorAction SilentlyContinue
Write-Host "复制完成！" -ForegroundColor Green

Write-Host "`n3. 启动本地服务器..." -ForegroundColor Yellow
Write-Host "本地访问: http://localhost:8080/" -ForegroundColor White
Write-Host "手机访问: http://192.169.0.76:8080/ (确保手机和电脑在同一WiFi)" -ForegroundColor White

$serverProcess = Start-Process -FilePath "node" -ArgumentList "-e", "const http = require('http'); const fs = require('fs'); const path = require('path'); const server = http.createServer((req, res) => { let filePath = '.' + req.url; if (filePath === './') filePath = './index.html'; const extname = path.extname(filePath); const contentType = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.woff': 'application/font-woff', '.ttf': 'application/font-ttf', '.eot': 'application/vnd.ms-fontobject', '.otf': 'application/font-otf', '.wasm': 'application/wasm' }[extname] || 'application/octet-stream'; fs.readFile(filePath, (error, content) => { if (error) { if(error.code === 'ENOENT') { res.writeHead(200, { 'Content-Type': 'text/html' }); fs.readFile('./index.html', (err, indexContent) => { res.end(indexContent, 'utf-8'); }); } else { res.writeHead(500); res.end('Server Error: ' + error.code); } } else { res.writeHead(200, { 'Content-Type': contentType }); res.end(content, 'utf-8'); } }); }); server.listen(8080, '0.0.0.0', () => { console.log('Server running at http://localhost:8080/'); });" -WorkingDirectory "dist" -PassThru

Write-Host "`n服务器已启动！按 Ctrl+C 停止..." -ForegroundColor Green

Wait-Process -Id $serverProcess.Id