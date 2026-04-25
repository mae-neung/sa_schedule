import { Flex, Text } from "@chakra-ui/react";
import useScheduleStore from "../store/schedule";

interface PersonalPanelProps {
  emp?: number;
  onClick: (idx?: number) => void;
}

const PersonalPanel = ({ emp, onClick }: PersonalPanelProps) => {
  const { isInit, aloneCount, worker } = useScheduleStore();

  if (!isInit) return <></>;

  return (
    <Flex flexDir={"column"} gap={2}>
      <Text fontSize={"xs"} fontWeight={"600"} color={"fg.subtle"} textTransform={"uppercase"} letterSpacing={"wider"}>
        1인 근무 횟수
      </Text>
      <Flex flexDir={"column"} gap={1}>
        {aloneCount.map((count, idx) => (
          <Flex
            key={idx}
            justify={"space-between"}
            align={"center"}
            px={2}
            py={1}
            borderRadius={"md"}
            cursor={"pointer"}
            bg={emp === idx ? "bg.subtle" : "transparent"}
            _hover={{ bg: "bg.subtle" }}
            onClick={() => onClick(emp === idx ? undefined : idx)}
          >
            <Text
              fontSize={"sm"}
              fontWeight={"500"}
              color={worker[idx].isNight ? "blue.400" : "orange.400"}
            >
              {worker[idx].name}
            </Text>
            <Text fontSize={"sm"} fontWeight={"600"} color={"fg"}>
              {count}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default PersonalPanel;