'use strict'

require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

function Location(geo, city) {
    this.search_query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

app.get('/location', (request, response) => {
    let city = request.query.city || 'Lynnwood';
    let geo = require('./data/geo.json');
    let location = new Location(geo[0], city)
    if (location) {
        response.status(200).send(location);
    } else {
        response.status(404).send('Cant find your city');
    } console.log(location);
});

app.listen(PORT, () => {
  console.log('Server is running on PORT: ' + PORT);
});
