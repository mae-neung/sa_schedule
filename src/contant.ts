const WORK_TYPES = ["휴", "주", "야", "비", "연", "휴", "특"];
const WORK_TYPES_LABEL = [
  "휴무",
  "주간",
  "야간",
  "비번",
  "연가",
  "지정 휴무",
  "특별 휴가",
];
const BG_TYPES = [
  "#FFE4E6", // 휴 - 연한 핑크
  "#FFFFFF", // 주 - 흰색
  "#DBEAFE", // 야 - 연한 파랑
  "#F3F4F6", // 비 - 연한 회색
  "#DCFCE7", // 연 - 연한 초록
  "#FEF3C7", // 지정 휴무 - 연한 노랑
  "#F3E8FF", // 특별 휴가 - 연한 보라
];
const COLOR_TYPES = [
  "#E11D48", // 휴 - 로즈
  "#374151", // 주 - 다크 그레이
  "#1D4ED8", // 야 - 다크 블루
  "#6B7280", // 비 - 그레이
  "#15803D", // 연 - 다크 그린
  "#D97706", // 지정 휴무 - 앰버
  "#7C3AED", // 특별 휴가 - 퍼플
];
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
const GROUP = ["A", "B", "C", "D"];
const GROUP_WORK_TYPE = ["주", "야", "비", "휴"];

export {
  WORK_TYPES,
  WORK_TYPES_LABEL,
  BG_TYPES,
  COLOR_TYPES,
  WEEKDAY,
  GROUP_WORK_TYPE,
  GROUP,
};
