const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const TEST_SERVER_URL = "http://20.244.56.144/test";
const WINDOW_SIZE = 10;

const numberTypes = {
  p: "prime",
  f: "fibonacci",
  e: "even",
  r: "random",
};

let windowState = [];

const fetchProducts = async (company, category, minPrice, maxPrice) => {
  const TEST_SERVER_URL = `http://20.244.56.144/products/companies/${company}/categories/${category}/products`;
  try {
    const response = await axios.get(TEST_SERVER_URL, {
      params: { top: 10, minPrice, maxPrice },
    });
    return response.data.products;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(`Products not found for company ${company}`);
    } else {
      console.error(`Error fetching products from ${company}:`, error.message);
    }
    return [];
  }
};

const calculateAverage = (numbers) => {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return numbers.length > 0 ? sum / numbers.length : 0;
};

app.get("/:numberid", async (req, res) => {
  const { numberid } = req.params;
  const type = numberTypes[numberid];

  if (!type) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const newNumbers = await fetchNumbers(type);
  const uniqueNewNumbers = Array.from(new Set(newNumbers));

  const windowPrevState = [...windowState];

  uniqueNewNumbers.forEach((num) => {
    if (!windowState.includes(num)) {
      if (windowState.length >= WINDOW_SIZE) {
        windowState.shift();
      }
      windowState.push(num);
    }
  });

  const windowCurrState = [...windowState];
  const avg = calculateAverage(windowState);

  res.json({
    numbers: uniqueNewNumbers,
    windowPrevState,
    windowCurrState,
    avg,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
