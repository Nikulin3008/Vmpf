const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); 
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error("Помилка БД:", err.message);
    else console.log("📦 Підключено до бази даних SQLite. Турнірний режим активовано!");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS players (nickname TEXT UNIQUE, wins INTEGER DEFAULT 0, matches_played INTEGER DEFAULT 0)`);
    db.run(`CREATE TABLE IF NOT EXISTS matches (p1 TEXT, p2 TEXT, p1_score INTEGER, p2_score INTEGER, winner TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
});

const sendLeaderboard = () => {
    db.all(`SELECT nickname as name, wins FROM players ORDER BY wins DESC LIMIT 10`, [], (err, rows) => {
        if (!err) io.emit('updateLeaderboard', rows);
    });
};

let waitingPlayer = null;
let tourneyQueue = []; // Черга для турніру на 4 гравців
const rooms = {}; 
const tournaments = {}; // Стан турнірів
const playersInfo = {}; 

const videoFiles = [
    [ "LV_LV", "LV_LN", "LV_CN", "LV_P",  "LV_P"  ], 
    [ "LN_LV", "LN_LN", "LN_CN", "LN_P",  "LN_P"  ], 
    [ "CN_L",  "CN_L",  "CN_CN", "CN_P",  "CN_P"  ], 
    [ "PV_L",  "PV_L",  "PV_CN", "PV_PV", "PV_PN" ], 
    [ "PN_L",  "PN_L",  "PN_CN", "PN_PV", "PN_PN" ]  
];

// Допоміжна функція створення кімнати
const createRoom = (p1Socket, p2Socket, tourneyId = null, stage = null) => {
    const roomName = `room_${p1Socket.id}_${p2Socket.id}`;
    p1Socket.join(roomName);
    p2Socket.join(roomName);

    rooms[roomName] = {
        p1: p1Socket.id, p2: p2Socket.id,
        shooter: p1Socket.id, goalie: p2Socket.id,
        choices: {},
        p1Score: 0, p2Score: 0,
        p1KicksTaken: 0, p2KicksTaken: 0,
        p1History: ['⚪', '⚪', '⚪', '⚪', '⚪'],
        p2History: ['⚪', '⚪', '⚪', '⚪', '⚪'],
        tourneyId: tourneyId,
        stage: stage
    };

    io.to(p1Socket.id).emit('gameStart', { role: 'shooter', room: roomName, playerNum: 1, opponentName: playersInfo[p2Socket.id], stage: stage });
    io.to(p2Socket.id).emit('gameStart', { role: 'goalie', room: roomName, playerNum: 2, opponentName: playersInfo[p1Socket.id], stage: stage });
};

io.on('connection', (socket) => {
    
    // ЗВИЧАЙНА ГРА 1 на 1
    socket.on('joinGame', (nickname) => {
        playersInfo[socket.id] = nickname;
        db.run(`INSERT OR IGNORE INTO players (nickname) VALUES (?)`, [nickname], () => sendLeaderboard());

        if (waitingPlayer) {
            createRoom(waitingPlayer, socket);
            waitingPlayer = null;
        } else {
            waitingPlayer = socket;
            socket.emit('waiting', 'Очікуємо суперника (1v1)...');
        }
    });

    // ТУРНІРНА ГРА (4 Гравці)
    socket.on('joinTournament', (nickname) => {
        playersInfo[socket.id] = nickname;
        db.run(`INSERT OR IGNORE INTO players (nickname) VALUES (?)`, [nickname], () => sendLeaderboard());

        tourneyQueue.push(socket);
        
        // Повідомляємо всім у черзі, скільки людей зібралося
        tourneyQueue.forEach(s => s.emit('waiting', `Збираємо турнір... ${tourneyQueue.length}/4`));

        if (tourneyQueue.length === 4) {
            const tourneyId = `T_${Date.now()}`;
            tournaments[tourneyId] = { finalists: [] };

            const [p1, p2, p3, p4] = tourneyQueue;
            tourneyQueue = []; // Очищаємо чергу для наступних

            // Створюємо два півфінали
            createRoom(p1, p2, tourneyId, 'semi');
            createRoom(p3, p4, tourneyId, 'semi');
        }
    });
//1 
    socket.on('makeChoice', (data) => {
        const room = rooms[data.room];
        if (!room) return;

        room.choices[socket.id] = data.choiceIndex;

        if (Object.keys(room.choices).length === 2) {
            const shooterChoice = room.choices[room.shooter];
            const goalieChoice = room.choices[room.goalie];
            
            const videoName = videoFiles[shooterChoice][goalieChoice];
            const isGoal = (shooterChoice !== goalieChoice);
            const symbol = isGoal ? '⚽' : '❌';

            if (room.shooter === room.p1) {
                const kickIndex = room.p1History.indexOf('⚪');
                if (kickIndex !== -1) room.p1History[kickIndex] = symbol;
                if (isGoal) room.p1Score++;
                room.p1KicksTaken++;
            } else {
                const kickIndex = room.p2History.indexOf('⚪');
                if (kickIndex !== -1) room.p2History[kickIndex] = symbol;
                if (isGoal) room.p2Score++;
                room.p2KicksTaken++;
            }

            const p1Remaining = 5 - room.p1KicksTaken;
            const p2Remaining = 5 - room.p2KicksTaken;
            
            let isGameOver = false;
            let winnerId = null;
            let loserId = null;

            if (room.p1Score > room.p2Score + p2Remaining) {
                isGameOver = true; winnerId = room.p1; loserId = room.p2;
            } else if (room.p2Score > room.p1Score + p1Remaining) {
                isGameOver = true; winnerId = room.p2; loserId = room.p1;
            } else if (room.p1KicksTaken === 5 && room.p2KicksTaken === 5) {
                isGameOver = true;
                if (room.p1Score > room.p2Score) { winnerId = room.p1; loserId = room.p2; }
                else if (room.p2Score > room.p1Score) { winnerId = room.p2; loserId = room.p1; }
                else winnerId = 'draw';
            }

            if (isGameOver) {
                room.gameOverData = {
                    p1Name: playersInfo[room.p1], p2Name: playersInfo[room.p2],
                    p1Score: room.p1Score, p2Score: room.p2Score,
                    winnerId: winnerId, loserId: loserId,
                    processed: false
                };
            }

           
            const nextShooter = room.goalie;
            const nextGoalie = room.shooter; 
            room.shooter = nextShooter;
            room.goalie = nextGoalie;
            

            io.to(data.room).emit('shotResult', {
                video: `/Videos/${videoName}.mp4`,
                p1Score: room.p1Score, p2Score: room.p2Score,
                p1History: room.p1History, p2History: room.p2History,
                nextShooter: nextShooter,
                isGameOver: isGameOver,
                winnerId: winnerId
            });
            room.choices = {}; 
        }
    });

    socket.on('videoEnded', (roomName) => {
        const room = rooms[roomName];
        
        if (room && room.gameOverData && !room.gameOverData.processed) {
            room.gameOverData.processed = true; 
            
            const { p1Name, p2Name, p1Score, p2Score, winnerId, loserId } = room.gameOverData;
            const winnerName = winnerId === 'draw' ? 'Draw' : playersInfo[winnerId];

            db.run(`INSERT INTO matches (p1, p2, p1_score, p2_score, winner) VALUES (?, ?, ?, ?, ?)`, 
                [p1Name, p2Name, p1Score, p2Score, winnerName]);
            db.run(`UPDATE players SET matches_played = matches_played + 1 WHERE nickname IN (?, ?)`, [p1Name, p2Name]);

            // ЛОГІКА ТУРНІРІВ
            if (room.tourneyId) {
                const tourney = tournaments[room.tourneyId];
                
                if (room.stage === 'semi') {
                    // Хто програв - вилітає
                    if (loserId) io.to(loserId).emit('tournamentEliminated');
                    
                    if (winnerId !== 'draw') {
                        // Переможець чекає фіналу
                        io.to(winnerId).emit('waiting', 'Ти у ФІНАЛІ! Очікуємо завершення другого півфіналу...');
                        tourney.finalists.push(io.sockets.sockets.get(winnerId));
                        
                        // Якщо обидва півфінали закінчилися
                        if (tourney.finalists.length === 2) {
                            createRoom(tourney.finalists[0], tourney.finalists[1], room.tourneyId, 'final');
                        }
                    }
                } 
                else if (room.stage === 'final') {
                    // Перемога у фіналі турніру = +3 очка!
                    if (loserId) io.to(loserId).emit('tournamentEliminated');
                    if (winnerId !== 'draw' && winnerName) {
                        io.to(winnerId).emit('tournamentChampion');
                        db.run(`UPDATE players SET wins = wins + 3 WHERE nickname = ?`, [winnerName], () => sendLeaderboard());
                    }
                }
            } 
            // Звичайна гра 1 на 1
            else {
                if (winnerId !== 'draw' && winnerName) {
                    db.run(`UPDATE players SET wins = wins + 1 WHERE nickname = ?`, [winnerName], () => sendLeaderboard());
                } else {
                    sendLeaderboard();
                }
            }
        }
    });

    sendLeaderboard();

    socket.on('disconnect', () => {
        // Стара логіка: видаляємо з черг
        if (waitingPlayer && waitingPlayer.id === socket.id) waitingPlayer = null;
        tourneyQueue = tourneyQueue.filter(s => s.id !== socket.id); 
        delete playersInfo[socket.id];

        // === НОВА ЛОГІКА: Перевіряємо, чи не втік він прямо з матчу ===
        for (const roomName in rooms) {
            const room = rooms[roomName];
            // Якщо цей гравець є в якійсь активній кімнаті
            if (room.p1 === socket.id || room.p2 === socket.id) {
                // Відправляємо сигнал "втечі" в цю кімнату (його отримає той, хто лишився)
                io.to(roomName).emit('opponentDisconnected');
                // Видаляємо кімнату з пам'яті сервера, щоб не засмічувати оперативку
                delete rooms[roomName];
                break; 
            }
        }
    });
});

server.listen(5000, () => console.log(`Сервер гри запущено з турнірами! 🚀`));