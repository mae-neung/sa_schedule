import { Button, Center, Flex, Text, Input } from "@chakra-ui/react";

import {
  Checkbox,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  Select,
  Upload,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import useSchedule from "../store/store.tsx";
import { useLocalStorage } from "@reactuses/core";
import Schedule from "../interface/schedule.ts";

const EmpSettingPanel = () => {
  const {
    isInit,
    init,
    dayWorker,
    nightWorker,
    loadSchedule,
    setInit,
    setWorker,
    removeWorker,
    scheduleToExcel,
    excelToSchedule,
  } = useSchedule();

  const [form] = useForm();
  const [empForm] = useForm();

  const [employee, setEmployee] = useState<"day" | "night">();

  const [showHistory, setShowHistory] = useState(false);

  const [scheduleHistory, setScheduleHistory] = useLocalStorage(
    "schedule",
    JSON.stringify([]),
  );

  return (
    <>
      <Form
        form={form}
        onFinish={(v: {
          date: dayjs.Dayjs;
          numRest: number;
          group: number;
        }) => {
          if (dayWorker.length == 0 || nightWorker.length == 0) {
            Modal.error({
              title: "시간표 생성",
              content: "주야간 근무자가 최소 한명은 있어야해요.",
            });
            return;
          }
          if (isInit) {
            Modal.confirm({
              title: "시간표 생성",
              content:
                "이미 생성된 시간표가 있어요. 다시 생성하시겠습니까?\n(기존 내용은 삭제됩니다.)",
              onOk: async () => {
                init(v.date, v.numRest, v.group);
              },
            });
            return;
          }
          init(v.date, v.numRest, v.group);
        }}
        initialValues={{
          date: dayjs().add(1, "month"),
          numRest: 8,
          allowDayTwo: true,
          group: 0,
        }}
      >
        <Flex flexDirection={"column"} gap={2}>
          <Flex gap={2}>
            <Flex alignItems={"center"} gap={2}>
              <Text>날짜</Text>
              <Form.Item name={"date"} noStyle>
                <DatePicker picker={"month"} />
              </Form.Item>
            </Flex>
            <Flex alignItems={"center"} gap={2}>
              <Text>휴일</Text>
              <Form.Item name={"numRest"} noStyle>
                <InputNumber min={0} max={31} />
              </Form.Item>
            </Flex>
            <Flex alignItems={"center"} gap={2}>
              <Text>1일 주간 근무조</Text>
              <Form.Item name={"group"} noStyle>
                <Select
                  options={[
                    { value: 0, label: "A" },
                    { value: 1, label: "B" },
                    { value: 2, label: "C" },
                    { value: 3, label: "D" },
                  ]}
                />
              </Form.Item>
            </Flex>
            <Flex gap={2}>
              <Button onClick={() => scheduleToExcel()} disabled={!isInit}>
                저장
              </Button>
              <Upload
                customRequest={() => {}}
                onChange={(e) => {
                  const data = e.fileList[0].originFileObj;
                  if (!data) return;

                  excelToSchedule(data);
                }}
                itemRender={() => <></>}
              >
                <Button>불러오기</Button>
              </Upload>
            </Flex>
          </Flex>
          <Flex gap={4}>
            <Flex
              flexDirection={"column"}
              gap={2}
              p={4}
              borderRadius={4}
              border={"1px solid #000"}
            >
              <Text fontWeight={"bold"}>주간 근무자</Text>
              {dayWorker.map((emp, idx) => (
                <Flex
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  gap={2}
                >
                  <Text>{emp.name}</Text>
                  <Center cursor={"pointer"} onClick={() => removeWorker(idx)}>
                    <CloseOutlined />
                  </Center>
                </Flex>
              ))}
              <Button bgColor={"orange"} onClick={() => setEmployee("day")}>
                주간 근무자 추가
              </Button>
            </Flex>
            <Flex
              flexDirection={"column"}
              gap={2}
              p={4}
              borderRadius={4}
              border={"1px solid #000"}
            >
              <Text fontWeight={"bold"}>야간 근무자</Text>
              {nightWorker.map((emp, idx) => (
                <Flex
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  gap={2}
                >
                  <Text>{emp.name}</Text>
                  <Center
                    cursor={"pointer"}
                    onClick={() => removeWorker(idx, true)}
                  >
                    <CloseOutlined />
                  </Center>
                </Flex>
              ))}
              <Button
                fontWeight={"bold"}
                bgColor={"blue"}
                onClick={() => setEmployee("night")}
              >
                야간 근무자 추가
              </Button>
            </Flex>
          </Flex>
          <Button width={"1080px"} type={"submit"}>
            시간표 {isInit ? "초기화" : "생성"}
          </Button>
        </Flex>
      </Form>
      <Modal
        open={!!employee}
        onCancel={() => setEmployee(undefined)}
        title={"근무자 추가"}
        footer={null}
      >
        <Form
          form={empForm}
          onFinish={({ name, isNew }: { name: string; isNew?: boolean }) => {
            if (name == "") {
              Modal.error({
                title: "추가 오류",
                content: "근무자 이름을 등록해주세요.",
              });
              return;
            }

            const emp = { name, workCount: 0, isNew };

            setWorker(emp, employee == "night");

            empForm.resetFields();
            setEmployee(undefined);
          }}
          initialValues={{
            name: "",
          }}
        >
          <Flex flexDir={"column"} gap={2}>
            <Center gap={2}>
              <Flex width={"30px"}>
                <Text>이름</Text>
              </Flex>
              <Form.Item name={"name"} noStyle>
                <Input />
              </Form.Item>
            </Center>
            <Flex gap={2}>
              <Flex width={"30px"}>
                <Text>신입</Text>
              </Flex>
              <Form.Item name={"isNew"} valuePropName={"checked"} noStyle>
                <Checkbox />
              </Form.Item>
            </Flex>
            <Button type={"submit"}>확인</Button>
          </Flex>
        </Form>
      </Modal>
      <Modal
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        title={"스케줄 불러오기"}
        footer={false}
      >
        <Flex flexDir={"column"} gap={2}>
          {(JSON.parse(scheduleHistory!) as string[]).map((sch, idx) => (
            <Flex p={4} borderRadius={4} border={"1px solid black"}>
              <Flex
                onClick={() => {
                  setInit();
                  loadSchedule(JSON.parse(sch) as Schedule);
                  setShowHistory(false);
                }}
                cursor={"pointer"}
                p={2}
                fontWeight={"bold"}
                flex={1}
              >
                {(JSON.parse(sch) as Schedule).createdAt}
              </Flex>
              <Center
                cursor={"pointer"}
                onClick={() =>
                  setScheduleHistory(
                    JSON.stringify(
                      (JSON.parse(scheduleHistory!) as string[]).filter(
                        (_, i) => i !== idx,
                      ),
                    ),
                  )
                }
              >
                <CloseOutlined />
              </Center>
            </Flex>
          ))}
        </Flex>
      </Modal>
    </>
  );
};
export default EmpSettingPanel;
