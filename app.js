// католог с модулем для синхр. работы с MySQL, который должен быть усталовлен командой: sync-mysql
// работа с базой данных.
const Mysql = require(sync-mysql)
const connection = new Mysql({
    host:'localhost', 
    user:'scientist', 
    password:'pass1234', 
    database:'observatorbd'
})

// обработка параметров из формы.
var qs = require('querystring');
function reqPost (request, response) {
    if (request.method == 'POST') {
        var body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
			var post = qs.parse(body);
			var sInsert = "INSERT INTO position (earth_pos, sun_pos, moon_pos) VALUES (\""+post['col1']+"\",\""+post['col2']+"\",\""+post['col3']+"\")";
			var results = connection.query(sInsert);
            console.log('Done. Hint: '+sInsert);
        });
    }
}

// выгрузка массива данных.
function ViewSelect(res) {
	var results = connection.query('SHOW COLUMNS FROM postion');
	res.write('<tr>');
	for(let i=0; i < results.length; i++)
		res.write('<td>'+results[i].Field+'</td>');
	res.write('</tr>');
	
	var results = connection.query("CALL join_tables('postion','sector')");
	if (results && results[0]) {
            let data = results[0];
            for (let i = 0; i < data.length; i++) {
                res.write('<tr><td>' + String(data[i].id) + '</td><td>' + data[i].earth_pos  + '</td><td>' + data[i].sun_pos  + '</td><td>' + data[i].moon_pos + '</td></tr>');
            }
    }
}
	
function ViewVer(res) {
	var results = connection.query('SELECT VERSION() AS ver');
	res.write(results[0].ver);
}

// создание ответа в браузер, на случай подключения.
const http = require('http');
const server = http.createServer((req, res) => {
	reqPost(req, res);
	console.log('Загрузка');
	
	res.statusCode = 200;
//	res.setHeader('Content-Type', 'text/plain');

	// чтение шаблока в каталоге со скриптом.
	var fs = require('fs');
	var array = fs.readFileSync(__dirname+'\\select.html').toString().split("\n");
	console.log(__dirname+'\\select.html');
	for(i in array) {
		// подстановка.
		if ((array[i].trim() != '@tr') && (array[i].trim() != '@ver')) res.write(array[i]);
		if (array[i].trim() == '@tr') ViewSelect(res);
		if (array[i].trim() == '@ver') ViewVer(res);
	}
	res.end();
	console.log('Успех.');
});

// запуск сервера, ожидание подключений из браузера.
const hostname = '127.0.0.1';
const port = 3000;
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});