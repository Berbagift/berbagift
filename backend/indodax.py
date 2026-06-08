import requests

def cek_harga_koin():
    """
    Fungsi untuk mengecek harga koin menggunakan API Publik Indodax.
    Indodax tidak memerlukan API Key/Secret untuk endpoint tickers publik.
    """
    url = "https://indodax.com/api/tickers"
    
    # Menambahkan User-Agent agar tidak diblokir oleh sistem keamanan Indodax
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }

    try:
        print("Mengecek harga XLM dan USDC dari Indodax...")
        response = requests.get(url, headers=headers, timeout=10)
        
        # Jika ada error dari server (HTTP 4xx atau 5xx), ini akan memicu exception
        response.raise_for_status()
        
        data = response.json()
        tickers = data.get("tickers", {})
        
        # Mengambil harga "last" (harga perdagangan terakhir) dalam IDR
        harga_1_xlm = float(tickers.get("xlm_idr", {}).get("last", 0))
        harga_1_usdc = float(tickers.get("usdc_idr", {}).get("last", 0))
        
        print("\n=== Hasil Harga Unit (IDR) dari Indodax ===")
        print(f"1 XLM  = Rp {harga_1_xlm:,.2f}")
        print(f"1 USDC = Rp {harga_1_usdc:,.2f}")
        
    except requests.exceptions.RequestException as e:
        print("\n[!] Terjadi kesalahan saat menghubungi API Indodax:")
        print(e)

# ==========================================
# Cara Penggunaan
# ==========================================
if __name__ == "__main__":
    cek_harga_koin()
