"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCheck, UserX, Clock } from "lucide-react"
import type { Customer } from "@/lib/api/kyc"

interface KycStatusProps {
  customer: Customer | null
}

export function KycStatus({ customer }: KycStatusProps) {
  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Status</CardTitle>
          <CardDescription>Your KYC information is not available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <UserX className="h-12 w-12 text-red-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium">No KYC Record Found</h3>
              <p className="text-sm text-gray-500">
                We couldn't find your KYC information. Please contact support if you believe this is an error.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>KYC Status</CardTitle>
            <CardDescription>Your KYC verification status</CardDescription>
          </div>
          <Badge
            variant={customer.is_verified ? "default" : "outline"}
            className={
              customer.is_verified
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            }
          >
            {customer.is_verified ? "Verified" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center py-4">
          {customer.is_verified ? (
            <UserCheck className="h-16 w-16 text-green-500" />
          ) : (
            <Clock className="h-16 w-16 text-yellow-500" />
          )}
          <div className="ml-4">
            <h3 className="text-lg font-medium">
              {customer.is_verified ? "Your KYC verification is complete" : "Your KYC verification is pending"}
            </h3>
            <p className="text-sm text-gray-500">
              {customer.is_verified
                ? "You have full access to all platform features"
                : "Your information is being reviewed. This process may take 1-3 business days."}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{customer.kyc_data.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{formatDate(customer.kyc_data.birth_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nationality</p>
              <p className="font-medium">{customer.kyc_data.nationality}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{customer.kyc_data.email}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Verification Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Submission Date</p>
              <p className="font-medium">{formatDate(customer.kyc_data.submission_date)}</p>
            </div>
            {customer.is_verified && (
              <div>
                <p className="text-sm text-gray-500">Verification Date</p>
                <p className="font-medium">{formatDate(customer.verification_time)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Document Type</p>
              <p className="font-medium">{customer.kyc_data.document_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Risk Level</p>
              <p className="font-medium">{customer.kyc_data.risk_level}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
