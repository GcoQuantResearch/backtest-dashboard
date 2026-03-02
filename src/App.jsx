import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

const s1Returns = {
  2006: 10.19, 2007: -7.2, 2008: -2.46, 2009: 19.46, 2010: -2.59,
  2011: -4.29, 2012: 13.08, 2013: 32.31, 2014: 9.74, 2015: -8.84,
  2016: 9.32, 2017: 21.71, 2018: -4.68, 2019: 14.61, 2020: 17.67,
  2021: 28.73, 2022: -18.24, 2023: 13.12, 2024: 24.89, 2025: 9.56,
};

const s2Returns = {
  2006: 8.71, 2007: -7.2, 2008: -11.2, 2009: 25.07, 2010: -1.46,
  2011: -0.35, 2012: 13.08, 2013: 32.31, 2014: 9.74, 2015: -4.63,
  2016: 12.96, 2017: 21.71, 2018: -4.68, 2019: 19.43, 2020: 20.65,
  2021: 28.73, 2022: -23.85, 2023: 15.65, 2024: 24.89, 2025: 13.44,
};

const benchmark = {
  2006: 13.74, 2007: 5.15, 2008: -36.79, 2009: 26.35, 2010: 15.06,
  2011: 1.89, 2012: 15.99, 2013: 32.31, 2014: 13.46, 2015: 1.23,
  2016: 12, 2017: 21.71, 2018: -4.57, 2019: 31.22, 2020: 18.33,
  2021: 28.73, 2022: -18.18, 2023: 26.18, 2024: 24.89, 2025: 17.72,
};

const s1Trades = {
  2006: 10, 2007: 15, 2008: 4, 2009: 1, 2010: 12, 2011: 12, 2012: 2,
  2014: 2, 2015: 8, 2016: 4, 2018: 9, 2019: 5, 2020: 6, 2022: 15,
  2023: 9, 2025: 4,
};

const s2Trades = {
  2006: 6, 2007: 15, 2008: 21, 2009: 8, 2010: 14, 2011: 6, 2012: 2,
  2013: 0, 2014: 2, 2015: 6, 2016: 6, 2017: 0, 2018: 9, 2019: 3,
  2020: 8, 2021: 0, 2022: 25, 2023: 9, 2024: 0, 2025: 4,
};

const years = Array.from({ length: 20 }, (_, i) => 2006 + i);

const data = years.map((y) => ({
  year: y,
  s1: s1Returns[y] ?? null,
  s2: s2Returns[y] ?? null,
  bm: benchmark[y] ?? null,
  s1Trades: s1Trades[y] ?? 0,
  s2Trades: s2Trades[y] ?? 0,
  s1Diff: s1Returns[y] != null && benchmark[y] != null ? +(s1Returns[y] - benchmark[y]).toFixed(2) : null,
  s2Diff: s2Returns[y] != null && benchmark[y] != null ? +(s2Returns[y] - benchmark[y]).toFixed(2) : null,
}));

const C = {
  s1: "#38bdf8",
  s2: "#f59e0b",
  bm: "#94a3b8",
  pos: "#4ade80",
  neg: "#f87171",
  bg: "#0d1117",
  card: "#161b22",
  border: "#21262d",
  text: "#e6edf3",
  muted: "#7d8590",
};

const fmt = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`);
const fmtPure = (v) => (v == null ? "—" : `${v.toFixed(2)}%`);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1c2128", border: `1px solid ${C.border}`, borderRadius: 8,
      padding: "12px 16px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace"
    }}>
      <div style={{ color: C.muted, marginBottom: 8, fontWeight: 700 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 20, color: p.color, marginBottom: 3 }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 700 }}>{typeof p.value === "number" ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "16px 20px", flex: 1
  }}>
    <div style={{ color: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    <div style={{ color: color || C.text, fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    {sub && <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{sub}</div>}
  </div>
);

// Cumulative returns
function cumulReturn(arr, key) {
  let cum = 1;
  return arr.map((d) => {
    if (d[key] != null) cum *= (1 + d[key] / 100);
    return +((cum - 1) * 100).toFixed(2);
  });
}
const cumS1 = cumulReturn(data, "s1");
const cumS2 = cumulReturn(data, "s2");
const cumBm = cumulReturn(data, "bm");
const cumulData = data.map((d, i) => ({ ...d, cumS1: cumS1[i], cumS2: cumS2[i], cumBm: cumBm[i] }));

export default function App() {
  const [tab, setTab] = useState("returns");

  const s1Wins = data.filter((d) => d.s1 != null && d.bm != null && d.s1 > d.bm).length;
  const s2Wins = data.filter((d) => d.s2 != null && d.bm != null && d.s2 > d.bm).length;
  const total = data.filter((d) => d.bm != null).length;

  const avgS1 = (data.reduce((a, d) => a + (d.s1 ?? 0), 0) / total).toFixed(2);
  const avgS2 = (data.reduce((a, d) => a + (d.s2 ?? 0), 0) / total).toFixed(2);
  const avgBm = (data.reduce((a, d) => a + (d.bm ?? 0), 0) / total).toFixed(2);

  const totalS1Trades = Object.values(s1Trades).reduce((a, b) => a + b, 0);
  const totalS2Trades = Object.values(s2Trades).reduce((a, b) => a + b, 0);

  const tabs = ["returns", "excess", "cumulative", "trades", "table"];

  return (
    <div style={{
      background: C.bg, minHeight: "100vh", color: C.text,
      fontFamily: "'Inter', sans-serif", padding: "32px 28px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        .tab { cursor: pointer; padding: 7px 18px; border-radius: 6px; font-size: 12px; font-weight: 600;
          letter-spacing: 0.5px; text-transform: uppercase; transition: all 0.15s; border: 1px solid transparent; }
        .tab:hover { background: #21262d; }
        .tab.active { background: #21262d; border-color: #30363d; color: #e6edf3; }
        .tab { color: #7d8590; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; font-family: 'JetBrains Mono', monospace; }
        th { color: #7d8590; font-weight: 600; text-align: right; padding: 8px 12px; border-bottom: 1px solid #21262d; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; }
        th:first-child { text-align: left; }
        td { padding: 8px 12px; border-bottom: 1px solid #161b22; text-align: right; }
        td:first-child { text-align: left; color: #94a3b8; font-weight: 700; }
        tr:hover td { background: #161b22; }
        .win { color: #4ade80; } .loss { color: #f87171; } .neutral { color: #94a3b8; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>SPY Backtest Analysis · 2006–2025</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>200MA-Only <span style={{ color: C.muted }}>vs</span> 200MA <span style={{ color: C.muted }}>OR</span> 50MA Strategy</h1>
        <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
          {[
            { dot: C.s1, label: "Strategy 1 · Buy ↑200MA / Sell ↓200MA" },
            { dot: C.s2, label: "Strategy 2 · Buy ↑200MA OR ↑50MA / Sell ↓200MA AND ↓50MA" },
            { dot: C.bm, label: "Benchmark (Buy & Hold)" },
          ].map(({ dot, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.muted }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: dot }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="S1 Avg Annual" value={`${avgS1}%`} sub={`${s1Wins}/${total} yrs beat benchmark`} color={C.s1} />
        <StatCard label="S2 Avg Annual" value={`${avgS2}%`} sub={`${s2Wins}/${total} yrs beat benchmark`} color={C.s2} />
        <StatCard label="Benchmark Avg" value={`${avgBm}%`} sub="Buy & Hold S&P 500" color={C.bm} />
        <StatCard label="S1 Total Trades" value={totalS1Trades} sub="200MA only signals" color={C.s1} />
        <StatCard label="S2 Total Trades" value={totalS2Trades} sub="Dual MA OR signals" color={C.s2} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {tabs.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "returns" ? "Annual Returns" : t === "excess" ? "Excess vs Benchmark" : t === "cumulative" ? "Cumulative Growth" : t === "trades" ? "Trade Count" : "Data Table"}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 16px" }}>
        {tab === "returns" && (
          <>
            <div style={{ color: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Annual Strategy Returns vs Benchmark</div>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={data} barGap={2} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#30363d" />
                <Bar dataKey="s1" name="Strategy 1" fill={C.s1} opacity={0.85} radius={[3, 3, 0, 0]} />
                <Bar dataKey="s2" name="Strategy 2" fill={C.s2} opacity={0.85} radius={[3, 3, 0, 0]} />
                <Line dataKey="bm" name="Benchmark" stroke={C.bm} strokeWidth={2} dot={{ r: 3, fill: C.bm }} />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "excess" && (
          <>
            <div style={{ color: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Excess Return vs Benchmark (Strategy − Benchmark)</div>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={data} barGap={2} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#30363d" />
                <Bar dataKey="s1Diff" name="S1 Excess" radius={[3, 3, 0, 0]}>
                  {data.map((d, i) => <Cell key={i} fill={d.s1Diff >= 0 ? "#38bdf880" : "#f8717180"} stroke={d.s1Diff >= 0 ? C.s1 : C.neg} strokeWidth={1} />)}
                </Bar>
                <Bar dataKey="s2Diff" name="S2 Excess" radius={[3, 3, 0, 0]}>
                  {data.map((d, i) => <Cell key={i} fill={d.s2Diff >= 0 ? "#f59e0b80" : "#fb923c80"} stroke={d.s2Diff >= 0 ? C.s2 : "#fb923c"} strokeWidth={1} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "cumulative" && (
          <>
            <div style={{ color: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Cumulative Total Return ($1 invested in 2006)</div>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={cumulData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#30363d" />
                <Line dataKey="cumS1" name="Strategy 1" stroke={C.s1} strokeWidth={2.5} dot={false} />
                <Line dataKey="cumS2" name="Strategy 2" stroke={C.s2} strokeWidth={2.5} dot={false} />
                <Line dataKey="cumBm" name="Benchmark" stroke={C.bm} strokeWidth={2} dot={false} strokeDasharray="5 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "trades" && (
          <>
            <div style={{ color: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Total Trades Per Year (Buys + Sells)</div>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={data} barGap={2} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="s1Trades" name="S1 Trades" fill={C.s1} opacity={0.85} radius={[3, 3, 0, 0]} />
                <Bar dataKey="s2Trades" name="S2 Trades" fill={C.s2} opacity={0.85} radius={[3, 3, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "table" && (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>S1 Return</th>
                  <th>S2 Return</th>
                  <th>Benchmark</th>
                  <th>S1 Excess</th>
                  <th>S2 Excess</th>
                  <th>S1−S2</th>
                  <th>S1 Trades</th>
                  <th>S2 Trades</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => {
                  const diff = d.s1 != null && d.s2 != null ? +(d.s1 - d.s2).toFixed(2) : null;
                  return (
                    <tr key={d.year}>
                      <td>{d.year}</td>
                      <td className={d.s1 > 0 ? "win" : d.s1 < 0 ? "loss" : "neutral"}>{fmtPure(d.s1)}</td>
                      <td className={d.s2 > 0 ? "win" : d.s2 < 0 ? "loss" : "neutral"}>{fmtPure(d.s2)}</td>
                      <td className={d.bm > 0 ? "win" : d.bm < 0 ? "loss" : "neutral"}>{fmtPure(d.bm)}</td>
                      <td className={d.s1Diff > 0 ? "win" : d.s1Diff < 0 ? "loss" : "neutral"}>{fmt(d.s1Diff)}</td>
                      <td className={d.s2Diff > 0 ? "win" : d.s2Diff < 0 ? "loss" : "neutral"}>{fmt(d.s2Diff)}</td>
                      <td className={diff > 0 ? "win" : diff < 0 ? "loss" : "neutral"}>{fmt(diff)}</td>
                      <td style={{ color: C.s1 }}>{d.s1Trades || "—"}</td>
                      <td style={{ color: C.s2 }}>{d.s2Trades || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Key Insights */}
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          {
            title: "📈 S2 Generally Captures More Upside",
            body: "The OR entry condition gets into positions faster on recoveries. S2 beat S1 in 2009 (+5.6pp), 2011 (+3.9pp), 2015 (+4.2pp), 2019 (+4.8pp), 2020 (+3pp), and 2025 (+3.9pp)."
          },
          {
            title: "📉 S2's Achilles Heel: 2008 and 2022",
            body: "The AND-sell rule (both MAs must break) delays exits in sustained downturns. In 2008 S2 lost −11.2% vs S1's −2.5%, and in 2022 S2 lost −23.9% vs S1's −18.2%. S2 also generated 21 trades in 2008 and 25 in 2022 vs S1's 4 and 15 — churning on false signals."
          },
          {
            title: "🔄 Trade Activity",
            body: `S1 made ${totalS1Trades} total trades vs S2's ${totalS2Trades}. S2 trades more in volatile/trending-down years due to the OR buy condition triggering on 50MA bounces before both MAs confirm direction.`
          },
          {
            title: "🏁 Neither Strategy Consistently Beats Buy & Hold",
            body: `S1 beat the benchmark in ${s1Wins}/${total} years (avg ${avgS1}% vs ${avgBm}%). S2 beat in ${s2Wins}/${total} years (avg ${avgS2}%). Both underperformed on cumulative terms due to missed upside in strong bull years (2019, 2023).`
          },
        ].map(({ title, body }) => (
          <div key={title} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px"
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{title}</div>
            <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
