import { Flex, Text } from "@chakra-ui/react";
import useScheduleStore from "../store/schedule";

const GROUP_NAME = ["A", "B", "C", "D"];

interface GroupPanelProps {
  group: number;
  onClick: (idx: number) => void;
}

const GroupPanel = ({ group, onClick }: GroupPanelProps) => {
  const { isInit, dayGroup, nightGroup } = useScheduleStore();

  if (!isInit) return <></>;

  return (
    <Flex flexDir={"column"} gap={2}>
      <Flex flexDir={"column"} gap={1}>
        {GROUP_NAME.map((name, idx) => (
          <Flex
            key={idx}
            justify={"space-between"}
            align={"center"}
            px={2}
            py={1}
            borderRadius={"md"}
            cursor={"pointer"}
            bg={group === idx ? "bg.subtle" : "transparent"}
            _hover={{ bg: "bg.subtle" }}
            onClick={() => onClick(group === idx ? -1 : idx)}
          >
            <Text fontSize={"sm"} fontWeight={"600"} color={"fg"}>
              {name}조
            </Text>
            <Flex gap={3}>
              <Text fontSize={"sm"} color={"orange.400"} fontWeight={"600"}>
                {dayGroup[idx]}
              </Text>
              <Text fontSize={"sm"} color={"blue.400"} fontWeight={"600"}>
                {nightGroup[idx]}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default GroupPanel;