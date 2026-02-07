import useScheduleStore from "./index.ts";
import applySchedule from "./applySchedule.ts";

const matchSchedule = () =>
  useScheduleStore.setState((state) => {
    const { schedule, nightWorkCount, nightGroup, worker, aloneCount } = state;

    const workCount = [...nightWorkCount];
    const sch = schedule.map((arr) => [...arr]);
    const group = [...nightGroup];
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];

    let oneCount = nightWorkCount.map((c, idx) => (c == 1 ? idx : -1));
    oneCount = oneCount.filter((v) => v > -1);

    while (oneCount.length > 0) {
      const minIndex = group
        .map((value, index) => ({ index, value }))
        .reduce((min, curr) => (curr.value >= min.value ? curr : min)).index;

      oneCount.sort((a, b) => {
        const aKey = a % 4 === minIndex ? 0 : 1;
        const bKey = b % 4 === minIndex ? 0 : 1;
        return aKey - bKey;
      });

      const select = oneCount.pop()!;

      if (workCount[select] < 2)
        applySchedule(select, sch, wk, aCount, workCount, group, true);
    }

    return {
      schedule: sch,
      nightGroup: group,
      aloneCount: aCount,
      worker: wk,
      nightWorkCount: workCount,
    };
  });

export default matchSchedule;
