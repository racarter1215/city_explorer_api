'use strict'

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const dbClient = new pg.Client(process.env.DATABASE_URL);
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

dbClient.connect(error => {
    if (error) {
        console.error('connection to database error', error.stack)
    } else {
        console.log('connected to database')
    }
});

function searchLocation (request, response) {
        const cityQuery = request.query.city;
        const key = process.env.GEOCODE_API_KEY;
        const locationUrl = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityQuery}&format=json`;
        let sql = `SELECT * FROM locations WHERE search_query=$1;`;
        let searchValues = [cityQuery];
        
        dbClient.query(sql, searchValues)
            .then(record => {
                // console.log('this is console logging record', record);
                if (record.rows[0]) {
                    console.log('this is console logging record.rows');
                    response.status(200).send(record.rows[0]);
                } else {
                    // console.log('this is the beginning of the else statement');
                    superagent.get(locationUrl)
                    .then(locationResponse => {
                        // console.log('this is getting into the .then statement');
                        // console.log(locationResponse.body);
                        let location =  new Location(cityQuery, locationResponse.body[0]);
                        let sqlInsert = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;
                        let searchValues = [cityQuery, location.formatted_query, location.latitude, location.longitude];
                        dbClient.query(sqlInsert, searchValues);
                         response.status(200).send(location);
                        
                }).catch(error => {
                    // console.log('error handler 1');
                    handleError(error, request, response);
                    });
                }
            }).catch(error => {
                // console.log('error handler 2');
                handleError(error, request, response);
                })
};

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
    // console.log(geo);
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

app.get('/location', searchLocation);

app.use('/', (request, response) => response.send('Sorry that route does not exist'));

app.listen(PORT, () => {
    console.log('Server is running on PORT: ' + PORT);
});

