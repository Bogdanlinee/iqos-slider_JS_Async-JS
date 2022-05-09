function dom() {
	// let productsArr = [];
	try {
		fetch('https://www.iqos.com/de/de/tabakerhitzer-entdecken/tabakerhitzer-kaufen.html')
			.then(response => {
				return response.text();
			})
			.then(response => {
				let productsArr = [];

				let newPars = new DOMParser();
				let resultPars = newPars.parseFromString(response, 'text/html');

				for (let i of resultPars.querySelectorAll('.plp-page__product--container')) {
					productsArr.push(i);
				}

				//add each slider-item to slider block
				let out = '';
				productsArr.map(item => {

					//Container where color variations and it`s images
					let colorContainer = item.querySelector('.plp-page__color-variations--container');
					let colorVariations = colorContainer.querySelectorAll('.plp-page__color-variations--color-item');
					let colorImage = colorContainer.querySelectorAll('picture');

					//products colors list and it`s params (stock, id...)
					let colorList = '';

					for (let i of colorVariations) {
						let imgSrc;

						for (let k of colorImage) {

							if (k.getAttribute('id') == `img${i.getAttribute('data-product-code')}`) {
								// console.log(i.getAttribute('data-product-code'));
								imgSrc = k.querySelector('.plp-page__product--image').getAttribute('data-src');
							}
						}

						colorList +=
							`
						<a class="${i.getAttribute('class')}"  style="${i.getAttribute('style')}" data-product-code="${i.getAttribute('data-product-code')}" data-base-product="${i.getAttribute('data-base-product')}" pic-src=${imgSrc}></a>
						`
					}

					//
					let productImage;
					let productName;
					let productPrice;
					let productId;
					let btnProductCode;
					let btnText;

					if (item.querySelector('.img-fade-in.plp-page__product--image.gtm-plp-image')) {
						productImage = item.querySelector('.img-fade-in.plp-page__product--image.gtm-plp-image').getAttribute('data-src');
					}
					if (item.querySelector('.plp-page__product--title')) {
						productName = item.querySelector('.plp-page__product--title').textContent;
					}
					if (item.querySelector('.plp-page__product--price')) {
						productPrice = item.querySelector('.plp-page__product--price').textContent;
					}
					if (item.querySelector('.plp-page__product--add-to-cart')) {
						productId = item.querySelector('.plp-page__product--add-to-cart').getAttribute('id');
						btnProductCode = item.querySelector('.plp-page__product--add-to-cart').getAttribute('data-product-code');
						btnText = item.querySelector('.plp-page__product--add-to-cart').textContent;
					}

					//slider-item creation  ///carousel-item-customm
					out += `
						<li class="ant-carousel-element">
							<img class="ant-carousel-image" id=${productId} src=${productImage} alt="" />
							<p>${productName}</p>
							<p>${productPrice}</p>
							<div class="carousel-color-list">${colorList}</div>
							<button class="carousel-item-customm-btn btn-slate-turquoise" id="${productId}" data-product-code=${btnProductCode}>
								${btnText}
							</button>
						</li>`;
				});

				// Makes carousel visible
				let courselDisplay = document.querySelector('.ant-carousel');

				if (courselDisplay.classList.contains('ant-carousel-display-none')) {
					courselDisplay.classList.remove('ant-carousel-display-none')
				}

				// Add carousel items to html
				document.querySelector('.ant-carousel-list').innerHTML = out;

				// Click on slider items
				document.querySelector('.ant-carousel').onclick = click;

				// Carousel function call
				carousel();

				//Out of stock function call
				colorsAvaliable();
			})
	}
	catch (err) {
		// parsing error
		console.log(err)
	}
}
dom();

//Out of stock function
function colorsAvaliable() {
	let outOfStockArticles = [];

	let mainPage = document.querySelector('.card-product-container');
	let stock = mainPage.querySelectorAll('.plp-page__color-variations--color-item');

	//Articles which are out of stock on main page
	for (let item of stock) {
		if (item.classList.contains('color-out-of-stock')) {
			outOfStockArticles.push(item.getAttribute('data-product-code'));
		}
	}

	//Add class ('color-out-of-stock') to colors
	let carouselDiv = document.querySelector('.ant-carousel');
	let articles = carouselDiv.querySelectorAll('.plp-page__color-variations--color-item');

	for (let item of articles) {
		let code = item.getAttribute('data-product-code');
		for (let i of outOfStockArticles) {
			if (i == code) {
				item.classList.add('color-out-of-stock')
			}
		}
	}
}

//Change color function
function click(event) {
	event.stopPropagation();
	let buttonClicked = event.target;

	// Click to change color
	if (buttonClicked.classList.contains('plp-page__color-variations--color-item')) {
		colorChange(buttonClicked);
	}

	// Click to buy product
	else if (buttonClicked.classList.contains('carousel-item-customm-btn')) {
		addToBasket(buttonClicked);
	}
}

//Change color of product
function colorChange(selectedColor) {
	// Choose parent element and change selected color there
	let colorList = selectedColor.parentNode.querySelectorAll('.plp-page__color-variations--color-item');

	//Remove all selected colors and add new one
	for (let i of colorList) {
		i.classList.remove('selected');
	}
	selectedColor.classList.add('selected');

	//Change button`s "!!data-product-code!!!" to use in request
	let buttonList = document.querySelectorAll('.carousel-item-customm-btn');
	let newButtonProductCode = selectedColor.getAttribute('data-product-code');

	for (let i of buttonList) {
		if (i.getAttribute('id') == selectedColor.getAttribute('data-base-product')) {
			if (selectedColor.classList.contains('color-out-of-stock')) {
				i.classList.add('carousel-item-customm-out-of-stock');
				i.textContent = 'Nicht vorrätig';
				i.disabled = true;
			}
			else {
				i.classList.remove('carousel-item-customm-out-of-stock');
				i.textContent = 'Zum Warenkorb hinzufügen';
				i.disabled = false;
			}
			i.setAttribute('data-product-code', newButtonProductCode);
		}
	}

	//Change image of selected color
	let picList = document.querySelectorAll('.ant-carousel-image');
	let newPicture = selectedColor.getAttribute('pic-src');

	for (let i of picList) {
		if (i.getAttribute('id') == selectedColor.getAttribute('data-base-product')) {
			i.setAttribute('src', newPicture);
		}
	}
}

//Add product to basket function
function addToBasket(addButtonClicked) {

	//Code of selected pruduct
	let productCode = addButtonClicked.getAttribute('data-product-code');

	//Data from Localstorage to work with
	const coreSiteAccount = JSON.parse(localStorage.getItem('__coresiteAccount'));
	let authorizationCode = coreSiteAccount.myAccount.accessToken;
	let coreSiteCart;

	// When LocalStorage have a !!__coreSite!! element and don`t have !!cart!! element in it
	if (localStorage.getItem('__coresiteCart') !== null) {
		coreSiteCart = JSON.parse(localStorage.getItem('__coresiteCart'));
		if (coreSiteCart.cart === undefined) {
			coreSiteCart.cart = JSON.stringify({ "cart": {} })
		}
	}

	// When LocalStorage dont have a !!__coreSite!! element
	else if (localStorage.getItem('__coresiteCart') === null) {
		localStorage.setItem('__coresiteCart', JSON.stringify({
			"cart": {}
		}));
		coreSiteCart = JSON.parse(localStorage.getItem('__coresiteCart'));
	}

	// Get guid element to make a requests
	let requestUrlGuid = coreSiteCart.cart.guid;

	//
	// Requests below
	//
	// If there is no guid element to work with
	if (requestUrlGuid === undefined) {

		//Request guid element to work with
		try {
			fetch('https://occ.iqos.com/rest/v2/iqos-de-B2C-web@iqos-de-B2C-web/users/anonymous/carts?', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'authorization': `bearer ${authorizationCode}`,
				},
			})
				.then(response => {
					return response.json();
				})
				.then(response => {
					// Got guid element to make a requests
					requestUrlGuid = response.guid;

					// Add product to basket
					addProdunctToBasket();
				})
		}
		catch (err) {
			// console.log(err);
		}

		//Add product to basket
		function addProdunctToBasket() {

			const addProductToBasketUrl = `https://occ.iqos.com/rest/v2/iqos-de-B2C-web@iqos-de-B2C-web/users/anonymous/carts/${requestUrlGuid}/entries?fields=FULL&lang=de`;

			try {
				fetch(addProductToBasketUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'authorization': `bearer ${authorizationCode}`,
					},
					body: JSON.stringify({
						product: { code: productCode },
						quantity: 1
					})
				})
					.then(response => {
						return response.json();
					})
					.then(response => {
						// Change text button if broduct added
						let regularText = addButtonClicked.textContent;
						if (response.statusCode) {
							addButtonClicked.textContent = 'Product added';
							setTimeout(() => {
								addButtonClicked.textContent = regularText;
							}, 2000)
						}

						// Add product to local storage (__coresiteCart)
						addProdunctToLocalStorage();
					})
			}
			catch (err) {
				// console.log(err);
			}
		}

		//Update localstorage
		function addProdunctToLocalStorage() {
			try {
				fetch(`https://occ.iqos.com/rest/v2/iqos-de-B2C-web@iqos-de-B2C-web/users/anonymous/carts/${requestUrlGuid}?fields=FULL&lang=de`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'authorization': `bearer ${authorizationCode}`,
					},
				})
					.then(cart => {
						return cart.json();
					})
					.then(cart => {
						let a = {
							cart
						}
						localStorage.setItem('__coresiteCart', JSON.stringify(a));
					})
			}
			catch (err) {
				// console.log(err)
			}
		}
	}

	// If the guid element is there
	else if (requestUrlGuid) {

		let requestUrlGuid = coreSiteCart.cart.guid;
		//Adding product to localstorage
		//request URL
		const addProductToBasket = `https://occ.iqos.com/rest/v2/iqos-de-B2C-web@iqos-de-B2C-web/users/anonymous/carts/${requestUrlGuid}/entries?fields=FULL&lang=de`;

		//Add product to basket
		try {
			fetch(addProductToBasket, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'authorization': `bearer ${authorizationCode}`,
				},
				body: JSON.stringify({
					product: { code: productCode },
					quantity: 1
				})
			})
				.then(response => {
					return response.json();
				})
				.then(response => {
					// Change text button if broduct added
					let regularText = addButtonClicked.textContent;
					if (response.statusCode) {
						addButtonClicked.textContent = 'Product added';
						setTimeout(() => {
							addButtonClicked.textContent = regularText;
						}, 2000)
					}

					// Add product to local storage (__coresiteCart)
					addProdunctToLocalStorage();
				})
		}
		catch (err) {
			// console.log(err);
		}

		//Update localstorage
		function addProdunctToLocalStorage() {
			try {
				fetch(`https://occ.iqos.com/rest/v2/iqos-de-B2C-web@iqos-de-B2C-web/users/anonymous/carts/${requestUrlGuid}?fields=FULL&lang=de`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'authorization': `bearer ${authorizationCode}`,
					},
				})
					.then(cart => {
						return cart.json();
					})
					.then(cart => {
						let a = {
							cart
						}
						localStorage.setItem('__coresiteCart', JSON.stringify(a));
					})
			}
			catch (err) {
				console.log(err);
			}
		}
	}
}

//Carousel function
function carousel() {
	function Ant(crslId) {
		let id = document.getElementById(crslId);
		if (id) {
			this.crslRoot = id
		}
		else {
			this.crslRoot = document.querySelector('.ant-carousel')
		};

		// Carousel objects
		this.crslList = this.crslRoot.querySelector('.ant-carousel-list');
		this.crslElements = this.crslList.querySelectorAll('.ant-carousel-element');
		this.crslElemFirst = this.crslList.querySelector('.ant-carousel-element');
		this.leftArrow = this.crslRoot.querySelector('div.ant-carousel-arrow-left');
		this.rightArrow = this.crslRoot.querySelector('div.ant-carousel-arrow-right');
		this.indicatorDots = this.crslRoot.querySelector('div.ant-carousel-dots');

		// Initialization
		this.options = Ant.defaults;
		Ant.initialize(this)
	};

	Ant.defaults = {

		// Default options for the carousel
		elemVisible: 2, // Кол-во отображаемых элементов в карусели
		loop: true,     // Бесконечное зацикливание карусели 
		auto: false,     // Автоматическая прокрутка
		interval: 5000, // Интервал между прокруткой элементов (мс)
		speed: 750,     // Скорость анимации (мс)
		touch: true,    // Прокрутка  прикосновением
		arrows: true,   // Прокрутка стрелками
		dots: true      // Индикаторные точки
	};

	Ant.prototype.elemPrev = function (num) {
		num = num || 1;

		if (this.options.dots) this.dotOn(this.currentElement);
		this.currentElement -= num;
		if (this.currentElement < 0) this.currentElement = this.dotsVisible - 1;
		if (this.options.dots) this.dotOff(this.currentElement);

		if (!this.options.loop) {  // сдвиг вправо без цикла
			this.currentOffset += this.elemWidth * num;
			this.crslList.style.marginLeft = this.currentOffset + 'px';
			if (this.currentElement == 0) {
				this.leftArrow.style.display = 'none'; this.touchPrev = false
			}
			this.rightArrow.style.display = 'block'; this.touchNext = true
		}
		else {                    // сдвиг вправо с циклом
			let elm, buf, this$ = this;
			for (let i = 0; i < num; i++) {
				elm = this.crslList.lastElementChild;
				buf = elm.cloneNode(true);
				this.crslList.insertBefore(buf, this.crslList.firstElementChild);
				this.crslList.removeChild(elm)
			};
			this.crslList.style.marginLeft = '-' + this.elemWidth * num + 'px';
			let compStyle = window.getComputedStyle(this.crslList).marginLeft;
			this.crslList.style.cssText = 'transition:margin ' + this.options.speed + 'ms ease;';
			this.crslList.style.marginLeft = '0px';
			setTimeout(function () {
				this$.crslList.style.cssText = 'transition:none;'
			}, this.options.speed)
		}
	};

	Ant.prototype.elemNext = function (num) {
		num = num || 1;

		if (this.options.dots) this.dotOn(this.currentElement);
		this.currentElement += num;
		if (this.currentElement >= this.dotsVisible) this.currentElement = 0;
		if (this.options.dots) this.dotOff(this.currentElement);

		if (!this.options.loop) {  // сдвиг влево без цикла
			this.currentOffset -= this.elemWidth * num;
			this.crslList.style.marginLeft = this.currentOffset + 'px';
			if (this.currentElement == this.dotsVisible - 1) {
				this.rightArrow.style.display = 'none'; this.touchNext = false
			}
			this.leftArrow.style.display = 'block'; this.touchPrev = true
		}
		else {                    // сдвиг влево с циклом
			let elm, buf, this$ = this;
			this.crslList.style.cssText = 'transition:margin ' + this.options.speed + 'ms ease;';
			this.crslList.style.marginLeft = '-' + this.elemWidth * num + 'px';
			setTimeout(function () {
				this$.crslList.style.cssText = 'transition:none;';
				for (let i = 0; i < num; i++) {
					elm = this$.crslList.firstElementChild;
					buf = elm.cloneNode(true); this$.crslList.appendChild(buf);
					this$.crslList.removeChild(elm)
				};
				this$.crslList.style.marginLeft = '0px'
			}, this.options.speed)
		}
	};

	Ant.prototype.dotOn = function (num) {
		this.indicatorDotsAll[num].style.cssText = 'background-color:#BBB; cursor:pointer;'
	};

	Ant.prototype.dotOff = function (num) {
		this.indicatorDotsAll[num].style.cssText = 'background-color:#556; cursor:default;'
	};

	Ant.initialize = function (that) {

		// Constants
		that.elemCount = that.crslElements.length; // Количество элементов
		that.dotsVisible = that.elemCount;         // Число видимых точек
		let elemStyle = window.getComputedStyle(that.crslElemFirst);
		that.elemWidth = that.crslElemFirst.offsetWidth +  // Ширина элемента (без margin)
			parseInt(elemStyle.marginLeft) + parseInt(elemStyle.marginRight);

		// Variables
		that.currentElement = 0; that.currentOffset = 0;
		that.touchPrev = true; that.touchNext = true;
		let xTouch, yTouch, xDiff, yDiff, stTime, mvTime;
		let bgTime = getTime();

		// Functions
		function getTime() {
			return new Date().getTime();
		};
		function setAutoScroll() {
			that.autoScroll = setInterval(function () {
				let fnTime = getTime();
				if (fnTime - bgTime + 10 > that.options.interval) {
					bgTime = fnTime; that.elemNext()
				}
			}, that.options.interval)
		};

		// Start initialization
		if (that.elemCount <= that.options.elemVisible) {   // Отключить навигацию
			that.options.auto = false; that.options.touch = false;
			that.options.arrows = false; that.options.dots = false;
			that.leftArrow.style.display = 'none'; that.rightArrow.style.display = 'none'
		};

		if (!that.options.loop) {       // если нет цикла - уточнить количество точек
			that.dotsVisible = that.elemCount - that.options.elemVisible + 1;
			that.leftArrow.style.display = 'none';  // отключить левую стрелку
			that.touchPrev = false;    // отключить прокрутку прикосновением вправо
			that.options.auto = false; // отключить автопркрутку
		}
		else if (that.options.auto) {   // инициализация автопрокруки
			setAutoScroll();
			// Остановка прокрутки при наведении мыши на элемент
			that.crslList.addEventListener('mouseenter', function () {
				clearInterval(that.autoScroll)
			}, false);
			that.crslList.addEventListener('mouseleave', setAutoScroll, false)
		};

		if (that.options.touch) {   // инициализация прокрутки прикосновением
			that.crslList.addEventListener('touchstart', function (e) {
				xTouch = parseInt(e.touches[0].clientX);
				yTouch = parseInt(e.touches[0].clientY);
				stTime = getTime()
			}, false);
			that.crslList.addEventListener('touchmove', function (e) {
				if (!xTouch || !yTouch) return;
				xDiff = xTouch - parseInt(e.touches[0].clientX);
				yDiff = yTouch - parseInt(e.touches[0].clientY);
				mvTime = getTime();
				if (Math.abs(xDiff) > 15 && Math.abs(xDiff) > Math.abs(yDiff) && mvTime - stTime < 75) {
					stTime = 0;
					if (that.touchNext && xDiff > 0) {
						bgTime = mvTime; that.elemNext()
					}
					else if (that.touchPrev && xDiff < 0) {
						bgTime = mvTime; that.elemPrev()
					}
				}
			}, false)
		};

		if (that.options.arrows) {  // инициализация стрелок
			if (!that.options.loop) that.crslList.style.cssText =
				'transition:margin ' + that.options.speed + 'ms ease;';
			that.leftArrow.addEventListener('click', function () {
				let fnTime = getTime();
				if (fnTime - bgTime > that.options.speed) {
					bgTime = fnTime; that.elemPrev()
				}
			}, false);
			that.rightArrow.addEventListener('click', function () {
				let fnTime = getTime();
				if (fnTime - bgTime > that.options.speed) {
					bgTime = fnTime; that.elemNext()
				}
			}, false)
		}
		else {
			that.leftArrow.style.display = 'none';
			that.rightArrow.style.display = 'none'
		};

		if (that.options.dots) {  // инициализация индикаторных точек
			let sum = '', diffNum;
			for (let i = 0; i < that.dotsVisible; i++) {
				sum += '<span class="ant-dot"></span>'
			};
			that.indicatorDots.innerHTML = sum;
			that.indicatorDotsAll = that.crslRoot.querySelectorAll('span.ant-dot');
			// Назначаем точкам обработчик события 'click'
			for (let n = 0; n < that.dotsVisible; n++) {
				that.indicatorDotsAll[n].addEventListener('click', function () {
					diffNum = Math.abs(n - that.currentElement);
					if (n < that.currentElement) {
						bgTime = getTime(); that.elemPrev(diffNum)
					}
					else if (n > that.currentElement) {
						bgTime = getTime(); that.elemNext(diffNum)
					}
					// Если n == that.currentElement ничего не делаем
				}, false)
			};
			that.dotOff(0);  // точка[0] выключена, остальные включены
			for (let i = 1; i < that.dotsVisible; i++) {
				that.dotOn(i)
			}
		}
	};

	new Ant();
}