import { Flex, Text } from "@chakra-ui/react";
import useScheduleStore from "../store/schedule";

const GROUP_NAME = ["A", "B", "C", "D"];

interface GroupPanelProps {
  group: number;
  onClick: (idx: number) => void;
}

const GroupPanel = ({ group, onClick }: GroupPanelProps) => {
  const {
    isInit,
    dayWorkCount,
    nightWorkCount,
    group: storeGroup,
    numDays,
    selectedDay,
    selectedNight,
  } = useScheduleStore();

  if (!isInit) return <></>;

  const dayDouble = Array(4).fill(0);
  const dayTotal = Array(4).fill(0);
  const nightDouble = Array(4).fill(0);
  const nightTotal = Array(4).fill(0);

  for (let day = 0; day < numDays; day++) {
    const dIdx = (32 + storeGroup - day) % 4;
    const nIdx = (33 + storeGroup - day) % 4;

    if (!selectedDay.includes(day)) {
      dayTotal[dIdx]++;
      if (dayWorkCount[day] === 2) dayDouble[dIdx]++;
    }
    if (!selectedNight.includes(day)) {
      nightTotal[nIdx]++;
      if (nightWorkCount[day] === 2) nightDouble[nIdx]++;
    }
  }

  return (
    <Flex flexDir={"column"} gap={1}>
      <Flex justify={"flex-end"} px={2} gap={2}>
        <Text fontSize={"xs"} color={"orange.400"} fontWeight={"500"} w={"52px"} textAlign={"center"} whiteSpace={"nowrap"}>
          2인/전체
        </Text>
        <Text fontSize={"xs"} color={"blue.400"} fontWeight={"500"} w={"52px"} textAlign={"center"} whiteSpace={"nowrap"}>
          2인/전체
        </Text>
      </Flex>
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
          <Flex gap={2}>
            <Text fontSize={"sm"} color={"orange.400"} fontWeight={"600"} w={"52px"} textAlign={"center"}>
              {dayDouble[idx]}/{dayTotal[idx]}
            </Text>
            <Text fontSize={"sm"} color={"blue.400"} fontWeight={"600"} w={"52px"} textAlign={"center"}>
              {nightDouble[idx]}/{nightTotal[idx]}
            </Text>
          </Flex>
        </Flex>
      ))}
      <Text fontSize={"xs"} color={"fg.subtle"} px={2} pt={1}>
        * 2인 필수 근무일 제외
      </Text>
    </Flex>
  );
};

export default GroupPanel;