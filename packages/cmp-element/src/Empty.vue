<template>
  <div class="empty" role="status" aria-live="polite">
    <div class="empty__frame">
      <img v-if="imgUrl" :src="imgUrl" class="empty__img" :alt="description" />
      <div v-else class="empty__mark">
        <span class="empty__mark-char">∅</span>
      </div>
    </div>
    <p class="empty__desc">{{ description }}</p>
    <div class="empty__rule" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
// cmp-element Empty：imgUrl / description / icon — 此重设计统一用 ∅ 象征符，更内敛
withDefaults(
  defineProps<{
    imgUrl?: string
    description?: string
    icon?: string
  }>(),
  { description: '暂无数据' }
)
</script>

<style lang="scss" scoped>
@import '@ss-cmp/design-tokens/src/tokens.scss';

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 48px;
  font-family: $font-body;
}

.empty__frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border: 1px solid $border-hairline;
  border-radius: 50%;
  background: $bg-surface;
  margin-bottom: 16px;
}

.empty__img {
  max-width: 56px;
  max-height: 56px;
}

.empty__mark {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty__mark-char {
  font-family: $font-display;
  font-size: 36px;
  line-height: 1;
  color: $border-solid;
  font-weight: 300;
}

.empty__desc {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: $tracking-wide;
  text-transform: uppercase;
  color: $text-muted;
}

.empty__rule {
  width: 32px;
  height: 1px;
  background: $border-solid;
}
</style>
