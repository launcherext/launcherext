import { cn } from "@/lib/utils";

interface StageProps {
  children: React.ReactNode;
  className?: string;
}

export function Stage({ children, className }: StageProps) {
  return (
    <main className={cn("relative min-h-screen w-full flex flex-col items-center justify-start pt-24 md:pt-32 p-4 md:p-8 overflow-x-hidden", className)}>
      {/* Background Image - Dimmed */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('/web-bg.png')" }}
      />

      {/* Dark overlay to further darken */}
      <div className="fixed inset-0 z-[1] bg-black/60" />


      {/* Noise texture */}
      <div className="bg-noise" />

      <div className="relative z-10 w-full max-w-4xl">
        {children}
      </div>
    </main>
  );
}
