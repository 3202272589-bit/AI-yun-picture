<template>
  <a-modal
    class="image-out-painting"
    v-model:visible="visible"
    :footer="false"
    title="AI扩图"
    @cancel="closeModal"
  >
    <a-row gutter="16">
      <a-col span="12">
        <h4>原始图片</h4>
        <img :src="picture?.url" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
      <a-col span="12">
        <h4>扩图结果</h4>
        <img
          v-if="resultImageUrl"
          :src="resultImageUrl"
          :alt="picture?.name"
          style="max-width: 100%"
        />
      </a-col>
    </a-row>
    <a-flex justify="space-around" style="margin-top: 16px">
      <a-button type="primary" :loading="!!taskId" ghost @click="createTask"> 生成图片 </a-button>
      <a-button v-if="resultImageUrl" type="primary" :loading="uploadLoading" @click="handleUpload">
        应用结果
      </a-button>
    </a-flex>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  createPictureOutPaintingTaskUsingPost,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController'
import { getPictureOutPaintingTaskUsingGet } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const resultImageUrl = ref<string>('')

//任务Id
const taskId = ref<string>()

/**
 * 创建任务
 */
const createTask = async () => {
  if (!props.picture?.id) {
    return
  }
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    //根据需要设置扩图参数
    parameters: {
      xScale: 2,
      yScale: 2,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('任务创建成功，请耐心等待，不要退出界面')
    taskId.value = res.data.data.output.taskId
    console.log(taskId.value)
    //开启轮询
    startPolling()
  } else {
    message.error('扩图任务创建失败' + res.data.message)
  }
}

//轮询定时器
let pollingTimer: NodeJS.Timeout = null

//开始轮询
const startPolling = () => {
  if (!taskId.value) {
    return
  }
  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务执行成功')
          resultImageUrl.value = taskResult?.outputImageUrl
          //任务成功，清除轮询
          clearPolling()
        } else if (taskResult.taskStatus === 'FAILED') {
          message.error('扩图任务执行失败：' + (taskResult?.message || '未知错误'))
          //任务失败，清除轮询
          clearPolling()
        }
        // 其他状态（如 RUNNING/PENDING）继续轮询，不清除
      }
    } catch (error) {
      console.error('扩图任务轮询失败', error)
      message.error('扩图任务失败失败' + error.message)
      clearPolling()
    }
  }, 3000)
}

//清理轮询
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = null
  }
}

//是否正在上传图片
const uploadLoading = ref<boolean>(false)

/**
 * 上传图片
 * @param file
 */
const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      //将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      //关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败', error)
    message.error('图片上传失败' + error.message)
  } finally {
    uploadLoading.value = false
  }
}

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

onUnmounted(() => {
  clearPolling()
})
</script>

<style>
.image-out-painting {
  text-align: center;
}
</style>
