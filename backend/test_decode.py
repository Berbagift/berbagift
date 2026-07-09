from stellar_sdk.xdr import SCVal

xdr_str = 'AAAACgAAAAAAAAAAAAAAAAAAAAA='
sc_val = SCVal.from_xdr(xdr_str)
if sc_val.i128 is not None:
    hi = sc_val.i128.hi.int64
    lo = sc_val.i128.lo.uint64
    val = (hi << 64) | lo
    print("Balance parsed:", val)
