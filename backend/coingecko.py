import requests

def cek_harga_koin():
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
        response.raise_for_status()
        data = response.json()
        harga_1_xlm = float(data.get("stellar", {}).get("idr", 0))
        harga_1_usdc = float(data.get("usd-coin", {}).get("idr", 0))
        print("\n=== Hasil Harga Unit (IDR) dari CoinGecko ===")
        print(f"1 XLM  = Rp {harga_1_xlm:,.2f}")
        print(f"1 USDC = Rp {harga_1_usdc:,.2f}")
    except requests.exceptions.RequestException as e:
        print("\n[!] Terjadi kesalahan saat menghubungi API CoinGecko:")
        print(e)

if __name__ == "__main__":
    cek_harga_koin()
