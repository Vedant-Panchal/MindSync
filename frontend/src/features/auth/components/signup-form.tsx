import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getUser,
  RegisterInput,
  registerInputSchema,
  Step1,
  Step2,
  useRegister,
} from "@/lib/auth";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { Check, MoveRight } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import API_PATHS from "@/config/api-paths";
import { useStepStore } from "@/stores/useStepStore";
import { useAuthStore } from "@/stores/authStore";
import MindSyncLogo from "@/assets/logo.svg?react";
export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { currentStep, setCurrentStep } = useStepStore();
  const navigate = useNavigate();

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const [margins, setMargins] = useState({
    marginLeft: 0,
    marginRight: 0,
  });
  const handleGoogleLogin = async () => {
    window.location.href = `http://localhost:8000${API_PATHS.AUTH.GOOGLE_LOGIN}`;
  };
  const stepRef = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    setMargins({
      marginLeft: (stepRef.current[1]?.offsetWidth ?? 0) / 2,
      marginRight: (stepRef.current[3]?.offsetWidth ?? 0) / 2,
    });
  }, [stepRef.current]);
  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data: Step1) => {
      await api.post(API_PATHS.AUTH.SIGN_UP, data);
    },
  });
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: async (data: Step2) => {
      await api.post(API_PATHS.AUTH.VERIFY_OTP, data);
    },
  });

  const {
    control,
    register,
    trigger,
    watch,
    getValues,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerInputSchema),
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      otp: "",
    },
  });

  const handleNext = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (currentStep === 1) {
      const isValid = await trigger([
        "firstname",
        "lastname",
        "email",
        "password",
      ]);
      if (!isValid) return;

      const email = getValues("email");

      sendOtp(
        { email },
        {
          onSuccess: () => {
            goToStep(2);
          },
          onError: (err: any) => {
            console.log(err);
            toast.error(err?.message || "Failed to send OTP");
          },
        },
      );
    } else if (currentStep === 2) {
      const isValid = await trigger(["otp"]);
      if (!isValid) return;

      const values = getValues([
        "email",
        "password",
        "firstname",
        "lastname",
        "otp",
      ]);
      const data = {
        email: values[0],
        password: values[1],
        username: values[2] + " " + values[3],
        otp: values[4],
      };
      console.log(data);
      verifyOtp(data, {
        onSuccess: async () => {
          goToStep(3);
          toast.success("Registered successfully!");
          localStorage.removeItem("current-step");
          try {
            const user = await getUser();
            useAuthStore.getState().setUser(user);
          } catch (error) {
            console.error("Failed to fetch user data:", error);
          }
        },
        onError: (err: any) => {
          console.log(err);
          toast.error(err?.message || "OTP verification failed");
        },
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };
  const calculateProgressWidth = () => {
    return ((currentStep - 1) / 2) * 100;
  };
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form
            className="p-6 md:px-8 md:py-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (currentStep === 1 || currentStep === 2)
              ) {
                e.preventDefault();
                handleNext();
              }
            }}
          >
            <div className="mb-2 flex w-full items-center justify-center space-x-3">
              <MindSyncLogo className="size-5 fill-slate-900" />
              <div className="text-xl font-bold text-slate-900">MindSync</div>
            </div>
            <div className="relative mt-3 flex flex-col gap-4">
              {/* Step Indicator */}
              <div>
                <div className="relative flex items-center justify-between">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      ref={(el) => (stepRef.current[step] = el)}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          step < currentStep
                            ? "border-blue-500 bg-blue-500 text-white"
                            : step === currentStep
                              ? "border-blue-500 bg-white text-blue-500"
                              : "border-gray-300 bg-white text-gray-300"
                        }`}
                      >
                        {step < currentStep ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span>{step}</span>
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          step < currentStep
                            ? "text-blue-500"
                            : step === currentStep
                              ? "text-blue-500"
                              : "text-gray-400"
                        }`}
                      >
                        {step === 1
                          ? "Details"
                          : step === 2
                            ? "Verify"
                            : "Complete"}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Connecting Lines */}
                <div
                  className="absolute top-5 right-0 left-0 h-0.5 -translate-y-1/2 bg-gray-200"
                  style={{
                    marginLeft: margins.marginLeft,
                    marginRight: margins.marginRight,
                    width: `calc(100% - ${
                      margins.marginLeft + margins.marginRight
                    }px)`,
                  }}
                >
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${calculateProgressWidth()}%` }}
                  />
                </div>
              </div>

              {/* Form Title */}
              <div className="mb-2 text-center">
                <h2 className="text-foreground text-left text-2xl font-bold">
                  {currentStep === 1
                    ? "Sign Up"
                    : currentStep === 2
                      ? "Verify OTP"
                      : ""}
                </h2>
                <p className="text-foreground/70 mt-1 text-left text-sm">
                  {currentStep === 1
                    ? "Enter your details below to create an account"
                    : currentStep === 2
                      ? "Enter the 6-digit code sent to your email"
                      : ""}
                </p>
              </div>
              {/* Step-1  */}
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstname" className="block text-sm">
                        Firstname
                      </Label>
                      <Input
                        type="text"
                        id="firstname"
                        placeholder="Naval"
                        autoComplete="on"
                        {...register("firstname")}
                      />
                      {errors.firstname && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.firstname.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname" className="block text-sm">
                        Lastname
                      </Label>
                      <Input
                        type="text"
                        id="lastname"
                        placeholder="Ravikant"
                        autoComplete="on"
                        {...register("lastname")}
                      />
                      {errors.lastname && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.lastname.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="on"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="on"
                      placeholder="••••••••"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    type="button"
                    disabled={isSendingOtp}
                    onClick={handleNext}
                  >
                    {isSendingOtp ? (
                      <Spinner className="stroke-accent md:size-5" />
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </>
              )}
              {/* Step-2 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Controller
                      name="otp"
                      control={control}
                      disabled={isVerifyingOtp}
                      render={({ field }) => (
                        <InputOTP
                          {...field}
                          maxLength={6}
                          className="w-full"
                          autoFocus
                          value={watch("otp")}
                        >
                          <InputOTPGroup className="h-10 w-full">
                            <InputOTPSlot className="h-full w-full" index={0} />
                            <InputOTPSlot className="h-full w-full" index={1} />
                            <InputOTPSlot className="h-full w-full" index={2} />
                            <InputOTPSlot className="h-full w-full" index={3} />
                            <InputOTPSlot className="h-full w-full" index={4} />
                            <InputOTPSlot className="h-full w-full" index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      )}
                    />
                    <p className="mt-2 text-center text-xs text-gray-500">
                      We've sent a 6-digit code to {watch("email")}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleBack}
                      disabled={isVerifyingOtp}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-blue-500"
                      onClick={handleNext}
                      disabled={isVerifyingOtp}
                    >
                      {isVerifyingOtp ? (
                        <>
                          <Spinner className="stroke-accent md:size-5" />{" "}
                          Verifying
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>

                  <div className="text-center text-sm">
                    Didn't receive the code?{" "}
                    <Button
                      className="bg-transparent p-0 text-blue-500 shadow-none hover:bg-transparent hover:underline"
                      type="button"
                      onClick={() =>
                        sendOtp(
                          { email: watch("email") },
                          {
                            onSuccess: () => {
                              toast.success("OTP resent successfully!");
                            },
                            onError: (err: any) => {
                              toast.error("Failed to resend OTP");
                            },
                          },
                        )
                      }
                    >
                      Resend
                    </Button>
                  </div>
                </div>
              )}
              {/* Step-3: Success */}
              {currentStep === 3 && (
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="success-animation">
                    <div className="success-checkmark">
                      <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Registration Successful!
                  </h3>
                  <p className="text-center text-gray-500">
                    Your account has been created successfully. You can now
                    login to your account.
                  </p>
                  <Button
                    className="group w-full bg-blue-500"
                    onClick={() => {
                      navigate({ to: "/app/dashboard" });
                    }}
                  >
                    Dashboard
                    <MoveRight className="ml-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              )}
              {currentStep === 1 && (
                <>
                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-background text-muted-foreground relative z-10 px-2">
                      Or continue with
                    </span>
                  </div>
                  <div className="flex">
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={handleGoogleLogin}
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="sr-only">Login with Google</span>
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link
                      to={"/signin"}
                      className="underline underline-offset-4"
                    >
                      Sign in
                    </Link>
                  </div>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
