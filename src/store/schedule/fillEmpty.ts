import useScheduleStore from "./index.ts";

const fillEmpty = () =>
  useScheduleStore.setState((state) => {
    const {
      schedule, dayWorkCount, nightWorkCount, worker, aloneCount,
      numDays, group, dayGroup, nightGroup, selectedDay, selectedNight,
    } = state;

    const sch = schedule.map((arr) => [...arr]);
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];
    const dWC = [...dayWorkCount];
    const nWC = [...nightWorkCount];
    const dGroup = [...dayGroup];
    const nGroup = [...nightGroup];

    const applyDay = (sel: number, d: number) => {
      sch[sel][d] = 1;
      wk[sel].workCount++;
      dWC[d]++;
      if (dWC[d] === 1) { dGroup[(32 + group - d) % 4]++; aCount[sel]++; }
      if (dWC[d] === 2) {
        dGroup[(32 + group - d) % 4]--;
        const target = sch.findIndex((w, i) => i !== sel && w[d] === 1);
        if (target > -1) aCount[target]--;
      }
    };

    const applyNight = (sel: number, d: number) => {
      sch[sel][d] = 2;
      wk[sel].workCount++;
      nWC[d]++;
      if (nWC[d] === 1) { nGroup[(33 + group - d) % 4]++; aCount[sel]++; }
      if (nWC[d] === 2) {
        nGroup[(33 + group - d) % 4]--;
        const target = sch.findIndex((w, i) => i !== sel && w[d] === 2);
        if (target > -1) aCount[target]--;
      }
      if (d + 1 < numDays) { sch[sel][d + 1] = 3; wk[sel].workCount++; }
    };

    // 야간 근무자 제약 체크 (targetWorkCount 제외)
    const nightCandidates = (d: number) =>
      wk.map((_, i) => i)
        .filter((i) => wk[i].isNight && sch[i][d] === 0)
        .filter((i) => d + 1 >= numDays || ![2, 4, 5, 6].includes(sch[i][d + 1]))
        .filter((i) => nWC[d] > 0 || !wk[i].isNew)
        .filter((i) => d <= 2 || sch[i][d - 3] !== 3 || sch[i][d - 2] !== 2)
        .filter((i) => d + 4 >= numDays || sch[i][d + 2] !== 2 || sch[i][d + 4] !== 2)
        .sort((a, b) => wk[a].workCount - wk[b].workCount);

    // 주간 근무자를 야간에 투입 (가용성만 체크)
    const dayCandidatesForNight = (d: number) =>
      wk.map((_, i) => i)
        .filter((i) => !wk[i].isNight && sch[i][d] === 0)
        .filter((i) => d + 1 >= numDays || sch[i][d + 1] === 0)
        .sort((a, b) => wk[a].workCount - wk[b].workCount);

    // 주간 빈 날 채우기
    for (let d = 0; d < numDays; d++) {
      const need = selectedDay.includes(d) ? 2 : 1;
      while (dWC[d] < need) {
        const candidates = wk.map((_, i) => i)
          .filter((i) => !wk[i].isNight && sch[i][d] === 0)
          .filter((i) => d === 0 || sch[i][d - 1] !== 3)
          .filter((i) => dWC[d] > 0 || !wk[i].isNew)
          .sort((a, b) => wk[a].workCount - wk[b].workCount);
        if (candidates.length === 0) break;
        applyDay(candidates[0], d);
      }
    }

    // 야간 빈 날 / 2인 미충족 날 채우기
    for (let d = 0; d < numDays; d++) {
      const need = selectedNight.includes(d) ? 2 : 1;
      while (nWC[d] < need) {
        // 1순위: 야간 근무자
        let candidates = nightCandidates(d);
        // 2순위: 야간 근무자 없으면 주간 근무자 투입
        if (candidates.length === 0) candidates = dayCandidatesForNight(d);
        if (candidates.length === 0) break;
        applyNight(candidates[0], d);
      }
    }

    return {
      schedule: sch, worker: wk, aloneCount: aCount,
      dayWorkCount: dWC, nightWorkCount: nWC,
      dayGroup: dGroup, nightGroup: nGroup,
    };
  });

export default fillEmpty;