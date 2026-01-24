import { Center, Flex, Text, Button } from "@chakra-ui/react";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Modal, Form, Input, Checkbox, InputNumber } from "antd";
import { useForm } from "antd/es/form/Form";
import Employee from "../../interface/employee.ts";
import setWorker from "../../store/schedule/setWorker.ts";

interface EmployeeAddCardProps {
  night?: boolean;
}

const EmployeeAddCard = ({ night }: EmployeeAddCardProps) => {
  const [form] = useForm();

  const [employee, setEmployee] = useState<"day" | "night">();

  return (
    <>
      <Flex
        onClick={() => setEmployee(night ? "night" : "day")}
        p={2}
        borderRadius={"2xl"}
        bg={night ? "bg.info" : "bg.warning"}
        height={"124px"}
        border={"1px solid gray"}
        cursor={"pointer"}
      >
        <Center w={"64px"}>
          <PlusOutlined style={{ fontSize: "24px" }} />
        </Center>
      </Flex>
      <Modal
        open={!!employee}
        onCancel={() => setEmployee(undefined)}
        title={"근무자 추가"}
        footer={null}
      >
        <Form
          form={form}
          onFinish={({
            name,
            isNew,
            targetWorkCount,
          }: {
            name: string;
            isNew?: boolean;
            targetWorkCount: number;
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
              isNight: employee == "night",
              isNew,
            };

            setWorker(emp);

            form.resetFields();
            setEmployee(undefined);
          }}
          initialValues={{
            name: "",
            targetWorkCount: 10,
          }}
        >
          <Flex flexDir={"column"} gap={2}>
            <Flex flexDir={"column"} gap={2}>
              <Text fontWeight={"bold"}>이름</Text>
              <Form.Item name={"name"} noStyle>
                <Input />
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
            <Button type={"submit"}>확인</Button>
          </Flex>
        </Form>
      </Modal>
    </>
  );
};

export default EmployeeAddCard;
