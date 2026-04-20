<template>
  <!-- TODO 修改 -->
  <el-dialog title="挂载磁盘" append-to-body :visible.sync="addData.dialog" width="900px">
    <basic-form :model="addDiskData" ref="data">
      <basic-form-item label="总线类型：">
        <el-select v-model="addDiskData.bus" clearable filterable>
          <el-option :key="index" v-for="(item, index) in busData" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="缓存方式：">
        <el-select v-model="addDiskData.cache" clearable filterable>
          <el-option :key="index" v-for="(item, index) in cacheData" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="存储池：" prop="pool" validate="required">
        <el-select clearable v-model="addDiskData.pool" placeholder="请选择存储池" filterable @change="getFileData">
          <el-option v-for="item in datastoresList" :key="item.id" :label="item.name" :value="{ name: item.name, value: item.storeVal }"> </el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="存储文件：">
        <basic-table :data="fileList" :params="paramsFile" :get-list="getFileData" :total="total" @selection-change="leftSelectionChange">
          <el-table-column type="selection" :selectable="selectAble" width="60"> </el-table-column>
          <el-table-column label="文件名称" prop="name" show-overflow-tooltip></el-table-column>
          <el-table-column prop="capacity" label="容量（GB）" show-overflow-tooltip>
            <!-- <template slot-scope="scope">
                {{ scope.row.capacity / 1024 / 1024 / 1024 }}
              </template> -->
          </el-table-column>
          <el-table-column prop="type" label="类型" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ typeMap[scope.row.type] }}
            </template>
          </el-table-column>
          <el-table-column prop="shareable" label="支持共享" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.shareable | isTrue }}
            </template>
          </el-table-column>
          <el-table-column prop="encrypt" label="是否加密" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.encrypt | isTrue }}
            </template>
          </el-table-column>
        </basic-table>
      </basic-form-item>
      <!-- <basic-form-item label="存储卷：">
          <basic-table :data="volumeList" :params="params" :get-list="getVolumeData" :total="total" @selection-change="leftSelectionChange">
            <el-table-column type="selection" :selectable="selectAble" width="60"> </el-table-column>
            <el-table-column label="磁盘名称" prop="name" show-overflow-tooltip></el-table-column>
            <el-table-column prop="dataStoreName" label="所属存储池" show-overflow-tooltip></el-table-column>
            <el-table-column prop="type" label="格式" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ typeMap[scope.row.type] }}
              </template>
            </el-table-column>
            <el-table-column prop="preallocation" label="置备类型" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ preallocationMap[scope.row.preallocation] }}
              </template>
            </el-table-column>
            <el-table-column prop="size" label="容量（GB）" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.size }}
              </template>
            </el-table-column>
            <el-table-column  prop="name" label="已用空间" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.allocation }}GB
        </template>
      </el-table-column> -->
      <!-- <el-table-column prop="serverName" label="使用者" show-overflow-tooltip></el-table-column>
          </basic-table>
        </basic-form-item> -->
    </basic-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
      <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getVolume, patchDisk, getDatastores, getCnTmpVolume } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object
    },
    oldLength: {
      type: Number
    }
  },
  data() {
    return {
      typeMap: {
        0: '其他(libvirt剩余的)',
        1: 'qcow2',
        2: 'raw',
        3: 'iso'
      },
      preallocationMap: {
        off: '精简置备',
        falloc: '厚置备延迟置零',
        full: '厚置备置零'
      },
      cacheData: [
        { id: 1, name: '直接读写' },
        { id: 2, name: '一级物理缓存' },
        { id: 3, name: '二级物理缓存' },
        { id: 4, name: '一级虚拟缓存' }
      ],
      busData: [
        { id: 1, name: '高速硬盘' },
        { id: 2, name: 'IDE硬盘' },
        { id: 3, name: 'SCSI硬盘' },
        { id: 4, name: 'SATA硬盘' },
        { id: 5, name: 'USB硬盘' }
      ],
      loading: false,
      addDiskData: {
        cache: 1,
        bus: 1,
        addDiskList: []
      },
      volumeList: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      selection: [],
      datastoresList: [],
      fileList: [],
      paramsFile: {
        page: 1,
        rows: 10
      }
    }
  },
  computed: {
    itemData() {
      return this.addData.data
    }
  },
  created() {
    this.getDatastore()
    // this.getVolumeData()
  },
  methods: {
    getDatastore() {
      getDatastores({ page: 1, rows: 9999, params: JSON.stringify([{ param: { vendorId: this.itemData.vendorId, vhostId: this.itemData.hostId }, sign: 'EQ' }]) }).then(data => {
        if (data.success) {
          this.datastoresList = data.data.rows
        }
      })
    },
    getFileData() {
      this.paramsFile.vendorId = this.itemData.vendorId
      this.paramsFile.poolId = this.addDiskData.pool.value
      getCnTmpVolume(this.paramsFile).then(data => {
        if (data.success) {
          this.fileList = data.data.rows
          this.total = data.data.total
        }
      })
    },
    // 获取数据存储数据
    getVolumeData() {
      const searchParam = [
        {
          param: {
            vendorId: this.itemData.vendorId
          },
          sign: 'EQ'
        },
        {
          param: {
            serverId: ''
          },
          sign: 'NUL'
        }
      ]
      this.params.params = JSON.stringify(searchParam)
      getVolume(this.params).then(data => {
        if (data.success) {
          this.volumeList = data.data.rows
          this.total = data.data.total
        }
      })
    },
    selectAble(row) {
      return !row.serverName
    },
    leftSelectionChange(selection) {
      this.selection = selection
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (!this.selection.length) this.$message.error('请选择存储卷！')
          const addDataDisks = this.selection.map(item => {
            const { id, name: oldVol } = item
            const { cache, bus } = this.addDiskData
            const oldPool = this.addDiskData.pool.name
            return { id, oldVol, oldPool, cache, bus }
          })
          const { serverId } = this.itemData
          const obj = {
            serverId,
            action: 'mount',
            addDataDisks
          }
          this.loading = true
          patchDisk(obj)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.addData.dialog = false
                this.$emit('back')
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
