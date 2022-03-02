import { fetchData } from './modules/network';
import HSLData from './modules/hsl-data';
import FazerData from './modules/fazer-data';
import SodexoData from './modules/sodexo-data';
import announcementData from './modules/announcements-data';

//Defining language
let langFi = true;

/**
 * Fetching HSL data
 */
const getHSLData = (fi) => {
  const line = document.querySelector('.line');
  const busstop = document.querySelector('.stop');
  const dest = document.querySelector('.dest');
  const leaving = document.querySelector('.leaving');

  if (fi === true) {
    line.textContent = `Linja`;
    busstop.textContent = `Pysäkki`;
    dest.textContent = `Määränpää`;
    leaving.textContent = `Lähtee`;
  } else {
    line.textContent = `Route`;
    busstop.textContent = `Stop`;
    dest.textContent = `Destination`;
    leaving.textContent = `Leaving`;
  }

  fetchData(HSLData.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/graphql' },
    body: HSLData.getQueryForNextRidesByStopId(2132207)
  }).then(response => {
    const stop = response.data.stop;
    const stopPattern = response.data.stop.stoptimesWithoutPatterns;
    const hslContent = document.querySelector('.timetable');


    // hslContent.innerHTML += `<p>${stop.name}<br></p>`;
    hslContent.innerHTML = ``;
    for (let i = 0; i < 4; i++) {
      let date = new Date(parseInt(stop.stoptimesWithoutPatterns[i].realtimeArrival + stop.stoptimesWithoutPatterns[i].serviceDay) * 1000);
      let localeSpecificTime = date.toLocaleTimeString('fi-FI', { hour: 'numeric', minute: 'numeric' });
      hslContent.innerHTML += `
    <li class="bus-times">
    <div id="bus-nmbr">${stop.stoptimesWithoutPatterns[i].trip.routeShortName}</div>
    <div id="bus-stop">${stop.name}</div>
    <div id="bus-destination">${stop.stoptimesWithoutPatterns[i].headsign}</div>
    <div id="bus-arriving">${localeSpecificTime.replace('PM', '')}</div>
  </li>
  <hr>`;
    };
  });
};

getHSLData(langFi);

setInterval(() => {
  getHSLData(langFi);
}, 30000);

/**
 * WEATHER
 */

const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const weekdayEl = document.getElementById('weekday');
const weatherForecastEl = document.getElementById('weather-today');
const futureForecast = document.getElementById('next-week');
let title = document.getElementById('weather-change');
let subtitle = document.getElementById('city-subtitle');


const apiKey = 'c042c0bcea83f22bde97ce234ae8c4f7';


/**
 * Function to add missing zero
 * @param {number} value current time without zero
 * @returns time with zero i.e. 15:05.
 */
const showMinutes = (value) => {
  if (value < 10) {
    return '0' + value;
  } else {
    return value;
  }
};

/**
 * Function to get date and time
 */
setInterval(() => {
  const time = new Date();
  const date = time.getDate();
  const month = time.getMonth() + 1;
  const year = time.getFullYear();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const weekdayFi = time.toLocaleString("Fi", { weekday: "long" });
  const weekdayEn = time.toLocaleString("En", { weekday: "long" });

  timeEl.innerHTML = hours + ':' + showMinutes(minutes);
  dateEl.innerHTML = date + '.' + month + '.' + year;

  if (langFi) {
    weekdayEl.innerHTML = weekdayFi;
  } else {
    weekdayEl.innerHTML = weekdayEn;
  }

}, 1000);


/**
 * Weather based of location
 */
const getWeatherData = (fi) => {
  if (fi === true) {
    title.textContent = `Sää`;
    subtitle.textContent = `Tänään`;
    navigator.geolocation.getCurrentPosition((success) => {
      let { latitude, longitude } = success.coords;
      fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&lang=fi&exclude=hourly,minutely&units=metric&appid=${apiKey}`)
        .then(res => res.json()).then(data => {

          console.log('weather-data', data);
          showWeatherData(data);
        });
    });
  } else {
    title.textContent = `Weather`;
    subtitle.textContent = `Today`;
    navigator.geolocation.getCurrentPosition((success) => {
      let { latitude, longitude } = success.coords;
      fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&lang=en&exclude=hourly,minutely&units=metric&appid=${apiKey}`)
        .then(res => res.json()).then(data => {

          console.log('weather-data', data);
          showWeatherData(data);
        });
    });
  }
};

getWeatherData(langFi);

setInterval(() => {
  getWeatherData();
  console.log('sää', getWeatherData);
}, 1800000);

const showWeatherData = (data) => {
  weatherForecastEl.innerHTML = ``;
  futureForecast.innerHTML = ``;
  data.daily.forEach((day, idx) => {
    const unixTimestamp = day.dt;
    const milliseconds = unixTimestamp * 1000;
    const dateObject = new Date(milliseconds);
    const humanDateFormFi = dateObject.toLocaleString("Fi", { weekday: "short" });
    const humanDateFormEn = dateObject.toLocaleString("En", { weekday: "short" });

    if (idx === 0) {
      weatherForecastEl.innerHTML += `
          <div class="weather-today" id="weather-today">
            <img src="http://openweathermap.org/img/wn//${day.weather[0].icon}@2x.png" alt="sää-kuvaus" class="icon-now">
            <div class="temp">${day.temp.day.toFixed(0)}&#176;C</div>
            <div class="description">${day.weather[0].description}</div>
          </div>
          `;
      console.log('tänään', day.weather[0]);
      console.log('indeksi tänään', idx);
    } else if (idx > 0 && idx < 4 && langFi) {
      futureForecast.innerHTML += `
          <div class="next-week">
            <div class="day">
            <div class="days" id="days">${humanDateFormFi}</div>
              <img src="http://openweathermap.org/img/wn//${day.weather[0].icon}@2x.png" alt="sää-kuvaus" class="icon-future">
              <div class="temp">${day.temp.day.toFixed(0)}&#176;C</div>
            </div>
          </div>
          `;
      console.log('indeksi next', idx);
    } else if (idx > 0 && idx < 4) {
      futureForecast.innerHTML += `
          <div class="next-week">
            <div class="day">
            <div class="days" id="days">${humanDateFormEn}</div>
              <img src="http://openweathermap.org/img/wn//${day.weather[0].icon}@2x.png" alt="sää-kuvaus" class="icon-future">
              <div class="temp">${day.temp.day.toFixed(0)}&#176;C</div>
            </div>
          </div>
          `;
      console.log('indeksi next', idx);
    }

  });
};

/**
 * LUNCH
 */

const menuList = document.querySelector('.menu-list');
const lunchTopic = document.querySelector('.lunch-topic');
const restaurantName = document.querySelector('.restaurant');


const renderFazer = (fi) => {
  restaurantName.textContent = `Fazer`;
  if (fi === true) {
    lunchTopic.textContent = `Päivän lounas`;
    fetchData(FazerData.fazerLunchMenuFiUrl, {}, true).then(data => {
      console.log('fazermenu: ', FazerData.fazerLunchMenuFiUrl);
      const menuData = JSON.parse(data.contents);
      console.log(menuData);
      let course = FazerData.parseFazerMenu(menuData.LunchMenus[0]);
      showMenu(course, menuList);
    });
  } else {
    lunchTopic.textContent = `Today's lunch`;
    fetchData(FazerData.fazerLunchMenuEnUrl, {}, true).then(data => {
      const menuData = JSON.parse(data.contents);
      console.log(menuData);
      let course = FazerData.parseFazerMenu(menuData.LunchMenus[0]);
      showMenu(course, menuList);
    });
  }
};


const renderSodexo = (fi) => {
  restaurantName.textContent = `Sodexo`;
  fetchData(SodexoData.sodexoDataUrl).then(data => {
    let courses = SodexoData.parseSodexoMenu(data.courses);
    console.log('sodexo', courses);
    const coursesFi = courses[0];
    const coursesEn = courses[1];
    if (fi === true) {
      lunchTopic.textContent = `Päivän lounas`;
      showMenu(coursesFi, menuList);
    } else {
      lunchTopic.textContent = `Today's lunch`;
      showMenu(coursesEn, menuList);
    }
  });

};


/**
 * Function showing the menu
 *
 * @param {array} courses course's names
 * @param {array} menuList list of courses
 */
const showMenu = (courses, menuList) => {
  menuList.innerHTML = ``;
  for (let i = 0; i < courses.length; i++) {
    menuList.innerHTML += `
      <li>${courses[i]}</li>
      `;
  };
};

/**
 * ANNOUNCEMENTS
 */

const infoText = document.querySelector('.info-text');
const infoTopic = document.querySelector('.info-topic');
const infoDate = document.querySelector('.info-date');

const showInfo = (fi) => {
  if (fi === true) {
    infoTopic.textContent = announcementData.announcementsFi.Announcements[0].Name;
    infoText.textContent = announcementData.announcementsFi.Announcements[0].Information;
    infoDate.textContent = announcementData.announcementsFi.Announcements[0].Date;
  } else {
    infoTopic.textContent = announcementData.announcementsEn.Announcements[0].Name;
    infoText.textContent = announcementData.announcementsEn.Announcements[0].Information;
    infoDate.textContent = announcementData.announcementsEn.Announcements[0].Date;
  }

};

showInfo(langFi);

/**
 * LANGUAGE
 */

const currentLangBtn = document.querySelector('.currentLang');
const switchLangBtn = document.querySelector('.switchLang');

const changeLanguage = () => {
  if (langFi) {
    currentLangBtn.src = "assets/img/united-kingdom.png";
    switchLangBtn.src = "assets/img/finland.png";
    langFi = false;
  } else {
    langFi = true;
    currentLangBtn.src = "assets/img/finland.png";
    switchLangBtn.src = "assets/img/united-kingdom.png";
  }
  renderFazer(langFi);
  renderSodexo(langFi);
  showInfo(langFi);
  getWeatherData(langFi);
  getHSLData(langFi);
};
switchLangBtn.addEventListener('click', changeLanguage);

/**
 * Sivuston kielen vaihto 30 sekunnin välein
 */
setInterval(() => {
  changeLanguage();
  console.log('kielen vaihto', changeLanguage);
}, 30000);



/**
 * CHANGING THE CAMPUS
 */

const navbuttons = document.querySelectorAll('.n-link');
const karamalmiBtn = document.querySelector('#karamalmi');
const myyrmakiBtn = document.querySelector('#myyrmaki');
const myllypuroBtn = document.querySelector('#myllypuro');
const arabiaBtn = document.querySelector('#arabia');

const showCampusKaramalmi = () => {
  renderFazer(langFi);
};

const showCampusMyyrmaki = () => {
  renderSodexo(langFi);
};


karamalmiBtn.addEventListener('click', () => {
  navbuttons.forEach(elem => {
    elem.classList.remove('active');
  });

  karamalmiBtn.classList.add('active');
  showCampusKaramalmi();

});

myyrmakiBtn.addEventListener('click', () => {
  navbuttons.forEach(elem => {
    elem.classList.remove('active');
  });
  myyrmakiBtn.classList.add('active');
  showCampusMyyrmaki();
});

myllypuroBtn.addEventListener('click', () => {
  navbuttons.forEach(elem => {
    elem.classList.remove('active');
  });
  myllypuroBtn.classList.add('active');
});

arabiaBtn.addEventListener('click', () => {
  navbuttons.forEach(elem => {
    elem.classList.remove('active');
  });
  arabiaBtn.classList.add('active');
});

