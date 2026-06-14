import type { Result } from '../core/result.js'
import type { FriendInfo } from '../types/api.js'

import { BaseApi } from './base.js'

export class FriendApi extends BaseApi {
  getFriendList(): Promise<Result<FriendInfo[]>> {
    return this.invoke('get_friend_list')
  }
  sendLike(userId: number, times?: number): Promise<Result<void>> {
    return this.invoke('send_like', { user_id: userId, times })
  }
  deleteFriend(userId: number): Promise<Result<void>> {
    return this.invoke('delete_friend', { user_id: userId })
  }
  setFriendAddRequest(flag: string, approve: boolean, remark?: string): Promise<Result<void>> {
    return this.invoke('set_friend_add_request', { flag, approve, remark })
  }
  setGroupAddRequest(
    flag: string,
    subType: string,
    approve: boolean,
    reason?: string,
  ): Promise<Result<void>> {
    return this.invoke('set_group_add_request', { flag, sub_type: subType, approve, reason })
  }
}
