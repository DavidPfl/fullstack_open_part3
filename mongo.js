const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const newPerson = process.argv[3]
const newNumber = process.argv[4]

const url = `mongodb+srv://pflaegingd:${password}@cluster0.jwpa9c4.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person =  mongoose.model('Person', personSchema)

const person = new Person({
    name: newPerson,
    number: newNumber,
})
if (newPerson) {
    person.save().then(result => {
        console.log(result);
        console.log(`added ${newPerson} number ${newNumber} to phonebook`)
        mongoose.connection.close()
    })
} else {
    Person.find({}).then(result => {
        result.forEach(person=>{
            console.log(person);
        })
        mongoose.connection.close()
    })
}

// Note.find({}).then(result=>{
//     result.forEach(note=>{
//         console.log(note);
//     })
//     mongoose.connection.close()
// })