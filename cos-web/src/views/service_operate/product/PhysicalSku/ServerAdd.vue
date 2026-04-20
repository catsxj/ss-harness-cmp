<template>
  <el-dialog :title="addData.data.id ? '编辑服务器规格' : '新增服务器规格'" :close-on-click-modal="false" :visible.sync="addData.visible" width="900px" top="5vh">
    <basic-form :model="addData.data" ref="addData" inline label-width="160px">
      <basic-form-item label="规格名称：" prop="name" validate="required">
        <el-input class="w" v-model="addData.data.name"></el-input>
      </basic-form-item>
      <basic-form-item label="单价(元/天）：" prop="price" validate="required">
        <el-input-number class="w" v-model="addData.data.price" :min="0" :precision="5"> </el-input-number>
      </basic-form-item>
      <!-- 服务器信息 -->
      <CardLayout title="服务器信息">
        <basic-form-item label="型号：" prop="model" validate="required">
          <el-input class="w" v-model="addData.data.model"></el-input>
        </basic-form-item>
        <basic-form-item label="品牌：" prop="brandId" validate="required">
          <el-select class="w" v-model="addData.data.brandId" filterable>
            <el-option v-for="brand in brandList" :key="brand.id" :label="brand.name" :value="brand.id"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="PCI插槽数(个)：" prop="pciSlotCount" validate="required">
          <el-input-number class="w" v-model="addData.data.pciSlotCount" :min="1"></el-input-number>
        </basic-form-item>
        <basic-form-item label="U数：" prop="uCount" validate="required">
          <el-input-number class="w" v-model="addData.data.uCount" :min="1"></el-input-number>
        </basic-form-item>
        <basic-form-item label="硬盘槽位数(个)：" prop="diskSlotCount" validate="required">
          <el-input-number class="w" v-model="addData.data.diskSlotCount" :min="1"></el-input-number>
        </basic-form-item>
        <basic-form-item label="电源接口数(个)：" prop="powerInterfaceCount" validate="required">
          <el-input-number class="w" v-model="addData.data.powerInterfaceCount" :min="1"></el-input-number>
        </basic-form-item>
      </CardLayout>
      <!-- 基础配置 -->
      <CardLayout title="基础配置">
        <basic-form-item label="CPU规格配件名称：" prop="cpuSpecId" validate="required">
          <el-select class="w" v-model="addData.data.cpuSpecId" @change="handleCpuSpecChange" filterable>
            <el-option v-for="cpu in cpuSpecList" :key="cpu.id" :label="cpu.name" :value="cpu.id"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="CPU路数(个)：" prop="cpuSlotCount" validate="required">
          <el-input-number class="w" v-model="addData.data.cpuSlotCount" :min="1"> </el-input-number>
        </basic-form-item>
        <basic-form-item label="CPU数量：" prop="cpuNum">
          <el-input class="w" v-model="addData.data.cpuNum" disabled>
            <template slot="append">核</template>
          </el-input>
        </basic-form-item>
        <div></div>
        <basic-form-item label="内存规格配件名称：" prop="memSpecId" validate="required">
          <el-select class="w" v-model="addData.data.memSpecId" @change="handleMemorySpecChange" filterable>
            <el-option v-for="memory in memorySpecList" :key="memory.id" :label="memory.name" :value="memory.id"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="内存槽位(个)：" prop="memSlotCount" validate="required">
          <el-input-number class="w" v-model="addData.data.memSlotCount" :min="1"> </el-input-number>
        </basic-form-item>
        <basic-form-item label="内存数量：" prop="memSize">
          <el-input class="w" v-model="addData.data.memSize" disabled>
            <template slot="append">GB</template>
          </el-input>
        </basic-form-item>
      </CardLayout>
      <!-- 硬盘配置 -->
      <CardLayout title="硬盘配置">
        <div v-for="(disk, index) in addData.data.diskSpecIds" :key="index">
          <basic-form-item :label="index === 0 ? '硬盘规格配件名称：' : ' '">
            <div class="flex-center">
              <el-select v-model="disk.id" class="w m-r" filterable>
                <el-option v-for="diskSpec in diskSpecList" :key="diskSpec.id" :label="`${diskSpec.name} - ${diskSpec.diskType} - ${diskSpec.capacity}TB`" :value="diskSpec.id"> </el-option>
              </el-select>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDisk(index)">移除</el-button>
              <el-button type="primary" icon="el-icon-plus" size="mini" class="m-r" @click="addDisk" v-if="index === 0">增加</el-button>
            </div>
          </basic-form-item>
        </div>
        <el-button v-if="addData.data.diskSpecIds.length === 0" type="primary" icon="el-icon-plus" size="mini" class="m-r" @click="addDisk">增加</el-button>
      </CardLayout>
      <!-- 其他配件 -->
      <CardLayout title="其他配件">
        <div v-for="(part, index) in addData.data.partsSpecIds" :key="index + '其他配件'">
          <basic-form-item :label="index === 0 ? '配件类型：' : ' '">
            <div class="flex-center">
              <el-select class="w m-r" v-model="part.partType" @change="() => handlePartsTypeChange(index)" placeholder="请选择配件类型" filterable>
                <el-option v-for="type in Object.keys(partTypeMap)" :key="type" :label="type" :value="type"></el-option>
              </el-select>
              <el-select class="w m-r" v-model="part.id" placeholder="请选择配件名称" filterable>
                <el-option v-for="item in getPartsNames(part.partType)" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParts(index)">移除</el-button>
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="addParts" v-if="index === 0">增加</el-button>
            </div>
          </basic-form-item>
        </div>
        <el-button v-if="addData.data.partsSpecIds.length === 0" type="primary" icon="el-icon-plus" size="mini" @click="addParts">增加</el-button>
      </CardLayout>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="addData.visible = false">取消</el-button>
      <el-button type="primary" @click.native="handleSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createServer, modifyServer, getBrand, getCpuSpecs, getMemorySpecs, getDiskSpecs, getParts } from 'services/services/physicalSpec.js'

export default {
  props: {
    addData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      params: {
        page: 1,
        rows: 1000,
        params: JSON.stringify([{ param: { status: 1 }, sign: 'EQ' }])
      },
      loading: false,
      brandList: [],
      cpuSpecList: [],
      memorySpecList: [],
      diskSpecList: [],
      partsList: [],
      partTypeMap: {}
    }
  },
  created() {
    this.getBrandList()
    this.getCpuSpecList()
    this.getMemorySpecList()
    this.getDiskSpecList()
    this.getPartsList()
  },
  methods: {
    handleCpuSpecChange() {
      if (!this.addData.data.cpuSpecId) return
      this.addData.data.cpuNum = this.cpuSpecList.find((cpu) => cpu.id === this.addData.data.cpuSpecId).coreNum
    },
    handleMemorySpecChange() {
      if (!this.addData.data.memSpecId) return
      this.addData.data.memSize = this.memorySpecList.find((memory) => memory.id === this.addData.data.memSpecId).size
    },
    async getBrandList() {
      const data = await getBrand({ page: 1, rows: 1000 })
      if (!data.success) return
      this.brandList = data.data.rows
    },
    async getCpuSpecList() {
      const data = await getCpuSpecs(this.params)
      if (data.success) {
        this.cpuSpecList = data.data.rows
        this.handleCpuSpecChange()
      }
    },
    async getMemorySpecList() {
      const data = await getMemorySpecs(this.params)
      if (data.success) {
        this.memorySpecList = data.data.rows
        this.handleMemorySpecChange()
      }
    },
    async getDiskSpecList() {
      const data = await getDiskSpecs(this.params)
      if (data.success) {
        this.diskSpecList = data.data.rows
      }
    },
    async getPartsList() {
      const data = await getParts(this.params)
      if (data.success) {
        this.partsList = data.data.rows
        // 根据 partType 来分组
        this.partsList.forEach((part) => {
          if (!this.partTypeMap[part.partType]) {
            this.$set(this.partTypeMap, part.partType, [])
          }
          this.partTypeMap[part.partType].push(part)
        })
      }
    },
    async handlePartsTypeChange(index) {
      this.addData.data.partsSpecIds[index].id = ''
    },
    getPartsNames(type) {
      return this.partTypeMap[type] || []
    },
    addParts() {
      this.addData.data.partsSpecIds.push({ partType: '', id: '' })
    },
    removeParts(index) {
      this.addData.data.partsSpecIds.splice(index, 1)
    },
    addDisk() {
      this.addData.data.diskSpecIds.push({ id: '' })
    },
    removeDisk(index) {
      this.addData.data.diskSpecIds.splice(index, 1)
    },
    handleSubmit() {
      this.$refs.addData.validate(async (valid) => {
        if (valid) {
          const http = this.addData.data.id ? modifyServer : createServer
          this.loading = true
          const cloneData = JSON.parse(JSON.stringify(this.addData.data))
          cloneData.diskSpecIds = cloneData.diskSpecIds.map((disk) => disk.id)
          cloneData.partsSpecIds = cloneData.partsSpecIds.map((part) => part.id)
          const data = await http(cloneData).finally(() => (this.loading = false))
          if (!data.success) return
          this.$message.success(data.message)
          this.addData.visible = false
          this.$emit('success')
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
h3 {
  margin-top: 20px;
  margin-bottom: 10px;
}

.flex-center {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
