import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  // Search bar, buttons, whatever sits on the right
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold leading-tight text-zinc-200 sm:text-5xl sm:leading-[56px]">
          {title}
        </h1>

        {subtitle && (<p className="text-base leading-6 text-neutral-300">{subtitle}</p>)}
      </div>

      {actions && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {actions}
        </div>
      )}
    </header>
  );
}