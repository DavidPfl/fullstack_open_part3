const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to MongoDB')

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })


const numberValidator = [
  { validator: v => v.length>=8, message: 'bruh, too short' },
  { validator: v => /\d{2,3}-\d+$/.test(v), message: 'fam, be serious' }
]
const personSchema = new mongoose.Schema({
  name: {
    type:  String,
    minLength: 3
  },
  number: {
    type: String,
    validate: numberValidator
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)