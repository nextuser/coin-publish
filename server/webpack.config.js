const path = require('path')
module.exports = {
	entry:".index.js",
	output:{
		path:path.resolve(__dirname,"dist"),
		file_name:"index.js",
	},
	mode :"development"

}
