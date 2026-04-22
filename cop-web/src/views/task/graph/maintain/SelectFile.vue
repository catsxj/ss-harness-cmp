/**
* Created by Zhang Haijun on 2017/9/5.
*/
<template>
  <el-row :gutter="10">
    <el-col :span="24" v-if="!isPreview && !isTaskInstance">
      <el-form-item label="选择文件:" class="m-b-sm">
        <!--<el-button type="primary" size="small" class="pull-left upload-file-btn">-->
        <!--<Icon type="icon-fasongbendiwenjian"></Icon>-->
        <!--新增本地文件-->
        <!--<div id="btnFileUpload"><input type="file" name="file" multiple="multiple"></div>-->
        <!--</el-button>-->
        <el-button type="primary" size="small" class="pull-left" @click="selectFile" icon="el-icon-folder">新增服务器文件</el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item label="文件列表:">
        <smart-table :data="fileList">
          <el-table-column align="left" label="文件列表" prop="name" show-overflow-tooltip>
          </el-table-column>
          <!--<el-table-column  label="服务器地址">-->
          <!--<template slot-scope="scope">-->
          <!--<span v-if="scope.row.file">本地文件[{{scope.row.file.size/1024|numberFilter(2)}} KB]</span>-->
          <!--<span v-else>服务器地址</span>-->
          <!--</template>-->
          <!--</el-table-column>-->
          <!--<el-table-column  label="进度" width="300">-->
          <!--<template slot-scope="scope">-->
          <!--<el-progress v-if="scope.row.file" :percentage="scope.row.progress"></el-progress>-->
          <!--<span v-else>-</span>-->
          <!--</template>-->
          <!--</el-table-column>-->
          <!--<el-table-column  label="状态">-->
          <!--<template slot-scope="scope">-->
          <!--<span v-show="!scope.row.file" class="text-danger">-</span>-->
          <!--<span v-show="scope.row.isUploading">上传中...</span>-->
          <!--<span v-show="scope.row.isSuccess" class="text-success"><Icon type="icon-ok"></Icon>上传成功</span>-->
          <!--<span v-show="scope.row.isCancel" class="text-warning"><Icon type="icon-icon-31"></Icon>取消上传</span>-->
          <!--<span v-show="scope.row.isError" class="text-danger"><Icon type="icon-shibai"></Icon>上传失败</span>-->
          <!--</template>-->
          <!--</el-table-column>-->
          <el-table-column align="left" label="操作" width="220" v-if="!isPreview && !isTaskInstance">
            <template slot-scope="scope">
              <el-button v-show="scope.row.file" size="mini" type="primary" @click="checkSoft(scope.row)" :disabled="scope.row.isReady||scope.row.isSuccess||scope.row.isUploading">
                上传
              </el-button>
              <el-button v-show="scope.row.file" size="mini" type="danger" @click="delServer(scope.row.host)" :disabled="!scope.row.isUploading">
                取消
              </el-button>
              <el-button size="mini" type="danger" @click="delFile(scope.$index)" :disabled="isPreview">
                移除
              </el-button>
            </template>
          </el-table-column>
        </smart-table>
      </el-form-item>
    </el-col>
    <el-dialog title="文件列表" :close-on-click-modal="false" :visible.sync="dialogFileVisible" append-to-body v-if="dialogFileVisible">
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="文件名称" v-model="listQuery.name">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="list" ref="fileTable" :params="params" :get-list="getList" :total="total" @select="handleSelectItem" @select-all="handleSelectAll">
        <el-table-column type="selection" width="60">
        </el-table-column>
        <el-table-column label="文件名称" prop="name">
        </el-table-column>
        <el-table-column label="文件分组" prop="groupName">
        </el-table-column>
        <el-table-column label="文件路径" prop="path">
        </el-table-column>
      </basic-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogFileVisible = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>
<script>
import show from '../mixins/show';
import { getSoftwares, createSoftwares, removeSoftwares, getFileExists } from 'services/task/soft'
import uploadFile from 'utils/uploadFile'
import { last } from 'lodash-es'
export default {
  mixins: [show],
  props: {
    itemData: {
      type: Object
    }
  },
  data () {
    return {
      list: null,
      total: null,
      listQuery: {
        name: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      dialogFileVisible: false,
      groupOptions: '',
      selectList: [],
      fileList: [],
      pathList: [] // 记录选择文件路径
    }
  },
  watch: {
    fileList: {
      handler () {
        const arr = []
        this.itemData.source = ''
        this.fileList.forEach(item => {
          item.path && arr.push(item.path)
        })
        this.itemData.source = arr.join(',')
      },
      deep: true
    }
  },
  created () {
    this.initData()
  },
  // mounted () {
  //   const self = this
  //   document.getElementById('btnFileUpload').addEventListener('change', function (event) {
  //     const files = event.target.files
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i]
  //       if (/[\u4e00-\u9fa5\s]/.test(file.name)) {
  //         self.$message({
  //           message: '文件名不允许存在中文和空格',
  //           type: 'error'
  //         })
  //         continue
  //       }
  //       if (file.name.length > 64) {
  //         self.$message({
  //           message: '文件名称过长',
  //           type: 'error'
  //         })
  //         continue
  //       }
  //       const flag = self.fileList.some(function (item) {
  //         return file.name === item.name
  //       })
  //       if (flag) {
  //         self.$message({
  //           message: '文件名【' + file.name + '】已存在',
  //           type: 'error'
  //         })
  //         continue
  //       }
  //       const obj = {
  //         file: file,
  //         name: file.name,
  //         isUploading: false,
  //         isCancel: false,
  //         isReady: false,
  //         isSuccess: false,
  //         progress: 0,
  //         path: ''
  //       }
  //       self.fileList.push(obj)
  //     }
  //   })
  // },
  methods: {
    initData () {
      if (this.itemData.source) {
        this.itemData.source.split(',').forEach(item => {
          const cacheArr = item.split('/')
          const obj = {
            name: cacheArr[cacheArr.length - 1],
            path: item
          }
          this.fileList.push(obj)
        })
      }
    },
    // 检查软件是否存在
    checkSoft (item) {
      getFileExists(item.name).then(data => {
        if (data.success) {
          if (data.data) {
            this.$confirm('此文件已存在, 是否覆盖?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              item.fileId = data.data
              uploadFile(item)
            }).catch(() => {
            })
          } else {
            uploadFile(item, this.createFile)
          }
        }
      })
    },
    // 创建文件
    createFile (item) {
      createSoftwares({
        name: item.name,
        path: item.filePath
      }).then(data => {
        if (data.success) {
          item.path = data.data.path
        }
      })
    },
    // 上传成功后的处理
    uploadCallback (item) {
      if (item.fileId) {
        removeSoftwares(item.fileId).then(data => {
          if (data.success) {
            this.createFile(item)
          }
        })
      } else {
        this.createFile(item)
      }
    },
    selectFile () {
      // 初始化数据
      this.listQuery = {
        name: ''
      }
      this.params.page = 1
      this.dialogFileVisible = true
      this.selectList = [...this.fileList]
      this.handleSearch()
    },
    // 删除文件
    delFile (key) {
      this.fileList.splice(key, 1)
    },
    handleSelectItem (selection, row) {
      this.refreshPath()
      if (this.pathList.indexOf(row.path) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.path == row.path) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    handleSelectAll (selection) {
      this.refreshPath()
      if (selection.length) { // 全选情况下
        this.list.forEach(item => {
          if (this.pathList.indexOf(item.path) == -1) {
            this.selectList.push(item)
          }
        })
      } else { // 全不选情况下
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.path == row.path) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    refreshPath () {
      this.pathList = []
      this.selectList.forEach(item => {
        if (item.path) this.pathList.push(item.path)
      })
    },
    getList () {
      const self = this
      this.refreshPath()
      const handleData = function (data) {
        data.forEach(function (item) {
          if (self.pathList.indexOf(item.path) > -1) {
            self.$refs.fileTable.$refs.basicTable.toggleRowSelection(item, true)
          }
        })
      }
      getSoftwares(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          setTimeout(() => {
            handleData(this.list)
          })
        }
      })
    },
    handleSearch () {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        status: 'APPROVED',
        'name:LK': this.listQuery.name
      })
      this.getList()
    },
    ok () {
      this.refreshPath()
      const arr = [];
      let paths = ''
      this.fileList.forEach(item => {
        paths += item.path
      })
      this.selectList.forEach(item => {
        if (paths.indexOf(item.path) === -1) {
          item.name = last(item.path.split('/'))
          arr.push(item)
        }
      })
      this.fileList = this.fileList.concat(arr)
      this.dialogFileVisible = false
    }
  }
}
</script>
<style>
</style>
