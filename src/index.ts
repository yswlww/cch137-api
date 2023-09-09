import { config as dotenvConfig } from 'dotenv'
import { app, server } from './server';
import adminApis from './admin-apis';
import apis from './apis';
import ncuRouter from './ncu';

dotenvConfig()

app.use('/', apis)
app.use('/ncu/', ncuRouter)
app.use('/', adminApis)
app.use('*', (req, res) => res.status(404).end())

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is listening to http://localhost:${port}`);
});
