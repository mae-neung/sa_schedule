import { create } from "zustand";
import Schedule from "../../interface/schedule.ts";

const useScheduleStore = create<Schedule>(() => ({
  isInit: false,
  date: "",
  weekday: 0,
  numDays: 0,
  group: 0,
  schedule: [],
  worker: [],
  aloneCount: [],
  dayGroup: [0, 0, 0, 0],
  nightGroup: [0, 0, 0, 0],
  selectedDay: [],
  selectedNight: [],
  dayWorkCount: [],
  nightWorkCount: [],
}));

export default useScheduleStore;
