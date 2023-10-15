const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person.js')

const mongoose = require('mongoose')

const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)

morgan.token('body', (req) => {
  return(JSON.stringify(req.body))
})

const customLogger = morgan((tokens, req, res) => {

  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.method(req, res) === 'POST' ? tokens.body(req) : null

  ].join(' ')
})

app.use(customLogger)

const PORT = process.env.PORT || 3001

const errorHandler = (error, request, response, next) => {
  console.log('You landed in the errorHandler method')
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    console.log('Entered validation error')
    return response.status(400).send({ error: error.message })
  }
  next(error)
}

app.get('/api/persons', (req,res) => {
  Person.find({}).then(person => {
    res.json(person)
  })
})

app.get('/info', (req, res) => {
  const now = new Date()
  Person.find({})
    .then(result => {
      res.send(`<p>Phonebook has info for ${result.length} people</p> <br/>
            ${now}`)
    })
}   )

app.get('/api/persons/:id', (req, res, next) => {
  const personId = req.params.id
  Person.findById(personId)
    .then(result => {
      if (result) {
        res.json(result)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      console.log('You landed in the catch')
      next(error)
    }
    )
})

app.delete('/api/persons/:id', (req, res) => {
  const personId = req.params.id
  Person.findByIdAndDelete(personId).then(() => res.status(204).end())
  res.status(204).end()
})

app.post('/api/persons',(req, res, next) => {
  const newName = req.body.name
  const newNumber = req.body.number
  if (newName && newNumber) {
    const newPerson = new Person({
      number: newNumber,
      name: newName
    })
    newPerson.save()
      .then(savedPerson => {
        res.json(savedPerson)
      })
      .catch(error => next(error))
  } else {
    res.status(400).send('Name or number missing')
  }

})

app.put('/api/persons/:id', (req, res) => {
  const personId = req.params.id
  const newNumber = req.body.number
  Person.findByIdAndUpdate(personId, { number: newNumber }, { new: true, runValidators: true, context: 'query' })
    .then(result => {
      res.json(result)
    })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Now running on PORT ${PORT}`)
})