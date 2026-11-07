import {
  Flex,
  Heading,
  Image,
  Text,
  View,
  useTheme,
} from "@aws-amplify/ui-react";

export const Header = () => {
  const { tokens } = useTheme();
  return (
    <View
      as="header"
      padding={tokens.space.medium}
      marginBottom={tokens.space.medium}
      boxShadow="small"
    >
      <Flex maxWidth="760px" margin="0 auto" alignItems="center" gap="0.75rem">
        <Image
          src="/maskable.png"
          alt=""
          height="44px"
          borderRadius={tokens.radii.large}
        />
        <Flex direction="column" gap="0">
          <Heading level={5}>finance.jpc.io</Heading>
          <Text as="span" fontSize="small" color="font.tertiary">
            Budget tracker
          </Text>
        </Flex>
      </Flex>
    </View>
  );
};
