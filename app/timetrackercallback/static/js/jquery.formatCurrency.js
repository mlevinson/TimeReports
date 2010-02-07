//  This file is part of the jQuery formatCurrency Plugin.
//
//    The jQuery formatCurrency Plugin is free software: you can redistribute it
//    and/or modify it under the terms of the GNU General Public License as published 
//    by the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.

//    The jQuery formatCurrency Plugin is distributed in the hope that it will
//    be useful, but WITHOUT ANY WARRANTY; without even the implied warranty 
//    of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License along with 
//    the jQuery formatCurrency Plugin.  If not, see <http://www.gnu.org/licenses/>.


function currencyFromNumber(num, settings){   
    num += '';
    var region = {
		symbol: '$',
		positiveFormat: '%s%n',
		negativeFormat: '(%s%n)',
		decimalSymbol: '.',
		digitGroupSymbol: ',',
		groupDigits: true
	};
	
	var defaults =  {
		name: "formatCurrency",
		colorize: false,
		region: '',
		global: true,
		roundToDecimalPlace: 2, // roundToDecimalPlace: -1; for no rounding; 0 to round to the dollar; 1 for one digit cents; 2 for two digit cents; 3 for three digit cents; ...
		eventOnDecimalsEntered: false
	};
	
	settings = $.extend(defaults, region, settings);
    settings.regex = generateRegex(settings);
    //identify '(123)' as a negative number
	if (num.search('\\(') >= 0) {
		num = '-' + num;
	}

	if (num === '' || (num === '-' && settings.roundToDecimalPlace === -1)) {
		return;
	}

	// if the number is valid use it, otherwise clean it
	if (isNaN(num)) {
		// clean number
		num = num.replace(settings.regex, '');
		
		if (num === '' || (num === '-' && settings.roundToDecimalPlace === -1)) {
			return;
		}
		
		if (settings.decimalSymbol != '.') {
			num = num.replace(settings.decimalSymbol, '.');  // reset to US decimal for arithmetic
		}
		if (isNaN(num)) {
			num = '0';
		}
	}
	
	// evalutate number input
	var numParts = String(num).split('.');
	var isPositive = (num == Math.abs(num));
	var hasDecimals = (numParts.length > 1);
	var decimals = (hasDecimals ? numParts[1].toString() : '0');
	var originalDecimals = decimals;
	
	// format number
	num = Math.abs(numParts[0]);
	if (settings.roundToDecimalPlace >= 0) {
		decimals = parseFloat('1.' + decimals); // prepend "0."; (IE does NOT round 0.50.toFixed(0) up, but (1+0.50).toFixed(0)-1
		decimals = decimals.toFixed(settings.roundToDecimalPlace); // round
		if (decimals.substring(0, 1) == '2') {
			num = Number(num) + 1;
		}
		decimals = decimals.substring(2); // remove "0."
	}
	num = String(num);

	if (settings.groupDigits) {
		for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
			num = num.substring(0, num.length - (4 * i + 3)) + settings.digitGroupSymbol + num.substring(num.length - (4 * i + 3));
		}
	}

	if ((hasDecimals && settings.roundToDecimalPlace == -1) || settings.roundToDecimalPlace > 0) {
		num += settings.decimalSymbol + decimals;
	}

	// format symbol/negative
	var format = isPositive ? settings.positiveFormat : settings.negativeFormat;
	var money = format.replace(/%s/g, settings.symbol);
	money = money.replace(/%n/g, num);
	return money;
}


function generateRegex(settings) {
	if (settings.symbol === '') {
		return new RegExp("[^\\d" + settings.decimalSymbol + "-]", "g");
	}
	else {
		var symbol = settings.symbol.replace('$', '\\$').replace('.', '\\.');		
		return new RegExp(symbol + "|[^\\d" + settings.decimalSymbol + "-]", "g");
	}	
}                                 