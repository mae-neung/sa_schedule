import useScheduleStore from "./index.ts";
import { RcFile } from "antd/es/upload";
import ExcelJS from "exceljs";
import Employee from "../../interface/employee.ts";

const excelToSchedule = async (file: RcFile) => {
  const arrayBuffer = await file.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  return useScheduleStore.setState(() => {
    const defaultSheet = workbook.getWorksheet("default");
    if (!defaultSheet) return {};
    const defaultRow = defaultSheet.getRow(1);

    const numWorker = defaultRow.getCell(6).value as number;
    const numDays = defaultRow.getCell(2).value as number;
    const date = defaultRow.getCell(7).value as string;

    const workerSheet = workbook.getWorksheet("worker");
    if (!workerSheet) return {};
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
    if (!scheduleSheet) return {};
    for (let i = 0; i < numWorker; i++) {
      const scheduleRow = scheduleSheet.getRow(i + 1);
      if (!scheduleRow) return {};
      let workerSchedule = [];
      for (let j = 0; j < numDays; j++) {
        workerSchedule.push(scheduleRow.getCell(j + 1).value as number);
      }
      schedule.push(workerSchedule);
    }

    const dayWorkCount = [];
    const dayWorkCountSheet = workbook.getWorksheet("dayWorkCount");
    if (!dayWorkCountSheet) return {};
    const dayWorkCountRow = dayWorkCountSheet.getRow(1);
    for (let i = 0; i < numDays; i++)
      dayWorkCount.push(dayWorkCountRow.getCell(i + 1).value as number);

    const nightWorkCount = [];
    const nightWorkCountSheet = workbook.getWorksheet("nightWorkCount");
    if (!nightWorkCountSheet) return {};
    const nightWorkCountRow = nightWorkCountSheet.getRow(1);
    for (let i = 0; i < numDays; i++)
      nightWorkCount.push(nightWorkCountRow.getCell(i + 1).value as number);

    const aloneCount = [];
    const aloneCountSheet = workbook.getWorksheet("aloneCount");
    if (!aloneCountSheet) return {};
    const aloneCountRow = aloneCountSheet.getRow(1);
    for (let i = 0; i < numWorker; i++)
      aloneCount.push(aloneCountRow.getCell(i + 1).value as number);

    const dayGroupCount = [];
    const dayGroupCountSheet = workbook.getWorksheet("dayGroupCount");
    if (!dayGroupCountSheet) return {};
    const dayGroupCountRow = dayGroupCountSheet.getRow(1);
    for (let i = 0; i < 4; i++)
      dayGroupCount.push(dayGroupCountRow.getCell(i + 1).value as number);

    const nightGroupCount = [];
    const nightGroupCountSheet = workbook.getWorksheet("nightGroupCount");
    if (!nightGroupCountSheet) return {};
    const nightGroupCountRow = nightGroupCountSheet.getRow(1);
    for (let i = 0; i < 4; i++)
      nightGroupCount.push(nightGroupCountRow.getCell(i + 1).value as number);

    const selectedDay = [];
    const selectedDaySheet = workbook.getWorksheet("selectedDay");
    if (!selectedDaySheet) return {};
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
    if (!selectedNightSheet) return {};
    const selectedNightRow = selectedNightSheet.getRow(1);
    data = selectedNightRow.getCell(1).value;
    count = 0;
    while (data) {
      data = selectedNightRow.getCell(count + 1).value;
      selectedNight.push(data as number);
      count++;
    }

    const baseSheet = workbook.getWorksheet("base");
    if (!baseSheet) return {};
    const baseRow = baseSheet.getRow(1);
    const base = baseRow.getCell(1).value as string;

    return {
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
    };
  });
};

export default excelToSchedule;
