import app from "./app";
import { env } from "./config/env";

const port = env.PORT;

app.listen(port, () => {
  console.log(`[API] Cabañas Cordoba escuchando en http://localhost:${port}`);
});
