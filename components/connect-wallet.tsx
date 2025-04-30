import React, { useState } from "react"
import { Modal, List, Avatar, Tag, Button, message } from "antd"
import { Wallet } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useWallet } from "@/hooks/use-wallet"

export function ConnectWallet() {
  const { t } = useLanguage()
  const { connect } = useWallet()
  const [open, setOpen] = useState(false)

  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum?.isMetaMask

  const wallets = [
    {
      name: "MetaMask",
      key: "MetaMask",
      icon: "/images/metamask.png",
      installed: isMetaMaskInstalled,
    },
    {
      name: "Coinbase",
      key: "Coinbase",
      icon: "/images/coinbase.png",
    },
    {
      name: "All Wallets",
      key: "All",
      icon: "/images/all_wallets.png",
      disabled: true,
    },
  ]

  const handleWalletClick = async (walletType: string) => {
    try {
      await connect(walletType)
      setOpen(false)
    } catch (err) {
      message.error(t("common.connectFailed"))
    }
  }

  return (
    <>
      <Button type="primary" icon={<Wallet />} onClick={() => setOpen(true)}>
        {t("common.connectWallet")}
      </Button>

      <Modal
        open={open}
        title={t("common.connectWallet")}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <List
          itemLayout="horizontal"
          dataSource={wallets}
          renderItem={(wallet) => (
            <List.Item
              style={{
                padding: "12px",
                borderRadius: "12px",
                marginBottom: "8px",
                background: wallet.disabled ? "#f5f5f5" : "#fff",
                cursor: wallet.disabled ? "not-allowed" : "pointer",
                opacity: wallet.disabled ? 0.5 : 1,
              }}
              onClick={() => {
                if (!wallet.disabled) handleWalletClick(wallet.key)
              }}
            >
              <List.Item.Meta
                avatar={<Avatar src={wallet.icon} shape="square" size={40} />}
                title={<span style={{ fontWeight: 500 }}>{wallet.name}</span>}
              />
              {wallet.installed && (
                <Tag color="green" style={{ fontWeight: 500 }}>
                  INSTALLED
                </Tag>
              )}
            </List.Item>
          )}
        />
      </Modal>
    </>
  )
}