import router from './router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'

//是否为首次登陆用户
let isFirstLoginUser = true

/**
 * 全局权限校验
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  //确保页面刷新，首次加载时，能等待后端返回登录用户信息后再进行校验
  if (isFirstLoginUser) {
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
    isFirstLoginUser = false
  }
  const toUrl = to.fullPath
  //可以自定义权限校验逻辑，比如管理员才能访问/admin目录下的路由
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole !== 'admin') {
      message.error('您没有权限访问该页面')
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
  }
  next()
})
