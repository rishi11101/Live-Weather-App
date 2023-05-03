const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");

const userContainer = document.querySelector(".main-weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector(".search-weather-form");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".weather-information-container");

//GLOBAL VARIABLES:-
let currentTab = userTab;
currentTab.classList.add("current-tab");
const API_KEY = "aed65e0895088f4bfdacd2383e89549b";

getFromSessionStorage();

function switchTab(clickedTab){

    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // if tab is switched, check if search bar is active, means you were already in search tab,
        //if not active then simply make it active and hide other containers
        if(!searchForm.classList.contains("active")){
            searchForm.classList.add("active");
            grantAccessContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
        }
        //else make main user info container visible, and further check if (grantAcess / weather info) to display
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

//function to check if coords are there in storage, if yes then fetch call using API, 
//if not then grant access container show
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coords");

    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeather(coordinates);
    }
}

async function fetchUserWeather(coordinates){
    const {lat, lon} = coordinates;

    //show loading screen & hide grantaccess:
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    //API CALL:-
    try{
        const response = await fetch
        (`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        //now put and show on UI the weather data from the response of API CALL:
        renderWeather(data);
    }
    catch(err){
        alert("Couldn't fetch weather!");
    }
}

function renderWeather(data){

    //fetch all elements to insert data dynamically:
    const cityName = document.querySelector("[data-cityName]");
    const countryFlag = document.querySelector("[data-countryFlag]");
    const desc = document.querySelector("[data-weatherDescription]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temperature]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-cloudiness]");

    // "?." is an operator for traversing through JSON objects and getting data from it.....
    //data is the WEATHER INFO json object recived by API CALL:-

    cityName.innerText = data?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`; //to lower as captial denoted in JSON object
    desc.innerText = data?.weather?.[0]?.description;  //in json obj, weather is an ARRAY so using 0th position
    weatherIcon.src = `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp} °C`;
    windSpeed.innerText = `${data?.wind?.speed}m/s`;
    humidity.innerText = `${data?.main?.humidity}%`;
    clouds.innerText = `${data?.clouds?.all}%`;
}

function getLocation(){
    //use geolocation api support available?
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("Sorry, no geological support available on this browser!");
    }
}
//search geolocation api W3schools for syntax and getting coords:
function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    //store this COOOOOOOORDINATES:======================== and fetch user LIVE weather!!!!!!!!!!!!!

    sessionStorage.setItem("user-coords", JSON.stringify(userCoordinates));
    fetchUserWeather(userCoordinates);
}

//EVENT LISTNERS:-

userTab.addEventListener("click", () => {
    // pass clicked tab as parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input
    switchTab(searchTab);
});

const grantAccessBtn = document.querySelector("[data-grantAccessBtn]");
grantAccessBtn.addEventListener("click", getLocation);


const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {

    e.preventDefault();
    
    let cityName = searchInput.value;

    if(cityName === ""){
        return;
    }
    else{
        fetchWeatherInfoByCity(cityName);
        searchForm.reset();
    }
})

async function fetchWeatherInfoByCity(city){

    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`   
            );

        const data = await response.json();

        loadingScreen.classList.remove("active");

        if(data.cod==="404"){  //if city not found, use this if -
            alert("City Not Found, Please Enter Carefully!!");
            return;
        }

        userInfoContainer.classList.add("active");
        renderWeather(data);
    }

    catch(err){
        alert("Could'nt load data");
    }
}

