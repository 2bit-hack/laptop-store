const fs = require('fs');
const http = require('http');
const url = require('url');

// blocking synchronous code to read laptop data from local storage
const rawLaptopData = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
const laptopData = JSON.parse(rawLaptopData);

// create http server and serve data across routes
const server = http.createServer((req, res) => {
	const pathName = url.parse(req.url, true).pathname;
	const id = url.parse(req.url, true).query.id;

	// Routing

	// PRODUCTS route
	if (pathName === '/products' || pathName === '/') {
		res.writeHead(200, { 'Content-type': 'text/html' });

		// non-blocking read
		fs.readFile(
			`${__dirname}/templates/temp-overview.html`,
			'utf-8',
			(err, overviewMarkup) => {
				// failed to read overview template
				if (err) {
					console.log(`Error! ${err.message}`);
					throw err;
				}
				fs.readFile(
					`${__dirname}/templates/temp-card.html`,
					'utf-8',
					(err, cardHTML) => {
						// failed to read card template
						if (err) {
							console.log(`Error! ${err.message}`);
							throw err;
						}
						// generate overview markup from each card markup
						const cardsMarkup = laptopData
							.map(cardData => replaceTemplate(cardHTML, cardData))
							.join('');
						overviewMarkup = overviewMarkup.replace('{&CARDS%}', cardsMarkup);
						// return overview markup as html
						res.end(overviewMarkup);
					},
				);
			},
		);
	}
	// LAPTOP route
	else if (pathName === '/laptop' && id < laptopData.length) {
		res.writeHead(200, { 'Content-type': 'text/html' });

		// non-blocking read
		fs.readFile(
			`${__dirname}/templates/temp-laptop.html`,
			'utf-8',
			(err, laptopHTML) => {
				// failed to read laptop template
				if (err) {
					console.log(`Error! ${err.message}`);
					throw err;
				}

				const laptop = laptopData[id];
				// generate laptop detail markup
				const laptopMarkup = replaceTemplate(laptopHTML, laptop);
				// return laptop detail markup as html
				res.end(laptopMarkup);
			},
		);
	}
	// IMAGES route
	else if (/\.(jpg|jpeg|png|gif)$/i.test(pathName)) {
		fs.readFile(`${__dirname}/data/img${pathName}`, (err, img) => {
			// failed to read image data
			if (err) {
				console.log(`Error! ${err.message}`);
				throw err;
			}
			res.writeHead(200, { 'Content-type': 'image/jpg' });
			// return image data
			res.end(img);
		});
	}
	// All other routes, 404 error
	else {
		res.writeHead(404, { 'Content-type': 'text/html' });
		res.end('<h1>404 Not Found</h1>');
	}
});

const port = 1337;
const address = '127.0.0.1';

// server listening at port 1337 at loopback address
server.listen(port, address, () => {
	console.log(`Server started successfully, listening at ${address}:${port}`);
});

// utility function that replaces placeholder strings with local storage data
function replaceTemplate(originalHTML, laptop) {
	let markup = originalHTML.replace(/{&PRODUCTNAME%}/g, laptop.productName);
	markup = markup.replace(/{&IMAGE%}/g, laptop.image);
	markup = markup.replace(/{&PRICE%}/g, laptop.price);
	markup = markup.replace(/{&SCREEN%}/g, laptop.screen);
	markup = markup.replace(/{&STORAGE%}/g, laptop.storage);
	markup = markup.replace(/{&CPU%}/g, laptop.cpu);
	markup = markup.replace(/{&RAM%}/g, laptop.ram);
	markup = markup.replace(/{&DESCRIPTION%}/g, laptop.description);
	markup = markup.replace(/{&ID%}/g, laptop.id);
	markup = markup.replace(/{&BUYLINK%}/g, laptop.buylink);
	return markup;
}
