import { useState, useEffect } from "react";

// ==========================================
// GANTI URL INI jika backend jalan di port berbeda
// ==========================================
const API_URL = "https://drmwnmass-glowtrack-api.hf.space";

const CATEGORIES = [
  { label: "Cleanser", icon: "💧", color: "#E8F4FD", border: "#93C5E8", text: "#2B7BAD", activeColor: "#D0E9F7" },
  { label: "Toner", icon: "🌿", color: "#E8F7EF", border: "#85C9A4", text: "#2A7A50", activeColor: "#C8EED9" },
  { label: "Serum", icon: "✨", color: "#F0EBFF", border: "#B59EE8", text: "#5E3DBF", activeColor: "#DDD4F7" },
  { label: "Moisturizer", icon: "🧴", color: "#FFF0F0", border: "#F2A5A5", text: "#C13535", activeColor: "#FFD9D9" },
  { label: "Sunscreen", icon: "☀️", color: "#FFFAEB", border: "#F5D87A", text: "#B58600", activeColor: "#FFF0BB" },
  { label: "Spot Treatment", icon: "💊", color: "#FFF0FA", border: "#E8A0D8", text: "#A33580", activeColor: "#F7D4EF" },
  { label: "Body Lotion", icon: "🦶", color: "#F0F9FF", border: "#8DC8E8", text: "#1A6C99", activeColor: "#CCE9F7" },
  { label: "Lainnya", icon: "➕", color: "#F7F7F7", border: "#CCCCCC", text: "#666666", activeColor: "#EBEBEB" },
];

const BRAND_EXAMPLES = ["Somethinc", "Skintific", "Avoskin", "The Ordinary", "Cetaphil", "Wardah"];

// Ambil atau buat session ID — tersimpan di localStorage agar tidak berubah tiap refresh
function getSessionId() {
  let id = localStorage.getItem("glowtrack_session_id");
  if (!id) {
    id = Math.random().toString(36).substring(2, 10);
    localStorage.setItem("glowtrack_session_id", id);
  }
  return id;
}

export default function GlowTrack() {
  const sessionId = getSessionId();

  const [brand, setBrand] = useState("");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  // Status tombol simpan: idle | loading | success | error
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveMsg, setSaveMsg] = useState("");

  // Produk yang sudah tersimpan dari MongoDB
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  // ==========================================
  // AMBIL DATA PRODUK dari backend saat pertama load
  // ==========================================
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_URL}/produk/${sessionId}`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setProducts(data.produk || []);
    } catch (err) {
      console.error("fetchProducts error:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ==========================================
  // VALIDASI FORM
  // ==========================================
  const validate = () => {
    const e = {};
    if (!brand.trim()) e.brand = "Nama brand wajib diisi";
    if (!product.trim()) e.product = "Nama produk wajib diisi";
    if (!category) e.category = "Pilih kategori produk";
    return e;
  };

  // ==========================================
  // SIMPAN PRODUK ke backend → MongoDB Atlas
  // ==========================================
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setErrors({});
    setSaveStatus("loading");

    try {
      const res = await fetch(`${API_URL}/produk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          brand: brand,
          nama_produk: product,
          kategori: category,
          harga: parseInt(price) || 0,
          catatan: notes,
          status: "Aktif",
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      const data = await res.json();
      setSaveStatus("success");
      setSaveMsg(data.pesan || "Produk berhasil disimpan!");

      // Reset form
      setBrand(""); setProduct(""); setCategory(""); setPrice(""); setNotes("");

      // Refresh daftar produk dari server
      await fetchProducts();

      setTimeout(() => setSaveStatus("idle"), 2500);

    } catch (err) {
      console.error("handleSave error:", err);
      setSaveStatus("error");
      setSaveMsg("Gagal menyimpan. Cek koneksi ke backend.");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // ==========================================
  // HITUNG STATS dari data MongoDB
  // ==========================================
  const totalProduk = products.length;
  const totalKategori = [...new Set(products.map(p => p.kategori))].length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #F5F0FF 0%, #FBF8FF 50%, #EEF4FF 100%)",
      fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "0 0 120px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .field-card {
          background: white;
          border-radius: 20px;
          padding: 18px 20px;
          margin: 0 16px 12px;
          box-shadow: 0 2px 12px rgba(108,92,231,0.06);
          border: 1px solid rgba(200,185,255,0.3);
          transition: box-shadow 0.2s;
        }
        .field-card:focus-within {
          box-shadow: 0 4px 20px rgba(108,92,231,0.14);
          border-color: rgba(108,92,231,0.25);
        }
        .field-label {
          font-size: 13px;
          font-weight: 700;
          color: #4A3D7A;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .field-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #EDE9FF, #D9D0FA);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .glow-input {
          width: 100%;
          border: 1.5px solid #EAE4FF;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 14px;
          font-family: 'Nunito', sans-serif;
          color: #3D3070;
          background: #FDFBFF;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .glow-input::placeholder { color: #C5BCE0; }
        .glow-input:focus {
          border-color: #9B87E8;
          box-shadow: 0 0 0 3px rgba(155,135,232,0.12);
        }
        .glow-input.error { border-color: #F2A5A5; }
        .error-msg {
          font-size: 12px;
          color: #C13535;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .cat-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 10px 8px;
          border-radius: 14px;
          border: 1.5px solid;
          cursor: pointer;
          transition: all 0.18s ease;
          font-size: 11px;
          font-weight: 700;
          min-width: 0;
          flex: 1;
          user-select: none;
        }
        .cat-chip:hover { transform: translateY(-2px); }
        .cat-chip:active { transform: scale(0.95); }
        .cat-emoji { font-size: 18px; }
        .save-btn {
          width: calc(100% - 32px);
          margin: 0 16px;
          padding: 18px;
          border-radius: 20px;
          border: none;
          background: linear-gradient(135deg, #7C69E8, #9B87F5);
          color: white;
          font-size: 16px;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 8px 24px rgba(124,105,232,0.4);
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .save-btn:hover {
          background: linear-gradient(135deg, #6A58D6, #8B77E5);
          box-shadow: 0 10px 28px rgba(124,105,232,0.5);
          transform: translateY(-1px);
        }
        .save-btn:active { transform: scale(0.98); }
        .save-btn:disabled { opacity: 0.8; cursor: not-allowed; transform: none; }
        .save-btn.success {
          background: linear-gradient(135deg, #34C97E, #28B96E);
          box-shadow: 0 8px 24px rgba(52,201,126,0.4);
        }
        .save-btn.error-btn {
          background: linear-gradient(135deg, #E85555, #F57676);
          box-shadow: 0 8px 24px rgba(232,85,85,0.4);
        }
        .save-btn.loading {
          opacity: 0.75;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.4s ease; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .product-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: white;
          border-radius: 14px;
          border: 1px solid #EDE9FF;
          margin: 0 16px 8px;
          animation: slideUp 0.3s ease;
        }
        textarea.glow-input { resize: none; min-height: 90px; }
        .char-count {
          text-align: right;
          font-size: 11px;
          color: #C5BCE0;
          margin-top: 5px;
        }
        .session-badge {
          margin: 0 16px 16px;
          padding: 10px 14px;
          background: #F5F1FF;
          border-left: 4px solid #9B87E8;
          border-radius: 0 12px 12px 0;
          font-size: 11px;
          color: #7A6CAA;
        }
        .session-badge code {
          background: #EDE8FD;
          color: #5E3DBF;
          padding: 1px 6px;
          border-radius: 6px;
          font-size: 11px;
        }
      `}</style>

      {/* HEADER */}
      <div style={{
        padding: "52px 20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "white", border: "1px solid #EDE9FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16, color: "#7C69E8",
            boxShadow: "0 2px 8px rgba(108,92,231,0.1)",
          }}>←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#2D205A", lineHeight: 1.2 }}>
              Tambah Produk Skincare
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9B91C0" }}>
              Catat produk yang sedang kamu gunakan ✨
            </p>
          </div>
        </div>
        <div style={{ fontSize: 42, lineHeight: 1, marginTop: -4 }}>🧴</div>
      </div>

      {/* STATS ROW — angka real dari MongoDB */}
      <div style={{ display: "flex", gap: 10, margin: "0 16px 16px" }}>
        {[
          { label: "Total Produk", value: loadingProducts ? "..." : totalProduk, icon: "🏪" },
          { label: "Kategori", value: loadingProducts ? "..." : totalKategori, icon: "📂" },
          { label: "Status", value: "☁️ Atlas", icon: "🌐" },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, background: "white", borderRadius: 16, padding: "12px 10px",
            textAlign: "center", border: "1px solid rgba(200,185,255,0.35)",
            boxShadow: "0 2px 8px rgba(108,92,231,0.05)",
          }}>
            <div style={{ fontSize: 18, marginBottom: 3 }}>{stat.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#6C5CE7" }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: "#B0A8D0", fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* SESSION BADGE */}
      <div className="session-badge">
        <strong>ID Sesi:</strong> <code>{sessionId}</code> — data tersimpan di MongoDB Atlas
      </div>

      <div style={{ height: 4, margin: "0 16px 20px", background: "linear-gradient(90deg, #EDE9FF, #E4DEFF, #EDE9FF)", borderRadius: 4 }} />

      <div style={{ padding: "0 16px 12px" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#4A3D7A" }}>➕ Masukkan Produk</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#B0A8D0" }}>Daftarkan produk baru untuk rutin perkembangannya.</p>
      </div>

      {/* NAMA BRAND */}
      <div className={`field-card ${shake ? "shake" : ""}`}>
        <div className="field-label">
          <span className="field-icon">🏷️</span> Nama Brand
        </div>
        <input
          className={`glow-input ${errors.brand ? "error" : ""}`}
          placeholder="Contoh: Somethinc, Skintific, Avoskin"
          value={brand}
          onChange={e => { setBrand(e.target.value); setErrors(p => ({ ...p, brand: "" })); }}
        />
        {errors.brand && <div className="error-msg">⚠ {errors.brand}</div>}
        {!errors.brand && !brand && (
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {BRAND_EXAMPLES.slice(0, 4).map(b => (
              <button key={b} onClick={() => setBrand(b)} style={{
                padding: "4px 10px", borderRadius: 20, border: "1px solid #EDE9FF",
                background: "#F9F7FF", fontSize: 11, color: "#8B7CC8",
                cursor: "pointer", fontWeight: 600, fontFamily: "Nunito, sans-serif",
              }}>{b}</button>
            ))}
          </div>
        )}
      </div>

      {/* NAMA PRODUK */}
      <div className="field-card">
        <div className="field-label">
          <span className="field-icon">🧪</span> Nama Produk
        </div>
        <input
          className={`glow-input ${errors.product ? "error" : ""}`}
          placeholder="Contoh: 5% Niacinamide Moisturizer"
          value={product}
          onChange={e => { setProduct(e.target.value); setErrors(p => ({ ...p, product: "" })); }}
        />
        {errors.product && <div className="error-msg">⚠ {errors.product}</div>}
      </div>

      {/* KATEGORI */}
      <div className="field-card">
        <div className="field-label">
          <span className="field-icon">📦</span> Kategori Produk
        </div>
        {errors.category && <div className="error-msg" style={{ marginBottom: 8 }}>⚠ {errors.category}</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              className="cat-chip"
              onClick={() => { setCategory(cat.label); setErrors(p => ({ ...p, category: "" })); }}
              style={{
                borderColor: category === cat.label ? cat.border : "#EDE9FF",
                background: category === cat.label ? cat.activeColor : cat.color,
                color: cat.text,
                minWidth: "calc(25% - 6px)",
                maxWidth: "calc(25% - 6px)",
              }}
            >
              <span className="cat-emoji">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* HARGA & CATATAN */}
      <div style={{ display: "flex", gap: 10, margin: "0 16px 12px" }}>
        <div style={{
          flex: 1, background: "white", borderRadius: 20, padding: "18px 16px",
          boxShadow: "0 2px 12px rgba(108,92,231,0.06)",
          border: "1px solid rgba(200,185,255,0.3)",
        }}>
          <div className="field-label" style={{ fontSize: 12 }}>
            <span className="field-icon" style={{ width: 28, height: 28, fontSize: 13 }}>💰</span> Harga Beli (Rp)
          </div>
          <input
            className="glow-input"
            type="number"
            placeholder="Contoh: 125000"
            value={price}
            onChange={e => setPrice(e.target.value)}
            style={{ fontSize: 13 }}
          />
          {price && (
            <div style={{ fontSize: 11, color: "#9B87E8", marginTop: 5, fontWeight: 600 }}>
              Rp {parseInt(price || 0).toLocaleString("id-ID")}
            </div>
          )}
        </div>

        <div style={{
          flex: 1, background: "white", borderRadius: 20, padding: "18px 16px",
          boxShadow: "0 2px 12px rgba(108,92,231,0.06)",
          border: "1px solid rgba(200,185,255,0.3)",
        }}>
          <div className="field-label" style={{ fontSize: 12 }}>
            <span className="field-icon" style={{ width: 28, height: 28, fontSize: 13 }}>📝</span> Catatan
          </div>
          <textarea
            className="glow-input"
            placeholder="Cocok di kulit, tidak menyebabkan breakout..."
            value={notes}
            maxLength={200}
            onChange={e => setNotes(e.target.value)}
            style={{ fontSize: 13, minHeight: 80 }}
          />
          <div className="char-count">{notes.length}/200</div>
        </div>
      </div>

      {/* DAFTAR PRODUK DARI MONGODB */}
      {products.length > 0 && (
        <div style={{ margin: "0 0 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9B91C0", padding: "0 16px 10px" }}>
            LEMARI KAMU ({products.length})
          </div>
          {products.slice(-3).reverse().map((p, i) => {
            const cat = CATEGORIES.find(c => c.label === p.kategori) || CATEGORIES[7];
            return (
              <div key={i} className="product-pill">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: cat.activeColor, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                }}>{cat.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2D205A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.brand} {p.nama_produk}
                  </div>
                  <div style={{ fontSize: 11, color: "#9B91C0" }}>
                    {p.kategori} {p.harga ? `· Rp ${parseInt(p.harga).toLocaleString("id-ID")}` : ""}
                  </div>
                </div>
                <div style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 20,
                  background: cat.color, color: cat.text, fontWeight: 700, border: `1px solid ${cat.border}`,
                }}>Aktif</div>
              </div>
            );
          })}
        </div>
      )}

      {/* TIPS BOX */}
      <div style={{
        margin: "0 16px 20px",
        background: "linear-gradient(135deg, #F0ECFF, #EDE8FD)",
        borderRadius: 20,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        border: "1px solid rgba(155,135,232,0.2)",
      }}>
        <div style={{ fontSize: 32, flexShrink: 0 }}>📋</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#6C5CE7", marginBottom: 4 }}>💡 Tips</div>
          <div style={{ fontSize: 12, color: "#7A6CAA", lineHeight: 1.5 }}>
            Catat produkmu secara rutin untuk melihat perkembangan kulitmu lebih mudah ✨
          </div>
        </div>
      </div>

      {/* TOMBOL SIMPAN */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(to top, rgba(245,240,255,1) 70%, rgba(245,240,255,0))",
        padding: "20px 0 28px",
      }}>
        <button
          className={`save-btn ${saveStatus === "success" ? "success" : saveStatus === "error" ? "error-btn" : saveStatus === "loading" ? "loading" : ""}`}
          onClick={handleSave}
          disabled={saveStatus === "loading" || saveStatus === "success"}
        >
          {saveStatus === "loading" && <><div className="spinner" /> Menyimpan...</>}
          {saveStatus === "success" && <><span style={{ fontSize: 20 }}>✅</span> {saveMsg}</>}
          {saveStatus === "error" && <><span style={{ fontSize: 20 }}>❌</span> {saveMsg}</>}
          {saveStatus === "idle" && <><span style={{ fontSize: 20 }}>💾</span> Simpan Produk <span style={{ fontSize: 18, opacity: 0.7 }}>✨</span></>}
        </button>
      </div>
    </div>
  );
}
