import { Center, Flex, Text } from "@chakra-ui/react";
import useSchedule from "../store/schedule.tsx";

const GROUP_NAME = ["A", "B", "C", "D"];

interface GroupPanelProps {
  group: number;
  onClick: (idx: number) => void;
}

const GroupPanel = ({ group, onClick }: GroupPanelProps) => {
  const { isInit, dayGroup, nightGroup } = useSchedule();

  if (!isInit) return <></>;

  return (
    <Flex flexDir={"column"} gap={2}>
      <Text fontWeight={"bold"}>조별 1인 근무횟수</Text>
      <Flex flexDir={"column"}>
        {GROUP_NAME.map((name, idx) => (
          <Flex
            gap={4}
            py={2}
            cursor={"pointer"}
            onClick={() => {
              if (group === idx) {
                onClick(-1);
                return;
              }
              onClick(idx);
            }}
          >
            <Center fontWeight={"bold"}>{name}</Center>
            <Center fontWeight={"bold"} color={"orange.300"}>
              {dayGroup[idx]}
            </Center>
            <Center fontWeight={"bold"} color={"blue.300"}>
              {nightGroup[idx]}
            </Center>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default GroupPanel;
