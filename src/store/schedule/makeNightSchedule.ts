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
    } = state;

    const workCount = [...nightWorkCount];
    const sch = schedule.map((arr) => [...arr]);
    const group = [...nightGroup];
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];

    for (const date of selectedNight)
      applySchedule(date, sch, wk, aCount, workCount, group, true);

    for (let day = 0; day < numDays; day++)
      if (workCount[day] < 2)
        applySchedule(day, sch, wk, aCount, workCount, group, true);

    // 랜덤 날짜 배열 생성 및 셔플
    let ranDate: number[] = Array.from({ length: numDays }, (_, i) => i);
    ranDate = ranDate.sort(() => Math.random() - 0.5);

    while (ranDate.length > 0) {
      const minIndex = group
        .map((value, index) => ({ index, value }))
        .reduce((min, curr) => (curr.value >= min.value ? curr : min)).index;

      ranDate.sort((a, b) => {
        const aKey = a % 4 === minIndex ? 0 : 1;
        const bKey = b % 4 === minIndex ? 0 : 1;
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
