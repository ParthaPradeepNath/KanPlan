import { cookies } from "next/headers";
import { Account, Client } from "node-appwrite";
import { AUTH_COOKIE } from "./constants";
import { createSessionClient } from "@/lib/appwrite";

export const getCurrent = async () => {
  try {
    // const client = new Client()
    //   .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    //   .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    // const session = (await cookies()).get(AUTH_COOKIE);

    // if (!session) return null;
    // client.setSession(session.value)

    // const account = new Account(client);

    // this above code is just extracted in this below line(so much line code saved)
    const { account } = await createSessionClient();

    return await account.get();
  } catch {
    return null;
  }
  // cant use re direct inside try-catch in NEXTJS
};
