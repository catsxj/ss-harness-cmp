<template>
  <div>
    <el-dialog title="调整配置" :visible.sync="addData.dialog" width="50%">
      <el-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
        <basic-form-item label="规格：" prop="skuName" validate="required">
          <el-select v-model="addData.data.skuName">
            <el-option v-for="(item, index) in specList" :key="index" :label="item.label" :value="item.value" :disabled="item.value.indexOf('Basic') > -1"></el-option>
          </el-select>
        </basic-form-item>
        <el-form-item label="详细规格：" required>
          <el-select v-model="sloId">
            <el-option v-for="(item, index) in sloList[addData.data.skuName]" :key="index" :label="item.skuFamily + item.value + item.content" :value="index"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { putRedisSet } from 'services/platform/azure'
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
      sloId: '',
      specList: [
        { label: '基本', value: 'Basic' },
        { label: '标准', value: 'Standard' },
        { label: '高级', value: 'Premium' }
      ],
      sloList: {
        Basic: [
          { skuName: 'Basic', skuFamily: 'C', value: 0, content: '(250 MB 缓存)', size: 250 },
          { skuName: 'Basic', skuFamily: 'C', value: 1, content: '(1 GB 缓存)', size: 1 },
          { skuName: 'Basic', skuFamily: 'C', value: 2, content: '(2.5 GB 缓存)', size: 2.5 },
          { skuName: 'Basic', skuFamily: 'C', value: 3, content: '(6 GB 缓存)', size: 6 },
          { skuName: 'Basic', skuFamily: 'C', value: 4, content: '(13 GB 缓存)', size: 13 },
          { skuName: 'Basic', skuFamily: 'C', value: 5, content: '(26 GB 缓存)', size: 26 },
          { skuName: 'Basic', skuFamily: 'C', value: 6, content: '(53 GB 缓存)', size: 53 }
        ],
        Standard: [
          { skuName: 'Standard', skuFamily: 'C', value: 0, content: '(250 MB 缓存, 复制)', size: 250 },
          { skuName: 'Standard', skuFamily: 'C', value: 1, content: '(1 GB 缓存 复制)', size: 1 },
          { skuName: 'Standard', skuFamily: 'C', value: 2, content: '(2.5 GB 缓存 复制)', size: 2.5 },
          { skuName: 'Standard', skuFamily: 'C', value: 3, content: '(6 GB 缓存 复制)', size: 6 },
          { skuName: 'Standard', skuFamily: 'C', value: 4, content: '(13 GB 缓存 复制)', size: 13 },
          { skuName: 'Standard', skuFamily: 'C', value: 5, content: '(26 GB 缓存 复制)', size: 26 },
          { skuName: 'Standard', skuFamily: 'C', value: 6, content: '(53 GB 缓存 复制)', size: 53 }
        ],
        Premium: [
          { skuName: 'Premium', skuFamily: 'P', value: 1, content: '(6 GB 缓存 复制)', size: 6 },
          { skuName: 'Premium', skuFamily: 'P', value: 2, content: '(13 GB 缓存 复制)', size: 13 },
          { skuName: 'Premium', skuFamily: 'P', value: 3, content: '(26 GB 缓存 复制)', size: 26 },
          { skuName: 'Premium', skuFamily: 'P', value: 4, content: '(53 GB 缓存 复制)', size: 53 },
          { skuName: 'Premium', skuFamily: 'P', value: 5, content: '(120 GB 缓存 复制)', size: 120 }
        ]
      },
      skuList: [
        { skuName: 'Basic', skuFamily: 'C', value: 0, content: '(250 MB 缓存)', size: 250 },
        { skuName: 'Basic', skuFamily: 'C', value: 1, content: '(1 GB 缓存)', size: 1 },
        { skuName: 'Basic', skuFamily: 'C', value: 2, content: '(2.5 GB 缓存)', size: 2.5 },
        { skuName: 'Basic', skuFamily: 'C', value: 3, content: '(6 GB 缓存)', size: 6 },
        { skuName: 'Basic', skuFamily: 'C', value: 4, content: '(13 GB 缓存)', size: 13 },
        { skuName: 'Basic', skuFamily: 'C', value: 5, content: '(26 GB 缓存)', size: 26 },
        { skuName: 'Basic', skuFamily: 'C', value: 6, content: '(53 GB 缓存)', size: 53 },
        { skuName: 'Standard', skuFamily: 'C', value: 0, content: '(250 MB 缓存, 复制)', size: 250 },
        { skuName: 'Standard', skuFamily: 'C', value: 1, content: '(1 GB 缓存 复制)', size: 1 },
        { skuName: 'Standard', skuFamily: 'C', value: 2, content: '(2.5 GB 缓存 复制)', size: 2.5 },
        { skuName: 'Standard', skuFamily: 'C', value: 3, content: '(6 GB 缓存 复制)', size: 6 },
        { skuName: 'Standard', skuFamily: 'C', value: 4, content: '(13 GB 缓存 复制)', size: 13 },
        { skuName: 'Standard', skuFamily: 'C', value: 5, content: '(26 GB 缓存 复制)', size: 26 },
        { skuName: 'Standard', skuFamily: 'C', value: 6, content: '(53 GB 缓存 复制)', size: 53 },
        { skuName: 'Premium', skuFamily: 'P', value: 1, content: '(6 GB 缓存 复制)', size: 6 },
        { skuName: 'Premium', skuFamily: 'P', value: 2, content: '(13 GB 缓存 复制)', size: 13 },
        { skuName: 'Premium', skuFamily: 'P', value: 3, content: '(26 GB 缓存 复制)', size: 26 },
        { skuName: 'Premium', skuFamily: 'P', value: 4, content: '(53 GB 缓存 复制)', size: 53 }
      ],
      filter: {
        Basic: '基本',
        Standard: '标准',
        Premium: '高级'
      },
      loading: false
    }
  },
  created() {
    this.sloList[this.addData.data.skuName].forEach((item, index) => {
      if (item.skuFamily == this.addData.data.skuFamily && item.value == this.addData.data.skuCapacity) {
        this.sloId = index
      }
    })
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          const obj = this.sloList[this.addData.data.skuName].find((item, index) => this.sloId == index)
          const params = {
            id: this.addData.data.id,
            skuName: obj.skuName,
            skuFamily: obj.skuFamily,
            skuCapacity: obj.value
          }
          putRedisSet(params).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style></style>
