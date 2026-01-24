import useScheduleStore from "./index.ts";
import Schedule from "../../interface/schedule.ts";

const jsonToSchedule = (json: string) =>
  useScheduleStore.setState(() => {
    const schedule: Schedule = JSON.parse(json);

    return { ...schedule };
  });

export default jsonToSchedule;
