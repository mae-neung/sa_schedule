import jsonToSchedule from "./jsonToSchedule.ts";

const loadBase = () => {
  const base = localStorage.getItem("schedule-base");
  if (!base) return;
  jsonToSchedule(base);
};

export default loadBase;
