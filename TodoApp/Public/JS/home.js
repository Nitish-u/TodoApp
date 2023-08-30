const body = document.body;
const lists = document.querySelector(".lists");
const titleBox = document.querySelector(".title");
const TodoDataBox = document.querySelector(".addTodo");
const waringCard = document.querySelector(".warn");
const waringLine = document.querySelector(".warning");
const warningTimer = document.querySelector(".warningTimer");
let warningTimerid;
let crdDltFn;
// Colors for the card design
const colorCombinations = [
  ["#FF5733", "#FFFFFF"], // Bright Red
  ["#FFC300", "#000000"], // Vivid Yellow
  ["#FF45D1", "#FFFFFF"], // Hot Pink
  ["#FFA07A", "#000000"], // Light Salmon
  ["#00FFFF", "#000000"], // Cyan
  ["#00FF00", "#000000"], // Bright Green
  ["#FFD700", "#000000"], // Gold
  ["#FF1493", "#FFFFFF"], // Deep Pink
  ["#FF6347", "#FFFFFF"], // Tomato Red
  ["#FF00FF", "#FFFFFF"], // Fuchsia
  ["#00FF7F", "#000000"], // Spring Green
  ["#FF4500", "#FFFFFF"], // Orange Red
  ["#FFFF00", "#000000"], // Bright Yellow
  ["#ADFF2F", "#000000"], // Green Yellow
  ["#FF69B4", "#000000"], // Hot Pink
  ["#00BFFF", "#FFFFFF"], // Deep Sky Blue
  ["#FF8C00", "#FFFFFF"], // Dark Orange
  ["#FFC0CB", "#000000"], // Pink
  ["#FFDAB9", "#000000"], // Peach Puff
  ["#7B68EE", "#FFFFFF"], // Medium Slate Blue
];

const cardsIdContainer = [];
window.addEventListener("load", (e) => {
  document.cookie = "lastCard = 0";
  const W = lists.offsetWidth;
  const noOfCards = Math.floor((W + 8) / 296);
  for (let i = 0; i < noOfCards; i++) {
    const flexCol = document.createElement("div");
    flexCol.classList.add("flexCol");
    flexCol.setAttribute("id", `flexCol-${i}`);
    lists.appendChild(flexCol);
    cardsIdContainer.push(`flexCol-${i}`);
  }
  fetch("/getTodoData")
    .then(async (response) => await response.json())
    .then((data) => {
      if (data.usersTodoData) {
        oldDataCardCreator(data.usersTodoData);
      }
    })
    .catch((error) => {
      console.log(`we have got and error :- `, error);
    });
});

function oldDataCardCreator(data) {
  data.forEach((element) => {
    let todoSentences = "";
    const doneOrNot = [];
    const title = element[0];
    for (let i = 1; i < element.length; i++) {
      const todo = element[i][0];
      const checkedornot = element[i][1];
      todoSentences += todo;
      todoSentences += ";";
      doneOrNot.push(checkedornot);
    }
    newCardCreator(title, todoSentences, doneOrNot);
  });
}

function dataSync() {
  let data = [];
  // This statement will create an array of all the data created by user it will contain 1. arrays(datafragments) and each will carry the data from different cards.
  for (let i = 0; i < lists.children.length; i++) {
    // Running loop for all the flex columns in lists container
    for (let k = 0; k < lists.children[i].children.length; k++) {
      // Running loop for the data collection of every card in the flex column section.
      let dataFragments = [];
      // this data fragment will created every time when the loop repeats itself and will store the Heading and the todo todos for each card separately.
      for (let j = 0; j < lists.children[i].children[k].children.length; j++) {
        // This statement will run the loop for all the elements present in the card.
        if (j == 0) {
          // This is for seperating the heading form the todos to easily identify card.
          const heading =
            lists.children[i].children[k].children[j].firstChild.textContent;
          dataFragments.push(heading);
        } else {
          let todos = [];
          // This will create an empty for every todo and will store two thing 1. the todo text and 2. whether it is checked/Completed(1) or not(0).
          const todo =
            lists.children[i].children[k].children[j].children[1].textContent;
          todos.push(todo);
          if (lists.children[i].children[k].children[j].children[0].checked) {
            // checking if the todo is checked/completed/accomplished or not.
            todos.push(1);
          } else {
            todos.push(0);
          }
          dataFragments.push(todos);
        }
      }
      data.push(dataFragments);
    }
  }
  fetch("/syncData", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json", // Set the Content-Type header to indicate JSON data
    },
  })
    .then((a) => {
      if (a.ok) {
        return a.json();
      } else {
        throw Error("unable to send the data");
      }
    })
    .then((msg) => {
      console.log(msg);
    })
    .catch((e) => {
      console.log(`some error occured`, e);
    });
  addingAndRemovingAttributesToSyncBtn(1);
}

function dltCookie(a) {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const splitedCookie = cookies[i].split("=");
    if (splitedCookie[0].trim() == a) {
      document.cookie = `${a}=;Max-Age=0;`;
    }
  }
  // Return null if the cookie with the specified name is not found
  return null;
}

function getCookie(cookieName) {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const splitedCookie = cookies[i].split("=");
    if (splitedCookie[0].trim() == cookieName) {
      return splitedCookie[1];
    }
    // Return null if the cookie with the specified name is not found
  }
  return null;
}

function createTodo() {
  const todoTitle = titleBox.value;
  const todoData = TodoDataBox.value;
  if (todoTitle.trim() == "") {
    waringLine.textContent = `Please mention any heading of your todo.`;
    warningTimer.classList.add("timerAnime");
    waringCard.style.display = "block";
    warningTimerid = setTimeout(() => {
      warningTimer.classList.remove("timerAnime");
      waringCard.style.display = "none";
    }, 5000);
    return;
  } else if (todoData.trim() == "") {
    waringLine.textContent = `Please mention any todo that you want to add.`;
    warningTimer.classList.add("timerAnime");
    waringCard.style.display = "block";
    warningTimerid = setTimeout(() => {
      warningTimer.classList.remove("timerAnime");
      waringCard.style.display = "none";
    }, 5000);
    return;
  }
  // searching if there is any card with same heading
  const looplimit = lists.children.length - 1;
  // This looplimit is for running the loop for all the cards in the lists section.
  for (let i = 0; i <= looplimit; i++) {
    for (let j = 0; j < lists.children[i].children.length; j++) {
      const titleFound = lists.children[i].children[j].children[0].textContent;
      // checking if the title is defined of not.
      if (titleFound.trim().toLowerCase() == todoTitle.trim().toLowerCase()) {
        // comparing the title of card with the title we extracted from the title input box. If we able to find a card then we will store the card and use it for adding other todos with same headings.
        const foundCard = lists.children[i].children[j];
        // foundCard ==> the card with the same heading.
        const updatedCard = cardElementsCreator(foundCard, todoData);
        // updatedCard ==> this is the updated card which contain all the previous and the new todos.
        lists.children[i].replaceChild(updatedCard, foundCard);
        // Then we are replacing the old card with the new one.
        return;
      }
    }
  }
  newCardCreator(todoTitle, todoData);
  addingAndRemovingAttributesToSyncBtn(1);
  return;
}

function newCardCreator(title, todoDatas, completionDetails) {
  // Creating card, Card title and card's bin img blocks
  const newCard = document.createElement("div");
  const dlt = document.createElement("div");
  const cardTitle = document.createElement("h4");
  // Picking random color combination for the created card
  const randomCombo = colorCombinations[Math.floor(Math.random() * 20)];
  // Adding attributes for the style of elments that will be added in this card
  newCard.setAttribute(
    "style",
    `--firstColor:${randomCombo[0]}; --secondColor:${randomCombo[1]};`
  );
  // Adding data to the created elements
  dlt.innerHTML = `<img src = "./SVGs/add-circle-svgrepo-com.svg" alt = "add more todos" class="add-logo"><img src = "./SVGs/trash-bin-svgrepo-com.svg" alt = "bin logo" class = "bin-logo">`;
  const capitalLetter = title[0].toUpperCase();
  cardTitle.textContent = capitalLetter + title.slice(1, title.length);
  //Adding classes
  newCard.classList.add("card");
  cardTitle.classList.add("cardTitle");
  dlt.classList.add("bin");
  //Appending childs
  newCard.appendChild(cardTitle);
  // newCard.appendChild(cardData);
  cardTitle.appendChild(dlt);
  const createdCard = cardElementsCreator(
    newCard,
    todoDatas,
    completionDetails
  );
  // Creating columns for the lists section
  // Finding how many columns we have to create
  // screenWidth = W

  const columnNumInWhichTheCardWillBeAdd = getCookie(`lastCard`);
  const columnWhereToAddTheCard = document.querySelector(
    `#${cardsIdContainer[columnNumInWhichTheCardWillBeAdd]}`
  );
  columnWhereToAddTheCard.appendChild(createdCard);
  if (columnNumInWhichTheCardWillBeAdd) {
    if (columnNumInWhichTheCardWillBeAdd < cardsIdContainer.length - 1) {
      document.cookie = `lastCard = ${+columnNumInWhichTheCardWillBeAdd + 1}`;
    } else {
      document.cookie = `lastCard = 0`;
    }
  }
}

function cardElementsCreator(card, todoDatas, completionDetails) {
  // We are checking how many todos user wants to add
  // TodoDatas => value of input box haveing placeholder => add some things to do
  const todoDataSet = todoDatas.split(";");
  for (let i = 0; i < todoDataSet.length; i++) {
    if (todoDataSet[i].trim() != "") {
      // Creating todo element
      const cardData = document.createElement("p");
      const checkbox = document.createElement("input");
      const span = document.createElement("span");
      const editSingleTodo = document.createElement("span");
      // Adding classes to the created elements
      cardData.classList.add("cardDataParent");
      checkbox.classList.add("myCheckbox");
      span.classList.add("cardData");
      editSingleTodo.classList.add("editSingleTodo");
      // Adding data to the created elements
      checkbox.type = "checkbox";
      span.textContent = todoDataSet[i];
      editSingleTodo.innerHTML = `<img class="editSingleTodo" src="./SVGs/edit-svgrepo-com.svg" alt="Delete this todo"><img class="save-changes" src = "./SVGs/correct-signal-svgrepo-com.svg" alt = "save changes" style = "display:none;"> <img class="cancel-changes" src = "./SVGs/cross-svgrepo-com (1).svg" alt = "cancel editing" style = "display:none;">`;
      // Adding properties of checkboxes if available.
      if (completionDetails) {
        if (completionDetails[i] == 1) {
          checkbox.checked = true;
        }
      }
      // Appending child of the card provided via params
      cardData.appendChild(checkbox);
      cardData.appendChild(span);
      cardData.appendChild(editSingleTodo);
      card.appendChild(cardData);
    }
  }
  return card;
}

body.addEventListener("click", (e) => {
  switch (e.target.classList[0]) {
    case "addTodoBtn":
      createTodo();
      break;
    case "myCheckbox":
      addingAndRemovingAttributesToSyncBtn(0); // removing attribtues
      break;
    case "cross":
      clearTimeout(warningTimerid);
      setTimeout(() => {
        warningTimer.classList.remove("timerAnime");
        waringCard.style.display = "none";
      }, 0);
      break;

    case "bin-logo":
      // e.target.parentNode.parentNode.parentNode.classList.add("widthDecrement");
      e.target.parentNode.parentNode.parentNode.remove();
      addingAndRemovingAttributesToSyncBtn(0); // removeing attributes
      break;

    case "add-logo":
      titleBox.value = e.target.parentNode.parentNode.firstChild.textContent;
      TodoDataBox.value = "";
      TodoDataBox.focus();
      break;

    case "editSingleTodo":
      const randomID = Math.floor(Math.random() * 1000);
      e.target.classList.add(`Editing${randomID}`);
      document.cookie = `Editing${randomID} = ${e.target.parentNode.previousElementSibling.textContent}`;
      // We are setting this cookies so that we can use this cookies value to while reterving the last value of todo that is being edited.
      e.target.parentNode.previousElementSibling.setAttribute(
        "contenteditable",
        "true"
      );
      settingFocus(e.target.parentNode.previousElementSibling);
      e.target.style.display = "none";
      e.target.parentNode.children[1].style.display = "block";
      e.target.parentNode.children[2].style.display = "block";
      break;

    case "save-changes":
      e.target.parentNode.parentNode.children[1].setAttribute(
        "contenteditable",
        "false"
      );
      if (e.target.parentNode.parentNode.children[1].textContent.trim() == "") {
        e.target.parentNode.parentNode.remove();
      }
      e.target.parentNode.children[0].style.display = "block";
      e.target.parentNode.children[1].style.display = "none";
      e.target.parentNode.children[2].style.display = "none";
      dltCookie(e.target.parentNode.children[0].classList[1]);
      e.target.parentNode.children[0].classList.remove(
        e.target.parentNode.children[0].classList[1]
      );
      addingAndRemovingAttributesToSyncBtn(0); // removing attributes
      break;
    case "cancel-changes":
      e.target.parentNode.parentNode.children[1].setAttribute(
        "contenteditable",
        "false"
      );
      e.target.parentNode.parentNode.children[1].textContent = getCookie(
        e.target.parentNode.children[0].classList[1]
      );
      dltCookie(e.target.parentNode.children[0].classList[1]);
      e.target.parentNode.children[0].classList.remove(
        e.target.parentNode.children[0].classList[1]
      );
      e.target.parentNode.children[0].style.display = "block";
      e.target.parentNode.children[1].style.display = "none";
      e.target.parentNode.children[2].style.display = "none";
      break;
    case "Logout":
      logoutFunc();
      break;
    case "sync":
      sync();
      break;
  }
});

function addingAndRemovingAttributesToSyncBtn(a) {
  if (a == 0) {
    // removes attribute
    if(document.querySelector(".sync").style){
      document.querySelector(".sync").removeAttribute("style");
    }
    document.querySelector(".sync").innerText = "Sync";
  } else {
    // Adds attribute
    setTimeout(() => {
      document
        .querySelector(".sync")
        .setAttribute(
          "style",
          "background-color:#00bc00;border-color:#00bc00;color:#ffffff;"
        );
      document.querySelector(".sync").innerText = "Synced!";
    }, 200);
    setTimeout(() => {
      alert("Data synced successfully");
    }, 500);
  }
}

function sync() {
  if (lists.children.length == 0) {
    const userWish = prompt(
      "It seems you want to delete everything since your todo list is empty if its true then type 'yes' and click ok!"
    );
    if (userWish == null || userWish == undefined) {
      alert("We are not syncing the changes!");
    } else {
      if (userWish.trim().toLocaleLowerCase() == "yes") {
        dataSync();
      } else {
        alert("Please pass appropriate text!");
      }
    }
  } else {
    dataSync();
  }
}

function logoutFunc() {
  window.location.href = `/logout`;
}

function settingFocus(element) {
  element.focus();
  moveCaretToEnd(element);
}

function moveCaretToEnd(element) {
  if (
    typeof window.getSelection != "undefined" &&
    typeof document.createRange != "undefined"
  ) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    const textRange = document.body.createTextRange();
    textRange.moveToElementText(element);
    textRange.collapse(false);
    textRange.select();
  }
}