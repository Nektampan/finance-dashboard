import { useState, useEffect } from "react";
import { getTransactions, createTransaction, deleteTransaction, getCategories } from "../services/api";
import Sidebar from "../components/Sidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_id: "", amount: "", description: "", date: "" });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([getTransactions(), getCategories()]);
      setTransactions(transRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTransaction(form);
      setForm({ category_id: "", amount: "", description: "", date: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus transaksi ini?")) {
      await deleteTransaction(id);
      fetchData();
    }
  };

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const filteredTransactions = transactions.filter(t => {
    if (filter === "income") return t.category_type === "income";
    if (filter === "expense") return t.category_type === "expense";
    return true;
  });

  const totalIncome = transactions.filter(t => t.category_type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = transactions.filter(t => t.category_type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("FinanceOS", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Laporan Keuangan - ${new Date().toLocaleDateString("id-ID")}`, 14, 30);
    doc.setTextColor(22, 163, 74);
    doc.text(`Total Pemasukan: ${formatRupiah(totalIncome)}`, 14, 45);
    doc.setTextColor(220, 38, 38);
    doc.text(`Total Pengeluaran: ${formatRupiah(totalExpense)}`, 14, 53);
    doc.setTextColor(37, 99, 235);
    doc.text(`Saldo: ${formatRupiah(totalIncome - totalExpense)}`, 14, 61);
    autoTable(doc, {
      startY: 70,
      head: [["No", "Tanggal", "Deskripsi", "Kategori", "Tipe", "Jumlah"]],
      body: transactions.map((t, i) => [
        i + 1,
        new Date(t.date).toLocaleDateString("id-ID"),
        t.description,
        t.category_name,
        t.category_type === "income" ? "Pemasukan" : "Pengeluaran",
        formatRupiah(t.amount),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    });
    doc.save(`laporan-keuangan-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

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
            <h1 className="text-2xl font-bold text-slate-800">Transaksi</h1>
            <p className="text-slate-400 text-sm mt-1">Kelola semua pemasukan dan pengeluaran kamu</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
            >
              <i className="ti ti-file-text" aria-hidden="true"></i>
              Export PDF
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              style={{background: showForm ? "#dc2626" : "#3b82f6"}}
            >
              <i className={`ti ${showForm ? "ti-x" : "ti-plus"}`} aria-hidden="true"></i>
              {showForm ? "Batal" : "Tambah Transaksi"}
            </button>
          </div>
        </div>

        {/* Mini Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-fadeInUp delay-100">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: "#dcfce7"}}>
              <i className="ti ti-arrow-up text-green-600" aria-hidden="true"></i>
            </div>
            <div>
              <p className="text-xs text-slate-400">Pemasukan</p>
              <p className="text-sm font-bold text-slate-800">{formatRupiah(totalIncome)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: "#fee2e2"}}>
              <i className="ti ti-arrow-down text-red-500" aria-hidden="true"></i>
            </div>
            <div>
              <p className="text-xs text-slate-400">Pengeluaran</p>
              <p className="text-sm font-bold text-slate-800">{formatRupiah(totalExpense)}</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 shadow-sm flex items-center gap-3" style={{background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: "rgba(255,255,255,0.2)"}}>
              <i className="ti ti-wallet text-white" aria-hidden="true"></i>
            </div>
            <div>
              <p className="text-xs text-blue-200">Saldo</p>
              <p className="text-sm font-bold text-white">{formatRupiah(totalIncome - totalExpense)}</p>
            </div>
          </div>
        </div>

        {/* Form Tambah */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 animate-fadeInUp">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <i className="ti ti-plus text-blue-500" aria-hidden="true"></i>
              Tambah Transaksi Baru
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  required
                >
                  <option value="">Pilih kategori</option>
                  <optgroup label="💰 Pemasukan">
                    {categories.filter(c => c.type === "income").map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="💸 Pengeluaran">
                    {categories.filter(c => c.type === "expense").map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah (Rp)</label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="500000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Contoh: Gaji bulan Juni"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg"
                  style={{background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"}}
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-5 animate-fadeInUp delay-200">
          {[["all", "Semua", "ti-list"], ["income", "Pemasukan", "ti-arrow-up"], ["expense", "Pengeluaran", "ti-arrow-down"]].map(([val, label, icon]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: filter === val ? "#3b82f6" : "white",
                color: filter === val ? "white" : "#64748b",
                border: filter === val ? "1px solid #3b82f6" : "1px solid #e2e8f0",
              }}
            >
              <i className={`ti ${icon} text-sm`} aria-hidden="true"></i>
              {label}
            </button>
          ))}
          <span className="ml-auto flex items-center text-xs text-slate-400">
            {filteredTransactions.length} transaksi
          </span>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeInUp delay-300">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ti ti-inbox text-3xl text-slate-300" aria-hidden="true"></i>
              </div>
              <p className="text-sm font-medium text-slate-500">Belum ada transaksi</p>
              <p className="text-xs mt-1">Klik "Tambah Transaksi" untuk mulai mencatat</p>
            </div>
          ) : (
            <div>
              {filteredTransactions.map((t, i) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center px-6 py-4 hover:bg-slate-50 transition-all duration-150 group border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{background: t.category_type === "income" ? "#dcfce7" : "#fee2e2"}}
                    >
                      {t.category_type === "income" ? "💰" : "💸"}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: t.category_type === "income" ? "#dcfce7" : "#fee2e2",
                            color: t.category_type === "income" ? "#16a34a" : "#dc2626"
                          }}
                        >
                          {t.category_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className="font-bold text-sm"
                      style={{color: t.category_type === "income" ? "#16a34a" : "#dc2626"}}
                    >
                      {t.category_type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                    </p>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50"
                    >
                      <i className="ti ti-trash text-slate-300 hover:text-red-500" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}