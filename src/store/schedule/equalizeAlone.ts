import useScheduleStore from "./index.ts";

const equalizeAlone = () =>
  useScheduleStore.setState((state) => {
    const { schedule, dayWorkCount, nightWorkCount, worker, aloneCount, numDays } = state;

    const sch = schedule.map((arr) => [...arr]);
    const wk = worker.map((v) => ({ ...v }));
    const aCount = [...aloneCount];

    const dayIdx = wk.map((_, i) => i).filter((i) => !wk[i].isNight);
    const nightIdx = wk.map((_, i) => i).filter((i) => wk[i].isNight);

    // ── 주간 균등화 ──
    let swapped = true;
    while (swapped) {
      swapped = false;
      const sorted = [...dayIdx].sort((a, b) => aCount[b] - aCount[a]);
      const hi = sorted[0];
      const lo = sorted[sorted.length - 1];
      if (aCount[hi] - aCount[lo] <= 1) break;

      for (let d = 0; d < numDays; d++) {
        if (dayWorkCount[d] !== 1 || sch[hi][d] !== 1) continue;
        if (sch[lo][d] !== 0) continue;
        if (wk[lo].isNew) continue; // 신입은 혼자 불가
        if (d > 0 && sch[lo][d - 1] === 3) continue; // 야비주 방지
        // 연속근무 5일 초과 방지
        let back = 0;
        for (let dd = d - 1; dd >= 0 && sch[lo][dd] === 1; dd--) back++;
        let fwd = 0;
        for (let dd = d + 1; dd < numDays && sch[lo][dd] === 1; dd++) fwd++;
        if (back + 1 + fwd > 5) continue;
        // 목표 휴일 초과 방지
        if (wk[lo].workCount >= numDays - wk[lo].targetWorkCount) continue;

        sch[hi][d] = 0;
        wk[hi].workCount--;
        aCount[hi]--;

        sch[lo][d] = 1;
        wk[lo].workCount++;
        aCount[lo]++;

        swapped = true;
        break;
      }
    }

    // ── 야간 균등화 ──
    swapped = true;
    while (swapped) {
      swapped = false;
      const sorted = [...nightIdx].sort((a, b) => aCount[b] - aCount[a]);
      const hi = sorted[0];
      const lo = sorted[sorted.length - 1];
      if (aCount[hi] - aCount[lo] <= 1) break;

      for (let d = 0; d < numDays; d++) {
        if (nightWorkCount[d] !== 1 || sch[hi][d] !== 2) continue;
        if (sch[lo][d] !== 0) continue;
        if (wk[lo].isNew) continue;
        // 다음날 이미 특수 상태면 불가
        if (d + 1 < numDays && [2, 4, 5, 6].includes(sch[lo][d + 1])) continue;
        // 야간 3연속 불가 (야비야비야 패턴)
        if (d > 2 && sch[lo][d - 3] === 3 && sch[lo][d - 2] === 2) continue;
        // 야비야비 간격 제한
        if (d + 4 < numDays && sch[lo][d + 2] === 2 && sch[lo][d + 4] === 2) continue;
        if (1 < d && d + 2 < numDays && sch[lo][d - 2] === 2 && sch[lo][d + 2] === 2) continue;
        // 목표 휴일 초과 방지
        if (wk[lo].workCount >= numDays - wk[lo].targetWorkCount - 1) continue;

        // hi 제거
        sch[hi][d] = 0;
        wk[hi].workCount--;
        aCount[hi]--;
        if (d + 1 < numDays && sch[hi][d + 1] === 3) {
          sch[hi][d + 1] = 0;
          wk[hi].workCount--;
        }

        // lo 배치
        sch[lo][d] = 2;
        wk[lo].workCount++;
        aCount[lo]++;
        if (d + 1 < numDays) {
          sch[lo][d + 1] = 3;
          wk[lo].workCount++;
        }

        swapped = true;
        break;
      }
    }

    return { schedule: sch, worker: wk, aloneCount: aCount };
  });

export default equalizeAlone;