import time
import urllib.parse
import hmac
import hashlib
import requests
import logging
import os
from dotenv import load_dotenv

# Konfigurasi Logging (Format waktu yang rapi sangat penting untuk monitoring)
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class IndodaxClient:
    def __init__(self, api_key: str, secret_key: str):
        self.api_key = api_key
        self.secret_key = secret_key.encode('utf-8')
        self.base_url = 'https://indodax.com/tapi'

    def _generate_signature(self, post_data_encoded: str) -> str:
        """Menghasilkan signature HMAC-SHA512 dari post data."""
        return hmac.new(
            self.secret_key, 
            post_data_encoded.encode('utf-8'), 
            hashlib.sha512
        ).hexdigest()

    def get_transaction_history(self) -> dict:
        """Memanggil API transHistory[cite: 464]."""
        payload = {
            'method': 'transHistory',
            'timestamp': int(time.time() * 1000)
        }
        post_data = urllib.parse.urlencode(payload)
        
        headers = {
            'Key': self.api_key,
            'Sign': self._generate_signature(post_data),
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        try:
            response = requests.post(self.base_url, headers=headers, data=post_data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Gagal memanggil API transHistory: {e}")
            return {"success": 0, "error": str(e)}

def monitor_realtime_deposit(client: IndodaxClient, target_coin: str, interval_seconds: int = 20):
    """
    Sistem polling untuk memantau deposit yang masuk.
    Akan menampilkan log status meskipun tidak ada transaksi baru.
    """
    logger.info(f"🚀 Memulai radar pemantauan deposit {target_coin.upper()}...")
    logger.info(f"Interval pengecekan: {interval_seconds} detik.")
    
    last_processed_time = 0
    
    while True:
        try:
            history = client.get_transaction_history()
            
            if history.get("success") == 1:
                all_deposits = history.get('return', {}).get('deposit', {})
                target_deposits = all_deposits.get(target_coin.lower(), [])
                
                if target_deposits:
                    latest_deposit = target_deposits[0]
                    current_success_time = int(latest_deposit.get('success_time', 0))
                    status = latest_deposit.get('status')
                    amount = latest_deposit.get('amount')
                    
                    # Deteksi jika ada deposit baru
                    if current_success_time > last_processed_time:
                        if last_processed_time != 0 and status == "success":
                            print("\n" + "💰" * 20)
                            print(f"🚨 [DEPOSIT BARU TERDETEKSI] 🚨")
                            print(f"Koin   : {target_coin.upper()}")
                            print(f"Jumlah : +{amount}")
                            print(f"Status : {status.upper()}")
                            print("💰" * 20 + "\n")
                            
                        # Perbarui memori waktu
                        last_processed_time = current_success_time
                    else:
                        # Log saat tidak ada transaksi baru yang masuk
                        logger.info(f"Pengecekan selesai. Belum ada deposit {target_coin.upper()} baru.")
                        
                else:
                    # Log saat histori koin tersebut memang masih kosong melompong
                    logger.info(f"Pengecekan selesai. Belum pernah ada riwayat deposit untuk {target_coin.upper()}.")
                    
            else:
                logger.error(f"Response Error: {history.get('error')}")
                
        except Exception as e:
            logger.error(f"Terjadi kesalahan sistem saat polling: {e}")
            
        # Jeda waktu (Polling interval)
        time.sleep(interval_seconds)

# ==========================================
# Alur Eksekusi Utama (Main Block)
# ==========================================
if __name__ == "__main__":
    load_dotenv()
    API_KEY = os.getenv("API_KEY")
    SECRET_KEY = os.getenv("SECRET_KEY")
    
    if not API_KEY or not SECRET_KEY:
        logger.error("API_KEY atau SECRET_KEY tidak ditemukan di environment/file .env!")
        exit(1)
        
    indodax = IndodaxClient(api_key=API_KEY, secret_key=SECRET_KEY)
    
    TARGET_COIN = 'xlm'
    
    # Jalankan worker
    monitor_realtime_deposit(
        client=indodax, 
        target_coin=TARGET_COIN, 
        interval_seconds=20 
    )