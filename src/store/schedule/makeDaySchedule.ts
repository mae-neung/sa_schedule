import useScheduleStore from "./index.ts";
import applySchedule from "./applySchedule.ts";
import jsonToSchedule from "./jsonToSchedule.ts";

const makeDaySchedule = () =>
  useScheduleStore.setState((state) => {
    const {
      schedule,
      worker,
      aloneCount,
      numDays,
      selectedDay,
      dayGroup,
      dayWorkCount,
      base,
    } = state;

    if (base) jsonToSchedule(base);

    const sch = schedule.map((arr) => [...arr]);
    const workCount = [...dayWorkCount];
    const group = [...dayGroup];
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];

    for (const date of selectedDay)
      applySchedule(date, sch, wk, aCount, workCount, group);

    /* 1인 근무자 배치 */
    for (let day = 0; day < numDays; day++)
      if (workCount[day] < 2)
        applySchedule(day, sch, wk, aCount, workCount, group);

    let ranDate: number[] = Array.from({ length: numDays }, (_, i) => i);
    // shuffle
    ranDate = ranDate.sort(() => Math.random() - 0.5);

    while (ranDate.length > 0) {
      const minIndex = group
        .map((value, index) => ({ index, value }))
        .reduce((min, curr) => (curr.value < min.value ? curr : min)).index;

      ranDate.sort((a, b) => {
        const aKey = a % 4 === minIndex ? 0 : 1;
        const bKey = b % 4 === minIndex ? 0 : 1;
        return aKey - bKey;
      });

      const select = ranDate.pop()!;

      if (workCount[select] < 2)
        applySchedule(select, sch, wk, aCount, workCount, group);
    }

    return {
      schedule: sch,
      dayGroup: group,
      worker: wk,
      dayWorkCount: workCount,
      aloneCount: aCount,
    };
  });

export default makeDaySchedule;
