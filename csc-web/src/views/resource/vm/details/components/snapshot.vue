<template>
  <div>
    <el-card class="m-t" :body-style="{ padding: 0 }">
      <div slot="header" class="clearfix">
        <span>快照列表</span>
        <slot name="operate"></slot>
      </div>
      <basic-table v-if="detail.vendorType !== 'SANGFOR'" border :data="list" :params="params" :get-list="getSnapshot" :total="total" style="margin: 10px">
        <el-table-column prop="name" label="快照名称"> </el-table-column>
        <el-table-column label="状态" v-if="detail.vendorType !== 'INSPURRAIL'">
          <template slot-scope="scope">
            <status-icon :type="scope.row.statusColor">
              {{ scope.row.status1 }}
            </status-icon>
          </template>
        </el-table-column>
        <el-table-column prop="gmtCreate" label="创建时间">
          <template slot-scope="scope">
            {{ scope.row.createTime || scope.row.gmtCreate }}
          </template>
        </el-table-column>
        <slot name="el-table-column"></slot>
        <el-table-column prop="createTime" label="操作" width="160px">
          <template slot-scope="scope">
            <el-button type="text" @click="remove(scope.row)"> 删除 </el-button>
            <el-button type="text" v-if="detail.vendorType !== 'USPHERE'" @click="revert(scope.row)"> 恢复 </el-button>
          </template>
        </el-table-column>
      </basic-table>
      <basic-table v-else border :data="list" :params="params" :get-list="getSnapshot" :total="total" style="margin: 10px">
        <el-table-column prop="name" label="快照名称"> </el-table-column>
        <el-table-column prop="remark" label="描述"> </el-table-column>
        <el-table-column prop="size" label="大小">
          <template slot-scope="{ row }">
            <span>{{ row.size / 1024 }} MB</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="快照创建时间"> </el-table-column>
        <el-table-column label="操作" width="160px">
          <template slot-scope="scope">
            <el-button type="text" @click="remove(scope.row)"> <i class="el-icon-delete"></i> 删除 </el-button>
            <div class="action-divider"></div>
            <el-button type="text" @click="revert(scope.row)" :disabled="!['STOPPED', 'RUNNING'].includes(detail.status)"> 恢复 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </el-card>
    <el-dialog title="恢复" :visible.sync="dialogVisible" width="700px" append-to-body>
      <div>
        <h5>此操作将恢复该快照, 是否继续?</h5>
        <p><strong>· </strong>虚拟机将恢复到所选快照时间点的状态，请确保已对虚拟机的数据进行快照或备份，<strong style="color: red">否则未被保护的数据将会丢失</strong></p>
        <el-checkbox v-model="autoStartvm" label="恢复完成后自动开启虚拟机"></el-checkbox> <br />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sangforRevert">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSnapshot, removeSnapshot, patchSnapshot } from 'services/platform/index'
import '../index.scss'
export default {
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  computed: {},
  data() {
    return {
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      dialogVisible: false,
      autoStartvm: false,
      dialogId: null
    }
  },
  created() {
    this.getSnapshot()
  },
  methods: {
    getSnapshot(page) {
      this.params.page = page || this.params.page
      const eqParam = {
        param: {
          vmId: this.detail.id,
          vendorId: this.detail.vendorId
        },
        sign: 'EQ'
      }
      if (!['VMWARE', 'CECSTACK', 'INSPURRAIL', 'OPENSTACK', 'EASYSTACK', 'FUSIONSPHERE', 'SANGFOR'].includes(this.detail.vendorType)) {
        eqParam.param.snapshotType = 'VM'
      } else if (this.detail.vendorType === 'SANGFOR') {
        eqParam.param.snapshotType = 'vs'
      }
      this.params.params = JSON.stringify([eqParam])
      getSnapshot(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(item => {
            if (item.status == 'AVAILABLE') {
              item.status1 = '可用'
              item.statusColor = 'normal'
            } else if (item.status == 'available') {
              item.status1 = '可用'
              item.statusColor = 'normal'
            } else if (item.status == 'INAVAILABLE') {
              item.status1 = '不可用'
              item.statusColor = 'danger'
            } else if (item.status == 'creating') {
              item.status1 = '创建中'
              item.statusColor = 'info'
            } else if (item.status == 'resuming') {
              item.status1 = '恢复云主机中'
              item.statusColor = 'warning'
            } else if (item.status == 'RESTORING') {
              item.status1 = '恢复中'
              item.statusColor = 'warning'
            } else if (item.status == 'ready') {
              item.status1 = '创建成功'
              item.statusColor = 'success'
            } else if (item.status == 'deleting') {
              item.status1 = '删除中'
              item.statusColor = 'danger'
            }
          })
        }
      })
    },
    remove(data) {
      this.$confirm('此操作将永久删除该快照, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeSnapshot(data.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
          }
        })
      })
    },
    revert(data) {
      if (data.vendorType === 'SANGFOR') {
        this.dialogId = data.id
        this.dialogVisible = true
        return
      }
      this.$confirm('此操作将恢复该快照, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.confirmRevert({ id: data.id })
      })
    },
    sangforRevert() {
      if (this.detail.status === 'RUNNING') {
        this.$confirm('检测到当前云主机处于运行状态, 恢复时将被关机, 恢复完成后需要手动开机', '提示', {
          confirmButtonText: '立即恢复',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const { autoStartvm, dialogId } = this
          this.confirmRevert({ id: dialogId, autoStartvm, needCreateSnap: false })
        })
      } else {
        const { autoStartvm, dialogId } = this
        this.confirmRevert({ id: dialogId, autoStartvm, needCreateSnap: false })
      }
    },
    confirmRevert(params) {
      patchSnapshot('revert', params).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          if (this.dialogVisible) this.dialogVisible = !this.dialogVisible
          this.getSnapshot()
        }
      })
    }
  }
}
</script>
<style lang="scss"></style>
