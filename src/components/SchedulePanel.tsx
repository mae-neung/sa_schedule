import { Button, Center, Flex, Text } from "@chakra-ui/react";
import { Empty, Modal } from "antd";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSchedule from "../store/schedule.tsx";
import {
  WORK_TYPES,
  COLOR_TYPES,
  GROUP,
  GROUP_WORK_TYPE,
  BG_TYPES,
  WEEKDAY,
  WORK_TYPES_LABEL,
} from "../contant.ts";
import dayjs from "dayjs";
import { LeftOutlined } from "@ant-design/icons";
import GroupPanel from "./GroupPanel.tsx";
import PersonalPanel from "./PersonalPanel.tsx";

const SchedulePanel = () => {
  const navigate = useNavigate();
  const [workType, setWorkType] = useState(0);

  const {
    isInit,
    makeNightSchedule,
    makeDaySchedule,
    dayWorkCount,
    nightWorkCount,
    worker,
    changeSchedule,
    schedule,
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
  const [showGroup, setShowGroup] = useState(false);
  const [groupHighlight, setGroupHighlight] = useState<number>(-1);
  const [workerHighlight, setWorkerHighlight] = useState<number>();

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
    <Center gap={4}>
      <Flex
        p={4}
        borderRadius={"2xl"}
        border={"4px solid gray"}
        w={"1080px"}
        flexDirection={"column"}
      >
        <Flex justify={"space-between"} my={2}>
          <Flex gap={2}>
            <Flex cursor={"pointer"} onClick={() => navigate(-1)}>
              <LeftOutlined />
            </Flex>
            <Text fontWeight={"bold"} fontSize={24}>
              {`${dayjs(date).format("YYYY년 MM월 시간표")} (휴무일 : ${numRest})`}
            </Text>
          </Flex>
          <Flex gap={2}>
            {WORK_TYPES_LABEL.map((type, idx) => (
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
          <Center width={"65px"} />
          {dayWorkCount.map((_, idx) => (
            <Center
              cursor={"pointer"}
              onClick={() => setSelect(idx)}
              p={1}
              flex={1}
            >
              {selectedDay.includes(idx) && (
                <Flex h={"8px"} bg={"orange.500"} flex={1} />
              )}
              {selectedNight.includes(idx) && (
                <Flex h={"8px"} bg="blue.500" flex={1} />
              )}
            </Center>
          ))}
          <Flex p={1} flex={1} />
        </Flex>
        <Flex>
          <Center width={"65px"}>날짜</Center>
          {dayWorkCount.map((_, idx) => (
            <Center
              cursor={"pointer"}
              onClick={() => setSelect(idx)}
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
              flex={1}
            >
              {WEEKDAY[(weekday + idx) % 7]}
            </Center>
          ))}
          <Flex p={1} flex={1} />
        </Flex>
        {schedule.map(
          (emp, idx) =>
            !worker[idx].isNight && (
              <Flex>
                <Center
                  width={"65px"}
                  bg={worker[idx].isNew ? "orange.100" : undefined}
                >
                  {worker[idx].name}
                </Center>
                {emp.map((type, day) => (
                  <Center
                    opacity={
                      idx === workerHighlight
                        ? dayWorkCount[day] === 1 &&
                          [1, 2].includes(schedule[idx][day])
                          ? undefined
                          : "20%"
                        : undefined
                    }
                    fontWeight={
                      groupHighlight > 0 &&
                      (group + 32 - day) % 4 == groupHighlight &&
                      schedule[idx][day] === 1 &&
                      dayWorkCount[day] === 1
                        ? "bold"
                        : undefined
                    }
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
                    cursor={"pointer"}
                  >
                    {WORK_TYPES[type]}
                  </Center>
                ))}
                <Center p={1} flex={1}>
                  {numDays - worker[idx].workCount}
                </Center>
              </Flex>
            ),
        )}
        {schedule.map(
          (emp, idx) =>
            worker[idx].isNight && (
              <Flex>
                <Center width={"65px"}>{worker[idx].name}</Center>
                {emp.map((type, day) => (
                  <Center
                    p={1}
                    flex={1}
                    opacity={
                      idx === workerHighlight
                        ? nightWorkCount[day] === 1 &&
                          [1, 2].includes(schedule[idx][day])
                          ? undefined
                          : "20%"
                        : undefined
                    }
                    bgColor={
                      groupHighlight > -1 &&
                      (group + 32 - day + 1) % 4 == groupHighlight &&
                      schedule[idx][day] === 2 &&
                      nightWorkCount[day] === 1
                        ? "black"
                        : BG_TYPES[type]
                    }
                    cursor={"pointer"}
                    onClick={() => {
                      if (!changeSchedule(idx, day, workType, true))
                        Modal.error({
                          content:
                            "변경된 내용이 없거나, 해당 근무를 배치할 수 없습니다.",
                        });
                    }}
                    color={COLOR_TYPES[type]}
                  >
                    {WORK_TYPES[type]}
                  </Center>
                ))}
                <Center p={1} flex={1}>
                  {numDays - worker[idx].workCount}
                </Center>
              </Flex>
            ),
        )}
        {GROUP.map((g, gIdx) => (
          <Flex bg={"yellow.100"}>
            <Center width={"65px"}>{g}조</Center>
            {dayWorkCount.map((_, idx) => (
              <Center p={1} flex={1}>
                {GROUP_WORK_TYPE[(36 + group - gIdx - idx) % 4]}
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
            <Button onClick={() => setShowGroup((prev) => !prev)}>
              상세정보
            </Button>
          </Flex>
          `<Button onClick={() => scheduleToExcel()}>저장하기</Button>
        </Flex>
      </Flex>
      {showGroup && (
        <Flex
          mt={4}
          p={4}
          borderRadius={"2xl"}
          border={"4px solid gray"}
          flexDirection={"column"}
        >
          <GroupPanel
            group={groupHighlight}
            onClick={(idx) => setGroupHighlight(idx)}
          />
          <PersonalPanel
            emp={workerHighlight}
            onClick={(idx) => setWorkerHighlight(idx)}
          />
        </Flex>
      )}
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
