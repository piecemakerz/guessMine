import { initSockets } from "./sockets";

const body = document.querySelector("body");
const loginForm = document.getElementById("jsLogin");

const NICKNAME = "nickname";
const LOGGED_OUT = "loggedOut";
const LOGGED_IN = "loggedIn";

const nickname = localStorage.getItem(NICKNAME);

const logIn = nickname => {
  // 서버와 통신하는 클라이언트의 socket 생성
  const socket = io("/");
  initSockets(socket);
  socket.emit(window.events.setNickname, { nickname });
};

const handleFormSubmit = e => {
  e.preventDefault();
  const input = loginForm.querySelector("input");
  const { value } = input;
  input.value = "";
  localStorage.setItem(NICKNAME, value);
  body.className = LOGGED_IN;
  logIn(value);
};

if (nickname === null) {
  body.className = LOGGED_OUT;
} else {
  body.className = LOGGED_IN;
  logIn(nickname);
}

if (loginForm) {
  loginForm.addEventListener("submit", handleFormSubmit);
}
