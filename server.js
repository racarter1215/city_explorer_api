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

function Location(city, geo) {
    this.search_query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

function searchLocation (request, response) {
    const cityQuery = request.query.city;
    const key = process.env.GEOCODE_API_KEY;
    const locationUrl = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityQuery}&format=json`;
    let sql = `SELECT * FROM locations WHERE search_query=$1;`;
    let searchValues = [cityQuery];
    
    dbClient.query(sql, searchValues)
        .then(record => {
            if (record.rows[0]) {
                response.status(200).send(record.rows[0]);
            } else {
                superagent.get(locationUrl)
                .then(locationResponse => {
                    let location =  new Location(cityQuery, locationResponse.body[0]);
                    let sqlInsert = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;
                    let searchValues = [cityQuery, location.formatted_query, location.latitude, location.longitude];
                    dbClient.query(sqlInsert, searchValues);
                     response.status(200).send(location);
                    
            }).catch(error => {
                handleError(error, request, response);
                });
            }
        }).catch(error => {
            handleError(error, request, response);
            })
};

function Weather(date, forecast) {
    this.forecast = forecast;
    this.time = new Date(date).toDateString();
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
        handleError(error, request, response);
    });
});

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

function Yelp(element) {
    this.name = element.name;
    this.image_url = element.image_url;
    this.price = element.price;
    this.rating = element.rating;
    this.url = element.url;
}

app.get('/yelp', (request, response) => {
    const { latitude, longitude } = request.query;
    let city = request.query.search_query;
    let key = process.env.YELP_API_KEY;
    let url = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}`;
  
    superagent.get(url).set({ 'Authorization': 'Bearer ' + process.env.YELP_API_KEY})
      .then(yelpResponse => {
        const yelpData = yelpResponse.body.businesses;
        response.send(yelpData.map(data => {
         return new Yelp(data);
        }));
      }).catch(error => handleError(error, request, response));
  });

  function Movie(element) {
    this.title = element.title;
    this.overview = element.overview;
    this.average_votes = element.vote_average;
    this.total_votes = element.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${element.backdrop_path}`;
    this.popularity = element.popularity;
    this.released_on = element.release.date;
}

app.get('/movies', (request, response) => {
    let city = request.query.search_query;
    let key = process.env.MOVIE_API_KEY;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;

    superagent.get(url)
        .then(movieResponse => {
            const movieData = movieResponse.body.results;
            response.send(movieData.map(data => {
                return new Movie(data);
            }));
        }).catch(error => handleError(error, request, response));
}); 

function handleError(error, request, response) {
    response.status(500).send({status: 500, responseText: 'Sorry something went wrong'});
  }

app.get('/location', searchLocation);

app.use('/', (request, response) => response.send('Sorry that route does not exist'));

app.listen(PORT, () => {
    console.log('Server is running on PORT: ' + PORT);
});

