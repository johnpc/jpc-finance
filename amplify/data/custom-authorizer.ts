import type { AppSyncAuthorizerHandler } from "aws-lambda"; // types imported from @types/aws-lambda

type ResolverContext = {
  userid: string;
  info: string;
  more_info: string;
};

export const handler: AppSyncAuthorizerHandler<ResolverContext> = async (
  event,
) => {
  const { authorizationToken } = event;
  return {
    isAuthorized: authorizationToken === process.env.ADMIN_API_KEY,
  };
};
