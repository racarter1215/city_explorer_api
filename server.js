'use strict'

require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

app.get('/location', (request, response) => {
    try {
        let city = request.query.city;
        let geo = require('./data/geo.json');
        let location = new Location(geo[0], city)
        response.send(location);
    }
    catch(err) {
        response.status(500).send(err)
    }
})

function Location(geo, city) {
    this.search_query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

app.get('/weather', (request, response) => {
    let city = request.query.search_query;
    let formatted_query = request.query.formatted_query;
    let latitude = request.query.latitude;
    let longitude = request.query.longitude;
    let weather = require('./data/darksky.json');
    let weatherArray = weather.daily.data;
    const finalWeatherArray = weatherArray.map(day => {
        return new Weather(day);
    })
    response.send(finalWeatherArray);
})

function Weather(obj) {
    this.forecast = obj.summary;
    this.time = new Date(obj.time * 1000).toDateString();
}

app.get('*',(request, response) => {
    response.status(404).send('Sorry, something is wrong');
})

app.listen(PORT, () => {
  console.log('Server is running on PORT: ' + PORT);
});
