import { create } from "zustand/react";
import dayjs, { Dayjs } from "dayjs";
import Employee from "../interface/employee.ts";
import Schedule from "../interface/schedule.ts";
import ExcelJS from "exceljs";
import { GROUP, GROUP_WORK_TYPE, WEEKDAY, WORK_TYPES } from "../contant.ts";
import { RcFile } from "antd/es/upload";

interface ScheduleStore {
  isInit: boolean;
  date: string;
  weekday: number;
  numDays: number;
  numRest: number;
  group: number;
  selectedDay: Array<number>;
  selectedNight: Array<number>;
  daySchedule: Array<Array<number>>;
  nightSchedule: Array<Array<number>>;
  dayWorker: Array<Employee>;
  nightWorker: Array<Employee>;
  dayGroup: Array<number>;
  nightGroup: Array<number>;
  dayWorkCount: Array<number>;
  nightWorkCount: Array<number>;
  base?: string;
  createdAt?: string;
  init: (date: Dayjs, numRest: number, group: number) => void;
  makeDaySchedule: (allowTwo?: boolean) => void;
  makeNightSchedule: () => void;
  resetWorkCount: (night?: boolean) => void;
  applySchedule: (
    day: number,
    schedule: number[][],
    workCount: number[],
    groupCount: number[],
    night?: boolean,
  ) => void;
  changeSchedule: (
    emp: number,
    day: number,
    workType: number,
    night?: boolean,
  ) => boolean;
  saveBase: () => void;
  loadBase: () => void;
  resetBase: () => void;
  loadSchedule: (schedule: Schedule) => void;
  toJson: () => string;
  jsonToSchedule: (json: string) => void;
  setWorker: (worker: Employee, night?: boolean) => void;
  removeWorker: (idx: number, night?: boolean) => void;
  setInit: () => void;
  scheduleToExcel: () => void;
  excelToSchedule: (file: RcFile) => void;
  setSelected: (selectedDay: Array<number>, night?: boolean) => void;
}

const useSchedule = create<ScheduleStore>((set, get) => {
  return {
    isInit: false,
    date: "",
    weekday: 0,
    numDays: 0,
    numRest: 0,
    group: 0,
    dayWorker: [],
    nightWorker: [],
    daySchedule: [],
    nightSchedule: [],
    dayGroup: [0, 0, 0, 0],
    nightGroup: [0, 0, 0, 0],
    selectedDay: [],
    selectedNight: [],
    dayWorkCount: [],
    nightWorkCount: [],
    init: (date, numRest, group) => {
      const { nightWorker, dayWorker, resetWorkCount } = get();

      const target = date.set("date", 1);

      const selectedDay = [];
      const selectedNight = [];

      const weekday = target.day();
      const numDays = target.daysInMonth();

      for (let i = 0; i < target.daysInMonth(); i++) {
        if ([5, 6].includes((weekday + i) % 7)) {
          selectedNight.push(i);
        }
        if ((weekday + i) % 7 == 6) {
          selectedDay.push(i);
        }
      }

      set({
        date: date.format("YYYY-MM-01"),
        weekday: weekday,
        numDays: numDays,
        numRest: numRest,
        daySchedule: Array(dayWorker.length).fill(Array(numDays).fill(0)),
        nightSchedule: Array(nightWorker.length).fill(Array(numDays).fill(0)),
        selectedDay: selectedDay,
        selectedNight: selectedNight,
        dayWorker: dayWorker,
        nightWorker: nightWorker,
        dayGroup: [0, 0, 0, 0],
        nightGroup: [0, 0, 0, 0],
        dayWorkCount: Array(date.daysInMonth()).fill(0),
        nightWorkCount: Array(date.daysInMonth()).fill(0),
        group: group,
        base: undefined,
        isInit: true,
      });
      resetWorkCount(true);
      resetWorkCount();
    },
    makeDaySchedule(allowTwo): void {
      const {
        daySchedule,
        applySchedule,
        numDays,
        selectedDay,
        dayGroup,
        dayWorkCount,
        jsonToSchedule,
        base,
      } = get();

      if (base) jsonToSchedule(base);

      const schedule = daySchedule.map((arr) => [...arr]);
      const workCount = [...dayWorkCount];
      const group = [...dayGroup];

      for (const date of selectedDay)
        applySchedule(date, schedule, workCount, group);

      /* 1인 근무자 배치 */
      for (let day = 0; day < numDays; day++)
        if (workCount[day] < 2) applySchedule(day, schedule, workCount, group);

      if (allowTwo) {
        let ranDate: number[] = Array.from({ length: numDays }, (_, i) => i);

        // shuffle
        ranDate = ranDate.sort(() => Math.random() - 0.5);

        while (ranDate.length > 0) {
          const minIndex = group
            .map((value, index) => ({ index, value }))
            .reduce((min, curr) => (curr.value < min.value ? curr : min)).index;

          ranDate.sort((a, b) => {
            const aKey = a % 4 === minIndex ? 0 : 1;
            const bKey = b % 4 === minIndex ? 0 : 1;
            return aKey - bKey;
          });

          const select = ranDate.pop()!;

          if (workCount[select] < 2)
            applySchedule(select, schedule, workCount, group);
        }
      }

      set({
        daySchedule: schedule,
        dayGroup: group,
        dayWorkCount: workCount,
      });
    },
    makeNightSchedule: () => {
      const {
        nightSchedule,
        nightWorkCount,
        nightGroup,
        applySchedule,
        numDays,
        selectedNight,
      } = get();

      const workCount = [...nightWorkCount];
      const schedule = nightSchedule.map((arr) => [...arr]);
      const group = [...nightGroup];

      for (const date of selectedNight)
        applySchedule(date, schedule, workCount, group, true);

      for (let day = 0; day < numDays; day++)
        if (workCount[day] < 2)
          applySchedule(day, schedule, workCount, group, true);

      // 랜덤 날짜 배열 생성 및 셔플
      let ranDate: number[] = Array.from({ length: numDays }, (_, i) => i);
      ranDate = ranDate.sort(() => Math.random() - 0.5);

      while (ranDate.length > 0) {
        const minIndex = group
          .map((value, index) => ({ index, value }))
          .reduce((min, curr) => (curr.value >= min.value ? curr : min)).index;

        ranDate.sort((a, b) => {
          const aKey = a % 4 === minIndex ? 0 : 1;
          const bKey = b % 4 === minIndex ? 0 : 1;
          return aKey - bKey;
        });

        const select = ranDate.pop()!;

        if (workCount[select] < 2)
          applySchedule(select, schedule, workCount, group, true);
      }

      set({
        nightSchedule: schedule,
        nightGroup: group,
        nightWorkCount: workCount,
      });
    },
    applySchedule(day, schedule, workCount, groupCount, night): void {
      const { nightWorker, dayWorker, numDays, group, numRest } = get();

      const numWorkers = night ? nightWorker.length : dayWorker.length;
      let candidates: number[] = Array.from(
        { length: numWorkers },
        (_, i) => i,
      );
      const targetWork = numDays - numRest;

      if (night) {
        /* 야간 로직 */
        const worker = [...nightWorker];
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
            (w) =>
              schedule[w][day + 1] !== 4 &&
              schedule[w][day + 1] !== 2 &&
              schedule[w][day + 1] !== 5,
          );

        if (day + 4 < numDays)
          candidates = candidates.filter(
            (w) => schedule[w][day + 2] !== 2 && schedule[w][day + 4] !== 2,
          );

        candidates = candidates.filter(
          (w) => worker[w].workCount < targetWork - 1 && schedule[w][day] === 0,
        );

        // shuffle
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
          set({ nightWorker: worker });

          if (workCount[day] == 1) groupCount[(group + day) % 4]++;
          if (workCount[day] == 2) groupCount[(group + day) % 4]--;
        }
      } else {
        /* 주간 로직 */
        const worker = [...dayWorker];

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

        // shuffle
        candidates = candidates.sort(() => Math.random() - 0.5);

        if (candidates.length > 0) {
          const selected = candidates[0];
          schedule[selected][day] = 1;
          worker[selected].workCount++;
          workCount[day]++;
          set({ dayWorker: worker });
          if (workCount[day] == 1) groupCount[(group + day) % 4]++;
          if (workCount[day] == 2) groupCount[(group + day) % 4]--;
        }
      }
    },
    changeSchedule: (emp, day, workType, night) => {
      const {
        nightSchedule,
        nightWorkCount,
        nightWorker,
        daySchedule,
        dayWorker,
        nightGroup,
        numDays,
        group,
        dayGroup,
        dayWorkCount,
      } = get();

      const schedule = night
        ? nightSchedule.map((arr) => [...arr])
        : daySchedule.map((arr) => [...arr]);
      const worker = night ? [...nightWorker] : [...dayWorker];
      const dGroup = [...dayGroup];
      const nGroup = [...nightGroup];
      const dWorkCount = [...dayWorkCount];
      const nWorkCount = [...nightWorkCount];

      const dGroupIdx = (group + day) % 4;
      const nGroupIdx = (group + day - 1) % 4;

      /* 변경 사항이 없을 경우*/
      if (schedule[emp][day] == workType) return false;

      /* 휴무로 변경하는 경우 */
      if (workType === 0) {
        if (schedule[emp][day] == 1) {
          worker[emp].workCount--;
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) dGroup[dGroupIdx]--;
          if (dWorkCount[day] === 1) dGroup[dGroupIdx]++;
        }
        if (schedule[emp][day] == 2) {
          worker[emp].workCount--;
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) nGroup[nGroupIdx]--;
          if (nWorkCount[day] === 1) nGroup[nGroupIdx]++;

          if (day < numDays - 1) {
            schedule[emp][day + 1] = 0;
            worker[emp].workCount--;
          }
        }
        if (schedule[emp][day] == 3) {
          if (day !== 0) return false;
          worker[emp].workCount--;
        }
        if (schedule[emp][day] == 4) worker[emp].workCount--;

        schedule[emp][day] = 0;
      }
      /* 주간으로 변경하는 경우 */
      if (workType === 1) {
        if (schedule[emp][day] == 2) {
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) nGroup[nGroupIdx]--;
          if (nWorkCount[day] === 1) nGroup[nGroupIdx]++;
          if (day < numDays - 1) {
            schedule[emp][day + 1] = 0;
            worker[emp].workCount--;
          }
        }
        if (schedule[emp][day] == 3) if (day !== 0) return false;
        if (schedule[emp][day] == 0 || schedule[emp][day] == 5)
          worker[emp].workCount++;
        schedule[emp][day] = 1;
        dWorkCount[day]++;
        if (dWorkCount[day] === 1) dGroup[dGroupIdx]++;
        if (dWorkCount[day] === 2) dGroup[dGroupIdx]--;
      }
      /* 야간으로 변경하는 경우 */
      if (workType === 2) {
        if (day < numDays - 1 && schedule[emp][day + 1] != 0) return false;
        if (schedule[emp][day] == 0 || schedule[emp][day] == 5)
          worker[emp].workCount++;

        if (schedule[emp][day] == 1) {
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) dGroup[dGroupIdx]--;
          if (dWorkCount[day] === 1) dGroup[dGroupIdx]++;
        }
        if (schedule[emp][day] == 3) if (day !== 0) return false;

        if (day < numDays - 1) {
          schedule[emp][day + 1] = 3;
          worker[emp].workCount++;
        }
        schedule[emp][day] = 2;
        nWorkCount[day]++;
        if (nWorkCount[day] === 1) nGroup[nGroupIdx]++;
        if (nWorkCount[day] === 2) nGroup[nGroupIdx]--;
      }
      /* 비번으로 변경하는 경우 */
      if (workType === 3) {
        if (day != 0) return false;
        if (schedule[emp][day] === 0 || schedule[emp][day] === 5)
          worker[emp].workCount++;

        if (schedule[emp][day] === 1) {
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) dGroup[(day + 1) % 4]--;
          if (dWorkCount[day] === 1) dGroup[(day + 1) % 4]++;
        }
        if (schedule[emp][day] == 2) {
          schedule[emp][day + 1] = 0;
          worker[emp].workCount--;
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) nGroup[(day + 1) % 4]--;
          if (nWorkCount[day] === 1) nGroup[(day + 1) % 4]++;
        }
        schedule[emp][day] = 3;
      }
      /* 연차로 변경 */
      if (workType === 4) {
        if (schedule[emp][day] == 0 || schedule[emp][day] == 5)
          worker[emp].workCount++;
        if (schedule[emp][day] === 1) {
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) dGroup[(day + 1) % 4]--;
          if (dWorkCount[day] === 1) dGroup[(day + 1) % 4]++;
        }
        if (schedule[emp][day] == 2) {
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) nGroup[(day + 1) % 4]--;
          if (nWorkCount[day] === 1) nGroup[(day + 1) % 4]++;
          if (day < numDays - 1) {
            schedule[emp][day + 1] = 0;
            worker[emp].workCount--;
          }
        }
        if (schedule[emp][day] == 3) if (day !== 0) return false;
        schedule[emp][day] = 4;
      }
      /* 지정 휴일로 변경 */
      if (workType === 5) {
        if (schedule[emp][day] == 1) {
          worker[emp].workCount--;
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) dGroup[dGroupIdx]--;
          if (dWorkCount[day] === 1) dGroup[dGroupIdx]++;
        }
        if (schedule[emp][day] == 2) {
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) nGroup[(day + 1) % 4]--;
          if (nWorkCount[day] === 1) nGroup[(day + 1) % 4]++;
          worker[emp].workCount--;
          if (day < numDays - 1) {
            schedule[emp][day + 1] = 0;
            worker[emp].workCount--;
          }
        }
        if (schedule[emp][day] == 3) if (day !== 0) return false;
        if (schedule[emp][day] == 4) worker[emp].workCount--;
        schedule[emp][day] = 5;
      }

      set(
        night
          ? {
              nightSchedule: schedule,
              nightWorker: worker,
              dayGroup: dGroup,
              nightGroup: nGroup,
              dayWorkCount: dWorkCount,
              nightWorkCount: nWorkCount,
            }
          : {
              daySchedule: schedule,
              dayWorker: worker,
              dayGroup: dGroup,
              nightGroup: nGroup,
              dayWorkCount: dWorkCount,
              nightWorkCount: nWorkCount,
            },
      );
      return true;
    },
    resetWorkCount(night?: boolean): void {
      const { nightWorker, dayWorker, numDays } = get();

      const target = night ? nightWorker : dayWorker;

      for (const emp of target) emp.workCount = 0;

      if (night)
        set({
          nightWorker: [...target],
          nightWorkCount: Array(numDays).fill(0),
          nightGroup: [0, 0, 0, 0],
        });
      else
        set({
          dayWorker: [...target],
          dayWorkCount: Array(numDays).fill(0),
          dayGroup: [0, 0, 0, 0],
        });
    },
    saveBase: () => set({ base: get().toJson() }),
    loadBase: () => {
      const { base, jsonToSchedule } = get();
      if (!base) return;
      jsonToSchedule(base);
    },
    resetBase: () => set({ base: undefined }),
    loadSchedule: (schedule) => set({ ...schedule }),
    toJson: () => {
      const schedule: Schedule = { ...get() };

      return JSON.stringify(schedule);
    },
    jsonToSchedule: (json) => {
      const schedule: Schedule = JSON.parse(json);

      set({ ...schedule });
    },
    setWorker: (worker, night) => {
      const { nightWorker, dayWorker } = get();
      let employees = night ? [...nightWorker, worker] : [...dayWorker, worker];

      set(night ? { nightWorker: employees } : { dayWorker: employees });
    },
    removeWorker: (idx, night) => {
      const { dayWorker, nightWorker, daySchedule, nightSchedule } = get();

      let employees = night ? [...nightWorker] : [...dayWorker];
      let schedule = night
        ? nightSchedule.map((arr) => [...arr])
        : daySchedule.map((arr) => [...arr]);

      employees = employees.filter((_, target) => target != idx);
      schedule = schedule.filter((_, target) => target != idx);

      set(
        night
          ? { nightWorker: employees, nightSchedule: schedule }
          : { dayWorker: employees, daySchedule: schedule },
      );
    },
    setInit: () => set({ isInit: true }),
    setSelected: (selectedDay, night) =>
      set(
        night ? { selectedNight: selectedDay } : { selectedDay: selectedDay },
      ),
    scheduleToExcel: async () => {
      const {
        nightSchedule,
        nightWorkCount,
        nightWorker,
        daySchedule,
        dayWorker,
        nightGroup,
        numDays,
        group,
        selectedNight,
        selectedDay,
        dayGroup,
        dayWorkCount,
        base,
        numRest,
        weekday,
        date,
      } = get();

      const scheduleData = [
        dayjs(date).month() + 1,
        numDays,
        numRest,
        weekday,
        group,
        dayWorker.length,
        nightWorker.length,
        date,
      ];

      const workerDataRows = [...dayWorker, ...nightWorker].map((emp, idx) => [
        idx + 1,
        emp.name,
        emp.workCount,
        emp.isNew,
      ]);

      const dayScheduleDataRows = daySchedule.map((work) =>
        work.map((workType) => workType),
      );
      const nightScheduleDataRows = nightSchedule.map((work) =>
        work.map((workType) => workType),
      );
      const dayWorkCountDataRows = dayWorkCount.map((count) => count);
      const nightWorkCountDataRows = nightWorkCount.map((count) => count);
      const dayGroupCountDataRows = dayGroup.map((count) => count);
      const nightGroupCountDataRows = nightGroup.map((count) => count);

      const selectedDayDataRows = [...selectedDay];
      const selectedNightDataRows = [...selectedNight];

      const filePath = "/frame.xlsx";

      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const defaultSheet = workbook.getWorksheet("default");
      defaultSheet?.addRows([scheduleData]);

      const workerSheet = workbook.getWorksheet("worker");
      workerSheet?.addRows([...workerDataRows]);

      const dayScheduleSheet = workbook.getWorksheet("daySchedule");
      dayScheduleSheet?.addRows([...dayScheduleDataRows]);

      const nightScheduleSheet = workbook.getWorksheet("nightSchedule");
      nightScheduleSheet?.addRows([...nightScheduleDataRows]);

      const totalScheduleSheet = workbook.getWorksheet("totalSchedule");
      totalScheduleSheet?.addRows([
        ...dayScheduleDataRows.map((emp) => emp.map((v) => WORK_TYPES[v])),
        ...nightScheduleDataRows.map((emp) => emp.map((v) => WORK_TYPES[v])),
      ]);

      const dayWorkCountSheet = workbook.getWorksheet("dayWorkCount");
      dayWorkCountSheet?.addRows([dayWorkCountDataRows]);

      const nightWorkCountSheet = workbook.getWorksheet("nightWorkCount");
      nightWorkCountSheet?.addRows([nightWorkCountDataRows]);

      const dayGroupCountSheet = workbook.getWorksheet("dayGroupCount");
      dayGroupCountSheet?.addRows([dayGroupCountDataRows]);

      const nightGroupCountSheet = workbook.getWorksheet("nightGroupCount");
      nightGroupCountSheet?.addRows([nightGroupCountDataRows]);

      const selectedDaySheet = workbook.getWorksheet("selectedDay");
      selectedDaySheet?.addRows([selectedDayDataRows]);

      const selectedNightSheet = workbook.getWorksheet("selectedNight");
      selectedNightSheet?.addRows([selectedNightDataRows]);

      const baseSheet = workbook.getWorksheet("base");
      baseSheet?.addRows([[base ?? ""]]);

      const worker = [...dayWorker, ...nightWorker];
      const schedule = [...daySchedule, ...nightSchedule];

      const scheduleSheet = workbook.getWorksheet("시간표");
      if (!scheduleSheet) return;
      for (let i = 0; i < numDays; i++) {
        scheduleSheet.getCell(4, 3 + i).value = i + 1;
        scheduleSheet.getCell(5, 3 + i).value = WEEKDAY[(i + weekday) % 7];
        for (let j = 0; j < GROUP.length; j++) {
          scheduleSheet.getCell(22 + j, 3 + i).value =
            GROUP_WORK_TYPE[(group + j + i) % 4];
        }
      }

      for (let i = 0; i < worker.length; i++) {
        const workSheet = workbook.getWorksheet("worker" + i);
        if (!workSheet || !scheduleSheet) return;
        workSheet.name = worker[i].name;
        workSheet.state = "visible";
        workSheet.getCell(2, 1).value = dayjs(date).format("YYYY년 MM월");
        workSheet.getCell(3, 19).value = dayjs(date).format(worker[i].name);

        scheduleSheet.getCell(6 + i, 1).value = i + 1;
        scheduleSheet.getCell(6 + i, 2).value = worker[i].name;

        for (let j = 0; j < numDays; j++) {
          workSheet.getCell(j < 16 ? 4 : 9, 2 + (j % 16)).value = j + 1;
          workSheet.getCell(j < 16 ? 5 : 10, 2 + (j % 16)).value =
            WEEKDAY[(weekday + j) % 7];
          workSheet.getCell(j < 16 ? 6 : 11, 2 + (j % 16)).value =
            WORK_TYPES[schedule[i][j]];

          scheduleSheet.getCell(6 + i, 3 + j).value =
            WORK_TYPES[schedule[i][j]];
        }
      }

      for (let i = worker.length; i < 16; i++)
        scheduleSheet.getRow(6 + i).hidden = true;

      for (let i = 0; i < GROUP.length; i++) {
        scheduleSheet.getCell(30 + i, 29).value = dayGroup[i];
        scheduleSheet.getCell(30 + i, 30).value = nightGroup[i];
      }

      const buffer = await workbook.xlsx.writeBuffer();

      // Blob 생성
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = dayjs(date).format("YYYY년_MM월_시간표") + `.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    excelToSchedule: async (file) => {
      const arrayBuffer = await file.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const defaultSheet = workbook.getWorksheet("default");
      if (!defaultSheet) return;
      const defaultRow = defaultSheet.getRow(1);

      const numDayWorker = defaultRow.getCell(6).value as number;
      const numNightWorker = defaultRow.getCell(7).value as number;
      const numDays = defaultRow.getCell(2).value as number;
      const date = defaultRow.getCell(8).value as string;

      const workerSheet = workbook.getWorksheet("worker");
      if (!workerSheet) return;
      const dayEmpList: Employee[] = [];
      for (let idx = 0; idx < numDayWorker; idx++) {
        const workerRow = workerSheet.getRow(idx + 1);
        const employee: Employee = {
          name: workerRow.getCell(2).value as string,
          workCount: workerRow.getCell(3).value as number,
          isNew: workerRow.getCell(4).value as boolean,
        };
        dayEmpList.push(employee);
      }

      const nightEmpList: Employee[] = [];
      for (let idx = numDayWorker; idx < numNightWorker + numDayWorker; idx++) {
        const workerRow = workerSheet.getRow(idx + 1);
        const employee: Employee = {
          name: workerRow.getCell(2).value as string,
          workCount: workerRow.getCell(3).value as number,
        };
        nightEmpList.push(employee);
      }

      let daySchedule: number[][] = [];

      const dayScheduleSheet = workbook.getWorksheet("daySchedule");
      if (!dayScheduleSheet) return;
      for (let i = 0; i < numDayWorker; i++) {
        const scheduleRow = dayScheduleSheet.getRow(i + 1);
        if (!scheduleRow) return;
        let workerSchedule = [];
        for (let j = 0; j < numDays; j++) {
          workerSchedule.push(scheduleRow.getCell(j + 1).value as number);
        }
        daySchedule.push(workerSchedule);
      }

      const nightSchedule: number[][] = [];
      const nightScheduleSheet = workbook.getWorksheet("nightSchedule");
      if (!nightScheduleSheet) return;
      for (let i = 0; i < numNightWorker; i++) {
        const scheduleRow = nightScheduleSheet.getRow(i + 1);
        if (!scheduleRow) return;
        let workerSchedule = [];
        for (let j = 0; j < numDays; j++) {
          workerSchedule.push(scheduleRow.getCell(j + 1).value as number);
        }
        nightSchedule.push(workerSchedule);
      }

      const dayWorkCount = [];
      const dayWorkCountSheet = workbook.getWorksheet("dayWorkCount");
      if (!dayWorkCountSheet) return;
      const dayWorkCountRow = dayWorkCountSheet.getRow(1);
      for (let i = 0; i < numDays; i++)
        dayWorkCount.push(dayWorkCountRow.getCell(i + 1).value as number);

      const nightWorkCount = [];
      const nightWorkCountSheet = workbook.getWorksheet("nightWorkCount");
      if (!nightWorkCountSheet) return;
      const nightWorkCountRow = nightWorkCountSheet.getRow(1);
      for (let i = 0; i < numDays; i++)
        nightWorkCount.push(nightWorkCountRow.getCell(i + 1).value as number);

      const dayGroupCount = [];
      const dayGroupCountSheet = workbook.getWorksheet("dayGroupCount");
      if (!dayGroupCountSheet) return;
      const dayGroupCountRow = dayGroupCountSheet.getRow(1);
      for (let i = 0; i < 4; i++)
        dayGroupCount.push(dayGroupCountRow.getCell(i + 1).value as number);

      const nightGroupCount = [];
      const nightGroupCountSheet = workbook.getWorksheet("nightGroupCount");
      if (!nightGroupCountSheet) return;
      const nightGroupCountRow = nightGroupCountSheet.getRow(1);
      for (let i = 0; i < 4; i++)
        nightGroupCount.push(nightGroupCountRow.getCell(i + 1).value as number);

      const selectedDay = [];
      const selectedDaySheet = workbook.getWorksheet("selectedDay");
      if (!selectedDaySheet) return;
      const selectedDayRow = selectedDaySheet.getRow(1);
      let count = 1;
      let data = selectedDayRow.getCell(1).value;
      while (data) {
        data = selectedDayRow.getCell(count + 1).value;
        selectedDay.push(data as number);
        count++;
      }

      const selectedNight = [];
      const selectedNightSheet = workbook.getWorksheet("selectedNight");
      if (!selectedNightSheet) return;
      const selectedNightRow = selectedNightSheet.getRow(1);
      data = selectedNightRow.getCell(1).value;
      count = 1;
      while (data) {
        data = selectedNightRow.getCell(count + 1).value;
        selectedNight.push(data as number);
        count++;
      }

      const baseSheet = workbook.getWorksheet("base");
      if (!baseSheet) return;
      const baseRow = baseSheet.getRow(1);
      const base = baseRow.getCell(1).value as string;

      set({
        isInit: true,
        date: date,
        numDays: numDays,
        numRest: defaultRow.getCell(3).value as number,
        weekday: defaultRow.getCell(4).value as number,
        group: defaultRow.getCell(5).value as number,
        daySchedule: daySchedule,
        nightSchedule: nightSchedule,
        dayWorker: dayEmpList,
        selectedDay: selectedDay,
        selectedNight: selectedNight,
        nightWorker: nightEmpList,
        dayWorkCount: dayWorkCount,
        nightWorkCount: nightWorkCount,
        dayGroup: dayGroupCount,
        nightGroup: nightGroupCount,
        base: base,
      });
    },
  };
});

export default useSchedule;
