window.onload = function () {
	console.log('hello');

	var variables = {};
	var calculate = {};
	var allVariables = {};
	var allInputs = {};

	var submitButton = document.getElementById('submit');
	var resultsContainer = document.getElementById('stage');
	var errorSpan = document.getElementById('error-dump');

	submitButton.addEventListener('click', function () {

		variables = {};
		calculate = {};
		allVariables = {};
		allInputs = {};

		resultsContainer.innerHTML = '';
		errorSpan.innerHTML = '';

		var expressionTextArea = document.getElementById('expressions');

		var expressions = expressionTextArea.value;

		var expressionsArray = expressions.split('\n');

		expressionsArray.forEach(function (expression) {
			var expressionParserArray = expression.split('=');
			var variable = expressionParserArray[0].trim();
			var expressionCondition = expressionParserArray[1];
			
			updateExpressionAndDependencies(variable, expressionCondition);
		});

		for(item in allVariables) {
			var expressionContainer = document.createElement('div');
			var input = document.createElement('input');
			var span = document.createElement('span');
			
			input.type = "text";
			input.value = 0;
			if (!variables[item])
				input.readOnly = "true";
			allInputs[item] = input;

			span.innerHTML = item;

			input.addEventListener('input', inputChangeHandler.bind(undefined, item));

			expressionContainer.appendChild(span);
			expressionContainer.appendChild(input);

			resultsContainer.appendChild(expressionContainer);
		}
	});


	function updateExpressionAndDependencies(variable, expressions) {
		var regexpressionArray = [...expressions.matchAll(/\ *([A-Za-z]+)?\ *(?:([-+])\ *([A-Za-z]))\ */g)];

		allVariables[variable] = 0;
		console.log(regexpressionArray);
		regexpressionArray.forEach(function (item) {
			if (item[1]) {
				populateVariableDependency(variable, item[1]);
				allVariables[item[1]] = 0;
			}
			if (item[2]) {
				populateCalculateLogic(item[1], item[2], item[3], variable);
			}
			if (item[3]) {
				populateVariableDependency(variable, item[3]);
				allVariables[item[3]] = 0;
			}
		});

	}

	function populateVariableDependency (dependency, vble) {

		if (variables[dependency] && variables[dependency].includes(vble)) {
			showError('Invalid expression');
			throw new Error('invalid expression');
		}

		if (variables[vble])
			!variables[vble].includes(dependency) && variables[vble].push(dependency);
		else
			variables[vble] = [dependency];
	}

	function populateCalculateLogic(operand1, operator, operand2, result) {
		if (!calculate[result]) {
			calculate[result] = {
				operators: [operator],
				operands: [operand1, operand2]
			}
		}
		else {
			operand1 && calculate[result].operands.push(operand1);
			operand2 && calculate[result].operands.push(operand2);
			calculate[result].operators.push(operator);
		}
	}

	function inputChangeHandler(variable, eventVar) {
		var value = getInputValue(eventVar.target);
		allVariables[variable] = value;

		updateCalculations(variable);

		console.log(variable);
		console.log(value);
	}


	function updateCalculations (variable) {
		var dependencies = variables[variable];

		if (!dependencies) {
			return;
		}

		dependencies.forEach(function (dependency) {
			var updatedValue = calculateExpression(dependency);
			allVariables[dependency] = updatedValue;
			allInputs[dependency].value = updatedValue;
			if (dependency != variable)
				updateCalculations(dependency);
		});
	}

	function calculateExpression (variable) {
		var value = getInputValue(allInputs[calculate[variable].operands[0]]);
		var operatorIndex = 0;

		calculate[variable].operands.slice(1).forEach(function (operand) {
			value = performOperation(value, getInputValue(allInputs[operand]), calculate[variable].operators[operatorIndex++]);
		});

		return value;
	}

	function performOperation (operand1, operand2, operator) {

		switch(operator) {
			case '+':
				return operand1 + operand2;
			case '-':
				return operand1 - operand2;
		}
	}

	function getInputValue (inputElement) {
		return parseInt(inputElement.value) || 0;
	}

	function showError (message) {
		errorSpan.innerHTML = message;
	}
}
