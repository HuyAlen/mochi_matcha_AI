interface ReminderToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function ReminderToggle({
  enabled,
  onToggle,
}: ReminderToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`h-7 w-12 rounded-full p-1 transition ${
        enabled ? "bg-pink-500" : "bg-slate-200"
      }`}
      aria-label={enabled ? "Tắt nhắc nhở" : "Bật nhắc nhở"}
    >
      <span
        className={`block size-5 rounded-full bg-white transition ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
