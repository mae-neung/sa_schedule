import useScheduleStore from "./index.ts";

const setInit = () =>
  useScheduleStore.setState(() => ({
    isInit: true,
  }));

export default setInit;
