# 安全策略

## 受支持的版本

| 版本   | 支持状态         |
| ------ | ---------------- |
| 1.x    | ✅ 积极维护中     |
| < 1.0  | ❌ 不再支持       |

## 报告安全漏洞

我们非常重视 **@aemeath-projects/napcat** 及 NapCat 生态的安全。如果您发现了安全漏洞，**请不要在 GitHub 公开提交 Issue**，请按以下方式私下报告。

### 首选方式：GitHub 安全公告（Security Advisory）

1. 访问本仓库的 **Security** 标签页：[安全公告页](https://github.com/aemeath-projects/napcat/security/advisories)
2. 点击 **Report a vulnerability** 绿色按钮
3. 填写表单，提供足够的复现信息

GitHub 安全公告渠道会直接将您的报告提交给仓库管理员，并支持私密讨论与协作修复。

### 备选方式：联系维护者

如果安全公告功能不可用，您也可以通过以下方式联系：

- **邮箱：** [aemeath@aemeath.dev](mailto:aemeath@aemeath.dev)

### 提交信息要求

为了使问题得到快速处理，请在报告中包含：

- 漏洞类型（例如：XSS、SQL 注入、权限绕过等）
- 受影响的功能模块或端点
- 复现步骤（包含代码、配置、请求示例等）
- 预期行为与实际行为
- 潜在的危害评估
- 环境信息（Node.js 版本、操作系统等）
- 如有缓解措施或修复建议，也请一并附上

## 处理流程

提交报告后，我们会：

1. **确认收到** — 1 个工作日内确认您的报告
2. **评估** — 评估漏洞的严重性和影响范围
3. **修复** — 在修复开发过程中与您保持沟通
4. **发布** — 修复完成后发布安全更新，并在 [GitHub Releases](https://github.com/aemeath-projects/napcat/releases) 中公告
5. **致谢** — 如您同意，我们会在安全公告中公开致谢

## 漏洞披露原则

我们遵循 **负责任的披露（Responsible Disclosure）** 原则：

- 我们承诺在 **90 天内** 完成修复
- 在补丁发布之前，请勿公开披露漏洞细节
- 我们欢迎安全研究者在修复完成后发表技术分析文章（经协调后）

## 范围

本项目（`@aemeath-projects/napcat`）是一个面向 **NapCat** 的 OneBot 11 TypeScript SDK。以下内容**属于**本安全策略的覆盖范围：

- `@aemeath-projects/napcat` npm 包及其公开的子路径模块（`/core`、`/transport`、`/api`、`/types`、`/utils`）
- 所有层面的输入处理（WebSocket、HTTP、SSE 消息接收与发送）
- 身份验证与授权机制
- API 调用中的数据校验与序列化

以下内容**不属于**本安全策略的范围：

- NapCat 本体或其他 NapCat 生态项目（请直接联系对应维护者）
- QQ 协议本身的安全问题
- 使用者自行编写的 Bot 逻辑中的安全缺陷

---
