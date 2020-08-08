import events from "./events";
import { chooseWord } from "./words";

// 서버에 연결된 모든 소켓들에 대한 정보
let sockets = [];

let inProgress = false;
let word = null;
let leader = null;
let timeout = null;

const chooseLeader = () => sockets[Math.floor(Math.random() * sockets.length)];

// 서버와 연결된 특정 socket에 대한 control들을 정의한다.
const socketController = (socket, io) => {
  // 이벤트가 특정 data와 함께 전송된다면 해당 data 객체를 받을 수 있다.

  // socket.emit은 socket에 특정 이벤트를 보낸다.
  // socket.broadcast.emit은 socket을 제외한 서버의 다른 모든 socket들에게 특정 이벤트를 보낸다.
  const broadcast = (event, data) => socket.broadcast.emit(event, data);

  // io.emit을 통해서 현재 서버에 연결된 모든 socket들에 대해 이벤트를 발생시킬 수 있다.
  const superBroadcast = (event, data) => io.emit(event, data);
  const sendPlayerUpdate = () =>
    superBroadcast(events.playerUpdate, { sockets });

  const startGame = () => {
    if (sockets.length > 1) {
      if (inProgress === false) {
        inProgress = true;
        leader = chooseLeader();
        word = chooseWord();
        superBroadcast(events.gameStarting);
        setTimeout(() => {
          superBroadcast(events.gameStarted);
          io.to(leader.id).emit(events.leaderNotif, { word });
          timeout = setTimeout(endGame, 30000);
        }, 3000);
      }
    }
  };

  const endGame = () => {
    inProgress = false;
    superBroadcast(events.gameEnded);
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    setTimeout(() => startGame(), 2000);
  };

  const addPoints = id => {
    sockets = socket.map(socket => {
      if (socket.id === id) {
        socket.points += 10;
      }
      return socket;
    });
    sendPlayerUpdate();
    endGame();
    clearTimeout(timeout);
  };

  // 사용자가 처음 게임에 접속하여 닉네임을 정했을 때 발생하는 이벤트
  socket.on(events.setNickname, ({ nickname }) => {
    // socket은 그냥 object이므로, 우리가 원하는 것을 무엇이든 attach시킬 수 있다.
    socket.nickname = nickname;
    sockets.push({ id: socket.id, points: 0, nickname: nickname });
    broadcast(events.newUser, { nickname });

    sendPlayerUpdate();
    startGame();
  });

  // 사용자가 게임에서 나갔을 때 발생하는 이벤트
  socket.on(events.disconnect, () => {
    sockets = sockets.filter(aSocket => aSocket.id !== socket.id);
    // 게임 플레이어가 한명이라면 현재 진행중인 게임을 종료한다.
    if (sockets.length === 1) {
      endGame();
    } else if (leader) {
      // 현재 리더가 게임에서 나갔다면 현재 진행중인 게임을 종료한다.
      if (leader.id === socket.id) {
        endGame();
      }
    }
    broadcast(events.disconnected, { nickname: socket.nickname });
    sendPlayerUpdate();
  });

  socket.on(events.sendMsg, ({ message }) => {
    // 정답을 맞춘 경우
    if (message === word) {
      superBroadcast(events.newMsg, {
        message: `Winner is ${socket.nickname}, word was: ${word}`,
        nickname: "Bot"
      });
      addPoints(socket.id);
    } else {
      broadcast(events.newMsg, { message, nickname: socket.nickname });
    }
  });

  socket.on(events.beginPath, ({ x, y }) =>
    broadcast(events.beganPath, { x, y })
  );

  socket.on(events.strokePath, ({ x, y, color }) =>
    broadcast(events.strokedPath, { x, y, color })
  );

  socket.on(events.fill, ({ color }) => broadcast(events.filled, { color }));
};

export default socketController;
