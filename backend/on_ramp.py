import time
import urllib.parse
import hmac
import hashlib
import requests
import logging
import uuid
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class IndodaxClient:
    def __init__(self, api_key: str, secret_key: str):
        self.api_key = api_key
        self.secret_key = secret_key.encode('utf-8')
        self.base_url = 'https://indodax.com/tapi'

    def _generate_signature(self, post_data_encoded: str) -> str:
        return hmac.new(
            self.secret_key, 
            post_data_encoded.encode('utf-8'), 
            hashlib.sha512
        ).hexdigest()

    def get_balance(self, currency: str) -> float:
        payload = {
            'method': 'getInfo',
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
            data = response.json()
            if data.get('success') == 1:
                balance_dict = data['return']['balance']
                key = 'id' if currency.lower() == 'idr' and 'id' in balance_dict else currency.lower()
                return float(balance_dict.get(key, 0.0))
            return 0.0
        except requests.exceptions.RequestException as e:
            logger.error(f"Gagal mengambil data saldo {currency.upper()}: {e}")
            return 0.0

    def get_current_price(self, pair: str) -> int:
        url = f"https://indodax.com/api/{pair}/ticker"
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            return int(data['ticker']['sell'])
        except requests.exceptions.RequestException as e:
            logger.error(f"Gagal mengambil harga pasar: {e}")
            return 0

    def buy_asset(self, pair: str, price: int, amount_idr: int) -> dict:
        payload = {
            'method': 'trade',
            'timestamp': int(time.time() * 1000), 
            'pair': pair,
            'type': 'buy',
            'price': price,
            'idr': amount_idr
        }
        post_data = urllib.parse.urlencode(payload)
        headers = {
            'Key': self.api_key,
            'Sign': self._generate_signature(post_data),
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        try:
            logger.info(f"Mengeksekusi trade {pair} di harga Rp{price} (Modal: Rp{amount_idr})...")
            response = requests.post(self.base_url, headers=headers, data=post_data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Gagal mengeksekusi trade: {e}")
            return {"success": 0, "error": str(e)}

    def withdraw_asset(self, currency: str, amount: float, request_id: str, address: str, memo: str = "") -> dict:
        if not address:
            raise ValueError("Alamat tujuan tidak boleh kosong! API Indodax mewajibkan parameter ini.")

        payload = {
            'method': 'withdrawCoin',
            'timestamp': int(time.time() * 1000),
            'currency': currency,
            'withdraw_address': address,
            'withdraw_amount': amount,
            'request_id': request_id 
        }
        if memo:
            payload['withdraw_memo'] = memo
        post_data = urllib.parse.urlencode(payload)
        headers = {
            'Key': self.api_key,
            'Sign': self._generate_signature(post_data),
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        try:
            logger.info(f"Meminta penarikan {amount} {currency.upper()} ke alamat: {address}...")
            response = requests.post(self.base_url, headers=headers, data=post_data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Gagal melakukan request withdraw: {e}")
            return {"success": 0, "error": str(e)}

if __name__ == "__main__":
    load_dotenv()
    API_KEY = os.getenv("API_KEY")
    SECRET_KEY = os.getenv("SECRET_KEY")
    if not API_KEY or not SECRET_KEY:
        logger.error("API_KEY atau SECRET_KEY tidak ditemukan di file .env!")
        exit(1)
    DO_WITHDRAW = True  
    TARGET_WALLET_ADDRESS = "GAW5AEJQHUO4LCTOSATVBAS2L4JTQHBGQXTEJKRPOMLZB7HALRTSN5TZ"
    TARGET_MEMO = "" 
    pair_target = 'xlm_idr'
    target_spend_idr = 11000 
    client = IndodaxClient(api_key=API_KEY, secret_key=SECRET_KEY)

    current_balance = client.get_balance('idr') 
    if current_balance < target_spend_idr:
        logger.error(f"Transaksi dibatalkan. Saldo (Rp{current_balance}) kurang dari target (Rp{target_spend_idr}).")
    else:
        current_ask_price = client.get_current_price(pair_target)
        if current_ask_price > 0:
            instant_buy_price = int(current_ask_price * 1.05) 
            hasil_trade = client.buy_asset(
                pair=pair_target, 
                price=instant_buy_price, 
                amount_idr=target_spend_idr
            )
            if hasil_trade.get("success") == 1:
                order_id = hasil_trade['return'].get('order_id', 'Unknown')
                logger.info(f"Order berhasil dikirim (Order ID: {order_id}). Menunggu settlement...")
                max_retries = 10
                actual_xlm_balance = 0.0
                for attempt in range(max_retries):
                    time.sleep(3)
                    actual_xlm_balance = client.get_balance('xlm')
                    if actual_xlm_balance > 0:
                        break
                    logger.info(f"Saldo belum masuk, mencoba lagi... ({attempt+1}/{max_retries})")
                if actual_xlm_balance > 0:
                    logger.info(f"Settlement Selesai! Saldo XLM aktual di dompet saat ini: {actual_xlm_balance}")
                    if DO_WITHDRAW:
                        logger.info("Parameter DO_WITHDRAW aktif. Memulai proses withdraw...")
                        my_request_id = f"wd-xlm-{uuid.uuid4().hex[:8]}"
                        hasil_wd = client.withdraw_asset(
                            currency='xlm',
                            amount=actual_xlm_balance,                                          
                            request_id=my_request_id,
                            address=TARGET_WALLET_ADDRESS,
                            memo=TARGET_MEMO
                        )
                        logger.info(f"=== RESPON WITHDRAW ===")
                        logger.info(hasil_wd)
                        if hasil_wd.get("success") == 1:
                            logger.info("Request withdraw berhasil dikirim! Menunggu verifikasi Callback URL.")
                        else:
                            logger.error(f"Gagal withdraw: {hasil_wd.get('error')}")
                    else:
                        logger.info("Parameter DO_WITHDRAW di-set False. XLM akan disimpan di dompet Indodax.")
                else:
                    logger.error("Saldo XLM masih 0 setelah ditunggu 3 detik. Pesanan kemungkinan berstatus Pending (Maker) di Order Book.")
                    logger.error("Silakan cek menu Open Orders di website Indodax.")
            else:
                logger.error(f"Trade gagal: {hasil_trade.get('error')}")
        else:
            logger.error("Gagal mendapatkan ticker harga pasar.")