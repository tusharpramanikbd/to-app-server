const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bqe6s.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

async function run() {
  try {
    await client.connect()

    const taskCollection = client.db('todo_app').collection('tasks')

    app.post('/task', async (req, res) => {
      const task = req.body
      const result = await taskCollection.insertOne(task)
      return res.send({ success: true, result })
    })

    app.get('/task', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const tasks = await taskCollection.find(query).toArray()
      res.send(tasks)
    })
  } finally {
    // await client.close()
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
