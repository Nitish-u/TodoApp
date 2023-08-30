const alertBox = document.querySelector(".alert");
const msgBox = document.querySelector(".msg");
const timer = document.querySelector(".time");
const passwordBox = document.querySelector("#passwordBox");
const setPasswordBox = document.querySelector(`input[placeholder="Set Password*"]`);
const regBtn = document.querySelector(`input[value="Register"]`);
const cnfrmPassword = document.querySelector(`input[placeholder="Confirm Password*"]`);
const body = document.body;

// This function reads cookies and return the value which by default is containing the message.
function getCookieValue(cookieName) {
  const cookies = document.cookie;
  const cookieArray = cookies.split(';');
  for (const cookie of cookieArray) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null; // Cookie not found
}
setTimeout(() => {
    msgBox.innerText = getCookieValue("Msg");
    alertBox.style.display = "block";
    timer.classList.add("anime");
  },500);
  setTimeout(() => {
    msgBox.innerText = "";
    alertBox.style.display = "none";
    timer.classList.remove("anime");
},5500);

body.addEventListener("click",e => {
  switch(e.target.id){
    case 'closedEye':
      e.target.style.display = "none";
      e.target.nextSibling.style.display = "inline-block";
      passwordBox.setAttribute("type","text");
      break;
    case 'openEye':
      e.target.style.display = "none";
      e.target.previousSibling.style.display = "inline-block";
      passwordBox.setAttribute("type","password");
      break;
  }
})

function passwordChecking(){
  if(setPasswordBox.value){
    if(setPasswordBox.value == cnfrmPassword.value){
      cnfrmPassword.style.color = "black";
      regBtn.removeAttribute("disabled");
    }
  }
}
if(cnfrmPassword){
  cnfrmPassword.addEventListener("input",passwordChecking);
}
