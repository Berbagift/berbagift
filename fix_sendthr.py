with open("frontend/components/sendthr/sendthr-module.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "import { TOKENS } from '@/lib/data/tokens';",
    "import { useRegistryTokens } from '@/hooks/use-registry-tokens';"
)
content = content.replace(
    "const activeSymbol = state.activeToken.id;",
    "const { tokens, getToken } = useRegistryTokens();\n  const activeToken = getToken(state.tokenId);\n  const activeSymbol = activeToken.symbol;"
)
content = content.replace("state.activeToken.symbol", "activeToken.symbol")
content = content.replace("state.activeToken", "activeToken")

with open("frontend/components/sendthr/sendthr-module.tsx", "w") as f:
    f.write(content)
