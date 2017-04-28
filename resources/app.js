( function() {
		/*
		* Todo app front-end.
		*
		* WORK IN PROGRESS
		*/

		// Todo name field.
		var todo_name = document.getElementById('todo_name');
		// Todo description field.
		var todo_desc = document.getElementById('todo_desc');
		// The add button.
		var addbtn = document.getElementById('addbtn');
		// Remove buttons
		var removeTodoBtn = document.getElementById('removeTodo');
		var removeDoneTodoBtn = document.getElementById('removeDoneTodo');
		// The lists containing the todos.
		var lists = {
			todo : document.getElementById('todo'),
			done : document.getElementById('done')
		};
		
		var BASE_URL = "https://todoapp-vmate.herokuapp.com/";

		/*
		 * Makes a task HTML from the given parameters.
		 * This will result in a list element which looks something like this:
		 *
		 * <li id="taskId">
		 * 	<input type="checkbox">
		 * 	<span id="todoName">todoNameStr</span>
		 * 	<span id="todoDescription">todoDescStr</span>
		 * </li>
		 *
		 */
		var makeTaskHtml = function(taskId, todoNameStr, todoDescStr, onCheck, isDone) {
			var listElement = document.createElement('li');
			var checkbox = document.createElement('input');
			var todoNameLabel = document.createElement('h4');
			var todoDescriptionLabel = document.createElement('span');
			var removeButton = document.createElement('button');
			
			listElement.id = taskId;
			todoNameLabel.id = "todoName";
			todoDescriptionLabel.id = "todoDescription";
			removeButton.id = isDone ? 'removeDoneTodo' : 'removeTodo';

			checkbox.type = 'checkbox';
			checkbox.checked = isDone;
			checkbox.addEventListener('click', onCheck);

			todoNameLabel.textContent = todoNameStr;
			todoDescriptionLabel.textContent = todoDescStr;
			
			removeButton.addEventListener('click', onRemove);
			removeButton.innerHTML = "Remove";

			listElement.appendChild(checkbox);
			listElement.appendChild(todoNameLabel);
			listElement.appendChild(removeButton);			
			listElement.appendChild(todoDescriptionLabel);

			return listElement;
		};

		/*
		 * Adds a task to the todo list.
		 */
		var addTaskToTodos = function(task) {
			lists.todo.appendChild(task);
		};

		/*
		 * Adds a task to the done list.
		 */
		var addTaskToDoneTodos = function(task) {
			lists.done.appendChild(task);
		};

		/*
		 * This method decides what happens on checking a checkbox near a todo.
		 * What happens is that the todo will get into the done list and vice versa.
		 */
		var onCheck = function(event) {
			var task = event.target.parentElement;
			var list = task.parentElement.id;

			if (list == 'todo') {
				lists.done.appendChild(task);
				addToDone(new XMLHttpRequest, BASE_URL + "/addtodone", task.id);
				this.checked = true;
			} else {
				lists.todo.appendChild(task);
				addToTodo(new XMLHttpRequest, BASE_URL + "/addtotodo", task.id);
				this.checked = false;
			};

			todo_name.focus();
		};
		
		var onRemove = function(event) {
			var task = event.target.parentElement;
			var list = task.parentElement.id;
			
			if (list == 'todo') {
				removeTodo(new XMLHttpRequest, BASE_URL + "/removetodo", task.id);
			} else {
				removeTodo(new XMLHttpRequest, BASE_URL + "/removefromdone", task.id);
			};
		};

		/*
		 * Adds a todo to the unordered HTML list.
		 * (This will add the todo to the database as well but it's not done yet.)
		 */
		var onInput = function() {
			var tNameValue = todo_name.value.trim();
			var tDescriptionValue = todo_desc.value.trim();

			var todoNameStr = "Todo: " + tNameValue;
			var todoDescStr = " | Description: " + tDescriptionValue;
			var taskStr = todoNameStr + todoDescStr;

			if (tNameValue.length > 0 && tDescriptionValue.length > 0) {
				addNewTodo(new XMLHttpRequest, BASE_URL + "/addnewtodo", tNameValue, tDescriptionValue);
				todo_name.value = '';
				todo_desc.value = '';
			};
			todo_name.focus();
		};

		/*
		 * Gets a list of todos as a parameter
		 * and puts them into an unordered HTML list
		 * by calling the addTaskToTodos method which
		 * gets a result from the makeTaskHtml method as a parameter.
		 */
		var addTodosToHTML = function(listOfTodo) {
			for (var i in listOfTodo) {
				var todoNameStr = listOfTodo[i][0];
				var todoDescStr = listOfTodo[i][1];
				addTaskToTodos(makeTaskHtml(i, todoNameStr, todoDescStr, onCheck, false));
			}
		};

		var addDoneTodosToHTML = function(listOfTodo) {
			for (var i in listOfTodo) {
				var todoNameStr = listOfTodo[i][0];
				var todoDescStr = listOfTodo[i][1];
				addTaskToDoneTodos(makeTaskHtml(i, todoNameStr, todoDescStr, onCheck, true));
			}
		};

		/*
		 * Processes the response from the backend by parsing
		 * a JSON encoded list into a list of todo and passing it as a parameter to the
		 * addTodosToHTML method (migth need to get rid of this).
		 */
		var processResponse = function(dataToProcess) {
			var resultTodoList = [];
			for (var i = 0; i < dataToProcess.length; i++) {
				resultTodoList[dataToProcess[i].todoId] = [dataToProcess[i].todoName, dataToProcess[i].todoDescription];
			};
			return resultTodoList;
		};

		/*
		 * Sends a request to get all todos from the todo table
		 * and puts them into an unordered HTML list by calling
		 * the processResponse method.
		 */
		var getTodos = function(xhttpRequest, requestUrl) {
			xhttpRequest.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					addTodosToHTML(processResponse(JSON.parse(this.responseText)));
				}
			};
			xhttpRequest.open("GET", requestUrl, true);
			xhttpRequest.send();
		};

		/*
		 * Sends a get request to the backend
		 * to get the todos from the done table.
		 * Same as getTodos.
		 */
		var getDoneTodos = function(xhttpRequest, requestUrl) {
			xhttpRequest.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					addDoneTodosToHTML(processResponse(JSON.parse(this.responseText)));
				}
			};
			xhttpRequest.open("GET", requestUrl, true);
			xhttpRequest.send();
		};

		/*
		 * Sends a request to put an existing todo
		 * to the done table.
		 */
		var addToDone = function(xhttpRequest, requestUrl, todoId) {
			xhttpRequest.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					location.reload();
				}
			};
			xhttpRequest.open("POST", requestUrl + "?id=" + todoId, true);
			xhttpRequest.send();
		};

		var addToTodo = function(xhttpRequest, requestUrl, todoId) {
			addToDone(xhttpRequest, requestUrl, todoId);
		};

		var addNewTodo = function(xhttpRequest, requestUrl, todoName, todoDesc) {
			var parameters = "?name=" + todoName + "&description=" + todoDesc;
			var reqStr = requestUrl + parameters;
			xhttpRequest.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					location.reload();
				}
			};
			xhttpRequest.open("POST", reqStr, true);
			xhttpRequest.send();
		};
		
		var removeTodo = function(xhttpRequest, requestUrl, todoId) {
			xhttpRequest.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					location.reload();
				}
			};
			xhttpRequest.open("POST", requestUrl + "?id=" + todoId, true);
			xhttpRequest.send();
		};

		/*
		 * Add eventlisteners to the add button
		 * and the todo description field.
		 */
		var addEventListeners = function() {
			// On a click event
			addbtn.addEventListener('click', onInput);
			// On pressing the Enter key
			todo_desc.addEventListener('keyup', function(event) {
				var code = event.keyCode;
				if (code == 13) {
					onInput();
				};
			});
		};

		/*
		 * Contains the main method calls.
		 */
		var main = function() {
			addEventListeners();
			getTodos(new XMLHttpRequest(), BASE_URL + "/todosasjson");
			getDoneTodos(new XMLHttpRequest(), BASE_URL + "/donetodosasjson");
			todo_name.focus();
		};

		main();
	}()
);

