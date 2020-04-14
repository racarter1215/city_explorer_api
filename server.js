const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

function Location(geo, city) {
    this.search.query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

app.get('/location', (request, response) => {
        // let city = request.query.city;
        // console.log(city);
    
        let geo = require('./data/geo.json');
        // console.log(geo);
        let location = new Location(geo[0], 'city')
        response.send(location);
        if (location) {
            response.status(200).send(location);
        } else {
            response.status(404).send('Cant find your city');
        }
    });

app.listen(PORT, () => {
  console.log('Server is running on PORT: ' + PORT);
});
