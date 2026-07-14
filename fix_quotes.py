with open("contracts/nft-gift-locked/src/lib.rs", "r") as f:
    content = f.read()

content = content.replace('\\"', '"')

with open("contracts/nft-gift-locked/src/lib.rs", "w") as f:
    f.write(content)
