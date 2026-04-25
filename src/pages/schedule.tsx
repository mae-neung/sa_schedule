import { Box, Button, Center, Flex, Text } from "@chakra-ui/react";
import { Empty, Form, Input, InputNumber, Modal, Popover } from "antd";
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
import GroupPanel from "../components/GroupPanel.tsx";
import PersonalPanel from "../components/PersonalPanel.tsx";
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
import applyHolidays from "../store/schedule/applyHolidays.ts";
import updateWorker from "../store/schedule/updateWorker.ts";
import addNew from "../store/schedule/addNew.ts";
import matchSchedule from "../store/schedule/matchSchedule.ts";

const CELL_W = "58px";
const CELL_H = "30px";
const EXTRA_COLS = 2;

const SchedulePage = () => {
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
    selectedDay,
    selectedNight,
    holidays,
    date,
  } = useScheduleStore();

  const [select, setSelect] = useState<number>();
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
      if (localStorage.getItem("schedule-base")) {
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
    [worker],
  );

  const handleAddNew = useCallback(() => {
    if (!localStorage.getItem("schedule-base")) {
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
  }, [worker]);

  if (!isInit)
    return (
      <Flex align={"center"} justify={"center"} minH={"100vh"} bg={"bg"}>
        <Empty description={"스케줄이 없습니다."} />
      </Flex>
    );

  return (
    <Flex flexDir={"column"} minH={"100vh"} bg={"bg"} color={"fg"}>

      {/* 헤더 */}
      <Flex
        align={"center"}
        justify={"space-between"}
        px={6}
        py={4}
        borderBottom={"1px solid"}
        borderColor={"border"}
        position={"sticky"}
        top={0}
        bg={"bg"}
        zIndex={10}
      >
        <Flex align={"center"} gap={3}>
          <Flex
            cursor={"pointer"}
            color={"fg.subtle"}
            _hover={{ color: "fg" }}
            onClick={() => navigate(-1)}
            fontSize={"sm"}
          >
            <LeftOutlined />
          </Flex>
          <Text fontWeight={"700"} fontSize={"lg"} color={"fg"}>
            {dayjs(date).format("YYYY년 MM월 시간표")}
          </Text>
        </Flex>

        {/* 근무 유형 선택 */}
        <Flex gap={1}>
          {WORK_TYPES_LABEL.map((type, idx) => (
            <Button
              key={idx}
              onClick={() => setWorkType(idx)}
              h={"28px"}
              px={3}
              fontSize={"sm"}
              fontWeight={"500"}
              borderRadius={"full"}
              bg={workType === idx ? BG_TYPES[idx] : "transparent"}
              color={workType === idx ? COLOR_TYPES[idx] : "fg.subtle"}
              border={"1px solid"}
              borderColor={workType === idx ? COLOR_TYPES[idx] : "border"}
              _hover={{ bg: BG_TYPES[idx], color: COLOR_TYPES[idx], borderColor: COLOR_TYPES[idx] }}
            >
              {type}
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* 시간표 본문 */}
      <Flex flex={1} overflow={"hidden"}>
        <Flex flexDir={"column"} flex={1} overflowY={"auto"}>
        <Box overflowX={"auto"}>
          <Box minW={"max-content"}>

            {/* 날짜 + 2인 근무 인디케이터 */}
            <Flex borderBottom={"1px solid"} borderColor={"border"} bg={"bg.surface"}>
              <Center w={CELL_W} flexShrink={0} fontSize={"sm"} color={"fg.subtle"} fontWeight={"600"}>
                날짜
              </Center>
              {dayWorkCount.map((_, idx) => {
                const hasDay = selectedDay.includes(idx);
                const hasNight = selectedNight.includes(idx);
                return (
                  <Popover
                    key={idx}
                    trigger="click"
                    open={select === idx}
                    onOpenChange={(open) => { if (!open) setSelect(undefined); }}
                    content={
                      <Flex flexDir={"column"} gap={1} w={"120px"}>
                        <Button
                          size="xs"
                          variant={"outline"}
                          color={hasDay ? "orange.500" : "fg.subtle"}
                          borderColor={hasDay ? "orange.400" : "border"}
                          bg={hasDay ? "bg.warning" : "transparent"}
                          onClick={() => handleSelect()}
                        >
                          {hasDay ? "주간 2인 해제" : "주간 2인 설정"}
                        </Button>
                        <Button
                          size="xs"
                          variant={"outline"}
                          color={hasNight ? "blue.500" : "fg.subtle"}
                          borderColor={hasNight ? "blue.400" : "border"}
                          bg={hasNight ? "bg.info" : "transparent"}
                          onClick={() => handleSelect(true)}
                        >
                          {hasNight ? "야간 2인 해제" : "야간 2인 설정"}
                        </Button>
                      </Flex>
                    }
                  >
                    <Flex
                      flexDir={"column"}
                      align={"center"}
                      justify={"center"}
                      flex={1}
                      minW={"28px"}
                      py={"3px"}
                      gap={"2px"}
                      cursor={"pointer"}
                      onClick={() => setSelect(idx)}
                      _hover={{ bg: "bg.hover" }}
                    >
                      <Text fontSize={"sm"} fontWeight={"600"} color={holidays.includes(idx) ? "red.500" : "fg"} lineHeight={1}>
                        {idx + 1}
                      </Text>
                      <Flex gap={"2px"} h={"6px"} align={"center"}>
                        {hasDay && (
                          <Box w={"5px"} h={"5px"} bg={"orange.400"} borderRadius={"full"} flexShrink={0} />
                        )}
                        {hasNight && (
                          <Box w={"5px"} h={"5px"} bg={"blue.400"} borderRadius={"full"} flexShrink={0} />
                        )}
                      </Flex>
                    </Flex>
                  </Popover>
                );
              })}
              {Array.from({ length: EXTRA_COLS }).map((_, i) => (
                <Box key={i} flex={1} minW={"28px"} />
              ))}
            </Flex>

            {/* 요일 행 */}
            <Flex borderBottom={"1px solid"} borderColor={"border"} bg={"bg.surface"}>
              <Center w={CELL_W} flexShrink={0} fontSize={"sm"} color={"fg.subtle"} fontWeight={"600"}>
                요일
              </Center>
              {dayWorkCount.map((_, idx) => {
                const wd = (weekday + idx) % 7;
                return (
                  <Center
                    key={idx}
                    flex={1}
                    minW={"28px"}
                    py={1}
                    fontSize={"sm"}
                    fontWeight={"500"}
                    color={wd === 0 ? "red.400" : wd === 6 ? "blue.400" : "fg.subtle"}
                    cursor={"pointer"}
                    onClick={() => setSelect(idx)}
                    _hover={{ bg: "bg.hover" }}
                  >
                    {WEEKDAY[wd]}
                  </Center>
                );
              })}
              {Array.from({ length: EXTRA_COLS }).map((_, i) => (
                <Box key={i} flex={1} minW={"28px"} />
              ))}
            </Flex>

            {/* 주간 근무자 */}
            {schedule.map(
              (emp, idx) =>
                !worker[idx].isNight && (
                  <Flex
                    key={idx}
                    borderBottom={"1px solid"}
                    borderColor={"border"}
                    _hover={{ bg: "bg.surface" }}
                  >
                    <Center
                      w={CELL_W}
                      flexShrink={0}
                      bg={"bg.warning"}
                      fontSize={"sm"}
                      fontWeight={worker[idx].isNew ? "700" : "500"}
                      color={worker[idx].isNew ? "brand" : "fg"}
                      cursor={"pointer"}
                      borderRight={"1px solid"}
                      borderColor={"border"}
                      onClick={() => handleChange(idx, "workType")}
                      px={1}
                    >
                      {worker[idx].name}
                    </Center>
                    {emp.map((type, day) => (
                      <Center
                        key={day}
                        flex={1}
                        minW={"28px"}
                        py={1}
                        fontSize={"sm"}
                        opacity={
                          idx === workerHighlight
                            ? dayWorkCount[day] === 1 && [1, 2].includes(schedule[idx][day])
                              ? 1
                              : 0.2
                            : 1
                        }
                        bg={
                          groupHighlight > -1 &&
                          (32 + group - day) % 4 === groupHighlight &&
                          schedule[idx][day] === 1 &&
                          dayWorkCount[day] === 1
                            ? "yellow.100"
                            : BG_TYPES[type]
                        }
                        onClick={() => changeSchedule(idx, day, workType)}
                        color={COLOR_TYPES[type]}
                        cursor={"pointer"}
                        _hover={{ filter: "brightness(0.92)" }}
                      >
                        {WORK_TYPES[type]}
                      </Center>
                    ))}
                    <Center flex={1} minW={"28px"} py={1} fontSize={"sm"} color={"fg.subtle"}>
                      {numDays - worker[idx].workCount}
                    </Center>
                    <Center
                      flex={1}
                      minW={"28px"}
                      py={1}
                      fontSize={"sm"}
                      color={"orange.400"}
                      cursor={"pointer"}
                      onClick={() => handleChange(idx, "rest")}
                    >
                      {worker[idx].targetWorkCount}
                    </Center>
                  </Flex>
                ),
            )}

            {/* 야간 근무자 */}
            {schedule.map(
              (emp, idx) =>
                worker[idx].isNight && (
                  <Flex
                    key={idx}
                    borderBottom={"1px solid"}
                    borderColor={"border"}
                    _hover={{ bg: "bg.surface" }}
                  >
                    <Center
                      w={CELL_W}
                      flexShrink={0}
                      bg={"bg.info"}
                      fontSize={"sm"}
                      fontWeight={worker[idx].isNew ? "700" : "500"}
                      color={worker[idx].isNew ? "brand" : "fg"}
                      cursor={"pointer"}
                      borderRight={"1px solid"}
                      borderColor={"border"}
                      onClick={() => handleChange(idx, "workType")}
                      px={1}
                    >
                      {worker[idx].name}
                    </Center>
                    {emp.map((type, day) => (
                      <Center
                        key={day}
                        flex={1}
                        minW={"28px"}
                        py={1}
                        fontSize={"sm"}
                        opacity={
                          idx === workerHighlight
                            ? nightWorkCount[day] === 1 && [1, 2].includes(schedule[idx][day])
                              ? 1
                              : 0.2
                            : 1
                        }
                        bg={
                          groupHighlight > -1 &&
                          (33 + group - day) % 4 === groupHighlight &&
                          schedule[idx][day] === 2 &&
                          nightWorkCount[day] === 1
                            ? "black"
                            : BG_TYPES[type]
                        }
                        cursor={"pointer"}
                        onClick={() => changeSchedule(idx, day, workType, true)}
                        color={COLOR_TYPES[type]}
                        _hover={{ filter: "brightness(0.92)" }}
                      >
                        {WORK_TYPES[type]}
                      </Center>
                    ))}
                    <Center flex={1} minW={"28px"} py={1} fontSize={"sm"} color={"fg.subtle"}>
                      {numDays - worker[idx].workCount}
                    </Center>
                    <Center
                      flex={1}
                      minW={"28px"}
                      py={1}
                      fontSize={"sm"}
                      color={"orange.400"}
                      cursor={"pointer"}
                      onClick={() => handleChange(idx, "rest")}
                    >
                      {worker[idx].targetWorkCount}
                    </Center>
                  </Flex>
                ),
            )}

            {/* 조 행 */}
            {GROUP.map((g, gIdx) => (
              <Flex
                key={gIdx}
                borderBottom={"1px solid"}
                borderColor={"border"}
                bg={"bg.surface"}
              >
                <Center
                  w={CELL_W}
                  flexShrink={0}
                  fontSize={"sm"}
                  fontWeight={"600"}
                  color={group === gIdx ? "orange.500" : "fg.subtle"}
                  bg={group === gIdx ? "bg.warning" : "bg.surface"}
                  cursor={"pointer"}
                  borderRight={"1px solid"}
                  borderColor={"border"}
                  onClick={() => changeGroup(gIdx)}
                >
                  {g}조
                </Center>
                {dayWorkCount.map((_, idx) => (
                  <Center
                    key={idx}
                    flex={1}
                    minW={"28px"}
                    py={1}
                    fontSize={"sm"}
                    color={"fg.subtle"}
                  >
                    {GROUP_WORK_TYPE[(32 + gIdx - group + idx) % 4]}
                  </Center>
                ))}
                {Array.from({ length: EXTRA_COLS }).map((_, i) => (
                  <Box key={i} flex={1} minW={"28px"} />
                ))}
              </Flex>
            ))}

            {/* 주간 수 */}
            <Flex borderBottom={"1px solid"} borderColor={"border"} h={CELL_H}>
              <Center w={CELL_W} flexShrink={0} h={CELL_H} fontSize={"sm"} color={"fg.subtle"} borderRight={"1px solid"} borderColor={"border"}>
                주간
              </Center>
              {dayWorkCount.map((count, idx) => (
                <Center key={idx} flex={1} minW={"28px"} h={CELL_H} fontSize={"sm"} color={"orange.400"} fontWeight={"600"}>
                  {count || ""}
                </Center>
              ))}
              {Array.from({ length: EXTRA_COLS }).map((_, i) => (
                <Box key={i} flex={1} minW={"28px"} h={CELL_H} />
              ))}
            </Flex>

            {/* 야간 수 */}
            <Flex h={CELL_H}>
              <Center w={CELL_W} flexShrink={0} h={CELL_H} fontSize={"sm"} color={"fg.subtle"} borderRight={"1px solid"} borderColor={"border"}>
                야간
              </Center>
              {nightWorkCount.map((count, idx) => (
                <Center key={idx} flex={1} minW={"28px"} h={CELL_H} fontSize={"sm"} color={"blue.400"} fontWeight={"600"}>
                  {count || ""}
                </Center>
              ))}
              {Array.from({ length: EXTRA_COLS }).map((_, i) => (
                <Box key={i} flex={1} minW={"28px"} h={CELL_H} />
              ))}
            </Flex>

          </Box>
        </Box>

        {/* 액션바 - 시간표 바로 아래 */}
        <Flex
          px={6}
          py={3}
          borderTop={"1px solid"}
          borderColor={"border"}
          justify={"space-between"}
          align={"center"}
          bg={"bg"}
          gap={2}
          flexWrap={"wrap"}
          flexShrink={0}
        >
          <Flex gap={2} flexWrap={"wrap"}>
            <Button
              h={"32px"}
              px={3}
              fontSize={"sm"}
              fontWeight={"600"}
              bg={"fg"}
              color={"bg"}
              borderRadius={"md"}
              _hover={{ opacity: 0.85 }}
              onClick={() => {
                if (localStorage.getItem("schedule-base")) loadBase();
                else saveBase();
                makeDaySchedule();
                makeNightSchedule();
              }}
            >
              근무 배치
            </Button>
            {[
              {
                label: "리셋",
                onClick: () =>
                  Modal.confirm({
                    title: "근무 배치",
                    content: "근무 배치를 초기화해요. (현재 스케줄이 삭제됩니다.)",
                    onOk: () => { loadBase(); resetBase(); },
                  }),
              },
              { label: "신입 추가", onClick: handleAddNew },
              { label: "빈칸 배치", onClick: () => matchSchedule() },
            ].map(({ label, onClick }) => (
              <Button
                key={label}
                h={"32px"}
                px={3}
                fontSize={"sm"}
                fontWeight={"500"}
                variant={"outline"}
                borderColor={"border"}
                color={"fg"}
                borderRadius={"md"}
                _hover={{ bg: "bg.subtle" }}
                onClick={onClick}
              >
                {label}
              </Button>
            ))}
          </Flex>
          <Flex gap={2}>
            <Button
              h={"32px"}
              px={3}
              fontSize={"sm"}
              fontWeight={"500"}
              variant={"outline"}
              borderColor={"border"}
              color={"fg.subtle"}
              borderRadius={"md"}
              _hover={{ bg: "bg.subtle", color: "fg" }}
              onClick={() =>
                Modal.confirm({
                  title: "다음달 근무표 생성",
                  content:
                    "현재 시간표를 기준으로 다음달 시간표를 생성합니다.\n기존에 적용된 내용은 다음달 시간표 저장시까지 유지됩니다.",
                  onOk: async () => { initNextMonth(); await applyHolidays(); },
                })
              }
            >
              다음달
            </Button>
            <Button
              h={"32px"}
              px={3}
              fontSize={"sm"}
              fontWeight={"600"}
              bg={"fg"}
              color={"bg"}
              borderRadius={"md"}
              _hover={{ opacity: 0.85 }}
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

        {/* 상세정보 사이드패널 */}
        <Flex
          flexDir={"column"}
          w={"200px"}
          flexShrink={0}
          borderLeft={"1px solid"}
          borderColor={"border"}
          p={4}
          gap={4}
          overflowY={"auto"}
        >
          <GroupPanel group={groupHighlight} onClick={(idx) => setGroupHighlight(idx)} />
          <Box borderTop={"1px solid"} borderColor={"border"} />
          <PersonalPanel emp={workerHighlight} onClick={(idx) => setWorkerHighlight(idx)} />
        </Flex>
      </Flex>

    </Flex>
  );
};

export default SchedulePage;