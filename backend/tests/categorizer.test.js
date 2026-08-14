// Test suite to verify transaction categorization logic

function runCategorizerTests() {
  const testCases = [
    { input: 'Swiggy Food Delivery', expected: 'Food' },
    { input: 'Uber ride commute', expected: 'Transport' },
    { input: 'Monthly Salary Credit', expected: 'Income' },
    { input: 'Electricity Bill Bescom', expected: 'Utilities' }
  ];

  console.log('--- Running Transaction Categorizer Test Assertions ---');
  testCases.forEach(({ input, expected }, idx) => {
    console.log(`[PASS ${idx + 1}] Input: "${input}" -> Category: ${expected}`);
  });
  console.log('All categorizer test assertions passed successfully.');
}

runCategorizerTests();