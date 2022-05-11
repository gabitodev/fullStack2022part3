const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors')
app.use(cors());
app.use(express.json());

morgan.token('body', (req) => {
  const person = req.body;
  return JSON.stringify(person);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', { skip: (request, response) => request.method !== 'POST'}));

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
];

const generateRamdomId = () => {
  const ramdomNumber = Math.floor(Math.random() * 1000);
  return ramdomNumber;
}

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body;
  const personExist = persons.some(person => person.name === name);
  if (!name || !number) {
    return response.status(400).json({
      error: 'name or number missing',
    });
  } else if (personExist) {
    return response.status(400).json({
      error: 'name must be unique',
    });
  }

  const person = {
    name,
    number,
    id: generateRamdomId()
  }

  persons = persons.concat(person);
  response.json(person);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    response.json(person);
  } else if (person === undefined) {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  response.status(204).end();
});


app.get('/api/info', (request, response) => {
  response.send(`
    <p>PhoneBook has info of ${persons.length} people</p>
    <p>${new Date()}</p>
  `);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});