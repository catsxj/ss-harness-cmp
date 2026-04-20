<template>
  <div>
    <el-dialog title="磁盘扩容" :visible.sync="config.visible" width="50%">
      <basic-form label-width="120px" :model="config.data" ref="data">
        <div v-for="item in diskList" :key="item.uuid">
          <el-divider content-position="left">{{ item.name }}</el-divider>
          <basic-form-item label="磁盘类型：">{{ item.category | typeFilter }}</basic-form-item>
          <basic-form-item label="原有大小：">{{ item.size }} GB</basic-form-item>
          <basic-form-item label="扩容至：">
            <el-slider class="m-b" v-model="item.disk" :step="10" :min="item.size" :max="item.max" :marks="item.sliderMarks" show-input> </el-slider>
          </basic-form-item>
          <!-- <basic-form-item label="创建lvm：">
            <el-checkbox class="m-l-xs" v-model="item.createLvm"></el-checkbox>
          </basic-form-item> -->
          <el-form-item label="  ">
            <el-select v-if="item.createLvm" v-model="item.fileSystem" placeholder="文件系统" style="width: 200px">
              <el-option v-for="(item1, index) in fileList" :key="index" :label="item1.name" :value="item1.value"></el-option>
            </el-select>
            <el-input v-if="item.createLvm" class="m-l-md" v-model="item.device" style="width: 200px" placeholder="挂载目录"></el-input>
            <el-checkbox v-model="item.forceMount" v-if="item.createLvm" class="m-l-md">强制挂载</el-checkbox>
          </el-form-item>
        </div>
        <div v-if="!diskList.length">暂无可扩容磁盘</div>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="config.visible = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading" v-if="diskList.length">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { modifyResourceEFC, getSkusDetail } from 'services/services/product'
import { getVolume, getDict } from 'services/platform/index'
export default {
  props: {
    config: {
      type: Object
    }
  },
  filters: {
    typeFilter(value) {
      const map = {
        SAS: '容量型',
        SSD: '高性能型'
      }
      return map[value]
    }
  },
  data() {
    return {
      loading: false,
      diskList: [],
      fileList: [],
      skuId: ''
    }
  },
  computed: {
    itemData() {
      return this.config.data
    }
  },
  created() {
    this.getDisk()
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
    async getDisk() {
      const data = await getVolume({ condition: JSON.stringify({ condition: 'vmDisks', serverId: this.itemData.id }) })
      if (data.success) {
        this.diskList = data.data.map(item => {
          const { uuid, name, size, category, skuId, categoryId, fileSystem, lvmMntp, forceMount } = item
          const result = {
            uuid,
            name,
            size,
            category,
            disk: size,
            categoryId,
            skuId,
            max: 1024,
            sliderMarks: {},
            fileSystem,
            device: lvmMntp,
            forceMount,
            createLvm: fileSystem && lvmMntp
          }
          this.getSkuDetail(result)
          return result
        })
      }
    },
    async getSkuDetail(item) {
      const data = await getSkusDetail(item.skuId)
      if (data.success) {
        const spec = JSON.parse(data.data.spec)
        item.max = spec[1].specValue / 1
        item.sliderMarks = {
          [item.size]: `${item.size}GB`,
          [item.max]: `${item.max}GB`
        }
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const { service, uuid: instance, skuId, priceId, specs } = this.itemData
          const obj = {
            service,
            instance,
            operation: 'EditDisk',
            upgrade: [],
            editDataDisks: []
          }
          this.diskList.forEach(item => {
            const { uuid, skuId, disk, name, createLvm, forceMount, fileSystem, device } = item
            obj.upgrade.push({
              serviceCode: 'vmware.storage.disk',
              uuid,
              skuId,
              specs: [
                {
                  disk
                }
              ]
            })
            obj.editDataDisks.push({
              name,
              disk,
              createLvm,
              forceMount,
              fileSystem,
              device
            })
          })
          modifyResourceEFC(obj).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.config.visible = false
              // if (data.data) this.$router.push({ path: `/order/${data.data}` })
            }
          })
        }
      })
    }
  }
}
</script>

<style></style>
