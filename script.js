// Array of currencies available
const currencies = [
  "USD - United States Dollar",
  "EUR - Euro",
  "CNY - Chinese Yuan",
  "CHF - Swiss Franc",
  "AUD - Australian Dollar",
  "PLN - Polish Zolty",
  "TRY - Turkish New Lira",
  "CAD - Canadian Dollar",
  "JPY - Japanese Yen",
  "GBP - British Pound",
  "NZD - New Zealand Dollar",
  "KRW - South Korean Won",
  "DKK - Danish Krone",
  "HKD - Hong Kong Dollar"
];

const fromCurrency = document.getElementById("from-currency");
const toCurrency = document.getElementById("to-currency");
const amountInput = document.getElementById("amount");
const resultContainer = document.getElementById("result");
const errorMessage = document.getElementById("error-message");

// Add option to browse for currency
for (const currency of currencies) {
  fromCurrency.add(addOption(currency));
  toCurrency.add(addOption(currency));
}

// Add option to select currency
function addOption(currency) {
  const option = document.createElement("option");
  option.value = currency.split(" - ")[0];
  option.text = currency;

  return option;
}

// API key and host
let url;
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '8a78d0f160mshe607a9668d53c68p1f3e3ajsnd6267d263449',
    'X-RapidAPI-Host': 'currency-converter-by-api-ninjas.p.rapidapi.com'
  }
};

// Get converted currency data from API
async function getConvertedCurrency(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();

  return data;
}

// Format converted currency data into readable format
function formatConvertedCurrency(convertedCurrencyData) {
  const fromCurrency = convertedCurrencyData.old_currency;
  const fromAmount = convertedCurrencyData.old_amount;
  const toCurrency = convertedCurrencyData.new_currency;
  const toAmount = convertedCurrencyData.new_amount;

  return `${fromAmount} ${fromCurrency} = ${toAmount} ${toCurrency}`;
}

// Display converted currency
function displayConvertedCurrency(url, options) {
  getConvertedCurrency(url, options)
  .then(convertedCurrencyData => {
    const formattedConvertedCurrency = formatConvertedCurrency(convertedCurrencyData);

    showResult(formattedConvertedCurrency);
  })
  .catch(error => {
    resultContainer.innerHTML = "Error fetching conversion data";
  });
}

// Convert currency based on user's selection and input
function convertCurrency() {
  const selectedFromCurrency = fromCurrency.value;
  const selectedToCurrency = toCurrency.value;
  const amount = amountInput.value;

  // Hide erorr message and result container
  hideContainer(resultContainer);
  hideContainer(errorMessage);

  // Check if user's selection and input amount are valid
  if (!validateInput(selectedFromCurrency, selectedToCurrency, amount)) {
    return;
  }

  // Set the URL for API request
  url = `https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency?have=${selectedFromCurrency}&want=${selectedToCurrency}&amount=${amount}`;
  displayConvertedCurrency(url, options);
}

// Validate user's selection and input amount
function validateInput(selectedFromCurrency, selectedToCurrency, amount) {
  // Check if user has selected a currency to convert
  if (!selectedFromCurrency) {
    errorMessage.innerHTML = "Please select a currency to convert from.";
    showContainer(errorMessage);
    return false;
  }
  
  // Check if user has selected a currency to convert to
  if (!selectedToCurrency) {
    errorMessage.innerHTML = "Please select a currency to convert to.";
    showContainer(errorMessage);
    return false;
  }

  // Check if user has entered a valid amount to convert
  if (isNaN(parseFloat(amount)) || parseFloat(amount) < 0 || amount === "") {
    errorMessage.innerHTML = "Please enter a valid amount.";
    showContainer(errorMessage);
    return false;
  }

  return true;
}

// Show converted currency result
function showResult(formattedConvertedCurrency) {
  const convertedCurrency = document.createElement("p");
  convertedCurrency.classList.add("fw-bold", "fs-3");
  convertedCurrency.innerHTML = formattedConvertedCurrency;
  
  showContainer(resultContainer);
  resultContainer.textContent = "Result";
  resultContainer.appendChild(convertedCurrency);
}

// Show container
function showContainer(container) {
  container.classList.remove("d-none");
  container.classList.add("d-block");
}

// Hide container
function hideContainer(container) {
  container.classList.remove("d-block");
  container.classList.add("d-none");
}