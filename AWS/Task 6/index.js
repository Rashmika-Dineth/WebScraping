const { performance } = require("perf_hooks");

const read_obituary_notices1 = require("./read_obituary_notices1.js");
const read_obituary_notices2 = require("./read_obituary_notices2.js");
const read_obituary_notices3 = require("./read_obituary_notices3.js");
const read_obituary_notices4 = require("./read_obituary_notices4.js");

async function executeInOrder() {
  const startTime = performance.now();

  try {
    await read_obituary_notices1();
    await read_obituary_notices2();
    await read_obituary_notices3();
    await read_obituary_notices4();
  } catch (error) {
    console.error("An error occurred:", error.message);
  }

  const endTime = performance.now();
  console.log(`Execution Time: ${(endTime - startTime).toFixed(2)}ms`);
}

// Call the function
executeInOrder();
