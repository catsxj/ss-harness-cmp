<template>
  <el-card>
    <div slot="header">问题提报</div>
    <el-row>
      <basic-form :model="addData" ref="addForm" label-width="120px">
        <el-col :span="18">
          <el-col :span="24">
            <basic-form-item label="问题类别：" prop="catalog" validate="required">
              <el-select v-model="addData.catalog">
                <el-option :label="item.name" :value="item.name" v-for="(item, index) in catalogList" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="产品类别：" prop="resourceCatalog" validate="required">
              <el-select v-model="addData.resourceCatalog" @change="changeCategory">
                <el-option :label="item.name" :value="item.code" v-for="(item, index) in categoryData" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12" v-if="flag">
            <basic-form-item label="" prop="resourceCategory" validate="required">
              <el-select v-model="addData.resourceCategory">
                <el-option :label="item.name" :value="item.code" v-for="(item, index) in cloudServices" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="问题单号：" prop="instanceUuid" validate="required">
              <el-input placeholder="问题单号" v-model="addData.instanceUuid"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="问题标题：" prop="name" validate="required">
              <el-input placeholder="简单描述业务主题" v-model="addData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="详细描述：" prop="content" validate="required">
              <el-input type="textarea" placeholder="请具体描述你遇到的问题，以便我们能及时定位解决" v-model="addData.content"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="手机号码：" prop="phone" validate="required,mobile">
              <el-input placeholder="请填写手机号码" v-model="addData.phone" disabled></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="联系邮箱：" prop="email" validate="required,email">
              <el-input placeholder="请填写电子邮箱" v-model="addData.email" disabled></el-input>
            </basic-form-item>
          </el-col>
          <!-- <el-col :span="24">
            <basic-form-item label="问题提报时间：" prop="reportTime">
              <el-date-picker v-model="addData.reportTime" disabled
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="默认读取当前时间">
              </el-date-picker>
            </basic-form-item>
          </el-col> -->
          <el-col :span="24">
            <basic-form-item label="">
              <el-button type="ghost" @click="$router.go(-1)">取消</el-button>
              <el-button type="primary" @click="ok">确定</el-button>
            </basic-form-item>
          </el-col>
        </el-col>
      </basic-form>
    </el-row>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { modifyworkOrder, getworkOrderDetail } from 'services/system/workorder'
import categoryData from './categoryData'
export default {
  mixins: [webSocket],
  data() {
    return {
      list: [],
      categoryData,
      addData: {},
      cloudServices: [],
      catalogList: [{ name: '资源开通' }, { name: '订单问题' }, { name: '接口问题' }, { name: '使用问题' }],
      flag: false
    }
  },
  created() {
    getworkOrderDetail(this.$route.params.id).then(data => {
      this.addData = data.data
      this.changeCategory()
    })
  },
  methods: {
    onmessage(data) {},
    ok() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          modifyworkOrder({
            id: this.addData.id,
            catalog: this.addData.catalog,
            resourceCatalog: this.addData.resourceCatalog,
            resourceCategory: this.addData.resourceCategory,
            instanceUuid: this.addData.instanceUuid,
            name: this.addData.name,
            content: this.addData.content
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.$router.push({ name: 'WorkOrderList' })
            }
          })
        }
      })
    },
    changeCategory() {
      this.categoryData.forEach(item => {
        if (this.addData.resourceCatalog === item.code) {
          if (item.children) {
            this.cloudServices = item.children
            this.flag = true
          } else {
            this.flag = false
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
