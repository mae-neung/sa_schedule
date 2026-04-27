import useScheduleStore from "./index.ts";
import applySchedule from "./applySchedule.ts";
import recalcCounts from "./recalcCounts.ts";

const makeNightSchedule = () =>
  useScheduleStore.setState((state) => {
    const {
      schedule,
      nightWorkCount,
      worker,
      aloneCount,
      numDays,
      selectedDay,
      selectedNight,
      group: storeGroup,
    } = state;

    const workCount = [...nightWorkCount];
    const sch = schedule.map((arr) => [...arr]);
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];
    const groupDouble = [0, 0, 0, 0];
    const groupTotal = [0, 0, 0, 0];

    // 우선순위 날짜(2인 지정일) 먼저 배치
    for (const date of selectedNight)
      applySchedule(date, sch, wk, aCount, workCount, groupDouble, groupTotal, true);

    // 나머지는 비율 균등화 루프에서 처리
    let ranDate: number[] = Array.from({ length: numDays }, (_, i) => i)
      .filter((d) => workCount[d] < 2);
    ranDate = ranDate.sort(() => Math.random() - 0.5);

    while (ranDate.length > 0) {
      ranDate.sort((a, b) => {
        const aIdx = (33 + storeGroup - a) % 4;
        const bIdx = (33 + storeGroup - b) % 4;
        const aRatio = groupTotal[aIdx] > 0 ? groupDouble[aIdx] / groupTotal[aIdx] : 0;
        const bRatio = groupTotal[bIdx] > 0 ? groupDouble[bIdx] / groupTotal[bIdx] : 0;
        return bRatio - aRatio;
      });

      const select = ranDate.pop()!;

      if (workCount[select] < 2)
        applySchedule(select, sch, wk, aCount, workCount, groupDouble, groupTotal, true);
    }

    return {
      schedule: sch,
      ...recalcCounts(sch, wk, numDays, storeGroup, selectedDay, selectedNight),
    };
  });

export default makeNightSchedule;