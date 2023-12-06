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
const exchangeRateContainer = document.getElementById("exchange-rate");
let fromCurrencyValue;
let toCurrencyValue;
let exchangeRateData1;
let exchangeRateData2;
let timeoutId1;
let timeoutId2;

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

function getUrl(value1, value2, amount) {
  if (amount) {
    return `https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency?have=${value1}&want=${value2}&amount=${amount}`;
  }
  else {
    return `https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency?have=${value1}&want=${value2}&amount=1`;
  }
}

// Get converted currency and exchange rate data from API
async function getConversionData(selectedFromCurrency, selectedToCurrency, amount) {
  const conversionResponse = await fetch(getUrl(selectedFromCurrency, selectedToCurrency, amount), options);
  const conversionData = await conversionResponse.json();
  let exchangeRateResponse1;
  let exchangeRateResponse2;

  // Get exchange rate data if user first selects a currency or changes a currency
  if ((!fromCurrencyValue && !toCurrencyValue) || fromCurrencyValue !== selectedFromCurrency || toCurrencyValue !== selectedToCurrency) {
    fromCurrencyValue = selectedFromCurrency;
    toCurrencyValue = selectedToCurrency;

    exchangeRateResponse1 = await fetch(getUrl(selectedFromCurrency, selectedToCurrency), options);
    exchangeRateResponse2 = await fetch(getUrl(selectedToCurrency, selectedFromCurrency), options);

    exchangeRateData1 = await exchangeRateResponse1.json();
    exchangeRateData2 = await exchangeRateResponse2.json();
  }

  return { conversionData, exchangeRateData1, exchangeRateData2 };
}

// Format converted currency data into readable format
function formatConversion(conversionData) {
  const fromCurrency = conversionData.old_currency;
  const fromAmount = conversionData.old_amount;
  const toCurrency = conversionData.new_currency;
  const toAmount = conversionData.new_amount;
  const formattedData = `
    <p class="fs-5 fw-semibold mb-0">${fromAmount.toFixed(2)} ${fromCurrency} =</p>
    <p class="fs-3 fw-bold text-primary">${toAmount.toFixed(2)} ${toCurrency}</p>
  `;

  return formattedData;
}

// Format exchange rate data into readable format
function formatExchangeRate(exchangeRateData1, exchangeRateData2) {
  const fromCurrency1 = exchangeRateData1.old_currency;
  const fromAmount1 = exchangeRateData1.old_amount;
  const toCurrency1 = exchangeRateData1.new_currency;
  const toAmount1 = exchangeRateData1.new_amount;

  const fromCurrency2 = exchangeRateData2.old_currency;
  const fromAmount2 = exchangeRateData2.old_amount;
  const toCurrency2 = exchangeRateData2.new_currency;
  const toAmount2 = exchangeRateData2.new_amount;

  const formattedData = `
    <p class="mb-0">${fromAmount1} ${fromCurrency1} = ${toAmount1} ${toCurrency1}</p>
    <p class="mb-0">${fromAmount2} ${fromCurrency2} = ${toAmount2.toFixed(2)} ${toCurrency2}</p>
  `;

  return formattedData;
}

// Display converted currency
function displayConversion(selectedFromCurrency, selectedToCurrency, amount) {
  resultContainer.innerHTML = `<span class="loader"></span>`;
  showContainer(resultContainer);
  
  getConversionData(selectedFromCurrency, selectedToCurrency, amount)
  .then(data => {
    const formattedConversion = formatConversion(data.conversionData);
    const formattedExchangeRate = formatExchangeRate(data.exchangeRateData1, data.exchangeRateData2);

    resultContainer.innerHTML = formattedConversion;

    exchangeRateContainer.innerHTML = formattedExchangeRate;
    showContainer(exchangeRateContainer);
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

  // Check if user's selection and input amount are valid
  if (!validateInput(selectedFromCurrency, selectedToCurrency, amount)) {
    return;
  }

  // Hide erorr message container
  hideContainer(errorMessage);

  displayConversion(selectedFromCurrency, selectedToCurrency, amount);
}

// Validate user's selection and input amount
function validateInput(selectedFromCurrency, selectedToCurrency, amount) {
  // Regex pattern for only digit and decimal
  const regex = /^\d+.?\d*$/;
  // Check if user has selected a currency to convert
  if (!selectedFromCurrency) {
    // Hide result and exchange rate container
    hideContainer(resultContainer);
    hideContainer(exchangeRateContainer);
    errorMessage.innerHTML = "Please select a currency to convert from.";
    showContainer(errorMessage);
    return false;
  }
  
  // Check if user has selected a currency to convert to
  if (!selectedToCurrency) {
    // Hide result and exchange rate container
    hideContainer(resultContainer);
    hideContainer(exchangeRateContainer);
    errorMessage.innerHTML = "Please select a currency to convert to.";
    showContainer(errorMessage);
    return false;
  }

  // Check if user has entered a valid amount to convert
  if (!regex.test(amount) && amount) {
    // Hide result and exchange rate container
    hideContainer(resultContainer);
    errorMessage.innerHTML = "Please enter a valid amount.";
    showContainer(errorMessage);
    return false;
  }

  return true;
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

// Reset user's selection and input amount
function resetConversion() {
  fromCurrency.selectedIndex = "0";
  toCurrency.selectedIndex = "0";
  amountInput.value = "";
  fromCurrencyValue = null;
  toCurrencyValue = null;
  hideContainer(resultContainer);
  hideContainer(exchangeRateContainer);
  hideContainer(errorMessage);
}

// Handle input event listener and real-time conversion
amountInput.addEventListener("input", (e) => {  
  // Check if input value is empty
  if (!e.target.value) {
    if (timeoutId1) {
      clearTimeout(timeoutId1);
    }

    // Wait 800ms to hide result container
    timeoutId1 = setTimeout(() => {
      hideContainer(resultContainer);
    }, 800);
  }

  // Check if user has selected currencies and entered an amount
  if (e.target.value && fromCurrency.value && toCurrency.value) {
    if (timeoutId2) {
      clearTimeout(timeoutId2);
    }

    // Wait for 800ms when user make changes to input then convert currency
    timeoutId2 = setTimeout(convertCurrency, 800);
  }
  else {
    hideContainer(resultContainer);
    hideContainer(errorMessage);
  }
});

// Only allow numbers and decimal
amountInput.addEventListener("keydown", (e) => {
  let containDecimal = false;

  // Allow only one decimal input
  for (const value of amountInput.value) {
    if (value === ".") {
      containDecimal = true;
    }
  }
  
  if (isNaN(e.key) && e.key !== "." && e.key !== "Backspace") {
    e.preventDefault();
  }
  else if (e.key === "." && containDecimal) {
    e.preventDefault();
  }
});

// Handle change event listener and make real-time conversion when user select different currencies
fromCurrency.addEventListener("change", () => {
  if (fromCurrency.value && toCurrency.value && amountInput.value) {
    hideContainer(exchangeRateContainer);
    convertCurrency();
  }
});

// Handle change event listener and make real-time conversion when user select different currencies
toCurrency.addEventListener("change", () => {
  if (toCurrency.value && fromCurrency.value && amountInput.value) {
    hideContainer(exchangeRateContainer);
    convertCurrency();
  }
});