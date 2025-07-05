//Analyte page
import { useEffect, useState } from "react";
import { readSummary } from "./Api/sheetApi";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./App.css";


export default function AnalytePage() {
  const [daily, setDaily] = useState<{ date: string; total: number }[]>([]);
  const [monthly, setMonthly] = useState<{ month: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSummary() {
      try {
        const result = await readSummary();
        console.log("Fetched summary:", result.data);
        const dailyArray = Object.entries(result.data.daily).map(([date, total]) => ({
        date,
        total: total as number,
        }));

        const monthlyArray = Object.entries(result.data.monthly).map(([month, total]) => ({
        month,
        total: Number(total),
        }));

        console.log("Daily summary:", dailyArray);
        console.log("Monthly summary:", monthlyArray);


        setDaily(dailyArray);
        setMonthly(monthlyArray);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Failed to fetch summary");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-4">
        <button onClick={() => navigate("/")} className="navigateButtons">
            Oreder
        </button>
        <button onClick={() => navigate("/status")} className="navigateButtons2">
            Status
        </button>
        
        <h2 className="text-xl font-bold mb-2">📅 Daily Summary (Graph)</h2>
        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
            <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
            </ResponsiveContainer>
        </div>

        <h2 className="text-xl font-bold mb-2 mt-6">🗓 Monthly Summary (Graph)</h2>
        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
            <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#82ca9d" />
            </BarChart>
            </ResponsiveContainer>
        </div>

        {/* ตัวแสดงแบบ list เดิม */}
        <h2 className="text-xl font-bold mb-2 mt-6">📅 Daily Summary (List)</h2>
        <ul className="mb-4">
            {daily.map((item) => (
            <li key={item.date}>
                {item.date}: ฿{item.total.toLocaleString()}
            </li>
            ))}
        </ul>

        <h2 className="text-xl font-bold mb-2">🗓 Monthly Summary (List)</h2>
        <ul>
            {monthly.map((item) => (
            <li key={item.month}>
                {item.month}: ฿{item.total.toLocaleString()}
            </li>
            ))}
        </ul>

    </div>

  );
}
