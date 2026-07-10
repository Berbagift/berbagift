import requests

def cek_harga_koin():
    url = "https://indodax.com/api/tickers"
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }

    try:
        print("Mengecek harga XLM dan USDC dari Indodax...")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        tickers = data.get("tickers", {})
        harga_1_xlm = float(tickers.get("xlm_idr", {}).get("last", 0))
        harga_1_usdc = float(tickers.get("usdc_idr", {}).get("last", 0))
        print("\n=== Hasil Harga Unit (IDR) dari Indodax ===")
        print(f"1 XLM  = Rp {harga_1_xlm:,.2f}")
        print(f"1 USDC = Rp {harga_1_usdc:,.2f}")
    except requests.exceptions.RequestException as e:
        print("\n[!] Terjadi kesalahan saat menghubungi API Indodax:")
        print(e)

if __name__ == "__main__":
    cek_harga_koin()
