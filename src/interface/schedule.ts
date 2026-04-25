import Employee from "./employee.ts";

interface Schedule {
  isInit: boolean;
  date: string;
  weekday: number;
  numDays: number;
  group: number;
  selectedDay: Array<number>;
  selectedNight: Array<number>;
  holidays: Array<number>;
  schedule: Array<Array<number>>;
  worker: Array<Employee>;
  dayGroup: Array<number>;
  nightGroup: Array<number>;
  dayWorkCount: Array<number>;
  nightWorkCount: Array<number>;
  aloneCount: Array<number>;
  createdAt?: string;
}

export default Schedule;
