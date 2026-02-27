function parseMessage(input) {
  if (!input) return null;

  const text = input.toLowerCase();

  // Extract amount
  const amountMatch = text.match(/\d+(\.\d+)?/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[0]);

  let type = "Expense";
  let category = "General";
  let title = input;

  //////////////////////////////////////////////////////
  // INTENT DETECTION (ORDER MATTERS)
  //////////////////////////////////////////////////////

  // Loan Given
  if (
    text.includes("gave") ||
    text.includes("loan given")
  ) {
    type = "Loan Given";
  }

  // Loan Taken
  else if (
    text.includes("took loan") ||
    text.includes("borrowed")
  ) {
    type = "Loan Taken";
  }

  // Loan Repaid (Given)
  else if (
    text.includes("repaid loan to") ||
    text.includes("repay given")
  ) {
    type = "Loan Repaid (Given)";
  }

  // Loan Repaid (Taken)
  else if (
    text.includes("repaid") &&
    text.includes("loan")
  ) {
    type = "Loan Repaid (Taken)";
  }

  // Income
  else if (
    text.includes("got") ||
    text.includes("received") ||
    text.includes("income") ||
    text.includes("salary")
  ) {
    type = "Income";
  }

  // Default = Expense


  //////////////////////////////////////////////////////
  // CATEGORY DETECTION
  //////////////////////////////////////////////////////

  const categoryKeywords = [
    "fuel",
    "food",
    "groceries",
    "cigarettes",
    "bills",
    "family",
    "rent",
    "salary"
  ];

  for (const keyword of categoryKeywords) {
    if (text.includes(keyword)) {
      category =
        keyword.charAt(0).toUpperCase() +
        keyword.slice(1);
      break;
    }
  }

  return {
    amount,
    type,
    category,
    title,
  };
}

module.exports = parseMessage;