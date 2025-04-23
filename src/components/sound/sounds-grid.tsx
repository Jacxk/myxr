import { AudioProvider } from "~/context/AudioContext";
import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const gridVariants = cva("grid gap-2 w-full", {
  variants: {
    defaultCols: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
      9: "grid-cols-9",
    },
    sm: {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
      5: "sm:grid-cols-5",
      6: "sm:grid-cols-6",
      7: "sm:grid-cols-7",
      8: "sm:grid-cols-8",
      9: "sm:grid-cols-9",
    },
    md: {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
      6: "md:grid-cols-6",
      7: "md:grid-cols-7",
      8: "md:grid-cols-8",
      9: "md:grid-cols-9",
    },
    lg: {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
      7: "lg:grid-cols-7",
      8: "lg:grid-cols-8",
      9: "lg:grid-cols-9",
    },
    xl: {
      1: "xl:grid-cols-1",
      2: "xl:grid-cols-2",
      3: "xl:grid-cols-3",
      4: "xl:grid-cols-4",
      5: "xl:grid-cols-5",
      6: "xl:grid-cols-6",
      7: "xl:grid-cols-7",
      8: "xl:grid-cols-8",
      9: "xl:grid-cols-9",
    },
  },
  defaultVariants: {
    defaultCols: 3,
    sm: 5,
    md: 7,
    lg: 9,
    xl: 9,
  },
});

interface SoundGridProps extends VariantProps<typeof gridVariants> {
  children: React.ReactNode;
  className?: string;
}

export function SoundsGrid({
  children,
  className = "",
  defaultCols,
  sm,
  md,
  lg,
  xl,
}: Readonly<SoundGridProps>) {
  return (
    <div
      className={cn(gridVariants({ defaultCols, sm, md, lg, xl }), className)}
    >
      <AudioProvider>{children}</AudioProvider>
    </div>
  );
}
