import { AudioProvider } from "~/context/AudioContext";
import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Utility function to generate grid column classes for breakpoints
const generateGridVariants = (prefix: string) => {
  const variants: Record<number, string> = {};
  for (let i = 1; i <= 9; i++) {
    variants[i] = `${prefix ? prefix + ":" : ""}grid-cols-${i}`;
  }
  return variants;
};

const gridVariants = cva("grid gap-2 w-full", {
  variants: {
    defaultCols: generateGridVariants(""),
    sm: generateGridVariants("sm"),
    md: generateGridVariants("md"),
    lg: generateGridVariants("lg"),
    xl: generateGridVariants("xl"),
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
