import useScheduleStore from "./index.ts";
import applySchedule from "./applySchedule.ts";
import recalcCounts from "./recalcCounts.ts";

const matchDaySchedule = () =>
  useScheduleStore.setState((state) => {
    const {
      schedule,
      dayWorkCount,
      worker,
      aloneCount,
      group: storeGroup,
      numDays,
      selectedDay,
      selectedNight,
    } = state;

    const workCount = [...dayWorkCount];
    const sch = schedule.map((arr) => [...arr]);
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];
    const groupDouble = [0, 0, 0, 0];
    const groupTotal = [0, 0, 0, 0];

    let oneCount = dayWorkCount.map((c, idx) => (c === 1 ? idx : -1));
    oneCount = oneCount.filter((v) => v > -1);

    while (oneCount.length > 0) {
      oneCount.sort((a, b) => {
        const aIdx = (32 + storeGroup - a) % 4;
        const bIdx = (32 + storeGroup - b) % 4;
        const aRatio = groupTotal[aIdx] > 0 ? groupDouble[aIdx] / groupTotal[aIdx] : 0;
        const bRatio = groupTotal[bIdx] > 0 ? groupDouble[bIdx] / groupTotal[bIdx] : 0;
        if (aRatio !== bRatio) return aRatio - bRatio; // 낮은 비율 앞 → pop()이 높은 비율(2인 충분한 조) 우선
        const aLone = sch.findIndex((w) => w[a] === 1);
        const bLone = sch.findIndex((w) => w[b] === 1);
        return (aLone > -1 ? aCount[aLone] : 0) - (bLone > -1 ? aCount[bLone] : 0);
      });

      const select = oneCount.pop()!;

      if (workCount[select] < 2)
        applySchedule(select, sch, wk, aCount, workCount, groupDouble, groupTotal);
    }

    return {
      schedule: sch,
      ...recalcCounts(sch, wk, numDays, storeGroup, selectedDay, selectedNight),
    };
  });

export default matchDaySchedule;