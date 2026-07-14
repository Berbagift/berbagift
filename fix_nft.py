import subprocess
out = subprocess.check_output(["git", "show", "HEAD:contracts/nft-gift-locked/src/lib.rs"])
with open("contracts/nft-gift-locked/src/lib.rs", "wb") as f:
    f.write(out)
