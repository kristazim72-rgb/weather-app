const API_KEY = 'FHVQ2EZWFLD7CE2Y4QBXEKKUW';

let currentUnit = 'C';
let currentWeatherData = null;

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#location-input');
const loadingSpinner = document.querySelector('#loading-spinner');
const errorMessage = document.querySelector('#error-message');
const weatherCard = document.querySelector('#weather-card');
const toggleBtn = document.querySelector('#unit-toggle');

//API Fetching Logic
async function getWeatherData(location) {
  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?key=${API_KEY}`,
      { mode: 'cors' }
    );

    if (!response.ok) {
      throw new Error(`Location not found (${response.status})`);
    }

    const weatherData = await response.json();
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

//Data Processing
function processWeatherData(rawData) {
  return {
    resolvedAddress: rawData.resolvedAddress,
    tempF: rawData.currentConditions.temp,
    // Converts Fahrenheit to Celsius: (F - 32) * (5/9)
    tempC: ((rawData.currentConditions.temp - 32) * (5 / 9)).toFixed(1),
    conditions: rawData.currentConditions.conditions,
    icon: rawData.currentConditions.icon,
    humidity: rawData.currentConditions.humidity,
    windSpeed: rawData.currentConditions.windspeed,
  };
}

// UI state functions
function showLoadingSpinner() {
  if (loadingSpinner) loadingSpinner.classList.remove('hidden');
  if (weatherCard) weatherCard.classList.add('hidden');
  if (errorMessage) errorMessage.classList.add('hidden');
}

function hideLoadingSpinner() {
  if (loadingSpinner) loadingSpinner.classList.add('hidden');
}

function displayError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }
  if (weatherCard) weatherCard.classList.add('hidden');
}

//rendering logic
function displayWeather(data) {
  currentWeatherData = data;

  const locationEl = document.querySelector('#location-name');
  const conditionEl = document.querySelector('#condition');
  const humidityEl = document.querySelector('#humidity');
  const windSpeedEl = document.querySelector('#wind-speed');

  if (locationEl) locationEl.textContent = data.resolvedAddress;
  if (conditionEl) conditionEl.textContent = data.conditions;
  if (humidityEl) humidityEl.textContent = `${data.humidity}%`;
  if (windSpeedEl) windSpeedEl.textContent = `${data.windSpeed} mph`;

  updateTemperatureDisplay();

  if (errorMessage) errorMessage.classList.add('hidden');
  if (weatherCard) weatherCard.classList.remove('hidden');
}

function updateTemperatureDisplay() {
  if (!currentWeatherData) return;

  const tempEl = document.querySelector('#temperature');
  if (currentUnit === 'C') {
    tempEl.textContent = `${currentWeatherData.tempC} °C`;
  } else {
    tempEl.textContent = `${currentWeatherData.tempF} °F`;
  }
}

//event listeners
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const location = searchInput.value.trim();
  if (!location) return;

  try {
    showLoadingSpinner();
    const rawData = await getWeatherData(location);
    const cleanData = processWeatherData(rawData);
    displayWeather(cleanData);
  } catch (err) {
    displayError('Could not fetch weather for that location.');
  } finally {
    hideLoadingSpinner();
  }
});

toggleBtn.addEventListener('click', () => {
  currentUnit = currentUnit === 'C' ? 'F' : 'C';
  toggleBtn.textContent = `Display in °${currentUnit === 'C' ? 'F' : 'C'}`;
  updateTemperatureDisplay();
});