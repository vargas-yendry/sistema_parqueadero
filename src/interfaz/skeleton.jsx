import { cn } from "@/interfaz/cn";

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded-md bg-accent motion-safe:animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
