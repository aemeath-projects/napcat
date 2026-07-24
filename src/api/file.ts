import type { Result } from '../core'
import type { FileSystemInfo, FileList, PrivateFileUrl } from '../types'

import { BaseApi } from './base.js'

/** 文件相关 API 模块。 */
export class FileApi extends BaseApi {
  /**
   * 上传群文件。
   * @param groupId - 群号。
   * @param file - 文件路径。
   * @param name - 文件名。
   * @param folder - 目标文件夹。
   * @param uploadFile - 是否为上传文件模式。
   * @returns 无返回值。
   */
  uploadGroupFile(
    groupId: number,
    file: string,
    name: string,
    folder?: string,
    uploadFile?: boolean,
  ): Promise<Result<void>> {
    return this.invoke('upload_group_file', { group_id: groupId, file, name, folder, uploadFile })
  }

  /**
   * 上传私聊文件。
   * @param userId - 目标 QQ 号。
   * @param file - 文件路径。
   * @param name - 文件名。
   * @param uploadFile - 是否为上传文件模式。
   * @returns 无返回值。
   */
  uploadPrivateFile(
    userId: number,
    file: string,
    name: string,
    uploadFile?: boolean,
  ): Promise<Result<void>> {
    return this.invoke('upload_private_file', { user_id: userId, file, name, uploadFile })
  }

  /**
   * 获取群文件 URL。
   * @param groupId - 群号。
   * @param fileId - 文件 ID。
   * @returns 群文件 URL 信息。
   */
  getGroupFileUrl(groupId: number, fileId: string): Promise<Result<{ url: string }>> {
    return this.invoke('get_group_file_url', { group_id: groupId, file_id: fileId })
  }

  /**
   * 获取私聊文件 URL。
   * @param fileId - 文件 ID。
   * @returns 私聊文件 URL 信息。
   */
  getPrivateFileUrl(fileId: string): Promise<Result<PrivateFileUrl>> {
    return this.invoke('get_private_file_url', { file_id: fileId })
  }

  /**
   * 下载文件到缓存目录。
   * @param url - 文件 URL。
   * @param base64 - Base64 编码的文件内容。
   * @param name - 保存文件名。
   * @param headers - 请求头。
   * @returns 下载结果，包含文件路径。
   */
  downloadFile(
    url?: string,
    base64?: string,
    name?: string,
    headers?: Record<string, string> | string[] | string,
  ): Promise<Result<{ file: string }>> {
    return this.invoke('download_file', { url, base64, name, headers })
  }

  /**
   * 获取文件信息。
   * @param file - 文件路径。
   * @param fileId - 文件 ID。
   * @returns 文件信息，包含文件路径。
   */
  getFile(file?: string, fileId?: string): Promise<Result<{ file: string }>> {
    return this.invoke('get_file', { file, file_id: fileId })
  }

  /**
   * 创建群文件文件夹。
   * @param groupId - 群号。
   * @param name - 文件夹名称。
   * @returns 无返回值。
   */
  createGroupFileFolder(groupId: number, name: string): Promise<Result<void>> {
    return this.invoke('create_group_file_folder', { group_id: groupId, name })
  }

  /**
   * 删除群文件文件夹。
   * @param groupId - 群号。
   * @param folderId - 文件夹 ID。
   * @returns 无返回值。
   */
  deleteGroupFolder(groupId: number, folderId: string): Promise<Result<void>> {
    return this.invoke('delete_group_folder', { group_id: groupId, folder_id: folderId })
  }

  /**
   * 删除群文件。
   * @param groupId - 群号。
   * @param fileId - 文件 ID。
   * @returns 无返回值。
   */
  deleteGroupFile(groupId: number, fileId: string): Promise<Result<void>> {
    return this.invoke('delete_group_file', { group_id: groupId, file_id: fileId })
  }

  /**
   * 移动群文件。
   * @param groupId - 群号。
   * @param fileId - 文件 ID。
   * @param currentParentDirectory - 当前父目录。
   * @param targetParentDirectory - 目标父目录。
   * @returns 无返回值。
   */
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

  /**
   * 转发群文件到其他群。
   * @param groupId - 群号。
   * @param fileId - 文件 ID。
   * @returns 无返回值。
   */
  transGroupFile(groupId: number, fileId: string): Promise<Result<void>> {
    return this.invoke('trans_group_file', {
      group_id: groupId,
      file_id: fileId,
    })
  }

  /**
   * 重命名群文件。
   * @param groupId - 群号。
   * @param fileId - 文件 ID。
   * @param currentParentDirectory - 当前父目录。
   * @param newName - 新文件名。
   * @returns 无返回值。
   */
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

  /**
   * 获取群文件系统信息。
   * @param groupId - 群号。
   * @returns 群文件系统信息。
   */
  getGroupFileSystemInfo(groupId: number): Promise<Result<FileSystemInfo>> {
    return this.invoke('get_group_file_system_info', { group_id: groupId })
  }

  /**
   * 获取群根目录文件列表。
   * @param groupId - 群号。
   * @param fileCount - 获取文件数量。
   * @returns 群根目录文件列表。
   */
  getGroupRootFiles(groupId: number, fileCount?: number): Promise<Result<FileList>> {
    return this.invoke('get_group_root_files', { group_id: groupId, file_count: fileCount })
  }

  /**
   * 获取群子目录文件列表。
   * @param groupId - 群号。
   * @param folderId - 文件夹 ID。
   * @param fileCount - 获取文件数量。
   * @returns 群子目录文件列表。
   */
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

  // === 4.18.9+ 文件端点 ===

  /**
   * 下载图片文件流。
   * @param file - 文件路径。
   * @param fileId - 文件 ID。
   * @param chunkSize - 分块大小。
   * @returns 无返回值。
   */
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

  /**
   * 下载语音文件流。
   * @param file - 文件路径。
   * @param fileId - 文件 ID。
   * @param chunkSize - 分块大小。
   * @param outFormat - 输出格式。
   * @returns 无返回值。
   */
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

  /**
   * 下载文件流。
   * @param file - 文件路径。
   * @param fileId - 文件 ID。
   * @param chunkSize - 分块大小。
   * @returns 无返回值。
   */
  downloadFileStream(file?: string, fileId?: string, chunkSize?: number): Promise<Result<void>> {
    return this.invoke('download_file_stream', { file, file_id: fileId, chunk_size: chunkSize })
  }

  /**
   * 上传文件流。
   * @param params - 上传参数，包含流 ID、分块数据、文件信息等。
   * @returns 无返回值。
   */
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

  /**
   * 获取文件集 ID。
   * @param shareCode - 分享码。
   * @returns 文件集 ID 信息。
   */
  getFilesetId(shareCode: string): Promise<Result<{ filesetId: string }>> {
    return this.invoke('get_fileset_id', { share_code: shareCode })
  }

  /**
   * 获取文件集信息。
   * @param filesetId - 文件集 ID。
   * @returns 文件集信息。
   */
  getFilesetInfo(filesetId: string): Promise<Result<unknown>> {
    return this.invoke('get_fileset_info', { fileset_id: filesetId })
  }

  /**
   * 下载文件集。
   * @param filesetId - 文件集 ID。
   * @returns 无返回值。
   */
  downloadFileset(filesetId: string): Promise<Result<void>> {
    return this.invoke('download_fileset', { fileset_id: filesetId })
  }

  /**
   * 获取闪传文件列表。
   * @param filesetId - 文件集 ID。
   * @returns 闪传文件列表。
   */
  getFlashFileList(filesetId: string): Promise<Result<unknown[]>> {
    return this.invoke('get_flash_file_list', { fileset_id: filesetId })
  }

  /**
   * 获取闪传文件链接。
   * @param filesetId - 文件集 ID。
   * @param fileName - 文件名。
   * @param fileIndex - 文件索引。
   * @returns 闪传文件链接。
   */
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

  /**
   * 创建闪传任务。
   * @param files - 文件列表。
   * @param name - 任务名称。
   * @param thumbPath - 缩略图路径。
   * @returns 无返回值。
   */
  createFlashTask(files: unknown[], name?: string, thumbPath?: string): Promise<Result<void>> {
    return this.invoke('create_flash_task', { files, name, thumb_path: thumbPath })
  }

  /**
   * 清理流式传输临时文件。
   * @returns 无返回值。
   */
  cleanStreamTempFile(): Promise<Result<void>> {
    return this.invoke('clean_stream_temp_file')
  }

  /**
   * 发送在线文件。
   * @param userId - 目标 QQ 号。
   * @param filePath - 文件路径。
   * @param fileName - 文件名。
   * @returns 无返回值。
   */
  sendOnlineFile(userId: number, filePath: string, fileName?: string): Promise<Result<void>> {
    return this.invoke('send_online_file', {
      user_id: userId,
      file_path: filePath,
      file_name: fileName,
    })
  }

  /**
   * 发送在线文件夹。
   * @param userId - 目标 QQ 号。
   * @param folderPath - 文件夹路径。
   * @param folderName - 文件夹名称。
   * @returns 无返回值。
   */
  sendOnlineFolder(userId: number, folderPath: string, folderName?: string): Promise<Result<void>> {
    return this.invoke('send_online_folder', {
      user_id: userId,
      folder_path: folderPath,
      folder_name: folderName,
    })
  }

  /**
   * 接收在线文件。
   * @param userId - 发送方 QQ 号。
   * @param msgId - 消息 ID。
   * @param elementId - 元素 ID。
   * @returns 无返回值。
   */
  receiveOnlineFile(userId: number, msgId: string, elementId: string): Promise<Result<void>> {
    return this.invoke('receive_online_file', {
      user_id: userId,
      msg_id: msgId,
      element_id: elementId,
    })
  }

  /**
   * 拒绝在线文件。
   * @param userId - 发送方 QQ 号。
   * @param msgId - 消息 ID。
   * @param elementId - 元素 ID。
   * @returns 无返回值。
   */
  refuseOnlineFile(userId: number, msgId: string, elementId: string): Promise<Result<void>> {
    return this.invoke('refuse_online_file', {
      user_id: userId,
      msg_id: msgId,
      element_id: elementId,
    })
  }

  /**
   * 取消在线文件。
   * @param userId - 发送方 QQ 号。
   * @param msgId - 消息 ID。
   * @returns 无返回值。
   */
  cancelOnlineFile(userId: number, msgId: string): Promise<Result<void>> {
    return this.invoke('cancel_online_file', { user_id: userId, msg_id: msgId })
  }

  /**
   * 获取在线文件消息。
   * @param userId - QQ 号。
   * @returns 在线文件消息列表。
   */
  getOnlineFileMsg(userId: number): Promise<Result<unknown>> {
    return this.invoke('get_online_file_msg', { user_id: userId })
  }

  /**
   * 获取文件分享链接。
   * @param filesetId - 文件集 ID。
   * @returns 分享链接信息。
   */
  getShareLink(filesetId: string): Promise<Result<{ url: string }>> {
    return this.invoke('get_share_link', { fileset_id: filesetId })
  }

  /**
   * 测试下载流（调试用）。
   * @param error - 是否模拟错误。
   * @returns 无返回值。
   */
  testDownloadStream(error?: boolean): Promise<Result<void>> {
    return this.invoke('test_download_stream', { error })
  }
}
