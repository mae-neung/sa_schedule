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
  schedule: Array<Array<number>>;
  worker: Array<Employee>;
  dayGroup: Array<number>;
  nightGroup: Array<number>;
  dayWorkCount: Array<number>;
  nightWorkCount: Array<number>;
  aloneCount: Array<number>;
  base?: string;
  createdAt?: string;
  init: (date: Dayjs, numRest: number, group: number) => void;
  makeDaySchedule: (allowTwo?: boolean) => void;
  makeNightSchedule: () => void;
  resetWorkCount: (night?: boolean) => void;
  applySchedule: (
    day: number,
    schedule: number[][],
    worker: Employee[],
    aloneCount: number[],
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
  setWorkerList: (Employees: Employee[]) => void;
  changeGroup: (group: number) => void;
}

const useSchedule = create<ScheduleStore>((set, get) => {
  return {
    isInit: false,
    date: "",
    weekday: 0,
    numDays: 0,
    numRest: 0,
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
    init: (date, numRest, group) => {
      const { worker, resetWorkCount } = get();

      const wk = [
        ...worker.filter((e) => !e.isNight),
        ...worker.filter((e) => e.isNight),
      ];

      wk.map((w) => {
        w.workCount = 0;
      });

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
        worker: wk,
        date: date.format("YYYY-MM-01"),
        weekday: weekday,
        numDays: numDays,
        numRest: numRest,
        schedule: Array(worker.length).fill(Array(numDays).fill(0)),
        selectedDay: selectedDay,
        selectedNight: selectedNight,
        aloneCount: Array(worker.length).fill(0),
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
        schedule,
        worker,
        applySchedule,
        aloneCount,
        numDays,
        selectedDay,
        dayGroup,
        dayWorkCount,
        jsonToSchedule,
        base,
      } = get();

      if (base) jsonToSchedule(base);

      const sch = schedule.map((arr) => [...arr]);
      const workCount = [...dayWorkCount];
      const group = [...dayGroup];
      const wk = worker.map((v) => ({ ...v }));
      const aCount = [...aloneCount];

      for (const date of selectedDay)
        applySchedule(date, sch, wk, aCount, workCount, group);

      /* 1인 근무자 배치 */
      for (let day = 0; day < numDays; day++)
        if (workCount[day] < 2)
          applySchedule(day, sch, wk, aCount, workCount, group);

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
            applySchedule(select, sch, wk, aCount, workCount, group);
        }
      }

      set({
        schedule: sch,
        dayGroup: group,
        worker: wk,
        dayWorkCount: workCount,
        aloneCount: aCount,
      });
    },
    makeNightSchedule: () => {
      const {
        schedule,
        nightWorkCount,
        nightGroup,
        worker,
        aloneCount,
        applySchedule,
        numDays,
        selectedNight,
      } = get();

      const workCount = [...nightWorkCount];
      const sch = schedule.map((arr) => [...arr]);
      const group = [...nightGroup];
      const wk = worker.map((v) => ({ ...v }));
      const aCount = [...aloneCount];

      for (const date of selectedNight)
        applySchedule(date, sch, wk, aCount, workCount, group, true);

      for (let day = 0; day < numDays; day++)
        if (workCount[day] < 2)
          applySchedule(day, sch, wk, aCount, workCount, group, true);

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
          applySchedule(select, sch, wk, aCount, workCount, group, true);
      }

      set({
        schedule: sch,
        nightGroup: group,
        aloneCount: aCount,
        worker: wk,
        nightWorkCount: workCount,
      });
    },
    applySchedule(
      day,
      schedule,
      worker,
      aloneCount,
      workCount,
      groupCount,
      night,
    ): void {
      const { numDays, group, numRest } = get();

      const numWorkers = worker.length;

      let candidates: number[] = Array.from(
        { length: numWorkers },
        (_, i) => i,
      );

      const targetWork = numDays - numRest;

      if (night) {
        candidates = candidates.filter((w) => worker[w].isNight);
        /* 야간 로직 */
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
            (w) => ![2, 4, 5, 6].includes(schedule[w][day + 1]),
          );

        if (day + 4 < numDays)
          candidates = candidates.filter(
            (w) => schedule[w][day + 2] !== 2 && schedule[w][day + 4] !== 2,
          );

        candidates = candidates.filter(
          (w) => worker[w].workCount < targetWork - 1 && schedule[w][day] === 0,
        );

        candidates = candidates.sort((a, b) =>
          aloneCount[a] <= aloneCount[b] ? -1 : 1,
        );
        candidates = candidates.filter(
          (v) => aloneCount[v] == aloneCount[candidates[0]],
        );
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

          if (workCount[day] == 1) {
            groupCount[(32 + group - day - 1) % 4]++;
            aloneCount[selected]++;
          }
          if (workCount[day] == 2) {
            groupCount[(32 + group - day - 1) % 4]--;
            const target = worker.findIndex(
              (_, idx) => idx !== selected && schedule[idx][day] === 2,
            );
            if (target > -1) aloneCount[target]--;
          }
        }
      } else {
        candidates = candidates.filter((w) => !worker[w].isNight);
        /* 주간 로직 */
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

        candidates = candidates.sort((a, b) =>
          aloneCount[a] <= aloneCount[b] ? -1 : 1,
        );
        candidates = candidates.filter(
          (v) => aloneCount[v] == aloneCount[candidates[0]],
        );
        candidates = candidates.sort(() => Math.random() - 0.5);

        if (candidates.length > 0) {
          const selected = candidates[0];
          schedule[selected][day] = 1;
          worker[selected].workCount++;
          workCount[day]++;
          if (workCount[day] == 1) {
            groupCount[(32 + group - day) % 4]++;
            aloneCount[selected]++;
          }
          if (workCount[day] == 2) {
            groupCount[(32 + group - day) % 4]--;
            const target = worker.findIndex(
              (_, idx) => idx !== selected && schedule[idx][day] == 1,
            );
            if (target > -1) aloneCount[target]--;
          }
        }
      }
    },
    changeSchedule: (emp, day, workType, night) => {
      const {
        numDays,
        worker,
        schedule,
        dayGroup,
        nightGroup,
        group,
        dayWorkCount,
        nightWorkCount,
        aloneCount,
      } = get();

      const sch = schedule.map((v) => [...v]);
      const wk = worker.map((v) => ({ ...v }));
      const dGroup = [...dayGroup];
      const nGroup = [...nightGroup];
      const dWorkCount = [...dayWorkCount];
      const nWorkCount = [...nightWorkCount];
      const aCount = [...aloneCount];

      const dGroupIdx = (32 + group - day) % 4;
      const nGroupIdx = (32 + group - day + 1) % 4;

      /* 변경 사항이 없을 경우*/
      if (sch[emp][day] == workType) return false;

      /* 휴무로 변경하는 경우 */
      if (workType === 0) {
        if (sch[emp][day] == 1) {
          wk[emp].workCount--;
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) {
            dGroup[dGroupIdx]--;
            aCount[emp]--;
          }
          if (dWorkCount[day] === 1) {
            dGroup[dGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 1,
            );
            if (target > -1) aCount[target]++;
          }
        }
        if (sch[emp][day] == 2) {
          wk[emp].workCount--;
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) {
            nGroup[nGroupIdx]--;
            aCount[emp]--;
          }
          if (nWorkCount[day] === 1) {
            nGroup[nGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 2,
            );
            if (target > -1) aCount[target]++;
          }

          if (day < numDays - 1) {
            sch[emp][day + 1] = 0;
            wk[emp].workCount--;
          }
        }
        if (sch[emp][day] == 3) {
          if (day !== 0) return false;
          wk[emp].workCount--;
        }
        if (sch[emp][day] == 4) wk[emp].workCount--;

        sch[emp][day] = 0;
      }
      /* 주간으로 변경하는 경우 */
      if (workType === 1) {
        if (sch[emp][day] == 2) {
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) {
            nGroup[nGroupIdx]--;
            aCount[emp]--;
          }
          if (nWorkCount[day] === 1) {
            nGroup[nGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 2,
            );
            if (target > -1) aCount[target]++;
          }
          if (day < numDays - 1) {
            sch[emp][day + 1] = 0;
            wk[emp].workCount--;
          }
        }
        if (sch[emp][day] == 3) if (day !== 0) return false;
        if (sch[emp][day] == 0 || sch[emp][day] == 5) wk[emp].workCount++;
        sch[emp][day] = 1;
        dWorkCount[day]++;
        if (dWorkCount[day] === 1) {
          dGroup[dGroupIdx]++;
          aCount[emp]++;
        }
        if (dWorkCount[day] === 2) {
          dGroup[dGroupIdx]--;
          const target = worker.findIndex(
            (_, idx) => idx != emp && sch[idx][day] == 1,
          );
          if (target > -1) aCount[target]--;
        }
      }
      /* 야간으로 변경하는 경우 */
      if (workType === 2) {
        if (day < numDays - 1 && sch[emp][day + 1] != 0) return false;
        if (sch[emp][day] == 0 || sch[emp][day] == 5) wk[emp].workCount++;

        if (sch[emp][day] == 1) {
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) {
            dGroup[dGroupIdx]--;
            aCount[emp]--;
          }
          if (dWorkCount[day] === 1) {
            dGroup[dGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 1,
            );
            if (target > -1) aCount[target]++;
          }
        }
        if (sch[emp][day] == 3) if (day !== 0) return false;

        if (day < numDays - 1) {
          sch[emp][day + 1] = 3;
          wk[emp].workCount++;
        }
        sch[emp][day] = 2;
        nWorkCount[day]++;
        if (nWorkCount[day] === 1) {
          nGroup[nGroupIdx]++;
          aCount[emp]++;
        }
        if (nWorkCount[day] === 2) {
          nGroup[nGroupIdx]--;
          const target = worker.findIndex(
            (_, idx) => idx != emp && sch[idx][day] == 2,
          );
          if (target > -1) aCount[target]--;
        }
      }
      /* 비번으로 변경하는 경우 */
      if (workType === 3) {
        if (day != 0) return false;
        if (sch[emp][day] === 0 || sch[emp][day] === 5) wk[emp].workCount++;

        if (sch[emp][day] === 1) {
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) {
            dGroup[dGroupIdx]--;
            aCount[emp]--;
          }
          if (dWorkCount[day] === 1) {
            dGroup[dGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 1,
            );
            if (target > -1) aCount[target]++;
          }
        }
        if (sch[emp][day] == 2) {
          sch[emp][day + 1] = 0;
          wk[emp].workCount--;
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) {
            nGroup[nGroupIdx]--;
            aCount[emp]--;
          }
          if (nWorkCount[day] === 1) {
            nGroup[nGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 2,
            );
            if (target > -1) aCount[target]++;
          }
        }
        sch[emp][day] = 3;
      }
      /* 연차로 변경 */
      if (workType === 4) {
        if (sch[emp][day] == 0 || sch[emp][day] == 5) wk[emp].workCount++;
        if (sch[emp][day] === 1) {
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) {
            dGroup[dGroupIdx]--;
            aCount[emp]--;
          }
          if (dWorkCount[day] === 1) {
            dGroup[dGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 1,
            );
            if (target > -1) aCount[target]++;
          }
        }
        if (sch[emp][day] == 2) {
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) {
            nGroup[nGroupIdx]--;
            aCount[emp]--;
          }
          if (nWorkCount[day] === 1) {
            nGroup[nGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 2,
            );
            if (target > -1) aCount[target]++;
          }
          if (day < numDays - 1) {
            sch[emp][day + 1] = 0;
            wk[emp].workCount--;
          }
        }
        if (sch[emp][day] == 3) if (day !== 0) return false;
        sch[emp][day] = 4;
      }
      /* 지정 휴일로 변경 */
      if (workType === 5) {
        if (sch[emp][day] == 1) {
          wk[emp].workCount--;
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) {
            dGroup[dGroupIdx]--;
            aCount[emp]--;
          }
          if (dWorkCount[day] === 1) {
            dGroup[dGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 1,
            );
            if (target > -1) aCount[target]++;
          }
        }
        if (sch[emp][day] == 2) {
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) {
            nGroup[nGroupIdx]--;
            aCount[emp]--;
          }
          if (nWorkCount[day] === 1) {
            nGroup[nGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 2,
            );
            if (target > -1) aCount[target]++;
          }
          wk[emp].workCount--;
          if (day < numDays - 1) {
            sch[emp][day + 1] = 0;
            wk[emp].workCount--;
          }
        }
        if (sch[emp][day] == 3) if (day !== 0) return false;
        if (sch[emp][day] == 4) wk[emp].workCount--;
        sch[emp][day] = 5;
      }
      /* 특별 휴가로 변경 */
      if (workType === 6) {
        if (sch[emp][day] == 0 || sch[emp][day] == 5) wk[emp].workCount++;
        if (sch[emp][day] === 1) {
          dWorkCount[day]--;
          if (dWorkCount[day] === 0) {
            dGroup[dGroupIdx]--;
            aCount[emp]--;
          }
          if (dWorkCount[day] === 1) {
            dGroup[dGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 1,
            );
            if (target > -1) aCount[target]++;
          }
        }
        if (sch[emp][day] == 2) {
          nWorkCount[day]--;
          if (nWorkCount[day] === 0) {
            nGroup[nGroupIdx]--;
            aCount[emp]--;
          }
          if (nWorkCount[day] === 1) {
            nGroup[nGroupIdx]++;
            const target = worker.findIndex(
              (_, idx) => idx != emp && sch[idx][day] == 2,
            );
            if (target > -1) aCount[target]++;
          }
          if (day < numDays - 1) {
            sch[emp][day + 1] = 0;
            wk[emp].workCount--;
          }
        }
        if (sch[emp][day] == 3) if (day !== 0) return false;
        sch[emp][day] = 6;
      }

      set(
        night
          ? {
              schedule: sch,
              worker: wk,
              dayGroup: dGroup,
              nightGroup: nGroup,
              dayWorkCount: dWorkCount,
              nightWorkCount: nWorkCount,
              aloneCount: aCount,
            }
          : {
              schedule: sch,
              worker: wk,
              dayGroup: dGroup,
              nightGroup: nGroup,
              dayWorkCount: dWorkCount,
              nightWorkCount: nWorkCount,
              aloneCount: aCount,
            },
      );
      return true;
    },
    changeGroup(g): void {
      const { group, dayGroup, nightGroup } = get();

      const gap = Math.abs(group - g);

      const dGroup = [...dayGroup.slice(gap), ...dayGroup.slice(0, gap)];
      const nGroup = [...nightGroup.slice(gap), ...nightGroup.slice(0, gap)];

      set({ group: g, dayGroup: dGroup, nightGroup: nGroup });
    },
    resetWorkCount(night?: boolean): void {
      const { worker, numDays } = get();

      const wk = worker.map((v) => ({ ...v }));

      for (const emp of wk) if (emp.isNight == night) emp.workCount = 0;

      if (night)
        set({
          worker: wk,
          nightWorkCount: Array(numDays).fill(0),
          nightGroup: [0, 0, 0, 0],
          aloneCount: Array(wk.length).fill(0),
        });
      else
        set({
          worker: wk,
          dayWorkCount: Array(numDays).fill(0),
          dayGroup: [0, 0, 0, 0],
          aloneCount: Array(wk.length).fill(0),
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
    setWorker: (emp) => {
      const { worker } = get();
      let employees = [...worker, emp];

      set({ worker: employees });
    },
    removeWorker: (idx) => {
      const { worker, schedule } = get();

      let wk = worker.map((v) => ({ ...v }));
      let sch = schedule.map((v) => [...v]);

      wk = wk.filter((_, target) => target != idx);
      sch = sch.filter((_, target) => target != idx);

      set({ worker: wk, schedule: sch });
    },
    setInit: () => set({ isInit: true }),
    setSelected: (selectedDay, night) =>
      set(
        night ? { selectedNight: selectedDay } : { selectedDay: selectedDay },
      ),
    setWorkerList: (emp) => set({ worker: emp }),
    scheduleToExcel: async () => {
      const {
        schedule,
        nightWorkCount,
        worker,
        nightGroup,
        numDays,
        group,
        selectedNight,
        selectedDay,
        aloneCount,
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
        worker.length,
        date,
      ];

      const workerDataRows = worker.map((emp, idx) => [
        idx + 1,
        emp.name,
        emp.workCount,
        emp.isNight,
        emp.isNew,
      ]);

      const scheduleDataRows = schedule.map((work) =>
        work.map((workType) => workType),
      );
      const dayWorkCountDataRows = dayWorkCount.map((count) => count);
      const nightWorkCountDataRows = nightWorkCount.map((count) => count);
      const aloneCountDataRows = aloneCount.map((count) => count);
      const dayGroupCountDataRows = dayGroup.map((count) => count);
      const nightGroupCountDataRows = nightGroup.map((count) => count);

      const selectedDayDataRows = [...selectedDay];
      const selectedNightDataRows = [...selectedNight];

      const filePath = `${import.meta.env.VITE_PUBLIC_URL}/frame.xlsx`;

      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const defaultSheet = workbook.getWorksheet("default");
      defaultSheet?.addRows([scheduleData]);

      const workerSheet = workbook.getWorksheet("worker");
      workerSheet?.addRows([...workerDataRows]);

      const scheduleDataSheet = workbook.getWorksheet("schedule");
      scheduleDataSheet?.addRows([...scheduleDataRows]);

      const dayWorkCountSheet = workbook.getWorksheet("dayWorkCount");
      dayWorkCountSheet?.addRows([dayWorkCountDataRows]);

      const nightWorkCountSheet = workbook.getWorksheet("nightWorkCount");
      nightWorkCountSheet?.addRows([nightWorkCountDataRows]);

      const aloneCountSheet = workbook.getWorksheet("aloneCount");
      aloneCountSheet?.addRows([aloneCountDataRows]);

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

      const scheduleSheet = workbook.getWorksheet("시간표");
      if (!scheduleSheet) return;
      scheduleSheet.getCell(1, 1).value =
        dayjs(date).format("MM월 사회복무요원 근무계획");
      for (let i = 0; i < numDays; i++) {
        scheduleSheet.getCell(4, 3 + i).value = i + 1;
        scheduleSheet.getCell(5, 3 + i).value = WEEKDAY[(i + weekday) % 7];
        for (let j = 0; j < GROUP.length; j++) {
          scheduleSheet.getCell(22 + j, 3 + i).value =
            GROUP_WORK_TYPE[(group + j + i) % 4];
        }
        scheduleSheet.getCell(26, 3 + i).value = dayWorkCount[i];
        scheduleSheet.getCell(27, 3 + i).value = nightWorkCount[i];
      }

      for (let i = 0; i < worker.length; i++) {
        const workSheet = workbook.getWorksheet("worker" + i);
        if (!workSheet || !scheduleSheet) return;
        workSheet.name = worker[i].name;
        workSheet.state = "visible";
        workSheet.getCell(2, 1).value = dayjs(date).format("YYYY년 MM월");
        workSheet.getCell(3, 19).value = dayjs(date).format(worker[i].name);

        scheduleSheet.getCell(6 + i, 39).value = aloneCount[i];
        scheduleSheet.getCell(6 + i, 1).value = i + 1;
        const cell = scheduleSheet.getCell(6 + i, 2);
        const color = worker[i].isNight ? "FFD9EAD3" : "FFFFD966";
        cell.value = worker[i].name;
        cell.style = {
          ...cell.style,
          fill: {
            type: "pattern",
            pattern: "solid",
            bgColor: { argb: color },
            fgColor: { argb: color },
          },
        };
        scheduleSheet.getCell(6 + i, 35).value = numDays - worker[i].workCount;
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

      const numWorker = defaultRow.getCell(6).value as number;
      const numDays = defaultRow.getCell(2).value as number;
      const date = defaultRow.getCell(7).value as string;

      const workerSheet = workbook.getWorksheet("worker");
      if (!workerSheet) return;
      const empList: Employee[] = [];
      for (let idx = 0; idx < numWorker; idx++) {
        const workerRow = workerSheet.getRow(idx + 1);
        const employee: Employee = {
          name: workerRow.getCell(2).value as string,
          workCount: workerRow.getCell(3).value as number,
          isNight: workerRow.getCell(4).value as boolean,
          isNew: workerRow.getCell(5).value as boolean,
        };
        empList.push(employee);
      }

      let schedule: number[][] = [];

      const scheduleSheet = workbook.getWorksheet("schedule");
      if (!scheduleSheet) return;
      for (let i = 0; i < numWorker; i++) {
        const scheduleRow = scheduleSheet.getRow(i + 1);
        if (!scheduleRow) return;
        let workerSchedule = [];
        for (let j = 0; j < numDays; j++) {
          workerSchedule.push(scheduleRow.getCell(j + 1).value as number);
        }
        schedule.push(workerSchedule);
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

      const aloneCount = [];
      const aloneCountSheet = workbook.getWorksheet("aloneCount");
      if (!aloneCountSheet) return;
      const aloneCountRow = aloneCountSheet.getRow(1);
      for (let i = 0; i < numWorker; i++)
        aloneCount.push(aloneCountRow.getCell(i + 1).value as number);

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
      let count = 0;
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
      count = 0;
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
        schedule: schedule,
        worker: empList,
        aloneCount: aloneCount,
        selectedDay: selectedDay,
        selectedNight: selectedNight,
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
