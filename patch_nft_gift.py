import re

with open("frontend/lib/stellar/nft-gift.ts", "r") as f:
    content = f.read()

# Add constants
consts = """const NFT_GIFT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_NFT_GIFT_CONTRACT_ID ||
  "CAUZT6BVWEM7AI2GFW5PDWWMR7KZMMU3SIRGQ5CV5HZYHSN23N72BRAM";

const XLM_CONTRACT = process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const RPK_CONTRACT = process.env.NEXT_PUBLIC_RPK_CONTRACT || "CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ";"""

content = re.sub(
    r'const NFT_GIFT_CONTRACT_ID =[\s\S]*?BRAM";',
    consts,
    content
)

# Update buildNftGiftTx signature
content = content.replace(
    "export async function buildNftGiftTx(\n  senderAddress: string,\n  recipients: NftGiftRecipient[]\n): Promise<string> {",
    "export async function buildNftGiftTx(\n  senderAddress: string,\n  tokenAddress: string,\n  recipients: NftGiftRecipient[]\n): Promise<string> {"
)

# Replace totalAmount logic with vector of i128 and add actualTokenAddress logic
old_amount_logic = """  const totalAmount = recipients.reduce((sum, r) => sum + toStroops(r.amount), BigInt(0));
  const tokenAmountScVal = StellarSdk.nativeToScVal(totalAmount, { type: "i128" });
  const isSplitScVal = StellarSdk.nativeToScVal(false, { type: "bool" });

  const functionName = "send_batch_xlm_and_nft";"""

new_amount_logic = """  let actualTokenAddress = tokenAddress;
  if (tokenAddress === "XLM") actualTokenAddress = XLM_CONTRACT;
  else if (tokenAddress === "RPK") actualTokenAddress = RPK_CONTRACT;
  
  const tokenScVal = new StellarSdk.Address(actualTokenAddress).toScVal();

  const tokenAmountsScVal = StellarSdk.xdr.ScVal.scvVec(
    recipients.map((r) => StellarSdk.nativeToScVal(toStroops(r.amount), { type: "i128" }))
  );

  const functionName = "send_batch_gift";"""

content = content.replace(old_amount_logic, new_amount_logic)

# Replace the contract call arguments
old_call = """      contract.call(
        functionName,
        senderScVal,
        recipientAddrs,
        tokenAmountScVal,
        isSplitScVal,
        tokenUris,
        messages
      )"""

new_call = """      contract.call(
        functionName,
        senderScVal,
        tokenScVal,
        recipientAddrs,
        tokenAmountsScVal,
        tokenUris,
        messages
      )"""

content = content.replace(old_call, new_call)


# Update buildForwardGiftTx signature
content = content.replace(
    "export async function buildForwardGiftTx(\n  senderAddress: string,\n  recipients: ForwardGiftRecipient[]\n): Promise<string> {",
    "export async function buildForwardGiftTx(\n  senderAddress: string,\n  tokenAddress: string,\n  recipients: ForwardGiftRecipient[]\n): Promise<string> {"
)

# Replace amount logic for forward
old_forward_amount_logic = """  const totalAmount = recipients.reduce((sum, r) => sum + toStroops(r.amount), BigInt(0));
  const tokenAmountScVal = StellarSdk.nativeToScVal(totalAmount, { type: "i128" });
  const isSplitScVal = StellarSdk.nativeToScVal(false, { type: "bool" });

  const messages = StellarSdk.nativeToScVal(
    recipients.map((r) => r.message),
    { type: "string" }
  );

  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();
  const functionName = "send_batch_existing_xlm_and_nft";"""

new_forward_amount_logic = """  let actualTokenAddress = tokenAddress;
  if (tokenAddress === "XLM") actualTokenAddress = XLM_CONTRACT;
  else if (tokenAddress === "RPK") actualTokenAddress = RPK_CONTRACT;
  
  const tokenScVal = new StellarSdk.Address(actualTokenAddress).toScVal();

  const tokenAmountsScVal = StellarSdk.xdr.ScVal.scvVec(
    recipients.map((r) => StellarSdk.nativeToScVal(toStroops(r.amount), { type: "i128" }))
  );

  const messages = StellarSdk.nativeToScVal(
    recipients.map((r) => r.message),
    { type: "string" }
  );

  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();
  const functionName = "send_batch_existing_gift";"""

content = content.replace(old_forward_amount_logic, new_forward_amount_logic)

# Replace the contract call arguments for forward
old_forward_call = """      contract.call(
        functionName,
        senderScVal,
        recipientAddrs,
        tokenAmountScVal,
        isSplitScVal,
        tokenIds,
        messages
      )"""

new_forward_call = """      contract.call(
        functionName,
        senderScVal,
        tokenScVal,
        recipientAddrs,
        tokenIds,
        tokenAmountsScVal,
        messages
      )"""

content = content.replace(old_forward_call, new_forward_call)

with open("frontend/lib/stellar/nft-gift.ts", "w") as f:
    f.write(content)
