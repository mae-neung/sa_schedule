import { Button, Center, Flex, Text } from "@chakra-ui/react";
import { Empty, Modal } from "antd";
import { useCallback, useState } from "react";
import useSchedule from "../store/store.tsx";
import {
  WORK_TYPES,
  COLOR_TYPES,
  GROUP,
  GROUP_WORK_TYPE,
  BG_TYPES,
  WEEKDAY,
} from "../contant.ts";
import dayjs from "dayjs";

const SchedulePanel = () => {
  const [workType, setWorkType] = useState(0);

  const {
    isInit,
    makeNightSchedule,
    makeDaySchedule,
    dayWorkCount,
    nightWorkCount,
    dayWorker,
    nightWorker,
    changeSchedule,
    daySchedule,
    nightSchedule,
    weekday,
    numDays,
    group,
    numRest,
    base,
    selectedDay,
    selectedNight,
    setSelected,
    date,
    saveBase,
    scheduleToExcel,
    loadBase,
    resetBase,
  } = useSchedule();

  const [select, setSelect] = useState<number>();

  const handleSelect = useCallback(
    (night?: boolean) => {
      if (!select) return;
      if (night) {
        if (selectedNight.includes(select))
          setSelected([...selectedNight.filter((v) => v != select)], night);
        else setSelected([...selectedNight, select], night);
        setSelect(undefined);
        return;
      }
      if (selectedDay.includes(select))
        setSelected([...selectedDay.filter((v) => v != select)]);
      else setSelected([...selectedDay, select]);
      setSelect(undefined);
    },
    [select, selectedNight, selectedDay],
  );

  if (!isInit)
    return (
      <Center my={"200px"}>
        <Empty description={"스케줄이 없습니다."} />
      </Center>
    );

  return (
    <Center>
      <Flex
        p={4}
        borderRadius={"2xl"}
        border={"4px solid gray"}
        w={"1080px"}
        overflowX={"scroll"}
        scrollbar={"hidden"}
        mt={5}
        flexDirection={"column"}
      >
        <Flex justify={"space-between"} my={2}>
          <Text fontWeight={"bold"} fontSize={24}>
            {`${dayjs(date).format("YYYY년 MM월 시간표")} (휴무일 : ${numRest})`}
          </Text>
          <Flex gap={2}>
            {WORK_TYPES.map((type, idx) => (
              <Button
                bg={workType == idx ? "orange" : undefined}
                onClick={() => setWorkType(idx)}
              >
                {type}
              </Button>
            ))}
          </Flex>
        </Flex>
        <Flex>
          <Center width={"65px"}>날짜</Center>
          {dayWorkCount.map((_, idx) => (
            <Center
              cursor={"pointer"}
              onClick={() => setSelect(idx)}
              bg={selectedDay.includes(idx) ? "orange.100" : ""}
              fontWeight={selectedNight.includes(idx) ? "bold" : ""}
              p={1}
              flex={1}
            >
              {idx + 1}
            </Center>
          ))}
          <Flex p={1} flex={1} />
        </Flex>
        <Flex>
          <Center width={"65px"}>요일</Center>
          {dayWorkCount.map((_, idx) => (
            <Center
              cursor={"pointer"}
              onClick={() => setSelect(idx)}
              p={1}
              bg={selectedDay.includes(idx) ? "orange.100" : ""}
              fontWeight={selectedNight.includes(idx) ? "bold" : ""}
              flex={1}
            >
              {WEEKDAY[(weekday + idx) % 7]}
            </Center>
          ))}
          <Flex p={1} flex={1} />
        </Flex>
        {daySchedule.map((emp, idx) => (
          <Flex>
            <Center
              width={"65px"}
              bg={dayWorker[idx].isNew ? "orange.100" : undefined}
            >
              {dayWorker[idx].name}
            </Center>
            {emp.map((type, day) => (
              <Center
                p={1}
                flex={1}
                bgColor={BG_TYPES[type]}
                onClick={() => {
                  if (!changeSchedule(idx, day, workType))
                    Modal.error({
                      content:
                        "변경된 내용이 없거나, 해당 근무를 배치할 수 없습니다.",
                    });
                }}
                color={COLOR_TYPES[type]}
                cursor={"cursor"}
              >
                {WORK_TYPES[type]}
              </Center>
            ))}
            <Center p={1} flex={1}>
              {numDays - dayWorker[idx].workCount}
            </Center>
          </Flex>
        ))}
        {nightSchedule.map((emp, idx) => (
          <Flex>
            <Center width={"65px"}>{nightWorker[idx].name}</Center>
            {emp.map((type, day) => (
              <Center
                p={1}
                flex={1}
                bgColor={BG_TYPES[type]}
                onClick={() => changeSchedule(idx, day, workType, true)}
                color={COLOR_TYPES[type]}
              >
                {WORK_TYPES[type]}
              </Center>
            ))}
            <Center p={1} flex={1}>
              {numDays - nightWorker[idx].workCount}
            </Center>
          </Flex>
        ))}
        {GROUP.map((g, gIdx) => (
          <Flex bg={"yellow.100"}>
            <Center width={"65px"}>{g}조</Center>
            {dayWorkCount.map((_, idx) => (
              <Center p={1} flex={1}>
                {GROUP_WORK_TYPE[(group + gIdx + idx) % 4]}
              </Center>
            ))}
            <Flex p={1} flex={1} />
          </Flex>
        ))}
        <Flex>
          <Center width={"65px"}>주간조</Center>
          {dayWorkCount.map((count) => (
            <Center p={1} flex={1}>
              {count}
            </Center>
          ))}
          <Flex p={1} flex={1} />
        </Flex>
        <Flex>
          <Center width={"65px"}>야간조</Center>
          {nightWorkCount.map((count) => (
            <Center p={1} flex={1}>
              {count}
            </Center>
          ))}
          <Flex p={1} flex={1} />
        </Flex>
        <Flex justify={"space-between"}>
          <Flex gap={2}>
            <Button
              onClick={() => {
                if (base) loadBase();
                else saveBase();

                makeDaySchedule(true);
                makeNightSchedule();
              }}
            >
              근무 배치
            </Button>
            <Button
              onClick={() => {
                Modal.confirm({
                  title: "근무 배치",
                  content:
                    "근무 배치를 초기화해요. (현재 스케줄이 삭제됩니다.)",
                  onOk: () => {
                    loadBase();
                    resetBase();
                  },
                });
              }}
            >
              리셋
            </Button>
          </Flex>
          <Button onClick={() => scheduleToExcel()}>저장하기</Button>
        </Flex>
      </Flex>
      <Modal
        open={!!select}
        title={"2인 근무일 선택"}
        footer={null}
        onCancel={() => setSelect(undefined)}
      >
        <Flex flexDir={"column"} gap={2}>
          2인 근무를 원하는 근무를 선택해주세요.
          <Button onClick={() => handleSelect()}>
            {selectedDay.includes(select!) ? "주간 삭제" : "주간 설정"}
          </Button>
          <Button onClick={() => handleSelect(true)}>
            {selectedNight.includes(select!) ? "야간 삭제" : "야간 설정"}
          </Button>
        </Flex>
      </Modal>
    </Center>
  );
};

export default SchedulePanel;
