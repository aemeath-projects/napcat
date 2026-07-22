# Changelog

所有版本变更记录

## [1.3.0](https://github.com/aemeath-projects/napcat/compare/v1.2.7...v1.3.0) (2026-07-22)

### 重构

* 将 barrel 导入改为精确路径导入，避免循环依赖 ([2a9f857](https://github.com/aemeath-projects/napcat/commit/2a9f85764a4b92b89cf67348ded48c017bf323ec))
* 统一使用 barrel 导出简化模块导入路径 ([8944ee8](https://github.com/aemeath-projects/napcat/commit/8944ee8b662cffdd2d1d0d5f415fa71f8e253b97))
* **utils,builder:** 抽取共享 MessageBuilder，seg/cq 支持链式构建与 CQ 码互转 ([7b631f7](https://github.com/aemeath-projects/napcat/commit/7b631f71c9f4d09379db60918110f1769f3ae992))

### 文档

* 更新 README 中 NapCat 版本号为 4.18.13 ([3bc82fb](https://github.com/aemeath-projects/napcat/commit/3bc82fb8a18f4d6053b900afd5f29438719fc5b1))
## [1.2.7](https://github.com/aemeath-projects/napcat/compare/v1.2.6...v1.2.7) (2026-07-16)


### 重构

* **api,transport:** 方法归类对齐上游业务域分类，连接编排与令牌提取去重 ([09c4fa6](https://github.com/aemeath-projects/napcat/commit/09c4fa62d642e9cc83a2973e9ac167d1ba9271f5))

## [1.2.6](https://github.com/aemeath-projects/napcat/compare/v1.2.5...v1.2.6) (2026-07-11)


### 重构

* **transport:** 重连决策收敛为唯一权威，新增 reconnecting 状态与僵尸连接检测 ([56b874a](https://github.com/aemeath-projects/napcat/commit/56b874a0c9e50cfd1697955b81b64a500e6bb8ba))

## [1.2.5](https://github.com/aemeath-projects/napcat/compare/v1.2.4...v1.2.5) (2026-07-11)


### Bug 修复

* **transport:** 重连成功需维持稳定期后才清零退避计数器 ([65fed84](https://github.com/aemeath-projects/napcat/commit/65fed843d9ad0a5f5d3ab3be2256e4a63f2826f5))

## [1.2.4](https://github.com/aemeath-projects/napcat/compare/v1.2.3...v1.2.4) (2026-07-08)


### 新功能

* 新增 giveUp 重连耗尽事件并修复重连计数器提前重置 ([9f612bd](https://github.com/aemeath-projects/napcat/commit/9f612bde1b51a788c51d5fd741f4c3b6ae1a8412))

## [1.2.3](https://github.com/aemeath-projects/napcat/compare/v1.2.2...v1.2.3) (2026-07-08)


### 重构

* 移除prepublishOnly脚本并优化模块导入为精确路径 ([eb7823a](https://github.com/aemeath-projects/napcat/commit/eb7823abd20fdc6d27e1e5d55d616a92e5bd54a7))

## [1.2.2](https://github.com/aemeath-projects/napcat/compare/v1.2.1...v1.2.2) (2026-07-08)


### 新功能

* 适配 NapCat 4.18.9 并更新版本标记 ([c448905](https://github.com/aemeath-projects/napcat/commit/c4489054164a469cb7a87883e6328cbee1a6dbaf))

## [1.2.1](https://github.com/aemeath-projects/napcat/compare/v1.2.0...v1.2.1) (2026-06-25)


### 文档

* 更新codecov badge ([5bf7cf9](https://github.com/aemeath-projects/napcat/commit/5bf7cf9cd4a2d05f2a03e3f76c3c8dc2033ee4d4))

## [1.2.0](https://github.com/aemeath-projects/napcat/compare/v1.1.2...v1.2.0) (2026-06-17)


### 重构

* 统一 API 字段命名为 camelCase 风格 ([2a25095](https://github.com/aemeath-projects/napcat/commit/2a250955c59374d5f0911636723e93e21c7f0a87))

## [1.1.2](https://github.com/aemeath-projects/napcat/compare/v1.1.1...v1.1.2) (2026-06-16)

## [1.1.1](https://github.com/aemeath-projects/napcat/compare/v1.1.0...v1.1.1) (2026-06-15)


### 重构

* **transport:** 提取共享 HTTP POST 逻辑至 http-client 模块 ([b9808fa](https://github.com/aemeath-projects/napcat/commit/b9808fa10d43a21da3822bfe91bb265b5122dbb7))

## [1.1.0](https://github.com/aemeath-projects/napcat/compare/v1.0.0...v1.1.0) (2026-06-15)


### 新功能

* **api:** 全面更新 API 参数并新增 NapCat 4.18.6 接口 ([3b8a4e3](https://github.com/aemeath-projects/napcat/commit/3b8a4e328f533c653d10abe174138aef7bb4c301))

## 1.0.0 (2026-06-14)


### 新功能

* 初始化 NapCat OneBot 11 TypeScript SDK ([a0140e4](https://github.com/aemeath-projects/napcat/commit/a0140e4db3d136757f663f6d453146a98645b50b))
* 完善 SDK 各 API 模块并提取公共传输层消息处理 ([bcad16f](https://github.com/aemeath-projects/napcat/commit/bcad16f29d7d0cb3c48499d5b673287e6e6ff089))
* 优化项目结构与 CI/CD 配置，完善导入路径与测试覆盖 ([58b0b69](https://github.com/aemeath-projects/napcat/commit/58b0b69a839c546d96e9ef169fe34a705d997871))
