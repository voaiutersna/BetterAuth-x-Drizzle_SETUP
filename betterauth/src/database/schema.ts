import { pgTable,text,timestamp,boolean,uuid,varchar,index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
export * from "./auth-schema"

export const userRole = pgTable("user_role", {
  id: uuid("id").primaryKey().defaultRandom().notNull().unique(),
  role: varchar("role").notNull(),
});