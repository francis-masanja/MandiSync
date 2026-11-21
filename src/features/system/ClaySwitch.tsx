'use client';

interface ClaySwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function ClaySwitch({ checked, onChange, label, description }: ClaySwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--clay-text)]">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--clay-muted)]">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 flex-none items-center rounded-full border border-[var(--clay-line)] transition-colors duration-200 ${
          checked
            ? 'bg-[var(--clay-accent)]'
            : 'bg-[var(--clay-surface-3)] shadow-[var(--clay-inset)]'
        }`}
      >
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--clay-surface)] shadow-[var(--clay-shadow-sm)] transition-transform duration-200 ${
            checked ? 'translate-x-[1.55rem]' : 'translate-x-[0.15rem]'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full transition-colors ${
              checked ? 'bg-[var(--clay-accent-strong)]' : 'bg-[var(--clay-faint)]'
            }`}
          />
        </span>
      </button>
    </div>
  );
}
