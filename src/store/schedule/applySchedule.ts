import useScheduleStore from "./index.ts";
import Employee from "../../interface/employee.ts";

const applySchedule = (
  day: number,
  schedule: number[][],
  worker: Employee[],
  aloneCount: number[],
  workCount: number[],
  groupCount: number[],
  night?: boolean,
) => {
  const { numDays, group, numRest } = useScheduleStore.getState();

  const numWorkers = worker.length;

  let candidates: number[] = Array.from({ length: numWorkers }, (_, i) => i);

  const targetWork = numDays - numRest;

  if (night) {
    candidates = candidates.filter((w) => worker[w].isNight);
    /* 야간 로직 */
    if (workCount[day] === 0)
      candidates = candidates.filter((w) => !worker[w].isNew);

    if (day > 0)
      candidates = candidates.filter((w) => schedule[w][day - 1] !== 2);

    if (day > 2)
      candidates = candidates.filter(
        (w) => schedule[w][day - 3] !== 3 || schedule[w][day - 2] !== 2,
      );

    if (day + 1 < numDays)
      candidates = candidates.filter(
        (w) => ![2, 4, 5, 6].includes(schedule[w][day + 1]),
      );

    if (day + 4 < numDays)
      candidates = candidates.filter(
        (w) => schedule[w][day + 2] !== 2 && schedule[w][day + 4] !== 2,
      );

    candidates = candidates.filter(
      (w) => worker[w].workCount < targetWork - 1 && schedule[w][day] === 0,
    );

    candidates = candidates.sort((a, b) =>
      aloneCount[a] <= aloneCount[b] ? -1 : 1,
    );
    candidates = candidates.filter(
      (v) => aloneCount[v] == aloneCount[candidates[0]],
    );
    candidates = candidates.sort(() => Math.random() - 0.5);

    if (candidates.length > 0) {
      const selected = candidates[0];
      schedule[selected][day] = 2;
      if (day + 1 < numDays) {
        schedule[selected][day + 1] = 3;
        worker[selected].workCount++;
      }
      workCount[day]++;
      worker[selected].workCount++;

      if (workCount[day] == 1) {
        groupCount[(32 + group - day - 1) % 4]++;
        aloneCount[selected]++;
      }
      if (workCount[day] == 2) {
        groupCount[(32 + group - day - 1) % 4]--;
        const target = worker.findIndex(
          (_, idx) => idx !== selected && schedule[idx][day] === 2,
        );
        if (target > -1) aloneCount[target]--;
      }
    }
  } else {
    candidates = candidates.filter((w) => !worker[w].isNight);
    /* 주간 로직 */
    if (workCount[day] === 0)
      candidates = candidates.filter((w) => !worker[w].isNew);

    for (let i = 0; i < 5; i++)
      if (day >= 4 - i && day + i < numDays)
        candidates = candidates.filter((w) => {
          const recentWork = schedule[w].slice(day + i - 4, day + i + 1);
          return recentWork.filter((v) => v === 1).length < 4;
        });

    candidates = candidates.filter(
      (w) => worker[w].workCount < targetWork && schedule[w][day] === 0,
    );

    candidates = candidates.sort((a, b) =>
      aloneCount[a] <= aloneCount[b] ? -1 : 1,
    );
    candidates = candidates.filter(
      (v) => aloneCount[v] == aloneCount[candidates[0]],
    );
    candidates = candidates.sort(() => Math.random() - 0.5);

    if (candidates.length > 0) {
      const selected = candidates[0];
      schedule[selected][day] = 1;
      worker[selected].workCount++;
      workCount[day]++;
      if (workCount[day] == 1) {
        groupCount[(32 + group - day) % 4]++;
        aloneCount[selected]++;
      }
      if (workCount[day] == 2) {
        groupCount[(32 + group - day) % 4]--;
        const target = worker.findIndex(
          (_, idx) => idx !== selected && schedule[idx][day] == 1,
        );
        if (target > -1) aloneCount[target]--;
      }
    }
  }
};

export default applySchedule;
