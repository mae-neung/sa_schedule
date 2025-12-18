import { ChakraProvider, defaultSystem, Center, Theme } from "@chakra-ui/react";
import { ReactNode } from "react";

const Provider = ({ children }: { children: ReactNode | ReactNode[] }) => {
  // const [dark, setDark] = useState(false);

  return (
    <ChakraProvider value={defaultSystem}>
      <Theme appearance={"light"}>
        <Center flexDirection={"column"} h={"100vh"}>
          {/*<Navigation />*/}
          {children}
        </Center>
      </Theme>
    </ChakraProvider>
  );
};

export default Provider;
