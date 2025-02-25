import { AuthLayout } from "@/components/layouts/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";


export default function LoginPage() {
  return (
    <AuthLayout title="Log in to your account">
        <LoginForm />
    </AuthLayout>
  )
}