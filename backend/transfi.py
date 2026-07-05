import requests
import base64

def cek_harga_koin(merchant_id, username, password):
    """
    Fungsi untuk mengecek harga koin menggunakan API TransFi Sandbox.
    Menggunakan trik jumlah besar (100.000 IDR dan 100 USDC) 
    untuk menembus batas Minimum Order TransFi.
    """
    
    # 1. Otomatis ubah Username & Password jadi Base64 Token
    kredensial = f"{username}:{password}"
    auth_token = base64.b64encode(kredensial.encode('utf-8')).decode('utf-8')
    
    # 2. URL Endpoint Sandbox
    url = "https://sandbox-api.transfi.com/v3/exchange-rates"
    
    headers = {
        "mid": merchant_id,
        "Authorization": f"Basic {auth_token}",
        "Accept": "application/json"
    }

    try:
        # Cek harga XLM (menggunakan payin IDR -> XLM)
        print("Mengecek harga XLM...")
        params_xlm = {
            "sourceCurrency": "IDR",
            "destinationCurrency": "XLM",
            "amount": 100000,
            "direction": "forward",
            "orderType": "payin"
        }
        res_xlm = requests.get(url, headers=headers, params=params_xlm)
        res_xlm.raise_for_status()
        
        # Cek harga USDC (menggunakan payout USDC -> IDR)
        print("Mengecek harga USDC...")
        params_usdc = {
            "sourceCurrency": "USDC",
            "destinationCurrency": "IDR",
            "amount": 100,
            "direction": "forward",
            "orderType": "payout"
        }
        res_usdc = requests.get(url, headers=headers, params=params_usdc)
        res_usdc.raise_for_status()
        
        # Kalkulasi
        rate_xlm = res_xlm.json().get("conversionRate")
        rate_usdc = res_usdc.json().get("conversionRate")
        
        harga_1_xlm = 1.0 / rate_xlm if rate_xlm else 0
        harga_1_usdc = 1.0 / rate_usdc if rate_usdc else 0
        
        print("\n=== Hasil Harga Unit (IDR) dari TransFi ===")
        print(f"1 XLM  = Rp {harga_1_xlm:,.2f}")
        print(f"1 USDC = Rp {harga_1_usdc:,.2f}")
        
    except requests.exceptions.RequestException as e:
        print("\n[!] Terjadi kesalahan saat menghubungi API TransFi:")
        print(e)
        if hasattr(e, 'response') and e.response is not None:
            print("Detail Error:", e.response.text)

# ==========================================
# Cara Penggunaan
# ==========================================
if __name__ == "__main__":
    MY_MERCHANT_ID = "PIIWY2_NA_NA"           
    API_USERNAME = "ptpowernetindosolusi"  
    API_PASSWORD = "vrsKbxhqHljwuA"  
    
    cek_harga_koin(MY_MERCHANT_ID, API_USERNAME, API_PASSWORD)