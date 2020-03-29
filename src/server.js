import { join } from "path";
import express from "express";
// WS(Web Socket)는 HTTP의 GET/POST와는 또 다른 의사소통 방식(프로토콜)이다.
// HTTP에서 GET/POST 요청은 Stateless이다. 즉 HTTP에서 request를 전송하면,
// 서버는 해당 request에 대한 response를 보내준 후 모든 요청이 끝난다.
// 서버는 유저를 기억하지 않으며, 유저도 서버를 기억하지 않은 채로 서로에 대한 연결이 완전히 끊긴다.

// 이에 반해 Web Socket에서의 연결은 Stateful하다. 즉, WebSocket에서는 서버가 유저가 누구인지를 계속 기억한다.
// 연결(세선)이 계속 유지되므로 데이터를 주고받을 때 새로운 연결을 만들어 별도의 요청과 응답 과정을 거치지 않아도 된다.

// SocketIO는 WebSocket 개발을 쉽게 하기 위해 Socket을 구현한 것이다.
import socketIO from "socket.io";

const PORT = 4000;
const app = express();
app.set("view engine", "pug");
app.set("views", join(__dirname, "views"));
app.get("/", (req, res) => res.render("home"));
app.use(express.static(join(__dirname, "static")));

const handleListening = () =>
  console.log(`✅ server running: http://localhost:${PORT}`);

const server = app.listen(PORT, handleListening);

// SocketIO가 express 서버 위에 올라가 동일한 포트에서 동작하도록 한다.
// 원래 같은 포트에서 2개의 서버를 동시에 동작하게 할 수는 없다.
// 2개의 HTTP 서버가 같은 포트에 있다면 동작하지 않은 것이나,
// WS와 HTTP는 같은 서버에서 존재할 수 있다.

// SocketIO는 WebSocket 서버와 WebSocket 클라이언트가 동시에 될 수 있다.
// 즉, SocketIO로 서버를 프로그래밍 할 수 있고, SocketIO로 클라이언트도 프로그래밍 할 수 있다.
const io = socketIO.listen(server);

// localhost:4000/socket.io/socket.io.js로 들어가면 볼 수 있는 자바스크립트 코드는
// SocketIO 백엔드와 프런트엔드가 서로 대화할 수 있게 해주는 코드이다.
