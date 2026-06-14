import type { Result } from '../core/result.js'
import type { FileSystemInfo, FileList, PrivateFileUrl } from '../types/api.js'

import { BaseApi } from './base.js'

/** 文件相关 API 模块。 */
export class FileApi extends BaseApi {
  /** 上传群文件。 */
  uploadGroupFile(
    groupId: number,
    file: string,
    name: string,
    folder?: string,
  ): Promise<Result<void>> {
    return this.invoke('upload_group_file', { group_id: groupId, file, name, folder })
  }

  /** 上传私聊文件。 */
  uploadPrivateFile(userId: number, file: string, name: string): Promise<Result<void>> {
    return this.invoke('upload_private_file', { user_id: userId, file, name })
  }

  /** 获取群文件 URL。 */
  getGroupFileUrl(
    groupId: number,
    fileId: string,
    busid: number,
  ): Promise<Result<{ url: string }>> {
    return this.invoke('get_group_file_url', { group_id: groupId, file_id: fileId, busid })
  }

  /** 获取私聊文件 URL。 */
  getPrivateFileUrl(
    userId: number,
    fileId: string,
    busid: number,
  ): Promise<Result<PrivateFileUrl>> {
    return this.invoke('get_private_file_url', { user_id: userId, file_id: fileId, busid })
  }

  /** 下载文件到缓存目录。 */
  downloadFile(
    url: string,
    threadCount?: number,
    headers?: Record<string, string>,
  ): Promise<Result<{ file: string }>> {
    return this.invoke('download_file', { url, thread_count: threadCount, headers })
  }

  /** 获取文件信息（NapCat 扩展）。 */
  getFile(file: string, type: string): Promise<Result<{ file: string }>> {
    return this.invoke('get_file', { file, type })
  }

  /** 创建群文件文件夹。 */
  createGroupFileFolder(groupId: number, name: string): Promise<Result<void>> {
    return this.invoke('create_group_file_folder', { group_id: groupId, name })
  }

  /** 删除群文件文件夹。 */
  deleteGroupFolder(groupId: number, folderId: string): Promise<Result<void>> {
    return this.invoke('delete_group_folder', { group_id: groupId, folder_id: folderId })
  }

  /** 删除群文件。 */
  deleteGroupFile(groupId: number, fileId: string, busid: number): Promise<Result<void>> {
    return this.invoke('delete_group_file', { group_id: groupId, file_id: fileId, busid })
  }

  /** 移动群文件。 */
  moveGroupFile(groupId: number, fileId: string, targetDir: string): Promise<Result<void>> {
    return this.invoke('move_group_file', {
      group_id: groupId,
      file_id: fileId,
      target_dir: targetDir,
    })
  }

  /** 转发群文件到其他群。 */
  transGroupFile(groupId: number, fileId: string, targetGroupId: number): Promise<Result<void>> {
    return this.invoke('trans_group_file', {
      group_id: groupId,
      file_id: fileId,
      target_group_id: targetGroupId,
    })
  }

  /** 重命名群文件。 */
  renameGroupFile(
    groupId: number,
    fileId: string,
    currentParentDirectory: string,
    newName: string,
  ): Promise<Result<void>> {
    return this.invoke('rename_group_file', {
      group_id: groupId,
      file_id: fileId,
      current_parent_directory: currentParentDirectory,
      new_name: newName,
    })
  }

  /** 获取群文件系统信息。 */
  getGroupFileSystemInfo(groupId: number): Promise<Result<FileSystemInfo>> {
    return this.invoke('get_group_file_system_info', { group_id: groupId })
  }

  /** 获取群根目录文件列表。 */
  getGroupRootFiles(groupId: number): Promise<Result<FileList>> {
    return this.invoke('get_group_root_files', { group_id: groupId })
  }

  /** 获取群子目录文件列表。 */
  getGroupFilesByFolder(groupId: number, folderId: string): Promise<Result<FileList>> {
    return this.invoke('get_group_files_by_folder', { group_id: groupId, folder_id: folderId })
  }
}
