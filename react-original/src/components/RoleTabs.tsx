import { Icon } from "@/components/icons";
import type { AccessSpace } from "@/lib/auth";
import { cn } from "@/utils/cn";

interface RoleTabsProps {
  value: AccessSpace;
  onChange: (value: AccessSpace) => void;
  disabled?: boolean;
}

export function RoleTabs({ value, onChange, disabled = false }: RoleTabsProps) {
  const tabs: { value: AccessSpace; label: string; icon: "building" | "user" }[] = [
    { value: "entreprise", label: "Entreprise", icon: "building" },
    { value: "administration", label: "Administration", icon: "user" },
  ];

  return (
    <div className="grid grid-cols-2 rounded-xl border border-line bg-canvas p-1" role="tablist" aria-label="Type de compte">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex h-10 items-center justify-center gap-2 rounded-lg text-[0.8125rem] font-medium transition-all duration-200",
              active
                ? "bg-white text-ink-900 shadow-[0_1px_2px_rgba(16,42,80,0.08)]"
                : "text-muted hover:text-ink-800",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <Icon name={tab.icon} className={cn("size-4", active && "text-republic-green-600")} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}