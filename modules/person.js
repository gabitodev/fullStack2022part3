const mongoose = require('mongoose');
const url = process.env.MONGO_URI;

mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.log('Error conencting to MongoDB:', error.message));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    validate: {
      validator: (v) => {
        return /\d{2,3}-/.test(v);
      },
    },
    required: true
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Person', personSchema);