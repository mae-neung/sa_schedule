import { Flex } from "@chakra-ui/react";
import EmpSettingPanel from "../components/EmpSettingPanel.tsx";
import SchedulePanel from "../components/SchedulePanel.tsx";
import GroupPanel from "../components/GroupPanel.tsx";

const IndexPage = () => {
  return (
    <Flex flexDirection={"column"} p={4}>
      <EmpSettingPanel />
      <SchedulePanel />
      <GroupPanel />
    </Flex>
  );
};

export default IndexPage;
