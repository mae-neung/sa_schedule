import useScheduleStore from "./index.ts";
import Schedule from "../../interface/schedule.ts";

const loadSchedule = (schedule: Schedule) =>
  useScheduleStore.setState(() => ({ ...schedule }));

export default loadSchedule;
