import useScheduleStore from "./index.ts";

const changeGroup = (g: number) =>
  useScheduleStore.setState((state) => {
    const { group, dayGroup, nightGroup } = state;

    let gap = group - g;

    let dGroup;
    let nGroup;

    if (gap > 0) {
      dGroup = [...dayGroup.slice(gap), ...dayGroup.slice(0, gap)];
      nGroup = [...nightGroup.slice(gap), ...nightGroup.slice(0, gap)];
    } else {
      gap = 4 + gap;
      dGroup = [...dayGroup.slice(Math.abs(gap)), ...dayGroup.slice(0, gap)];
      nGroup = [...nightGroup.slice(gap), ...nightGroup.slice(0, gap)];
    }

    return { group: g, dayGroup: dGroup, nightGroup: nGroup };
  });

export default changeGroup;
