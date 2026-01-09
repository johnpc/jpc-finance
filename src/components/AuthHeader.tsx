import { Heading, Image, View, useTheme } from "@aws-amplify/ui-react";

export function AuthHeader() {
  const { tokens } = useTheme();
  return (
    <View textAlign="center" backgroundColor={"#7FFFD4"} padding={"15px"}>
      <Image
        alt="logo"
        borderRadius={tokens.radii.xl}
        width={"100px"}
        src="/maskable.png"
      />
      <Heading fontSize={tokens.fontSizes.xl} color={tokens.colors.primary[90]}>
        jpc.finance
      </Heading>
    </View>
  );
}
