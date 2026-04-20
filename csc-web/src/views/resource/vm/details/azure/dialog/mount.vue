<template>
  <div>
    <el-dialog title="挂载" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-row>
        <basic-form label-width="120px" ref="data" :model="addData.data">
          <basic-form-item label="硬盘：" prop="id" :rules="[required]" required-message="请选择硬盘">
            <el-select v-model="addData.data.id">
              <el-option v-for="item in list" :key="item.id" :label="item.name + '(' + item.size + 'GB)'" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </basic-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getVolume, patchVolume } from 'services/platform/index'
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
    },
    vendorId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      list: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          patchVolume('attach', this.addData.data).then(data => {
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
    const params = JSON.stringify([
      {
        param: {
          vendorId: this.addData.vendorId,
          regionId: this.addData.regionId,
          azureResourceGroupName: this.addData.azureResourceGroupName,
          status: 'AVAILABLE'
        },
        sign: 'EQ'
      }
    ])
    getVolume({
      page: 1,
      rows: 9999,
      params: params
    }).then(data => {
      if (data.success) {
        this.list = data.data.rows.map(item => {
          return {
            ...item
          }
        })
      }
    })
  }
}
</script>

<style></style>
