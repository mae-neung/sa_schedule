import { Button, Center, Flex, Text } from "@chakra-ui/react";

import { DatePicker, Form, InputNumber, Modal, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import useSchedule from "../../store/store.tsx";
import EmployeeCard from "./EmployeeCard.tsx";
import EmployeeAddCard from "./EmployeeAddCard.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useLocalStorage } from "@reactuses/core";
import Employee from "../../interface/employee.ts";

const EmpSettingPanel = () => {
  const [worker, setWorker] = useLocalStorage<[Employee[], Employee[]]>(
    "recentDayWorker",
    [[], []],
  );

  const navigate = useNavigate();

  const {
    isInit,
    init,
    dayWorker,
    nightWorker,
    removeWorker,
    setWorkerList,
    excelToSchedule,
  } = useSchedule();
  const [form] = useForm();

  const handleSubmit = useCallback(
    (v: { date: dayjs.Dayjs; numRest: number; group: number }) => {
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
            "이전에 생성된 시간표가 있어요. 다시 만들까요?\n(기존 내용은 삭제됩니다.)",
          onOk: async () => {
            init(v.date, v.numRest, v.group);
            navigate("/schedule");
            setWorker([dayWorker, nightWorker]);
          },
        });
        return;
      }
      init(v.date, v.numRest, v.group);
      navigate("/schedule");
      setWorker([dayWorker, nightWorker]);
    },
    [dayWorker, nightWorker],
  );

  return (
    <Center>
      <Form
        form={form}
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs().add(1, "month"),
          numRest: 8,
          allowDayTwo: true,
          group: 0,
        }}
      >
        <Flex
          p={6}
          borderRadius={"xl"}
          bg={"bg"}
          border={"4px solid gray"}
          flexDirection={"column"}
          w={["24rem", null, "400px", "600px", "1080px"]}
          gap={2}
        >
          <Flex gap={2} flexDir={"column"}>
            <Text fontSize={"3xl"} fontWeight={"bold"}>
              기본 설정
            </Text>
            <Flex flexDir={"column"}>
              <Text fontWeight={"bold"}>월 선택</Text>
              <Form.Item name={"date"} noStyle>
                <DatePicker picker={"month"} />
              </Form.Item>
            </Flex>
            <Flex flexDir={"column"}>
              <Text fontWeight={"bold"}>휴일 갯수</Text>
              <Form.Item name={"numRest"} noStyle>
                <InputNumber style={{ width: "100%" }} min={0} max={31} />
              </Form.Item>
            </Flex>
            <Flex flexDir={"column"}>
              <Text fontWeight={"bold"}>1일 주간 근무조</Text>
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
              {/*<Button onClick={() => scheduleToExcel()} disabled={!isInit}>*/}
              {/*  저장*/}
              {/*</Button>*/}
            </Flex>
          </Flex>
          <Flex flexDir={"column"} gap={4}>
            <Flex flexDirection={"column"} gap={2}>
              <Text fontWeight={"bold"}>주간 근무자</Text>
              <Flex
                alignItems={"center"}
                gap={2}
                overflowX={"scroll"}
                scrollbar={"hidden"}
              >
                {dayWorker.map((emp, idx) => (
                  <EmployeeCard
                    employee={emp}
                    onDelete={() => removeWorker(idx)}
                  />
                ))}
                <EmployeeAddCard />
              </Flex>
            </Flex>
            <Flex flexDirection={"column"} gap={2}>
              <Text fontWeight={"bold"}>야간 근무자</Text>
              <Flex
                alignItems={"center"}
                gap={2}
                overflowX={"scroll"}
                scrollbar={"hidden"}
              >
                {nightWorker.map((emp, idx) => (
                  <EmployeeCard
                    night
                    employee={emp}
                    onDelete={() => removeWorker(idx, true)}
                  />
                ))}
                <EmployeeAddCard night />
              </Flex>
            </Flex>
            <Text
              cursor={"pointer"}
              color={"purple.400"}
              onClick={() => {
                if (
                  !worker ||
                  (worker[0].length == 0 && worker[1].length == 0)
                ) {
                  Modal.error({
                    title: "근무자 불러오기",
                    content: "최근 근무자가 없습니다.",
                  });
                  return;
                }
                setWorkerList(worker);
              }}
            >
              최근 근무자 불러오기
            </Text>
          </Flex>
          <Flex gap={2} mt={3}>
            <Button flex={1} type={"submit"}>
              시간표 만들기
            </Button>
            <Upload
              customRequest={() => {}}
              onChange={(e) => {
                const data = e.fileList[0].originFileObj;
                if (!data) return;

                excelToSchedule(data);
                navigate("/schedule");
              }}
              itemRender={() => <></>}
            >
              <Button>
                <UploadOutlined />
              </Button>
            </Upload>
          </Flex>
          {isInit && (
            <Link to={"/schedule"} style={{ width: "100%" }}>
              <Button bg={"purple.300"} color={"blackAlpha"} w={"100%"}>
                최근 시간표 보기
              </Button>
            </Link>
          )}
        </Flex>
      </Form>
    </Center>
  );
};
export default EmpSettingPanel;
