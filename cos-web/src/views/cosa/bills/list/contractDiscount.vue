<template>
  <el-dialog title="资源池折扣配置" :visible.sync="dialog.visible" width="700px">
    <div>
      <el-alert style="margin-bottom: 10px" title="折扣配置后将重新计算当前列表过滤后的账单金额，请谨慎操作。" type="warning" :closable="false"> </el-alert>
      <el-button type="primary" @click="handleAdd" style="margin-bottom: 15px">新增</el-button>
      <basic-form :model="formData" ref="formData" :rules="formDataRules">
        <el-row :gutter="24" v-for="(item, ind) in formData.discountList" :key="ind">
          <el-col :span="5">
            <el-form-item :label="'资源池' + (ind + 1)" prop=""> </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="" :prop="`discountList.${ind}.poolId`" :rules="formDataRules.poolId">
              <el-select v-model="item.poolId" placeholder="请选择资源池" style="width: 100%">
                <el-option v-for="(pool, index) in poolList" :key="index" :label="pool.name" :value="pool.id" :disabled="formData.discountList.some((b) => b.poolId === pool.id)"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="" :prop="`discountList.${ind}.discount`" :rules="formDataRules.discount">
              <el-input-number v-model="item.discount" :min="0.01" :max="10" :step="0.1" :precision="2"></el-input-number>
              折
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button @click="removeBudgetItem(ind)">删除</el-button>
          </el-col>
        </el-row>
      </basic-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="dialog.visible = false">取 消</el-button>
      <el-button type="primary" @click="handleSure" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getDiscount, addDiscount } from 'services/services/bill'
import { getPool } from 'services/platform/pool'

export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      formData: {
        discountList: [{ poolId: '', discount: '' }]
      },
      formDataRules: {
        poolId: [{ required: true, message: '资源池不能为空', trigger: 'blur' }],
        discount: [{ required: true, message: '折扣系数不能为空', trigger: 'blur' }]
      },
      poolList: []
    }
  },
  created() {
    this.getDiscountList()
    this.getPoolList()
  },
  methods: {
    validateProductName(rule, value, callback) {
      const names = this.formData.discountList.map((item) => item.name)
      if (names.filter((name) => name === value).length > 1) {
        callback(new Error('产品类型名称不能相同'))
      } else {
        callback()
      }
    },
    handleSure() {
      this.$refs.formData.validate((valid) => {
        if (valid) {
          this.loading = true
          addDiscount(this.formData.discountList)
            .then((res) => {
              if (res.success) {
                this.$notify({
                  message: res.message,
                  type: 'success'
                })
                this.$emit('getList')
              }
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          return false
        }
      })
    },
    handleAdd() {
      this.formData.discountList.push({ poolId: '', discount: '' })
    },
    removeBudgetItem(index) {
      // if (this.formData.discountList.length > 1) {
      this.formData.discountList.splice(index, 1)
      // }
    },
    getDiscountList() {
      const params = {
        page: 1,
        rows: 9999
      }
      getDiscount(params).then((res) => {
        if (res.success) {
          this.formData.discountList = res.data.rows
          if (this.formData.discountList.length === 0) {
            this.formData.discountList.push({ poolId: '', discount: '' })
          }
        }
      })
    },
    getPoolList() {
      const params = {
        page: 1,
        rows: 9999
      }
      getPool(params).then((data) => {
        this.poolList = []
        if (data.success) {
          this.poolList = data.data.rows
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-form-item__content {
  margin-left: 0 !important;
}
</style>
