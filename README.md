# 前端仪表盘

本项目是基于 Next.js 的“缠论 + KNN”股票分析前端。

## 运行前准备

- 后端服务已启动：`http://127.0.0.1:8000`
- Node.js 20+

## 本地运行

```bash
npm install
npm run dev
```

前端地址：`http://127.0.0.1:3000`

## 代理接口

前端通过 Next Route Handlers 代理后端接口：

- `POST /api/sync` -> `POST /v1/data/sync`
- `POST /api/train` -> `POST /v1/model/train`
- `GET /api/analyze/[symbol]` -> `GET /v1/analyze/{symbol}`

可通过环境变量设置后端地址：

```bash
API_BASE_URL=http://127.0.0.1:8000
```

## 页面流程

1. 输入股票代码、日期区间和 KNN 邻居数
2. 点击“同步数据”
3. 点击“训练模型”
4. 点击“开始分析”

页面将展示：

- 次日上涨概率与融合信号
- 信号说明
- 缠论摘要（分型、笔、线段）
- K线走势预测（`next_1d`、`next_5d`、`next_10d`）
- 特征快照柱状图
# stock_frontEnd
