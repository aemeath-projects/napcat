import { describe, it, expect, vi } from 'vitest'

import { FileApi } from '../../../src/api/file.js'
import type { NapCatClient } from '../../../src/core/client.js'

function mockClient(data: unknown = null) {
  return {
    call: vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data }),
  } as unknown as NapCatClient
}

describe('FileApi', () => {
  it('uploadGroupFile', async () => {
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
  it('downloadFile', async () => {
    const client = mockClient({ file: '/tmp/downloaded' })
    const api = new FileApi(client)
    const result = await api.downloadFile('https://example.com/file', 4)
    expect(result.ok).toBe(true)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('download_file', {
      url: 'https://example.com/file',
      thread_count: 4,
      headers: undefined,
    })
  })
  it('getGroupFileUrl', async () => {
    const client = mockClient({ url: 'https://...' })
    const api = new FileApi(client)
    await api.getGroupFileUrl(1001, 'file123', 102)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_file_url', {
      group_id: 1001,
      file_id: 'file123',
      busid: 102,
    })
  })
  it('uploadPrivateFile', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.uploadPrivateFile(9999, '/path/file.txt', 'file.txt')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('upload_private_file', {
      user_id: 9999,
      file: '/path/file.txt',
      name: 'file.txt',
    })
  })
  it('createGroupFileFolder', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.createGroupFileFolder(1001, '新文件夹')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'create_group_file_folder',
      { group_id: 1001, name: '新文件夹' },
    )
  })
  it('deleteGroupFolder', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.deleteGroupFolder(1001, 'folder_abc')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_group_folder', {
      group_id: 1001,
      folder_id: 'folder_abc',
    })
  })
  it('deleteGroupFile', async () => {
    const client = mockClient()
    const api = new FileApi(client)
    await api.deleteGroupFile(1001, 'file_abc', 102)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('delete_group_file', {
      group_id: 1001,
      file_id: 'file_abc',
      busid: 102,
    })
  })
  it('getGroupFileSystemInfo', async () => {
    const client = mockClient({ total_space: 1000, used_space: 200, file_count: 5 })
    const api = new FileApi(client)
    await api.getGroupFileSystemInfo(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_file_system_info',
      { group_id: 1001 },
    )
  })
  it('getGroupRootFiles', async () => {
    const client = mockClient({ files: [], folders: [] })
    const api = new FileApi(client)
    await api.getGroupRootFiles(1001)
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('get_group_root_files', {
      group_id: 1001,
    })
  })
  it('getGroupFilesByFolder', async () => {
    const client = mockClient({ files: [], folders: [] })
    const api = new FileApi(client)
    await api.getGroupFilesByFolder(1001, 'folder_xyz')
    expect(client.call as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'get_group_files_by_folder',
      { group_id: 1001, folder_id: 'folder_xyz' },
    )
  })
})
