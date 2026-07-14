import os

# Fix Cargo.toml
toml_path = "contracts/token-registry/Cargo.toml"
with open(toml_path, "r") as f:
    content = f.read()
content = content.replace("[dev_dependencies]", "[dev-dependencies]")
with open(toml_path, "w") as f:
    f.write(content)

# Add #![allow(deprecated)] and #![allow(unused_imports)] to the top of the lib.rs files
files_to_fix = [
    "contracts/token-registry/src/lib.rs",
    "contracts/nft-gift-locked/src/lib.rs",
    "contracts/marketplace/src/lib.rs",
]

for file_path in files_to_fix:
    with open(file_path, "r") as f:
        content = f.read()
    
    if "#![allow(deprecated)]" not in content:
        content = content.replace("#![no_std]", "#![no_std]\n#![allow(deprecated)]\n#![allow(unused_imports)]")
        with open(file_path, "w") as f:
            f.write(content)

