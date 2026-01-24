import useScheduleStore from "./index.ts";
import Employee from "../../interface/employee.ts";

const setWorkerList = (emp: Employee[]) =>
  useScheduleStore.setState(() => ({ worker: emp }));

export default setWorkerList;
