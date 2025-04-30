import React, { useEffect, useState } from "react"
import {
  Tabs,
  Table,
  Button,
  Card,
  Space,
  Modal,
  Form,
  Select,
  message,
  Descriptions
} from "antd"
import { getCustomers,Customer,getRolesList,Role } from "@/lib/services/kyc-service"
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons"
import { Key } from "lucide-react"

const { TabPane } = Tabs

export default function UserManagement() {
  const [allUsers, setAllUsers] = useState<Customer[]>([])
  const [pendingUsers, setPendingUsers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Customer>()
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  const [roles,setRoles] = useState<Role[]>([])
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const users = await getCustomers()
      setAllUsers(users)
      const pending = users.filter((u) => u.is_verified === false)
      setPendingUsers(pending)

      const roles = await getRolesList()
      console.log("roles:",roles)
      setRoles(roles)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: "Are you sure to delete this user?",
      onOk: () => {
        message.success("User deleted (mock)")
        // TODO: Implement delete logic
      },
    })
  }

  const showDetail = (user: any) => {
    setSelectedUser(user)
    setDetailModalVisible(true)
  }

  const handleAssign = (values: any) => {
    console.log("Assigned role & menus:", values)
    message.success("Role and menus assigned (mock)")
    setDetailModalVisible(false)
  }

  const columns = [
    {
      title: "Wallet Address",
      dataIndex: "customer_address",
      key: "customer_address",
    },
    {
      title: "Status",
      dataIndex: "is_verified",
      key: "is_verified",
      render: (_: any, record: any) => (
        <span style={{ color: record.is_verified ? 'green' : 'red' }}>
          {record.is_verified ? '已认证' : '未认证'}
        </span>
      )
    },
    {
        title:"Role",
        dataIndex:"role_name",
        Key:"role_name",
        render:(_: any, record: any)=>(
            <span>{record.role.role_name}</span>
        )
    },
    {
        title:"RegistrationTime",
        dataIndex:"registration_time",
        key:"registration_time"
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showDetail(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.customer_address)} />
        </Space>
      ),
    },
  ]

  return (
    <Card title="User Management">
      <Tabs defaultActiveKey="all">
        <TabPane tab="All Users" key="all">
          <Table columns={columns} dataSource={allUsers} loading={loading} rowKey="customer_address" />
        </TabPane>
        <TabPane tab="Pending Users" key="pending">
          <Table columns={columns} dataSource={pendingUsers} loading={loading} rowKey="customer_address" />
        </TabPane>
      </Tabs>

      {/* Detail Modal */}
      <Modal
        open={detailModalVisible}
        title="User Detail"
        onCancel={() => setDetailModalVisible(false)}
        onOk={() => {
          form.submit()
        }}
      >
       {selectedUser && (
         <>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Wallet Address">{selectedUser.customer_address}</Descriptions.Item>
        <Descriptions.Item label="User Name">{selectedUser.kyc_data.name}</Descriptions.Item>
        <Descriptions.Item label="Birth Date">{selectedUser.kyc_data.birth_date}</Descriptions.Item>
        <Descriptions.Item label="Nationality">{selectedUser.kyc_data.nationality}</Descriptions.Item>
        <Descriptions.Item label="Address">{selectedUser.kyc_data.residential_address}</Descriptions.Item>
        <Descriptions.Item label="Email">{selectedUser.kyc_data.email}</Descriptions.Item>
        <Descriptions.Item label="Document Type">{selectedUser.kyc_data.document_type}</Descriptions.Item>
        <Descriptions.Item label="Document Number">{selectedUser.kyc_data.document_number}</Descriptions.Item>
        <Descriptions.Item label="Submission Date">{selectedUser.kyc_data.submission_date}</Descriptions.Item>
        <Descriptions.Item label="Source of Funds">{selectedUser.kyc_data.source_of_funds}</Descriptions.Item>
        <Descriptions.Item label="Occupation">{selectedUser.kyc_data.occupation}</Descriptions.Item>
      </Descriptions>
        {!selectedUser.is_verified && (
        <Form form={form} layout="vertical" onFinish={handleAssign} style={{ marginTop: 24 }}>
                <Form.Item label="Assign Role" name="role_id">
                <Select placeholder="Select a role">
                    {Array.isArray(roles)&&roles?.map((role) => (
                    <Select.Option key={role.role_id} value={role.role_id}>
                        {role.role_type}
                    </Select.Option>
                    ))}
                    </Select>
                </Form.Item>
            {/* <Form.Item label="Assign Menus" name="menus">
              <Select mode="multiple" placeholder="Select menu paths">
                <Select.Option value="/lottery/purchase">Purchase Page</Select.Option>
                <Select.Option value="/account">Account Management</Select.Option>
              </Select>
            </Form.Item> */}
          </Form>
          )}
          </>
        )}
      </Modal>
    </Card>
  )
}
