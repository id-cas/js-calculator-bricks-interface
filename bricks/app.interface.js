(function () {

	'use strict';

	let modules = KalkPro.modules;
	let Module = KalkPro.modules.Abstract;

	let ANIMATION_SPEED = KalkPro.ANIMATION_SPEED;

	/**
	 * @param {AbstractApp} scope
	 * */
	function InterfBricks(scope) {
		Module.apply(this, arguments);

		this.nodes = this.scope.nodes.bricks;
		this.fieldsetOrder = {};

		this.state = {
			blockParams: {
				type: '',
				state: '',
				sizes: ''
			},
			wallParams: {
				brickwork: ''
			}
		};
		this.filtered = [];
	}

	/**
	 * Наследование
	 * */
	inherit(InterfBricks, Module);

	/**
	 * @return void
	 * */
	InterfBricks.prototype.start = function () {

		// Обработка выпадающих списков
		let applyData = this.applyDataInSelector.bind(this);

		this.nodes.dataSelects
			.each(applyData)
			.change(applyData);

		// Диаметер сетки
		let applyGrid = this.applyGridDiameter.bind(this);

		this.nodes.gridDiameterSelects
			.each(applyGrid)
			.change(applyGrid);

//		$(document)
//			// Обработка добавления новых полей
//			.on('click', this.nodes.addButtons.selector, this.addFieldsGroup.bind(this))
//			// Обработка удаления полей
//			.on('click', this.nodes.delButtons.selector, this.delFieldsGroup.bind(this));

		$(document)
			// Обработка добавления новых полей
			.on('click', '.js--onclick-addFieldset', this.addFieldsGroup.bind(this))
			// Обработка удаления полей
			.on('click', '.js--onclick-delFieldset', this.delFieldsGroup.bind(this));
	};

	/**
	 * Обработка выпадающих списков
	 * @param {Number|Event} ei
	 * @param {Element|EventTarget} el
	 * */
	InterfBricks.prototype.applyDataInSelector = function (ei, el) {
		if (ei.target) {
			ei.preventDefault();
			el = ei.target;
		}

		let $el = $(el);

		if (!$el.length) {
			return;
		}

		let $form = $el.parents('form');
		let $fieldset = $el.parents('fieldset');
		let $option = $el.find('option:selected');

		let fsName = $fieldset.attr('name');
		let elName = $el.attr('name');
		let elOrigin = elName.replace(fsName +'_', '');
		let elValue = $option.data('type') || $form.get(0).elements[elName].value || $el.val();

		if (isSet(this.state[fsName][elOrigin])) {
			this.state[fsName][elOrigin] = elValue;

			let keys = Object.keys(this.state[fsName]);
			let values = Object.values(this.state[fsName]).filter(isValue);

			if (keys.length === values.length) {
				let $img = $fieldset.find('.js--dataFigure');

				if ($img.length) {
					let src = 'custom';

					if (fsName === 'blockParams' && this.state[fsName].sizes !== 'custom') {
						src = this.state[fsName].type +'-'+ this.state[fsName].state +'-'+ this.state[fsName].sizes.split('-').splice(2, 2).join('-');

						// Меняем состояние (номинально совпадает с src)
						this.state[fsName].sizes = src;
					}

					if (fsName === 'wallParams') {
						src = 'brick'+ this.state[fsName].brickwork.replace('.', '');
					}

					$img.attr('src', location.protocol + '//' + location.hostname + '/images/bricks/select/'+ src +'.jpg?v=-3');
				}

				this.filter(fsName);
			}
		}

		// Отображение блока с размерами
		let $blockSizes = $fieldset.find('.js--blockSizes');
		let $blockDensity = $fieldset.find('.js--blockDensity');
		if ($blockSizes.length && elOrigin === 'sizes') {
			if (elValue === 'custom') {
				$fieldset.find('[name="blockParams[length]"]').val('');
				$fieldset.find('[name="blockParams[width]"]').val('');
				$fieldset.find('[name="blockParams[height]"]').val('');
				$fieldset.find('[name="blockParams[weight]"]').val('');

				$blockSizes.closest('.field').slideDown(ANIMATION_SPEED);
				$blockDensity.parents('.field').hide();
			}
			else {
				$blockSizes.parents('.field').hide();
				$blockDensity.closest('.field').slideDown(ANIMATION_SPEED);
			}
		}
	};

	/**
	 * @param {String} fsName
	 * @return void
	 * */
	InterfBricks.prototype.filter = function (fsName) {
		if (fsName !== 'blockParams') return;

		let values = Object.values(this.state[fsName]);
		let filter = this.state[fsName];
		let diff = arrayDiff(values, this.filtered);

		if (diff.length === 0) {
			return;
		}

		this.filtered = values;

		let $fieldset = $('fieldset[name="'+ fsName +'"]');
		let $sizes = $fieldset.find('[name$="sizes"]');
		let $weights = $fieldset.find('[name$="weight"]');
		let $densities = $fieldset.find('[name$="density"]');

		let sizesCS = $sizes.cusselect('get');
		let weightsCS = $weights.cusselect('get');
		let densitieCS = $densities.cusselect('get');

		// TODO: Обновлять выбранное значение при измении селекбокса
		if (sizesCS) {
			sizesCS.filter(filter);
		}
		if (weightsCS) {
			weightsCS.filter(filter);
		}
		if (densitieCS) {
			densitieCS.filter(filter);
		}
	};

	/**
	 * иаметер сетки
	 * @param {Number|Event} ei
	 * @param {Element|EventTarget} el
	 * */
	InterfBricks.prototype.applyGridDiameter = function (ei, el) {
		if (ei.target) {
			ei.preventDefault();
			el = ei.target;
		}

		let $el = $(el);

		if (!$el.length) {
			return;
		}

		let $parentFieldset = $el.parents('fieldset');
		let $selectedOption = $el.find('option:selected');

		// Отображение диаметра кладочной сетки
		let $masonryGridDiameter = $parentFieldset.find('.js--masonryGridDiameter');
		if ($masonryGridDiameter.length) {
			if ($selectedOption.val() > 0) {
				$masonryGridDiameter.parents('.field').slideDown(ANIMATION_SPEED);
			}
			else {
				$masonryGridDiameter.parents('.field').hide();
			}
		}

	};

	/**
	 * @param {Number|Event} ei
	 * @param {Element|EventTarget} el
	 * */
	InterfBricks.prototype.addFieldsGroup = function (ei, el) {
		if (ei.target) {
			ei.preventDefault();
			el = ei.target;
		}

		let $el = $(el);

		if (!$el.length) {
			return;
		}

		let $parentFieldset = $el.parents('fieldset'),
			$fieldsAgregator = $parentFieldset.find('.js--fieldAgregator'),
			$fieldsTemplate = $parentFieldset.find('.template');

		if($fieldsTemplate.length === 0){
			return;
		}

		let template = $fieldsTemplate.html();
		let fieldsetName = $parentFieldset.attr('name');

		this.fieldsetOrder[fieldsetName] = this.fieldsetOrder[fieldsetName] || 0;

		template = template.replace(/#\{ordNumber\}/g, '#' + (this.fieldsetOrder[fieldsetName] + 1));
		template = template.replace(/_\{ordNumber\}/g, '_' + this.fieldsetOrder[fieldsetName]);
		template = template.replace(/disabled="disabled"/g, '');

		this.fieldsetOrder[fieldsetName]++;

		$(template).hide().appendTo($fieldsAgregator).slideDown(ANIMATION_SPEED);
	};

	/**
	 * @param {Number|Event} ei
	 * @param {Element|EventTarget} el
	 * */
	InterfBricks.prototype.delFieldsGroup = function (ei, el) {
		if (ei.target) {
			ei.preventDefault();
			el = ei.target;
		}

		let $el = $(el);

		if (!$el.length) {
			return;
		}

		let $parentFieldset = $el.parents('fieldset');
		let fieldsetName = $parentFieldset.attr('name');

		this.fieldsetOrder[fieldsetName]--;

		if (this.fieldsetOrder[fieldsetName] <= -1) {
			return false;
		}

		// Перенумеруем оставшиеся группы
		let $fieldset = $el.parents('fieldset');

		// Удалим выбранную группу полей
		$el.parents('.fieldset-additional').remove();

		// Перенумеруем идентификаторы
		let i = 0;
		let $fieldGroupName, $label, $input;

		$fieldset.find('.fieldset-additional').each(function () {
			let $this = $(this);

			if ($this.parent('.js--fieldsTemplate').length === 0) {

				// Переименуем название группы
				$fieldGroupName = $this.find('.js--fieldGroupName');
				$fieldGroupName.html($fieldGroupName.html().replace(/#\d+$/, '#' + (i + 1)));

				// Перенумеруем название, имена, идетификаторы
				$this.find('label').each(function () {
					let $this = $(this);
					$this.attr('for', $this.attr('for').replace(/_\d+$/, '_' + i));
				});

				$this.find('input').each(function () {
					let $this = $(this);
					$this.attr('id', $this.attr('id').replace(/_\d+$/, '_' + i));
					$this.attr('name', $this.attr('name').replace(/_\d+$/, '_' + i));
				});

				i++;
			}
		});
	};

	/**
	 * Export module to controller
	 * @var {InterfBricks} KalkPro.modules.InterfBricks
	 * */
	modules.InterfBricks = InterfBricks;

})();