const zmq = require('zeromq');
const readline = require('readline');

// Настройка интерфейса для ввода с консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const sock = new zmq.Request();

  try {
    // Подключаемся к клиенту
    await sock.connect("tcp://127.0.0.1:5555");
    console.log("Game-Server запущен. Введите числа для угадывания.");

    let guessed = false;  // Флаг окончания игры

    // Функция для обработки ввода пользователя
    const makeGuess = async () => {
      if (guessed) return; // Если игра окончена, выходим из функции

      rl.question("Ваше предположение: ", async (guess) => {
        // Проверяем, что введенное значение является числом
        if (isNaN(guess)) {
          console.log("Введите корректное число!");
          return makeGuess(); // Повторный запрос ввода
        }

        // Отправляем предположение клиенту
        await sock.send(JSON.stringify({ answer: parseInt(guess, 10) }));

        // Ждем ответа от клиента
        const [message] = await sock.receive();
        const response = JSON.parse(message.toString());

        // Обрабатываем ответ клиента
        if (response.hint === "more") {
          console.log("Загаданное число больше.");
        } else if (response.hint === "less") {
          console.log("Загаданное число меньше.");
        } else if (response.hint === "correct") {
          console.log("Вы угадали число! Игра окончена.");
          guessed = true;
          rl.close(); // Закрываем интерфейс ввода
          return; // Завершаем выполнение
        } else {
          console.error("Неизвестный ответ от клиента.");
        }

        // Повторно запрашиваем ввод, если игра не окончена
        makeGuess();
      });
    };

    makeGuess(); // Запускаем процесс ввода

  } catch (error) {
    console.error("Произошла ошибка:", error);
  }
})();

