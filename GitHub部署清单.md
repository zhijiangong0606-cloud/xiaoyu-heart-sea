# GitHub Pages 部署清单

## ✅ 部署前准备

### 1. 生成图标 ⚠️ 必需
```bash
# 打开图标生成器
双击：生成图标-for-GitHub.html

# 下载两个图标
- icon-192.png
- icon-512.png

# 保存到 dist/ 目录
```

### 2. 音乐文件处理 ⚠️ 重要
```
由于版权原因，建议：
1. 不要上传 background.mp3 到公开仓库
2. 或者使用免费音乐
3. 或者将仓库设为 Private
```

### 3. 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 仓库名：`xiaoyu-heart-sea`
3. 类型：Public（公开）或 Private（私有）
4. **不要**勾选任何初始化选项
5. 创建仓库

## 📦 开始部署

### 方法1: 使用自动脚本（推荐）

```bash
# 步骤1: 配置远程仓库
git remote add origin https://github.com/YOUR_USERNAME/xiaoyu-heart-sea.git

# 步骤2: 双击运行部署脚本
部署到GitHub.bat

# 脚本会自动：
# - 添加所有必要文件
# - 创建提交
# - 推送到 GitHub
```

### 方法2: 手动命令

```bash
cd D:\AI_projects\sites\xiaoyu-heart-sea

# 配置远程仓库
git remote add origin https://github.com/YOUR_USERNAME/xiaoyu-heart-sea.git

# 添加文件
git add dist/
git add README.md
git add "*.md"

# 提交
git commit -m "🎮 小鱼的心动海域 - 可爱风格游戏

完整功能：
- 5个关卡
- GZJ小狗向导
- 技能和道具系统
- 完整iPhone支持

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

# 推送
git push -u origin main
```

## ⚙️ 配置 GitHub Pages

### 1. 进入仓库设置
```
https://github.com/YOUR_USERNAME/xiaoyu-heart-sea/settings/pages
```

### 2. 配置部署源
- **Source**: Deploy from a branch
- **Branch**: `main`
- **Folder**: `/dist` ⚠️ 重要！选择 dist 文件夹
- 点击 **Save**

### 3. 等待部署
- 初次部署需要 1-5 分钟
- 刷新页面会看到部署状态
- 成功后显示访问地址

## 📱 在手机上测试

### 访问地址
```
https://YOUR_USERNAME.github.io/xiaoyu-heart-sea/
```

### iPhone 添加到主屏幕
1. Safari 打开游戏
2. 点击底部"分享"按钮 📤
3. 向下滑动，选择"添加到主屏幕"
4. 命名："小鱼的心动海域"
5. 添加

### Android 添加到主屏幕
1. Chrome 打开游戏
2. 点击右上角"⋮"菜单
3. 选择"添加到主屏幕"
4. 确认添加

## 🔍 必测清单

部署后必须测试：

### 桌面浏览器测试
- [ ] 游戏正常加载
- [ ] 5个关卡可以选择
- [ ] 第4关有18颗星星（不是16）
- [ ] GZJ小狗显示正常
- [ ] 技能按钮工作
- [ ] 音效播放（如有）

### 手机浏览器测试
- [ ] 触摸控制流畅
- [ ] 全屏显示正常
- [ ] 所有关卡可玩
- [ ] 技能和道具正常
- [ ] 没有明显卡顿
- [ ] 可以添加到主屏幕

### PWA 测试
- [ ] 添加到主屏幕后有图标
- [ ] 图标显示正常（不是空白）
- [ ] 点击图标可以全屏启动
- [ ] 启动画面显示正常

## 🐛 常见问题

### 问题1: 404 Not Found
**原因**: GitHub Pages 配置错误  
**解决**:
1. 确认选择了 `main` 分支的 `/dist` 目录
2. 等待 3-5 分钟让部署完成
3. 确保 `dist/index.html` 存在

### 问题2: 样式混乱
**原因**: 资源路径错误  
**解决**:
1. 检查所有路径是否以 `./` 开头
2. 不要使用绝对路径 `/`
3. 清除浏览器缓存

### 问题3: 图标不显示
**原因**: 图标文件缺失  
**解决**:
1. 使用 `生成图标-for-GitHub.html` 生成图标
2. 确保 `icon-192.png` 和 `icon-512.png` 在 `dist/` 目录
3. 重新部署

### 问题4: 手机上只有16颗星
**原因**: 浏览器缓存  
**解决**:
1. iPhone Safari: 设置 → Safari → 清除历史记录和网站数据
2. Android Chrome: 设置 → 隐私和安全 → 清除浏览数据
3. 或使用无痕模式访问

### 问题5: 推送失败
**原因**: GitHub 认证问题  
**解决**:
```bash
# 使用 Personal Access Token
# 1. GitHub → Settings → Developer settings → Personal access tokens
# 2. Generate new token (classic)
# 3. 勾选 repo 权限
# 4. 复制 token
# 5. 推送时输入：
#    Username: YOUR_USERNAME
#    Password: YOUR_TOKEN
```

## 🔄 更新游戏

当你修改游戏后：

```bash
# 方法1: 使用脚本
双击：部署到GitHub.bat

# 方法2: 手动命令
git add .
git commit -m "更新: 描述你的更改"
git push
```

更新会在 1-5 分钟后生效。

## 📊 查看部署状态

访问仓库的 Actions 标签：
```
https://github.com/YOUR_USERNAME/xiaoyu-heart-sea/actions
```

可以看到：
- 部署历史
- 当前状态
- 错误日志

## 🎯 最终检查

部署成功后，确认以下都正常：

- [ ] 桌面浏览器可以访问和游玩
- [ ] 手机浏览器可以访问和游玩
- [ ] iPhone 可以添加到主屏幕
- [ ] Android 可以添加到主屏幕
- [ ] 主屏幕图标显示正常
- [ ] 第4关确实有18颗星星
- [ ] 所有技能和道具正常工作
- [ ] GZJ小狗显示并说话

## 🎉 部署成功！

你的游戏现在已经可以在全世界任何地方访问了！

分享链接给朋友：
```
https://YOUR_USERNAME.github.io/xiaoyu-heart-sea/
```

---

如有问题，参考 [GitHub-Pages部署指南.md](./GitHub-Pages部署指南.md)
