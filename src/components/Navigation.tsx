import { Flex } from "@chakra-ui/react";

interface NavigationProps {
  onChangeTheme?: () => void;
}

const Navigation = ({}: NavigationProps) => {
  return <Flex align={"space-between"} m={4} p={4}></Flex>;
};

export default Navigation;
