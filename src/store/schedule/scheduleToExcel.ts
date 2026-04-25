import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { GROUP, GROUP_WORK_TYPE, WEEKDAY, WORK_TYPES } from "../../contant.ts";
import useScheduleStore from "./index.ts";

const scheduleToExcel = async () => {
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
    weekday,
    date,
  } = useScheduleStore.getState();

  const scheduleData = [
    dayjs(date).month() + 1,
    numDays,
    0,
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
    emp.targetWorkCount,
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
  baseSheet?.addRows([[localStorage.getItem("schedule-base") ?? ""]]);

  const scheduleSheet = workbook.getWorksheet("시간표");
  if (!scheduleSheet) return;
  scheduleSheet.getCell(1, 1).value =
    dayjs(date).format("MM월 사회복무요원 근무계획");
  for (let i = 0; i < numDays; i++) {
    scheduleSheet.getCell(4, 3 + i).value = i + 1;
    scheduleSheet.getCell(5, 3 + i).value = WEEKDAY[(i + weekday) % 7];
    for (let j = 0; j < GROUP.length; j++) {
      scheduleSheet.getCell(22 + j, 3 + i).value =
        GROUP_WORK_TYPE[(32 + j - group + i) % 4];
    }
    scheduleSheet.getCell(26, 3 + i).value = dayWorkCount[i];
    scheduleSheet.getCell(27, 3 + i).value = nightWorkCount[i];
  }

  const workerIdx = worker
    .map((_, idx) => idx)
    .sort((v) => (worker[v].isNight ? 1 : -1));

  for (let i = 0; i < worker.length; i++) {
    const workSheet = workbook.getWorksheet("worker" + i);
    if (!workSheet || !scheduleSheet) return;
    workSheet.name = worker[i].name;
    workSheet.state = "visible";
    workSheet.getCell(2, 1).value = dayjs(date).format("YYYY년 MM월");
    workSheet.getCell(3, 19).value = dayjs(date).format(worker[i].name);

    scheduleSheet.getCell(6 + i, 39).value = aloneCount[workerIdx[i]];
    scheduleSheet.getCell(6 + i, 1).value = i + 1;
    const cell = scheduleSheet.getCell(6 + i, 2);
    const color = worker[workerIdx[i]].isNight ? "FFD9EAD3" : "FFFFD966";
    cell.value = worker[workerIdx[i]].name;
    cell.style = {
      ...cell.style,
      fill: {
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: color },
        fgColor: { argb: color },
      },
    };
    scheduleSheet.getCell(6 + i, 35).value =
      numDays - worker[workerIdx[i]].workCount;
    scheduleSheet.getCell(6 + i, 36).value =
      worker[workerIdx[i]].targetWorkCount;
    for (let j = 0; j < numDays; j++) {
      workSheet.getCell(j < 16 ? 4 : 9, 2 + (j % 16)).value = j + 1;
      workSheet.getCell(j < 16 ? 5 : 10, 2 + (j % 16)).value =
        WEEKDAY[(weekday + j) % 7];
      workSheet.getCell(j < 16 ? 6 : 11, 2 + (j % 16)).value =
        WORK_TYPES[schedule[i][j]];

      scheduleSheet.getCell(6 + i, 3 + j).value =
        WORK_TYPES[schedule[workerIdx[i]][j]];
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
};

export default scheduleToExcel;
