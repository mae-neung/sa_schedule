import useScheduleStore from "./index.ts";

const resetBase = () => useScheduleStore.setState(() => ({ base: undefined }));

export default resetBase;
