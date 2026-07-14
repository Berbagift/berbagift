with open("redeploy_all.sh", "r") as f:
    content = f.read()

old_env = """update_env() {
  local FILE=$1
  sed -i "s/^SWAP_CONTRACT_ID=.*/SWAP_CONTRACT_ID=$SWAP_ID/" $FILE
  sed -i "s/^NEXT_PUBLIC_SWAP_CONTRACT_ID=.*/NEXT_PUBLIC_SWAP_CONTRACT_ID=$SWAP_ID/" $FILE
  
  sed -i "s/^NFT_GIFT_CONTRACT_ID=.*/NFT_GIFT_CONTRACT_ID=$NFT_ID/" $FILE
  sed -i "s/^NEXT_PUBLIC_NFT_GIFT_CONTRACT_ID=.*/NEXT_PUBLIC_NFT_GIFT_CONTRACT_ID=$NFT_ID/" $FILE
  
  sed -i "s/^MARKETPLACE_CONTRACT_ID=.*/MARKETPLACE_CONTRACT_ID=$MARKET_ID/" $FILE
  sed -i "s/^NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=.*/NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=$MARKET_ID/" $FILE
  
  sed -i "s/^MULTI_ROOM_CONTRACT_ID=.*/MULTI_ROOM_CONTRACT_ID=$ROOM_ID/" $FILE
  sed -i "s/^NEXT_PUBLIC_MULTI_ROOM_CONTRACT_ID=.*/NEXT_PUBLIC_MULTI_ROOM_CONTRACT_ID=$ROOM_ID/" $FILE

  sed -i "s/^TOKEN_REGISTRY_CONTRACT_ID=.*/TOKEN_REGISTRY_CONTRACT_ID=$REGISTRY_ID/" $FILE
  sed -i "s/^NEXT_PUBLIC_TOKEN_REGISTRY_CONTRACT_ID=.*/NEXT_PUBLIC_TOKEN_REGISTRY_CONTRACT_ID=$REGISTRY_ID/" $FILE
}"""

new_env = """update_env() {
  local FILE=$1
  for VAR in "SWAP_CONTRACT_ID=$SWAP_ID" \\
             "NEXT_PUBLIC_SWAP_CONTRACT_ID=$SWAP_ID" \\
             "NFT_GIFT_CONTRACT_ID=$NFT_ID" \\
             "NEXT_PUBLIC_NFT_GIFT_CONTRACT_ID=$NFT_ID" \\
             "MARKETPLACE_CONTRACT_ID=$MARKET_ID" \\
             "NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=$MARKET_ID" \\
             "MULTI_ROOM_CONTRACT_ID=$ROOM_ID" \\
             "NEXT_PUBLIC_MULTI_ROOM_CONTRACT_ID=$ROOM_ID" \\
             "TOKEN_REGISTRY_CONTRACT_ID=$REGISTRY_ID" \\
             "NEXT_PUBLIC_TOKEN_REGISTRY_CONTRACT_ID=$REGISTRY_ID"; do
    local key=$(echo "$VAR" | cut -d= -f1)
    if grep -q "^$key=" "$FILE"; then
      sed -i "s/^$key=.*/$VAR/" "$FILE"
    else
      echo "$VAR" >> "$FILE"
    fi
  done
}"""

content = content.replace(old_env, new_env)

with open("redeploy_all.sh", "w") as f:
    f.write(content)

