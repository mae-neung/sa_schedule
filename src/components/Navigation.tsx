import { Flex } from "@chakra-ui/react";

interface NavigationProps {
  onChangeTheme: () => void;
}

const Navigation = ({ onChangeTheme }: NavigationProps) => {
  return (
    <Flex align={"space-between"} m={4} p={4} onClick={() => onChangeTheme()}>
      {/*<Text fontSize={"5xl"} fontWeight={"bold"}>*/}
      {/*  PORTFOLIO*/}
      {/*</Text>*/}
    </Flex>
  );
};

export default Navigation;
