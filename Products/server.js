const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 4000;

const COMPANIES = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const CATEGORIES = [
  "Phone",
  "Computer",
  "TV",
  "Earphone",
  "Tablet",
  "Charger",
  "Mouse",
  "Keypad",
  "Bluetooth",
  "Pendrive",
  "Remote",
  "Speaker",
  "Headset",
  "Laptop",
  "PC",
];

const fetchProducts = async (company, category, minPrice, maxPrice) => {
  const TEST_SERVER_URL = `http://20.244.56.144/products/companies/${company}/categories/${category}/products`;
  try {
    const response = await axios.get(TEST_SERVER_URL, {
      params: { top: 10, minPrice, maxPrice },
    });
    return response.data.products;
  } catch (error) {
    console.error(`Error fetching products from ${company}:`, error.message);
    return [];
  }
};

const sortProducts = (products, sortBy, sortOrder) => {
  return products.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] - b[sortBy];
    } else {
      return b[sortBy] - a[sortBy];
    }
  });
};

app.get("/categories/:categoryname/products", async (req, res) => {
  const { categoryname } = req.params;
  const { n, minPrice, maxPrice, sortBy, sortOrder, page = 1 } = req.query;

  if (!CATEGORIES.includes(categoryname)) {
    return res.status(400).json({ error: "Invalid category name" });
  }

  if (!n || isNaN(n) || n <= 0) {
    return res.status(400).json({ error: "Invalid value for n" });
  }

  let allProducts = [];
  for (const company of COMPANIES) {
    const products = await fetchProducts(
      company,
      categoryname,
      minPrice,
      maxPrice
    );
    products.forEach((product) => (product.id = uuidv4()));
    allProducts = allProducts.concat(products);
  }

  if (sortBy && sortOrder) {
    allProducts = sortProducts(allProducts, sortBy, sortOrder);
  }

  const totalProducts = allProducts.length;
  const pageSize = Math.min(parseInt(n), 10);
  const offset = (page - 1) * pageSize;
  const paginatedProducts = allProducts.slice(offset, offset + pageSize);

  res.json({
    totalProducts,
    products: paginatedProducts,
  });
});

app.get("/categories/:categoryname/products/:productid", async (req, res) => {
  const { categoryname, productid } = req.params;

  let product;
  for (const company of COMPANIES) {
    const products = await fetchProducts(company, categoryname);
    product = products.find((p) => p.id === productid);
    if (product) break;
  }

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
