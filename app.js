var express = require('express');
var exphbs = require('express-handlebars');
var mercadopago = require('mercadopago');
var port = process.env.PORT || 3000;

var app = express();

mercadopago.configure({
	access_token: process.env.ACCESS_TOKEN_MP,
	integrator_id: process.env.INTEGRATOR_ID_MP,
});

const payer = {
	name: 'Lalo',
	surname: 'Landa',
	email: 'test_user_46542185@testuser.com',
	phone: {
		area_code: '11',
		number: 22223333,
	},
	address: {
		zip_code: '1111',
		street_name: 'Falsa',
		street_number: 123,
	},
};

const payment_methods = {
	excluded_payment_methods: [
		{
			id: 'diners',
		},
	],
	excluded_payment_types: [
		{
			id: 'atm',
		},
	],
	installments: 6,
};

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
	res.render('home');
});

app.get('/detail', async function (req, res) {
	const { img, title, price, unit } = req.query;
	const items = [
		{
			id: 1234,
			title: title,
			description: 'Dispositivo móvil de Tienda e-commerce',
			picture_url: `${req.get('host')}${img.slice(1)}`,
			quantity: +unit,
			unit_price: Number(price),
		},
	];
	console.log(items);
	const back_urls = {
		success: process.env.SUCCESS_URL,
		pending: process.env.PENDING_URL,
		failure: process.env.FAILURE_URL,
	};
	const preferencia = {
		items,
		payer,
		payment_methods,
		external_reference: 'rent.gonz@gmail.com', // POR LO QUE VEO SOLO HAY QUE CAMBIAR ESTO DE ACA
		back_urls,
		notification_url: process.env.NOTIFICATION_URL,
		auto_return: 'approved',
	};
	const resultado = await mercadopago.preferences.create(preferencia);
	console.log(resultado);
	res.render('detail', { ...req.query, init_point: resultado.body.init_point });
});

app.get('/success', (req, res) => {
	res.render('success', req.query);
});

app.get('/success', (req, res) => {
	res.render('success', req.query);
});
app.get('/pending', (req, res) => {
	res.render('pending', req.query);
});
app.get('/failure', (req, res) => {
	res.render('failure', req.query);
});

app.post('/webhook', (req, res)=>{
    console.log('----------QUERY----------')
    console.log(req.query)
    console.log('----------BODY----------')
    console.log(req.body)
    res.status(200).json({})
})

app.listen(port);
