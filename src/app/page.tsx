"use client";

import { useMemo, useState } from "react";

import FeatureBarChart from "@/components/FeatureBarChart";
import SignalGauge from "@/components/SignalGauge";
import { analyzeSymbol, syncData, trainModel, uploadCsv } from "@/lib/api";
import type { AnalyzeResponse, DataSyncResponse, TrainModelResponse } from "@/types/stock";

export default function Home() {
  const [symbol, setSymbol] = useState("600150");
  const [dataProvider, setDataProvider] = useState<"auto" | "akshare" | "tushare" | "csv">("auto");
  const [startDate, setStartDate] = useState("20240101");
  const [endDate, setEndDate] = useState("20260506");
  const [nNeighbors, setNNeighbors] = useState(7);
  const [loadingAction, setLoadingAction] = useState<"" | "sync" | "train" | "analyze">("");
  const [error, setError] = useState("");
  const [syncResult, setSyncResult] = useState<DataSyncResponse | null>(null);
  const [trainResult, setTrainResult] = useState<TrainModelResponse | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const isLoading = loadingAction !== "";

  const canAnalyze = useMemo(() => /^[0-9]{6}$/.test(symbol.trim()), [symbol]);

  function validateInputs(): string | null {
    if (!/^[0-9]{6}$/.test(symbol.trim())) return "股票代码需为 6 位数字（A股代码）。";
    if (dataProvider !== "csv") {
      if (!/^[0-9]{8}$/.test(startDate)) return "开始日期格式应为 YYYYMMDD。";
      if (!/^[0-9]{8}$/.test(endDate)) return "结束日期格式应为 YYYYMMDD。";
    }
    if (nNeighbors < 1 || nNeighbors > 50) return "KNN 邻居数需在 1 到 50 之间。";
    if (dataProvider === "csv" && !csvFile) return "请先选择要上传的 CSV 文件。";
    return null;
  }

  async function handleSync() {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoadingAction("sync");
    try {
      const result =
        dataProvider === "csv"
          ? await uploadCsv(symbol.trim(), csvFile as File)
          : await syncData({
              symbol: symbol.trim(),
              start_date: startDate,
              end_date: endDate,
              data_provider: dataProvider as "auto" | "akshare" | "tushare",
            });
      setSyncResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "同步失败。");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleTrain() {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoadingAction("train");
    try {
      const result = await trainModel({
        symbol: symbol.trim(),
        n_neighbors: nNeighbors,
      });
      setTrainResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "训练失败。");
    } finally {
      setLoadingAction("");
    }
  }

  async function handleAnalyze() {
    if (!canAnalyze) {
      setError("股票代码需为 6 位数字（A股代码）。");
      return;
    }
    setError("");
    setLoadingAction("analyze");
    try {
      const result = await analyzeSymbol(symbol.trim());
      setAnalyzeResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败。");
    } finally {
      setLoadingAction("");
    }
  }

  return (
    <div className="page-shell">
      <main className="container">
        <section className="card">
          <h1 className="title">缠论 + KNN 股票分析看板</h1>
          <p className="muted">输入 A 股标的后，依次执行数据同步、模型训练与结果分析。</p>

          <div className="grid-form">
            <label className="field">
              <span>股票代码</span>
              <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="600150" />
            </label>
            <label className="field">
              <span>数据源类型</span>
              <select
                value={dataProvider}
                onChange={(e) => setDataProvider(e.target.value as "auto" | "akshare" | "tushare" | "csv")}
              >
                <option value="auto">自动（tushare 无 token 则回退 akshare）</option>
                <option value="akshare">AkShare</option>
                <option value="tushare">Tushare（需要 token）</option>
                <option value="csv">上传 CSV</option>
              </select>
            </label>
            <label className="field">
              <span>开始日期（YYYYMMDD）</span>
              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={dataProvider === "csv"}
              />
            </label>
            <label className="field">
              <span>结束日期（YYYYMMDD）</span>
              <input
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={dataProvider === "csv"}
              />
            </label>
            <label className="field">
              <span>KNN 邻居数</span>
              <input
                type="number"
                min={1}
                max={50}
                value={nNeighbors}
                onChange={(e) => setNNeighbors(Number(e.target.value))}
              />
            </label>

            {dataProvider === "csv" && (
              <label className="field">
                <span>CSV 文件</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          <div className="action-row">
            <button onClick={handleSync} disabled={isLoading}>
              {loadingAction === "sync"
                ? "执行中..."
                : dataProvider === "csv"
                  ? "上传 CSV"
                  : "同步数据"}
            </button>
            <button onClick={handleTrain} disabled={isLoading}>
              {loadingAction === "train" ? "训练中..." : "训练模型"}
            </button>
            <button onClick={handleAnalyze} disabled={isLoading}>
              {loadingAction === "analyze" ? "分析中..." : "开始分析"}
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="card">
          <h2 className="section-title">执行状态</h2>
          <p className="muted">同步行数：{syncResult?.rows ?? "-"}</p>
          <p className="muted">
            训练/验证样本：{trainResult?.train_rows ?? "-"} / {trainResult?.valid_rows ?? "-"}
          </p>
          <p className="muted">模型路径：{trainResult?.model_path ?? "-"}</p>
        </section>

        {analyzeResult && (
          <section className="card">
            <h2 className="section-title">预测结果</h2>
            <p className="muted">最新交易日：{analyzeResult.latest_trade_date}</p>
            <SignalGauge
              probability={analyzeResult.prediction_prob_up}
              signal={analyzeResult.final_signal}
            />
            <p>
              <strong>信号说明：</strong> {analyzeResult.signal_reason}
            </p>
            <div className="summary-grid">
              <div>分型数量：{analyzeResult.chan_summary.fractal_count}</div>
              <div>笔数量：{analyzeResult.chan_summary.bi_count}</div>
              <div>线段数量：{analyzeResult.chan_summary.segment_count}</div>
              <div>最新线段方向：{analyzeResult.chan_summary.latest_segment_direction}</div>
            </div>

            <h3 className="section-title">未来K线区间预测</h3>
            <div className="trend-grid">
              <div className="trend-item">
                <span>未来 3 日</span>
                <strong>
                  {analyzeResult.kline_range_forecast.next_3d.low} ~{" "}
                  {analyzeResult.kline_range_forecast.next_3d.high}
                </strong>
                <p className="muted small-text">
                  下沿收益 {`${(analyzeResult.kline_range_forecast.next_3d.downside_return * 100).toFixed(2)}%`} / 上沿收益{" "}
                  {`${(analyzeResult.kline_range_forecast.next_3d.upside_return * 100).toFixed(2)}%`}
                </p>
              </div>
              <div className="trend-item">
                <span>未来 5 日</span>
                <strong>
                  {analyzeResult.kline_range_forecast.next_5d.low} ~{" "}
                  {analyzeResult.kline_range_forecast.next_5d.high}
                </strong>
                <p className="muted small-text">
                  下沿收益 {`${(analyzeResult.kline_range_forecast.next_5d.downside_return * 100).toFixed(2)}%`} / 上沿收益{" "}
                  {`${(analyzeResult.kline_range_forecast.next_5d.upside_return * 100).toFixed(2)}%`}
                </p>
              </div>
              <div className="trend-item">
                <span>未来 10 日</span>
                <strong>
                  {analyzeResult.kline_range_forecast.next_10d.low} ~{" "}
                  {analyzeResult.kline_range_forecast.next_10d.high}
                </strong>
                <p className="muted small-text">
                  下沿收益 {`${(analyzeResult.kline_range_forecast.next_10d.downside_return * 100).toFixed(2)}%`} / 上沿收益{" "}
                  {`${(analyzeResult.kline_range_forecast.next_10d.upside_return * 100).toFixed(2)}%`}
                </p>
              </div>
            </div>

            <h3 className="section-title">关键特征快照（Top 8）</h3>
            <FeatureBarChart features={analyzeResult.feature_snapshot} />
          </section>
        )}
      </main>
    </div>
  );
}
