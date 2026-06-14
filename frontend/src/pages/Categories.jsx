import { useState, useEffect } from "react";
import { getCategories, createCategory, deleteCategory } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", type: "expense" });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory(form);
      setForm({ name: "", type: "expense" });
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus kategori ini?")) {
      await deleteCategory(id);
      fetchCategories();
    }
  };

  const income = categories.filter(c => c.type === "income");
  const expense = categories.filter(c => c.type === "expense");

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
            <h1 className="text-2xl font-bold text-slate-800">Kategori</h1>
            <p className="text-slate-400 text-sm mt-1">Kelola kategori pemasukan dan pengeluaran kamu</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{background: showForm ? "#dc2626" : "#3b82f6"}}
          >
            <i className={`ti ${showForm ? "ti-x" : "ti-plus"}`} aria-hidden="true"></i>
            {showForm ? "Batal" : "Tambah Kategori"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 animate-fadeInUp">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <i className="ti ti-tag text-blue-500" aria-hidden="true"></i>
              Tambah Kategori Baru
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Kategori</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Contoh: Listrik"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipe</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="expense">💸 Pengeluaran</option>
                  <option value="income">💰 Pemasukan</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg"
                  style={{background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"}}
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-fadeInUp delay-100">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: "#dcfce7"}}>
              <i className="ti ti-arrow-up text-green-600 text-xl" aria-hidden="true"></i>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Kategori Pemasukan</p>
              <p className="text-2xl font-bold text-slate-800">{income.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: "#fee2e2"}}>
              <i className="ti ti-arrow-down text-red-500 text-xl" aria-hidden="true"></i>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Kategori Pengeluaran</p>
              <p className="text-2xl font-bold text-slate-800">{expense.length}</p>
            </div>
          </div>
        </div>

        {/* Pemasukan */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5 animate-fadeInUp delay-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block"></span>
            Pemasukan
            <span className="ml-auto text-xs font-normal text-slate-400">{income.length} kategori</span>
          </h3>
          {income.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <i className="ti ti-inbox text-2xl text-slate-300" aria-hidden="true"></i>
              </div>
              <p className="text-slate-400 text-sm">Belum ada kategori pemasukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {income.map(c => (
                <div
                  key={c.id}
                  className="flex justify-between items-center p-3 rounded-xl group transition-all duration-200 hover:shadow-sm"
                  style={{background: "#f0fdf4", border: "1px solid #bbf7d0"}}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <span className="text-sm font-medium text-slate-700">{c.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100"
                  >
                    <i className="ti ti-x text-xs text-slate-300 hover:text-red-500" aria-hidden="true"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pengeluaran */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeInUp delay-300">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block"></span>
            Pengeluaran
            <span className="ml-auto text-xs font-normal text-slate-400">{expense.length} kategori</span>
          </h3>
          {expense.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <i className="ti ti-inbox text-2xl text-slate-300" aria-hidden="true"></i>
              </div>
              <p className="text-slate-400 text-sm">Belum ada kategori pengeluaran</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {expense.map(c => (
                <div
                  key={c.id}
                  className="flex justify-between items-center p-3 rounded-xl group transition-all duration-200 hover:shadow-sm"
                  style={{background: "#fff1f2", border: "1px solid #fecdd3"}}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💸</span>
                    <span className="text-sm font-medium text-slate-700">{c.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100"
                  >
                    <i className="ti ti-x text-xs text-slate-300 hover:text-red-500" aria-hidden="true"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}