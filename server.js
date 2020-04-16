'use strict'

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const app = express();
const dbClient = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;
app.use(cors());



app.get('/location', (request, response) => {
        const city = request.query.city;
        const key = process.env.GEOCODE_API_KEY;
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        superagent.get(url) 
            .then(locationResponse => {
                const data = locationResponse.body;
                for (var i in data) {
                    if (data[i].display_name[0].search(city)) {
                        const location = new Location(city, data[i]);
                        response.send(location);
                        
                    }
                }
            }).catch(error => {
            handleError(error, response);
        });
});

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
        handleError(error, request, response);
    });
});

function Weather(date, forecast) {
    this.forecast = forecast;
    this.time = new Date(date).toDateString();
}

app.get('/trails', (request, response) => {
    const { latitude, longitude} = request.query;
    const key = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${key}`
   
    superagent.get(url) 
        .then(trailResponse => {
            const data = trailResponse.body.trails;
            response.send(data.map(element => {
                return new Trails(element);
            }))
        }).catch(error => {
        handleError(error, request, response);
    });
});

function Location(city, geo) {
    this.search_query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

function Trails(trail) {
    this.name = trail.name;
    this.location = trail.location;
    this.length = trail.length;
    this.stars = trail.stars;
    this.star_votes = trail.starVotes;
    this.summary = trail.summary;
    this.trail_url = trail.url;
    this.conditions = trail.conditions;
    this.condition_date = trail.conditionDate;
    this.condition_time = trail.conditionTime;
}

function handleError(error, request, response) {
    response.status(500).send({status: 500, responseText: 'Sorry something went wrong'});
  }

app.use('*', (request, response) => response.send('Sorry that route does not exist'));

app.listen(PORT, () => {
  console.log('Server is running on PORT: ' + PORT);
});

