import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSummary, getTransactions } from "../services/api";
import Sidebar from "../components/Sidebar";
import useCountUp from "../hooks/useCountUp";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const incomeCount = useCountUp(parseFloat(summary.total_income));
  const expenseCount = useCountUp(parseFloat(summary.total_expense));
  const balanceCount = useCountUp(parseFloat(summary.balance));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, transRes] = await Promise.all([getSummary(), getTransactions()]);
        setSummary(summaryRes.data);
        setTransactions(transRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const chartData = [
    { name: "Pemasukan", value: parseFloat(summary.total_income) },
    { name: "Pengeluaran", value: parseFloat(summary.total_expense) },
  ];

  const pieData = transactions.reduce((acc, t) => {
    const existing = acc.find(item => item.name === t.category_name);
    if (existing) existing.value += parseFloat(t.amount);
    else acc.push({ name: t.category_name, value: parseFloat(t.amount) });
    return acc;
  }, []);

  const COLORS = ["#3b82f6", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2"];

  if (loading) return (
    <div className="flex min-h-screen" style={{background: "#f8fafc"}}>
      <Sidebar />
      <main className="flex-1 ml-60 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Memuat data...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{background: "#f8fafc"}}>
      <Sidebar />

      <main className="flex-1 ml-60 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fadeInUp">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Ringkasan keuangan kamu — {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{background: "#3b82f6"}}
          >
            <i className="ti ti-plus" aria-hidden="true"></i>
            Tambah Transaksi
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fadeInUp delay-100 hover:-translate-y-1 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm font-medium">Total Pemasukan</p>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: "#dcfce7"}}>
                <i className="ti ti-trending-up text-green-600" aria-hidden="true"></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatRupiah(incomeCount)}</p>
            <div className="flex items-center gap-1 mt-3">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              <p className="text-green-600 text-xs font-medium">Semua pemasukan</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fadeInUp delay-200 hover:-translate-y-1 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm font-medium">Total Pengeluaran</p>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: "#fee2e2"}}>
                <i className="ti ti-trending-down text-red-500" aria-hidden="true"></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatRupiah(expenseCount)}</p>
            <div className="flex items-center gap-1 mt-3">
              <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
              <p className="text-red-500 text-xs font-medium">Semua pengeluaran</p>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-sm animate-fadeInUp delay-300 hover:-translate-y-1 transition-transform duration-200" style={{background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"}}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-blue-100 text-sm font-medium">Saldo Bersih</p>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: "rgba(255,255,255,0.2)"}}>
                <i className="ti ti-wallet text-white" aria-hidden="true"></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{formatRupiah(balanceCount)}</p>
            <div className="flex items-center gap-1 mt-3">
              <span className="w-2 h-2 bg-blue-300 rounded-full inline-block"></span>
              <p className="text-blue-200 text-xs font-medium">Pemasukan - Pengeluaran</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeInUp delay-400">
            <h2 className="text-base font-bold text-slate-800 mb-1">Perbandingan</h2>
            <p className="text-slate-400 text-xs mb-5">Pemasukan vs Pengeluaran</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v/1000000).toFixed(1)}jt`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatRupiah(value)} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="#16a34a" />
                  <Cell fill="#dc2626" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeInUp delay-500">
            <h2 className="text-base font-bold text-slate-800 mb-1">Distribusi</h2>
            <p className="text-slate-400 text-xs mb-5">Komposisi per kategori</p>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(value)} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeInUp delay-500">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Transaksi Terbaru</h2>
              <p className="text-slate-400 text-xs mt-1">5 transaksi terakhir</p>
            </div>
            <Link to="/transactions" className="text-sm font-medium hover:underline" style={{color: "#3b82f6"}}>
              Lihat semua →
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((t, i) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center p-4 rounded-xl transition-all duration-200 hover:shadow-sm animate-fadeInUp"
                  style={{
                    background: "#f8fafc",
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{background: t.category_type === "income" ? "#dcfce7" : "#fee2e2"}}>
                      {t.category_type === "income" ? "💰" : "💸"}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{t.description}</p>
                      <p className="text-xs text-slate-400">{t.category_name} · {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <p className="font-bold text-sm" style={{color: t.category_type === "income" ? "#16a34a" : "#dc2626"}}>
                    {t.category_type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}