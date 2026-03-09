import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController'

/**
 * 存储用户登录信息的状态
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  /**
   * 远程获取登录用户信息
   */
  async function fetchLoginUser() {
    try {
      const res = await getLoginUserUsingGet()
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      }
    } catch (error) {
      console.error('获取登录用户信息失败:', error)
    }
  }
  // //测试用户登录
  // setTimeout(() => {
  //   loginUser.value = { userName: '测试用户', id: 1 }
  // }, 3000)

  /**
   * 设置登录用户信息
   * @param newLoginUser
   */

  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }
  //返回
  return { loginUser, setLoginUser, fetchLoginUser }
})
