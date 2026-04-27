import useScheduleStore from "./index.ts";
import Employee from "../../interface/employee.ts";

const CONSECUTIVE_WORK = new Set([1, 2, 3, 7]);

const checkConsecutive = (
  schedule: number[][],
  w: number,
  day: number,
  numDays: number,
) => {
  let back = 0;
  for (let d = day - 1; d >= 0 && CONSECUTIVE_WORK.has(schedule[w][d]); d--)
    back++;
  let fwd = 0;
  for (
    let d = day + 1;
    d < numDays && CONSECUTIVE_WORK.has(schedule[w][d]);
    d++
  )
    fwd++;
  return back + 1 + fwd <= 4;
};

const applySchedule = (
  day: number,
  schedule: number[][],
  worker: Employee[],
  aloneCount: number[],
  workCount: number[],
  groupDouble: number[],
  groupTotal: number[],
  night?: boolean,
) => {
  const { numDays, group } = useScheduleStore.getState();

  // 하루 최대 2인 제한
  if (workCount[day] >= 2) return;

  const numWorkers = worker.length;

  let candidates: number[] = Array.from({ length: numWorkers }, (_, i) => i);

  if (night) {
    candidates = candidates.filter((w) => worker[w].isNight);
    candidates = candidates.filter((w) => schedule[w][day] == 0);

    /* 야간 로직 */
    // 첫 야간 배치 시 신입 불가
    if (workCount[day] === 0)
      candidates = candidates.filter((w) => !worker[w].isNew);

    // 월초 연속근무 제한
    if (day < 4) {
      candidates = candidates.filter(
        (w) =>
          schedule[w].indexOf(0) != day ||
          (worker[w].prevWorkCount ?? 0) +
            schedule[w].indexOf(0) +
            schedule[w].slice(day + 2).indexOf(0) <
            4,
      );
    }

    // 야간 3연속 불가 (야비야비야 패턴 방지)
    if (day > 2)
      candidates = candidates.filter(
        (w) => schedule[w][day - 3] !== 3 || schedule[w][day - 2] !== 2,
      );

    // 다음날 이미 비번/연가/지정휴 있으면 불가
    if (day + 1 < numDays)
      candidates = candidates.filter(
        (w) => ![2, 4, 5, 6].includes(schedule[w][day + 1]),
      );

    // 야비야비 패턴 간격 제한
    if (day + 4 < numDays)
      candidates = candidates.filter(
        (w) => schedule[w][day + 2] !== 2 || schedule[w][day + 4] !== 2,
      );

    if (1 < day && day + 2 < numDays)
      candidates = candidates.filter(
        (w) => schedule[w][day - 2] !== 2 || schedule[w][day + 2] !== 2,
      );

    // 5일 이상 연속 근무 불가
    candidates = candidates.filter((w) =>
      checkConsecutive(schedule, w, day, numDays),
    );

    candidates = candidates.filter(
      (w) => worker[w].workCount < numDays - worker[w].targetWorkCount - 1,
    );

    // 비번 다음날 야간 비선호 (여유 있을 때만 적용)
    if (day > 0) {
      const temp = candidates.filter((w) => schedule[w][day - 1] != 3);
      if (temp.length > 0) candidates = temp;
    }

    // 1인 근무일엔 aloneCount 기준, 아니면 랜덤
    if (schedule.filter((w) => w[day] === 2).length > 0) {
      candidates = candidates.sort((a, b) =>
        aloneCount[a] <= aloneCount[b] ? -1 : 1,
      );
    } else {
      candidates = candidates.sort(() => Math.random() - 0.5);
    }

    candidates = candidates.filter(
      (v) => aloneCount[v] == aloneCount[candidates[0]],
    );

    if (candidates.length > 0) {
      const selected = candidates[0];
      const gIdx = (33 + group - day) % 4;
      schedule[selected][day] = 2;
      if (day + 1 < numDays) {
        schedule[selected][day + 1] = 3;
        worker[selected].workCount++;
      }
      workCount[day]++;
      worker[selected].workCount++;

      if (workCount[day] == 1) {
        groupTotal[gIdx]++;
        aloneCount[selected]++;
      }
      if (workCount[day] == 2) {
        groupDouble[gIdx]++;
        const target = worker.findIndex(
          (_, idx) => idx !== selected && schedule[idx][day] === 2,
        );
        if (target > -1) aloneCount[target]--;
      }
    }
  } else {
    candidates = candidates.filter((w) => !worker[w].isNight);

    /* 주간 로직 */
    // 첫 주간 배치 시 신입 불가
    if (workCount[day] === 0)
      candidates = candidates.filter((w) => !worker[w].isNew);

    // 월초 연속근무 제한
    if (day < 4) {
      candidates = candidates.filter(
        (w) =>
          schedule[w].indexOf(0) != day ||
          (worker[w].prevWorkCount ?? 0) +
            schedule[w].indexOf(0) +
            schedule[w].slice(day + 1).indexOf(0) <
            5,
      );
    }

    // 야비주 패턴 불가 (비번 다음날 주간 배치 불가)
    if (day > 0)
      candidates = candidates.filter((w) => schedule[w][day - 1] !== 3);

    // 5일 이상 연속 근무 불가
    candidates = candidates.filter((w) =>
      checkConsecutive(schedule, w, day, numDays),
    );

    // 목표 휴일 수 초과 방지 + 빈 날만
    candidates = candidates.filter(
      (w) =>
        worker[w].workCount < numDays - worker[w].targetWorkCount &&
        schedule[w][day] === 0,
    );

    // aloneCount 기준 정렬, 동점 시 랜덤
    candidates = candidates.sort((a, b) =>
      aloneCount[a] !== aloneCount[b]
        ? aloneCount[a] - aloneCount[b]
        : Math.random() - 0.5,
    );
    candidates = candidates.filter(
      (v) => aloneCount[v] === aloneCount[candidates[0]],
    );

    if (candidates.length > 0) {
      const selected = candidates[0];
      const gIdx = (32 + group - day) % 4;
      schedule[selected][day] = 1;
      worker[selected].workCount++;
      workCount[day]++;

      if (workCount[day] == 1) {
        groupTotal[gIdx]++;
        aloneCount[selected]++;
      }
      if (workCount[day] == 2) {
        groupDouble[gIdx]++;
        const target = worker.findIndex(
          (_, idx) => idx !== selected && schedule[idx][day] == 1,
        );
        if (target > -1) aloneCount[target]--;
      }
    }
  }
};

export default applySchedule;