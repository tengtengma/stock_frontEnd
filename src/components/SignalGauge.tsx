type Props = {
  probability: number;
  signal: string;
};

export default function SignalGauge({ probability, signal }: Props) {
  const percent = Math.max(0, Math.min(100, probability * 100));
  const toneClass =
    signal === "strong_long"
      ? "signal-strong-long"
      : signal === "watch_long"
        ? "signal-watch-long"
        : signal === "strong_avoid"
          ? "signal-strong-avoid"
          : "signal-neutral";

  return (
    <div className="gauge-card">
      <p className="muted">次日上涨概率</p>
      <div className="gauge-track">
        <div className={`gauge-fill ${toneClass}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="gauge-meta">
        <span>{percent.toFixed(2)}%</span>
        <span className={`signal-badge ${toneClass}`}>信号：{signal}</span>
      </div>
    </div>
  );
}
