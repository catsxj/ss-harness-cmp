import { getToken } from './auth'

export interface UploadItem {
  file: File
  progress: number
  isReady?: boolean
  isUploading?: boolean
  isCancel?: boolean
  isSuccess?: boolean
  filePath?: string
  cancel?: () => void
}

export default function uploadFile(
  item: UploadItem,
  callback: (item: UploadItem) => void,
  errorCallBack: (item: UploadItem) => void
): void {
  const protocol = location.protocol === 'http:' ? 'ws' : 'wss'
  item.isReady = true
  const socket = new WebSocket(
    `${protocol}://${location.host}/api/sms/uploadService`,
    getToken()
  )
  let i = 0
  let startSize = 0
  let endSize = 0
  const paragraph = 4 * 1024 * 1024
  const count = Math.floor(item.file.size / paragraph) + 1

  socket.onopen = () => {
    item.isUploading = true
    socket.send(JSON.stringify({ filename: item.file.name, upload: 'file' }))
    item.cancel = () => {
      item.progress = 0
      socket.send(JSON.stringify({ UPLOAD_CANCEL: 'UPLOAD_CANCEL' }))
      item.isUploading = false
    }
  }

  socket.onmessage = (event) => {
    const sendFile = () => {
      if (startSize < item.file.size) {
        endSize += paragraph
        const blob = item.file.slice(startSize, endSize)
        const reader = new FileReader()
        reader.readAsArrayBuffer(blob)
        reader.onload = (evt) => {
          const result = (evt.target as FileReader).result
          i++
          item.progress = Math.floor((i / count) * 100)
          startSize = endSize
          if (result) socket.send(result as ArrayBuffer)
        }
      } else {
        item.progress = 100
        socket.send(JSON.stringify({ sendover: 'sendover' }))
      }
    }
    item.isUploading = true
    item.isCancel = false
    const obj = JSON.parse(event.data)
    if (obj.category === 'UPLOAD_ACK') {
      item.filePath = obj.content
      sendFile()
    } else if (obj.category === 'UPLOAD') {
      if (obj.content === 'SAVE_FAILURE') {
        item.isUploading = false
        errorCallBack(item)
      } else if (obj.content === 'SAVE_SUCCESS') {
        sendFile()
      } else if (obj.content === 'TRUE') {
        callback(item)
        item.isReady = true
        item.isSuccess = true
        item.isUploading = false
        socket.close()
      }
    } else if (obj.category === 'UPLOAD_CANCEL') {
      item.progress = 0
      item.isCancel = true
      socket.close()
    }
  }
}
