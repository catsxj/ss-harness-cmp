/** * Created by Zhang Haijun on 2017/06/13. */
<template>
  <div>
    <el-form-item label="选择图标：" required>
      <img @click="selectIcon()" class="model-icon" :src="addData.icon || '/web-common-resource/img/default_cmdb.png'" alt="" />
    </el-form-item>
    <el-dialog title="选择图标" :close-on-click-modal="false" v-if="dialogFormVisible" :visible.sync="dialogFormVisible" width="800px" append-to-body>
      <el-row>
        <el-col :span="24">
          <el-alert title="提示" type="success" :closable="false">
            <template slot="">
              <span>没有您喜欢的图标，可以尝试上传一个新的图标。</span>
              <el-button type="primary" size="mini" class="cur-point" @click="imageCropperShow = true">上传</el-button>
            </template>
          </el-alert>
        </el-col>
        <image-cropper field="files" @crop-upload-success="imageUploaded" v-if="imageCropperShow" v-model="imageCropperShow" :width="size" :params="param" :height="size" :url="uploadUrl" img-format="png"></image-cropper>
        <el-col :span="24">
          <div class="icon-cell" v-for="item in list" :key="item.id" :class="{ selected: item.checked }" @click="selectItem(item)">
            <img :src="item.icon" alt="" />
            <i class="remove" v-show="!item.reserved" @click.stop="removeItem(item.id)">&times;</i>
            <span><i class="el-icon-check"></i></span>
          </div>
        </el-col>
        <el-col :span="24" class="m-t-sm">
          <el-pagination @size-change="handleSizeChange" @current-change="getList" :current-page.sync="params.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="params.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="save">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import ImageCropper from 'components/image-cropper/index.vue'

export default {
  components: {
    ImageCropper
  },
  props: {
    addData: {
      type: Object
    },
    getService: {},
    removeService: {},
    uploadUrl: {
      type: String
    },
    size: {
      type: Number,
      default: 65
    },
    param: {
      type: Object,
      default: function () {
        return {}
      }
    },
    isDisabled: {
      type: Boolean
    }
  },
  data() {
    return {
      dialogFormVisible: false,
      currentCell: {},
      list: [],
      total: 0,
      imageCropperShow: false,
      params: {
        page: 1,
        rows: 50,
        params: JSON.stringify([{ param: this.param, sign: 'EQ' }])
      }
    }
  },
  methods: {
    selectIcon() {
      if (this.isDisabled) return
      this.dialogFormVisible = true
      this.currentCell = {
        id: this.addData.iconId,
        icon: this.addData.icon
      }
      this.getList()
    },
    getList() {
      this.getService(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          if (this.currentCell.id) {
            this.list.forEach((item) => {
              if (item.id == this.currentCell.id) {
                this.$set(item, 'checked', true)
              }
            })
          }
          this.total = data.data.total
        }
      })
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getList()
    },
    // 选择图标
    selectItem(item) {
      if (item.checked) return
      this.list.forEach((row) => {
        this.$set(row, 'checked', false)
      })
      item.checked = true
      this.currentCell = item
    },
    // 删除图标
    removeItem(id) {
      this.$confirm('您确定要删除该图标吗?', '提示', {
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.removeService(id).then((data) => {
          if (data.success) {
            this.getList()
          }
        })
      })
    },
    imageUploaded(res) {
      if (res.success) {
        this.imageCropperShow = false
        this.getList()
      } else {
        this.$message.error(res.message)
      }
    },
    save() {
      if (!this.currentCell.id) return this.$message.error('请选择图标')
      this.$set(this.addData, 'iconId', this.currentCell.id)
      this.addData.icon = this.currentCell.icon
      this.dialogFormVisible = false
    }
  }
}
</script>
<style scoped>
.model-icon {
  width: 50px;
  height: 50px;
  cursor: pointer;
  margin-top: 5px;
}

div.icon-cell {
  position: relative;
  display: inline-block;
  width: 65px;
  height: 65px;
  border-radius: 10px;
  margin: 10px 10px 0 0;
  cursor: pointer;
}

div.icon-cell > span {
  display: none;
}

div.icon-cell.selected > span {
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  width: 65px;
  height: 65px;
  border: 1px dashed #8e7070;
  border-radius: 10px;
  line-height: 65px;
  background: rgba(0, 0, 0, 0.5);
  text-align: center;
  color: #fff;
}

div.icon-cell.selected i.el-icon-check {
  position: relative;
  left: 20px;
  top: 20px;
  color: #27c24c;
  font-size: 20px;
  font-weight: bold;
}

i.remove {
  display: none;
}

div.icon-cell:hover > i.remove {
  display: inline-block;
  position: absolute;
  top: -11px;
  right: -8px;
  color: #fff;
  text-align: center;
  background: rgba(0, 0, 0, 0.64);
  border-radius: 8px;
  font-size: 20px;
  font-style: normal;
  width: 16px;
  height: 16px;
  line-height: 16px;
  padding: -2px;
}

div.icon-cell img {
  width: 100%;
}
</style>
