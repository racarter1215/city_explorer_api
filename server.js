'use strict'

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());



app.get('/location', (request, response) => {
        const city = request.query.city;
        const key = process.env.GEOCODE_API_KEY;
        // console.log('hi');
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        // console.log('Hi');
        superagent.get(url) 
        // console.log('hi')
            .then(locationResponse => {
                const data = locationResponse.body;
                // console.log('hi', data);
                for (var i in data) {
                    if (data[i].display_name[0].search(city)) {
                        const location = new Location(city, data[i]);
                        // console.log(location)
                        response.send(location);
                        
                    }
                }
            }).catch(error => {
            handleError(error, response);
        });
});


function Location(city, geo) {
    this.search_query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

app.get('/weather', (request, response) => {
    const { latitude, longitude} = request.query;
    const key = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${key}`
   
    superagent.get(url) 
        .then(weatherResponse => {
            const data = weatherResponse.body.data;
            const result = [];
            data.forEach(item => {
                result.push(new Weather(item.datetime, item.weather.description));
            })
            response.send(result);
        }).catch(error => {
        handleError(error, response);
    });
});

function Weather(date, forecast) {
    this.forecast = forecast;
    this.time = new Date(date).toDateString();
}

function handleError(error, response) {
    response.status(500).send(error);
  }

app.listen(PORT, () => {
//   console.log('Server is running on PORT: ' + PORT);
});

