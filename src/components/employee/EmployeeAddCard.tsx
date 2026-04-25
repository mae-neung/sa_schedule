import { Flex, Text } from "@chakra-ui/react";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Button, Modal, Form, Input, Checkbox, InputNumber, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import Employee from "../../interface/employee.ts";
import setWorker from "../../store/schedule/setWorker.ts";

const EmployeeAddCard = () => {
  const [form] = useForm();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Flex
        onClick={() => setOpen(true)}
        px={3}
        py={2}
        borderRadius={"md"}
        border={"1px dashed"}
        borderColor={"border"}
        cursor={"pointer"}
        alignItems={"center"}
        gap={1}
        color={"fg.subtle"}
        _hover={{ color: "fg", borderColor: "border.strong", bg: "bg.surface" }}
        w={"100%"}
        justify={"center"}
      >
        <PlusOutlined style={{ fontSize: "12px" }} />
        <Text fontSize={"sm"}>근무자 추가</Text>
      </Flex>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={"근무자 추가"}
        footer={null}
      >
        <Form
          form={form}
          onFinish={({
            name,
            isNew,
            targetWorkCount,
            isNight,
          }: {
            name: string;
            isNew?: boolean;
            targetWorkCount: number;
            isNight: boolean;
          }) => {
            if (name == "") {
              Modal.error({
                title: "추가 오류",
                content: "근무자 이름을 등록해주세요.",
              });
              return;
            }

            const emp: Employee = {
              name,
              workCount: 0,
              targetWorkCount,
              isNight,
              isNew,
            };

            setWorker(emp);
            form.resetFields();
            setOpen(false);
          }}
          initialValues={{ name: "", targetWorkCount: 10, isNight: false }}
        >
          <Flex flexDir={"column"} gap={2}>
            <Flex flexDir={"column"} gap={2}>
              <Text fontWeight={"bold"}>이름</Text>
              <Form.Item name={"name"} noStyle>
                <Input />
              </Form.Item>
            </Flex>
            <Flex flexDir={"column"} gap={2}>
              <Text fontWeight={"bold"}>근무 형태</Text>
              <Form.Item name={"isNight"} noStyle>
                <Select
                  options={[
                    { value: false, label: "주간" },
                    { value: true, label: "야간" },
                  ]}
                />
              </Form.Item>
            </Flex>
            <Flex flexDir={"column"} gap={2}>
              <Text fontWeight={"bold"}>목표 근무일</Text>
              <Form.Item name={"targetWorkCount"} noStyle>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Flex>
            <Flex gap={2} py={2}>
              <Text fontWeight={"bold"}>신입</Text>
              <Form.Item name={"isNew"} valuePropName={"checked"} noStyle>
                <Checkbox />
              </Form.Item>
            </Flex>
            <Button htmlType={"submit"}>확인</Button>
          </Flex>
        </Form>
      </Modal>
    </>
  );
};

export default EmployeeAddCard;