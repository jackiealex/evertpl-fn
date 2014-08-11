var glob = require('glob');
var mkdirp = require('mkdirp');
var template = require('../smartjs/template');
var path = require('path');

// set log string color
require('colors');

function _extend(a, b) {
	b || (b = {});
	for (var p in b) {
		a[p] = b[p];
	}
	return a;
};

function FN (options) {
	var defaultConfig = {
		src: '',
		selector: '',
		dist: ''
	};
	this.options = _extend(defaultConfig , options);
	this.init();
};

_extend(FN.prototype, {
	init: function() {
		template.config({
			src: this.options.src,
			cacheDir: this.options.dist,
			cacheMode: 'development',
			errorType: 'json',
			keepComments: false
		});

		this.fileList = [];

		this.getAllTemplates();
	},
	getAllTemplates: function(first_argument) {
		var files = glob.sync(this.options.selector, {
			cwd: this.options.src
		});
		this.fileList = this.fileList.concat(files);
	},
	run: function () {
		var len = this.fileList.length;
		var fileList = this.fileList;
		if(len > 0) {
			mkdirp.sync(this.options.dist);
		}
		var startTime = +new Date();
		for(var i=0; i < len; i++) {
			var tmplName = fileList[i];
			var tmplPath = path.join(this.options.src, tmplName);
			try  {
				template.renderFile(tmplName);
			} catch(e) {
				if (e.error_code) {
					console.log('ignore parent template file -- '.green, e.filename);
				}
			}
		}
		var endTime = + new Date();
		var summary = 'compile time: ' + (endTime - startTime)/ 1000 + 's';
		console.log(summary.blue);
	}
});

module.exports = FN;




