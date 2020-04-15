'use strict'

require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');


function Location(geo, city) {
    this.search_query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

function handleLocation(request, response) {
    const locationData = require('./data/geo.json');
    const results = [];
    const cityQuery = request.query.city;
    for (var i in locationData) {
        if (locationData[i].display_name.search(cityQuery)) {
            const location = new Location(cityQuery, locationData[i]);
            response.send(location);
            return;
        }
    }
    locationData.forEach(item => {
        results.push(new Location(item.geo, item.city));
    })
    response.send(results);
}

// app.get('/location', (request, response) => {
//     let city = request.query.city || 'Lynnwood';
//     let geo = require('./data/geo.json');
//     let location = new Location(geo[0], city)
//     if (location) {
//         response.status(200).send(location);
//     } else {
//         response.status(404).send('Cant find your city');
//     } console.log(location);
// });

function Forecast(forecast, date) {
    this.forecast = forecast;
    this.date = new Date(date);
}

function handleWeather(request, response) {
    const weatherData = require('./data/darksky.json').data;

    const results = [];
    weatherData.forEach(item => {
        results.push(new Forecast(item.datetime, item.weather.description));
    })
    response.send(results);
}

function handleError(error, request, response) {
    response.send(500).send({
    status: 500,
    responseText: "Sorry, something went wrong",
    });
}

app.use(cors());
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.use((request, response) => {
    handleError('You had an error', request, response);
});

app.listen(PORT, () => {
  console.log('Server is running on PORT: ' + PORT);
});
