import type { Result } from '../core/result.js'
import type { FileSystemInfo, FileList } from '../types/api.js'

import { BaseApi } from './base.js'

export class FileApi extends BaseApi {
  uploadGroupFile(
    groupId: number,
    file: string,
    name: string,
    folder?: string,
  ): Promise<Result<void>> {
    return this.invoke('upload_group_file', { group_id: groupId, file, name, folder })
  }
  uploadPrivateFile(userId: number, file: string, name: string): Promise<Result<void>> {
    return this.invoke('upload_private_file', { user_id: userId, file, name })
  }
  getGroupFileUrl(
    groupId: number,
    fileId: string,
    busid: number,
  ): Promise<Result<{ url: string }>> {
    return this.invoke('get_group_file_url', { group_id: groupId, file_id: fileId, busid })
  }
  downloadFile(
    url: string,
    threadCount?: number,
    headers?: Record<string, string>,
  ): Promise<Result<{ file: string }>> {
    return this.invoke('download_file', { url, thread_count: threadCount, headers })
  }
  createGroupFileFolder(groupId: number, name: string): Promise<Result<void>> {
    return this.invoke('create_group_file_folder', { group_id: groupId, name })
  }
  deleteGroupFolder(groupId: number, folderId: string): Promise<Result<void>> {
    return this.invoke('delete_group_folder', { group_id: groupId, folder_id: folderId })
  }
  deleteGroupFile(groupId: number, fileId: string, busid: number): Promise<Result<void>> {
    return this.invoke('delete_group_file', { group_id: groupId, file_id: fileId, busid })
  }
  getGroupFileSystemInfo(groupId: number): Promise<Result<FileSystemInfo>> {
    return this.invoke('get_group_file_system_info', { group_id: groupId })
  }
  getGroupRootFiles(groupId: number): Promise<Result<FileList>> {
    return this.invoke('get_group_root_files', { group_id: groupId })
  }
  getGroupFilesByFolder(groupId: number, folderId: string): Promise<Result<FileList>> {
    return this.invoke('get_group_files_by_folder', { group_id: groupId, folder_id: folderId })
  }
}
