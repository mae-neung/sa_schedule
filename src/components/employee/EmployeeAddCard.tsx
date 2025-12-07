import { Center, Flex, Text, Button } from "@chakra-ui/react";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Modal, Form, Input, Checkbox } from "antd";
import { useForm } from "antd/es/form/Form";
import useSchedule from "../../store/store.tsx";

interface EmployeeAddCardProps {
  night?: boolean;
}

const EmployeeAddCard = ({ night }: EmployeeAddCardProps) => {
  const [form] = useForm();

  const [employee, setEmployee] = useState<"day" | "night">();

  const { setWorker } = useSchedule();

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
          onFinish={({ name, isNew }: { name: string; isNew?: boolean }) => {
            if (name == "") {
              Modal.error({
                title: "추가 오류",
                content: "근무자 이름을 등록해주세요.",
              });
              return;
            }

            const emp = { name, workCount: 0, isNew };

            setWorker(emp, employee == "night");

            form.resetFields();
            setEmployee(undefined);
          }}
          initialValues={{
            name: "",
          }}
        >
          <Flex flexDir={"column"} gap={2}>
            <Center gap={2}>
              <Flex width={"30px"}>
                <Text>이름</Text>
              </Flex>
              <Form.Item name={"name"} noStyle>
                <Input />
              </Form.Item>
            </Center>
            <Flex gap={2}>
              <Flex width={"30px"}>
                <Text>신입</Text>
              </Flex>
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
