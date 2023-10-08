const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

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
//app.use(morgan(':method :body'))
const PORT = 3001

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

app.get('/api/persons', (req,res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    const now = new Date()
        res.send(`<p>Phonebook has info for ${persons.length} people</p> <br/>
        ${now}`)
})

app.get('/api/persons/:id', (req, res) => {
    const personId = Number(req.params.id)
    const person = persons.find(person=>person.id===personId)
    if (person) {
        return res.json(person)
    }
    res.status(404).send(`Person with id ${personId} not found`)
})

app.delete('/api/persons/:id', (req, res) => {
    const personId = Number(req.params.id)
    persons = persons.filter(person=>person.id!==personId)
    res.status(204).end()
})

const createNewId = () => Math.floor(Math.random() * 100000)

app.post('/api/persons',(req, res) => {
    const newName = req.body.name
    const newNumber = req.body.number
    if (newName && newNumber) {
        if (persons.some(person=>person.name===newName)) {
            return res.status(403).send(`Person ${newName} already exists.`)
        }
        const newPerson = {
            id: createNewId(),
            number: newNumber,
            name: newName
        }
        persons = persons.concat(newPerson)
        res.json(newPerson)
    } else {
        res.status(400).send("Name or number missing")
    }
})

app.listen(PORT, ()=> {
    console.log(`Now running on PORT ${PORT}`)
})