import useScheduleStore from "./index.ts";

const removeWorker = (idx: number) =>
  useScheduleStore.setState((state) => {
    const { worker, schedule } = state;

    let wk = worker.map((v) => ({ ...v }));
    let sch = schedule.map((v) => [...v]);

    wk = wk.filter((_, target) => target != idx);
    sch = sch.filter((_, target) => target != idx);

    return { worker: wk, schedule: sch };
  });

export default removeWorker;
