<template>
  <div>
    <el-dialog title="新增磁盘" :visible.sync="config.visible" width="800px">
      <basic-form label-width="0px" :model="config.data" ref="data">
        <basic-form-item>
          <el-row>
            <el-col :span="24" v-for="(cell, index) in disks" :key="index" class="m-t">
              <el-button v-if="disks.length > 1" class="m-l-sm" type="danger" icon="el-icon-delete" @click="removeItem(index)"></el-button>
              <el-select v-model="cell.categoryId" @change="getSku(cell)" class="w m-r-xs m-l-xs">
                <el-option :label="item.name" v-for="(item, index) in categoryList" :key="index" :value="item.id"></el-option>
              </el-select>
              <el-input-number type="number" v-model="cell.insAmount" :min="cell.min" :max="cell.max" :precision="0" :step="10"> </el-input-number> GB
              <!-- <el-checkbox class="m-l-xs" v-model="cell.createLvm">创建LVM</el-checkbox> -->
              <el-select v-if="cell.createLvm" v-model="cell.fileSystem" placeholder="文件系统" style="width: 200px">
                <el-option v-for="(item, index) in fileList" :key="index" :label="item.name" :value="item.value"></el-option>
              </el-select>
              <el-select v-if="cell.createLvm" class="m-l-md" v-model="cell.device" filterable allow-create default-first-option style="width: 200px" placeholder="挂载目录">
                <el-option v-for="(item, index) in cell.list" :key="index" :label="item.name" :value="item.value"> </el-option>
              </el-select>
              <el-checkbox v-model="cell.forceMount" v-if="cell.createLvm" class="m-l-md">强制挂载</el-checkbox>
            </el-col>
            <el-col :span="4" class="add-border m-t-md" @click.native="addItem()">
              <Icon type="icon-add"></Icon>
            </el-col>
          </el-row>
          <el-row></el-row>
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
import { getCategoriesByCode, getSkus, getPrices, modifyResourceEFC, getSkusDetail } from 'services/services/product'
import { formatEqParams } from 'utils/index'
import { getDict } from 'services/platform/index'
export default {
  props: {
    config: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      categoryList: [],
      disks: [],
      fileList: []
    }
  },
  computed: {
    itemData() {
      return this.config.data
    },
    categoryMap() {
      const map = {}
      this.categoryList.forEach(item => {
        map[item.id] = item
      })
      return map
    }
  },
  created() {
    this.getCategoryList()
    this.getDict()
  },
  methods: {
    getDict() {
      getDict({ value: 'FS_TYPE' }).then(data => {
        if (data.success) {
          this.fileList = data.data
        }
      })
    },
    // 获取服务类型
    getCategoryList() {
      getCategoriesByCode('vmware.storage.disk').then(data => {
        if (data.success) {
          if (!data.data.length) return this.$message.error('该服务不存在产品类型请检查')
          this.categoryList = data.data
          // 默认加一块盘进去
          this.addItem()
        }
      })
    },
    // 获取商品的sku
    getSku(item) {
      const { categoryId } = item
      this.loading = true
      getSkus(formatEqParams({ categoryId }))
        .then(data => {
          if (data.success) {
            if (!data.data.length) return this.$message.error('该产品类型下不存在产品，请检查')
            const cell = data.data[0]
            const [{ specValue: min }, { specValue: max }] = JSON.parse(cell.spec)
            item.skuId = cell.id
            item.min = Number(min)
            item.max = Number(max)
            this.getPrices(item)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 获取价格
    getPrices(item) {
      const { skuId, serviceCode } = item
      this.loading = true
      getPrices(formatEqParams({ skuId, period: this.itemData.expiredTime.indexOf('2099') > -1 ? 'Hour' : 'Month' }))
        .then(data => {
          if (data.success) {
            const list = data.data.rows
            if (!list.length) return this.$message.error('该产品没有设置价格，请检查')
            const { id: priceId } = list[0]
            item = Object.assign(item, {
              priceId
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    setDevice(value) {
      let flag = false
      // 数字不能开头
      // 不能是纯/ 也不能以/dev或者/boot开头
      const reg = /^[/a-zA-Z][a-zA-Z0-9_-]*$/
      if ((value == '/' || new RegExp('^/dev').test(value) || new RegExp('^/boot').test(value) || !reg.test(value)) && value) {
        flag = true
      }
      return flag
    },
    removeItem(index) {
      this.disks.splice(index, 1)
    },
    addItem() {
      if (this.disks.length === 4) return this.$message.error('数据盘最多可增加四个')
      const [{ id: categoryId }] = this.categoryList
      const ary = []
      this.disks.forEach(item => {
        if (!this.setDevice(item.device) && item.device != '') ary.push({ name: item.device, value: item.device })
      })
      const result = {
        skuId: 0,
        priceId: 0,
        serviceCode: 'vmware.storage.disk',
        categoryId,
        insAmount: 10,
        createLvm: false,
        device: '',
        forceMount: false,
        list: ary,
        diskType: this.diskType,
        fileSystem: this.fileList.length ? this.fileList[0].value : ''
      }
      this.getSku(result)
      this.disks.push(result)
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const { service, uuid: instance, skuId, priceId, specs } = this.itemData
          const obj = {
            service,
            instance,
            operation: 'AddDisk',
            upgrade: [],
            addDataDisks: []
          }
          this.disks.forEach(item => {
            const { priceId, skuId, insAmount: disk, categoryId, serviceCode, createLvm, device, forceMount, fileSystem } = item
            const category = this.categoryMap[categoryId].remark
            obj.upgrade.push({
              serviceCode,
              priceId,
              skuId,
              category,
              specs: [
                {
                  disk
                }
              ]
            })
            obj.addDataDisks.push({
              category,
              disk,
              createLvm,
              device,
              forceMount,
              fileSystem
            })
          })
          this.loading = true
          modifyResourceEFC(obj)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.config.visible = false
                // if (data.data) this.$router.push({ path: `/order/${data.data}` })
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.w {
  width: 100px !important;
}
.add-border {
  padding: 2px;
  cursor: pointer;
  border: 1px dashed black;
  text-align: center;
}
</style>
