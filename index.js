const express = require('express');
const got = require('got');

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.set('view engine', 'ejs');

server.post('/', async (req, res) => {
  try {
    console.log(req.body.searchText);

    const response = await got(`https://www.metaweather.com/api/location/search/?query=${req.body.searchText}`);

    const locations = JSON.parse(response.body);

    let tagline = '';
    let weatherForLocation = [];

    if(locations.length > 0) {
      const location = locations[0];

      const currentDate = new Date();
      tagline = `Displaying today's weather records for ${location.location_type} : ${location.title}.`;
      const weatherResponse = await got(`https://www.metaweather.com/api/location/${location.woeid}/${currentDate.getFullYear()}/${currentDate.getMonth()}/${currentDate.getDate()}`);
      
      weatherForLocation = JSON.parse(weatherResponse.body).map(w=>{
        w.created = new Date(w.created).toISOString().match(/(\d{2}:){2}\d{2}/)[0];
        return w;
      });
    }
    else {
      tagline = 'No location matches with the search pattern.'
    }
  
    res.render('pages/index', {
      weatherForLocation: weatherForLocation,
      tagline: tagline
    });

  } catch (error) {
    res.send('Internal server error :(');
  }
})

server.get('/', async (req, res) => {

  try {
    
    const tagline = "Please type a location, weather records for the first match will be displayed bellow.";

    const weatherForLocation = [];

    res.render('pages/index', {
      weatherForLocation: weatherForLocation,
      tagline: tagline
    });

  } catch (error) {
    res.send('Internal server error :(');
  }
});

server.listen(4242, () => {
  console.log('Express Server is running...');
});
