import useScheduleStore from "./index.ts";
import Employee from "../../interface/employee.ts";

const changeGroup = (name: string, startDate: number) =>
  useScheduleStore.setState((state) => {
    const { weekday, worker, numDays, schedule } = state;

    const wk = worker.map((w) => ({ ...w }));
    const sch = schedule.map((sch) => [...sch]);
    const newSch = Array(numDays).fill(0);

    let targetWorkCount = 0;

    for (let i = 0; i <= numDays - startDate; i++)
      if ([1, 2, 3, 4, 5].includes((weekday + startDate + 1) % 7))
        targetWorkCount++;

    const newWk: Employee = {
      name,
      isNew: true,
      isNight: false,
      targetWorkCount,
      workCount: 0,
    };

    let validDate = [];

    newSch[startDate] = 1;
    newWk.workCount++;

    for (let i = startDate; i < numDays; i++) validDate.push(i);

    validDate = validDate.sort(() => Math.random() - 0.5);

    while (newWk.workCount < newWk.targetWorkCount) {
      const select = validDate.pop() ?? -1;

      if (select == -1) break;

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
      }
    }

    return { worker: [...wk, newWk], schedule: [...sch, newSch] };
  });

export default changeGroup;
