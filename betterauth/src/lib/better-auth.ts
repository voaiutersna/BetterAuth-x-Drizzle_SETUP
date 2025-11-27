import { auth } from "../lib/auth";
import { headers } from "next/headers";


export const getServerSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};