import {
  registerCustomer as apiRegisterCustomer,
  getCustomers as apiGetCustomers,
  getCustomerById as apiGetCustomerById,
  uploadPhoto as apiUploadPhoto,
  type Customer,
  type KycData,
  type CustomerRequest,
} from "@/lib/api/kyc"

import { mockRegisterCustomer, mockGetCustomerById, mockUploadPhoto, getMockCustomers } from "@/lib/mock/kyc"

// 环境变量，控制是否使用模拟数据
//const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false" // Default to using mock data unless explicitly set to "false"
const USE_MOCK = false
// 注册用户
export async function registerCustomer(customerData: CustomerRequest): Promise<void> {
  try {
    if (USE_MOCK) {
      return mockRegisterCustomer(customerData)
    }
    return apiRegisterCustomer(customerData)
  } catch (error) {
    console.error("注册用户失败:", error)
    throw error
  }
}

// 获取用户列表
export async function getCustomers(): Promise<Customer[]> {
  try {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getMockCustomers())
        }, 500)
      })
    }
    return apiGetCustomers()
  } catch (error) {
    console.error("获取用户列表失败:", error)
    throw error
  }
}

// 根据地址获取用户信息
export async function getCustomerByAddress(address: string): Promise<Customer | null> {
  try {
    if (USE_MOCK) {
      return mockGetCustomerById(address)
    }
    const customer = await apiGetCustomerById(address)
    return customer
  } catch (error) {
    console.error("获取用户信息失败:", error)
    // 如果是404错误，返回null
    // if (error.response && error.response.status === 404) {
    //   return null
    // }
    throw error
  }
}

// 上传照片
export async function uploadPhoto(file: File): Promise<string> {
  try {
    if (USE_MOCK) {
      return mockUploadPhoto(file)
    }
    return apiUploadPhoto(file)
  } catch (error) {
    console.error("上传照片失败:", error)
    throw error
  }
}

// 检查用户是否已注册并通过KYC验证
export async function isUserVerified(address: string): Promise<boolean> {
  try {
    if (!address) return false

    const customer = await getCustomerByAddress(address)
    return customer ? customer.is_verified : false
  } catch (error) {
    console.error("检查用户验证状态失败:", error)
    return false
  }
}

// 检查用户是否是管理员
export async function isUserAdmin(address: string): Promise<boolean> {
  try {
    if (!address) return false

    const customer = await getCustomerByAddress(address)
    return customer ? customer.role_id === 2 : false
  } catch (error) {
    console.error("检查用户管理员状态失败:", error)
    return false
  }
}

// 准备新用户注册数据
export function prepareNewCustomerData(address: string, kycData: KycData, roleId = 1): CustomerRequest {
  const now = new Date().toISOString()

  return {
    customer_address: address,
    is_verified: false, // 新用户默认未验证
    verifier_address: "",
    verification_time:"0001-01-01T00:00:00Z",
    registration_time: now,
    role_id: roleId,
    assigned_date: now,
    kyc_data: {
      ...kycData,
      customer_address: address,
      submission_date: now,
    },
    kyc_verifications: [],
  }
}

// 导出类型
export type { Customer, KycData, CustomerRequest }
