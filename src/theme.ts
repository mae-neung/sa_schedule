// import { Theme } from "@emotion/react";
// import { defineConfig, defineBaseCofig, createSystem } from "@chakra-ui/react";
//
// const defaultTheme = {
//   primary: ["#343434", "#FFFFFF"],
//   text: ["#454545", "#787878"],
//   test2: ["#686868", "#989898"],
// };
//
// const getTheme = (dark: number) =>
//   Object.entries(defaultTheme).reduce(
//     (acc, cur) => {
//       acc[cur[0]] = { value: cur[1][dark] };
//       return acc;
//     },
//     {} as Record<string, { value: string }>,
//   );
//
// const customConfig: { light: Theme; dark: Theme } = {
//   light: defineConfig({
//     theme: {
//       tokens: {
//         colors: {
//           ...getTheme(1),
//         },
//       },
//     },
//   }),
//   dark: defineConfig({
//     theme: {
//       tokens: {
//         colors: {
//           ...getTheme(0),
//         },
//       },
//     },
//   }),
// };
//
// export default customConfig;
