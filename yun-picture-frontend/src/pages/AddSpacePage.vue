<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px"></h2>
    <!-- 空间信息表单 -->
    <a-form name="SpaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
      <a-form-item label="名称" name="spaceName">
        <a-input v-model:value="spaceForm.spaceName" placeholder="输入名称" allowClear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          placeholder="选择空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >提交</a-button
        >
      </a-form-item>
    </a-form>
    <!-- 空间级别介绍-->
    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a href="https://github.com/3202272589-bit/AI-------" target="_blank">管理员</a>
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}: 大小 {{ formatSize(spaceLevel.maxSize) }}, 数量
        {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import message from 'ant-design-vue/es/message'
import { addSpaceUsingPost, getSpaceVoByIdUsingGet } from '@/api/spaceController'
import { useRouter, useRoute } from 'vue-router'
import { SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { listSpaceLevelUsingGet, updateSpaceUsingPost } from '@/api/spaceController'
import { formatSize } from '@/utils/index'

const space = ref<API.SpaceVO>()
const spaceForm = reactive<API.SpaceAddRequest | API.SpaceEditRequest>({})
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const spaceLevelList = ref<API.SpaceLevel[]>([])

const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别列表失败' + res.data.message)
  }
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const spaceId = space.value?.id
  loading.value = true
  let res
  if (spaceId) {
    //更新
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...spaceForm,
    })
  } else {
    //创建
    res = await addSpaceUsingPost({
      ...spaceForm,
    })
  }
  if (res.data.code === 0 && res.data.data) {
    message.success('空间操作成功')
    //跳转到空间详情页
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('空间操作失败' + res.data.message)
  }
  loading.value = false
}

//获取老数据
const getOldSpace = async () => {
  //获取id
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      //填充表单数据
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}

onMounted(() => {
  fetchSpaceLevelList()
  getOldSpace()
})
</script>

<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
