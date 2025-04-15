import { Random } from "./setup"
import type { Customer, KycData, CustomerRequest } from "@/lib/api/kyc"

// 模拟KYC数据
export const getMockKycData = (address: string): KycData => {
  return {
    customer_address: address,
    name: "John Doe",
    birth_date: "1990-01-01",
    nationality: "United States",
    residential_address: "123 Main St, New York, NY 10001",
    phone_number: "+1 (555) 123-4567",
    email: "john.doe@example.com",
    document_type: "Passport",
    document_number: "P12345678",
    file_path: "/uploads/kyc/passport_123456.jpg",
    submission_date: new Date().toISOString(),
    risk_level: "Low",
    source_of_funds: "Employment",
    occupation: "Software Engineer",
  }
}

// 模拟用户角色
export const getMockUserRole = (roleId = 1) => {
  const roles = [
    {
      role_id: 1,
      role_name: "User",
      role_type: "user",
      description: "Regular user role",
      menus: [
        { role_menu_id: 1, role_id: 1, menu_name: "Home", menu_path: "/" },
        { role_menu_id: 2, role_id: 1, menu_name: "Buy Tickets", menu_path: "/buy" },
        { role_menu_id: 3, role_id: 1, menu_name: "Results", menu_path: "/results" },
        { role_menu_id: 4, role_id: 1, menu_name: "History", menu_path: "/history" },
      ],
    },
    {
      role_id: 2,
      role_name: "Admin",
      role_type: "admin",
      description: "Administrator role",
      menus: [
        { role_menu_id: 5, role_id: 2, menu_name: "Home", menu_path: "/" },
        { role_menu_id: 6, role_id: 2, menu_name: "Buy Tickets", menu_path: "/buy" },
        { role_menu_id: 7, role_id: 2, menu_name: "Results", menu_path: "/results" },
        { role_menu_id: 8, role_id: 2, menu_name: "History", menu_path: "/history" },
        { role_menu_id: 9, role_id: 2, menu_name: "Admin", menu_path: "/admin/manage" },
      ],
    },
  ]

  return roles.find((role) => role.role_id === roleId) || roles[0]
}

// 模拟用户数据
export const getMockCustomer = (address: string, isVerified = false, roleId = 1): Customer => {
  const now = new Date().toISOString()
  return {
    customer_address: address,
    is_verified: isVerified,
    verifier_address: isVerified ? "0x9876543210fedcba9876543210fedcba98765432" : "",
    verification_time: isVerified ? now : "",
    registration_time: now,
    role_id: roleId,
    assigned_date: now,
    kyc_data: getMockKycData(address),
    kyc_verifications: [],
    role: getMockUserRole(roleId),
  }
}

// 模拟用户列表
export const getMockCustomers = (): Customer[] => {
  return [
    getMockCustomer("0x1234567890abcdef1234567890abcdef12345678", true, 2), // 已验证的管理员
    getMockCustomer("0xabcdef1234567890abcdef1234567890abcdef12", true, 1), // 已验证的普通用户
    getMockCustomer("0x7890abcdef1234567890abcdef1234567890abcd", false, 1), // 未验证的普通用户
  ]
}

// 模拟注册用户
export const mockRegisterCustomer = async (customerData: CustomerRequest): Promise<void> => {
  // 模拟API延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("模拟注册用户:", customerData)
      resolve()
    }, 1000)
  })
}

// 模拟获取用户信息
export const mockGetCustomerById = async (customerAddress: string): Promise<Customer | null> => {
  // 模拟API延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      const customers = getMockCustomers()
      const customer = customers.find((c) => c.customer_address.toLowerCase() === customerAddress.toLowerCase())
      resolve(customer || null)
    }, 500)
  })
}

// 模拟上传照片
export const mockUploadPhoto = async (file: File): Promise<string> => {
  // 模拟API延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileName = file.name.replace(/\s+/g, "_")
      const mockUrl = `/uploads/kyc/${fileName}`
      console.log("模拟上传照片:", file.name, "->", mockUrl)
      resolve(mockUrl)
    }, 1500)
  })
}

// 生成随机用户
export const generateRandomCustomer = (): Customer => {
  const address = `0x${Random.string("0123456789abcdef", 40)}`
  const isVerified = Random.boolean()
  const roleId = Random.pick([1, 2])
  const now = new Date().toISOString()

  const names = ["John Smith", "Jane Doe", "Michael Johnson", "Emily Williams", "David Brown", "Sarah Miller"]
  const nationalities = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France"]
  const occupations = ["Software Engineer", "Doctor", "Teacher", "Lawyer", "Accountant", "Business Owner"]
  const documentTypes = ["Passport", "Driver's License", "National ID"]

  return {
    customer_address: address,
    is_verified: isVerified,
    verifier_address: isVerified ? `0x${Random.string("0123456789abcdef", 40)}` : "",
    verification_time: isVerified ? now : "",
    registration_time: now,
    role_id: roleId,
    assigned_date: now,
    kyc_data: {
      customer_address: address,
      name: Random.pick(names),
      birth_date: Random.date("yyyy-MM-dd"),
      nationality: Random.pick(nationalities),
      residential_address: `${Random.integer(1, 999)} ${Random.word()} St, ${Random.word()}, ${Random.string("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 2)} ${Random.integer(10000, 99999)}`,
      phone_number: `+1 (${Random.integer(100, 999)}) ${Random.integer(100, 999)}-${Random.integer(1000, 9999)}`,
      email: `${Random.word()}@example.com`,
      document_type: Random.pick(documentTypes),
      document_number: `${Random.string("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 1)}${Random.integer(10000000, 99999999)}`,
      file_path: `/uploads/kyc/document_${Random.integer(1000, 9999)}.jpg`,
      submission_date: now,
      risk_level: Random.pick(["Low", "Medium", "High"]),
      source_of_funds: Random.pick(["Employment", "Investments", "Savings", "Business"]),
      occupation: Random.pick(occupations),
    },
    kyc_verifications: [],
    role: getMockUserRole(roleId),
  }
}
