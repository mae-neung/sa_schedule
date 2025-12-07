import { RouteObject } from "react-router-dom";
import IndexPage from "../pages";
import Page404 from "../pages/Page404.tsx";

const IndexRoute: RouteObject = {
  path: "/",
  children: [
    {
      index: true,
      element: <IndexPage />,
    },
    {
      path: "*",
      element: <Page404 />,
    },
  ],
};

export default IndexRoute;
