export const handler = async () => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "success!",
    }),
  };

  return response;
};
