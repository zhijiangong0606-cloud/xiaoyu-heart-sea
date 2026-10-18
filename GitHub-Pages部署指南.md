# 部署到 GitHub Pages

## 快速部署步骤

### 1. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名：`xiaoyu-heart-sea`（或任意名称）
3. 设为 Public（公开）
4. **不要**勾选 "Initialize with README"
5. 点击 "Create repository"

### 2. 本地配置并推送

打开命令行，执行以下命令：

```bash
cd D:\AI_projects\sites\xiaoyu-heart-sea

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/xiaoyu-heart-sea.git

# 添加所有游戏文件
git add dist/
git add README.md
git add engine.test.mjs
git add "*.md"

# 提交
git commit -m "🎮 小鱼的心动海域 - 可爱风格游戏

- 可爱粉色系风格
- GZJ小狗向导
- 5级等级系统和技能
- 5种道具系统
- 5个关卡
- 完整iPhone支持

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

# 推送到 GitHub
git push -u origin main
```

### 3. 配置 GitHub Pages

1. 进入你的仓库页面
2. 点击 **Settings**（设置）
3. 左侧菜单找到 **Pages**
4. **Source** 选择：`Deploy from a branch`
5. **Branch** 选择：`main` 和 `/dist`
6. 点击 **Save**（保存）

### 4. 等待部署完成

- 部署需要 1-5 分钟
- 回到 Pages 设置页面会显示：
  ```
  Your site is live at https://YOUR_USERNAME.github.io/xiaoyu-heart-sea/
  ```

### 5. 在手机上访问

#### 方法1: 直接访问
在手机浏览器输入：
```
https://YOUR_USERNAME.github.io/xiaoyu-heart-sea/
```

#### 方法2: 添加到主屏幕（推荐）

**iPhone Safari:**
1. 访问游戏网址
2. 点击底部"分享"按钮
3. 向下滚动，点击"添加到主屏幕"
4. 命名为"小鱼的心动海域"
5. 点击"添加"

**Android Chrome:**
1. 访问游戏网址
2. 点击右上角"⋮"菜单
3. 选择"添加到主屏幕"
4. 确认添加

添加后，游戏图标会出现在手机主屏幕上，点击即可全屏游玩！

## 自定义域名（可选）

如果你有自己的域名：

1. 在仓库根目录创建 `CNAME` 文件
2. 内容填写你的域名，如：`game.yourdomain.com`
3. 在域名DNS设置中添加：
   ```
   类型: CNAME
   名称: game (或 @)
   值: YOUR_USERNAME.github.io
   ```

## 更新游戏

当你修改游戏后，推送更新：

```bash
git add .
git commit -m "更新游戏内容"
git push
```

GitHub Pages 会自动重新部署（约1-5分钟）。

## 重要提示

### 关于背景音乐

由于版权原因，**不要**将《这条小鱼在乎》的音频文件上传到公开的 GitHub 仓库。

建议：
1. 本地测试时使用原始音乐
2. GitHub 部署时使用免费音乐
3. 或者将仓库设为 Private（私有）

免费音乐资源：
- https://pixabay.com/music/
- https://freesound.org/
- https://incompetech.com/

### 测试清单

部署后在手机上测试：
- ✅ 触摸操作流畅
- ✅ 所有5个关卡可玩
- ✅ 第4关有18颗星星
- ✅ 技能和道具正常
- ✅ 全屏显示完整
- ✅ GZJ小狗显示正常

## 故障排除

### 问题：404 Not Found
- 确认 GitHub Pages 设置为 `main` 分支的 `/dist` 目录
- 等待5分钟让部署完成

### 问题：样式错误
- 检查 `index.html` 中的资源路径
- 确保所有 `.mjs` 文件都在 `dist/` 目录

### 问题：手机上有缓存
- 清除浏览器缓存
- 或使用无痕模式访问

---

完成后，你就可以在任何设备上访问游戏了！🎮✨
