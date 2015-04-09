// подчключаем необходимые компоненты: фреймворк express
var express = require('express'),
    // компонент парсера HTML и JSON для него, 
    // подробнее: в туториале на сайте expressjs.com
    bodyParser = require('body-parser'),
    // библиотеку mongoose для более удобного
    // взаимодействия с БД
    mongoose = require('mongoose'),
    // и класс для создания схемы БД
    dbSchema = mongoose.Schema,
	// наблонизатор...
    swig = require('swig'),
	// и, собственно, класс приложения
	app = express();
	
// Из папки public будем отдавать статику: стили и скрипты для фронтенда
app.use(express.static(__dirname + '/public'));

// соединияемся с сервером mongoDB
mongoose.connect('mongodb://localhost/studentsdb', function (err, db) {
	
	// объявляем схему хранящихся в документе mongoDB
	// данных. Таким образом, можно работать с nosql
	// базой в привычном стиле
	var studentsSchema = new dbSchema({
	   name:  String,
	   scores: [{ subject: String, score: Number }]
	});

	// создаем модель по схеме, указывая на коллекцию 'students'
	var StudentsModel = mongoose.model('students', studentsSchema);

	// указываем каталог с представлениями
	app.engine('html', swig.renderFile);
	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');

    // используем body-parser для обработки запросов
	app.use(bodyParser());
	
	//Теперь создаем маршруты
	app.get('/', function(req, res) {
		StudentsModel.find().exec(function(err,docs) {
            res.render('students.html', {
				// устанавливаем в представлении необходимые переменные
				students: docs
			});
        });
	});
	
	app.post('/students', function(req, res) { 
	    var name = req.body.name;
		var s = new StudentsModel({ name: name });
		s.save(function (err) {
		  if (err) return handleError(err);
		  res.redirect('/');
		});
	});	

	app.post('/students/:id', function(req, res) {
		StudentsModel.remove({ _id: req.params.id }, function (err) {
			if (err) return handleError(err);
			res.redirect('/');
		});
	});

	app.get('/students/:id', function(req, res) {
		StudentsModel.findOne({ _id: req.params.id }, function(err, student) {
		res.render('student.html', {
				// устанавливаем в представлении необходимые переменные
				student: student
			});
		});
	});

	
	//Вешаем сервер на порт, который нам понравится
	app.listen(8082);
    console.log('Express server listening on port 8082');
});