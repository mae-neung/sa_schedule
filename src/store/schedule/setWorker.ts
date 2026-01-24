import useScheduleStore from "./index.ts";
import Employee from "../../interface/employee.ts";

const setWorker = (emp: Employee) =>
  useScheduleStore.setState((state) => {
    const { worker } = state;
    let employees = [...worker, emp];

    return { worker: employees };
  });

export default setWorker;
