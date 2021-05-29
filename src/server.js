import express from "express";
import { GNRequest } from "./apis/gerencianet.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "src/views");

//cria a chamada da requisição de token para não ter a necessidade de buscar toda vez

const reqGNAlready = GNRequest();

app.get("/", async (req, res) => {
  const reqGN = await reqGNAlready;

  const dataCob = {
    calendario: {
      expiracao: 3600,
    },
    valor: {
      original: "0.10",
    },
    chave: "385d3e62-a259-4ec8-bcc4-fa91c4b1cd33",
    solicitacaoPagador: "Pagamento referente app PIX",
  };

  const cobResponse = await reqGN.post("/v2/cob", dataCob);
  const qrCodeResponse = await reqGN.get(
    `/v2/loc/${cobResponse.data.loc.id}/qrCode`
  );

  res.render("qrcode", { qrCodeImage: qrCodeResponse.data.imagemQrcode });
});

app.get("/cobrancas", async (req, res) => {
  const reqGN = await reqGNAlready;

  const cobResponse = await reqGN.get(
    "/v2/cob?inicio=2021-05-01T16:01:35Z&fim=2021-05-27T20:10:00Z"
  );

  res.send(cobResponse.data);
});

app.post("/webhook(/pix)?", (req, res) => {
  console.log(req.body);
  res.send("200");
});

app.listen(8000, () => {
  console.log("running");
});
