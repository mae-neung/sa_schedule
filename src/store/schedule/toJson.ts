import useScheduleStore from "./index.ts";

const toJson = () => {
  const schedule = useScheduleStore.getState();

  return JSON.stringify(schedule);
};

export default toJson;
