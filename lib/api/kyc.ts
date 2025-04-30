import api from "./config"

// KYC 数据类型
export interface KycData {
  customer_address: string
  name: string
  birth_date: string
  nationality: string
  residential_address: string
  phone_number: string
  email: string
  document_type: string
  document_number: string
  file_path: string
  submission_date: string
  risk_level: string
  source_of_funds: string
  occupation: string
}

// 用户数据类型
export interface Customer {
  customer_address: string
  is_verified: boolean
  verifier_address: string
  verification_time: string
  registration_time: string
  role_id: number
  assigned_date: string
  kyc_data: KycData
  kyc_verifications: any[]
  role: {
    role_id: number
    role_name: string
    role_type: string
    description: string
    menus: { role_menu_id: number; role_id: number; menu_name: string; menu_path: string }[] | null
  }
}

export interface Role{
  role_id: number
  role_name: string
  role_type: string
  description: string
  create_at:string
}

// 用户注册请求数据类型
export interface CustomerRequest {
  customer_address: string
  is_verified: boolean
  verifier_address: string
  verification_time: string
  registration_time: string
  role_id: number
  assigned_date: string
  kyc_data: KycData
  kyc_verifications: any[]
}

// 用户注册
export const registerCustomer = async (customerData: CustomerRequest): Promise<void> => {
  try {
    await api.post("/customers", customerData)
  } catch (error) {
    console.error("注册用户失败:", error)
    throw error
  }
}

// 获取用户列表
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await api.get("/customers")
    return response.data.data
  } catch (error) {
    console.error("获取用户列表失败:", error)
    throw error
  }
}

// 根据ID获取用户信息
export const getCustomerById = async (customerAddress: string): Promise<Customer> => {
  try {
    const response = await api.get(`/customers/${customerAddress}`)
    console.log("获取用户信息成功:", response.data)
    return response.data.data
  } catch (error) {
    console.error("获取用户信息失败:", error)
    throw error
  }
}

export const getRolesList = async(): Promise<Role[]> =>{
  try{
    const response = await api.get(`/customers/roles`)
    console.log("获取角色列表信息成功：",response.data)
    return response.data.data

  }catch(error){
    console.error("获取角色列表信息失败:",error)
    throw error
  }
}

// 上传照片
export const uploadPhoto = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append("idPhoto", file)
    const response = await api.post(`/customers/upload-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    console.log("上传照片成功:", response.data)
    return response.data.data.file_url
  } catch (error) {
    console.error("上传照片失败:", error)
    throw error
  }
}
