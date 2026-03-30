<template>
  <div id="searchPicturePage">
    <h2 style="margin-bottom: 16px">以图搜图</h2>
    <h3 style="margin-bottom: 16px">原图</h3>
    <!-- 单张图片 -->
    <a-card hoverable style="width: 240px">
      <template #cover>
        <img
          :alt="picture.name"
          :src="picture.thumbnailUrl ?? picture.url"
          style="height: 180px; object-fit: cover"
        />
      </template>
    </a-card>
    <h3 style="padding-top: 16px">识图结果</h3>
    <!-- 识图结果列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <a :href="picture.fromUrl" target="_blank">
            <!-- 单张图片 -->
            <a-card hoverable>
              <template #cover>
                <img
                  :alt="picture.name"
                  :src="picture.thumbnailUrl"
                  style="height: 180px; object-fit: cover"
                />
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getPictureVoByIdUsingGet } from '@/api/pictureController'
import { useRoute } from 'vue-router'
import { searchPictureByPictureUsingPost } from '@/api/pictureController'

const route = useRoute()
const pictureId = computed(() => {
  return route.query?.pictureId
})

const picture = ref<API.PictureVO>({})

//获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取图片详情失败，' + error.message)
  }
}

//以图搜图结果
const dataList = ref<API.ImageSearchResult[]>([])
//加载状态
const loading = ref<boolean>(true)

//获取搜图结果
const fetchResultData = async () => {
  loading.value = true
  try {
    const res = await searchPictureByPictureUsingPost({
      pictureId: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取搜图结果失败，' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取搜图结果失败，' + error.message)
  }
  loading.value = false
}

//页面加载时请求一次
onMounted(() => {
  fetchPictureDetail()
  fetchResultData()
})
</script>
<style scoped>
#searchPicturePage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
