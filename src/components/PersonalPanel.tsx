import { Center, Flex, Text } from "@chakra-ui/react";
import useSchedule from "../store/schedule.tsx";

interface PersonalPanelProps {
  emp?: number;
  onClick: (idx?: number) => void;
}

const PersonalPanel = ({ emp, onClick }: PersonalPanelProps) => {
  const { isInit, aloneCount, worker } = useSchedule();

  if (!isInit) return <></>;

  return (
    <Flex py={2} flexDir={"column"} gap={2}>
      <Text fontWeight={"bold"}>1인 근무횟수</Text>
      <Flex flexDir={"column"}>
        {aloneCount.map((count, idx) => (
          <Flex
            gap={2}
            py={1}
            cursor={"pointer"}
            onClick={() => {
              if (emp === idx) {
                onClick(undefined);
                return;
              }
              onClick(idx);
            }}
          >
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
