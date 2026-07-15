#!/bin/bash
set -e

echo "=========================================="
echo "Resetting Databases (MySQL & MongoDB)"
echo "=========================================="

echo "1. Dropping and recreating MySQL database 'bagithr'..."
podman exec mysql-1 mysql -uroot -p1234567890 -e "DROP DATABASE IF EXISTS bagithr; CREATE DATABASE bagithr;"

echo "2. Running Alembic migrations for MySQL..."
cd backend
source venv/bin/activate
alembic upgrade head
deactivate
cd ..

echo "3. Dropping MongoDB database 'bagithr_indexer'..."
podman exec mongo-1 mongosh --eval "db.getSiblingDB('bagithr_indexer').dropDatabase()"


echo "=========================================="
echo "Deploying Smart Contracts"
echo "=========================================="

ADMIN="GDPBGSCHXLHN3SRVBELCYRKJ7WUIES222RNNJT3ACK3DAMQ5LSHJ7ZIY"
XLM="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
RPK="CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ"

echo "Building contracts..."
stellar contract build

echo "Funding user_1..."
USER1_ADDR=$(stellar keys address user_1)
curl -s "https://friendbot.stellar.org?addr=$USER1_ADDR" || true

echo "Deploying Token Registry..."
REGISTRY_ID=$(stellar contract deploy --wasm target/wasm32v1-none/release/token_registry.wasm --source user_1 --network testnet | grep -v 'A new release' | grep -v 'Warning' | tail -n 1)
echo "REGISTRY_ID=$REGISTRY_ID"
stellar contract invoke --id $REGISTRY_ID --source user_1 --network testnet -- initialize --admin $ADMIN

echo "Adding XLM and RPK to Token Registry..."
stellar contract invoke --id $REGISTRY_ID --source user_1 --network testnet -- add_token --admin $ADMIN --token $XLM
stellar contract invoke --id $REGISTRY_ID --source user_1 --network testnet -- add_token --admin $ADMIN --token $RPK

echo "Deploying Token Swap..."
SWAP_ID=$(stellar contract deploy --wasm target/wasm32v1-none/release/token_swap.wasm --source user_1 --network testnet | grep -v 'A new release' | grep -v 'Warning' | tail -n 1)
echo "SWAP_ID=$SWAP_ID"
stellar contract invoke --id $SWAP_ID --source user_1 --network testnet -- initialize --base_token $XLM --token_registry $REGISTRY_ID --platform_wallet $ADMIN

echo "Funding admin wallet (XLM)..."
curl -s "https://friendbot.stellar.org?addr=$ADMIN" > /dev/null || true

echo "Checking XLM balance..."
MIN_XLM=5000000000  # 500 XLM minimum
XLM_BAL_RAW=$(stellar contract invoke --id $XLM --source user_1 --network testnet -- balance --id $ADMIN | grep -v 'A new release' | grep -v 'Warning' | tail -n 1 | tr -d '"')
echo "Current XLM Balance (stroops): $XLM_BAL_RAW"

while [ "$XLM_BAL_RAW" -lt "$MIN_XLM" ]; do
    echo "XLM balance too low ($XLM_BAL_RAW < $MIN_XLM). Requesting more from friendbot..."
    curl -s "https://friendbot.stellar.org?addr=$ADMIN" > /dev/null || true
    sleep 2
    XLM_BAL_RAW=$(stellar contract invoke --id $XLM --source user_1 --network testnet -- balance --id $ADMIN | grep -v 'A new release' | grep -v 'Warning' | tail -n 1 | tr -d '"')
    echo "Updated XLM Balance (stroops): $XLM_BAL_RAW"
done

echo "Checking RPK balance..."
RPK_BAL_RAW=$(stellar contract invoke --id $RPK --source user_1 --network testnet -- balance --id $ADMIN | grep -v 'A new release' | grep -v 'Warning' | tail -n 1 | tr -d '"')
echo "Current RPK Balance (stroops): $RPK_BAL_RAW"

XLM_50=$(( XLM_BAL_RAW / 2 ))
RPK_50=$(( RPK_BAL_RAW / 2 ))

echo "Depositing 50% liquidity: $XLM_50 XLM stroops and $RPK_50 RPK stroops..."
stellar contract invoke --id $SWAP_ID --source user_1 --network testnet -- add_liquidity --provider $ADMIN --token $RPK --base_token_amount $XLM_50 --token_amount $RPK_50

echo "Deploying Marketplace..."
MARKET_ID=$(stellar contract deploy --wasm target/wasm32v1-none/release/marketplace.wasm --source user_1 --network testnet | grep -v 'A new release' | grep -v 'Warning' | tail -n 1)
echo "MARKET_ID=$MARKET_ID"

echo "Deploying NFT Gift..."
NFT_ID=$(stellar contract deploy --wasm target/wasm32v1-none/release/nft_gift_locked.wasm --source user_1 --network testnet | grep -v 'A new release' | grep -v 'Warning' | tail -n 1)
echo "NFT_ID=$NFT_ID"

echo "Initializing Marketplace..."
stellar contract invoke --id $MARKET_ID --source user_1 --network testnet -- initialize --nft_contract $NFT_ID --registry_contract $REGISTRY_ID

echo "Initializing NFT Gift..."
stellar contract invoke --id $NFT_ID --source user_1 --network testnet -- initialize --registry_contract $REGISTRY_ID --admin_address $ADMIN

echo "Linking NFT Gift to Marketplace..."
stellar contract invoke --id $NFT_ID --source user_1 --network testnet -- set_marketplace_address --admin $ADMIN --marketplace $MARKET_ID

echo "Deploying Multi Room Auto Draw..."
ROOM_ID=$(stellar contract deploy --wasm target/wasm32v1-none/release/multi_room_auto_draw.wasm --source user_1 --network testnet | grep -v 'A new release' | grep -v 'Warning' | tail -n 1)
echo "ROOM_ID=$ROOM_ID"
stellar contract invoke --id $ROOM_ID --source user_1 --network testnet -- initialize --platform_wallet $ADMIN --token_registry $REGISTRY_ID


echo "=========================================="
echo "Updating Environment Variables"
echo "=========================================="

update_env() {
  local FILE=$1
  for VAR in "SWAP_CONTRACT_ID=$SWAP_ID" \
             "NEXT_PUBLIC_SWAP_CONTRACT_ID=$SWAP_ID" \
             "NFT_GIFT_CONTRACT_ID=$NFT_ID" \
             "NEXT_PUBLIC_NFT_GIFT_CONTRACT_ID=$NFT_ID" \
             "MARKETPLACE_CONTRACT_ID=$MARKET_ID" \
             "NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=$MARKET_ID" \
             "MULTI_ROOM_CONTRACT_ID=$ROOM_ID" \
             "NEXT_PUBLIC_MULTI_ROOM_CONTRACT_ID=$ROOM_ID" \
             "TOKEN_REGISTRY_CONTRACT_ID=$REGISTRY_ID" \
             "NEXT_PUBLIC_TOKEN_REGISTRY_CONTRACT_ID=$REGISTRY_ID"; do
    local key=$(echo "$VAR" | cut -d= -f1)
    if grep -q "^$key=" "$FILE"; then
      sed -i "s/^$key=.*/$VAR/" "$FILE"
    else
      echo "$VAR" >> "$FILE"
    fi
  done
}

update_env backend/.env
update_env frontend/.env

echo "All done! Databases cleared, contracts deployed, and .env files updated."
