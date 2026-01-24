import useScheduleStore from "./index.ts";

const changeSchedule = (
  emp: number,
  day: number,
  workType: number,
  night?: boolean,
) =>
  useScheduleStore.setState((state) => {
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
    } = state;

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
    if (sch[emp][day] == workType) return {};

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
        if (day !== 0) return {};
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
      if (sch[emp][day] == 3) if (day !== 0) return {};
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
      if (day < numDays - 1 && sch[emp][day + 1] != 0) return {};
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
      if (sch[emp][day] == 3) if (day !== 0) return {};

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
      if (day != 0) return {};
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
      if (sch[emp][day] == 3) if (day !== 0) return {};
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
      if (sch[emp][day] == 3) if (day !== 0) return {};
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
      if (sch[emp][day] == 3) if (day !== 0) return {};
      sch[emp][day] = 6;
    }

    if (night)
      return {
        schedule: sch,
        worker: wk,
        dayGroup: dGroup,
        nightGroup: nGroup,
        dayWorkCount: dWorkCount,
        nightWorkCount: nWorkCount,
        aloneCount: aCount,
      };

    return {
      schedule: sch,
      worker: wk,
      dayGroup: dGroup,
      nightGroup: nGroup,
      dayWorkCount: dWorkCount,
      nightWorkCount: nWorkCount,
      aloneCount: aCount,
    };
  });

export default changeSchedule;
