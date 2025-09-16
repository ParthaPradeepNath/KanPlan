import { getCurrent } from "@/features/auth/actions";
import { UserButton } from "@/features/auth/components/user-button";
import { redirect } from "next/navigation";

// async and use-client cant be used at the same time this will give you an error

export default async function Home() {
  const user = await getCurrent()

  if(!user) redirect("/sign-in")

  return (
    <div>
      <UserButton />
    </div>
  );
}
