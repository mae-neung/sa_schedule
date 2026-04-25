import useScheduleStore from "./index.ts";
import applySchedule from "./applySchedule.ts";

const makeNightSchedule = () =>
  useScheduleStore.setState((state) => {
    const {
      schedule,
      nightWorkCount,
      nightGroup,
      worker,
      aloneCount,
      numDays,
      selectedNight,
      group: storeGroup,
    } = state;

    const workCount = [...nightWorkCount];
    const sch = schedule.map((arr) => [...arr]);
    const group = [...nightGroup];
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];

    // 우선순위 날짜(2인 지정일) 먼저 배치
    for (const date of selectedNight)
      applySchedule(date, sch, wk, aCount, workCount, group, true);

    // 나머지는 그룹 균등화 루프에서 처리
    let ranDate: number[] = Array.from({ length: numDays }, (_, i) => i)
      .filter((d) => workCount[d] < 2);
    ranDate = ranDate.sort(() => Math.random() - 0.5);

    while (ranDate.length > 0) {
      const minIndex = group
        .map((value, index) => ({ index, value }))
        .reduce((min, curr) => (curr.value < min.value ? curr : min)).index;

      ranDate.sort((a, b) => {
        const aKey = (33 + storeGroup - a) % 4 === minIndex ? 0 : 1;
        const bKey = (33 + storeGroup - b) % 4 === minIndex ? 0 : 1;
        return aKey - bKey;
      });

      const select = ranDate.pop()!;

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

export default makeNightSchedule;
