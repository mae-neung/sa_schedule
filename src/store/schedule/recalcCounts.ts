import Employee from "../../interface/employee.ts";

const recalcCounts = (
  schedule: number[][],
  worker: Employee[],
  numDays: number,
  group: number,
  selectedDay: number[],
  selectedNight: number[],
) => {
  const wk = worker.map((v) => ({ ...v, workCount: 0 }));
  const dayWorkCount = Array(numDays).fill(0);
  const nightWorkCount = Array(numDays).fill(0);
  const dayGroup = [0, 0, 0, 0];
  const nightGroup = [0, 0, 0, 0];
  const aloneCount = Array(worker.length).fill(0);

  for (let emp = 0; emp < schedule.length; emp++) {
    for (let day = 0; day < numDays; day++) {
      const s = schedule[emp][day];
      if (s === 1 || s === 2 || s === 3 || s === 4 || s === 6 || s === 7) {
        wk[emp].workCount++;
      }
      if (s === 1 || s === 7) dayWorkCount[day]++;
      if (s === 2) nightWorkCount[day]++;
    }
  }

  for (let day = 0; day < numDays; day++) {
    const dGroupIdx = (32 + group - day) % 4;
    const nGroupIdx = (33 + group - day) % 4;

    if (dayWorkCount[day] === 1 && !selectedDay.includes(day)) {
      dayGroup[dGroupIdx]++;
      const emp = schedule.findIndex((sch) => sch[day] === 1 || sch[day] === 7);
      if (emp > -1) aloneCount[emp]++;
    }
    if (nightWorkCount[day] === 1 && !selectedNight.includes(day)) {
      nightGroup[nGroupIdx]++;
      const emp = schedule.findIndex((sch) => sch[day] === 2);
      if (emp > -1) aloneCount[emp]++;
    }
  }

  return { worker: wk, dayWorkCount, nightWorkCount, dayGroup, nightGroup, aloneCount };
};

export default recalcCounts;