from stellar_sdk.xdr import SCVal, SCSymbol
sym = SCSymbol(b"test")
print(dir(sym))
print(sym.sc_symbol)
