<template>
  <el-dialog title="导入" :close-on-click-modal="false" :visible.sync="dialog.visible" width="480px">
    <el-row>
      <el-col :span="24">
        <el-alert title="" type="warning" :closable="false">
          <template slot="">
            <div class="text-center">
              <span>您是否有标准的模版，需要依照模版导入，否则会失败。</span><br />
              <a class="text-info cur-point" @click="exportData(false)">还没有模版?请下载模版</a>
            </div>
          </template>
        </el-alert>
      </el-col>
      <el-col :span="24" class="text-center m-t">
        <el-upload :data="{ params: JSON.stringify({ vendorId: this.dialog.vendorId }) }" class="upload-demo" drag :on-success="handleSuccess" action="/api/ims/v1/cloud/bills/import" :headers="headers">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <!-- <div class="el-upload__tip" slot="tip">只能上传excel文件</div> -->
        </el-upload>
      </el-col>
    </el-row>
    <!-- <el-row v-if="currentNo">
      <el-col :sapn="24" class="text-center" v-show="importResult.fail !='fail'">
        <div>
          <el-progress type="circle" :percentage="importResult.progress"></el-progress>
        </div>
        <span>成功：{{importResult.success}}条；失败{{importResult.fail}}条；总数：{{importResult.total}}条</span>
      </el-col>
      <el-col :span="24" class="text-center" v-show="importResult.progress===100">
        <div class="text-info" v-show="!importResult.fail">
          <Icon type=" icon-ok" />
          恭喜您成功导入数据
        </div>
        <div class="text-danger" v-show="importResult.fail">
          <span v-show="importResult.fail!='fail'">
            <Icon type=" icon-icon-31" />很遗憾，有{{importResult.fail}}条数据导入失败
          </span>
          <span v-show="importResult.fail=='fail'">
            <Icon type=" icon-icon-31" />导入模板不合法
          </span>
          <a class="text-info cur-point" @click="exportReason">下载失败文件</a>
        </div>
      </el-col>
    </el-row> -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialog.visible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>
<script>
import webSocket from '@/common/mixins/webSocket'
import { downloadFile } from 'utils'
import { getToken } from 'utils/auth'

export default {
  mixins: [webSocket],
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      socket: '',
      currentNo: '',
      importResult: {},
      headers: { token: getToken() }
    }
  },
  created() {
    // socket.Init(this.onMessage);
  },
  beforeDestroy() {
    // socket.Destroy();
  },
  methods: {
    onmessage(data) {
      if (data.operate === 'SERVERIMPORT' && data.data.uuid == this.currentNo) {
        this.importResult = data.data
      }
    },
    // 导出数据
    exportData() {
      // const params = JSON.stringify([{ param: { excelType: 2007 }, sign: 'EQ' }])
      downloadFile('/ims/v1/cloud/bills/download')
    },
    exportReason() {
      const params = JSON.stringify([{ param: { fileName: this.importResult.fileName }, sign: 'EQ' }])
      downloadFile('/ims/v1/hosts', {
        condition: JSON.stringify({ condition: 'download' }),
        params
      })
    },
    // 数据导入成功回调
    handleSuccess(res) {
      this.currentNo = res.data
    }
  }
}
</script>
