#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var rest = require('restler');
var fs = require('fs');
var sys = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlString = function(htmlString) {
//	console.log(htmlString);
	return cheerio.load(htmlString);
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
	var out = checkHtmlString($, checksfile);
    return out;
};

var checkHtmlFile2 = function(htmlString, checksfile) {
//	console.log('ceckHmlFile2');
//	console.log(htmlString);
	$ = cheerioHtmlString(htmlString);
	var out = checkHtmlString($, checksfile);
	return out;
}

var checkHtmlString = function(htmlString, checksfile) {
	var checks = loadChecks(checksfile).sort();
    var out = {};	
	//console.log(htmlString.html());
    for(var ii in checks) {
        var present = htmlString(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
		.option('-u, --url <url_string>', 'URL of file')
        .parse(process.argv);

	if(program.url)
		console.log('URL defined');

	if(program.file){
    	console.log('file defined');
		var checkJson = checkHtmlFile(program.file, program.checks);
    	var outJson = JSON.stringify(checkJson, null, 4);
    	console.log(outJson);
	}else if(program.url){
		console.log('URL found : %s', program.url);
		rest.get(program.url).on('complete', function(result) {
			if(result instanceof Error) {
				console.error('Error')
			}else{
				//savedResult = result;
				
				var checkJson = checkHtmlFile2(result, program.checks);
				//console.log(savedResult);
    			var outJson = JSON.stringify(checkJson, null, 4);
    			console.log(outJson);
			}	
		});
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
