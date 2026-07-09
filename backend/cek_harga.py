import requests

def cek_persentase_token(koin="xlm_idr"):
    url = "https://indodax.com/api/summaries"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        # 1. Ambil Harga Saat Ini (key menggunakan underscore, cth: xlm_idr)
        harga_sekarang = float(data['tickers'][koin]['last'])
        
        # 2. Ambil Harga 24 Jam Lalu (key tanpa underscore, cth: xlmidr)
        koin_tanpa_underscore = koin.replace('_', '')
        harga_24j_lalu = float(data['prices_24h'][koin_tanpa_underscore])
        
        # 3. Hitung Persentase
        persentase = ((harga_sekarang - harga_24j_lalu) / harga_24j_lalu) * 100
        
        # Format output
        simbol = "📈 Naik" if persentase > 0 else "📉 Turun"
        
        print(f"=== Status {koin.upper()} ===")
        print(f"Harga 24j Lalu : Rp {harga_24j_lalu:,.0f}")
        print(f"Harga Sekarang : Rp {harga_sekarang:,.0f}")
        print(f"Perubahan      : {simbol} {abs(persentase):.2f}%")
        print("-" * 25)
        
    except requests.exceptions.RequestException as e:
        print(f"Gagal mengambil data dari Indodax: {e}")
    except KeyError:
        print(f"Koin '{koin}' tidak ditemukan. Pastikan format benar (cth: 'xlm_idr').")

if __name__ == "__main__":
    # Uji coba dengan token incaranmu
    cek_persentase_token("xlm_idr")