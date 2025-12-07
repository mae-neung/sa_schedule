import { useRoutes } from "react-router-dom";
import IndexRoute from "./IndexRoute.tsx";

const RootRoute = () => {
  return useRoutes([IndexRoute]);
};

export default RootRoute;
