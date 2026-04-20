<template>
  <el-dialog title="导入csv新增数据" :close-on-click-modal="false" :visible.sync="dialog.visible" width="550px">
    <el-alert title="" type="warning" :closable="false">
      <template slot="">
        <div class="text-center template-list">
          <p>您是否有标准的Excel模版，需要依照模版导入，否则会失败。还没有Excel模版?请下载模版:</p>
          <ol>
            <li><a class="text-info cur-point" @click="exportTemplate({ type: 'HUAWEI' })">华为云模板</a></li>
            <li><a class="text-info cur-point" @click="exportTemplate({ type: 'ALI' })">阿里云模版</a></li>
          </ol>
        </div>
      </template>
    </el-alert>
    <basic-form :model="importData" ref="importData" :inline="true">
      <basic-form-item label="账单来源：" prop="source" validate="required" required-message="请选择账单来源">
        <el-select v-model="importData.source" placeholder="请选择账单来源" style="width: 220px">
          <el-option v-for="item in platFormList" :key="item.label" :label="item.name" :value="item.label"> </el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="年月：" prop="month" validate="required" required-message="请选择账单时间">
        <el-date-picker @change="changeImport" v-model="importData.month" type="month" placeholder="选择年月"> </el-date-picker>
      </basic-form-item>
    </basic-form>
    <el-row>
      <el-col :span="24" class="text-center m-t">
        <span class="warning_info">上传之前,请先选择必选项!</span>
        <el-upload @click.native="uploadClick" :disabled="importData.month == ''" class="upload-demo" drag accept=".csv" :data="params" :on-error="handleError" :on-success="handleSuccess" action="/api/rms/v1/pc/bills/upload" :headers="headers">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传csv文件</div>
        </el-upload>
      </el-col>
    </el-row>
    <!-- <el-row v-if="currentNo">
      <el-col :sapn="24" class="text-center" v-show="importResult.fail != 'fail'">
        <div>
          <el-progress type="circle" :percentage="importResult.progress"></el-progress>
        </div>
        <span>成功：{{ importResult.success }}；失败：{{ importResult.fail }}；总数：{{ importResult.total }}</span>
      </el-col>
      <el-col :span="24" class="text-center" v-show="importResult.progress === 100">
        <div class="text-info" v-show="!importResult.fail">
          <Icon type=" icon-ok" />
          恭喜您成功导入数据
        </div>
        <div class="text-danger" v-show="importResult.fail">
          <span v-show="importResult.fail != 'fail'"> <Icon type=" icon-icon-31" />很遗憾，导入失败 </span>
          <span v-show="importResult.fail == 'fail'"> <Icon type=" icon-icon-31" />导入模板不合法 </span>
        </div>
      </el-col>
    </el-row> -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="clear">关闭</el-button>
    </div>
  </el-dialog>
</template>
<script>
import webSocket from '@/common/mixins/webSocket'
import { downloadFile } from 'utils'
import { getToken } from 'utils/auth'
import dayjs from 'utils/day'
import { exportBillTemplate } from 'services/platform/index'

export default {
  mixins: [webSocket],
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      importData: {
        source: 'ALI',
        month: ''
      },
      platFormList: [
        {
          name: '阿里云',
          label: 'ALI'
        },
        {
          name: '华为云',
          label: 'HUAWEI'
        }
      ],
      monthList: [
        {
          name: '一月',
          label: '1'
        },
        {
          name: '二月',
          label: '2'
        },
        {
          name: '三月',
          label: '3'
        },
        {
          name: '四月',
          label: '4'
        },
        {
          name: '五月',
          label: '5'
        },
        {
          name: '六月',
          label: '6'
        },
        {
          name: '七月',
          label: '7'
        },
        {
          name: '八月',
          label: '8'
        },
        {
          name: '九月',
          label: '9'
        },
        {
          name: '十月',
          label: '10'
        },
        {
          name: '十一月',
          label: '11'
        },
        {
          name: '十二月',
          label: '12'
        }
      ],
      socket: '',
      currentNo: '',
      importResult: {},
      headers: { token: getToken() },
      params: {}
    }
  },
  created() {
    // socket.Init(this.onMessage);
  },
  beforeDestroy() {
    // socket.Destroy();
  },
  methods: {
    uploadClick() {
      if (this.importData.month == '') {
        this.$message.warning('请先选择必选项!')
      }
    },
    clear() {
      this.dialog.visible = false
      this.$emit('importClear')
    },
    changeImport() {
      this.params.source = this.importData.source
      this.params.year = dayjs(this.importData.month).format('YYYY')
      this.params.month = dayjs(this.importData.month).format('MM')
    },
    // onmessage(data) {
    //   if (data.operate === 'BILLIMPORT' && data.data.uuid == this.currentNo) {
    //     this.importResult = data.data
    //   }
    // },
    // 导出数据
    exportData() {
      const params = JSON.stringify([{ param: { excelType: 2007 }, sign: 'EQ' }])
      downloadFile('/ims/v1/hosts', {
        condition: JSON.stringify({ condition: 'download' }),
        params
      })
    },
    exportTemplate(params) {
      exportBillTemplate(params)
    },
    // exportReason() {
    //   const params = JSON.stringify([{ param: { fileName: this.importResult.fileName }, sign: 'EQ' }])
    //   downloadFile('/ims/v1/hosts', {
    //     condition: JSON.stringify({ condition: 'download' }),
    //     params
    //   })
    // },
    // 数据导入成功回调
    handleSuccess(res) {
      this.currentNo = res.data
      this.importResult = res.data
      console.log(res)
      if (res.success) {
        this.$message.success(res.message)
        this.$emit('refresh')
        this.clear()
      }
      if (!res.success) {
        this.$message.warning(res.message)
      }
    },
    handleError(res) {
      console.log(res)
      // if (err) {
      //   this.$message.warning(res.message)
      // }
    }
  }
}
</script>
<style scoped lang="scss">
.warning_info {
  color: rgb(255, 147, 85);
  margin-bottom: 6px;
  display: block;
  margin-top: -20px;
}
.el-alert {
  margin-bottom: 20px;
}
.template-list {
  text-align: left !important;
  li {
    margin-top: 10px;
  }
}
</style>
