<template>
  <div>
    <el-dialog title="资源升级" :visible.sync="config.visible" width="60%">
      <basic-form label-width="120px" :model="config.data" ref="data">
        <basic-form-item label="原有规格：">
          {{ `${itemData.cpu}C/${itemData.memory}GB/${itemData.systemDiskSize}GB` }}
        </basic-form-item>
        <basic-form-item label="实例规格：" validate="required">
          <sku-table :skus="specList">
            <el-table-column show-overflow-tooltip label="规格名称" prop="name">
              <template v-slot="scope">
                <el-radio :disabled="isDisabledSpec(scope.row)" v-model="itemData.skuId" :label="scope.row.id" @change="getPrices(scope.row)">{{ scope.row.name }}</el-radio>
              </template>
            </el-table-column>
          </sku-table>
        </basic-form-item>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="config.visible = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSkus, getPrices, modifyResourceEFC, getSkusDetail } from 'services/services/product'
export default {
  props: {
    config: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      specList: [],
      skuId: ''
    }
  },
  computed: {
    itemData() {
      return this.config.data
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      getSkus({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({ categoryId: this.itemData.categoryId })
      }).then(data => {
        if (data.success) {
          this.specList = data.data
          this.specList.forEach(item => {
            item.spec = JSON.parse(item.spec)
          })
        }
      })
    },
    // 是否禁用规格
    isDisabledSpec(data) {
      const [{ specValue: cpuc }, { specValue: memeoryc }, { specValue: diskc }] = data.spec
      const { cpu, memory, systemDiskSize } = this.itemData
      return cpuc < cpu || memeoryc < memory || diskc < systemDiskSize || (cpuc == cpu && (memeoryc == memory) & (diskc == systemDiskSize))
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (!this.itemData.skuId) return this.$message.error('请选择规格')
          const { service, uuid: instance, skuId, priceId, specs, name } = this.itemData
          const obj = {
            service,
            instance,
            name,
            operation: 'Upgrade',
            upgrade: [
              {
                serviceCode: service,
                skuId,
                priceId,
                specs
              }
            ]
          }
          modifyResourceEFC(obj).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.config.visible = false
              // if (data.data) this.$router.push({ path: `/order/${data.data}` })
            }
          })
        }
      })
    },
    getPrices(row) {
      this.loading = true
      getPrices({
        page: 1,
        rows: 1000,
        params: this.$tools.handleSearchParam({
          skuId: row.id,
          period: this.itemData.expiredTime.indexOf('2099') > -1 ? 'Hour' : 'Month'
        })
      }).then(data => {
        if (data.success) {
          this.itemData.specs = row.spec.map(item => {
            return {
              [item.specName]: item.specValue
            }
          })
          this.itemData.priceId = data.data.rows[0].id
        }
        this.loading = false
      })
    }
  }
}
</script>

<style></style>
