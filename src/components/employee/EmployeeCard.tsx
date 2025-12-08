import Employee from "../../interface/employee.ts";
import { Flex, Text } from "@chakra-ui/react";
import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import { Modal } from "antd";

interface EmployeeCardProps {
  employee: Employee;
  onDelete: () => void;
  night?: boolean;
}

const EmployeeCard = ({ employee, onDelete, night }: EmployeeCardProps) => {
  return (
    <Flex
      p={2}
      borderRadius={"2xl"}
      bg={night ? "bg.info" : "bg.warning"}
      border={"1px solid gray"}
    >
      <Flex w={"64px"} flexDir={"column"}>
        <UserOutlined  style={{ fontSize: "84px" }} />
        <Flex justify={"space-between"}>
          <Text
            fontWeight={"bold"}
            color={employee.isNew ? "purple.300" : undefined}
          >
            {employee.name}
          </Text>
          <Flex
            cursor={"pointer"}
            onClick={() =>
              Modal.confirm({
                title: "근무자 삭제",
                content: "선택한 근무자가 삭제됩니다.",
                onOk: onDelete,
              })
            }
          >
            <CloseOutlined />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default EmployeeCard;
