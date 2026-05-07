export type DataSyncRequest = {
  symbol: string;
  start_date?: string;
  end_date?: string;
  data_provider?: "auto" | "tushare" | "akshare";
};

export type DataSyncResponse = {
  symbol: string;
  rows: number;
  file_path: string;
};

export type TrainModelRequest = {
  symbol: string;
  n_neighbors: number;
};

export type TrainModelResponse = {
  symbol: string;
  model_path: string;
  train_rows: number;
  valid_rows: number;
  metrics: Record<string, number>;
};

export type KlineRangeItem = {
  low: number;
  high: number;
  downside_return: number;
  upside_return: number;
};

export type KlineRangeForecast = {
  next_3d: KlineRangeItem;
  next_5d: KlineRangeItem;
  next_10d: KlineRangeItem;
};

export type AnalyzeResponse = {
  symbol: string;
  latest_trade_date: string;
  prediction_label: number;
  prediction_prob_up: number;
  chan_summary: {
    fractal_count: number;
    bi_count: number;
    segment_count: number;
    latest_segment_direction: string;
  };
  feature_snapshot: Record<string, number>;
  final_signal: string;
  signal_reason: string;
  kline_range_forecast: KlineRangeForecast;
};
