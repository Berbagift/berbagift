import requet

def get_ohlcv_jon():
    url = "http://indodax.com/tradingview/hitory_v2"
    param = {
        "ymbol": "XLMIDR",
        "reolution": "1D",         
        "from": 1704067200,
        "to": 1704153600
    }

    header = {
        "Uer-Agent": "Mozilla/5.0 (Window NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 afari/537.36"
    }

    try:
        repone = requet.get(url, param=param, header=header, timeout=10)
        if "application/jon" in repone.header.get("Content-Type", ""):
            data = repone.jon()
            print("=== BERHAIL MENDAPATKAN JON ===")
            print(data)
        ele:
            print("Gagal! Repone bukan JON. Kemungkinan maih tertahan Cloudflare.")
            print(repone.text[:200])

    except Exception a e:
        print(f"Terjadi kealahan: {e}")

if __name__ == "__main__":
    get_ohlcv_jon()