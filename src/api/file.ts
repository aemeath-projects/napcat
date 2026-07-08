import type { Result } from '../core'
import type { FileSystemInfo, FileList, PrivateFileUrl } from '../types'

import { BaseApi } from './base.js'

/** 文件相关 API 模块。 */
export class FileApi extends BaseApi {
  /** 上传群文件。 */
  uploadGroupFile(
    groupId: number,
    file: string,
    name: string,
    folder?: string,
    uploadFile?: boolean,
  ): Promise<Result<void>> {
    return this.invoke('upload_group_file', { group_id: groupId, file, name, folder, uploadFile })
  }

  /** 上传私聊文件。 */
  uploadPrivateFile(
    userId: number,
    file: string,
    name: string,
    uploadFile?: boolean,
  ): Promise<Result<void>> {
    return this.invoke('upload_private_file', { user_id: userId, file, name, uploadFile })
  }

  /** 获取群文件 URL。 */
  getGroupFileUrl(groupId: number, fileId: string): Promise<Result<{ url: string }>> {
    return this.invoke('get_group_file_url', { group_id: groupId, file_id: fileId })
  }

  /** 获取私聊文件 URL。 */
  getPrivateFileUrl(fileId: string): Promise<Result<PrivateFileUrl>> {
    return this.invoke('get_private_file_url', { file_id: fileId })
  }

  /** 下载文件到缓存目录。 */
  downloadFile(
    url?: string,
    base64?: string,
    name?: string,
    headers?: Record<string, string> | string[] | string,
  ): Promise<Result<{ file: string }>> {
    return this.invoke('download_file', { url, base64, name, headers })
  }

  /** 获取文件信息。 */
  getFile(file?: string, fileId?: string): Promise<Result<{ file: string }>> {
    return this.invoke('get_file', { file, file_id: fileId })
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
  deleteGroupFile(groupId: number, fileId: string): Promise<Result<void>> {
    return this.invoke('delete_group_file', { group_id: groupId, file_id: fileId })
  }

  /** 移动群文件。 */
  moveGroupFile(
    groupId: number,
    fileId: string,
    currentParentDirectory: string,
    targetParentDirectory: string,
  ): Promise<Result<void>> {
    return this.invoke('move_group_file', {
      group_id: groupId,
      file_id: fileId,
      current_parent_directory: currentParentDirectory,
      target_parent_directory: targetParentDirectory,
    })
  }

  /** 转发群文件到其他群。 */
  transGroupFile(groupId: number, fileId: string): Promise<Result<void>> {
    return this.invoke('trans_group_file', {
      group_id: groupId,
      file_id: fileId,
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
  getGroupRootFiles(groupId: number, fileCount?: number): Promise<Result<FileList>> {
    return this.invoke('get_group_root_files', { group_id: groupId, file_count: fileCount })
  }

  /** 获取群子目录文件列表。 */
  getGroupFilesByFolder(
    groupId: number,
    folderId?: string,
    fileCount?: number,
  ): Promise<Result<FileList>> {
    return this.invoke('get_group_files_by_folder', {
      group_id: groupId,
      folder_id: folderId,
      file_count: fileCount,
    })
  }

  /* 4.18.9+ 文件端点 */

  /** 下载图片文件流。 */
  downloadFileImageStream(
    file?: string,
    fileId?: string,
    chunkSize?: number,
  ): Promise<Result<void>> {
    return this.invoke('download_file_image_stream', {
      file,
      file_id: fileId,
      chunk_size: chunkSize,
    })
  }

  /** 下载语音文件流。 */
  downloadFileRecordStream(
    file?: string,
    fileId?: string,
    chunkSize?: number,
    outFormat?: string,
  ): Promise<Result<void>> {
    return this.invoke('download_file_record_stream', {
      file,
      file_id: fileId,
      chunk_size: chunkSize,
      out_format: outFormat,
    })
  }

  /** 下载文件流。 */
  downloadFileStream(file?: string, fileId?: string, chunkSize?: number): Promise<Result<void>> {
    return this.invoke('download_file_stream', { file, file_id: fileId, chunk_size: chunkSize })
  }

  /** 上传文件流。 */
  uploadFileStream(params: {
    streamId: string
    fileRetention: number
    chunkData?: string
    chunkIndex?: number
    totalChunks?: number
    fileSize?: number
    expectedSha256?: string
    isComplete?: boolean
    filename?: string
    reset?: boolean
    verifyOnly?: boolean
  }): Promise<Result<void>> {
    return this.invoke('upload_file_stream', params)
  }

  /** 获取文件集 ID。 */
  getFilesetId(shareCode: string): Promise<Result<{ filesetId: string }>> {
    return this.invoke('get_fileset_id', { share_code: shareCode })
  }

  /** 获取文件集信息。 */
  getFilesetInfo(filesetId: string): Promise<Result<unknown>> {
    return this.invoke('get_fileset_info', { fileset_id: filesetId })
  }

  /** 下载文件集。 */
  downloadFileset(filesetId: string): Promise<Result<void>> {
    return this.invoke('download_fileset', { fileset_id: filesetId })
  }

  /** 获取闪传文件列表。 */
  getFlashFileList(filesetId: string): Promise<Result<unknown[]>> {
    return this.invoke('get_flash_file_list', { fileset_id: filesetId })
  }

  /** 获取闪传文件链接。 */
  getFlashFileUrl(
    filesetId: string,
    fileName?: string,
    fileIndex?: number,
  ): Promise<Result<{ url: string }>> {
    return this.invoke('get_flash_file_url', {
      fileset_id: filesetId,
      file_name: fileName,
      file_index: fileIndex,
    })
  }

  /** 创建闪传任务。 */
  createFlashTask(files: unknown[], name?: string, thumbPath?: string): Promise<Result<void>> {
    return this.invoke('create_flash_task', { files, name, thumb_path: thumbPath })
  }

  /** 清理流式传输临时文件。 */
  cleanStreamTempFile(): Promise<Result<void>> {
    return this.invoke('clean_stream_temp_file')
  }

  /** 发送在线文件。 */
  sendOnlineFile(userId: number, filePath: string, fileName?: string): Promise<Result<void>> {
    return this.invoke('send_online_file', {
      user_id: userId,
      file_path: filePath,
      file_name: fileName,
    })
  }

  /** 发送在线文件夹。 */
  sendOnlineFolder(userId: number, folderPath: string, folderName?: string): Promise<Result<void>> {
    return this.invoke('send_online_folder', {
      user_id: userId,
      folder_path: folderPath,
      folder_name: folderName,
    })
  }

  /** 接收在线文件。 */
  receiveOnlineFile(userId: number, msgId: string, elementId: string): Promise<Result<void>> {
    return this.invoke('receive_online_file', {
      user_id: userId,
      msg_id: msgId,
      element_id: elementId,
    })
  }

  /** 拒绝在线文件。 */
  refuseOnlineFile(userId: number, msgId: string, elementId: string): Promise<Result<void>> {
    return this.invoke('refuse_online_file', {
      user_id: userId,
      msg_id: msgId,
      element_id: elementId,
    })
  }

  /** 取消在线文件。 */
  cancelOnlineFile(userId: number, msgId: string): Promise<Result<void>> {
    return this.invoke('cancel_online_file', { user_id: userId, msg_id: msgId })
  }

  /** 获取在线文件消息。 */
  getOnlineFileMsg(userId: number): Promise<Result<unknown>> {
    return this.invoke('get_online_file_msg', { user_id: userId })
  }

  /** 获取文件分享链接。 */
  getShareLink(filesetId: string): Promise<Result<{ url: string }>> {
    return this.invoke('get_share_link', { fileset_id: filesetId })
  }

  /** 测试下载流（调试用）。 */
  testDownloadStream(error?: boolean): Promise<Result<void>> {
    return this.invoke('test_download_stream', { error })
  }
}
