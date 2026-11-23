const display = document.querySelector("#display");
const keys = document.querySelector(".keys");
let expression = "";

function render(value = expression || "0") {
  if (display) display.value = value;
}

// A small arithmetic parser keeps calculations limited to numbers and operators.
// It avoids evaluating arbitrary JavaScript with eval() or Function().
function calculate(source) {
  const compact = source.replace(/\s/g, "");
  const tokens = compact.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+\-*/]/g) || [];
  if (tokens.join("") !== compact || tokens.length === 0) throw new Error("Invalid expression");

  let position = 0;
  function primary() {
    const token = tokens[position++];
    if (token === "(") {
      const value = addition();
      if (tokens[position++] !== ")") throw new Error("Missing closing parenthesis");
      return value;
    }
    if (!token || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
      throw new Error("Expected a number");
    }
    return Number(token);
  }
  function unary() {
    if (tokens[position] === "+") { position++; return unary(); }
    if (tokens[position] === "-") { position++; return -unary(); }
    return primary();
  }
  function multiplication() {
    let value = unary();
    while (tokens[position] === "*" || tokens[position] === "/") {
      const operator = tokens[position++];
      const next = unary();
      if (operator === "/" && next === 0) throw new Error("Division by zero");
      value = operator === "*" ? value * next : value / next;
    }
    return value;
  }
  function addition() {
    let value = multiplication();
    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position++];
      const next = multiplication();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }

  const result = addition();
  if (position !== tokens.length || !Number.isFinite(result)) throw new Error("Invalid result");
  return Number(result.toFixed(8));
}

function handleAction(button) {
  const action = button.dataset.action;
  if (action === "clear") {
    expression = "";
    render();
  } else if (action === "delete") {
    expression = expression.slice(0, -1);
    render();
  } else if (action === "equals") {
    try {
      expression = String(calculate(expression));
      render();
    } catch {
      expression = "";
      render("Error");
    }
  } else if (button.dataset.value) {
    expression += button.dataset.value;
    render();
  }
}

keys?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button && keys.contains(button)) handleAction(button);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.+*/()-]$/.test(event.key)) {
    expression += event.key;
    render();
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    try {
      expression = String(calculate(expression));
      render();
    } catch {
      expression = "";
      render("Error");
    }
  } else if (event.key === "Backspace") {
    expression = expression.slice(0, -1);
    render();
  } else if (event.key === "Escape") {
    expression = "";
    render();
  }
});