import socketIo from "socket.io";

export default (server) => {
	const io = socketIo(server, {
		cors: {
			origin: "http://localhost:3000",
			methods: ["GET", "POST"],
		},
	});

	const room = io.of("/room");
	const channel = io.of("/channel");
	let activeRooms = {};

	io.on("connection", (socket) => {
		const req = socket.request;
		const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
		// console.log("새로운 클라이언트 접속!", ip, socket.id);

		socket.on("join", (roomName) => {
			console.log(`Socket ${socket.id} joining ${roomName}`);
			socket.join(roomName);
		});

		socket.on("select_team", (chId, roomId, roomName, teamId) => {
			if (chId === undefined || roomId === undefined || teamId === undefined || teamId === 0) {
				return;
			}
			if (roomName in activeRooms) {
				let canStart = false;
				activeRooms[roomName][teamId - 1] = 1;
				if (Object.values(activeRooms[roomName]).toString() == [1, 1, 1, 1]) {
					canStart = true;
				}
				socket.to(roomName).emit("can_start", canStart);
			} else {
				console.log(`채널${chId}, 룸${roomId}이 활성화 되었습니다`);
				activeRooms[roomName] = [0, 0, 0, 0];
				activeRooms[roomName][teamId - 1] = 1;
			}
			console.log(activeRooms);
		});

		// All event
		socket.onAny((event) => {
			// 모든 이벤트 감시
			console.log(event, "check all Event");
		});

		// 2. 이벤트 리스너 붙이기
		socket.on("disconnect", () => {
			console.log("클라이언트 접속 해제", ip, socket.id);
			clearInterval(socket.interval);
		});

		socket.on("error", (error) => {
			console.log(error);
		});
	});
};
