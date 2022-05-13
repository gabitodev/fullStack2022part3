require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./modules/person');
app.use(express.static('build'));
app.use(express.json());
app.use(cors());

morgan.token('body', (req) => {
  const person = req.body;
  return JSON.stringify(person);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => response.json(persons));
});

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;
  const person = new Person({
    name: name,
    number: number
  });
  person.save()
    .then(savedPerson => {
    response.json(savedPerson);
    })
    .catch(error => next(error))
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  })
  .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;
  
  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  ) 
    .then(updatedNote => {
      if (!updatedNote) response.status(404).end();
        response.json(updatedNote)
    })
    .catch(error => next(error))
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(result => {
    response.status(204).end();
  })
  .catch(error => next(error));
});

app.get('/api/info', (request, response) => {
  Person.find({}).then(persons => response.send(
    `
    <p>PhoneBook has info of ${persons.length} people</p>
    <p>${new Date()}</p>
    `
    ));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
}
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError') {
    return response.status(400).json({ error: error.message })
  }
  next(error);
}
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});