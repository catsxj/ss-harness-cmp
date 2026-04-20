<template>
  <a-dropdown>
    <div class="user-content">
      <img :src="userData.portrait" class="head-portrait" />
      <span class="user-name">{{ userData.name }}</span>
      <DownOutlined />
    </div>
    <template #overlay>
      <a-menu class="user-dropdown">
        <a-menu-item @click="openInfoDialog" class="menu-item"> <UserOutlined /> 个人信息 </a-menu-item>
        <a-menu-item @click="openPwdDialog" class="menu-item"> <LockOutlined /> 修改密码 </a-menu-item>
        <a-menu-item @click="logoutSystem()" class="menu-item"> <PoweroffOutlined /> 退出系统 </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <a-modal title="修改密码" :maskClosable="false" width="600px" v-if="pwdDialogVisible" v-model:visible="pwdDialogVisible" @ok="modifyPwdSubmit" :confirmLoading="loading">
    <a-form :model="pwdData" ref="pwdRef" :colon="true" :labelCol="{ span: 4 }">
      <a-form-item label="原密码" name="oldPassword" :rules="[required]">
        <a-input-password v-model:value="pwdData.oldPassword" auto-complete="off"></a-input-password>
      </a-form-item>
      <a-form-item label="新密码" name="newPassword" :rules="pwdRule">
        <a-input-password v-model:value="pwdData.newPassword" auto-complete="off"></a-input-password>
      </a-form-item>
      <a-form-item label="确认密码" name="confirmPassword" :rules="pwdRule">
        <a-input-password v-model:value="pwdData.confirmPassword" auto-complete="off"></a-input-password>
      </a-form-item>
    </a-form>
  </a-modal>
  <InfoDialog ref="infoRef" :data="userData"></InfoDialog>
</template>
<script lang="ts">
import crypto from 'utils/crypto.js'
import { changePassword } from '@/services/manager'
import { logout } from 'services'
import InfoDialog from './InfoDialog.vue'
import { computed, defineComponent, ref, createVNode } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useStore } from 'vuex'
import { required, complexPassword } from '@/validate'
import { UserOutlined, PoweroffOutlined, LockOutlined, ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  components: { InfoDialog, UserOutlined, PoweroffOutlined, LockOutlined, DownOutlined },
  setup() {
    const store = useStore()
    // 密码修改
    const pwdData = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    const pwdDialogVisible = ref(false)
    function openPwdDialog() {
      pwdDialogVisible.value = true
      pwdData.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
    function checkPassword() {
      const { newPassword, oldPassword, confirmPassword } = pwdData.value
      if (newPassword === oldPassword) {
        message.error('新密码不能与原密码相同')
        return false
      }
      if (confirmPassword !== newPassword) {
        message.error('确认密码与新密码不一致')
        return false
      }

      return true
    }
    const pwdRef = ref()
    const loading = ref(false)
    async function modifyPwdSubmit() {
      try {
        const values = await pwdRef.value.validate()
        if (!checkPassword()) return
        loading.value = true
        const res = await changePassword(userData.value.id, {
          password: crypto.encrypt(values.newPassword),
          oldPassword: crypto.encrypt(values.oldPassword)
        })
        if (res.success) {
          pwdDialogVisible.value = false
          message.success(res.message)
          store.dispatch('permission/ResetRoutes')
        }
      } catch (error) {
        console.log(error)
      }
      loading.value = false
    }
    const userData = computed(() => store.getters.userData || {})
    const pwdRule = computed(() => {
      const rule = store.state.app.systemConfig.pwdStrength
      if (rule === 'required') return [required]
      return [required, complexPassword]
    })
    // 登出
    function logoutSystem() {
      Modal.confirm({
        title: '提示',
        icon: createVNode(ExclamationCircleOutlined),
        content: '您确定要退出该系统吗?',
        async onOk() {
          const res = await logout()
          if (res.success) {
            store.dispatch('permission/ResetRoutes')
          }
        }
      })
    }
    // 个人信息
    const infoRef = ref()
    function openInfoDialog() {
      infoRef.value.open()
    }
    return {
      loading,
      pwdData,
      pwdDialogVisible,
      pwdRef,
      pwdRule,
      openPwdDialog,
      modifyPwdSubmit,
      logoutSystem,
      infoRef,
      openInfoDialog,
      userData,
      required
    }
  }
})
</script>
<style lang="scss" scoped>
.user-content {
  margin-right: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  .head-portrait {
    display: inline-block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
}
.user-name {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  margin: 0 2px 0 5px;
}
.user-dropdown {
  background: #2c2e3b;
  border-color: #2c2e3b;
  ::v-deep(.ant-dropdown-menu-item) {
    color: #ccc;
    &:hover {
      background: #2d8cf0 !important;
      color: #fff;
    }
  }
}
</style>
