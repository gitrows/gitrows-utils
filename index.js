const _data=require('./lib/data.js');
const _string=require('./lib/string.js');

module.exports={
	DataHandler:_data,
	StringHandler:_string,
	Core:{..._data,..._string}
}
