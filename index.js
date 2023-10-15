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


const newPerson = process.argv[3]
const newNumber = process.argv[4]
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
      tokens.method(req, res) === "POST" ? tokens.body(req) : null

    ].join(' ')
  })

app.use(customLogger)

const PORT = process.env.PORT || 3001

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const errorHandler = (error, request, response, next) => {
    console.log('You landed in the errorHandler method');
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    next(error)
}

app.get('/api/persons', (req,res) => {
    Person.find({}).then(person=>{
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
})

app.get('/api/persons/:id', (req, res, next) => {
    const personId = req.params.id
    Person.findById(personId)
    .then(result=>{
        if (result) {
            res.json(result)
        } else {
            res.status(404).end()
        }
    })
    .catch(error =>{
        console.log('You landed in the catch');
        next(error)
    }
        )
})

app.delete('/api/persons/:id', (req, res) => {
    const personId = req.params.id
    Person.findByIdAndDelete(personId).then(result=>res.status(204).end())
    res.status(204).end()
})

app.post('/api/persons',(req, res) => {
    const newName = req.body.name
    const newNumber = req.body.number
    if (newName && newNumber) {
        const newPerson = new Person({
            number: newNumber,
            name: newName
        })
        newPerson.save().then(savedPerson => {
            res.json(savedPerson)
        })
    } else {
        res.status(400).send("Name or number missing")
    }
})

app.put('/api/persons/:id', (req, res) => {
    const personId = req.params.id
    const newNumber = req.body.number
    Person.findByIdAndUpdate(personId, {number: newNumber}, {new: true})
        .then(result => {
            res.json(result)
        })
})

app.use(errorHandler)

app.listen(PORT, ()=> {
    console.log(`Now running on PORT ${PORT}`)
})