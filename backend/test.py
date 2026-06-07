from pydantic import BaseModel
class SignInRequest(BaseModel):
    signature: str

req = SignInRequest(signature={"0": 1, "1": 2})
print(req.signature)
