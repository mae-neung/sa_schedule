import useScheduleStore from "./index.ts";
import Employee from "../../interface/employee.ts";

const updateWorker = (idx: number, emp: Employee) =>
  useScheduleStore.setState((state) => {
    const { worker } = state;

    const wk = worker.map((w) => ({ ...w }));

    wk[idx] = emp;

    return {
      worker: wk,
    };
  });

export default updateWorker;
