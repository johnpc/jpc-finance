"use client";
import {
  Card,
  View,
  Heading,
  Text,
  useTheme,
  Grid,
  Image,
  Flex,
} from "@aws-amplify/ui-react";
export const Header = () => {
  const { tokens } = useTheme();
  return (
    <Card variation="elevated" marginBottom={tokens.space.small}>
    <Grid
      templateColumns="3fr 1fr"
      templateRows="4rem"
      gap={tokens.space.small}
    >
      <View>
        <Card>
          <Flex
            direction="row"
            justifyContent="flex-start"
            alignItems="stretch"
            alignContent="flex-start"
            wrap="nowrap"
            gap="1rem"
          >
            <View height="2rem">
              <Image
                objectFit={"initial"}
                src="/maskable.png"
                alt="icon"
                borderRadius={tokens.radii.large}
                height={"50px"}
              ></Image>
            </View>
            <View height="2rem">
              <Heading level={5}>
              finance.jpc.io
              </Heading>
              <Text
                as="span"
                fontSize={"small"}
              >
                Budget tracker
              </Text>
            </View>
          </Flex>
        </Card>
      </View>
    </Grid>
    </Card>
  );
};
