import { AuthUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { createAIHooks, AIConversation } from "@aws-amplify/ui-react-ai";
import type { Schema } from "../../amplify/data/resource";
import { Loader, ScrollView, Text, View } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
const client = generateClient<Schema>({ authMode: "userPool" });
const { useAIConversation } = createAIHooks(client);

function ChatComponent(props: {
  conversationId: string | null;
  user?: AuthUser;
  randomNumber: number;
}) {
  const [
    {
      data: { messages },
      hasError,
      isLoading,
    },
    sendMessage,
  ] = useAIConversation("chat", {
    id: props.conversationId ?? undefined,
    onResponse: (response) => {
      console.log({ method: "onResponse", response });
    },
  });
  console.log({ hasError });
  messages.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  return (
    <>
      <View
        paddingLeft={"large"}
        paddingRight={"large"}
        paddingBottom={messages.length ? "small" : "xxxl"}
        textAlign={"center"}
      >
        <Text fontSize={"xl"} fontWeight={"bold"}>
          🤖 MoneyBot 🤖
        </Text>
        <Text fontSize={"xs"}>
          AI chat about your spending and earning habits
        </Text>
        <Text fontSize={"xxs"}>(experimental)</Text>
      </View>
      <ScrollView
        width="100%"
        minHeight="300px"
        maxHeight={"50vh"}
        autoScroll="smooth"
      >
        <AIConversation
          messages={messages}
          handleSendMessage={(content) =>
            sendMessage({
              ...content,
              aiContext: { ignoreThisArgument: "true" },
              // toolConfiguration: {
              //   tools: {
              //     generateRecipe: {
              //       description: "List ingredients needed for a recipe",
              //       inputSchema: {
              //         json: {
              //           type: "object",
              //           properties: {
              //             ingredients: {
              //               type: "array",
              //               items: {
              //                 type: "object",
              //                 properties: {
              //                   ingredientName: {type: "string"},
              //                   quantity: {type: "number"},
              //                   unit: {type: "string"},
              //               } },
              //             },
              //           },
              //         },
              //       },
              //     },
              //   }
              // }
            })
          }
          variant="bubble"
          avatars={{
            user: {
              username:
                props.user?.signInDetails?.loginId?.split("@")[0] || "User",
              avatar: "🥷",
            },
            ai: {
              username: "MoneyBot",
              avatar: "🤖",
            },
          }}
        />
        {isLoading ? <Loader variation="linear" /> : <></>}
        <Text as="span" style={{ visibility: "hidden" }}>
          {props.randomNumber}
        </Text>
      </ScrollView>
    </>
  );
}

export default function ChatPage(props: {
  user: AuthUser | undefined;
  randomNumber: number;
}) {
  const [conversationId, setConversationId] = useState<string | undefined>();
  console.log({ rendering: conversationId });
  useEffect(() => {
    const fetchConversation = async () => {
      const { data, errors } = await client.conversations.chat.list();
      data.sort((a, b) => (a.id < b.id ? 1 : -1));
      const c = data.find((t) => t);
      if (!c) {
        const { data: newConversation, errors } =
          await client.conversations.chat.create();
        if (errors) {
          console.log({ method: "createConversation", errors });
        }
        setConversationId(newConversation!.id);
        return;
      }
      if (errors) {
        console.log({ method: "fetchConversation", errors });
      }
      console.log({ method: "fetchConversation", c });
      setConversationId(c?.id ?? null);
    };
    fetchConversation();
  }, []);

  if (conversationId === undefined) {
    return <Loader />;
  }

  return (
    <ChatComponent
      conversationId={conversationId}
      user={props.user}
      randomNumber={props.randomNumber}
    />
  );
}
