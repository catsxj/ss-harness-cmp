<template>
  <el-dialog title="个人信息" ref="dialog" :close-on-click-modal="false" :visible.sync="visible">
    <basic-form :model="userData" ref="formRef" label-width="120px">
      <el-row :gutter="5">
        <el-col :span="10">
          <el-col :span="24">
            <div class="info-header-title">基本信息</div>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="登录账号：">
              <el-input v-model="userData.account" disabled></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="用户姓名：" prop="name" validate="required">
              <el-input v-model="userData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <div class="info-header-title">联系信息</div>
          </el-col>
          <el-col :span="24" v-if="userData.accountCategory === 'User'">
            <basic-form-item label="用户邮箱：" prop="email" validate="required,email">
              <el-input v-model="userData.email"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24" v-if="userData.accountCategory === 'Tenant'">
            <basic-form-item label="联系人邮箱：" prop="contactEmail" validate="required,email">
              <el-input v-model="userData.contactEmail"></el-input>
            </basic-form-item>
          </el-col>
          <template v-if="userData.accountCategory === 'User'">
            <el-col :span="24">
              <basic-form-item label="联系方式：" prop="mobile" validate="required,mobile">
                <el-input v-model="userData.mobile"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="24">
              <basic-form-item label="公司名称：">
                <el-input v-model="userData.company"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="24">
              <basic-form-item label="组织机构：">
                <el-input v-model="userData.departmentName" disabled></el-input>
              </basic-form-item>
            </el-col>
          </template>
        </el-col>
        <el-col :span="14">
          <div class="info-img">
            <img :src="userData.portrait" alt="" />
          </div>
          <div class="info-btn">
            <el-button icon="el-icon-upload2" @click="imageCropperShow = true">更换头像</el-button>
          </div>
        </el-col>
      </el-row>
    </basic-form>
    <image-cropper field="files" @crop-success="imageCropSuccess" v-if="imageCropperShow" v-model="imageCropperShow" :width="size" :height="size" img-format="png"></image-cropper>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="editSubmit">更新信息</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { Message } from 'element-ui'
import { cloneDeep } from 'lodash-es'
import ImageCropper from 'components/image-cropper/index.vue'
import { modifyUser } from 'services/system/manager'
import { modifyTenant } from 'services/system/tenant'
import { reactive, toRefs, ref } from '@vue/composition-api'
export default {
  props: {
    data: {
      type: Object
    }
  },
  components: {
    ImageCropper
  },
  setup(props, context) {
    const state = reactive({
      imageCropperShow: false,
      size: 65,
      visible: false,
      userData: {}
    })
    function open() {
      state.userData = cloneDeep(props.data)
      state.visible = true
    }
    function imageCropSuccess(imageDataUrl) {
      state.userData.portrait = imageDataUrl
    }
    const formRef = ref(null)
    function editSubmit() {
      formRef.value.validate(valid => {
        if (valid) {
          const http = state.userData.accountCategory === 'Tenant' ? modifyTenant : modifyUser
          http(state.userData).then(data => {
            if (data.success) {
              Message({
                message: data.message,
                type: 'success'
              })
              state.visible = false
              context.root.$store.dispatch('GetUserInfo')
            }
          })
        }
      })
    }
    return {
      ...toRefs(state),
      formRef,
      open,
      editSubmit,
      imageCropSuccess
    }
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
.info-header-title {
  padding-left: 10px;
  border-left: 3px solid #2d8cf0;
  margin-bottom: 20px;
}

.info-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 90px 0px 20px 100px;
  border: 1px solid #d9d9d9;
  margin-top: 40px;
}

.info-img img {
  width: 100%;
  height: 100%;
}

.info-btn {
  margin: 0px 0px 0px 100px;
}
</style>
