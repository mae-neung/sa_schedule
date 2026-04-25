import { create } from "zustand";
import { persist } from "zustand/middleware";
import Schedule from "../../interface/schedule.ts";

const useScheduleStore = create<Schedule>()(
  persist<Schedule>(
    () => ({
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
      holidays: [],
      dayWorkCount: [],
      nightWorkCount: [],
    }),
    { name: "schedule-store" },
  ),
);

export default useScheduleStore;
