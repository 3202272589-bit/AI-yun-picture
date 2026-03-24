<template>
  <div id="addPictureBatchPage">
    <h2 style="margin-bottom: 16px">批量创建图片</h2>
    <!-- 图片信息表单 -->
    <a-form name="PictureForm" layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="关键词" name="searchText">
        <a-input v-model:value="formData.searchText" placeholder="输入关键词" allowClear />
      </a-form-item>
      <a-form-item label="创建数量" name="count">
        <a-input-number
          v-model:value="formData.count"
          placeholder="输入数量"
          style="min-width: 180px"
          :min="1"
          :max="30"
          allowClear
        />
      </a-form-item>
      <a-form-item label="名称前缀" name="namePrefix">
        <a-input
          v-model:value="formData.namePrefix"
          placeholder="输入名称前缀,会自动补充序号"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >批量创建</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import message from 'ant-design-vue/es/message'
import { uploadPictureByBatchUsingPost } from '@/api/pictureController'
import { useRouter } from 'vue-router'

const formData = reactive<API.PictureUploadByBatchRequest>({})
formData.count = 10

//提交任务状态
const loading = ref(false)
const router = useRouter()
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  loading.value = true
  const res = await uploadPictureByBatchUsingPost({
    ...formData,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success(`成功创建${formData.count}张图片`)
    //跳转到主页
    router.push({
      path: '/',
    })
  } else {
    message.error('图片创建失败' + res.data.message)
  }
  loading.value = false
}
</script>

<style scoped>
#addPictureBatchPage {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
}
</style>
