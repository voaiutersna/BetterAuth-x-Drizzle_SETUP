DRIZZLE set up

-------------------------------

drizzle-orm เป็น library หลักของ Drizzle สำหรับจัดการ ORM

------------------------------

QUICK SETUP

npx create-next-app@latest


mkdir src


npm install drizzle-orm drizzle-kit @neondatabase/serverless dotenv


npm install -D tsx


npm install better-auth zod



# ถ้ายังไม่ได้ใช้ react-hook-form + zod-resolver ก็เพิ่ม
npm install react-hook-form @hookform/resolvers

bunx @better-auth/cli@latest generate //สร้างschema standard ของbetter auth

------------------------------

Full Tutorial

------------------------------

ขั้นตอนเริ่มโปรเจ็กต์ใหม่ (สรุปให้แบบ 1–7 ขั้นตอน)


1) สร้าง Next.js โปรเจกต์
npx create-next-app@latest my-app --typescript --eslint
cd my-app



2) ติดตั้งของที่จำเป็น (ตัวจริงที่ต้องใช้)

✔ Dependencies
npm install drizzle-orm drizzle-kit @neondatabase/serverless dotenv

✔ Dev dependencies
npm install -D tsx



3) สร้างไฟล์ drizzle.config.ts

ไว้ที่ root project:

// drizzle.config.ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  out: "./migrations",
  schema: "./src/database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});


4) สร้าง Schema


ไฟล์:src/database/schema.ts

run:

bunx @better-auth/cli@latest generate //สร้างschema standard ของbetter auth


ตัวอย่าง:

import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});


5) สร้าง database client (Neon + Drizzle)

ไฟล์:src/database/drizzle.ts


โค้ด:

import { config as dotenvConfig } from "dotenv";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Load environment variables
dotenvConfig({ path: ".env.local" });

const isProd = process.env.NODE_ENV === "production";

neonConfig.pipelineConnect = false;

const databaseURL = process.env.DATABASE_URL;
if (!databaseURL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const sql = neon(databaseURL, {
  fullResults: true,
  arrayMode: false,
  fetchOptions: isProd ? undefined : { cache: "no-store" },
});

const db = drizzle({ client: sql });

export default db;

6) ตั้งค่า ENV

สร้าง .env.local

DATABASE_URL = xxxxxxxxxxxxxxxxxxxxxxx
NODE_ENV=development // developer or production
BETTER_AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxx
BETTER_AUTH_URL=http://localhost:3000/

GITHUB_CLIENT_ID = xxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET = xxxxxxxxxxxxxxxxxxxxxxx

7) รัน migration

เพิ่ม scripts ใน package.json:

{
  "scripts": {
    "db:generate": "bunx drizzle-kit generate",
    "db:migrate": "bunx drizzle-kit migrate",
    "db:studio": "bunx drizzle-kit studio"
  }
}
รัน:bun run db:generate/migrate


แล้วค่อยสร้าง:

setup better auth / zod

npm install better-auth zod


โฟลเดอร์/src/lib



ไฟล์ auth-client.ts
import { createAuthClient } from "better-auth/react";
import { nextCookies } from "better-auth/next-js";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), nextCookies()],
});



ไฟล์auth.ts
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



ไฟล์ better-auth.ts
import { auth } from "../lib/auth";
import { headers } from "next/headers";


export const getServerSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};


ไฟล์ config.ts
const config = {
  env: {
    databaseURL: process.env.DATABASE_URL || "",
    nodeENV: process.env.NODE_ENV || "",
  },
};

export default config;


#https://orm.drizzle.team/docs/get-started/postgresql-new
#https://chatgpt.com/g/g-p-68b95968721c819197566e09d16d464a-webdev101/c/6924f12a-0394-8321-893b-4a0f1394cd05