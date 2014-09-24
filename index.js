var glob = require('glob');
var mkdirp = require('mkdirp');
var template = require('evertpl');
var path = require('path');
var Q = require('q');
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
		onMessage: function(type, msg) {},
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
		var ignoreList = []
		for(var i=0; i < len; i++) {
			var tmplName = fileList[i];
			var tmplPath = path.join(this.options.src, tmplName);
			var err = null
			try  {
				template.renderFile(tmplName);
				this.options['onMessage'].call(this, 'compile', {
					filename: tmplName
				});
			} catch(e) {
				err = e
				if (err.error_code) {
					this.options['onMessage'].call(this, 'ignore', {
						filename: tmplName
					});
					ignoreList.push(e.filename)
				}
			}
		}

		this.options['onMessage'].call(this, 'finish', {
			ignored: ignoreList
		});
	}
});

module.exports = FN;




