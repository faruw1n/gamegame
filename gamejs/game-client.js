const zmq = require('zeromq');


const min = 1;
const max = 100;
const targetNumber = randomInt(min, max + 1);
console.log(`Загадано число в диапазоне ${min}-${max}.`);


function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

(async () => {
  // Создаем сокет для ответа
  const sock = new zmq.Reply();

  try {
    // Привязываем сокет к адресу
    await sock.bind("tcp://127.0.0.1:5555");
    console.log("Game-Client запущен и ждет предположений от сервера...");

    // Основной цикл ожидания и обработки запросов
    while (true) {
      // Ожидаем сообщение от сервера
      const [message] = await sock.receive();
      const request = JSON.parse(message.toString());

      if (request.answer !== undefined) {
        const guess = parseInt(request.answer, 10);
        console.log(`Получено предположение от сервера: ${guess}`);

        // Сравниваем предположение с загаданным числом
        if (guess < targetNumber) {
          await sock.send(JSON.stringify({ hint: "more" }));
          console.log("Ответ отправлен: больше");
        } else if (guess > targetNumber) {
          await sock.send(JSON.stringify({ hint: "less" }));
          console.log("Ответ отправлен: меньше");
        } else {
          console.log("Сервер угадал число! Игра окончена.");
          await sock.send(JSON.stringify({ hint: "correct" }));
          break; // Прерываем цикл после победы
        }
      }
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
  } finally {
    // Закрываем сокет
    await sock.close();
  }
})();
