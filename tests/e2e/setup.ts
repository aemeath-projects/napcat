/** E2E 测试环境配置。需要真实 NapCat 实例，CI 环境下跳过。 */
const NAPCAT_WS_URL = process.env.NAPCAT_WS_URL
const NAPCAT_TOKEN = process.env.NAPCAT_TOKEN

if (!NAPCAT_WS_URL || !NAPCAT_TOKEN) {
  throw new Error('E2E tests require NAPCAT_WS_URL and NAPCAT_TOKEN environment variables')
}

export const WS_URL = NAPCAT_WS_URL
export const TOKEN = NAPCAT_TOKEN
