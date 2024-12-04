const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Обработчик запросов
app.get('/:number/news/for/:category', async (req, res) => {
    const { number, category } = req.params;

    // Проверка, чтобы number был целым положительным числом
    if (!Number.isInteger(Number(number)) || Number(number) <= 0) {
        return res.status(400).send('Invalid number');
    }

    // Разрешенные категории
    const categories = ['business', 'economic', 'finances', 'politics'];
    if (!categories.includes(category)) {
        return res.status(400).send('Invalid category');
    }

    // Формируем URL для запроса к rss2json
    const rssUrl = `https://www.vedomosti.ru/rss/rubric/${category}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        // Отправляем запрос на rss2json
        const response = await axios.get(apiUrl);

        // Проверка на успешность запроса
        if (response.data.status !== 'ok') {
            return res.status(500).send('Error fetching news');
        }

        // Получаем новости
        const newsItems = response.data.items.slice(0, Number(number));

        // Отправляем ответ пользователю, рендеря шаблон с новостями
        res.render('news', {
            number,
            category,
            newsItems
        });

    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
