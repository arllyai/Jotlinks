import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { SignupForm } from "@/components/auth/signup-form";
import { authOptions } from "@/lib/auth-options";

export default async function SignupPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <SignupForm />
    </div>
  );
}
