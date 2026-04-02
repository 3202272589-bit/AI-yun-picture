<template>
  <div class="space-usage-analyze">
    <a-flex gap="middle">
      <a-card title="存储空间" style="width: 50%">
        <div style="height: 320px" text-align="center">
          <h3>
            {{ formatSize(data.usedSize) }} /
            {{ data.maxSize ? formatSize(data.maxSize) : '无限制' }}
          </h3>
          <a-progress type="dashboard" :percent="data.sizeUsageRatio ?? 0"> </a-progress>
        </div>
      </a-card>
      <a-card title="图片数量" style="width: 50%">
        <h3>
          {{ data.usedCount }} /
          {{ data.maxCount ? data.maxCount : '无限制' }}
        </h3>
        <a-progress type="dashboard" :percent="data.countUsageRatio ?? 0"> </a-progress>
      </a-card>
    </a-flex>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatSize } from '@/utils/index'
import { message } from 'ant-design-vue'
import { watchEffect } from 'vue'
import { getSpaceUsageAnalyzeUsingPost } from '@/api/spaceAnalyzeController'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

//图表数据
const data = ref<API.SpaceUsageAnalyzeResponse>({})

//加载状态
const loading = ref<boolean>(false)

//获取数据
const fetchData = async () => {
  loading.value = true
  const res = await getSpaceUsageAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  })
  if (res.data.data && res.data.code === 0) {
    data.value = res.data.data
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

/**
 * 监听变量变化，刷新数据
 */
watchEffect(() => {
  fetchData()
})
</script>

<style scoped></style>
