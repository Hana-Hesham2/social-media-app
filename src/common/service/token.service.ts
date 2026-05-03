import jwt, { JwtPayload, PrivateKey, Secret } from "jsonwebtoken";

class TokenService {
  constructor (){ }
  GenerateToken = ({ payload, secret_key, options = {} } : {
    payload: object;
    secret_key: Secret;
    options?: jwt.SignOptions;
}): string => {
  return jwt.sign(payload, secret_key, options);
};

    
 VerifyToken = ({ token, secret_key, options = {} } : {
    token: string;
    secret_key: Secret;
    options?: jwt.VerifyOptions;
}) => {
  return jwt.verify(token, secret_key, options);
};
 DecodeToken = (token: string): JwtPayload | null => {
    return jwt.decode(token) as JwtPayload;
  };
}
export default new TokenService();