import { Flex, Image, Link, Text, View, useTheme } from "@aws-amplify/ui-react";
import { APP_STORE_URL } from "../lib/constants";

export const Footer = () => {
  const { tokens } = useTheme();
  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      padding={tokens.space.medium}
      marginTop={tokens.space.large}
    >
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={tokens.space.small}
        wrap="wrap"
      >
        <Link
          href="https://github.com/johnpc/jpc-finance"
          aria-label="Source on GitHub"
        >
          <Image alt="" src="/github.png" height="24px" />
        </Link>
        <Text as="span" fontSize="small">
          finance.jpc.io is open source.
        </Text>
        <Link href={APP_STORE_URL} fontSize="small">
          Get the iOS app
        </Link>
      </Flex>
    </View>
  );
};
