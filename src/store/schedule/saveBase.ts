import useScheduleStore from "./index.ts";
import toJson from "./toJson.ts";

const saveBase = () => useScheduleStore.setState(() => ({ base: toJson() }));

export default saveBase;
