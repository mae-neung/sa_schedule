import useScheduleStore from "./index.ts";
import Employee from "../../interface/employee.ts";

const addNew = (name: string, startDate: number) =>
  useScheduleStore.setState((state) => {
    const { weekday, worker, numDays, schedule, dayWorkCount } = state;

    const wk = worker.map((w) => ({ ...w }));
    const sch = schedule.map((s) => [...s]);
    const dWorkCount = [...dayWorkCount];
    const newSch = Array(numDays).fill(0);

    // targetWorkCount: 다른 근무자와 동일
    const targetWorkCount = worker[0]?.targetWorkCount ?? 0;

    // 시작일 전 평일(월~금) 수 → workCount 초기값
    let initialWorkCount = 0;
    for (let i = 0; i < startDate - 1; i++) {
      const wd = (weekday + i) % 7;
      if (wd >= 1 && wd <= 5) initialWorkCount++;
    }

    const newWk: Employee = {
      name,
      isNew: true,
      isNight: false,
      targetWorkCount,
      workCount: initialWorkCount,
    };

    // 시작일 무조건 주간 근무
    newSch[startDate - 1] = 1;
    newWk.workCount++;
    dWorkCount[startDate - 1]++;

    // startDate 이후 유효한 날짜 (1인 이상 근무 중인 날만 - 1인 불가)
    let validDate: number[] = [];
    for (let i = startDate; i < numDays; i++) {
      if (dWorkCount[i] >= 1) validDate.push(i);
    }

    // 랜덤 섞은 후 1인 근무일을 뒤로 (pop()으로 우선 꺼냄)
    validDate = validDate.sort(() => Math.random() - 0.5);
    validDate.sort((a, b) => (dWorkCount[a] === 1 ? 1 : 0) - (dWorkCount[b] === 1 ? 1 : 0));

    while (newWk.workCount < numDays - targetWorkCount) {
      const select = validDate.pop() ?? -1;

      if (select === -1) break;

      let valid = true;
      for (let i = 0; i < 5; i++)
        if (select >= 4 - i && select + i < numDays) {
          const recentWork = newSch.slice(select + i - 4, select + i + 1);
          if (recentWork.filter((v) => v === 1).length >= 4) {
            valid = false;
          }
        }

      if (valid) {
        newSch[select] = 1;
        newWk.workCount++;
        dWorkCount[select]++;
      }
    }

    return {
      worker: [...wk, newWk],
      schedule: [...sch, newSch],
      dayWorkCount: dWorkCount,
    };
  });

export default addNew;
