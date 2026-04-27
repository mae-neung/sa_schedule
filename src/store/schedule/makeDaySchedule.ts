import useScheduleStore from "./index.ts";
import applySchedule from "./applySchedule.ts";
import jsonToSchedule from "./jsonToSchedule.ts";
import recalcCounts from "./recalcCounts.ts";

const makeDaySchedule = () =>
  useScheduleStore.setState((state) => {
    const {
      schedule,
      worker,
      aloneCount,
      numDays,
      selectedDay,
      selectedNight,
      dayWorkCount,
      group: storeGroup,
    } = state;

    const base = localStorage.getItem("schedule-base");
    if (base) jsonToSchedule(base);

    const sch = schedule.map((arr) => [...arr]);
    const workCount = [...dayWorkCount];
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];
    const groupDouble = [0, 0, 0, 0];
    const groupTotal = [0, 0, 0, 0];

    // 우선순위 날짜(2인 지정일) 먼저 배치
    for (const date of selectedDay)
      applySchedule(date, sch, wk, aCount, workCount, groupDouble, groupTotal);

    // 나머지는 비율 균등화 루프에서 처리
    let ranDate: number[] = Array.from({ length: numDays }, (_, i) => i)
      .filter((d) => workCount[d] < 2);
    ranDate = ranDate.sort(() => Math.random() - 0.5);

    while (ranDate.length > 0) {
      ranDate.sort((a, b) => {
        const aIdx = (32 + storeGroup - a) % 4;
        const bIdx = (32 + storeGroup - b) % 4;
        const aRatio = groupTotal[aIdx] > 0 ? groupDouble[aIdx] / groupTotal[aIdx] : 0;
        const bRatio = groupTotal[bIdx] > 0 ? groupDouble[bIdx] / groupTotal[bIdx] : 0;
        return bRatio - aRatio; // 높은 비율 앞으로 → pop()이 낮은 비율(2인 부족) 우선 처리
      });

      const select = ranDate.pop()!;

      if (workCount[select] < 2)
        applySchedule(select, sch, wk, aCount, workCount, groupDouble, groupTotal);
    }

    return {
      schedule: sch,
      ...recalcCounts(sch, wk, numDays, storeGroup, selectedDay, selectedNight),
    };
  });

export default makeDaySchedule;