/** E2E 测试环境配置。需要真实 NapCat 实例，CI 环境下跳过。 */
const NAPCAT_WS_URL = process.env.NAPCAT_WS_URL
const NAPCAT_TOKEN = process.env.NAPCAT_TOKEN

if (!NAPCAT_WS_URL || !NAPCAT_TOKEN) {
  throw new Error('E2E 测试需要设置 NAPCAT_WS_URL 和 NAPCAT_TOKEN 环境变量')
}

export const WS_URL = NAPCAT_WS_URL
export const TOKEN = NAPCAT_TOKEN
