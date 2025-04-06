import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
type SpinnerProps = React.ComponentProps<typeof Loader2> & {
  className?: string;
};
export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn("stroke-primary size-3 md:size-10 animate-spin", className)}
      {...props}
    />
  );
}
