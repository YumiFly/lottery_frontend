import axios from "axios"

const API_URL="http://localhost:8080";
// 创建API实例
const api = axios.create({
  baseURL: API_URL || "https://api.example.com",
  timeout: 50000, // 10秒超时
  headers: {
    "Content-Type": "application/json",
  },
})

// 请求拦截器 - 添加认证信息等
api.interceptors.request.use(
  (config) => {
    // 检查是否使用模拟数据
    //console.log(process.env.NEXT_PUBLIC_USE_MOCK)
   // console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL); // 如果使用模拟数据，取消请求
    //process.env.NEXT_PUBLIC_USE_MOCK !== "false"
    if (false) {
      // 如果使用模拟数据，取消请求
      return {
        ...config,
        cancelToken: new axios.CancelToken((cancel) => cancel("Using mock data, real API request cancelled")),
      }
    }

    // 从localStorage获取token
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器 - 处理错误等
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 如果是取消请求的错误，不需要处理
    if (axios.isCancel(error)) {
      console.log("Request canceled:", error.message)
      return Promise.reject(error)
    }

    // 处理401错误等
    if (error.response && error.response.status === 401) {
      // 清除token并重定向到登录页
      localStorage.removeItem("auth_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
