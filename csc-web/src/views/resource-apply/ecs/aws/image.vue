<template>
  <el-col :span="24">
    <basic-form-item label="镜像：" validate="required">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="searchData.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchData.type">
            <el-option v-for="(item, index) in typeList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchData.osType" clearable>
            <el-option v-for="(item, index) in osTypeList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchData.architecture" clearable>
            <el-option v-for="(item, index) in architectureList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="hendleSearch">搜索</el-button>
        </el-form-item>
        <el-table :data="imageList" highlight-current-row tooltip-effect="dark" stripe border fit>
          <template slot="empty"> 请选择地域 </template>
          <el-table-column label="镜像名称">
            <template slot-scope="scope">
              <el-radio :label="scope.row.id" v-model="addData.imageId">
                {{ scope.row.name }}
              </el-radio>
            </template>
          </el-table-column>
          <el-table-column label="镜像ID" prop="imageUuid" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="status" label="状态" show-overflow-tooltip>
            <template slot-scope="scope">
              <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | openstackServer }}</status-icon>
            </template>
          </el-table-column>
          <el-table-column prop="regionName" label="可用区" show-overflow-tooltip></el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination @size-change="handleChange" @current-change="getImageData" :current-page.sync="params.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="params.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
        </div>
      </el-form>
    </basic-form-item>
    <basic-form-item label="虚拟磁盘：">
      <DataDisk ref="disk" :image-data="imageList" :disk-id="addData.imageId" :parent-data="addData"></DataDisk>
    </basic-form-item>
  </el-col>
</template>

<script>
import { getImage } from 'services/platform/index'
import DataDisk from './addDisk/index.vue'
export default {
  components: { DataDisk },
  props: {
    addData: {
      type: Object
    },
    imageData: {
      type: Object,
      default: () => {
        return {
          rows: []
        }
      }
    },
    location: {
      type: Object
    },
    itemData: {
      type: [Object, Boolean]
    }
  },
  created() {
    this.hendleSearch()
  },
  data() {
    return {
      searchData: {
        type: 'PUBLIC',
        osType: '',
        architecture: ''
      },
      typeList: [
        {
          name: '公共镜像',
          value: 'PUBLIC'
        },
        {
          name: '私有镜像',
          value: 'PRIVATE'
        }
      ],
      architectureList: [
        {
          name: 'i386',
          value: 'i386'
        },
        {
          name: 'x86_64',
          value: 'x86_64'
        }
      ],
      osTypeList: [
        {
          name: 'kernel',
          value: 'kernel'
        },
        {
          name: 'machine',
          value: 'machine '
        }
      ],
      imageList: [],
      params: {
        page: 1,
        rows: 5
      },
      total: 0
    }
  },
  methods: {
    handleChange(val) {
      this.params.rows = val
      this.getImageData()
    },
    hendleSearch() {
      if (!this.location.region) return this.$message.error('请选择地域')
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.location.vendorId,
        imageType: this.searchData.type,
        regionId: this.location.region,
        architecture: this.searchData.architecture,
        osType: this.searchData.osType,
        status: 'ACTIVE',
        applyList: true,
        'name:lk': this.searchData.name
      })
      this.getImageData()
    },
    getImageData() {
      getImage(this.params).then(data => {
        if (data.success) {
          this.imageList = data.data.rows
          this.total = data.data.total
          this.$set(this.imageData, 'rows', data.data.rows)
          if (this.itemData && this.itemData.location.vendorId != this.location.vendorId) {
            this.$set(this.addData, 'imageId', '')
          }
        }
      })
    }
  },
  watch: {
    'location.vendorId': {
      handler(newVal) {
        this.hendleSearch()
      },
      deep: true
    }
  }
}
</script>

<style>
.powerLine {
  background-color: #d4d4d4;
  padding: 5px;
  margin-bottom: 10px;
  border-color: #cbcbcb;
  position: relative;
}

.powerLine .powerLineLeft {
  font-weight: bold;
}

.powerLine .powerLineRight {
  position: absolute;
  right: 10px;
  top: 5px;
  cursor: pointer;
}
</style>
