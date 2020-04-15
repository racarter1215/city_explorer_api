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

// function handleLocation(request, response) {
//     const locationData = require('./data/geo.json');
//     const results = [];
//     const cityQuery = request.query.city;
//     for (var i in locationData) {
//         if (locationData[i].display_name.search(cityQuery)) {
//             const location = new Location(cityQuery, locationData[i]);
//             response.send(location);
//             return;
//         }
//     }
//     locationData.forEach(item => {
//         results.push(new Location(item.geo, item.city));
//     })
//     response.send(results);
// }

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

// function handleWeather(request, response) {
//     const weatherData = require('./data/darksky.json').data;

//     const results = [];
//     weatherData.forEach(item => {
//         results.push(new Weather(item.datetime, item.weather.description));
//     })
//     response.send(results);
// }

app.get('*',(request, response) => {
    response.status(404).send('Sorry, something is wrong');
})


// app.get('/location', handleLocation);
// app.get('/weather', handleWeather);
// app.use((request, response) => {
//     handleError('You had an error', request, response);
// });

app.listen(PORT, () => {
  console.log('Server is running on PORT: ' + PORT);
});
