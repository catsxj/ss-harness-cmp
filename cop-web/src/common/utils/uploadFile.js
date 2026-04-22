// websocket文件上传
import { getToken } from './auth'
export default function uploadFile (item, callback, errorCallBack) {
  const protocol = location.protocol === 'http:' ? 'ws' : 'wss'
  item.isReady = true;
  const socket = new WebSocket(`${protocol}://${location.host}/api/sms/uploadService`, getToken());
  let i = 0;
  let startSize = 0, endSize = 0;
  const paragraph = 4 * 1024 * 1024; // 以4MB为一个分片
  const count = parseInt(item.file.size / paragraph) + 1;
  socket.onopen = function () {
    item.isUploading = true;
    socket.send(JSON.stringify({
      filename: item.file.name,
      upload: 'file'
    }));
    // 取消上传
    item.cancel = function () {
      item.progress = 0;
      socket.send(JSON.stringify({
        UPLOAD_CANCEL: 'UPLOAD_CANCEL'
      }));
      item.isUploading = false;
    };
  };
  socket.onmessage = function (event) {
    const sendFile = function () {
      if (startSize < item.file.size) {
        let blob;
        endSize += paragraph;
        if (item.file.webkitSlice) {
          blob = item.file.webkitSlice(startSize, endSize);
        } else if (item.file.mozSlice) {
          blob = item.file.mozSlice(startSize, endSize);
        } else {
          blob = item.file.slice(startSize, endSize);
        }
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);

        reader.onload = function loaded (evt) {
          const result = evt.target.result;
          // i++;
          // const isok = (i / count) * 100;
          // item.progress = parseInt(isok);
          startSize = endSize;
          socket.send(result);
        };
      } else {
        item.progress = 100;
        socket.send(JSON.stringify({
          sendover: 'sendover'
        }));
      }
    };
    item.isUploading = true;
    item.isCancel = false;
    const obj = JSON.parse(event.data);
    if (obj.category == 'UPLOAD_ACK') {
      item.filePath = obj.content;
      sendFile();
    } else if (obj.category == 'UPLOAD') {
      if (obj.content == 'SAVE_FAILURE') {
        item.isUploading = false;
        errorCallBack(item);
      } else if (obj.content == 'SAVE_SUCCESS') {
        sendFile();
        i++;
        const isok = (i / count) * 100;
        item.progress = parseInt(isok);
      } else if (obj.content == 'TRUE') {
        callback(item);
        item.isReady = true;
        item.isSuccess = true;
        item.isUploading = false;
        socket.close();
      }
    } else if (obj.category == 'UPLOAD_CANCEL') {
      item.progress = 0;
      item.isCancel = true;
      socket.close();
    }
  };
}
