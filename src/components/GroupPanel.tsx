import { Center, Flex, Text } from "@chakra-ui/react";
import useSchedule from "../store/store.tsx";

const GROUP_NAME = ["A", "B", "C", "D"];

const GroupPanel = () => {
  const { isInit, dayGroup, nightGroup, numDays, group } = useSchedule();

  const temp = Array(numDays).fill(0);
  const dayGroupTotal = [
    temp.filter((_, idx) => (idx + group) % 4 === 0).length,
    temp.filter((_, idx) => (idx + group) % 4 === 1).length,
    temp.filter((_, idx) => (idx + group) % 4 === 2).length,
    temp.filter((_, idx) => (idx + group) % 4 === 3).length,
  ];
  const nightGroupTotal = [
    temp.filter((_, idx) => (idx + group - 1) % 4 === 0).length,
    temp.filter((_, idx) => (idx + group - 1) % 4 === 1).length,
    temp.filter((_, idx) => (idx + group - 1) % 4 === 2).length,
    temp.filter((_, idx) => (idx + group - 1) % 4 === 3).length,
  ];

  if (!isInit) return <></>;

  return (
    <Flex flexDir={"column"} gap={2}>
      <Text>조별 2인 근무횟수</Text>
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
              <Center p={2}>{dayGroupTotal[idx] - count}</Center>
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
              <Center p={2}>{nightGroupTotal[idx] - count}</Center>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default GroupPanel;
