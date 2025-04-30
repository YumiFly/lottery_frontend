import { Modal, DatePicker, Button } from "antd"
import { useState } from "react"
import dayjs from "dayjs"
import { createLotteryIssue } from "@/lib/api/lotteryV2"
import { useToast } from "@/hooks/use-toast"

function CreateIssueDialog({
  open,
  onOpenChange,
  lotteryId,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lotteryId: string;
  onCreated: () => void;
}) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [selectedDate2, setSelectedDate2] = useState<dayjs.Dayjs | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a deadline date",
        variant: "destructive"
      })
      return
    }

    if (!selectedDate2) {
        toast({
          title: "Error",
          description: "Please select a deadline date",
          variant: "destructive"
        })
        return
      }

    try {
      setLoading(true)
      await createLotteryIssue({
        lottery_id: lotteryId,
        issue_number: `ISSUE-${Date.now()}`, // 生成一个简单的期号
        sale_end_time: selectedDate.toISOString(),
        draw_time: selectedDate2.toISOString(), // 这里用同一个时间，后续可以独立设置
        status: "PENDING"
      })
      toast({
        title: "Success",
        description: "New issue created successfully."
      })
      onCreated()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create issue:", error)
      toast({
        title: "Error",
        description: "Failed to create new issue.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Create New Issue"
      onCancel={() => onOpenChange(false)}
      footer={null}
      destroyOnClose
      maskClosable={false} 
    >
      <div className="space-y-4 mt-4">
        <DatePicker
          style={{ width: "100%" }}
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="Select sale end date and time"
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
        />
      </div>

      <div className="space-y-4 mt-4">
        <DatePicker
          style={{ width: "100%" }}
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="Select draw and time"
          value={selectedDate2}
          onChange={(date) => setSelectedDate2(date)}
        />
      </div>

      <div className="mt-6 text-right">
        <Button
          type="primary"
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          onClick={handleSubmit}
          loading={loading}
        >
          {loading ? "Creating..." : "Confirm"}
        </Button>
      </div>
    </Modal>
  )
}

export default CreateIssueDialog