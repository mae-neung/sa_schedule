import { Button, Center, Flex, Text } from "@chakra-ui/react";
import { Empty, Form, Input, InputNumber, Modal } from "antd";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import useScheduleStore from "../store/schedule";
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
import { useLocalStorage } from "@reactuses/core";
import setSelected from "../store/schedule/setSelected.ts";
import changeSchedule from "../store/schedule/changeSchedule.ts";
import changeGroup from "../store/schedule/changeGroup.ts";
import loadBase from "../store/schedule/loadBase.ts";
import saveBase from "../store/schedule/saveBase.ts";
import makeDaySchedule from "../store/schedule/makeDaySchedule.ts";
import makeNightSchedule from "../store/schedule/makeNightSchedule.ts";
import resetBase from "../store/schedule/resetBase.ts";
import toJson from "../store/schedule/toJson.ts";
import scheduleToExcel from "../store/schedule/scheduleToExcel.ts";
import initNextMonth from "../store/schedule/initNextMonth.ts";
import updateWorker from "../store/schedule/updateWorker.ts";
import addNew from "../store/schedule/addNew.ts";

const SchedulePanel = () => {
  const navigate = useNavigate();
  const [workType, setWorkType] = useState(0);
  const [_, setRecentSchedule] = useLocalStorage("recentSchedule", "");

  const {
    isInit,
    dayWorkCount,
    nightWorkCount,
    worker,
    schedule,
    weekday,
    numDays,
    group,
    base,
    selectedDay,
    selectedNight,
    date,
  } = useScheduleStore();

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

  const handleChange = useCallback(
    (idx: number, type: "rest" | "workType") => {
      if (base) {
        Modal.error({
          title: "시간표 기본정보 변경",
          content:
            "시간표가 생성된 상태에서는 변경 불가능해요. 리셋후에 변경해주세요.",
        });
        return;
      }

      if (type === "workType") {
        const emp = { ...worker[idx] };
        emp.isNight = !emp.isNight;
        updateWorker(idx, emp);
        return;
      }

      if (type === "rest") {
        let numRest = 0;
        Modal.confirm({
          onOk: () => {
            if (numRest == 0) return;
            const emp = { ...worker[idx] };
            emp.targetWorkCount = numRest;
            updateWorker(idx, emp);
          },
          title: "목표 휴일 변경",
          content: (
            <InputNumber onInput={(v) => (numRest = Number.parseInt(v))} />
          ),
        });
        return;
      }
    },
    [worker, base],
  );

  const handleAddNew = useCallback(() => {
    if (!base) {
      Modal.error({
        title: "신입 근무자 추가",
        content: "시간표 배치후에 진행해 주세요.",
      });
      return;
    }

    let name = "";
    let startDate = 0;

    Modal.confirm({
      title: "신입 근무자 추가",
      content: (
        <Form layout={"vertical"}>
          <Form.Item label={"이름"}>
            <Input onChange={(e) => (name = e.target.value)} />
          </Form.Item>
          <Form.Item label={"근무 시작일"}>
            <InputNumber
              min={1}
              max={31}
              onInput={(v) => (startDate = Number.parseInt(v))}
            />
          </Form.Item>
        </Form>
      ),
      onOk: () => addNew(name, startDate),
    });
  }, [worker, base]);

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
              {`${dayjs(date).format("YYYY년 MM월 시간표")}`}
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
          <Flex p={1} flex={1} />
        </Flex>
        {schedule.map(
          (emp, idx) =>
            !worker[idx].isNight && (
              <Flex>
                <Center
                  width={"65px"}
                  bg={"orange.100"}
                  fontWeight={worker[idx].isNew ? "bold" : undefined}
                  cursor={"pointer"}
                  onClick={() => handleChange(idx, "workType")}
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
                    bg={
                      groupHighlight > -1 &&
                      (32 + group - day) % 4 == groupHighlight &&
                      schedule[idx][day] === 1 &&
                      dayWorkCount[day] === 1
                        ? "yellow.100"
                        : BG_TYPES[type]
                    }
                    p={1}
                    flex={1}
                    onClick={() => {
                      changeSchedule(idx, day, workType);
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
                <Center
                  p={1}
                  flex={1}
                  color={"orange.400"}
                  cursor={"pointer"}
                  onClick={() => handleChange(idx, "rest")}
                >
                  {worker[idx].targetWorkCount}
                </Center>
              </Flex>
            ),
        )}
        {schedule.map(
          (emp, idx) =>
            worker[idx].isNight && (
              <Flex>
                <Center
                  width={"65px"}
                  bg={"blue.100"}
                  fontWeight={worker[idx].isNew ? "bold" : undefined}
                  cursor={"pointer"}
                  onClick={() => handleChange(idx, "workType")}
                >
                  {worker[idx].name}
                </Center>
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
                      (32 + group - day - 1) % 4 == groupHighlight &&
                      schedule[idx][day] === 2 &&
                      nightWorkCount[day] === 1
                        ? "black"
                        : BG_TYPES[type]
                    }
                    cursor={"pointer"}
                    onClick={() => {
                      changeSchedule(idx, day, workType, true);
                    }}
                    color={COLOR_TYPES[type]}
                  >
                    {WORK_TYPES[type]}
                  </Center>
                ))}
                <Center p={1} flex={1}>
                  {numDays - worker[idx].workCount}
                </Center>
                <Center
                  p={1}
                  flex={1}
                  color={"orange.400"}
                  cursor={"pointer"}
                  onClick={() => handleChange(idx, "rest")}
                >
                  {worker[idx].targetWorkCount}
                </Center>
              </Flex>
            ),
        )}
        {GROUP.map((g, gIdx) => (
          <Flex>
            <Center
              bg={group === gIdx ? "orange.100" : "yellow.100"}
              width={"65px"}
              onClick={() => changeGroup(gIdx)}
              cursor={"pointer"}
            >
              {g}조
            </Center>
            {dayWorkCount.map((_, idx) => (
              <Center bg={"yellow.100"} p={1} flex={1}>
                {GROUP_WORK_TYPE[(36 + group - gIdx - idx) % 4]}
              </Center>
            ))}
            <Flex p={1} flex={1} />
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
          <Flex p={1} flex={1} />
        </Flex>
        <Flex justify={"space-between"}>
          <Flex gap={2}>
            <Button
              onClick={() => {
                if (base) loadBase();
                else saveBase();

                makeDaySchedule();
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
            <Button onClick={() => handleAddNew()}>신입 근무자 추가</Button>
          </Flex>
          <Flex gap={2}>
            <Button
              onClick={() => {
                Modal.confirm({
                  title: "다음달 근무표 생성",
                  content:
                    "현재 시간표를 기준으로 다음달 시간표를 생성합니다.\n기존에 적용된 내용은 다음달 시간표 저장시까지 유지됩니다.(최근 시간표 불러오기)",
                  onOk: () => {
                    initNextMonth();
                  },
                });
              }}
            >
              다음달 근무표
            </Button>
            <Button
              onClick={() => {
                setRecentSchedule(toJson());
                scheduleToExcel();
              }}
            >
              저장하기
            </Button>
          </Flex>
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
