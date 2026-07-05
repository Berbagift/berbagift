from schemas.indodax import IndodaxCallbackPayload
import logging

logger = logging.getLogger(__name__)

async def validate_withdrawal_request(payload: IndodaxCallbackPayload) -> bool:
    """
    Logika untuk memvalidasi permintaan penarikan dari Indodax.
    """
    try:
        # CONTOH PENGECEKAN:
        # 1. Cek apakah request_id ini benar-benar ada di database kamu dan berstatus 'pending'.
        # 2. Cek apakah withdraw_currency dan withdraw_amount sesuai dengan catatan transaksi user.
        # 3. Cek apakah withdraw_address cocok.
        
        logger.info(f"Menerima validasi withdrawal: {payload.request_id} untuk {payload.withdraw_amount} {payload.withdraw_currency}")
        
        # Simulasi validasi sukses
        is_valid = True 
        
        if is_valid:
            # Update status di database menjadi 'processing' atau 'approved'
            return True
            
        return False
        
    except Exception as e:
        logger.error(f"Gagal memvalidasi callback Indodax: {e}")
        return False