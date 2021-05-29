import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import axios from "axios";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cert = fs.readFileSync(
  path.resolve(__dirname, `../../certs/${process.env.GN_CERT}`)
);

const agent = new https.Agent({ pfx: cert, passphrase: "" });

const credentials = Buffer.from(
  `${process.env.GN_CLIENT_ID}:${process.env.GN_CLIENT_SECRET}`
).toString("base64");

const authenticate = () => {
  return axios({
    method: "POST",
    url: `${process.env.GN_END_POINT}/oauth/token`,
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    httpsAgent: agent,
    data: {
      grant_type: "client_credentials",
    },
  });
};

const GNRequest = async () => {
  const authResponse = await authenticate();
  const accessToken = authResponse.data?.access_token;

  //Cria uma instância do axios que poderá ser reutilizada nas chamadas
  return axios.create({
    baseURL: process.env.GN_END_POINT,
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
};

export { GNRequest };
