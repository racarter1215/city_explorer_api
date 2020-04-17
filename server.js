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

        

app.get('/location', searchLocation);

function searchLocation (request, response) {
        const city = request.query.city;
        const key = process.env.GEOCODE_API_KEY;
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        let sql = `SELECT * FROM locations WHERE search_query=$1;`;
        let searchValues = [city];
        let sqlInsert = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;
        console.log('city', city);
        dbClient.query(sql, searchValues)
            .then(record => {
                console.log('hello this is a promise', record);
                if (!record.rows.length === 0) {
                    // console.log(record.rows[0]);
                    response.send(record.rows[0]);
                } else {
                    superangent.get(url)
                    .then(locationResponse => {
                        console.log(locationResponse);
                        const geo = locationResponse.body[0];
                        const location = new Location(city, geo);
                        response.status(200).send(location);
                        let searchValues = [city, location.formatted_query, location.latitude, location.longitude];

                        dbClient.query(sqlInsert, searchValues).then(record => {
                            //insert row
                        }).catch(error => {
                            console.log('database error');
                            handleError(error, request, response);
                        })
                    })
                };
            }).catch(error => {
                console.log('query went wrong');
                handleError(error, request, response);
            });
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


app.use('/', (request, response) => response.send('Sorry that route does not exist'));

app.listen(PORT, () => {
    console.log('Server is running on PORT: ' + PORT);
});

