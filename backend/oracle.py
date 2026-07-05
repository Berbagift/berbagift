import requests

def cek_harga_koin():
    """
    Fungsi untuk mengecek harga koin menggunakan Pyth Network (Real Web3 Oracle).
    Pyth Network sangat populer di ekosistem DeFi (Solana, Ethereum, dsb) 
    untuk menarik harga on-chain secara terdesentralisasi.
    """
    # Endpoint Hermes Pyth v2
    url = "https://hermes.pyth.network/v2/updates/price/latest"
    
    # ID Harga (Price Feed IDs) dari Pyth Network:
    # XLM/USD  : 0xb7a8eba68a997cd0210c2e1e4ee811ad2d174b3611c22d9ebf16f4cb7e9ba850
    # USDC/USD : 0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a
    
    params = {
        "ids[]": [
            "0xb7a8eba68a997cd0210c2e1e4ee811ad2d174b3611c22d9ebf16f4cb7e9ba850",
            "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
        ],
        "parsed": "true"
    }

    try:
        print("Mengecek harga XLM dan USDC dari Web3 Oracle (Pyth Network)...")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json().get("parsed", [])
        
        harga_usd = {}
        for item in data:
            feed_id = item["id"]
            price_data = item["price"]
            
            # Rumus harga Pyth: price * 10^expo
            raw_price = int(price_data["price"])
            expo = int(price_data["expo"])
            actual_price = raw_price * (10 ** expo)
            
            harga_usd[feed_id] = actual_price

        # Mengambil hasil
        xlm_usd = harga_usd.get("b7a8eba68a997cd0210c2e1e4ee811ad2d174b3611c22d9ebf16f4cb7e9ba850", 0)
        usdc_usd = harga_usd.get("eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", 0)
        
        # Tarik Kurs USD ke IDR secara live dari Open Exchange Rate API
        print("Mengecek Kurs USD ke IDR hari ini...")
        res_kurs = requests.get("https://open.er-api.com/v6/latest/USD", timeout=5)
        res_kurs.raise_for_status()
        kurs_usd_idr = float(res_kurs.json().get("rates", {}).get("IDR", 16200))
        
        harga_1_xlm = xlm_usd * kurs_usd_idr
        harga_1_usdc = usdc_usd * kurs_usd_idr
        
        print("\n=== Hasil Harga Unit (USD & IDR) dari Pyth Oracle ===")
        print(f"Kurs 1 USD = Rp {kurs_usd_idr:,.2f}")
        print(f"1 XLM  = $ {xlm_usd:.4f}  (Rp {harga_1_xlm:,.2f})")
        print(f"1 USDC = $ {usdc_usd:.4f}  (Rp {harga_1_usdc:,.2f})")
        print("\n* Catatan: Harga USD ditarik langsung dari on-chain Oracle Pyth Network.")
        
    except requests.exceptions.RequestException as e:
        print("\n[!] Terjadi kesalahan saat menghubungi API:")
        print(e)

# ==========================================
# Cara Penggunaan
# ==========================================
if __name__ == "__main__":
    cek_harga_koin()
