<template>
  <div>
    <a-modal v-model:visible="visible" :footer="false" title="分享图片" @cancel="closeModal">
      <h4>分享图片链接</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
      <div style="margin-bottom: 16px" />
      <h4>手机扫码查看</h4>
      <a-qrcode :value="link" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  title: string
  link: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '分享图片',
  link: 'https://github.com/3202272589-bit/AI-yun-picture',
})

const visible = ref<boolean>(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

// 暴露方法
defineExpose({
  openModal,
  closeModal,
})
</script>
