import { describe, it, expect, vi } from 'vitest'

import { FileApi } from '../../../src/api'
import type { NapCatClient } from '../../../src/core'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('文件 API', () => {
  it('uploadGroupFile 上传群文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.uploadGroupFile(1001, '/path/file.txt', 'file.txt', 'folder1')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('upload_group_file', {
      group_id: 1001,
      file: '/path/file.txt',
      name: 'file.txt',
      folder: 'folder1',
    })
  })
  it('downloadFile 下载文件', async () => {
    const client = mockClient({ file: '/tmp/downloaded' })
    const api = new FileApi(client)
    const result = await api.downloadFile('https://example.com/file')
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('download_file', {
      url: 'https://example.com/file',
      base64: undefined,
      name: undefined,
      headers: undefined,
    })
  })
  it('getGroupFileUrl 获取群文件链接', async () => {
    const client = mockClient({ url: 'https://...' })
    const api = new FileApi(client)
    await api.getGroupFileUrl(1001, 'file123')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_file_url', {
      group_id: 1001,
      file_id: 'file123',
    })
  })
  it('uploadPrivateFile 上传私聊文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.uploadPrivateFile(9999, '/path/file.txt', 'file.txt')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('upload_private_file', {
      user_id: 9999,
      file: '/path/file.txt',
      name: 'file.txt',
    })
  })
  it('createGroupFileFolder 创建群文件文件夹', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.createGroupFileFolder(1001, '新文件夹')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'create_group_file_folder',
      { group_id: 1001, name: '新文件夹' },
    )
  })
  it('deleteGroupFolder 删除群文件夹', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.deleteGroupFolder(1001, 'folder_abc')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_group_folder', {
      group_id: 1001,
      folder_id: 'folder_abc',
    })
  })
  it('deleteGroupFile 删除群文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.deleteGroupFile(1001, 'file_abc')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_group_file', {
      group_id: 1001,
      file_id: 'file_abc',
    })
  })
  it('getGroupFileSystemInfo 获取群文件系统信息', async () => {
    const client = mockClient({ total_space: 1000, used_space: 200, file_count: 5 })
    const api = new FileApi(client)
    await api.getGroupFileSystemInfo(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_file_system_info',
      { group_id: 1001 },
    )
  })
  it('getGroupRootFiles 获取群根目录文件', async () => {
    const client = mockClient({ files: [], folders: [] })
    const api = new FileApi(client)
    await api.getGroupRootFiles(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_root_files', {
      group_id: 1001,
      file_count: undefined,
    })
  })
  it('getGroupFilesByFolder 按文件夹获取群文件', async () => {
    const client = mockClient({ files: [], folders: [] })
    const api = new FileApi(client)
    await api.getGroupFilesByFolder(1001, 'folder_xyz')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_files_by_folder',
      { group_id: 1001, folder_id: 'folder_xyz', file_count: undefined },
    )
  })
  it('moveGroupFile 移动群文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.moveGroupFile(1001, 'file_001', '/current/dir', '/target/dir')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('move_group_file', {
      group_id: 1001,
      file_id: 'file_001',
      current_parent_directory: '/current/dir',
      target_parent_directory: '/target/dir',
    })
  })
  it('transGroupFile 转发群文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.transGroupFile(1001, 'file_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('trans_group_file', {
      group_id: 1001,
      file_id: 'file_001',
    })
  })
  it('renameGroupFile 重命名群文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.renameGroupFile(1001, 'file_001', '/parent', 'new_name.txt')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('rename_group_file', {
      group_id: 1001,
      file_id: 'file_001',
      current_parent_directory: '/parent',
      new_name: 'new_name.txt',
    })
  })
  it('getPrivateFileUrl 获取私聊文件链接', async () => {
    const client = mockClient({ url: 'https://...' })
    const api = new FileApi(client)
    await api.getPrivateFileUrl('file_abc')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_private_file_url', {
      file_id: 'file_abc',
    })
  })
  it('getFile 获取文件', async () => {
    const client = mockClient({ file: '/cache/downloaded' })
    const api = new FileApi(client)
    await api.getFile('file_hash')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_file', {
      file: 'file_hash',
      file_id: undefined,
    })
  })

  /* 4.18.8+ 文件端点测试 */

  it('downloadFileImageStream 下载图片文件流', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.downloadFileImageStream('img.png', 'file_001', 1024)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'download_file_image_stream',
      {
        file: 'img.png',
        file_id: 'file_001',
        chunk_size: 1024,
      },
    )
  })

  it('downloadFileRecordStream 下载语音文件流', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.downloadFileRecordStream('voice.silk', 'file_002', 512, 'mp3')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'download_file_record_stream',
      {
        file: 'voice.silk',
        file_id: 'file_002',
        chunk_size: 512,
        out_format: 'mp3',
      },
    )
  })

  it('downloadFileStream 下载文件流', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.downloadFileStream('file.zip', 'file_003', 2048)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('download_file_stream', {
      file: 'file.zip',
      file_id: 'file_003',
      chunk_size: 2048,
    })
  })

  it('uploadFileStream 上传文件流', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.uploadFileStream({
      stream_id: 'stream_001',
      file_retention: 1,
      chunk_data: 'base64data',
      chunk_index: 0,
      total_chunks: 5,
      filename: 'test.txt',
    })
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('upload_file_stream', {
      stream_id: 'stream_001',
      file_retention: 1,
      chunk_data: 'base64data',
      chunk_index: 0,
      total_chunks: 5,
      filename: 'test.txt',
    })
  })

  it('getFilesetId 获取文件集 ID', async () => {
    const client = mockClient({ fileset_id: 'fs_001' })
    const api = new FileApi(client)
    const result = await api.getFilesetId('share_code_abc')
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_fileset_id', {
      share_code: 'share_code_abc',
    })
  })

  it('getFilesetInfo 获取文件集信息', async () => {
    const client = mockClient({})
    const api = new FileApi(client)
    await api.getFilesetInfo('fs_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_fileset_info', {
      fileset_id: 'fs_001',
    })
  })

  it('downloadFileset 下载文件集', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.downloadFileset('fs_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('download_fileset', {
      fileset_id: 'fs_001',
    })
  })

  it('getFlashFileList 获取闪传文件列表', async () => {
    const client = mockClient([])
    const api = new FileApi(client)
    await api.getFlashFileList('fs_flash_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_flash_file_list', {
      fileset_id: 'fs_flash_001',
    })
  })

  it('getFlashFileUrl 获取闪传文件链接', async () => {
    const client = mockClient({ url: 'https://flash.url' })
    const api = new FileApi(client)
    await api.getFlashFileUrl('fs_flash_001', 'photo.jpg', 0)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_flash_file_url', {
      fileset_id: 'fs_flash_001',
      file_name: 'photo.jpg',
      file_index: 0,
    })
  })

  it('createFlashTask 创建闪传任务', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.createFlashTask([{ file: 'photo.jpg' }], '闪传相册', '/thumb/path')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('create_flash_task', {
      files: [{ file: 'photo.jpg' }],
      name: '闪传相册',
      thumb_path: '/thumb/path',
    })
  })

  it('cleanStreamTempFile 清理流式传输临时文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.cleanStreamTempFile()
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'clean_stream_temp_file',
      {},
    )
  })

  it('sendOnlineFile 发送在线文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.sendOnlineFile(9999, '/path/file.pdf', 'file.pdf')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_online_file', {
      user_id: 9999,
      file_path: '/path/file.pdf',
      file_name: 'file.pdf',
    })
  })

  it('sendOnlineFolder 发送在线文件夹', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.sendOnlineFolder(9999, '/path/folder', '我的文件夹')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('send_online_folder', {
      user_id: 9999,
      folder_path: '/path/folder',
      folder_name: '我的文件夹',
    })
  })

  it('receiveOnlineFile 接收在线文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.receiveOnlineFile(9999, 'msg_001', 'elem_001')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('receive_online_file', {
      user_id: 9999,
      msg_id: 'msg_001',
      element_id: 'elem_001',
    })
  })

  it('refuseOnlineFile 拒绝在线文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.refuseOnlineFile(9999, 'msg_002', 'elem_002')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('refuse_online_file', {
      user_id: 9999,
      msg_id: 'msg_002',
      element_id: 'elem_002',
    })
  })

  it('cancelOnlineFile 取消在线文件', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.cancelOnlineFile(9999, 'msg_003')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('cancel_online_file', {
      user_id: 9999,
      msg_id: 'msg_003',
    })
  })

  it('getOnlineFileMsg 获取在线文件消息', async () => {
    const client = mockClient({})
    const api = new FileApi(client)
    await api.getOnlineFileMsg(9999)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_online_file_msg', {
      user_id: 9999,
    })
  })

  it('getShareLink 获取文件分享链接', async () => {
    const client = mockClient({ url: 'https://share.url' })
    const api = new FileApi(client)
    const result = await api.getShareLink('fs_share_001')
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_share_link', {
      fileset_id: 'fs_share_001',
    })
  })

  it('testDownloadStream 测试下载流', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.testDownloadStream(false)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('test_download_stream', {
      error: false,
    })
  })
})
