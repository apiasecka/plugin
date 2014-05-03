/*
Napisz wtyczkę do jQuery. Wtyczka ma służyć do walidacji pól formularza. Wtyczka powinna:
- Walidować się w jslint/jshint http://www.jshint.com (można wyłączyć opcję strict)
+ Zabezpieczać alias $
+ Pozwalać na chaining
+ Wykorzystywać each
+ Przyjmować parametry

Konkretnie już o wtyczce. Niech będą następujące metody:
(3) Walidacja na podstawie wyrażenia regularnego +
(3) Walidacja pola e-mail +
(4) Walidacja złożoności hasła +
(5) Obsługa pola kodu pocztowego działająca w następujący sposób: +
Użytkownik wpisuje kod pocztowy
W momencie gdy wpisany tekst będzie w formie 00-000 (gdzie 0 oznacza jakąś cyfrę), wtyczka zajmie się wypełnieniem pola zawierającego nazwę miejscowości
Jeśli kod jest niepoprawny, wtyczka oznaczy pole za pomocą czerwonego obramowania.
Baza danych kodów pocztowych jest w kody.csv.zip. Można ją rozpakować i przetwarzać automoatycznie. Można także ją podzielić na kilka plików. Baza ta powinna być dostępna po prostu. Możesz ją przerobić do formatu takiego, jaki Tobie najbardziej pasuje.
*/

/*
Plugin działa poprawnie przy założeniu, że będzie jedno pole z hasłem oraz jedna para pól z kodem pocztowym i miastem
*/

(function( $ ){
	$.fn.validateText = function ( options ) {
		var config = $.extend({
			pattern: /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłóńśźż]*$/,
			password_minLength: 8, // minimalna długość hasła
			password_bigLetter: 2, // ilość dużych liter w haśle
			password_digit: 2, // ilość cyfr w haśle
			password_specialCharacter: 2 // ilość znaków specjalnych [!,@,#,$,%,^,&,*,?,_,~] w haśle
		}, options);
		
		var codeJSON, id;
		
		var functions = {
			init: function( val ){
				var el = $(val).find('input');
				id = val;
				
				$(val).addClass('validateText');
				$($(val).find('input[type="submit"]')).attr('disabled', true);
				
				$($(val).find('input[data-type="password"]')).after('<div id="password">' + 
					'	<div class="box length"><i class="icon-ruler"></i></div>' + 
					'	<div class="box letter"><i class="icon-sort-alphabet-outline"></i></div>' + 
					'	<div class="box digit"><i class="icon-sort-numeric-outline"></i></div>' + 
					'	<div class="box special"><i class="icon-hash"></i></div>' + 
				'</div>');
				
				$.get('kody.json', function(result){
					functions.getArray(result);
				});
				
				$(el).blur(function(){
					var type = $(this).data('type');
					
					switch(type){
						case 'text':
							functions.validText(this);
							break;
						case 'email':
							functions.validEmail(this);
							break;
						case 'password':
							functions.validPassword(this);
							break;
						case 'code':
							functions.validCode(this);
							break;
					}
				});
			},
			validText: function( val ) {
				if( config.pattern.test($(val).val()) ) functions.succes(val);
				else functions.error(val);
			},
			validEmail: function( val ) {
				var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
				if( regex.test($(val).val()) ) functions.succes(val);
				else functions.error(val);
			},
			validPassword: function( val ) {
				var password = $(val).val(),
					valid = 0,
					bigLetter = /[A-Z]/g,
					digit = /[0-9]/g,
					specialCharacter = /[!,@,#,$,%,^,&,*,?,_,~]/g;
				
				// Sprawdzanie długości hasla
				if( password.length < config.password_minLength ){
					functions.errorPass('#password', '.length');
					valid--;
				} else {
					functions.succesPass('#password', '.length');
					valid++;
				}
				
				// Sprawdzanie wielkich liter
				if( bigLetter.test(password) && password.match(bigLetter).length >= config.password_bigLetter ){
					functions.succesPass('#password', '.letter');
					valid++;
				} else {
					functions.errorPass('#password', '.letter');
					valid--;
				}
				
				// Sprawdzanie cyfr
				if( password.match(digit) < config.password_digit ){
					functions.errorPass('#password', '.digit');
					valid--;
				} else {
					functions.succesPass('#password', '.digit');
					valid++;
				}
				
				// Sprawdzanie znaków specjalnych
				if( specialCharacter.test(password) && password.match(specialCharacter).length >= config.password_specialCharacter ){
					functions.succesPass('#password', '.special');
					valid++;
				} else {
					functions.errorPass('#password', '.special');
					valid--;
				}
				
				if( valid == 4 ) functions.succes(val);
				else functions.error(val);
			},
			validCode: function( val ) {
				var regex = /^[0-9]{2}\-[0-9]{3}$/;
				if( regex.test($(val).val()) ){
					var value = $(val).val(),
						city = codeJSON[value];
					
					if( city ){
						$('[data-type="city"]').val(city.toString());
						functions.succes(val);
					} else {
						$('[data-type="city"]').val('');
						functions.error(val);
					}
				} else {
					functions.error(val);
				}
			},
			getArray: function( date ) {
				codeJSON = date;
			},
			checkForm: function(){
				var el = $(id).find('input');
			
				for( var i = 0, empty = 0; i < el.length; i++ ){
					if( el[i].value === '' || $(el[i]).hasClass('error') ) empty++;
				}
				
				if( empty ) $($(id).find('input[type="submit"]')).attr('disabled', true);
				else $($(id).find('input[type="submit"]')).attr('disabled', false);
			},
			error: function( val ){
				if( $(val).hasClass('succes') ) $(val).removeClass('succes');
				$(val).addClass('error');
				
				functions.checkForm();
			},
			errorPass: function( val, type ){
				if( $($(val).find(type)).hasClass('succes') ) $($(val).find(type)).removeClass('succes');
				$($(val).find(type)).addClass('error');
				
				functions.checkForm();
			},
			succes: function( val ) {
				if( $(val).hasClass('error') ) $(val).removeClass('error');
				$(val).addClass('succes');
				functions.checkForm();
			},
			succesPass: function( val, type ) {
				if( $($(val).find(type)).hasClass('error') ) $($(val).find(type)).removeClass('error');
				$($(val).find(type)).addClass('succes');
				functions.checkForm();
			}
		};
			
		return this.each(function() {
			functions.init(this);
		});
	};

})( jQuery );