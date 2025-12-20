import { Center, Flex, Text } from "@chakra-ui/react";
import useSchedule from "../store/schedule.tsx";

const PersonalPanel = () => {
  const { isInit, aloneCount, worker } = useSchedule();

  if (!isInit) return <></>;

  return (
    <Flex py={2} flexDir={"column"} gap={2}>
      <Text fontWeight={"bold"}>1인 근무횟수</Text>
      <Flex flexDir={"column"}>
        {aloneCount.map((count, idx) => (
          <Flex gap={2} py={1}>
            <Center
              fontWeight={"bold"}
              color={worker[idx].isNight ? "blue.300" : "orange.300"}
            >
              {worker[idx].name}
            </Center>
            <Center fontWeight={"bold"}>{count}</Center>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default PersonalPanel;
