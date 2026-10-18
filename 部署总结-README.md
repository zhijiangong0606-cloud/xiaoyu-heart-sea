# 🎮 小鱼的心动海域 - GitHub Pages 部署完整指南

## 📋 快速开始（3步部署）

### 第1步：生成图标 ⚠️ 必做
```bash
1. 双击打开：生成图标-for-GitHub.html
2. 点击下载两个图标：
   - icon-192.png
   - icon-512.png
3. 将它们保存到 dist/ 目录
```

### 第2步：创建 GitHub 仓库
1. 访问 https://github.com/new
2. 仓库名：`xiaoyu-heart-sea`（或自定义）
3. 选择 **Public**（公开）
4. **不要勾选任何初始化选项**
5. 点击 "Create repository"

### 第3步：部署
```bash
# 在命令行中执行（替换 YOUR_USERNAME）
cd D:\AI_projects\sites\xiaoyu-heart-sea
git remote add origin https://github.com/YOUR_USERNAME/xiaoyu-heart-sea.git

# 然后双击运行
部署到GitHub.bat
```

## ⚙️ 配置 GitHub Pages

部署完成后：

1. 进入仓库 → **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: main, Folder: **/dist** ⚠️ 
4. 点击 **Save**
5. 等待 1-5 分钟

完成后会显示：
```
✅ Your site is live at https://YOUR_USERNAME.github.io/xiaoyu-heart-sea/
```

## 📱 在 iPhone 上运行

### 访问游戏
在 Safari 中打开：
```
https://YOUR_USERNAME.github.io/xiaoyu-heart-sea/
```

### 添加到主屏幕（推荐）
1. 点击底部的"分享"按钮 📤
2. 向下滑动
3. 点击"添加到主屏幕"
4. 命名为"小鱼的心动海域"
5. 点击"添加"

**结果**: 主屏幕上会出现粉色的小鱼图标，点击即可全屏游玩！

## ✅ 部署测试清单

### 必须测试的功能

**基础功能**:
- [ ] 游戏能正常加载
- [ ] 5个关卡都可选择
- [ ] 触摸控制流畅
- [ ] 技能和道具工作正常

**关键问题（第4关星星数）**:
- [ ] 第4关"梦幻泡泡岛"显示 **18颗星星**（不是16）
- [ ] 可以收集到18颗并通关
- [ ] 右上角显示 `18/18`

**iPhone 专项**:
- [ ] 全屏显示完整（没有被裁切）
- [ ] 没有滚动条
- [ ] 状态栏颜色正确（粉色）
- [ ] 添加到主屏幕后图标显示正常

## 🐛 常见问题和解决

### ❌ 第4关只有16颗星星

**原因**: 浏览器缓存了旧版本

**解决方案**:

**iPhone Safari**:
1. 设置 → Safari
2. "清除历史记录和网站数据"
3. 清除后重新访问

**或者使用无痕模式**:
1. Safari 打开
2. 点击右下角标签按钮
3. 选择"无痕浏览"
4. 输入网址

### ❌ 404 Not Found

**解决**:
- 确认 Pages 设置选择了 `/dist` 文件夹
- 等待 3-5 分钟
- 检查仓库中 `dist/` 目录是否存在

### ❌ 图标不显示

**解决**:
- 确保生成了 icon-192.png 和 icon-512.png
- 确保它们在 `dist/` 目录中
- 重新部署：`git add dist/*.png && git commit -m "添加图标" && git push`

### ❌ 推送到 GitHub 失败

**可能原因**:
1. 未配置 GitHub 认证
2. Token 过期
3. 没有推送权限

**解决方案**:
```bash
# 使用 Personal Access Token
# 1. GitHub → Settings → Developer settings → Personal access tokens (classic)
# 2. Generate new token
# 3. 勾选 "repo" 权限
# 4. 生成并复制 token
# 5. 推送时使用 token 作为密码
```

## 🎵 关于背景音乐

由于 `.ncm` 文件有版权保护，建议：

### 选项1: 不上传音乐（推荐）
```bash
# 在 .gitignore 中已经排除了
# 游戏会正常运行，只是没有背景音乐
```

### 选项2: 使用免费音乐
下载免费音乐：
- https://pixabay.com/music/
- https://freesound.org/
- https://incompetech.com/

转换为 MP3 后重命名为 `background.mp3`

### 选项3: 私有仓库
如果要保留原始音乐：
1. 将仓库设为 Private
2. GitHub Pages 依然可以工作
3. 但只有有权限的人能访问

## 🔄 更新游戏

修改游戏后，重新部署：

```bash
# 使用脚本（推荐）
双击：部署到GitHub.bat

# 或手动
git add .
git commit -m "更新游戏"
git push
```

更新会在 1-5 分钟后生效。清除手机浏览器缓存后刷新。

## 📊 查看部署状态

访问：
```
https://github.com/YOUR_USERNAME/xiaoyu-heart-sea/actions
```

可以看到：
- 最新部署时间
- 部署是否成功
- 错误日志（如果有）

## 🎯 最终确认

部署成功后，请确认：

1. ✅ 在电脑浏览器能正常游玩
2. ✅ 在手机浏览器能正常游玩
3. ✅ 第4关确实有 **18颗星星**
4. ✅ 能添加到 iPhone 主屏幕
5. ✅ 主屏幕图标显示正常（粉色小鱼）
6. ✅ 点击图标全屏启动游戏
7. ✅ 所有技能和道具正常工作
8. ✅ GZJ小狗显示并说话

## 🎉 完成！

你的游戏现在已经部署到云端，可以在任何设备上访问了！

**游戏地址**:
```
https://YOUR_USERNAME.github.io/xiaoyu-heart-sea/
```

可以把这个链接分享给朋友，让他们也来玩！

---

## 📞 需要帮助？

如果遇到问题，可以：

1. 查看 [GitHub部署清单.md](./GitHub部署清单.md)
2. 查看 [iPhone测试指南.md](./iPhone测试指南.md)
3. 检查 GitHub Actions 的错误日志
4. 清除浏览器缓存后重试

---

**祝你部署顺利！🌊✨**
