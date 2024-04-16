import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import config from "../../../amplifyconfiguration.json";
import { Schema } from "../../data/resource";
import dotenv from "dotenv";
dotenv.config();
Amplify.configure(config);
export const client = generateClient<Schema>({
  authMode: "lambda",
  authToken: process.env.ADMIN_API_KEY,
});
