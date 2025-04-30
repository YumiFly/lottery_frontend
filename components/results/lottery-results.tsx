import React, { useEffect, useState } from "react"
import { Card, Table, Row, Col, Button, Pagination, Empty, notification, Select } from "antd"
import { useLanguage } from "@/hooks/use-language"
import { getLotteryIssues, getLotteryWinners } from "@/lib/api/lotteryV2"
import { TrophyOutlined } from "@ant-design/icons"

export default function LotteryResults() {
  const { t } = useLanguage()
  const [lotteryIssues, setLotteryIssues] = useState<any[]>([])
  const [winners, setWinners] = useState<any[]>([])  // 使用 winners 数组来存储中奖数据
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalIssues, setTotalIssues] = useState(0)

  const [filters, setFilters] = useState({
    issueNumber: "",
  })

  // 加载最近开奖的期号和中奖信息
  useEffect(() => {
    async function fetchData() {
      try {
        const { issues, total } = await getLotteryIssues({ page: 1, page_size: 1, status: "DRAWN" })
        setLotteryIssues(issues)
        console.log("issues", issues)
        setTotalIssues(total)

        if (issues.length > 0) {
          const { Winners } = await getLotteryWinners({ issue_id: issues[0].issue_id })
          setWinners(Winners)  // 使用正确的属性名 Winners
        }
      } catch (error) {
        console.error("Failed to fetch lottery data:", error)
        notification.error({
          message: t("common.error"),
          description: t("results.fetchFailed"),
          placement: "bottomRight",
          duration: 3
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 加载往期开奖结果
  const fetchPastResults = async (page: number, pageSize: number, filters: any) => {
    try {
      const { issues, total } = await getLotteryIssues({
        page,
        page_size: pageSize,
        status: "DRAWN",  // 只查询 DRAWN 状态的期号
        issue_number: filters.issueNumber,
      })
      setLotteryIssues(issues)
      setTotalIssues(total)
    } catch (error) {
      console.error("Failed to fetch past results:", error)
    }
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
    fetchPastResults(page, pageSize, filters)
  }

  const handleFilterChange = (value: string) => {
    const newFilters = { ...filters, issueNumber: value }
    setFilters(newFilters)
    fetchPastResults(page, pageSize, newFilters)
  }

  const columns = [
    {
      title: t("results.issueNumber"),
      dataIndex: "issue_number",
      key: "issue_number",
    },
    {
      title: t("results.status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("results.drawTime"),
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: t("results.drawTxHash"),
      dataIndex: "draw_tx_hash",
      key: "draw_tx_hash",
    },
    {
      title: t("results.winningNumbers"),
      dataIndex: "winning_numbers",
      key: "winning_numbers",
      render: (text: string) => text || t("results.noResults"),
    }
  ]

  // 页面展示部分
  return (
    <div className="space-y-6">
      {/* 近期开奖信息 */}
      {lotteryIssues.length > 0 && (
        <Card
          title={t("results.recentResults")}
          bordered={false}
          style={{
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9f9f9",
            marginBottom: "20px"
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                {t("results.issueNumber")}: {lotteryIssues[0].issue_number}
              </h3>
              <p style={{ marginBottom: "8px" }}>
                <strong>{t("results.drawTime")}:</strong> {lotteryIssues[0].draw_time}
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong>{t("results.winningNumbers")}:</strong> {lotteryIssues[0].winning_numbers || t("results.noResults")}
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong>{t("results.prizePool")}:</strong> {lotteryIssues[0].prize_pool} LOT
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong>{t("results.drawTxHash")}:</strong> {lotteryIssues[0].draw_tx_hash}
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong>{t("results.saleEndTime")}:</strong> {lotteryIssues[0].updated_at}
              </p>
              {/* 显示彩票信息 */}
              <p style={{ marginBottom: "8px" }}>
                <strong>{t("results.lotteryName")}:</strong> {lotteryIssues[0].Lottery.ticket_name}
              </p>
            </Col>
            <Col span={12}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{t("results.winners")}</h3>
              {winners.length > 0 ? (
                <ul>
                  {winners.map((winner) => (
                    <li key={winner.winner_id} style={{ marginBottom: "6px" }}>
                      <strong>{t("results.winnerAddress")}:</strong> {winner.address} -{" "}
                      <strong>{t("results.prizeLevel")}:</strong> {winner.prize_level}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t("results.noWinners")}</p>
              )}
            </Col>
          </Row>
        </Card>
      )}

      {/* 筛选条件 */}
      <Card title={t("results.filter")} bordered={false}>
        <Row gutter={16}>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder={t("results.selectIssueNumber")}
              onChange={handleFilterChange}
            >
              {lotteryIssues.map(issue => (
                <Select.Option key={issue.issue_id} value={issue.issue_number}>
                  {issue.issue_number}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 往期开奖结果 */}
      <Card title={t("results.pastResults")} bordered={false}>
        <Table
          columns={columns}
          dataSource={lotteryIssues}
          rowKey="issue_id"
          pagination={false}
          locale={{
            emptyText: <Empty description={t("common.noResults")} />,
          }}
        />
        {/* 分页组件 */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <Pagination
            current={page}
            total={totalIssues}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger
            showTotal={(total) => `${total} ${t("common.items")}`}
          />
        </div>
      </Card>
    </div>
  )
}