// import { Theme } from "@emotion/react";
// import { defineConfig, defineBaseCofig, createSystem } from "@chakra-ui/react";
//
// const defaultTheme = {
//   test0: ["#343434", "#FFFFFF"],
//   test1: ["#454545", "#787878"],
//   test2: ["#686868", "#989898"],
// };
//
// const getTheme = (dark: number) =>
//   Object.entries(defaultTheme).reduce(
//     (acc, cur) => {
//       acc[cur[0]] = cur[1][dark];
//       return acc;
//     },
//     {} as Record<string, string>,
//   );
//
// const customConfig: { light: Theme; dark: Theme } = {
//   light: defineConfig({
//     theme: getTheme(0),
//     theme: {
//       theme: getTheme(0),
//       space: [0, 4, 8, 12, 16, 20, 24, 28],
//       fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
//     },
//   }),
//   dark: defineConfig({
//     colors: getTheme(1),
//     space: [0, 4, 8, 12, 16, 20, 24, 28],
//     // fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
//   }),
// };
//
// export default customConfig;
