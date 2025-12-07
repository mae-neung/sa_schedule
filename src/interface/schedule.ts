import Employee from "./employee.ts";

interface Schedule {
  date: string;
  weekday: number;
  numDays: number;
  numRest: number;
  group: number;
  daySchedule: Array<Array<number>>;
  nightSchedule: Array<Array<number>>;
  dayWorker: Array<Employee>;
  nightWorker: Array<Employee>;
  dayGroup: Array<number>;
  nightGroup: Array<number>;
  dayWorkCount: Array<number>;
  selectedDay: Array<number>;
  selectedNight: Array<number>;
  base?: string;
  nightWorkCount: Array<number>;
  createdAt?: string;
}

export default Schedule;
