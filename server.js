const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//MongoDB config
const db = process.env.MONGO_URI;
const port = process.env.PORT || 5000;

//Create Schema
const PokemonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    md5 : [{type: String}]
});

Pokemon =  mongoose.model('pokemon', PokemonSchema);

//Mongoose connection
mongoose
    .connect(db)
    .then(() => {
        console.log('MongoDB Connected...');
    })
    .catch(err => console.log(err));

const app = express();

//body-parser Middleware
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }))

//@route    GET api/pokemons
//@desc     Get all Pokemons
//@access   Public
app.get('/', (req, res) => {
    Pokemon.find()
        .then(pokes => res.json(pokes))
        .catch(err => console.log(err));
});

//@route    GET api/pokemons/name/:name
//@desc     Get Pokemon by name
//@access   Public
app.get('/name/:name', (req, res) => {
    Pokemon.find({name: req.params.name})
        .then(pokes => res.json(pokes))
        .catch(err => console.log(err));
});

//@route    GET api/pokemons/md5/:md5
//@desc     Get Pokemon by md5
//@access   Public
app.get('/md5/:md5', (req, res) => {
    Pokemon.find({md5: req.params.md5})
        .then(pokes => res.json(pokes))
        .catch(err => console.log(err));
});

//@route    DELETE api/pokemons/:id
//@desc     Delete a Pokemon by ID
//@access   Public
app.delete('/:id', (req, res) => {
    Pokemon.findById(req.params.id)
        .then(poke => poke.remove().then(() => res.json({success:true})))
        .catch(err => res.status(404).json({success: false}));
});

//@route    POST api/pokemons/:name
//@desc     Update a Pokemon by Name
//@access   Public
app.post('/', (req, res) => {
    Pokemon.find({name: req.body.name})
        .then(pokes => {

            if(pokes.length<1) {

                const newPokemon = new Pokemon({
                    name: req.body.name,
                    md5: req.body.md5
                });
            
                newPokemon.save()
                .then(poke => res.json(poke));

            }
            else
            {

            let id = pokes[0]._id;
            Pokemon.findById(id, function (err, poke) {

                if (err) return console.log(err);

                poke.md5.push(req.body.md5);

                poke.save(function (err, updatedPoke) {
                  if (err) return console.log(err);
                  res.send(updatedPoke);
                });

              });

            }

        })
        .catch(err => console.log(err));
});

app.use(express.static(__dirname + '/'));

app.listen(port, () => console.log('Server started on Port '+port+'!'));