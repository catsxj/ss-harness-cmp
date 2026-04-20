<template>
  <el-card class="box-card">
    <basic-form :model="form" label-width="110px">
      <el-row :gutter="10">
        <el-col :span="24">
          <basic-form-item label="数据库地址：" prop="url" validate="required" required-message="请输入数据库地址">
            <el-input v-model="form.url" clearable></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="数据库用户：" prop="user" validate="required" required-message="请输入数据库用户">
            <el-input v-model="form.user" clearable></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="数据库密码: " prop="pass" :validate="pwdRule" required-message="请输入数据库密码">
            <el-input v-model="form.pass" show-password auto-complete="off" clearable></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-button style="position: absolute; right: 20px" type="primary" @click="gotoMigration">迁移</el-button>
      </el-row>
    </basic-form>
    <AdvanceTable :style="{ marginTop: '20px' }" v-if="!detail.visible" :card-border="false" title="迁移记录列表" :show-tools="false" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #id="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="getStatus('color', status)">
          {{ getStatus('text', status) }}
        </status-icon>
      </template>
      <template #percent="val, record">
        <el-progress :percentage="getProgress(record)"></el-progress>
      </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.status !== 'FAILED'" @click="refreshItem(detail.id, record.id)">重试</el-button>
      </template>
    </AdvanceTable>
    <Detail v-if="detail.visible" :detail="detail" @goBack="detail.visible = false"></Detail>
  </el-card>
</template>

<script>
import { reactive, toRefs, computed, onBeforeUnmount } from '@vue/composition-api'
import { getMeta, migrationData, getMigrationData } from 'services/system/migration'
import crypto from 'utils/crypto'
import { Message } from 'element-ui'
import Detail from './detail.vue'
import { getStatus, columns } from './configs'

export default {
  components: {
    Detail
  },
  setup(props, context) {
    const state = reactive({
      form: {
        url: '',
        user: '',
        pass: ''
      },
      columns,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      loading: false,
      interNum: 0,
      detail: {
        visible: false
      }
    })

    const pwdRule = computed(() => {
      return context.root.$store.state.app.systemConfig.pwdStrength
    })

    const visible = computed(() => {
      return state.detail.visible
    })

    const _getMeta = async function () {
      const res = await getMeta()
      if (res.success) {
        state.form = {
          url: res.data.url,
          user: res.data.user,
          pass: crypto.decrypt(res.data.pass)
        }
      }
    }
    _getMeta()

    const gotoMigration = async function () {
      // 启动迁移
      const pass = crypto.encrypt(state.form.pass)
      const res = await migrationData({ ...state.form, pass })
      if (res.success) {
        Message.success(res.message)
        getList()
      }
    }
    const refresh = function () {
      state.interNum = setInterval(() => {
        if (!visible.value) {
          getList()
        }
      }, 5000)
    }

    const getList = async function () {
      console.log('page: ', state.params.page)
      state.loading = true
      const res = await getMigrationData(state.params)
      if (res.success) {
        state.list = res.data.rows
        state.total = res.data.total
      }
      state.loading = false
    }

    getList()

    refresh()

    const getDetail = function (record) {
      state.detail = {
        visible: true,
        ...Object.assign({}, record)
      }
    }

    const getProgress = function ({ totalCnt = 0, completeCnt = 0 }) {
      return ((completeCnt / totalCnt) * 100).toFixed(1) - 0
    }

    onBeforeUnmount(() => {
      clearInterval(state.interNum)
    })

    return {
      ...toRefs(state),
      getMeta,
      gotoMigration,
      getDetail,
      getProgress,
      getList,
      pwdRule,
      getStatus
    }
  }
}
</script>

<style scoped lang="scss"></style>
