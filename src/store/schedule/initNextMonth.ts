import useScheduleStore from "./index.ts";
import resetWorkCount from "./resetWorkCount.ts";
import dayjs from "dayjs";

const initNextMonth = () =>
  useScheduleStore.setState((state) => {
    const { worker, date, group, schedule } = state;

    /* 월 변경 */
    const prev = dayjs(date);
    const target = dayjs(date).add(1, "months");

    const weekday = target.day();
    const numDays = target.daysInMonth();

    /* 근무자 초기화 */
    const wk = [
      ...worker.filter((e) => !e.isNight),
      ...worker.filter((e) => e.isNight),
    ];
    wk.map((w) => {
      w.workCount = 0;
    });

    /* 스케줄 기본 설정 */
    let sch = Array(worker.length)
      .fill(Array(numDays).fill(0))
      .map((v) => [...v]);

    for (let i = 0; i < worker.length; i++) {
      if (schedule[i][schedule[i].length - 1] == 2) {
        sch[i][0] = 3;
        wk[i].workCount += 1;
      }
      worker[i].prevWorkCount =
        schedule[i].length - 1 - schedule[i].lastIndexOf(0);
    }

    /* 근무수 초기화 */
    resetWorkCount(true);
    resetWorkCount();

    return {
      worker: wk,
      date: target.format("YYYY-MM-01"),
      weekday: weekday,
      numDays: numDays,
      schedule: sch,
      selectedDay: [],
      selectedNight: [],
      holidays: [],
      aloneCount: Array(worker.length).fill(0),
      dayGroup: [0, 0, 0, 0],
      nightGroup: [0, 0, 0, 0],
      dayWorkCount: Array(target.daysInMonth()).fill(0),
      nightWorkCount: Array(target.daysInMonth()).fill(0),
      group: (group + prev.daysInMonth()) % 4,
      isInit: true,
    };
  });

export default initNextMonth;
