<template>
  <div id="mySpacePage">
    <p>正在跳转，请稍后...</p>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { onMounted } from 'vue'

const loginUserStore = useLoginUserStore()

const router = useRouter()
const route = useRoute()

//检查用户是否有个人空间
const checkUserSpace = async () => {
  const loginUser = loginUserStore.loginUser
  //用户未登录则直接跳转到登录页
  if (!loginUser?.id) {
    router.replace('/user/login')
    return
  }
  //用户已登录，获取用户个人空间
  const res = await listSpaceVoByPageUsingPost({
    userId: loginUser.id,
    current: 1,
    pageSize: 1,
  })
  if (res.data.code === 0) {
    //用户有个人空间
    if (res.data.data?.records?.length > 0) {
      const space = res.data.data.records[0]
      router.replace(`/space/${space.id}`)
    } else {
      //用户无个人空间
      router.replace('/add_space')
      message.warn('您暂无个人空间，请先创建个人空间')
    }
  } else {
    //加载个人空间失败
    message.error('加载个人空间失败' + res.data.message)
  }
}

onMounted(() => {
  checkUserSpace()
})
</script>
<style scoped>
#mySpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
