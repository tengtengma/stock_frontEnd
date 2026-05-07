type Props = {
  features: Record<string, number>;
};

export default function FeatureBarChart({ features }: Props) {
  const topItems = Object.entries(features)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 8);

  if (topItems.length === 0) {
    return <p className="muted">暂无特征数据。</p>;
  }

  const maxAbs = Math.max(...topItems.map((item) => Math.abs(item.value)), 1);

  return (
    <div className="chart-wrap">
      {topItems.map((item) => {
        const width = `${Math.max((Math.abs(item.value) / maxAbs) * 100, 4)}%`;
        return (
          <div key={item.name} className="bar-row">
            <div className="bar-label">{item.name}</div>
            <div className="bar-track">
              <div
                className={`bar-fill ${item.value >= 0 ? "bar-positive" : "bar-negative"}`}
                style={{ width }}
              />
            </div>
            <div className="bar-value">{item.value.toFixed(4)}</div>
          </div>
        );
      })}
    </div>
  );
}
