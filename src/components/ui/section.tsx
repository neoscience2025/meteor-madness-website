import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Section({
  id,
  title,
  subtitle,
  description,
  children,
  className,
  backgroundImage = null,
}) {
  const sectionId = title ? title.toLowerCase().replace(/\s+/g, "-") : id;
  return (
    <section id={id || sectionId} className="relative flex justify-center w-full">
      {
        backgroundImage && (
          <div className="absolute inset-0 border-b border-primary">
            <Image
              fill
              src={backgroundImage.src}
              alt={backgroundImage.alt}
              className="object-cover grayscale"
              priority
            />
            <div className="absolute inset-0 bg-base-100 opacity-80 glass" />
          </div>
        )
      }
      <div className={cn(className, "relative z-10")}>
        <div className="container mx-auto max-w-7xl px-4 pb-12">
          <div className="mx-auto space-y-4 pb-6 text-center">
            {title && (
              <h2 className="text-sm font-medium uppercase tracking-wider text-primary">
                {title}
              </h2>
            )}
            {subtitle && (
              <h3 className="mx-auto mt-4 max-w-xs text-3xl font-semibold sm:max-w-none sm:text-4xl md:text-5xl">
                {subtitle}
              </h3>
            )}
            {description && (
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-secondary">
                {description}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
