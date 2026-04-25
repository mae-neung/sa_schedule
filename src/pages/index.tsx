import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { DatePicker, Form, Input, Modal, Select, Switch, Upload } from "antd";
import { ClockCircleOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import EmployeeCard from "../components/employee/EmployeeCard.tsx";
import EmployeeAddCard from "../components/employee/EmployeeAddCard.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { useLocalStorage } from "@reactuses/core";
import useScheduleStore from "../store/schedule";
import init from "../store/schedule/init.ts";
import applyHolidays from "../store/schedule/applyHolidays.ts";
import removeWorker from "../store/schedule/removeWorker.ts";
import jsonToSchedule from "../store/schedule/jsonToSchedule.ts";
import excelToSchedule from "../store/schedule/excelToSchedule.ts";
import updateWorker from "../store/schedule/updateWorker.ts";

const SectionLabel = ({ children }: { children: string }) => (
  <Text
    fontSize={"xs"}
    fontWeight={"600"}
    color={"fg.subtle"}
    textTransform={"uppercase"}
    letterSpacing={"wider"}
  >
    {children}
  </Text>
);

const IndexPage = () => {
  const [rs] = useLocalStorage("recentSchedule", "");
  const navigate = useNavigate();
  const { isInit, worker } = useScheduleStore();
  const [form] = useForm();
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm] = useForm();

  const handleSubmit = useCallback(
    async (v: { date: dayjs.Dayjs; group: number }) => {
      if (
        worker.filter((w) => !w.isNight).length == 0 ||
        worker.filter((w) => w.isNight).length == 0
      ) {
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
            init(v.date, v.group);
            await applyHolidays();
            navigate("/schedule");
          },
        });
        return;
      }
      init(v.date, v.group);
      await applyHolidays();
      navigate("/schedule");
    },
    [worker, isInit],
  );

  return (
    <Flex
      justify={"center"}
      align={"flex-start"}
      minH={"100vh"}
      bg={"bg"}
      py={16}
      px={6}
    >
      <Flex flexDir={"column"} w={"100%"} maxW={"900px"} gap={8}>

        {/* 헤더 */}
        <Flex flexDir={"column"} gap={1}>
          <Text fontSize={"2xl"} fontWeight={"700"} color={"fg"}>
            근무 시간표
          </Text>
          <Text fontSize={"sm"} color={"fg.subtle"}>
            설정을 입력하고 시간표를 생성해주세요.
          </Text>
        </Flex>

        <Box borderTop={"1px solid"} borderColor={"border"} />

        <Form
          form={form}
          onFinish={handleSubmit}
          initialValues={{ date: dayjs().add(1, "month"), group: 0 }}
        >
          {/* 메인 컨텐츠 - 데스크탑 2컬럼 */}
          <Flex flexDir={["column", null, "row"]} gap={8} align={"stretch"}>

            {/* 왼쪽: 기본 설정 */}
            <Flex flexDir={"column"} gap={4} w={["100%", null, "240px"]} flexShrink={0}>
              <SectionLabel>기본 설정</SectionLabel>

              <Flex flexDir={"column"} gap={1}>
                <Text fontSize={"sm"} fontWeight={"500"} color={"fg"}>월 선택</Text>
                <Form.Item name={"date"} noStyle>
                  <DatePicker
                    picker={"month"}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Flex>

              <Flex flexDir={"column"} gap={1}>
                <Text fontSize={"sm"} fontWeight={"500"} color={"fg"}>1일 근무조</Text>
                <Form.Item name={"group"} noStyle>
                  <Select
                    style={{ width: "100%" }}
                    options={[
                      { value: 0, label: "A조" },
                      { value: 1, label: "B조" },
                      { value: 2, label: "C조" },
                      { value: 3, label: "D조" },
                    ]}
                  />
                </Form.Item>
              </Flex>
            </Flex>

            {/* 데스크탑 수직 구분선 */}
            <Box
              display={["none", null, "block"]}
              borderLeft={"1px solid"}
              borderColor={"border"}
            />

            {/* 오른쪽: 근무자 */}
            <Flex flexDir={"column"} gap={4} flex={1} minW={0}>
              <Flex justify={"space-between"} align={"center"}>
                <SectionLabel>근무자</SectionLabel>
                <Flex gap={3} align={"center"}>
                  <Flex align={"center"} gap={1}>
                    <Box w={"8px"} h={"8px"} borderRadius={"sm"} bg={"bg.warning"} border={"1px solid"} borderColor={"border"} />
                    <Text fontSize={"xs"} color={"fg.subtle"}>주간</Text>
                  </Flex>
                  <Flex align={"center"} gap={1}>
                    <Box w={"8px"} h={"8px"} borderRadius={"sm"} bg={"bg.info"} border={"1px solid"} borderColor={"border"} />
                    <Text fontSize={"xs"} color={"fg.subtle"}>야간</Text>
                  </Flex>
                </Flex>
              </Flex>

              {worker.length === 0 ? (
                <Flex
                  align={"center"}
                  justify={"center"}
                  flex={1}
                  minH={"120px"}
                  border={"1px dashed"}
                  borderColor={"border"}
                  borderRadius={"lg"}
                >
                  <Text fontSize={"sm"} color={"fg.muted"}>
                    근무자를 추가해주세요
                  </Text>
                </Flex>
              ) : (
                <Flex
                  gap={2}
                  flexWrap={"wrap"}
                >
                  {worker.map((emp, idx) => (
                    <EmployeeCard
                      key={idx}
                      employee={emp}
                      night={emp.isNight}
                      onDelete={() => removeWorker(idx)}
                      onClick={() => {
                        setEditIdx(idx);
                        editForm.setFieldsValue({
                          name: emp.name,
                          isNight: emp.isNight,
                          isNew: emp.isNew ?? false,
                        });
                      }}
                    />
                  ))}
                </Flex>
              )}

              <EmployeeAddCard />
            </Flex>
          </Flex>

          <Box borderTop={"1px solid"} borderColor={"border"} my={8} />

          {/* 액션 버튼 */}
          <Flex flexDir={"column"} gap={2}>
            <Flex gap={2}>
              <Button
                flex={1}
                type={"submit"}
                bg={"fg"}
                color={"bg"}
                borderRadius={"md"}
                fontWeight={"600"}
                fontSize={"sm"}
                _hover={{ opacity: 0.85 }}
                h={"38px"}
              >
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
                <Button
                  title={"엑셀로 불러오기"}
                  variant={"outline"}
                  borderColor={"border"}
                  color={"fg"}
                  borderRadius={"md"}
                  h={"38px"}
                  _hover={{ bg: "bg.subtle" }}
                >
                  <UploadOutlined />
                </Button>
              </Upload>
              <Button
                title={"최근 저장 시간표 불러오기"}
                variant={"outline"}
                borderColor={"border"}
                color={"fg"}
                borderRadius={"md"}
                h={"38px"}
                _hover={{ bg: "bg.subtle" }}
                onClick={() => {
                  if (!rs) return;
                  jsonToSchedule(rs);
                  navigate("/schedule");
                }}
              >
                <ClockCircleOutlined />
              </Button>
            </Flex>

            {isInit && (
              <Link to={"/schedule"} style={{ width: "100%" }}>
                <Button
                  w={"100%"}
                  variant={"outline"}
                  borderColor={"border"}
                  color={"fg.subtle"}
                  borderRadius={"md"}
                  fontWeight={"500"}
                  fontSize={"sm"}
                  h={"38px"}
                  _hover={{ bg: "bg.subtle", color: "fg" }}
                >
                  최근 시간표 보기 →
                </Button>
              </Link>
            )}
          </Flex>
        </Form>
      </Flex>

      <Modal
        title="근무자 정보 수정"
        open={editIdx !== null}
        onCancel={() => setEditIdx(null)}
        onOk={() => editForm.submit()}
        okText="저장"
        cancelText="취소"
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 16 }}
          onFinish={(v) => {
            if (editIdx === null) return;
            updateWorker(editIdx, { ...worker[editIdx], name: v.name, isNight: v.isNight, isNew: v.isNew });
            setEditIdx(null);
          }}
        >
          <button type="submit" hidden />
          <Form.Item name="name" label="이름" rules={[{ required: true, message: "이름을 입력해주세요" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isNight" label="근무 형태">
            <Select
              options={[
                { value: false, label: "주간" },
                { value: true, label: "야간" },
              ]}
            />
          </Form.Item>
          <Form.Item name="isNew" label="신입 여부" valuePropName="checked">
            <Switch checkedChildren="신입" unCheckedChildren="일반" />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
};

export default IndexPage;