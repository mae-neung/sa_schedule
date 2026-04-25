import useScheduleStore from "./index.ts";
import { Dayjs } from "dayjs";
import resetWorkCount from "./resetWorkCount.ts";

const init = (date: Dayjs, group: number) =>
  useScheduleStore.setState((state) => {
    const { worker } = state;

    const wk = [
      ...worker.filter((e) => !e.isNight),
      ...worker.filter((e) => e.isNight),
    ];

    wk.map((w) => {
      w.workCount = 0;
    });

    const target = date.set("date", 1);

    const weekday = target.day();
    const numDays = target.daysInMonth();

    resetWorkCount(true);
    resetWorkCount();

    return {
      worker: wk,
      date: date.format("YYYY-MM-01"),
      weekday: weekday,
      numDays: numDays,
      schedule: Array(worker.length).fill(Array(numDays).fill(0)),
      selectedDay: [],
      selectedNight: [],
      aloneCount: Array(worker.length).fill(0),
      dayGroup: [0, 0, 0, 0],
      nightGroup: [0, 0, 0, 0],
      dayWorkCount: Array(date.daysInMonth()).fill(0),
      nightWorkCount: Array(date.daysInMonth()).fill(0),
      group: group,
      isInit: true,
    };
  });

export default init;
