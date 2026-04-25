import Employee from "../../interface/employee.ts";
import { Box, Flex, Text } from "@chakra-ui/react";
import { CloseOutlined } from "@ant-design/icons";
import { Modal } from "antd";

interface EmployeeCardProps {
  employee: Employee;
  onDelete: () => void;
  onClick?: () => void;
  night?: boolean;
}

const EmployeeCard = ({ employee, onDelete, onClick, night }: EmployeeCardProps) => {
  return (
    <Flex
      flexDir={"column"}
      justify={"space-between"}
      p={3}
      borderRadius={"lg"}
      bg={night ? "bg.info" : "bg.warning"}
      border={"1px solid"}
      borderColor={"border"}
      minW={"80px"}
      gap={2}
      flexShrink={0}
      cursor={onClick ? "pointer" : undefined}
      onClick={onClick}
    >
      <Flex justify={"space-between"} align={"center"} gap={2}>
        <Text
          fontWeight={"600"}
          fontSize={"sm"}
          color={employee.isNew ? "brand" : "fg"}
          lineClamp={1}
        >
          {employee.name}
        </Text>
        <Box
          cursor={"pointer"}
          color={"fg.subtle"}
          _hover={{ color: "fg" }}
          fontSize={"10px"}
          onClick={(e) => {
            e.stopPropagation();
            Modal.confirm({
              title: "근무자 삭제",
              content: "선택한 근무자가 삭제됩니다.",
              onOk: onDelete,
            });
          }}
        >
          <CloseOutlined />
        </Box>
      </Flex>
      <Text
        fontSize={"xs"}
        color={"fg.subtle"}
        bg={night ? "bg.info" : "bg.warning"}
      >
        {night ? "야간" : "주간"}
      </Text>
    </Flex>
  );
};

export default EmployeeCard;