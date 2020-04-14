const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

app.get('/location', (request, response) => {
    try {
        let city = request.query.city;
        console.log(city);
        let geo = require('./data/geo.json');

        let location = new Location(geo[0], city)
        response.send(location);
    }
    catch(err) {
        response.status(500).send(err)
        console.error(err)
    }
})

function City(obj, city) {
    this.search.query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}

new City

app.listen(PORT, () => {
  console.log('Server is running on PORT: ' + PORT);
});
