<template>
  <full-screen-container :width="1920" :height="1080" :loading="loading">
    <Header title="/scr-web/static/img/dc_build/title.png"></Header>
      <div class="container">
    <div class="dc" :class="getWrapperClass(index)" v-for="(item, index) in dcList" :key="item.id" :style="item.config.position">
      <div class="animate-icon">
        <div class="big"></div>
        <div class="small"></div>
      </div>
      <div class="location-icon"></div>
      <div class="content">
        <div class="header">{{item.name}}</div>
        <div class="body">
          <div>
            <img :src="`/scr-web/static/img/dc_build/${item.config.logo}.png`" alt="" class="icon">
          </div>
          <div class="count-wrapper">
            <div class="count-item">
              <span class="count-label">物理机总数</span>
              <span class="count-value">{{item.pmCount}}(个)</span>
            </div>
            <div class="count-item">
              <span class="count-label">云主机总数</span>
              <span class="count-value">{{item.vmCount}}(个)</span>
            </div>
            <div class="count-item">
              <span class="count-label">存储总数</span>
              <span class="count-value">{{item.dsCount}}(个)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </full-screen-container>
</template>

<script setup lang="ts">
import Header from 'components/ScreenWrapper/Header.vue'
import { reactive, toRefs } from 'vue'
import { getDcs } from 'services/screen/dc'

interface DcConfig {
  position: Record<string, string>
  logo: string
}

interface DcItem {
  id: number
  name: string
  pmCount: number
  vmCount: number
  dsCount: number
  config: DcConfig
}

const state = reactive({
  dcList: [] as DcItem[],
  loading: true
})

const { dcList, loading } = toRefs(state)

const getDcList = async () => {
  const res = await getDcs()
  if (res.success) {
    state.dcList = res.data.rows.map((item: Record<string, unknown>) => {
      return {
        ...item,
        config: JSON.parse(item.config as string)
      }
    })
    state.loading = false
  }
}
getDcList()

const getWrapperClass = (index: number): string => {
  const colorArr = ['dc_orange', 'dc_green', 'dc_blue', 'dc_cyan']
  const key = index % 4
  return colorArr[key]
}
</script>
<style lang="scss" scoped>
@keyframes bg-animate {
  0% {
    background: url('/scr-web/static/img/dc_build/bg_light.png') no-repeat;
  }
  50% {
    background: url('/scr-web/static/img/dc_build/bg.png') no-repeat;
  }
  100% {
    background: url('/scr-web/static/img/dc_build/bg_light.png') no-repeat;
  }
}
.container {
  width: 100%;
  height: 100%;
  min-height: 700px;
  animation: bg-animate 3s infinite ease-in;
  background: url('/scr-web/static/img/dc_build/bg.jpg') no-repeat;
  background-size: 100% 100%;
  overflow: hidden;
  .dc {
    transform: scale(0.682, 0.7);
    position: absolute;
    width: 392px;
    height: 388px;
    background: url('/scr-web/static/img/dc_build/item_group.png') no-repeat;
    background-size: 100%;
    padding: 17px;
    box-sizing: border-box;
    @keyframes icon-animate {
      0% {
        opacity: 0.2;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.5);
      }
      100% {
        opacity: 0.2;
        transform: scale(1);
      }
    }
    .animate-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      left: 85px;
      bottom: 25px;
      transform: rotateX(60deg);
      .small {
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 1px solid #fab40f;
        background: #9bbaaa;
      }
      .big {
        animation: icon-animate 1.3s infinite linear;
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #7594a3;
        border: 1px solid #f1b643;
      }
    }
    .location-icon {
      position: absolute;
      bottom: 20px;
      left: 66px;
      width: 53px;
      height: 194px;
    }
    .header {
      color: #fff;
      font-size: 25px;
      height: 37px;
      line-height: 37px;
      padding: 3px 20px;
    }
    .content {
      z-index: 10;
    }
    .body {
      margin-top: 20px;
      display: flex;
      // justify-content: center;
      // align-items: center;
      .logo {
        width: 110px;
        height: 90px;
      }
      .count-wrapper {
        font-size: 20px;
        flex: 1;
        margin-left: 20px;
        .count-item {
          margin-bottom: 15px;
          display: flex;
        }
        .count-label {
          width: 120px;
          color: rgba(255, 255, 255, 0.8);
        }
        .count-value {
          color: #ffffff;
          font-weight: bold;
          flex: 1;
          text-align: right;
        }
      }
    }
  }
  .dc_orange {
    top: 473px;
    left: 436px;
    .location-icon {
      background: url('/scr-web/static/img/dc_build/location_orange.png');
    }
  }
  .dc_green {
    .location-icon {
      background: url('/scr-web/static/img/dc_build/location_green.png');
    }
    .animate-icon {
      .small {
        border: 1px solid #00e026;
        background: #23c1c8;
      }
      .big {
        background: #14aec2;
        border: 1px solid #19d943;
      }
    }
  }
  .dc_blue {
    .location-icon {
      background: url('/scr-web/static/img/dc_build/location_blue.png');
    }
    .animate-icon {
      .small {
        border: 1px solid #0012ff;
        background: #03afee;
      }
      .big {
        background: #039de7;
        border: 1px solid #141bac;
      }
    }
  }
  .dc_cyan {
    .location-icon {
      background: url('/scr-web/static/img/dc_build/location_cyan.png');
    }
    .animate-icon {
      .small {
        border: 1px solid #01fafd;
        background: #04b8d7;
      }
      .big {
        background: #04a4c7;
        border: 1px solid #01f5f8;
      }
    }
  }
}
</style>
