import useScheduleStore from "./index.ts";

const changeGroup = (g: number) =>
  useScheduleStore.setState((state) => {
    const { group, dayGroup, nightGroup } = state;

    const gap = Math.abs(group - g);

    const dGroup = [...dayGroup.slice(gap), ...dayGroup.slice(0, gap)];
    const nGroup = [...nightGroup.slice(gap), ...nightGroup.slice(0, gap)];

    return { group: g, dayGroup: dGroup, nightGroup: nGroup };
  });

export default changeGroup;
