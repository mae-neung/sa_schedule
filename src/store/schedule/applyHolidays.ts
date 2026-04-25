import dayjs from "dayjs";
import useScheduleStore from "./index.ts";

const applyHolidays = async () => {
  const { date, weekday, numDays, worker } = useScheduleStore.getState();

  const target = dayjs(date);
  const year = target.year();
  const month = target.month(); // 0-indexed

  // 주말 계산
  const selectedDay: number[] = [];
  const selectedNight: number[] = [];
  for (let i = 0; i < numDays; i++) {
    const wd = (weekday + i) % 7;
    if (wd === 6) selectedDay.push(i);    // 토 → 주간 2인
    if (wd === 5 || wd === 6) selectedNight.push(i);  // 금/토 전날 야간 2인
  }

  let holidayDays: number[] = [];
  try {
    const res = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/KR`,
    );
    if (res.ok) {
      const holidays: { date: string }[] = await res.json();
      holidayDays = holidays
        .filter((h) => {
          const d = dayjs(h.date);
          return d.year() === year && d.month() === month;
        })
        .map((h) => dayjs(h.date).date() - 1);
    }
  } catch {
    // 네트워크 오류 시 주말 설정만 유지
  }

  // 대체 공휴일: 공휴일이 일요일이면 다음 월요일 추가
  const substitutes = holidayDays
    .filter((d) => (weekday + d) % 7 === 0 && d + 1 < numDays)
    .map((d) => d + 1);
  holidayDays = [...new Set([...holidayDays, ...substitutes])];

  // 공휴일 당일 → 주간 2인
  const newSelectedDay = [...new Set([...selectedDay, ...holidayDays])];

  // 공휴일 전날 → 야간 2인 (당월 범위 내만)
  const holidayEves = holidayDays.map((d) => d - 1).filter((d) => d >= 0);
  const newSelectedNight = [...new Set([...selectedNight, ...holidayEves])];

  // 목표 휴일 수 = 주말(토/일) + 공휴일 (중복 제거, 일요일은 2인 설정 제외지만 휴일로 카운트)
  const sundays: number[] = [];
  for (let i = 0; i < numDays; i++) {
    if ((weekday + i) % 7 === 0) sundays.push(i);
  }
  const restDays = new Set([...selectedDay, ...sundays, ...holidayDays]);
  const targetWorkCount = restDays.size;

  useScheduleStore.setState({
    selectedDay: newSelectedDay,
    selectedNight: newSelectedNight,
    holidays: holidayDays,
    worker: worker.map((w) => ({ ...w, targetWorkCount })),
  });
};

export default applyHolidays;