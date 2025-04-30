import React, { useEffect, useState } from "react"
import { Card, Table, Row, Col, Button, Empty, notification,Pagination } from "antd"
import { useLanguage } from "@/hooks/use-language"
import { getLotteryTickets, getLotteryWinners} from "@/lib/api/lotteryV2"
import ReactECharts from "echarts-for-react"
import { PieChartOutlined } from "@ant-design/icons"
import { useWallet } from "@/hooks/use-wallet"

export default function PurchaseHistory() {
  const { t } = useLanguage()
  const { address } = useWallet()
  const [ticketHistory, setTicketHistory] = useState<any[]>([])  // 当前用户的彩票购买记录
  const [statData, setStatData] = useState<any>({})  // 中奖和未中奖的数据统计
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  

  // 加载当前用户的彩票购买记录和中奖数据
  useEffect(() => {
    async function fetchData() {
      try {
        // 获取当前用户的所有购买记录
        const { Tickets } = await getLotteryTickets({ buyer_address: address ||"" })  // 这里需要替换成当前用户的地址
        setTicketHistory(Tickets)


        // 对每种彩票进行中奖和未中奖的统计
        const lotteryStats: any = {}

        for (const ticket of Tickets) {
          // 获取彩票对应的中奖数据
          const { Winners } = await getLotteryWinners({ issue_id: ticket.issue_id })
           
          for (const winner of Winners) {
            if (!lotteryStats[winner.LotteryIssue.lottery_id]) {
              lotteryStats[winner.LotteryIssue.lottery_id] = { won: 0, lost: 0 }
            }
            const isWinner= (winner.address === ticket.buyer_address)
            if (isWinner) {
              lotteryStats[winner.LotteryIssue.lottery_id].won += 1
            } else {
              lotteryStats[winner.LotteryIssue.lottery_id].lost += 1
            }
          }
        }

        setStatData(lotteryStats)
      } catch (error) {
        console.error("Failed to fetch purchase history:", error)
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

  // 图表配置
  const chartOption = {
    title: {
      text: t("results.purchaseAnalysis"),
      left: "center",
      top: "20px",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: t("results.purchaseResult"),
        type: "pie",
        radius: "50%",
        data: Object.keys(statData).map((lotteryId) => {
          const { won, lost } = statData[lotteryId]
          return {
            value: won + lost,
            name: `Lottery ${lotteryId} - ${t("results.won")}: ${won}, ${t("results.lost")}: ${lost}`,
          }
        }),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page)
    setPageSize(pageSize)
    //fetchPastResults(page, pageSize, filters)
  }
  // 表格列定义
  const columns = [
    {
      title: t("results.ticketName"),
      dataIndex: "lottery_name",
      key: "lottery_name",
      width: 150,
      ellipsis: true,
      render: (_: any, record: any) => (
        <span title={record.LotteryIssue.Lottery.ticket_name}>
          {record.LotteryIssue.Lottery.ticket_name}
        </span>
      ),
    },
    {
      title: t("results.issueNumber"),
      dataIndex: "issue_number",
      key: "issue_number",
      width: 120,
      ellipsis: true,
      render: (_: any, record: any) => (
        <span title={record.LotteryIssue.issue_number}>
          {record.LotteryIssue.issue_number}
        </span>
      ),
    },
    {
      title: t("results.ticketStatus"),
      dataIndex: "ticket_status",
      key: "ticket_status",
      width: 120,
      ellipsis: true,
      render: (_: any, record: any) => {
        const status = statData[record.LotteryIssue.lottery_id]
          ? statData[record.LotteryIssue.lottery_id].won > 0
            ? t("results.won")
            : t("results.lost")
          : t("results.noResults")
          return <span title={status}>{status}</span>
      },
    },
    {
      title: t("results.purchaseTime"),
      dataIndex: "purchase_time",
      key: "purchase_time",
      width: 180,
      ellipsis: true,
      render: (text: any) => <span title={text}>{text}</span>,
    },
    {
      title: t("results.purchaseTxHash"),
      dataIndex: "transaction_hash",
      key: "transaction_hash",
      width: 180,
      ellipsis: true,
      render: (text: any) => <span title={text}>{text}</span>,
    },
    {
      title: t("results.betContent"),
      dataIndex: "bet_content",
      key: "bet_content",
      width: 160,
      ellipsis: true,
      render: (text: any) => <span title={text}>{text}</span>,
    },
    {
      title: t("results.purchaseAmount"),
      dataIndex: "purchase_amount",
      key: "purchase_amount",
      width: 120,
      ellipsis: true,
      render: (text: any) => <span title={text}>{text}</span>,
    },

  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Empty description={t("common.loading")} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 购买历史的图形展示 */}
      <Card
        title={t("results.purchaseAnalysis")}
        bordered={false}
        style={{
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#f9f9f9",
          marginBottom: "20px",
        }}
      >
        <ReactECharts option={chartOption} style={{ height: "400px" }} />
      </Card>

      {/* 用户购买记录表格 */}
      <Card title={t("results.purchaseHistory")} bordered={false}>
      <Table
          columns={columns}
          dataSource={ticketHistory}
          rowKey="ticket_id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: ticketHistory.length,
            showSizeChanger: true,
            showTotal: (total) => `${total} ${t("common.items")}`,
            onChange: handlePageChange,
          }}
          locale={{
            emptyText: <Empty description={t("common.noResults")} />,
          }}
        />
        {/* 分页组件 */}
        {/* <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <Pagination
            current={page}
            total={ticketHistory.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger
            showTotal={(total) => `${total} ${t("common.items")}`}
          />
        </div> */}
      </Card>
    </div>
  )
}