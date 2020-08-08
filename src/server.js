import { join } from "path";
import events from "./events";
import express from "express";

// WS(Web Socket)는 HTTP의 GET/POST와는 또 다른 의사소통 방식(프로토콜)이다.
// HTTP에서 GET/POST 요청은 Stateless이다. 즉 HTTP에서 request를 전송하면,
// 서버는 해당 request에 대한 response를 보내준 후 유저와의 연결을 끊는다.
// 서버는 유저를 기억하지 않으며, 유저도 서버를 기억하지 않은 채로 서로에 대한 연결이 완전히 끊긴다.
// 따라서, 유저가 request를 요청할 때 마다 새로운 연결이 생성된다.

// 이에 반해 Web Socket에서의 연결은 Stateful하다. 즉, WebSocket에서는 서버가 유저가 누구인지를 계속 기억한다.
// 연결(세션)이 계속 유지되므로, 데이터를 주고받을 때 새로운 연결을 만들어 별도의 요청과 응답 과정을 거치지 않아도 된다.
// Web Socket에서는 대신 '이벤트'를 통해 서버와 클라이언트 사이의 통신을 구현한다.

// SocketIO는 WebSocket 개발을 쉽게 하기 위해 NodeJS 상에서 Socket을 구현한 realtime engine 프레임워크이다.
import socketIO from "socket.io";
import logger from "morgan";
import socketController from "./socketController";

const PORT = 4000;
const app = express();

app.set("view engine", "pug");
app.set("views", join(__dirname, "views"));

// 뷰 템플릿에 events 오브젝트를 전송함으로써 클라이언트 코드에서도 events 오브젝트를 사용하여 코드를 작성할 수 있도록 한다.
app.get("/", (req, res) =>
  res.render("home", { events: JSON.stringify(events) })
);
// express.static을 통해 static 디렉터리 내부 파일을 직접 접근할 수 있도록 한다.
// ex) static 폴더의 js 폴더의 main.js 파일을 'localhost:4000/js/main.js'를 통해 접근할 수 있다.
app.use(express.static(join(__dirname, "static")));
app.use(logger("dev"));

const handleListening = () =>
  console.log(`✅ server running: http://localhost:${PORT}`);

const server = app.listen(PORT, handleListening);

// 아래 코드는 SocketIO가 express 서버 위에 올라가 동일한 포트에서 동작하도록 한다.
// 원래 같은 포트에서 2개의 서버를 동시에 동작하게 할 수는 없다.
// 2개의 HTTP 서버가 같은 포트에 있다면 동작하지 않을 것이나,
// WS와 HTTP는 다른 프로토콜을 사용하므로 같은 서버에서 존재할 수 있다.

// SocketIO는 WebSocket 서버와 WebSocket 클라이언트가 동시에 될 수 있다.
// 즉, SocketIO로 서버를 프로그래밍 할 수 있고, SocketIO로 클라이언트도 프로그래밍 할 수 있다.

const io = socketIO.listen(server);

// 위에서 io라는 변수를 따로 만든 이유는 io가 서버로써 모든 이벤트들을 listen할 것이기 때문이다.
// Socket에서는 라우터를 사용하는 HTTP와 달리, 페이지가 없고 연결만이 존재하며 이벤트들을 가지고 있다.
// 이벤트는 모든 것들이 될 수 있으며, 서버/클라이언트는 모두 이벤트를 보낼 수 있고 받을 수도 있다.
// 이벤트 중에서 가장 중요한 것은 connection이다. 하나의 socket이 WebSocket 서버와 연결될 때 마다, 서버는 해당 socket에 대한 Connection이라는 이벤트를 전달받는다.
// 아래 callback 함수에서 socket은 방금 접속한 Socket을 나타내며, express HTTP의 req 객체라고 생각할 수 있다. 연결된 socket과 상호작용 할 수 있는 방법이다.

io.on("connection", socket => socketController(socket, io));

// localhost:4000/socket.io/socket.io.js로 들어가면 볼 수 있는 자바스크립트 코드는
// SocketIO 백엔드와 프런트엔드가 서로 대화할 수 있게 해주는 코드이다.
// 즉, SocketIO를 사용하기 위해서는 해당 파일이 백엔드와 프런트엔드 모두에 설치되어야 한다.

// WebSocket에서는 서버가 멈췄을 때에도 클라이언트의 socket은 계속 연결을 유지하며
// 서버에 지속적으로 접속하려고 시도한다. 서버가 다시 살아나면 그 즉시 다시 연결된다.
