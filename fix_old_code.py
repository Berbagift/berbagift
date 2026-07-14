import re
with open("contracts/nft-gift-locked/src/lib.rs", "r") as f:
    content = f.read()

pattern = r"    /// Khusus mengirim RPK \(PaymentToken2\).*?pub fn send_batch_existing_gift"
content = re.sub(pattern, "    pub fn send_batch_existing_gift", content, flags=re.DOTALL)

with open("contracts/nft-gift-locked/src/lib.rs", "w") as f:
    f.write(content)
