<template>
  <div>
    <el-dialog :title="addData.title" :visible.sync="addData.dialog" width="50%" v-if="addData.dialog" append-to-body>
      <div>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
          <basic-form-item label="卷类型" prop="catalog" validate="required">
            <el-select v-model="addData.data.catalog" @change="setCatelog" :disabled="addData.title === '编辑磁盘' && addData.data.catalog === 'root'">
              <el-option label="根" value="root" v-if="addData.title === '编辑磁盘'"></el-option>
              <el-option label="EBS" value="EBS"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="设备：" prop="device" validate="required">
            <el-select v-model="addData.data.device" :disabled="addData.title === '编辑磁盘' && addData.data.catalog === 'root'">
              <el-option label="/dev/xvda" value="/dev/xvda" v-if="addData.data.catalog === 'root'"></el-option>
              <template v-if="addData.data.catalog === 'EBS'">
                <!--<el-option label="/dev/sdb" value="/dev/sdb"></el-option>
                            <el-option label="/dev/sdc" value="/dev/sdc"></el-option>
                            <el-option label="/dev/sdd" value="/dev/sdd"></el-option>
                            <el-option label="/dev/sde" value="/dev/sde"></el-option>
                            <el-option label="/dev/sdf" value="/dev/sdf"></el-option>
                            <el-option label="/dev/sdg" value="/dev/sdg"></el-option>
                            <el-option label="/dev/sdh" value="/dev/sdh"></el-option>
                            <el-option label="/dev/sdi" value="/dev/sdi"></el-option>
                            <el-option label="/dev/sdj" value="/dev/sdj"></el-option>
                            <el-option label="/dev/sdk" value="/dev/sdk"></el-option>
                            <el-option label="/dev/sdl" value="/dev/sdl"></el-option>-->
                <el-option v-for="(item, index) in addData.deviceList" :key="`device-${index}`" :label="item.name" :value="item.value"> </el-option>
              </template>
            </el-select>
          </basic-form-item>
          <basic-form-item label="类别：" prop="category" validate="required">
            <el-select v-model="addData.data.category" placeholder="请先选择磁盘类别" @change="sizeChange">
              <template v-if="addData.data.catalog === 'root'">
                <el-option v-for="item in categoryData" :label="item.name" :value="item.value" :key="item.value"></el-option>
              </template>
              <template v-if="addData.data.catalog === 'EBS'">
                <el-option v-for="item in categoryDatas" :label="item.name" :value="item.value" :key="item.value"></el-option>
              </template>
            </el-select>
          </basic-form-item>
          <basic-form-item label="大小（GB）：" prop="size" validate="required">
            <el-input-number size="medium" v-model="addData.data.size" :min="addData.data.size" :max="32768" v-if="addData.data.catalog === 'root'"> </el-input-number>
            <el-input-number size="medium" v-model="addData.data.size" :min="0" :max="32768" v-if="addData.data.catalog === 'EBS'"> </el-input-number>
          </basic-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="back">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
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
    },
    networkList: {
      type: Array
    },
    xvda: {
      type: Boolean
    }
  },
  data() {
    return {
      categoryDatas: [
        {
          name: '通用型 SSD',
          value: 'gp2',
          size: 1
        },
        {
          name: '预配置 IOPS SSD',
          value: 'io1',
          size: 4
        },
        {
          name: 'Cold HDD',
          value: 'sc1',
          size: 500
        },
        {
          name: '吞吐优化 HDD',
          value: 'st1',
          size: 500
        },
        {
          name: '磁介质',
          value: 'standard',
          size: 1
        }
      ],
      categoryData: [
        {
          name: '通用型 SSD',
          value: 'gp2',
          size: 1
        },
        {
          name: '预配置 IOPS SSD',
          value: 'io1',
          size: 4
        },
        {
          name: '磁介质',
          value: 'standard',
          size: 1
        }
      ],
      sizeData: {
        gp2: 20,
        io1: 40,
        sc1: 500,
        st1: 500,
        standard: 1
      },
      regionList: [],
      minSize: 20
    }
  },
  methods: {
    setCatelog() {},
    back() {
      if (this.addData.title == '编辑磁盘' && this.xvda) this.$emit('back')
      this.addData.dialog = false
    },
    sizeChange() {
      this.minSize = this.sizeData[this.addData.data.category]
      this.addData.data.size = this.sizeData[this.addData.data.category]
    },
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          this.$emit('ok', this.addData)
          this.addData.dialog = false
        }
      })
    }
  }
}
</script>

<style scoped>
.mine-text {
  font-size: 10px;
  color: #b4b4b4;
}
</style>
