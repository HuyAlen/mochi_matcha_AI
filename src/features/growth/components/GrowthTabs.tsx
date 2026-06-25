const tabs = ["Cân nặng", "Chiều cao", "Vòng đầu"];

export default function GrowthTabs() {
  return (
    <div className="grid grid-cols-3 rounded-full bg-white p-1 shadow-sm ring-1 ring-pink-100">
      {tabs.map((item, index) => (
        <button
          key={item}
          type="button"
          className={`rounded-full px-3 py-3 text-xs font-bold ${
            index === 0 ? "bg-pink-500 text-white shadow-sm" : "text-slate-400"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
