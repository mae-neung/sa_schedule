import useScheduleStore from "./index.ts";
import jsonToSchedule from "./jsonToSchedule.ts";

const loadBase = () => {
  const { base } = useScheduleStore.getState();
  if (!base) return;
  jsonToSchedule(base);
};

export default loadBase;
