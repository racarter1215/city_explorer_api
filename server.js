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
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}N&q=${city}&format=json`

        superagent.get(url) 
            .then(locationResponse => {
                const data = locationResponse.body;
                for (var i in data) {
                    if (data[i].display_name.search(city)) {
                        const location = new Location(data[i], city);
                        response.send(location);
                    }
                }
            })
        .catch(error => {
            handleError(error, response);
        });
});


function Location(geo, city) {
    this.search_query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

app.get('/weather', (request, response) => {
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

function handleError(error, request, response) {
    response.status(500).send({
      status: 500,
      responseText: "Sorry, something went wrong",
    });
  }


app.listen(PORT, () => {
  console.log('Server is running on PORT: ' + PORT);
});
