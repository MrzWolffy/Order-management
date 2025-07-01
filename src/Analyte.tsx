//Analyte page
import { useEffect, useState } from "react";
import { readSummary } from "./Api/sheetApi"; // <-- ปรับ path ตามจริง

export default function AnalytePage() {
  const [daily, setDaily] = useState<{ date: string; total: number }[]>([]);
  const [monthly, setMonthly] = useState<{ month: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <h2 className="text-xl font-bold mb-2">📅 Daily Summary</h2>
      <ul className="mb-4">
        {daily.map((item) => (
          <li key={item.date}>
            {item.date}: ฿{item.total.toLocaleString()}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mb-2">🗓 Monthly Summary</h2>
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
