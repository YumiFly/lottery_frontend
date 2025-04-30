import { useState,useEffect } from "react"
import {notification, Table, Button, Select, Empty, Spin, Pagination } from "antd"
import { Card, Row, Col } from "antd"
import { ReloadOutlined, PlusOutlined, TrophyOutlined } from "@ant-design/icons"
import { useLanguage } from "@/hooks/use-language"
import { getLotteries, getLotteryIssues,drawLottery } from "@/lib/api/lotteryV2"
import CreateLotteryDialog from "@/components/admin/CreateLotteryDialog"
import CreateIssueDialog from "@/components/admin/CreateIssueDialog"

export default function LotteryManagement() {
  const { t } = useLanguage()

  const [error, setError] = useState<string | null>(null)
  const [lotteries, setLotteries] = useState<any[]>([])
  const [selectedLottery, setSelectedLottery] = useState<string | null>(null)
  const [lotteryIssues, setLotteryIssues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createLotteryOpen, setCreateLotteryOpen] = useState(false)
  const [createIssueOpen, setCreateIssueOpen] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalIssues, setTotalIssues] = useState(0)

  // 加载彩票列表
  useEffect(() => {
    async function fetchData() {
      try {
        const { lotteries } = await getLotteries({ page: 1, page_size: 50 })
        setLotteries(lotteries)
        if (lotteries.length > 0) {
          setSelectedLottery(lotteries[0].lottery_id)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // 加载期号列表
  useEffect(() => {
    if (selectedLottery) {
      async function fetchIssues() {
        try {
          const { issues, total } = await getLotteryIssues({ lottery_id: selectedLottery||"", page, page_size: pageSize })
          setLotteryIssues(issues)
          setTotalIssues(total)
        } catch (error) {
          console.error("Failed to fetch issues", error)
        }
      }
      fetchIssues()
    }
  }, [selectedLottery, page, pageSize])

  const handleCreateIssue = () => {
    setCreateIssueOpen(true)
  }

  const handleRefresh = async () => {
    if (selectedLottery) {
      const { issues, total } = await getLotteryIssues({ lottery_id: selectedLottery, page, page_size: pageSize })
      setLotteryIssues(issues)
      setTotalIssues(total)
    }
  }

  const handleDraw = async (issueId: string) => {
    try {
      await drawLottery(issueId)
      notification.success({
        message: t("results.drawSuccess"),
        description: t("results.drawSuccess"),
        placement: "bottomRight",
        duration: 2
      })
      // 刷新
      const issuesData = await getLotteryIssues({ lottery_id: selectedLottery ?? undefined, page: 1, page_size: 10 })
      setLotteryIssues(issuesData.issues)
    } catch (error) {
      console.error("Failed to draw:", error)
      setError(t("results.drawFailed"))
    }
  }

  const columns = [
    {
      title: t("results.issueNumber"),
      dataIndex: "issue_number",
      key: "issue_number"
    },
    {
      title: t("results.status"),
      dataIndex: "status",
      key: "status"
    },
    {
      title: t("results.drawTime"),
      dataIndex: "draw_time",
      key: "draw_time"
    },
    {
      title: t("results.winningNumbers"),
      dataIndex: "winning_numbers",
      key: "winning_numbers",
      render: (text: string) => text || t("results.noResults")
    },
    {
      title: t("results.actions"),
      key: "actions",
      render: (_: any, record: any) => (
        record.status === "PENDING" && (
          <Button
            icon={<TrophyOutlined />}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", color: "#fff" }}
            size="small"
            onClick={() => handleDraw(record.issue_id)}
          >
            {t("results.drawNow")}
          </Button>
        )
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spin size="large" />
      </div>
    )
  }

  const selectedLotteryData = lotteries.find(lottery => lottery.lottery_id === selectedLottery)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("results.lotteryManagement")}</h2>
        <div className="flex space-x-2">
          <Select
            style={{ width: 200 }}
            value={selectedLottery ?? undefined}
            placeholder={t("results.selectLottery")}
            onChange={(value) => setSelectedLottery(value)}
          >
            {lotteries.map(lottery => (
              <Select.Option key={lottery.lottery_id} value={lottery.lottery_id}>
                {lottery.ticket_name}
              </Select.Option>
            ))}
          </Select>
          <Button
            icon={<PlusOutlined />}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", color: "#fff" }}
            onClick={() => setCreateLotteryOpen(true)}
          >
            {t("results.addLottery")}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          />
        </div>
      </div>

      {/* Display selected lottery information */}
      {selectedLotteryData && (
        <Card
          title={t("results.lotteryInformation")}
          bordered={false}
          className="mt-4"
          style={{
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9f9f9"
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <strong>{t("results.ticketName")}:</strong> {selectedLotteryData.ticket_name}
            </Col>
            <Col span={12}>
              <strong>{t("results.typeName")}:</strong> {selectedLotteryData.LotteryType?.type_name || "-"}
            </Col>
            <Col span={12}>
              <strong>{t("results.ticketPrice")}:</strong> {selectedLotteryData.ticket_price} LOT
            </Col>
            <Col span={12}>
              <strong>{t("results.ticketSupply")}:</strong> {selectedLotteryData.ticket_supply}
            </Col>
            <Col span={12}>
              <strong>{t("results.contractAddress")}:</strong> {selectedLotteryData.contract_address}
            </Col>
            <Col span={12}>
              <strong>{t("results.registeredAddr")}:</strong> {selectedLotteryData.registered_addr}
            </Col>
          </Row>
        </Card>
      )}

      <div className="flex justify-between items-center mt-4">
        <h4 className="text-lg font-semibold">{t("results.issueList")}</h4>
        <Button
          type="primary"
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          onClick={handleCreateIssue}
        >
          {t("results.createNewIssue")}
        </Button>
      </div>

      <div className="mt-4">
        <Table
          columns={columns}
          dataSource={lotteryIssues}
          rowKey="issue_id"
          pagination={false}
          locale={{
            emptyText: <Empty description={t("common.noResults")} />
          }}
        />
        {/* Adding Pagination below the table */}
       {/* Adding Pagination below the table */}
       <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <Pagination
            current={page}
            total={totalIssues}
            pageSize={pageSize}
            onChange={(page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            }}
            showSizeChanger
            showTotal={(total) => `${total} ${t("common.items")}`}
            className="mt-4"
            style={{ textAlign: "right" }}
          />
        </div>
      </div>

      {/* 弹窗们 */}
      <CreateLotteryDialog
        open={createLotteryOpen}
        onOpenChange={setCreateLotteryOpen}
        onCreated={(newLottery) => {
          setLotteries(prev => [newLottery, ...prev])
          setSelectedLottery(newLottery.lottery_id)
        }}
      />

      <CreateIssueDialog
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
        lotteryId={selectedLottery!}
        onCreated={handleRefresh}
      />
    </div>
  )
}