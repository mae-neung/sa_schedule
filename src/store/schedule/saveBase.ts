import toJson from "./toJson.ts";

const saveBase = () => localStorage.setItem("schedule-base", toJson());

export default saveBase;
