import { useState, useEffect } from "react"
import { Modal, Form, Input, Select, Button } from "antd"
import { useLanguage } from "@/hooks/use-language"
import { useWallet } from "@/hooks/use-wallet"
import { createLottery, getLotteryTypes } from "@/lib/api/lotteryV2"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

function CreateLotteryDialog({ open, onOpenChange, onCreated }: { open: boolean, onOpenChange: (open: boolean) => void, onCreated: (lottery: any) => void }) {
  const { t } = useLanguage()
  const { address } = useWallet()

  const formSchema = z.object({
    ticket_name: z.string().min(1, { message: t("results.ticketNameRequired") }),
    type_id: z.string().min(1, { message: t("results.typeNameRequired") }),
    ticket_price: z.number().positive({ message: t("results.ticketPriceRequired") }),
    ticket_supply: z.number().int().positive({ message: t("results.ticketSupplyRequired") }),
    betting_rules: z.string().min(1, { message: t("results.bettingRulesRequired") }),
    prize_structure: z.string().min(1, { message: t("results.prizeStructureRequired") }),
    rollout_contract_address: z.string().min(1, { message: t("results.rolloutContractAddressRequired") }),
  })
  type FormValues = z.infer<typeof formSchema>

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticket_name: "",
      type_id: "",
      ticket_price: 0,
      ticket_supply: 0,
      betting_rules: "",
      prize_structure: "",
      rollout_contract_address: "",
    }
  })

  const [lotteryTypes, setLotteryTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const selectedTypeId = watch("type_id")

  useEffect(() => {
    if (open) {
      getLotteryTypes().then((types) => {
        setLotteryTypes(types)
        if (types.length > 0) {
          setValue("type_id", types[0].type_id) // 默认选第一个
        }
      }).catch(console.error)
    }
  }, [open, setValue])

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)
      const newLottery = await createLottery({
        ...data,
        registered_addr: address || "",
      })
      onCreated(newLottery)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Failed to create lottery:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={t("results.addLottery")}
      onCancel={() => onOpenChange(false)}
      footer={null}
      destroyOnClose
      maskClosable={false}  // <<<< 加上这行！
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label={t("results.ticketName")}
          validateStatus={errors.ticket_name ? "error" : ""}
          help={errors.ticket_name?.message}
        >
          <Input {...register("ticket_name")} />
        </Form.Item>

        <Form.Item
          label={t("results.typeName")}
          validateStatus={errors.type_id ? "error" : ""}
          help={errors.type_id?.message}
        >
          <Select value={selectedTypeId} onChange={(value) => setValue("type_id", value)}>
            {lotteryTypes.map((type) => (
              <Select.Option key={type.type_id} value={type.type_id}>
                {type.type_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={t("results.ticketPrice")}
          validateStatus={errors.ticket_price ? "error" : ""}
          help={errors.ticket_price?.message}
        >
          <Input type="number" {...register("ticket_price", { valueAsNumber: true })} />
        </Form.Item>

        <Form.Item
          label={t("results.ticketSupply")}
          validateStatus={errors.ticket_supply ? "error" : ""}
          help={errors.ticket_supply?.message}
        >
          <Input type="number" {...register("ticket_supply", { valueAsNumber: true })} />
        </Form.Item>

        <Form.Item
          label={t("results.bettingRules")}
          validateStatus={errors.betting_rules ? "error" : ""}
          help={errors.betting_rules?.message}
        >
          <Input {...register("betting_rules")} />
        </Form.Item>

        <Form.Item
          label={t("results.prizeStructure")}
          validateStatus={errors.prize_structure ? "error" : ""}
          help={errors.prize_structure?.message}
        >
          <Input {...register("prize_structure")} />
        </Form.Item>

        <Form.Item
          label={t("results.rolloutContractAddr")}
          validateStatus={errors.rollout_contract_address ? "error" : ""}
          help={errors.rollout_contract_address?.message}
        >
          <Input {...register("rollout_contract_address")} />
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            loading={loading}
            block
          >
            {loading ? t("common.submitting") : t("common.submit")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateLotteryDialog