<template>
  <div>
    <el-dialog title="绑定信息" append-to-body width="900px" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <basic-form :model="addData.data" status-icons ref="data" label-width="130px" class="demo-ruleForm">
        <el-row>
          <el-col :span="12" v-if="addData.isNeedvolumeId">
            <basic-form-item label="硬盘：" prop="volumeId" validate="required" required-message="请选择">
              <el-select v-model="addData.data.volumeId">
                <el-option v-for="(item, index) in volumeList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12" v-if="!addData.isNeedvolumeId">
            <basic-form-item label="云主机：" prop="serverId" validate="required" required-message="请选择">
              <el-select v-model="addData.data.serverId">
                <el-option v-for="(item, index) in vmList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="总线类型：" prop="pciType" validate="required" required-message="请选择">
              <el-select v-model="addData.data.pciType">
                <el-option v-for="(item, index) in pciTypeList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="磁盘IO模式：" prop="ioMode" validate="required" required-message="请选择">
              <el-select v-model="addData.data.ioMode">
                <el-option v-for="(item, index) in ioModeList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="磁盘访问权限：" prop="accessMode" validate="required" required-message="请选择">
              <el-select v-model="addData.data.accessMode" disabled>
                <el-option v-for="(item, index) in accessModeList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { patchVolume, getVolume, getVm } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      pciTypeList: [
        {
          name: 'VIRTIO',
          id: 'VIRTIO'
        },
        {
          name: 'SCSI',
          id: 'SCSI'
        }
      ],
      ioModeList: [
        {
          name: 'threads',
          id: 'threads'
        },
        {
          name: 'native',
          id: 'native'
        },
        {
          name: 'dataplane',
          id: 'dataplane'
        }
      ],
      accessModeList: [
        {
          name: '读写',
          id: 0
        },
        {
          name: '只读',
          id: 1
        }
      ],
      volumeIdList: [],
      volumeParam: {
        page: 1,
        rows: 9999
      },
      volumeList: [],
      vmList: [],
      vmParam: {
        page: 1,
        rows: 9999
      }
    }
  },
  methods: {
    getVolumeList() {
      this.volumeParam.params = JSON.stringify([
        {
          param: { vendorId: this.addData.vendorId, status: 'AVAILABLE' },
          sign: 'EQ'
        }
      ])
      getVolume(this.volumeParam).then(data => {
        if (data.success) {
          this.volumeList = data.data.rows
        }
      })
    },
    getVmList() {
      this.vmParam.params = JSON.stringify([
        {
          param: { vendorId: this.addData.vendorId, isTemplate: false },
          sign: 'EQ'
        }
      ])
      getVm(this.vmParam).then(data => {
        if (data.success) {
          this.vmList = data.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const { volumeId, serverId, pciType, ioMode, accessMode, id } = this.addData.data
          const obj = {
            id: volumeId,
            serverId: serverId || id,
            action: 'attach',
            pciType,
            ioMode,
            accessMode
          }
          patchVolume('attach', obj).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
            }
          })
        }
      })
    }
  },
  created() {
    if (this.addData.isNeedvolumeId) {
      this.getVolumeList()
    } else {
      this.getVmList()
    }
  }
}
</script>

<style></style>
