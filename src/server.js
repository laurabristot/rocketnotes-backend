require('express-async-errors')
require("dotenv/config")

const migrationsRun = require('./database/sqlite/migrations')
const AppError = require('./utils/AppError')
const uploadConfig = require('./configs/upload')


const express = require('express')
const routes = require('./routes')
const cors = require('cors')

const fs = require('fs');
const https = require('https');


migrationsRun()

app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://localhost:3000");
  next();
})

const credentials = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

const app = express()
// app.use(cors())
app.use(express.json())

app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER))

app.use(routes)

app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    })
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
})

const PORT = process.env.SERVER_PORT || 3000
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT, () => {
    console.log(`Back-end running on port ${PORT}`);
});
// app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))
