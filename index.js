const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')
const jwt = require('jsonwebtoken')
const ObjectId = require('mongodb').ObjectId
const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// JWT token verification function
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access' })
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' })
    }
    req.decoded = decoded
  })
  next()
}

// Database Connection
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

    // Signin Auth
    app.post('/login', (req, res) => {
      const user = req.body
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      })
      res.send({ accessToken })
    })

    // Api endpoint
    app.get('/', (req, res) => {
      res.send('Hello World!')
    })

    app.post('/task', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email
      const email = req.query.email.toLowerCase()
      if (decodedEmail === email) {
        const task = req.body
        const result = await taskCollection.insertOne(task)
        return res.send({ success: true, result })
      } else {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
    })

    app.get('/task', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email
      const email = req.query.email
      if (decodedEmail === email) {
        const query = { email: email }
        const tasks = await taskCollection.find(query).toArray()
        res.send(tasks)
      } else {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
    })

    app.delete('/task/:id', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email
      const email = req.query.email
      if (decodedEmail === email) {
        const id = req.params.id
        const query = { _id: ObjectId(id) }
        const result = await taskCollection.deleteOne(query)
        res.send(result)
      } else {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
    })

    app.put('/task/:id', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email
      const email = req.query.email
      if (decodedEmail === email) {
        const id = req.params.id
        const updatedTask = req.body
        const filter = { _id: ObjectId(id) }
        const options = { upsert: true }
        const updatedDoc = {
          $set: {
            status: updatedTask.newStatus,
          },
        }
        const result = await taskCollection.updateOne(
          filter,
          updatedDoc,
          options
        )
        res.send(result)
      } else {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
    })
  } finally {
    // await client.close()
  }
}
run().catch(console.dir)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
