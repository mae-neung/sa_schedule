import useScheduleStore from "./index.ts";
import applySchedule from "./applySchedule.ts";

const matchDaySchedule = () =>
  useScheduleStore.setState((state) => {
    const { schedule, dayWorkCount, dayGroup, worker, aloneCount, group: storeGroup } = state;

    const workCount = [...dayWorkCount];
    const sch = schedule.map((arr) => [...arr]);
    const group = [...dayGroup];
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];

    let oneCount = dayWorkCount.map((c, idx) => (c === 1 ? idx : -1));
    oneCount = oneCount.filter((v) => v > -1);

    while (oneCount.length > 0) {
      // 1인 근무가 가장 많은 조의 날을 먼저 2인으로 채워서 균등화
      const maxIndex = group
        .map((value, index) => ({ index, value }))
        .reduce((max, curr) => (curr.value >= max.value ? curr : max)).index;

      oneCount.sort((a, b) => {
        const aGroupKey = (32 + storeGroup - a) % 4 === maxIndex ? 1 : 0;
        const bGroupKey = (32 + storeGroup - b) % 4 === maxIndex ? 1 : 0;
        if (aGroupKey !== bGroupKey) return aGroupKey - bGroupKey;
        // 같은 그룹 버킷이면: 혼자 근무자의 aloneCount 높은 날 먼저 처리
        const aLone = sch.findIndex((w) => w[a] === 1);
        const bLone = sch.findIndex((w) => w[b] === 1);
        return (aLone > -1 ? aCount[aLone] : 0) - (bLone > -1 ? aCount[bLone] : 0);
      });

      const select = oneCount.pop()!;

      if (workCount[select] < 2)
        applySchedule(select, sch, wk, aCount, workCount, group);
    }

    return {
      schedule: sch,
      dayGroup: group,
      aloneCount: aCount,
      worker: wk,
      dayWorkCount: workCount,
    };
  });

export default matchDaySchedule;