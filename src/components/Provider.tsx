import { ChakraProvider, defaultSystem, Flex, Theme } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import Navigation from "./Navigation.tsx";

const Provider = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const [dark, setDark] = useState(false);

  return (
    <ChakraProvider value={defaultSystem}>
      <Theme appearance={dark ? "dark" : "light"}>
        <Flex flexDirection={"column"}>
          <Navigation onChangeTheme={() => setDark((p) => !p)} />
          {children}
        </Flex>
      </Theme>
    </ChakraProvider>
  );
};

export default Provider;
