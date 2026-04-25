import { ChakraProvider, Center } from "@chakra-ui/react";
import { ReactNode } from "react";
import { system } from "../theme.ts";

const Provider = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <ChakraProvider value={system}>
      <Center flexDirection={"column"} minH={"100vh"} bg={"bg"} color={"fg"}>
        {children}
      </Center>
    </ChakraProvider>
  );
};

export default Provider;