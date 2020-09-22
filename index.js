const _data=require('./lib/data.js');
const _string=require('./lib/string.js');
const _number=require('./lib/number.js');

module.exports={
	DataHandler:_data,
	StringHandler:_string,
	NumberHandler:_number,
	Core:{..._data,..._string,..._number}
}
