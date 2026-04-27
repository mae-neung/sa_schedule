import useScheduleStore from "./index.ts";
import recalcCounts from "./recalcCounts.ts";

const changeSchedule = (
  emp: number,
  day: number,
  workType: number,
  night?: boolean,
) =>
  useScheduleStore.setState((state) => {
    const { numDays, worker, schedule, group, selectedDay, selectedNight } = state;

    const sch = schedule.map((v) => [...v]);

    /* 같은 근무형태 클릭 시 휴로 토글 */
    if (sch[emp][day] === workType) {
      if (workType === 0) return {};
      workType = 0;
    }

    /* 비번(type 3)은 day 0에서만 수동 변경 가능 */
    if (day !== 0 && (sch[emp][day] === 3 || workType === 3)) return {};

    /* 야간 해제 시 다음 날 비번 초기화 */
    if (sch[emp][day] === 2 && day < numDays - 1) {
      sch[emp][day + 1] = 0;
    }

    sch[emp][day] = workType;

    /* 야간 설정 시 다음 날 비번으로 설정 */
    if (workType === 2 && day < numDays - 1) {
      sch[emp][day + 1] = 3;
    }

    return {
      schedule: sch,
      ...recalcCounts(sch, worker, numDays, group, selectedDay, selectedNight),
    };
  });

export default changeSchedule;