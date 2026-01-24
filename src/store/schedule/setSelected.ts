import useScheduleStore from "./index.ts";

const setSelected = (selectedDay: number[], night?: boolean) =>
  useScheduleStore.setState(() => {
    if (night) return { selectedNight: selectedDay };
    return {
      selectedDay: selectedDay,
    };
  });

export default setSelected;
