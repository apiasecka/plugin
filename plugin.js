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
(4) Walidacja złożoności hasła
(5) Obsługa pola kodu pocztowego działająca w następujący sposób:
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
		
		console.log(config)
		var codeJSON;
		
		var functions = {
			init: function( val ){
				var el = $(val).find('input');
				$(val).addClass('validateText');
				console.log($(el).find('[data-type="password"]'))
				
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
				if( config.pattern.test($(val).val()) ){
					functions.succes(val);
				} else {
					functions.error(val);
				}
			},
			validEmail: function( val ) {
				var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
				if( regex.test($(val).val()) ){
					functions.succes(val);
				} else {
					functions.error(val);
				}
			},
			validPassword: function( val ) {
				var password = $(val).val();
				console.log(password)
				var score = 0;
				var bigLetter = /[A-Z]/g,
					digit = /[0-9]/g,
					specialCharacter = /[!,@,#,$,%,^,&,*,?,_,~]/g;
				
				// Sprawdzanie długości hasla
				if( password.length < config.password_minLength ){
					functions.errorPass('#password', '.length');
				} else {
					functions.succesPass('#password', '.length');
				}
				
				// Sprawdzanie wielkich liter
				if( bigLetter.test(password) && password.match(bigLetter).length >= config.password_bigLetter ){
					functions.succesPass('#password', '.letter');
				} else {
					functions.errorPass('#password', '.letter');
				}
				
				// Sprawdzanie cyfr
				if( password.match(digit) < config.password_digit ){
					functions.errorPass('#password', '.digit');
				} else {
					functions.succesPass('#password', '.digit');
				}
				
				// Sprawdzanie znaków specjalnych
				if( specialCharacter.test(password) && password.match(specialCharacter).length >= config_password.specialCharacter ){
					functions.succesPass('#password', '.special');
				} else {
					functions.errorPass('#password', '.special');
				}
				
				
			},
			validCode: function( val ) {
				var regex = /^[0-9]{2}\-[0-9]{3}$/;
				if( regex.test($(val).val()) ){ // jeżeli dobrze wpisane
					var value = $(val).val();
					var city = codeJSON[value];
					
					if( city ){
						functions.succes(val);
						$('[data-type="city"]').val(city.toString()).attr('disabled',true);
					} else {
						functions.error(val);
						$('[data-type="city"]').val('');
					}
				} else { //bląd
					functions.error(val);
				}
			},
			getArray: function( date ) {
				codeJSON = date;
			},
			error: function( val ){
				if($(val).hasClass('succes')) $(val).removeClass('succes');
				$(val).addClass('error');
			},
			errorPass: function( val, type ){
				if($($(val).find(type)).hasClass('succes')) $($(val).find(type)).removeClass('succes');
				$($(val).find(type)).addClass('error');
			},
			succes: function( val ) {
				if($(val).hasClass('error')) $(val).removeClass('error');
				$(val).addClass('succes');
			},
			succesPass: function( val, type ) {
				if($($(val).find(type)).hasClass('error')) $($(val).find(type)).removeClass('error');
				$($(val).find(type)).addClass('succes');
			}
		};
			
		return this.each(function() {
			functions.init(this);
		});
	};

})( jQuery );