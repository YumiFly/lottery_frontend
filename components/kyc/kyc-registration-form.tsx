"use client"

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Button,
  Input,
  InputNumber, // 如果你需要数字输入
  Select,
  Card,
  Typography,
  Form,
  DatePicker,
  Upload as AntdUpload,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'antd/dist/reset.css'; // 确保引入 antd 样式
import { registerCustomer, prepareNewCustomerData, uploadPhoto } from "@/lib/services/kyc-service";
import type { KycData } from "@/lib/api/kyc";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;

interface KycRegistrationFormProps {
  address: string;
}

export function KycRegistrationForm({ address }: KycRegistrationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]); // Ant Design Upload 的文件列表状态

  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().subtract(18, 'years').endOf('day');
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: any[] }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Image must smaller than 10MB!');
    }
    return isJpgOrPng && isLt10M;
  };

  const handleSubmit = async (values: any) => {
    if (!address) {
      toast({
        title: "Error",
        description: "Wallet address is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      let filePath = "";
      if (fileList.length > 0) {
        const file = fileList[0].originFile;
        if (file) {
          filePath = await uploadPhoto(file);
        }
      }

      const completeKycData: KycData = {
        customer_address: address,
        name: values.name,
        birth_date: values.birth_date ? values.birth_date.toISOString() : new Date().toISOString(),
        nationality: values.nationality,
        residential_address: values.residential_address,
        phone_number: values.phone_number,
        email: values.email,
        document_type: values.document_type,
        document_number: values.document_number,
        file_path: filePath,
        submission_date: new Date().toISOString(),
        risk_level: "Low", // 可以在表单中添加
        source_of_funds: values.source_of_funds,
        occupation: values.occupation,
      };


      const customerData = prepareNewCustomerData(address, completeKycData);
      
      console.log("KYC registration data:", customerData);
      await registerCustomer(customerData);

      toast({
        title: "KYC Submitted",
        description: "Your KYC information has been submitted for verification.",
      });

      router.push("/");
    } catch (error) {
      console.error("KYC registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your KYC information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <FormItem
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input placeholder="Enter your full name" />
          </FormItem>

          <FormItem
            label="Date of Birth"
            name="birth_date"
            rules={[{ required: true, message: 'Please select your date of birth' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Select date of birth"
              disabledDate={disabledDate}
              format="YYYY-MM-DD"
            />
          </FormItem>

          <FormItem
            label="Nationality"
            name="nationality"
            rules={[{ required: true, message: 'Please enter your nationality' }]}
          >
            <Input placeholder="Enter your nationality" />
          </FormItem>

          <FormItem
            label="Residential Address"
            name="residential_address"
            rules={[{ required: true, message: 'Please enter your full residential address' }]}
          >
            <TextArea rows={3} placeholder="Enter your full residential address" />
          </FormItem>

          <FormItem
            label="Phone Number"
            name="phone_number"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input placeholder="+1 (123) 456-7890" />
          </FormItem>

          <FormItem
            label="Email Address"
            name="email"
            rules={[{ required: true, message: 'Please enter your email address' }, { type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input type="email" placeholder="your.email@example.com" />
          </FormItem>

          <FormItem
            label="ID Document Type"
            name="document_type"
            rules={[{ required: true, message: 'Please select your ID document type' }]}
          >
            <Select placeholder="Select document type">
              <Option value="Passport">Passport</Option>
              <Option value="Driver's License">Driver's License</Option>
              <Option value="National ID">National ID</Option>
            </Select>
          </FormItem>

          <FormItem
            label="Document Number"
            name="document_number"
            rules={[{ required: true, message: 'Please enter your document number' }]}
          >
            <Input placeholder="Enter your document number" />
          </FormItem>

          <FormItem
            label="Occupation"
            name="occupation"
            rules={[{ required: true, message: 'Please enter your occupation' }]}
          >
            <Input placeholder="Enter your occupation" />
          </FormItem>

          <FormItem
            label="Source of Funds"
            name="source_of_funds"
            rules={[{ required: true, message: 'Please select your source of funds' }]}
          >
            <Select placeholder="Select source of funds">
              <Option value="Employment">Employment</Option>
              <Option value="Investments">Investments</Option>
              <Option value="Savings">Savings</Option>
              <Option value="Business">Business</Option>
              <Option value="Other">Other</Option>
            </Select>
          </FormItem>

          <FormItem label="ID Document Photo">
            <FormItem
              name="id_photo"
              valuePropName="fileList"
              getValueFromEvent={(e) => e.fileList}
              rules={[{ required: true, message: 'Please upload your ID document photo' }]}
              noStyle
            >
              <AntdUpload
                listType="picture"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                maxCount={1}
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <UploadOutlined />
                    <div className="ant-upload-text">Upload</div>
                  </div>
                )}
              </AntdUpload>
            </FormItem>
            <Text type="secondary">PNG, JPG, GIF up to 10MB</Text>
          </FormItem>

          <FormItem>
            <Button type="primary" htmlType="submit" loading={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit KYC Information'}
            </Button>
          </FormItem>
        </Form>
    </Card>
  );
}