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

for (const currency of currencies) {
  fromCurrency.add(addOption(currency));
  toCurrency.add(addOption(currency));
}

function addOption(currency) {
  const option = document.createElement("option");
  option.value = currency.split(" - ")[0];
  option.text = currency;

  return option;
}