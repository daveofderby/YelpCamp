const express = require('express');
const path = require('path')
const mongoose =require('mongoose');
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected")
})

const app = express();

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.listen(3000, ()=>{
    console.log("Serving on port 3000")
});

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    console.log(campgrounds)
    res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    console.log(campground)
    res.render('campgrounds/show', { campground })
})

// app.get('/makecampground', async (req, res) => {
//     await Campground.deleteMany({})
//     const camp = new Campground ({
//         title: 'My Backyard', 
//         description: 'The garden behind my house'
//     });
//     await camp.save();
//     res.send(camp)
// })