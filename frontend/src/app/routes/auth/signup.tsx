import { SignUpForm } from "@/features/auth/components/signup-form";


export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
      <div className="w-sm max-w-sm md:max-w-3xl">
        <SignUpForm />
      </div>
    </div>
  )
}
