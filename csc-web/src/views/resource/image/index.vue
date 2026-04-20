<template>
  <el-card class="wrapper">
    <el-tabs v-model="searchData.vendorType" @tab-click="handleSearch">
      <el-tab-pane v-for="(item, index) in typelist" :label="item | vendorName" :name="item" :key="index"> </el-tab-pane>
    </el-tabs>
    <div>
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="add" v-if="['ALIYUN', 'AWS', 'HUAWEI', 'TENCENT'].indexOf(searchData.vendorType) > -1">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-input class="search-item" placeholder="名称" v-model="searchData.name"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="imageData" :params="params" :get-list="getData" :total="total">
        <el-table-column label="镜像名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" @click="getDetail(scope.row.id)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.statusColor">{{ scope.row.status1 }}</status-icon>
          </template>
        </el-table-column>
        <el-table-column prop="vendorName" label="所属云平台" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="220px" align="center">
          <template slot-scope="scope">
            <el-button type="text" :disabled="scope.row.status == 'BUILDING'" @click="dropdownClick({ row: scope.row, index: 2 })"> <i class="el-icon-delete"></i> 删除 </el-button>
            <!-- <div class="action-divider"></div>
            <el-button  type="text" @click="download(scope.row)" v-if="scope.row.vendorType == 'OPENSTACK'">
              下载
            </el-button>
            <div class="action-divider"></div>
            <el-button :disbaled="scope.row.disbaled" type="text" @click="dropdownClick({'row':scope.row,index:3})">
              <i class="el-icon-delete"></i> 延期
            </el-button> -->
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <!--镜像详情-->
    <common-detail-right v-if="detaildialogVisible" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="镜像名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="镜像状态">
          <status-icon :type="detail.status | vmStatusColor">{{ detail.status | openstackServer }}</status-icon>
        </common-detail-item>
        <common-detail-item label="操作系统">{{ detail.osName }}</common-detail-item>
        <common-detail-item label="镜像格式">{{ detail.osType }}</common-detail-item>
        <common-detail-item label="系统版本">{{ detail.osVersion }}</common-detail-item>
        <common-detail-item label="镜像大小">{{ detail.size }}GB</common-detail-item>
        <common-detail-item label="所属地域">{{ detail.regionName }}</common-detail-item>
      </template>
    </common-detail-right>

    <!--延期-->
    <el-dialog title="延期" :close-on-click-modal="false" v-if="dialogFormtimeVisible" :visible.sync="dialogFormtimeVisible">
      <el-form :model="addDatatime" label-width="100px" ref="addDatatime">
        <el-row>
          <basic-form-item label="时长(月)：" prop="months" validate="required" required-message="请输入时长">
            <el-input-number v-model="addDatatime.months" :max="100" :min="1" style="width: 100%"></el-input-number>
          </basic-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogFormtimeVisible = false">取消</el-button>
        <el-button type="primary" @click.native="timeSubmit">确定</el-button>
      </div>
    </el-dialog>
    <add :add-data="addData" v-if="addData.dialog" :vendorType="searchData.vendorType"></add>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { isTrue } from 'filters'
import { getImage, removeImage, detailImage, updateImageTime, conditionService } from 'services/platform/index'
import { downloadFile } from 'utils'
import add from './add/index.vue'
const detailSetting = {
  type: 'host',
  columns: [
    [
      { name: '镜像名称', value: 'name' },
      { name: '镜像状态', value: 'status1' },
      { name: '云平台', value: 'vendorName' }
    ],
    [
      { name: '系统类别', value: 'osCategory' },
      { name: '系统名称', value: 'osName' },
      { name: '镜像格式', value: 'osType' }
    ],
    [
      { name: '已安装QEMU-GA', value: 'qgaInstalled', filter: isTrue },
      {
        name: '最小磁盘',
        value: 'minDisk',
        unit: 'GB'
      },
      { name: '描述', value: 'remark' }
    ]
  ]
}
export default {
  components: { add },
  mixins: [webSocket],
  data() {
    return {
      detailSetting,
      addDatatime: {},
      dialogFormtimeVisible: false,
      detaildialogVisible: false,
      detail: {},
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      imageData: [],
      total: 0,
      typelist: [],
      addData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    add() {
      this.addData = {
        dialog: true,
        data: {}
      }
    },
    download(data) {
      downloadFile(`/ims/v1/images/${data.id}/files`)
    },
    goBack() {
      this.detaildialogVisible = false
    },
    getDetail(id) {
      this.detaildialogVisible = true
      detailImage(id).then(data => {
        if (data.success) {
          this.detail = data.data
          if (this.detail.status == 'QUEUED') {
            this.detail.status1 = '排队中'
            this.detail.statusColor = '#f7ba2a'
          } else if (this.detail.status == 'ACTIVE') {
            this.detail.status1 = '运行中'
            this.detail.statusColor = '#20a0ff'
          } else if (this.detail.status == 'DELETED') {
            this.detail.status1 = '已删除'
            this.detail.statusColor = '#ff4949'
          } else if (this.detail.status == 'BUILDING') {
            this.detail.status1 = '制作中'
            this.detail.statusColor = '#f7ba2a'
          } else {
            this.detail.status1 = '异常'
            this.detail.statusColor = '#ff4949'
          }
        }
      })
    },
    getData() {
      getImage(this.params).then(data => {
        if (data.success) {
          this.imageData = data.data.rows
          this.imageData.forEach(data => {
            if (data.tenantId) data.disbaled = true
            switch (data.status) {
              case 'QUEUED':
                data.status1 = '排队中'
                data.statusColor = 'normal'
                break
              case 'BUILDING':
                data.status1 = '制作中'
                data.statusColor = 'normal'
                break
              case 'DELETED':
                data.status1 = '已删除'
                data.statusColor = 'error'
                break
              case 'ERROR':
                data.status1 = '异常'
                data.statusColor = 'danger'
                break
              default:
                data.status1 = '运行中'
                data.statusColor = 'success'
                break
            }
          })
          this.total = data.data.total
          this.imageData.forEach(item => {
            const nowTime = new Date()
            const nowDate = nowTime.getTime()
            item.isExpired = false
            const expiredTimeDate = new Date(item.expiredTime).getTime()
            if (expiredTimeDate < nowDate) {
              item.isExpired = true
            }
          })
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.searchData.name,
        vendorType: this.searchData.vendorType
      })
      this.getData()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getData()
    },
    dropdownClick(command) {
      switch (command.index) {
        case 2:
          this.remove(command.row.id)
          break
        case 3:
          this.dialogFormtimeVisible = true
          this.addDatatime = {
            resId: command.row.id,
            vendorId: command.row.vendorId
          }
          break
      }
    },
    // 延迟
    timeSubmit() {
      this.$refs.addDatatime.validate(valid => {
        if (valid) {
          updateImageTime(this.addDatatime).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.dialogFormtimeVisible = false
              this.getData()
            }
          })
        }
      })
    },
    handleClose() {
      const list = ['addFlag', 'modifyFlag']
      for (let i = 0; i < list.length; i++) {
        if (this[list[i]]) {
          switch (list[i]) {
            case 'addFlag':
              this.cancel('addData', 'addFlag')
              break
            case 'modifyFlag':
              this.cancel('modifyData', 'modifyFlag')
              break
          }
        }
      }
    },
    remove(id) {
      this.$confirm('此操作将永久删除该镜像, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeImage(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
          }
        })
      })
    },
    cancel(formName, flag) {
      this[flag] = false
      this.$refs[formName].resetFields()
    },
    onmessage(data) {
      this.handleSearch()
    }
  },
  created() {
    conditionService('server').then(data => {
      if (data.success) {
        const showList = ['ALIYUN', 'HUAWEI', 'OPENSTACK', 'TENCENT', 'TCE', 'AWS', 'EASYSTACK']
        this.typelist = []
        data.data.forEach(item => {
          if (showList.indexOf(item) > -1) this.typelist.push(item)
        })
        this.searchData.vendorType = this.$route.query.vendorType || this.typelist[0]
        this.handleSearch()
      }
    })
  },
  mounted() {},
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
