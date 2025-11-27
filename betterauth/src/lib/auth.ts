import { config } from "dotenv";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../database/drizzle";
import * as schema from "../database/schema";

config({ path: ".env.local" });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins :[
    process.env.BETTER_AUTH_URL as string
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // เปลี่ยนเป็น true ถ้าต้องการให้ verify email
  },
  user: {
    additionalFields: { roleId: { type: "string", input: false } },
  },
  socialProviders:{
    github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    },
    google:{
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;