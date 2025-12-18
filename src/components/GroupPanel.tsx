import { Center, Flex, Text } from "@chakra-ui/react";
import useSchedule from "../store/store.tsx";

const GROUP_NAME = ["A", "B", "C", "D"];

const GroupPanel = () => {
  const { isInit, dayGroup, nightGroup } = useSchedule();

  if (!isInit) return <></>;

  return (
    <Flex flexDir={"column"} gap={2}>
      <Text fontWeight={"bold"}>조별 1인 근무횟수</Text>
      <Flex gap={2}>
        <Flex
          p={2}
          flexDir={"column"}
          border={"1px solid black"}
          borderRadius={4}
        >
          <Text fontWeight={"bold"}>주간</Text>
          {dayGroup.map((count, idx) => (
            <Flex gap={2}>
              <Center p={2}>{GROUP_NAME[idx]}</Center>
              <Center p={2}>{count}</Center>
            </Flex>
          ))}
        </Flex>
        <Flex
          p={2}
          flexDir={"column"}
          border={"1px solid black"}
          borderRadius={4}
        >
          <Text fontWeight={"bold"}>야간</Text>
          {nightGroup.map((count, idx) => (
            <Flex gap={2}>
              <Center p={2}>{GROUP_NAME[idx]}</Center>
              <Center p={2}>{count}</Center>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default GroupPanel;
