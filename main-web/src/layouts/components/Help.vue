<template>
  <a-dropdown>
    <span class="m-r">
      <QuestionCircleOutlined class="cur-point" />
    </span>
    <template #overlay>
      <a-menu>
        <!-- <router-link to="/personal/documents">
          <a-menu-item>帮助中心</a-menu-item>
        </router-link> -->
        <a-menu-item @click="visible = true">新手入门</a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <a-modal v-model:visible="visible" width="900px" :footer="null" wrapClassName="guid-modal">
    <div class="guid-wrapper">
      <div class="guid-title">新手指引</div>
      <div class="guid-desc">当前还没有资源接入，可按照下方新手指引完成接入和系统配置，此页面关闭后可在新手指引中查找</div>
      <div class="guid-content">
        <div class="guid-cell">
          <div class="system-title">管理端</div>
          <div class="guid-flow-wrapper">
            <div class="guid-flow" v-for="(item, key) in list" :key="key">
              <div class="guid-flow-item">
                <div class="guid-flow-item-number">{{ key + 1 }}</div>
                <span>{{ item }}</span>
              </div>
              <div class="guid-flow-line" v-if="key !== list.length - 1"></div>
            </div>
            <div class="guid-flow" v-for="(item, key) in list2" :key="key">
              <div class="guid-flow-item">
                <div class="guid-flow-item-number">{{ 6 - key }}</div>
                <span>{{ item }}</span>
              </div>
              <div class="guid-flow-line left" v-if="key !== list2.length - 1"></div>
            </div>
          </div>
          <div class="special-line">
            <div class="line-cover"></div>
          </div>
        </div>
        <div class="guid-cell">
          <div class="system-title">控制台</div>
          <div class="console-flow-item">
            <div class="console-bg"></div>
            <span class="console-text">一站式申请资源</span>
            <div class="console-flow-item-number">7</div>
          </div>
          <div class="special-line console">
            <div class="line-cover"></div>
          </div>
        </div>
      </div>
      <div class="guid-module">
        <div class="guid-module-cell" v-for="(item, index) in moduleList" :key="index" @click="goPage(item.path)">
          <svg-icon :icon-name="item.icon" class="icon"></svg-icon>
          <span class="name">{{ item.name }}</span>
          <RightOutlined />
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { ref, defineComponent } from 'vue'
import { RightOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { handleSearchParam } from 'utils/index'
import { getTrack } from 'services/manager'
export default defineComponent({
  components: { RightOutlined, QuestionCircleOutlined },
  setup() {
    const visible = ref(false)
    const store = useStore()
    ;(async function () {
      const res = await getTrack({
        simple: true,
        params: handleSearchParam({
          account: store.getters.userData.account
        })
      })
      if (res.data?.total === 1) {
        visible.value = true
      }
    })()

    const router = useRouter()
    function goPage(path: string) {
      visible.value = false
      router.push(path)
    }
    return {
      list: ['资源接入', '资源池', '作业编排'],
      list2: ['创建租户', '资源配置', '服务发布'],
      visible,
      moduleList: [
        {
          icon: 'svg-resource-manage',
          name: '资源纳管',
          path: '/cmp-web/vendors'
        },
        {
          icon: 'svg-service-ops',
          name: '服务运营',
          path: '/cos/products/catalogs'
        },
        {
          icon: 'svg-resource-monitor',
          name: '资源监控',
          path: '/cms-web/dashboard'
        },
        {
          icon: 'svg-ops-analysis',
          name: '运营分析',
          path: '/soa/resource/statistics'
        }
      ],
      goPage
    }
  }
})
</script>
<style lang="scss" scoped>
.guid-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 900px;
  height: 600px;
  box-sizing: border-box;
  padding: 43px 32px 28px 32px;
  .guid-title {
    width: 112px;
    font-size: 28px;
    font-weight: bold;
    color: #1b181c;
    line-height: 21px;
    margin-bottom: 19px;
  }
  .guid-desc {
    width: 560px;
    text-align: center;
    color: #3a3a3c;
    line-height: 30px;
    font-size: 20px;
    margin-bottom: 48px;
  }
  .guid-content {
    padding: 0 27px;
    width: 100%;
    .guid-cell {
      position: relative;
      display: flex;
      align-items: center;
    }
    .guid-flow-wrapper {
      display: flex;
      flex-wrap: wrap;
      margin-left: 62px;
      flex: 1;
      .guid-flow {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 22px;
      }
    }
    .guid-flow-item {
      position: relative;
      width: 143px;
      height: 57px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f2f4f8;
      border-radius: 16px;
      font-weight: 400;
      color: #3a3a3c;
      .guid-flow-item-number {
        position: absolute;
        top: 16px;
        text-align: center;
        left: -12px;
        width: 24px;
        color: #fff;
        height: 24px;
        line-height: 24px;
        border-radius: 12px;
        background: #1e54d5;
      }
    }
    .guid-flow-line {
      position: relative;
      width: 44px;
      box-sizing: border-box;
      border: 1px dashed #1e54d5;
      margin: 0 23px 0 11px;
      &::after {
        position: absolute;
        right: -10px;
        top: -5px;
        content: '';
        opacity: 1;
        border: 6px solid transparent;
        border-left-color: #1e54d5;
      }
      &.left::after {
        left: -10px;
        right: auto;
        border-left-color: transparent;
        border-right-color: #1e54d5;
      }
    }
    .console-flow-item {
      position: relative;
      margin-left: 92px;
      width: 530px;
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5faff;
      border-radius: 5px;
      .console-flow-item-number {
        position: absolute;
        top: 21px;
        text-align: center;
        left: -12px;
        width: 34px;
        color: #1e54d5;
        font-size: 21px;
        border: 1px solid #1e54d5;
        height: 34px;
        line-height: 34px;
        border-radius: 17px;
      }
      .console-text {
        position: absolute;
        font-weight: bold;
        color: #3a3a3c;
        font-size: 20px;
      }
      .console-bg {
        position: absolute;
        overflow: hidden;
        bottom: 10px;
        width: 530px;
        height: 65px;
        &::after {
          position: absolute;
          left: -135px;
          bottom: 0;
          content: '一站式申请资源';
          width: 800px;
          height: 800px;
          border-radius: 330px;
          background: #f0f7ff;
        }
      }
    }
  }
  .guid-module {
    display: flex;
    justify-content: space-between;
    margin-top: 75px;
    .guid-module-cell {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      cursor: pointer;
      color: #fff;
      width: 200px;
      height: 72px;
      opacity: 1;
      background: #4e7be9;
      border-radius: 4px;
      padding: 0 16px;
      &:not(:last-child) {
        margin-right: 12px;
      }
      &:nth-child(even) {
        background: #5ec4ec;
      }
      .icon {
        font-size: 41px;
      }
      .name {
        font-size: 16px;
        margin-left: 15px;
        margin-right: 6px;
      }
    }
  }
  .system-title {
    width: 119px;
    height: 57px;
    line-height: 57px;
    text-align: center;
    border-radius: 4px;
    border: 1px solid #1e54d5;
    font-weight: bold;
    color: #1e54d5;
    font-size: 16px;
  }
}
.special-line {
  position: absolute;
  right: -15px;
  top: 28px;
  width: 20px;
  height: 80px;
  border: 1px dashed #1e54d5;
  border-radius: 10px;
  border-left: transparent;
  &.console {
    transform: rotateY(180deg);
    left: 142px;
    top: -50px;
    height: 90px;
    right: auto;
    .line-cover {
      height: 91px;
    }
  }
  .line-cover {
    background: #fff;
    width: 15px;
    height: 81px;
    position: absolute;
    border-top: 1px dashed #1e54d5;
    border-bottom: 1px dashed #1e54d5;
    top: -1px;
    right: 8px;
    &::after {
      position: absolute;
      left: -7px;
      bottom: -6px;
      content: '';
      opacity: 1;
      border: 6px solid transparent;
      border-right-color: #1e54d5;
    }
  }
}
</style>
<style lang="scss">
.guid-modal {
  z-index: 99999;
  .ant-modal-body {
    padding: 0;
  }
}
</style>
