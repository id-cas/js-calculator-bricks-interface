(function defineBricksApp (factory) {
	if (window) {
		window.MainController = window.App = factory();
	}
})(function bricksAppFactory () {

	const AjaxApp = KalkPro.modules.AjaxApp;

	/**
	 * КАЛЬКУЛЯТОР БЛОКОВ KALK.PRO
	 *
	 * */
	class BricksApp extends AjaxApp {

		/**
		 * Конструктор класса
		 * */
		constructor () {

		// Запуск родительского класса
		super();

		this.nodes.bricks = {
			dataSelects: '.js--dataSelector',
			gridDiameterSelects: '.js--gridDiameterSelector',
			addButtons: '.js--onclick-addFieldset',
			delButtons: '.js--onclick-delFieldset'
		};

		this.settings.resource = '/{{lang}}/calculators/bricks_calculate/.json';
		this.settings.addDensityToSizes = true;

		this.modules = {
			tabs: 'Tabs',
			view: 'View',
			data: 'Data',
			interfBricks: 'InterfBricks',
			formControl: 'FormControl'
		};

		// Запуск
		this._init();

		// Изменение формы
		this.formControl.onChange(this.onFormChange.bind(this));
	};

		/**
		 * Запуск приложения.
		 * @return void
		 * */
		start () {
		this.interfBricks.start();
		this._start();
	};

		/**
		 * Можно кастомизировать/форматировать результаты для визуализации расчета каждого конкретного калькулятора.
		 * Часть функционала функции можно заимствовать из исходного калькулятора.
		 * @return void
		 * */
		response (response, errors) {

		// Событие окончания расчёта
		document.documentElement.trigger('calcDone');

		let output = {};
		let currency = globals.currency['suffix']  || '';

		if (!response.errors && response.data) {
			// Эта часть правится в зависимости от выдачи результата расчета

			let data = response.data;
			let groups = Object.keys(data);

			for (let i = 0; i < groups.length; i++) {
				let groupName = groups[i];
				let groupParams = Object.keys(data[groupName]);

				for (let j = 0; j < groupParams.length; j++) {
					let fieldName = groupParams[j];

					let value = data[groups[i]][fieldName].v;
					let unit = data[groups[i]][fieldName].u;

					output['res-'+ groupName] = output['res-'+ groupName] || {};
					output['res-'+ groupName][fieldName] = {
						v: isString(value) ? getLabel(value) : value,
						u: unit === 'currency' ? currency : unit
					};
				}
			}

			this['data'].prepareData({ result: output });
		} else {
			errors = response.errors;

			for (let groupName in errors) {
				if (!errors.hasOwnProperty(groupName)) continue;

				let isIndex = (this.rdata && this.rdata.map) ? isSet(this.rdata.map[groupName]) && isSet(this.rdata.map[groupName].index) : (errors[groupName].length > 1);

				for (let i = 0; i < errors[groupName].length; i++) {

					for (let fieldName in errors[groupName][i]) {
						if (!errors[groupName][i].hasOwnProperty(fieldName)) continue;

						let groupNumeric = groupName;

						if (isIndex) {
							groupNumeric += '_'+ (i + 1);
						}

						output[groupNumeric] = output[groupNumeric] || {};
						output[groupNumeric][fieldName] = {
							v: getLabel(errors[groupName][i][fieldName]),
							u: '',
							a: '#js--'+ groupName +'_'+ fieldName
						};

						if (isIndex) {
							output[groupNumeric][fieldName].a += '_'+ i;
						}
					}
				}
			}
			this['data'].prepareData({ errors: output });
		}

		this['data'].refresh();
		this['data'].limit(false);
		this['data'].lock(false);
	};

		/**
		 * @param {Object} input
		 * @return {Object}
		 * */
		prepareInput (input) {
		this.rdata = {
			map: {},
			calc_id: input.calc_id
		};

		for (let group in input) {
			if (!input.hasOwnProperty(group)) continue;

			for (let field in input[group]) {
				if (!input[group].hasOwnProperty(field)) continue;

				let index = 0;
				let digMatch = field.match(/(.+)_(\d+$)/);
				let value = input[group][field];

				if (digMatch) {
					field = digMatch[1];
					index = parseInt(digMatch[2]);

					this.rdata.map[group] = { index: index };
				} else {
					this.rdata.map[group] = { index: null };
				}

				let key = group +'['+ index +']['+ field +']';

				if (field === 'sizes' && value !== 'custom' && this.settings.addDensityToSizes) {
					value += '-D'+ input[group]['density'].match(/-D(\d+)$/)[1];
				}

				this.rdata[key] = value;
			}
		}

		return this.rdata;
	};

		/**
		 * @param {Event} event
		 * @return void
		 * */
		onFormChange (event) {

	};

	}

	return new BricksApp();

});