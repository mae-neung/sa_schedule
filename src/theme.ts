import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: "-apple-system, 'Pretendard', 'Inter', sans-serif" },
        heading: { value: "-apple-system, 'Pretendard', 'Inter', sans-serif" },
      },
      radii: {
        sm: { value: "4px" },
        md: { value: "6px" },
        lg: { value: "8px" },
        xl: { value: "12px" },
      },
    },
    semanticTokens: {
      colors: {
        // 배경
        "bg": { value: { base: "#FFFFFF", _dark: "#141414" } },
        "bg.surface": { value: { base: "#FAFAFA", _dark: "#1E1E1E" } },
        "bg.subtle": { value: { base: "#F5F5F5", _dark: "#272727" } },
        "bg.hover": { value: { base: "#EFEFEF", _dark: "#313131" } },

        // 근무자 카드
        "bg.warning": { value: { base: "#FFFBF0", _dark: "#1F1500" } },
        "bg.info": { value: { base: "#F0F5FF", _dark: "#000F2E" } },

        // 텍스트
        "fg": { value: { base: "#1A1A1A", _dark: "#EDEDED" } },
        "fg.subtle": { value: { base: "#888888", _dark: "#666666" } },
        "fg.muted": { value: { base: "#BBBBBB", _dark: "#444444" } },

        // 보더
        "border": { value: { base: "#E8E8E8", _dark: "#333333" } },
        "border.strong": { value: { base: "#C8C8C8", _dark: "#505050" } },

        // 주요 액션
        "brand": { value: { base: "#2383E2", _dark: "#4A9FE7" } },
        "brand.hover": { value: { base: "#1A6FCC", _dark: "#3A8FD7" } },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);