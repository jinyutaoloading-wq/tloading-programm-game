# 互动短剧游戏平台 Demo

## 入口

- 用户端：`/user/`
- 配置后台：`/admin/`
- 根入口：`/`

线上部署到 GitHub Pages 后，对应地址为：

- `https://jinyutaoloading-wq.github.io/tloading-programm-game/user/`
- `https://jinyutaoloading-wq.github.io/tloading-programm-game/admin/`

## 已覆盖范围

- 用户端：剧场首页、继续观看、播放互动、选择分支、付费解锁、剧情图、结局反馈、我的存档。
- 配置后台：项目工作台、节点画布、字段配置、素材切图、付费规则、审核发布、数据看板。
- image2 资产：用户端设计稿、后台设计稿、剧目封面切图、播放页背景切图、后台画布切图。

## 资产目录

- 设计稿：`assets/image2/designs/`
- 原始切图：`assets/image2/slices/`
- 运行切图：`assets/image2/runtime/`
- 内嵌运行资源：`shared/runtime-assets.css`

## 验收路径

1. 打开 `/user/`，直接进入用户端功能页。
2. 点击继续观看，进入播放页并完成一次选择。
3. 进入付费节点时触发解锁页，点击模拟支付成功。
4. 打开剧情图，从已解锁节点继续播放或回看结局。
5. 打开 `/admin/`，直接进入配置后台。
6. 在节点编辑里选择节点，修改标题、类型、状态和剧情说明。
7. 在素材切图、付费规则、审核发布、数据看板中完成后台关键路径验证。
