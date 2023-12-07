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
const saveRemovePairContainer = document.getElementById("save-remove-pair");
const savedCurrencyPair = document.getElementById("saved-currency-pair");
let savedCurrencyPairs = [];
let fromCurrencyValue;
let toCurrencyValue;
let exchangeRateData1;
let exchangeRateData2;
let timeoutId1;
let timeoutId2;
let saveRemoveTimeoutId;

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
    'X-RapidAPI-Key': '8708f74f38msh76c07611bae4b5bp1f95bdjsn37aa337fc47e',
    'X-RapidAPI-Host': 'currency-converter-by-api-ninjas.p.rapidapi.com'
  }
};

// Change API url value according to user's input and selection
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
    <p class="fs-1 fw-bold text-primary">${toAmount.toFixed(2)} ${toCurrency}</p>
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
  // Display a spinner while fetching data from API
  resultContainer.innerHTML = `<span class="loader"></span>`;
  showContainer(resultContainer);
  
  getConversionData(selectedFromCurrency, selectedToCurrency, amount)
  .then(data => {
    const formattedConversion = formatConversion(data.conversionData);
    const formattedExchangeRate = formatExchangeRate(data.exchangeRateData1, data.exchangeRateData2);

    resultContainer.innerHTML = formattedConversion;
    exchangeRateContainer.innerHTML = formattedExchangeRate;
    showContainer(exchangeRateContainer);

    // Check if currency pair existed in array
    if (!checkExistedCurrencyPair(selectedFromCurrency, selectedToCurrency)) {
      // Display save button if pair not exist
      saveRemovePairButton(true);
    }
    else {
      // Display remove button if pair exist
      saveRemovePairButton(false);
    }
    
    showContainer(saveRemovePairContainer);
  })
  .catch(error => {
    resultContainer.innerHTML = "Error fetching conversion data";
  });
}

// Convert currency based on user's selection and input
function convertCurrency() {
  const selectedFromCurrency = fromCurrency.value;
  const selectedToCurrency = toCurrency.value;
  let amount = amountInput.value;

  // Check if user's selection and input amount are valid
  if (!validateInput(selectedFromCurrency, selectedToCurrency, amount)) {
    return;
  }

  if (!amount) {
    amount = "0";
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
    hideAllContainer();
    errorMessage.innerHTML = "Please select a currency to convert from.";
    showContainer(errorMessage);
    return false;
  }
  
  // Check if user has selected a currency to convert to
  if (!selectedToCurrency) {
    hideAllContainer();
    errorMessage.innerHTML = "Please select a currency to convert to.";
    showContainer(errorMessage);
    return false;
  }

  // Check if user has entered a valid amount to convert
  if (!regex.test(amount) && amount) {
    // Hide result, save/remove container
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

// Hide all container
function hideAllContainer() {
  hideContainer(resultContainer);
  hideContainer(exchangeRateContainer);
  hideContainer(saveRemovePairContainer);
  hideContainer(errorMessage);
}

// Reset user's selection and input amount
function resetConversion() {
  fromCurrency.selectedIndex = "0";
  toCurrency.selectedIndex = "0";
  saveCurrencyPair.selectedIndex = "0";
  amountInput.value = "";
  fromCurrencyValue = null;
  toCurrencyValue = null;
  hideContainer(resultContainer);
  hideContainer(exchangeRateContainer);
  hideContainer(saveRemovePairContainer);
  hideContainer(errorMessage);
}

// Show save or remove button
function saveRemovePairButton(saveOrRemove) {
  if (saveOrRemove) {
    saveRemovePairContainer.classList.remove("text-danger");
    saveRemovePairContainer.classList.add("text-success");
    saveRemovePairContainer.innerHTML = `
      <button class="btn" onclick="saveCurrencyPair('${fromCurrencyValue}', '${toCurrencyValue}')">Click to save currency pair</button>
    `;
  }
  else {
    saveRemovePairContainer.classList.remove("text-success");
    saveRemovePairContainer.classList.add("text-danger");
    saveRemovePairContainer.innerHTML = `
      <button class="btn" onclick="removeCurrencyPair('${fromCurrencyValue}', '${toCurrencyValue}')">Click to remove currency pair</button>
    `;
  }
}

// Save currency pair
function saveCurrencyPair(selectedFromCurrency, selectedToCurrency) {
  // Add pair into array
  savedCurrencyPairs.push({ selectedFromCurrency, selectedToCurrency });
  // Show saved message
  saveRemovePairContainer.innerHTML = "Currency pair saved.";

  if (saveRemoveTimeoutId) {
    clearTimeout(saveRemoveTimeoutId);
  }

  // Wait 3s and display remove currency pair button
  saveRemoveTimeoutId = setTimeout(() => {
    saveRemovePairButton(false);
  }, 3000);
  
  loadSavedCurrencyPairs();
}

// Check for existed currency pair in array
function checkExistedCurrencyPair(selectedFromCurrency, selectedToCurrency) {
  return savedCurrencyPairs.find(pair => pair.selectedFromCurrency === selectedFromCurrency && pair.selectedToCurrency === selectedToCurrency);
}

// Load saved currency pairs
function loadSavedCurrencyPairs() {
  // Remove all option except for default option
  for (let i = savedCurrencyPair.options.length; i > 0; i--) {
    savedCurrencyPair.remove(i);
  }

  // Add saved currency pairs to select element
  for (const currencyPair of savedCurrencyPairs) {
    const option = document.createElement("option");
    
    option.value = currencyPair.selectedFromCurrency + " - " + currencyPair.selectedToCurrency;
    option.text = currencyPair.selectedFromCurrency + " - " + currencyPair.selectedToCurrency;

    savedCurrencyPair.add(option);
  }
}

// Remove currency pair
function removeCurrencyPair(selectedFromCurrency, selectedToCurrency) {
  // Check if pair existed
  if (checkExistedCurrencyPair(selectedFromCurrency, selectedToCurrency)) {
    // Remove pair from currency pairs array
    savedCurrencyPairs = savedCurrencyPairs.filter(pair => pair.selectedFromCurrency !== selectedFromCurrency || pair.selectedToCurrency !== selectedToCurrency);
    // Show removed message
    saveRemovePairContainer.innerHTML = "Currency pair removed.";

    if (saveRemoveTimeoutId) {
      clearTimeout(saveRemoveTimeoutId);
    }

    // Wait 3s and display save currency pair button
    saveRemoveTimeoutId = setTimeout(() => {
      saveRemovePairButton(true);
    }, 3000);
    
    loadSavedCurrencyPairs();
  }
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
  else {
    if (timeoutId2) {
      clearTimeout(timeoutId2);
    }

    // Wait for 800ms when user make changes to input then convert currency
    timeoutId2 = setTimeout(convertCurrency, 800);
  }
});

// Handle keydown event listener for input field
amountInput.addEventListener("keydown", (e) => {
  let containDecimal = false;

  // Check for decimal
  for (const value of amountInput.value) {
    if (value === ".") {
      containDecimal = true;
    }
  }

  // Only allow numbers and decimal
  if (isNaN(e.key) && e.key !== "." && e.key !== "Backspace") {
    e.preventDefault();
  }
  // Allow only one decimal input
  else if (e.key === "." && containDecimal) {
    e.preventDefault();
  }
});

// Handle change event listener and make real-time conversion when user select different currencies
fromCurrency.addEventListener("change", () => {
  hideAllContainer();

  savedCurrencyPair.selectedIndex = "0";

  if (fromCurrency.value && toCurrency.value && !amountInput.value) {
    displayConversion(fromCurrency.value, toCurrency.value, "0");

    return;
  }
  
  convertCurrency();
});

// Handle change event listener and make real-time conversion when user select different currencies
toCurrency.addEventListener("change", () => {
  hideAllContainer();

  savedCurrencyPair.selectedIndex = "0";
  
  if (fromCurrency.value && toCurrency.value && !amountInput.value) {
    displayConversion(fromCurrency.value, toCurrency.value, "0");

    return;
  }
  
  convertCurrency();
});

// Handle change event listener for saved currency pair
savedCurrencyPair.addEventListener("change", () => {
  if (!savedCurrencyPair.value) {
    return;
  }

  hideAllContainer();

  // Set selected currency pair
  const selectedFromCurrency = savedCurrencyPair.value.split(" - ")[0];
  const selectedToCurrency = savedCurrencyPair.value.split(" - ")[1];

  fromCurrency.value = selectedFromCurrency;
  toCurrency.value = selectedToCurrency;

  convertCurrency();
});
