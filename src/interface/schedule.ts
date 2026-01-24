import Employee from "./employee.ts";

interface Schedule {
  isInit: boolean;
  date: string;
  weekday: number;
  numDays: number;
  numRest: number;
  group: number;
  selectedDay: Array<number>;
  selectedNight: Array<number>;
  schedule: Array<Array<number>>;
  worker: Array<Employee>;
  dayGroup: Array<number>;
  nightGroup: Array<number>;
  dayWorkCount: Array<number>;
  nightWorkCount: Array<number>;
  aloneCount: Array<number>;
  base?: string;
  createdAt?: string;
}

export default Schedule;
