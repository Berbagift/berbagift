import requests

def cek_harga_koin():
    """
    Fungsi untuk mengecek harga koin menggunakan API CoinGecko (Oracle/Aggregator).
    CoinGecko mengambil rata-rata harga dari berbagai CEX dan DEX global.
    Sangat stabil dan tidak diblokir oleh ISP Indonesia.
    """
    # Endpoint CoinGecko untuk mendapatkan harga instan (Simple Price)
    # ids: stellar (XLM), usd-coin (USDC)
    # vs_currencies: idr (Rupiah)
    url = "https://api.coingecko.com/api/v3/simple/price"
    
    params = {
        "ids": "stellar,usd-coin",
        "vs_currencies": "idr"
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
    }

    try:
        print("Mengecek harga XLM dan USDC dari CoinGecko (Oracle)...")
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        # Jika ada error HTTP
        response.raise_for_status()
        
        data = response.json()
        
        # Parsing harga
        harga_1_xlm = float(data.get("stellar", {}).get("idr", 0))
        harga_1_usdc = float(data.get("usd-coin", {}).get("idr", 0))
        
        print("\n=== Hasil Harga Unit (IDR) dari CoinGecko ===")
        print(f"1 XLM  = Rp {harga_1_xlm:,.2f}")
        print(f"1 USDC = Rp {harga_1_usdc:,.2f}")
        
    except requests.exceptions.RequestException as e:
        print("\n[!] Terjadi kesalahan saat menghubungi API CoinGecko:")
        print(e)

# ==========================================
# Cara Penggunaan
# ==========================================
if __name__ == "__main__":
    cek_harga_koin()
