const _data=require('./lib/data.js');
const _string=require('./lib/string.js');
const _number=require('./lib/number.js');
const _ddba=require('./lib/ddba.js');
const _event=require('./lib/event.js');
const _s3=require('./lib/s3.js');
const _speed=require('./lib/speed.js');
const _split=require('./lib/split.js');
const _geo=require('./lib/geo.js');

module.exports={
	DataHandler:_data,
	StringHandler:_string,
	NumberHandler:_number,
	ddba:_ddba,
	Event:_event,
	S3:_s3,
	Speed:_speed,
	Core:{..._data,..._string,..._number,..._event},
	Split:_split,
	Geo:_geo
}
