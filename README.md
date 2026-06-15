# Aemeath NapCat SDK

NapCat / OneBot 11 TypeScript SDK. 提供对 NapCat 的完整 TypeScript 封装，支持四种连接方式，支持 tree-shaking

![NPM Version](https://img.shields.io/npm/v/%40aemeath-projects%2Fnapcat?style=for-the-badge)
![NapCat Version](https://img.shields.io/badge/napcat-4.18.6-pink?style=for-the-badge)
![CI Status](https://img.shields.io/github/actions/workflow/status/aemeath-projects/napcat/ci.yml?style=for-the-badge)
![Codecov](https://img.shields.io/codecov/c/github/aemeath-projects/napcat/master?style=for-the-badge)
![License](https://img.shields.io/github/license/aemeath-projects/napcat?style=for-the-badge)

## 安装

```bash
pnpm add @aemeath-projects/napcat
```

## 快速开始

```ts
import {
  NapCatClient,
  WebSocketTransport,
  MessageApi,
  GroupApi,
  Seg,
} from '@aemeath-projects/napcat'

// 正向 WS（SDK 连接到 NapCat）
const transport = new WebSocketTransport({
  url: 'ws://localhost:3001',
  token: 'your-access-token',
  reconnect: { initialDelay: 1000, maxDelay: 30000 },
})

const client = new NapCatClient(transport)
const msg = new MessageApi(client)
const group = new GroupApi(client)

// 监听群消息
client.on('message.group', async (event) => {
  if (event.raw_message === 'ping') {
    await msg.sendGroupMsg(event.group_id, [Seg.text('pong')])
  }
})

client.on('error', (err) => console.error('连接异常:', err.message))
client.on('reconnecting', (attempt, delay) =>
  console.log(`第 ${attempt} 次重连，${delay}ms 后`)
)

await client.connect()
```

## 连接方式

| Transport | 用途 |
|-----------|------|
| `WebSocketTransport` | 正向 WS：SDK 连接到 NapCat |
| `ReverseWebSocketTransport` | 反向 WS：NapCat 连接到 SDK |
| `HttpTransport` | HTTP + 事件上报 |
| `SseTransport` | HTTP-SSE 扩展模式 |

## API 模块

```ts
const msg = new MessageApi(client)    // 消息收发
const group = new GroupApi(client)    // 群管理
const friend = new FriendApi(client)  // 好友操作
const file = new FileApi(client)      // 文件上传/下载
const system = new SystemApi(client)  // 系统信息
const ext = new ExtensionApi(client)  // NapCat 扩展
```

所有 API 方法返回 `Result<T>` 类型：

```ts
const result = await msg.sendGroupMsg(groupId, [Seg.text('hello')])
if (result.ok) {
  console.log('发送成功，message_id:', result.data.message_id)
} else {
  console.error('发送失败，code:', result.error.code)
}
```

## 消息段构建

```ts
import { Seg } from '@aemeath-projects/napcat'

Seg.text('Hello')
Seg.at(123456)
Seg.image('http://example.com/img.png')
Seg.reply(messageId)
Seg.face(1)
// ...更多见 Seg 类型定义
```

## 许可证

MIT
