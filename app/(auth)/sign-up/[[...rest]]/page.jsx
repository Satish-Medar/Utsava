import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      redirectUrl="/my-events"
      afterSignUpUrl="/my-events"
      path="/sign-up"
    />
  );
}
