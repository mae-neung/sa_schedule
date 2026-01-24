import useScheduleStore from "./index.ts";

const resetWorkCount = (night?: boolean) =>
  useScheduleStore.setState((state) => {
    const { worker, numDays } = state;

    const wk = worker.map((v) => ({ ...v }));

    for (const emp of wk) if (emp.isNight == night) emp.workCount = 0;

    if (night)
      return {
        worker: wk,
        nightWorkCount: Array(numDays).fill(0),
        nightGroup: [0, 0, 0, 0],
        aloneCount: Array(wk.length).fill(0),
      };

    return {
      worker: wk,
      dayWorkCount: Array(numDays).fill(0),
      dayGroup: [0, 0, 0, 0],
      aloneCount: Array(wk.length).fill(0),
    };
  });

export default resetWorkCount;
