'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var lodash = _interopDefault(require('lodash'));

var crypto = {};

// Unique ID creation requires a high quality random # generator.  In node.js
// this is pretty straight-forward - we use the crypto API.



var rng = function nodeRNG() {
  return crypto.randomBytes(16);
};

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

var bytesToUuid_1 = bytesToUuid;

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid_1(b);
}

var v1_1 = v1;

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var dayjs_min = createCommonjsModule(function (module, exports) {
!function(t,n){module.exports=n();}(commonjsGlobal,function(){var t="millisecond",n="second",e="minute",r="hour",i="day",s="week",u="month",o="quarter",a="year",h=/^(\d{4})-?(\d{1,2})-?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/,f=/\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,c=function(t,n,e){var r=String(t);return !r||r.length>=n?t:""+Array(n+1-r.length).join(e)+t},d={s:c,z:function(t){var n=-t.utcOffset(),e=Math.abs(n),r=Math.floor(e/60),i=e%60;return (n<=0?"+":"-")+c(r,2,"0")+":"+c(i,2,"0")},m:function(t,n){var e=12*(n.year()-t.year())+(n.month()-t.month()),r=t.clone().add(e,u),i=n-r<0,s=t.clone().add(e+(i?-1:1),u);return Number(-(e+(n-r)/(i?r-s:s-r))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(h){return {M:u,y:a,w:s,d:i,h:r,m:e,s:n,ms:t,Q:o}[h]||String(h||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},$={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},l="en",m={};m[l]=$;var y=function(t){return t instanceof v},M=function(t,n,e){var r;if(!t)return null;if("string"==typeof t)m[t]&&(r=t),n&&(m[t]=n,r=t);else{var i=t.name;m[i]=t,r=i;}return e||(l=r),r},g=function(t,n,e){if(y(t))return t.clone();var r=n?"string"==typeof n?{format:n,pl:e}:n:{};return r.date=t,new v(r)},D=d;D.l=M,D.i=y,D.w=function(t,n){return g(t,{locale:n.$L,utc:n.$u})};var v=function(){function c(t){this.$L=this.$L||M(t.locale,null,!0)||l,this.parse(t);}var d=c.prototype;return d.parse=function(t){this.$d=function(t){var n=t.date,e=t.utc;if(null===n)return new Date(NaN);if(D.u(n))return new Date;if(n instanceof Date)return new Date(n);if("string"==typeof n&&!/Z$/i.test(n)){var r=n.match(h);if(r)return e?new Date(Date.UTC(r[1],r[2]-1,r[3]||1,r[4]||0,r[5]||0,r[6]||0,r[7]||0)):new Date(r[1],r[2]-1,r[3]||1,r[4]||0,r[5]||0,r[6]||0,r[7]||0)}return new Date(n)}(t),this.init();},d.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},d.$utils=function(){return D},d.isValid=function(){return !("Invalid Date"===this.$d.toString())},d.isSame=function(t,n){var e=g(t);return this.startOf(n)<=e&&e<=this.endOf(n)},d.isAfter=function(t,n){return g(t)<this.startOf(n)},d.isBefore=function(t,n){return this.endOf(n)<g(t)},d.$g=function(t,n,e){return D.u(t)?this[n]:this.set(e,t)},d.year=function(t){return this.$g(t,"$y",a)},d.month=function(t){return this.$g(t,"$M",u)},d.day=function(t){return this.$g(t,"$W",i)},d.date=function(t){return this.$g(t,"$D","date")},d.hour=function(t){return this.$g(t,"$H",r)},d.minute=function(t){return this.$g(t,"$m",e)},d.second=function(t){return this.$g(t,"$s",n)},d.millisecond=function(n){return this.$g(n,"$ms",t)},d.unix=function(){return Math.floor(this.valueOf()/1e3)},d.valueOf=function(){return this.$d.getTime()},d.startOf=function(t,o){var h=this,f=!!D.u(o)||o,c=D.p(t),d=function(t,n){var e=D.w(h.$u?Date.UTC(h.$y,n,t):new Date(h.$y,n,t),h);return f?e:e.endOf(i)},$=function(t,n){return D.w(h.toDate()[t].apply(h.toDate(),(f?[0,0,0,0]:[23,59,59,999]).slice(n)),h)},l=this.$W,m=this.$M,y=this.$D,M="set"+(this.$u?"UTC":"");switch(c){case a:return f?d(1,0):d(31,11);case u:return f?d(1,m):d(0,m+1);case s:var g=this.$locale().weekStart||0,v=(l<g?l+7:l)-g;return d(f?y-v:y+(6-v),m);case i:case"date":return $(M+"Hours",0);case r:return $(M+"Minutes",1);case e:return $(M+"Seconds",2);case n:return $(M+"Milliseconds",3);default:return this.clone()}},d.endOf=function(t){return this.startOf(t,!1)},d.$set=function(s,o){var h,f=D.p(s),c="set"+(this.$u?"UTC":""),d=(h={},h[i]=c+"Date",h.date=c+"Date",h[u]=c+"Month",h[a]=c+"FullYear",h[r]=c+"Hours",h[e]=c+"Minutes",h[n]=c+"Seconds",h[t]=c+"Milliseconds",h)[f],$=f===i?this.$D+(o-this.$W):o;if(f===u||f===a){var l=this.clone().set("date",1);l.$d[d]($),l.init(),this.$d=l.set("date",Math.min(this.$D,l.daysInMonth())).toDate();}else d&&this.$d[d]($);return this.init(),this},d.set=function(t,n){return this.clone().$set(t,n)},d.get=function(t){return this[D.p(t)]()},d.add=function(t,o){var h,f=this;t=Number(t);var c=D.p(o),d=function(n){var e=g(f);return D.w(e.date(e.date()+Math.round(n*t)),f)};if(c===u)return this.set(u,this.$M+t);if(c===a)return this.set(a,this.$y+t);if(c===i)return d(1);if(c===s)return d(7);var $=(h={},h[e]=6e4,h[r]=36e5,h[n]=1e3,h)[c]||1,l=this.valueOf()+t*$;return D.w(l,this)},d.subtract=function(t,n){return this.add(-1*t,n)},d.format=function(t){var n=this;if(!this.isValid())return "Invalid Date";var e=t||"YYYY-MM-DDTHH:mm:ssZ",r=D.z(this),i=this.$locale(),s=this.$H,u=this.$m,o=this.$M,a=i.weekdays,h=i.months,c=function(t,r,i,s){return t&&(t[r]||t(n,e))||i[r].substr(0,s)},d=function(t){return D.s(s%12||12,t,"0")},$=i.meridiem||function(t,n,e){var r=t<12?"AM":"PM";return e?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:o+1,MM:D.s(o+1,2,"0"),MMM:c(i.monthsShort,o,h,3),MMMM:h[o]||h(this,e),D:this.$D,DD:D.s(this.$D,2,"0"),d:String(this.$W),dd:c(i.weekdaysMin,this.$W,a,2),ddd:c(i.weekdaysShort,this.$W,a,3),dddd:a[this.$W],H:String(s),HH:D.s(s,2,"0"),h:d(1),hh:d(2),a:$(s,u,!0),A:$(s,u,!1),m:String(u),mm:D.s(u,2,"0"),s:String(this.$s),ss:D.s(this.$s,2,"0"),SSS:D.s(this.$ms,3,"0"),Z:r};return e.replace(f,function(t,n){return n||l[t]||r.replace(":","")})},d.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},d.diff=function(t,h,f){var c,d=D.p(h),$=g(t),l=6e4*($.utcOffset()-this.utcOffset()),m=this-$,y=D.m(this,$);return y=(c={},c[a]=y/12,c[u]=y,c[o]=y/3,c[s]=(m-l)/6048e5,c[i]=(m-l)/864e5,c[r]=m/36e5,c[e]=m/6e4,c[n]=m/1e3,c)[d]||m,f?y:D.a(y)},d.daysInMonth=function(){return this.endOf(u).$D},d.$locale=function(){return m[this.$L]},d.locale=function(t,n){if(!t)return this.$L;var e=this.clone();return e.$L=M(t,n,!0),e},d.clone=function(){return D.w(this.toDate(),this)},d.toDate=function(){return new Date(this.$d)},d.toJSON=function(){return this.toISOString()},d.toISOString=function(){return this.$d.toISOString()},d.toString=function(){return this.$d.toUTCString()},c}();return g.prototype=v.prototype,g.extend=function(t,n){return t(n,v,g),g},g.locale=M,g.isDayjs=y,g.unix=function(t){return g(1e3*t)},g.en=m[l],g.Ls=m,g});
});

// const path = require('path')




 // main reason for having this file, because i'm trying to move away repetetive functions
// @TODO Arthur have at least 3-5 different modules, that should replace this method
// @TODO do we need it? https://github.com/sindresorhus/parse-json
// const parser = function (file) {
//   // return JSON.parse(JSON.stringify(file))
//   return file
// }


var __l = function __l(value) {
  return console.log(value);
};

var __get$1 = function __get(value) {
  return parser(value);
};

var __find = function __find(alias, files) {
  // console.log(files);
  var result = lodash.get(files, alias); // console.log(alias);
  // console.log(result);


  return __get$1(result);
}; // function that will improve work with uuid id generator


var __generateId = function __generateId() {
  return lodash.uniqueId(v1_1());
}; // @TODO can be one method with different types.


var __generateDate = function __generateDate() {
  return dayjs_min().toDate();
};

var utils = {
  // parser,
  __l: __l,
  __find: __find,
  __get: __get$1,
  __generateId: __generateId,
  __generateDate: __generateDate
};

var departments$1 = [
	{
		name: "Fresh vegetables",
		type: "food"
	},
	{
		name: "Condiments / Sauces",
		type: "food"
	},
	{
		name: "Dairy",
		type: "food"
	},
	{
		name: "Cheese",
		type: "food"
	},
	{
		name: "Meat",
		type: "food"
	},
	{
		name: "Seafood",
		type: "food"
	},
	{
		name: "Beverages",
		type: "food"
	},
	{
		name: "Baked goods",
		type: "food"
	},
	{
		name: "Baking",
		type: "food"
	},
	{
		name: "Snacks",
		type: "food"
	},
	{
		name: "Themed meals",
		type: "food"
	},
	{
		name: "Baby stuff",
		type: "non-food"
	},
	{
		name: "Pets",
		type: "non-food"
	},
	{
		name: "Fresh fruits",
		type: "food"
	},
	{
		name: "Refrigerated items",
		type: "food"
	},
	{
		name: "Frozen",
		type: "food"
	},
	{
		name: "Various groceries",
		type: "food"
	},
	{
		name: "Canned foods",
		type: "food"
	},
	{
		name: "Spices & herbs",
		type: "food"
	},
	{
		name: "Personal care",
		type: "household"
	},
	{
		name: "Medicine",
		type: "household"
	},
	{
		name: "Kitchen",
		type: "household"
	},
	{
		name: "Other",
		type: "household"
	},
	{
		name: "Cleaning products",
		type: "household"
	},
	{
		name: "Office supplies",
		type: "household"
	},
	{
		name: "Other stuff",
		type: "household"
	},
	{
		name: "To-do list",
		type: "household"
	},
	{
		name: "Protein",
		type: "food"
	},
	{
		name: "Starch",
		type: "food"
	},
	{
		name: "Healthy fats",
		type: "food"
	},
	{
		name: "Veggies",
		type: "food"
	},
	{
		name: "Fruits",
		type: "food"
	},
	{
		name: "Oils and seeds",
		type: "food"
	},
	{
		name: "Seasonings",
		type: "food"
	},
	{
		name: "Meat/protein",
		type: "food"
	},
	{
		name: "Vegetables",
		type: "food"
	},
	{
		name: "Grits",
		type: "food"
	},
	{
		name: "Produce",
		type: "food"
	},
	{
		name: "Bulk foods",
		type: "food"
	},
	{
		name: "Canned goods/pantry",
		type: "food"
	},
	{
		name: "Herbs/spices",
		type: "food"
	},
	{
		name: "Frozen foods",
		type: "food"
	},
	{
		name: "Oils, vinegars, and condiments",
		type: "food"
	},
	{
		name: "Fats",
		type: "food"
	},
	{
		name: "Keto snacks",
		type: "food"
	},
	{
		name: "Condiments",
		type: "food"
	},
	{
		name: "Drinks",
		type: "food"
	},
	{
		name: "Flour",
		type: "food"
	},
	{
		name: "Vegatables",
		type: "food"
	},
	{
		name: "Meat/fish poultry",
		type: "food"
	},
	{
		name: "Cheese/dairy",
		type: "food"
	},
	{
		name: "Cheses in 1 ounce portions",
		type: "food"
	},
	{
		name: "Fats and dressings",
		type: "food"
	},
	{
		name: "Zero carb drinks",
		type: "food"
	},
	{
		name: "Nuts/seeds",
		type: "food"
	},
	{
		name: "Miscellaneous",
		type: "non-food"
	},
	{
		name: "Soy vegan protein",
		type: "food"
	},
	{
		name: "Zero carb alcoholic drinks",
		type: "food"
	}
];

var grocery = [
	{
		departments: [
			"Fresh vegetables",
			"Condiments / Sauces",
			"Dairy",
			"Cheese",
			"Meat",
			"Seafood",
			"Beverages",
			"Baked goods",
			"Baking",
			"Snacks",
			"Themed meals",
			"Baby stuff",
			"Pets",
			"Fresh fruits",
			"Refrigerated items",
			"Frozen",
			"Various groceries",
			"Canned foods",
			"Spices & herbs",
			"Personal care",
			"Medicine",
			"Kitchen",
			"Other",
			"Cleaning products",
			"Office supplies",
			"Other stuff",
			"To-do list"
		],
		id: 1,
		name: "Ultimate Grocery List",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"PROTEIN",
			"STARCH",
			"HEALTHY FATS",
			"VEGGIES",
			"BEVERAGES",
			"FRUITS",
			"OILS AND SEEDS",
			"SEASONINGS"
		],
		id: 2,
		name: "Clean Fatiring",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"MEAT/PROTEIN",
			"DAIRY",
			"FRUITS",
			"SNACKS",
			"VEGETABLES",
			"BAKING",
			"GRIS"
		],
		id: 3,
		name: "Grocery List Essentials",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"Produce",
			"Protein",
			"Bulk Foods",
			"Canned Goods/Pantry",
			"Herbs/Spices",
			"Frozen Foods",
			"Oils, Vinegars, and Condiments"
		],
		id: 4,
		name: "Healthy Vegetarian",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"FATS",
			"KETO SNACKS",
			"PROTEIN",
			"VEGGIES",
			"CONDIMENTS",
			"DRINKS",
			"FLOUR",
			"FRUITS"
		],
		id: 5,
		name: "Keto Diet Food",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"Vegatables",
			"Meat/Fish Poultry",
			"Cheese/Dairy",
			"Cheses In 1 Ounce Portions",
			"Seafood",
			"Fruits",
			"Fats and Dressings",
			"Zero Carb Drinks",
			"Nuts/Seeds",
			"Miscellaneous",
			"Soy Vegan Protein",
			"Herbs/Spices",
			"Zero Carb Alcoholic Drinks"
		],
		id: 6,
		name: "Low Carb Food",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"Other"
		],
		id: 7,
		name: "Rabel Dietitian",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"Other"
		],
		id: 8,
		name: "19 Gluten-Free Foods Shopping List",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"staples",
			"tinnedFood",
			"vegetables",
			"fruits",
			"meat",
			"condiments",
			"dairy",
			"spreads",
			"cookingBaking",
			"drinks",
			"pastry",
			"sweets"
		],
		id: 9,
		name: "basic-grocery-list",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"Other"
		],
		id: 10,
		name: "first-vegan-grocery-list",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"grains and flours",
			"single ingredient food",
			"produce",
			"vegetarian protein source",
			"dairy like stuff",
			"dry stuff",
			"other"
		],
		id: 11,
		name: "gluten-free-diet",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"breads-and-grains",
			"dairy-and-eggs",
			"meats",
			"fresh produce",
			"frozen items",
			"pantry staples",
			"other"
		],
		id: 12,
		name: "health-article",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"other"
		],
		id: 13,
		name: "How-i-spent-40-at-trader-joes-and-ate-healthy-for-a-week",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"carbs",
			"ProteinSources",
			"DairyMilk",
			"produce",
			"CondimentsMiscellaneous",
			"FrozenFoods"
		],
		id: 14,
		name: "number-four",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"produce",
			"herbs",
			"meat, fish and soy proteins",
			"grocery items",
			"oils, vinegar and condiments",
			"spices",
			"nuts and seeds"
		],
		id: 15,
		name: "dr-ozs-21-day-weight-loss-breakthrough-shopping-list",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"other"
		],
		id: 16,
		name: "healthy-diet-for-20-week-list",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"fruits",
			"vegetables",
			"grains",
			"protein",
			"dairy",
			"pantry"
		],
		id: 17,
		name: "1-week-healthy-budget-grocery-list",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"other"
		],
		id: 18,
		name: "the-fitness-dollar-menu-budget-friendly-groceries",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"other"
		],
		id: 19,
		name: "healthy-diet-vegetarian-paleo-shopping-list",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"other"
		],
		id: 20,
		name: "essential-groceries-for-single-guys",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"pantry ingredients",
			"other"
		],
		id: 21,
		name: "grocery-budget-for-4-people",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"other"
		],
		id: 22,
		name: "27-dollar-grocery-challenge",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"beans",
			"rice",
			"pasta",
			"other grains",
			"canned tomatoes",
			"canned vegetables",
			"canned and dried fruits",
			"sauces",
			"soups",
			"meats",
			"other",
			"vinegars",
			"oils",
			"reduced fat cheeses",
			"dairy",
			"breads",
			"fish"
		],
		id: 23,
		name: "shopping-list-basic-ingredients-for-a-healthy-kitchen",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"other"
		],
		id: 24,
		name: "19-items-you-need-on-your-next-grocery-list",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"other"
		],
		id: 25,
		name: "14-grocery-staples-I-always-have-as-a-20-something-on-a-budget",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"Other"
		],
		id: 26,
		name: "building-a-healthy-vegan-grocery-list",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"shopping list",
			"each week buy",
			"detox vegetable broth ingredients"
		],
		id: 27,
		name: "dr-ozs-rapid-weight-loss-plan-shopping-list",
		img: false,
		desc: false,
		slug: false
	},
	{
		departments: [
			"Other"
		],
		id: 14,
		name: "number-four9",
		img: false,
		desc: false,
		slug: false
	}
];

var ingredients = [
	{
		name: "Asparagus",
		department: "Fresh vegetables"
	},
	{
		name: "Broccoli",
		department: "Fresh vegetables"
	},
	{
		name: "Carrots",
		department: "Fresh vegetables"
	},
	{
		name: "Cauliflower",
		department: "Fresh vegetables"
	},
	{
		name: "Celery",
		department: "Fresh vegetables"
	},
	{
		name: "Corn",
		department: "Fresh vegetables"
	},
	{
		name: "Cucumbers",
		department: "Fresh vegetables"
	},
	{
		name: "Lettuce  Greens",
		department: "Fresh vegetables"
	},
	{
		name: "Mushrooms",
		department: "Fresh vegetables"
	},
	{
		name: "Onions",
		department: "Fresh vegetables"
	},
	{
		name: "Peppers",
		department: "Fresh vegetables"
	},
	{
		name: "Potatoes",
		department: "Fresh vegetables"
	},
	{
		name: "Spinach",
		department: "Fresh vegetables"
	},
	{
		name: "Squash",
		department: "Fresh vegetables"
	},
	{
		name: "Zucchini",
		department: "Fresh vegetables"
	},
	{
		name: "Tomatoes*",
		department: "Fresh vegetables"
	},
	{
		name: "BBQ sauce",
		department: "Condiments / Sauces"
	},
	{
		name: "Gravy",
		department: "Condiments / Sauces"
	},
	{
		name: "Honey",
		department: "Condiments / Sauces"
	},
	{
		name: "Hot sauce",
		department: "Condiments / Sauces"
	},
	{
		name: "Jam  Jelly  Preserves",
		department: "Condiments / Sauces"
	},
	{
		name: "Ketchup  Mustard",
		department: "Condiments / Sauces"
	},
	{
		name: "Pasta sauce",
		department: "Condiments / Sauces"
	},
	{
		name: "Relish",
		department: "Condiments / Sauces"
	},
	{
		name: "Salad dressin",
		department: "Condiments / Sauces"
	},
	{
		name: "Salsa",
		department: "Condiments / Sauces"
	},
	{
		name: "Soy sauce",
		department: "Condiments / Sauces"
	},
	{
		name: "Steak sauce",
		department: "Condiments / Sauces"
	},
	{
		name: "Syrup",
		department: "Condiments / Sauces"
	},
	{
		name: "Worcestershire sauce",
		department: "Condiments / Sauces"
	},
	{
		name: "Butter  Margarine",
		department: "Dairy"
	},
	{
		name: "Cottage cheese",
		department: "Dairy"
	},
	{
		name: "Half & half",
		department: "Dairy"
	},
	{
		name: "Milk",
		department: "Dairy"
	},
	{
		name: "Sour cream",
		department: "Dairy"
	},
	{
		name: "Whipped cream",
		department: "Dairy"
	},
	{
		name: "Yogurt",
		department: "Dairy"
	},
	{
		name: "Bleu cheese",
		department: "Cheese"
	},
	{
		name: "Cheddar",
		department: "Cheese"
	},
	{
		name: "Cottage cheese",
		department: "Cheese"
	},
	{
		name: "Cream cheese",
		department: "Cheese"
	},
	{
		name: "Feta",
		department: "Cheese"
	},
	{
		name: "Goat cheese",
		department: "Cheese"
	},
	{
		name: "Mozzarella",
		department: "Cheese"
	},
	{
		name: "Parmesan",
		department: "Cheese"
	},
	{
		name: "Provolone",
		department: "Cheese"
	},
	{
		name: "Ricotta",
		department: "Cheese"
	},
	{
		name: "Sandwich slices",
		department: "Cheese"
	},
	{
		name: "Swiss",
		department: "Cheese"
	},
	{
		name: "Bacon  Sausage",
		department: "Meat"
	},
	{
		name: "Beef",
		department: "Meat"
	},
	{
		name: "Chicken",
		department: "Meat"
	},
	{
		name: "Ground beef  Turkey",
		department: "Meat"
	},
	{
		name: "Ham  Pork",
		department: "Meat"
	},
	{
		name: "Hot dogs",
		department: "Meat"
	},
	{
		name: "Lunchmeat",
		department: "Meat"
	},
	{
		name: "Turkey",
		department: "Meat"
	},
	{
		name: "Catfish",
		department: "Seafood"
	},
	{
		name: "Crab",
		department: "Seafood"
	},
	{
		name: "Lobster",
		department: "Seafood"
	},
	{
		name: "Mussels",
		department: "Seafood"
	},
	{
		name: "Oysters",
		department: "Seafood"
	},
	{
		name: "Salmon",
		department: "Seafood"
	},
	{
		name: "Shrimp",
		department: "Seafood"
	},
	{
		name: "Tilapia",
		department: "Seafood"
	},
	{
		name: "Tuna",
		department: "Seafood"
	},
	{
		name: "Beer",
		department: "Beverages"
	},
	{
		name: "Club soda  Tonic",
		department: "Beverages"
	},
	{
		name: "Champagne",
		department: "Beverages"
	},
	{
		name: "Gin",
		department: "Beverages"
	},
	{
		name: "Juice",
		department: "Beverages"
	},
	{
		name: "Mixers",
		department: "Beverages"
	},
	{
		name: "Red wine  White wine",
		department: "Beverages"
	},
	{
		name: "Rum",
		department: "Beverages"
	},
	{
		name: "Saké",
		department: "Beverages"
	},
	{
		name: "Soda pop",
		department: "Beverages"
	},
	{
		name: "Sports drink",
		department: "Beverages"
	},
	{
		name: "Whiskey",
		department: "Beverages"
	},
	{
		name: "Vodka",
		department: "Beverages"
	},
	{
		name: "Bagels  Croissants",
		department: "Baked goods"
	},
	{
		name: "Buns  Rolls",
		department: "Baked goods"
	},
	{
		name: "Cake  Cookies",
		department: "Baked goods"
	},
	{
		name: "Donuts  Pastries",
		department: "Baked goods"
	},
	{
		name: "Fresh bread",
		department: "Baked goods"
	},
	{
		name: "Pie! Pie! Pie!",
		department: "Baked goods"
	},
	{
		name: "Pita bread",
		department: "Baked goods"
	},
	{
		name: "Sliced bread",
		department: "Baked goods"
	},
	{
		name: "Baking powder  Soda",
		department: "Baking"
	},
	{
		name: "Bread crumbs",
		department: "Baking"
	},
	{
		name: "Cake  Brownie mix",
		department: "Baking"
	},
	{
		name: "Cake icing Decorations",
		department: "Baking"
	},
	{
		name: "Chocolate chips  Cocoa",
		department: "Baking"
	},
	{
		name: "Flour",
		department: "Baking"
	},
	{
		name: "Shortening",
		department: "Baking"
	},
	{
		name: "Sugar",
		department: "Baking"
	},
	{
		name: "Sugar substitute",
		department: "Baking"
	},
	{
		name: "Yeast",
		department: "Baking"
	},
	{
		name: "Candy  Gum",
		department: "Snacks"
	},
	{
		name: "Cookies",
		department: "Snacks"
	},
	{
		name: "Crackers",
		department: "Snacks"
	},
	{
		name: "Dried fruit",
		department: "Snacks"
	},
	{
		name: "Granola bars  Mix",
		department: "Snacks"
	},
	{
		name: "Nuts  Seeds",
		department: "Snacks"
	},
	{
		name: "Oatmeal",
		department: "Snacks"
	},
	{
		name: "Popcorn",
		department: "Snacks"
	},
	{
		name: "Potato  Corn chips",
		department: "Snacks"
	},
	{
		name: "Pretzels",
		department: "Snacks"
	},
	{
		name: "Burger night",
		department: "Themed meals"
	},
	{
		name: "Chili night",
		department: "Themed meals"
	},
	{
		name: "Pizza night",
		department: "Themed meals"
	},
	{
		name: "Spaghetti night",
		department: "Themed meals"
	},
	{
		name: "Taco night",
		department: "Themed meals"
	},
	{
		name: "Take-out deli food",
		department: "Themed meals"
	},
	{
		name: "Baby food",
		department: "Baby stuff"
	},
	{
		name: "Diapers",
		department: "Baby stuff"
	},
	{
		name: "Formula",
		department: "Baby stuff"
	},
	{
		name: "Lotion",
		department: "Baby stuff"
	},
	{
		name: "Baby wash",
		department: "Baby stuff"
	},
	{
		name: "Wipes",
		department: "Baby stuff"
	},
	{
		name: "Cat food  Treats",
		department: "Pets"
	},
	{
		name: "Cat litter",
		department: "Pets"
	},
	{
		name: "Dog food  Treats",
		department: "Pets"
	},
	{
		name: "Flea treatment",
		department: "Pets"
	},
	{
		name: "Pet shampoo",
		department: "Pets"
	},
	{
		name: "Apples",
		department: "Fresh fruits"
	},
	{
		name: "Avocados",
		department: "Fresh fruits"
	},
	{
		name: "Bananas",
		department: "Fresh fruits"
	},
	{
		name: "Berries",
		department: "Fresh fruits"
	},
	{
		name: "Cherries",
		department: "Fresh fruits"
	},
	{
		name: "Grapefruit",
		department: "Fresh fruits"
	},
	{
		name: "Grapes",
		department: "Fresh fruits"
	},
	{
		name: "Kiwis",
		department: "Fresh fruits"
	},
	{
		name: "Lemons  Limes",
		department: "Fresh fruits"
	},
	{
		name: "Melon",
		department: "Fresh fruits"
	},
	{
		name: "Nectarines",
		department: "Fresh fruits"
	},
	{
		name: "Oranges",
		department: "Fresh fruits"
	},
	{
		name: "Peaches",
		department: "Fresh fruits"
	},
	{
		name: "Pears",
		department: "Fresh fruits"
	},
	{
		name: "Plums",
		department: "Fresh fruits"
	},
	{
		name: "Bagels",
		department: "Refrigerated items"
	},
	{
		name: "Chip dip",
		department: "Refrigerated items"
	},
	{
		name: "Eggs",
		department: "Refrigerated items"
	},
	{
		name: "English muffins",
		department: "Refrigerated items"
	},
	{
		name: "Fruit juice",
		department: "Refrigerated items"
	},
	{
		name: "Hummus",
		department: "Refrigerated items"
	},
	{
		name: "Ready-bake breads",
		department: "Refrigerated items"
	},
	{
		name: "Tofu",
		department: "Refrigerated items"
	},
	{
		name: "Tortillas",
		department: "Refrigerated items"
	},
	{
		name: "Breakfasts",
		department: "Frozen"
	},
	{
		name: "Burritos",
		department: "Frozen"
	},
	{
		name: "Fish sticks",
		department: "Frozen"
	},
	{
		name: "Fries  Tater tots",
		department: "Frozen"
	},
	{
		name: "Ice cream  Sorbet",
		department: "Frozen"
	},
	{
		name: "Juice concentrate",
		department: "Frozen"
	},
	{
		name: "Pizza",
		department: "Frozen"
	},
	{
		name: "Pizza Rolls",
		department: "Frozen"
	},
	{
		name: "Popsicles",
		department: "Frozen"
	},
	{
		name: "TV dinners",
		department: "Frozen"
	},
	{
		name: "Vegetables",
		department: "Frozen"
	},
	{
		name: "Bouillon cubes",
		department: "Various groceries"
	},
	{
		name: "Cereal",
		department: "Various groceries"
	},
	{
		name: "Coffee  Filters",
		department: "Various groceries"
	},
	{
		name: "Instant potatoes",
		department: "Various groceries"
	},
	{
		name: "Lemon  Lime juice",
		department: "Various groceries"
	},
	{
		name: "Mac & cheese",
		department: "Various groceries"
	},
	{
		name: "Olive oil",
		department: "Various groceries"
	},
	{
		name: "Packaged meals",
		department: "Various groceries"
	},
	{
		name: "Pancake  Waffle mix",
		department: "Various groceries"
	},
	{
		name: "Pasta",
		department: "Various groceries"
	},
	{
		name: "Peanut butter",
		department: "Various groceries"
	},
	{
		name: "Pickles",
		department: "Various groceries"
	},
	{
		name: "Rice",
		department: "Various groceries"
	},
	{
		name: "Tea",
		department: "Various groceries"
	},
	{
		name: "Vegetable oil",
		department: "Various groceries"
	},
	{
		name: "Vinegar",
		department: "Various groceries"
	},
	{
		name: "Applesauce",
		department: "Canned foods"
	},
	{
		name: "Baked beans",
		department: "Canned foods"
	},
	{
		name: "Broth",
		department: "Canned foods"
	},
	{
		name: "Fruit",
		department: "Canned foods"
	},
	{
		name: "Olives",
		department: "Canned foods"
	},
	{
		name: "Tinned meats",
		department: "Canned foods"
	},
	{
		name: "Tuna  Chicken",
		department: "Canned foods"
	},
	{
		name: "Soup  Chili",
		department: "Canned foods"
	},
	{
		name: "Tomatoes",
		department: "Canned foods"
	},
	{
		name: "Veggies",
		department: "Canned foods"
	},
	{
		name: "Basil",
		department: "Spices & herbs"
	},
	{
		name: "Black pepper",
		department: "Spices & herbs"
	},
	{
		name: "Cilantro",
		department: "Spices & herbs"
	},
	{
		name: "Cinnamon",
		department: "Spices & herbs"
	},
	{
		name: "Garlic",
		department: "Spices & herbs"
	},
	{
		name: "Ginger",
		department: "Spices & herbs"
	},
	{
		name: "Mint",
		department: "Spices & herbs"
	},
	{
		name: "Oregano",
		department: "Spices & herbs"
	},
	{
		name: "Paprika",
		department: "Spices & herbs"
	},
	{
		name: "Parsley",
		department: "Spices & herbs"
	},
	{
		name: "Red pepper",
		department: "Spices & herbs"
	},
	{
		name: "Salt",
		department: "Spices & herbs"
	},
	{
		name: "Vanilla extract",
		department: "Spices & herbs"
	},
	{
		name: "Antiperspirant  Deodorant",
		department: "Personal care"
	},
	{
		name: "Bath soap  Hand soap",
		department: "Personal care"
	},
	{
		name: "Condoms  Other b.c.",
		department: "Personal care"
	},
	{
		name: "Cosmetics",
		department: "Personal care"
	},
	{
		name: "Cotton swabs  Balls",
		department: "Personal care"
	},
	{
		name: "Facial cleanser",
		department: "Personal care"
	},
	{
		name: "Facial tissue",
		department: "Personal care"
	},
	{
		name: "Feminine products",
		department: "Personal care"
	},
	{
		name: "Floss",
		department: "Personal care"
	},
	{
		name: "Hair gel  Spray",
		department: "Personal care"
	},
	{
		name: "Lip balm",
		department: "Personal care"
	},
	{
		name: "Moisturizing lotion",
		department: "Personal care"
	},
	{
		name: "Mouthwash",
		department: "Personal care"
	},
	{
		name: "Razors  Shaving cream",
		department: "Personal care"
	},
	{
		name: "Shampoo  Conditioner",
		department: "Personal care"
	},
	{
		name: "Sunblock",
		department: "Personal care"
	},
	{
		name: "Toilet paper",
		department: "Personal care"
	},
	{
		name: "Toothpaste",
		department: "Personal care"
	},
	{
		name: "Vitamins  Supplements",
		department: "Personal care"
	},
	{
		name: "Allergy",
		department: "Medicine"
	},
	{
		name: "Antibiotic",
		department: "Medicine"
	},
	{
		name: "Antidiarrheal",
		department: "Medicine"
	},
	{
		name: "Aspirin",
		department: "Medicine"
	},
	{
		name: "Antacid",
		department: "Medicine"
	},
	{
		name: "Band-aids  Medical",
		department: "Medicine"
	},
	{
		name: "Cold  Flu  Sinus",
		department: "Medicine"
	},
	{
		name: "Pain reliever",
		department: "Medicine"
	},
	{
		name: "Prescription pick-up",
		department: "Medicine"
	},
	{
		name: "Aluminum foil",
		department: "Kitchen"
	},
	{
		name: "Napkins",
		department: "Kitchen"
	},
	{
		name: "Non-stick spray",
		department: "Kitchen"
	},
	{
		name: "Paper towels",
		department: "Kitchen"
	},
	{
		name: "Plastic wrap",
		department: "Kitchen"
	},
	{
		name: "Sandwich  Freezer bags",
		department: "Kitchen"
	},
	{
		name: "Wax paper",
		department: "Kitchen"
	},
	{
		name: "Air freshener",
		department: "Other"
	},
	{
		name: "Bathroom cleaner",
		department: "Other"
	},
	{
		name: "Bleach  Detergent",
		department: "Other"
	},
	{
		name: "Dish  Dishwasher soap",
		department: "Other"
	},
	{
		name: "Garbage bags",
		department: "Other"
	},
	{
		name: "Glass cleaner",
		department: "Other"
	},
	{
		name: "Mop head  Vacuum bags",
		department: "Other"
	},
	{
		name: "Sponges  Scrubbers",
		department: "Other"
	},
	{
		name: "CDRs  DVDRs",
		department: "Cleaning products"
	},
	{
		name: "Notepad  Envelopes",
		department: "Cleaning products"
	},
	{
		name: "Glue  Tape",
		department: "Cleaning products"
	},
	{
		name: "Printer paper",
		department: "Cleaning products"
	},
	{
		name: "Pens  Pencils",
		department: "Cleaning products"
	},
	{
		name: "Postage stamps",
		department: "Cleaning products"
	},
	{
		name: "Automotive",
		department: "Office supplies"
	},
	{
		name: "Batteries",
		department: "Office supplies"
	},
	{
		name: "Charcoal  Propane",
		department: "Office supplies"
	},
	{
		name: "Flowers  Greeting card",
		department: "Office supplies"
	},
	{
		name: "Insect repellent",
		department: "Office supplies"
	},
	{
		name: "Light bulbs",
		department: "Office supplies"
	},
	{
		name: "Newspaper  Magazine",
		department: "Office supplies"
	},
	{
		name: "Random impulse buy",
		department: "Office supplies"
	},
	{
		name: "boneless skinless chicken",
		department: "PROTEIN"
	},
	{
		name: "turkey breast",
		department: "PROTEIN"
	},
	{
		name: "lean ground chicken, turkey",
		department: "PROTEIN"
	},
	{
		name: "fresh water fish",
		department: "PROTEIN"
	},
	{
		name: "wild fish",
		department: "PROTEIN"
	},
	{
		name: "game",
		department: "PROTEIN"
	},
	{
		name: "eggs",
		department: "PROTEIN"
	},
	{
		name: "greek yogurt",
		department: "PROTEIN"
	},
	{
		name: "non fat yogurt",
		department: "PROTEIN"
	},
	{
		name: "sardines",
		department: "PROTEIN"
	},
	{
		name: "shellfish",
		department: "PROTEIN"
	},
	{
		name: "Shakeology",
		department: "PROTEIN"
	},
	{
		name: "Tempeh",
		department: "PROTEIN"
	},
	{
		name: "Tuna, Canned in water",
		department: "PROTEIN"
	},
	{
		name: "Turkey slices 0 fat & sodium",
		department: "PROTEIN"
	},
	{
		name: "ricotta cheese, light",
		department: "PROTEIN"
	},
	{
		name: "Cottage cheese 2%",
		department: "PROTEIN"
	},
	{
		name: "Veggie Burger",
		department: "PROTEIN"
	},
	{
		name: "Turkey Bacon",
		department: "PROTEIN"
	},
	{
		name: "sweet potato",
		department: "STARCH"
	},
	{
		name: "yams",
		department: "STARCH"
	},
	{
		name: "quinoa",
		department: "STARCH"
	},
	{
		name: "beans (kidney, black, garbanzo)",
		department: "STARCH"
	},
	{
		name: "lentils",
		department: "STARCH"
	},
	{
		name: "edamame",
		department: "STARCH"
	},
	{
		name: "peas",
		department: "STARCH"
	},
	{
		name: "brown rice",
		department: "STARCH"
	},
	{
		name: "wild rice",
		department: "STARCH"
	},
	{
		name: "red potato",
		department: "STARCH"
	},
	{
		name: "corn on the cob",
		department: "STARCH"
	},
	{
		name: "amaranth",
		department: "STARCH"
	},
	{
		name: "millet",
		department: "STARCH"
	},
	{
		name: "buckwheat",
		department: "STARCH"
	},
	{
		name: "barley",
		department: "STARCH"
	},
	{
		name: "oats (rolled or steel cut)",
		department: "STARCH"
	},
	{
		name: "whole grain pasta",
		department: "STARCH"
	},
	{
		name: "whole grain bread",
		department: "STARCH"
	},
	{
		name: "whole grain pita",
		department: "STARCH"
	},
	{
		name: "whole grain or corn tortilla",
		department: "STARCH"
	},
	{
		name: "Avocado",
		department: "HEALTHY FATS"
	},
	{
		name: "almonds",
		department: "HEALTHY FATS"
	},
	{
		name: "cashews",
		department: "HEALTHY FATS"
	},
	{
		name: "peanuts",
		department: "HEALTHY FATS"
	},
	{
		name: "pistachios",
		department: "HEALTHY FATS"
	},
	{
		name: "pecans",
		department: "HEALTHY FATS"
	},
	{
		name: "walnuts",
		department: "HEALTHY FATS"
	},
	{
		name: "hummus",
		department: "HEALTHY FATS"
	},
	{
		name: "coconut milk",
		department: "HEALTHY FATS"
	},
	{
		name: "feta cheese",
		department: "HEALTHY FATS"
	},
	{
		name: "goat cheese",
		department: "HEALTHY FATS"
	},
	{
		name: "parmesan",
		department: "HEALTHY FATS"
	},
	{
		name: "brussels sprouts",
		department: "VEGGIES"
	},
	{
		name: "kale",
		department: "VEGGIES"
	},
	{
		name: "spinach",
		department: "VEGGIES"
	},
	{
		name: "collard greens",
		department: "VEGGIES"
	},
	{
		name: "broccoli",
		department: "VEGGIES"
	},
	{
		name: "asparagus",
		department: "VEGGIES"
	},
	{
		name: "beets",
		department: "VEGGIES"
	},
	{
		name: "tomatoes",
		department: "VEGGIES"
	},
	{
		name: "squash",
		department: "VEGGIES"
	},
	{
		name: "green beans",
		department: "VEGGIES"
	},
	{
		name: "cauliflower",
		department: "VEGGIES"
	},
	{
		name: "eggplant",
		department: "VEGGIES"
	},
	{
		name: "snow peas",
		department: "VEGGIES"
	},
	{
		name: "cabbage",
		department: "VEGGIES"
	},
	{
		name: "lettuce (pot iceberg)",
		department: "VEGGIES"
	},
	{
		name: "Spring mix",
		department: "VEGGIES"
	},
	{
		name: "alfalfa sprouts",
		department: "VEGGIES"
	},
	{
		name: "mushrooms",
		department: "VEGGIES"
	},
	{
		name: "radishes",
		department: "VEGGIES"
	},
	{
		name: "onions",
		department: "VEGGIES"
	},
	{
		name: "peppers",
		department: "VEGGIES"
	},
	{
		name: "carrots",
		department: "VEGGIES"
	},
	{
		name: "cucumbers",
		department: "VEGGIES"
	},
	{
		name: "celery",
		department: "VEGGIES"
	},
	{
		name: "Almond Milk",
		department: "BEVERAGES"
	},
	{
		name: "Rice Milk",
		department: "BEVERAGES"
	},
	{
		name: "Hemp Milk",
		department: "BEVERAGES"
	},
	{
		name: "Coconut Milk",
		department: "BEVERAGES"
	},
	{
		name: "Coconut Water",
		department: "BEVERAGES"
	},
	{
		name: "Lemon or Fruit infused Water",
		department: "BEVERAGES"
	},
	{
		name: "Raspberries",
		department: "FRUITS"
	},
	{
		name: "blackberries",
		department: "FRUITS"
	},
	{
		name: "blueberries",
		department: "FRUITS"
	},
	{
		name: "strawberries",
		department: "FRUITS"
	},
	{
		name: "watermelon",
		department: "FRUITS"
	},
	{
		name: "cantaloupe",
		department: "FRUITS"
	},
	{
		name: "oranges",
		department: "FRUITS"
	},
	{
		name: "tangerines",
		department: "FRUITS"
	},
	{
		name: "apples",
		department: "FRUITS"
	},
	{
		name: "apricots",
		department: "FRUITS"
	},
	{
		name: "grapefruit",
		department: "FRUITS"
	},
	{
		name: "grapes",
		department: "FRUITS"
	},
	{
		name: "cherries",
		department: "FRUITS"
	},
	{
		name: "kiwi",
		department: "FRUITS"
	},
	{
		name: "mango",
		department: "FRUITS"
	},
	{
		name: "pears",
		department: "FRUITS"
	},
	{
		name: "nectarines",
		department: "FRUITS"
	},
	{
		name: "Pineapple",
		department: "FRUITS"
	},
	{
		name: "Papaya",
		department: "FRUITS"
	},
	{
		name: "figs",
		department: "FRUITS"
	},
	{
		name: "honeydew",
		department: "FRUITS"
	},
	{
		name: "pumpkin seeds",
		department: "OILS AND SEEDS"
	},
	{
		name: "sunflower seeds",
		department: "OILS AND SEEDS"
	},
	{
		name: "sesame seeds",
		department: "OILS AND SEEDS"
	},
	{
		name: "flaxseed",
		department: "OILS AND SEEDS"
	},
	{
		name: "olives",
		department: "OILS AND SEEDS"
	},
	{
		name: "coconut, unsweetened",
		department: "OILS AND SEEDS"
	},
	{
		name: "dressings",
		department: "OILS AND SEEDS"
	},
	{
		name: "Herbs",
		department: "SEASONINGS"
	},
	{
		name: "lemon, lime (not lemonade smarty pants)",
		department: "SEASONINGS"
	},
	{
		name: "garlic, ginger",
		department: "SEASONINGS"
	},
	{
		name: "vinegars (red wine, apple cider, rice)",
		department: "SEASONINGS"
	},
	{
		name: "vanilla extract",
		department: "SEASONINGS"
	},
	{
		name: "spices (no salt)",
		department: "SEASONINGS"
	},
	{
		name: "Chicken breast",
		department: "MEAT/PROTEIN"
	},
	{
		name: "Ground turkey",
		department: "MEAT/PROTEIN"
	},
	{
		name: "Turkey/chicken sausage",
		department: "MEAT/PROTEIN"
	},
	{
		name: "Turkey pepperoni",
		department: "MEAT/PROTEIN"
	},
	{
		name: "Canned tuna",
		department: "MEAT/PROTEIN"
	},
	{
		name: "Beans/lentils",
		department: "MEAT/PROTEIN"
	},
	{
		name: "Greek yogurt",
		department: "DAIRY"
	},
	{
		name: "String cheese",
		department: "DAIRY"
	},
	{
		name: "Milk (cow, almond)",
		department: "DAIRY"
	},
	{
		name: "Strawberries",
		department: "FRUITS"
	},
	{
		name: "Blueberries",
		department: "FRUITS"
	},
	{
		name: "Cantaloupe",
		department: "FRUITS"
	},
	{
		name: "Tortilla chips",
		department: "SNACKS"
	},
	{
		name: "Trail mix",
		department: "SNACKS"
	},
	{
		name: "Peanuts",
		department: "SNACKS"
	},
	{
		name: "Almonds",
		department: "SNACKS"
	},
	{
		name: "Raisins",
		department: "SNACKS"
	},
	{
		name: "Romaine lettuce",
		department: "VEGETABLES"
	},
	{
		name: "Bell peppers",
		department: "VEGETABLES"
	},
	{
		name: "Sweet potatoes",
		department: "VEGETABLES"
	},
	{
		name: "Whole wheat flour",
		department: "BAKING"
	},
	{
		name: "Dark chocolate chips",
		department: "BAKING"
	},
	{
		name: "Maple syrup",
		department: "BAKING"
	},
	{
		name: "Cooking spray",
		department: "BAKING"
	},
	{
		name: "Whole wheat pasta",
		department: "GRIS"
	},
	{
		name: "Whole wheat tortillas",
		department: "GRIS"
	},
	{
		name: "Whole wheat bread",
		department: "GRIS"
	},
	{
		name: "Pita pockets",
		department: "GRIS"
	},
	{
		name: "Brown rice",
		department: "GRIS"
	},
	{
		name: "Rolled oats",
		department: "GRIS"
	},
	{
		name: "Salad greens",
		department: "Produce"
	},
	{
		name: "Onion",
		department: "Produce"
	},
	{
		name: "Butternut Squash",
		department: "Produce"
	},
	{
		name: "Kale",
		department: "Produce"
	},
	{
		name: "Jalapeno",
		department: "Produce"
	},
	{
		name: "Eggplant",
		department: "Produce"
	},
	{
		name: "Lemon or lime",
		department: "Produce"
	},
	{
		name: "Green beans",
		department: "Produce"
	},
	{
		name: "Summer squash",
		department: "Produce"
	},
	{
		name: "Vegan sausage",
		department: "Protein"
	},
	{
		name: "Cheese",
		department: "Protein"
	},
	{
		name: "Milk (Dairy or non-dairy)",
		department: "Protein"
	},
	{
		name: "Dried beans",
		department: "Bulk Foods"
	},
	{
		name: "Quinoa",
		department: "Bulk Foods"
	},
	{
		name: "Lentils",
		department: "Bulk Foods"
	},
	{
		name: "Brown Rice",
		department: "Bulk Foods"
	},
	{
		name: "Nuts: almonds, walnuts, cashews",
		department: "Bulk Foods"
	},
	{
		name: "Chia seeds",
		department: "Bulk Foods"
	},
	{
		name: "Ground flaxseed",
		department: "Bulk Foods"
	},
	{
		name: "Peanut or Almond butter",
		department: "Canned Goods/Pantry"
	},
	{
		name: "Canned diced tomatoes",
		department: "Canned Goods/Pantry"
	},
	{
		name: "Tomato paste",
		department: "Canned Goods/Pantry"
	},
	{
		name: "Canned beans",
		department: "Canned Goods/Pantry"
	},
	{
		name: "Vegetable broth",
		department: "Canned Goods/Pantry"
	},
	{
		name: "Whole grain pasta",
		department: "Canned Goods/Pantry"
	},
	{
		name: "Nutritional yeast",
		department: "Herbs/Spices"
	},
	{
		name: "Italian seasoning",
		department: "Herbs/Spices"
	},
	{
		name: "Taco seasoning",
		department: "Herbs/Spices"
	},
	{
		name: "Garlic powder",
		department: "Herbs/Spices"
	},
	{
		name: "Onion powder",
		department: "Herbs/Spices"
	},
	{
		name: "Chili powder",
		department: "Herbs/Spices"
	},
	{
		name: "Smoked paprika",
		department: "Herbs/Spices"
	},
	{
		name: "Cumin",
		department: "Herbs/Spices"
	},
	{
		name: "Black Pepper",
		department: "Herbs/Spices"
	},
	{
		name: "Frozen fruit: berries, mango, pineapple",
		department: "Frozen Foods"
	},
	{
		name: "Frozen vegetables: peas, green beans, brussels sprouts, corn, edamame",
		department: "Frozen Foods"
	},
	{
		name: "Olive or Canola oil",
		department: "Oils, Vinegars, and Condiments"
	},
	{
		name: "Vinegar: balsamic, apple cider, red wine, rice",
		department: "Oils, Vinegars, and Condiments"
	},
	{
		name: "Mustard",
		department: "Oils, Vinegars, and Condiments"
	},
	{
		name: "Ketchup",
		department: "Oils, Vinegars, and Condiments"
	},
	{
		name: "Vegan Worcestershire sauce",
		department: "Oils, Vinegars, and Condiments"
	},
	{
		name: "Sriracha",
		department: "Oils, Vinegars, and Condiments"
	},
	{
		name: "BBQ Sauce",
		department: "Oils, Vinegars, and Condiments"
	},
	{
		name: "Vanilla",
		department: "Oils, Vinegars, and Condiments"
	},
	{
		name: "Extra Virgin Olive Oil",
		department: "FATS"
	},
	{
		name: "Avocado Oil",
		department: "FATS"
	},
	{
		name: "Coconut Oil",
		department: "FATS"
	},
	{
		name: "Ghee",
		department: "FATS"
	},
	{
		name: "Butter",
		department: "FATS"
	},
	{
		name: "Lard",
		department: "FATS"
	},
	{
		name: "Fatty Beef/Steak",
		department: "FATS"
	},
	{
		name: "Bacon, Pork Belly",
		department: "FATS"
	},
	{
		name: "Olives, pickled, green",
		department: "FATS"
	},
	{
		name: "Macadamia Nuts",
		department: "FATS"
	},
	{
		name: "Brazil Nuts",
		department: "FATS"
	},
	{
		name: "Cheddar Cheese",
		department: "FATS"
	},
	{
		name: "Heavy Cream",
		department: "FATS"
	},
	{
		name: "Cucumber",
		department: "KETO SNACKS"
	},
	{
		name: "Cherry Tomatoes",
		department: "KETO SNACKS"
	},
	{
		name: "Pickles (pickled cucumbers)",
		department: "KETO SNACKS"
	},
	{
		name: "Olives, pickled, green",
		department: "KETO SNACKS"
	},
	{
		name: "Creek Yogurt, nonfat",
		department: "KETO SNACKS"
	},
	{
		name: "Macadamia Nuts",
		department: "KETO SNACKS"
	},
	{
		name: "Brazil Nuts",
		department: "KETO SNACKS"
	},
	{
		name: "Cheddar Cheese",
		department: "KETO SNACKS"
	},
	{
		name: "Chicken Breast",
		department: "PROTEIN"
	},
	{
		name: "Chicken Thighs",
		department: "PROTEIN"
	},
	{
		name: "Turkey Meat",
		department: "PROTEIN"
	},
	{
		name: "Duck Meat",
		department: "PROTEIN"
	},
	{
		name: "Pork Meat",
		department: "PROTEIN"
	},
	{
		name: "Beef Meat",
		department: "PROTEIN"
	},
	{
		name: "Beef Liver",
		department: "PROTEIN"
	},
	{
		name: "Beef Kidneys",
		department: "PROTEIN"
	},
	{
		name: "Ground Beef",
		department: "PROTEIN"
	},
	{
		name: "Bacon, Pork",
		department: "PROTEIN"
	},
	{
		name: "Bone Broth, Beef",
		department: "PROTEIN"
	},
	{
		name: "Salmon, raw",
		department: "PROTEIN"
	},
	{
		name: "Tuna fish",
		department: "PROTEIN"
	},
	{
		name: "Mackerel",
		department: "PROTEIN"
	},
	{
		name: "Seafood",
		department: "PROTEIN"
	},
	{
		name: "Cheddar Cheese",
		department: "PROTEIN"
	},
	{
		name: "Feta Cheese",
		department: "PROTEIN"
	},
	{
		name: "Creek Yogurt",
		department: "PROTEIN"
	},
	{
		name: "Lettuce",
		department: "VEGGIES"
	},
	{
		name: "Arugula",
		department: "VEGGIES"
	},
	{
		name: "Bok choy",
		department: "VEGGIES"
	},
	{
		name: "Cucumber",
		department: "VEGGIES"
	},
	{
		name: "Cherry Tomatoes",
		department: "VEGGIES"
	},
	{
		name: "Cabbage",
		department: "VEGGIES"
	},
	{
		name: "Lemon juice",
		department: "CONDIMENTS"
	},
	{
		name: "Mayonnaise",
		department: "CONDIMENTS"
	},
	{
		name: "Apple cider vinegar",
		department: "CONDIMENTS"
	},
	{
		name: "Coconut milk/cream",
		department: "CONDIMENTS"
	},
	{
		name: "Extra Virgin Olive Oil",
		department: "CONDIMENTS"
	},
	{
		name: "Basil leaves, fresh",
		department: "CONDIMENTS"
	},
	{
		name: "Basil leaves, dried",
		department: "CONDIMENTS"
	},
	{
		name: "Cayenne pepper",
		department: "CONDIMENTS"
	},
	{
		name: "Turmeric",
		department: "CONDIMENTS"
	},
	{
		name: "Black coffee",
		department: "DRINKS"
	},
	{
		name: "Black coffee with heavy cream, no sugar",
		department: "DRINKS"
	},
	{
		name: "Black, green or oolong tea",
		department: "DRINKS"
	},
	{
		name: "Herbal tea",
		department: "DRINKS"
	},
	{
		name: "Water and Lemon water",
		department: "DRINKS"
	},
	{
		name: "Almond milk, unsweetened",
		department: "DRINKS"
	},
	{
		name: "Coconut milk, unsweetened",
		department: "DRINKS"
	},
	{
		name: "Bone Broth",
		department: "DRINKS"
	},
	{
		name: "Flaxseed meal",
		department: "FLOUR"
	},
	{
		name: "Almond flour",
		department: "FLOUR"
	},
	{
		name: "Coconut flour",
		department: "FLOUR"
	},
	{
		name: "Blackberries",
		department: "FRUITS"
	},
	{
		name: "Alfalfa Sprouts",
		department: "Vegatables"
	},
	{
		name: "Daikon",
		department: "Vegatables"
	},
	{
		name: "Endive",
		department: "Vegatables"
	},
	{
		name: "Escarole",
		department: "Vegatables"
	},
	{
		name: "Bok Choy",
		department: "Vegatables"
	},
	{
		name: "Chicory Greens",
		department: "Vegatables"
	},
	{
		name: "Green Onions",
		department: "Vegatables"
	},
	{
		name: "Fennel",
		department: "Vegatables"
	},
	{
		name: "Iceberg Lettuce",
		department: "Vegatables"
	},
	{
		name: "Jicama",
		department: "Vegatables"
	},
	{
		name: "Bell Peppers",
		department: "Vegatables"
	},
	{
		name: "Radicchio",
		department: "Vegatables"
	},
	{
		name: "Radishes",
		department: "Vegatables"
	},
	{
		name: "Romaine Lettuce",
		department: "Vegatables"
	},
	{
		name: "Artichoke (1/4 Streamed)",
		department: "Vegatables"
	},
	{
		name: "Artichoke Hearts In Water",
		department: "Vegatables"
	},
	{
		name: "Bamboo Shoots",
		department: "Vegatables"
	},
	{
		name: "Brussels sprouts",
		department: "Vegatables"
	},
	{
		name: "Chard",
		department: "Vegatables"
	},
	{
		name: "Collard Greens",
		department: "Vegatables"
	},
	{
		name: "Hearts of Palm",
		department: "Vegatables"
	},
	{
		name: "Kohlrabi",
		department: "Vegatables"
	},
	{
		name: "Leeks",
		department: "Vegatables"
	},
	{
		name: "Okra",
		department: "Vegatables"
	},
	{
		name: "Black Olives",
		department: "Vegatables"
	},
	{
		name: "Pumpkin",
		department: "Vegatables"
	},
	{
		name: "Sauerkraut",
		department: "Vegatables"
	},
	{
		name: "Summer Squash",
		department: "Vegatables"
	},
	{
		name: "Tomato",
		department: "Vegatables"
	},
	{
		name: "Turnips",
		department: "Vegatables"
	},
	{
		name: "All Red Meat",
		department: "Meat/Fish Poultry"
	},
	{
		name: "Pork",
		department: "Meat/Fish Poultry"
	},
	{
		name: "Veal",
		department: "Meat/Fish Poultry"
	},
	{
		name: "Lamb",
		department: "Meat/Fish Poultry"
	},
	{
		name: "Fowl (duck, goose, hen, quail)",
		department: "Meat/Fish Poultry"
	},
	{
		name: "Organ Meats (tongue, brains, liver, heart, and kidneys)",
		department: "Meat/Fish Poultry"
	},
	{
		name: "Game Meats (ostrich, venison, caribou, bison, and elk)",
		department: "Meat/Fish Poultry"
	},
	{
		name: "Exotic Meats (such as ostrich and emu)",
		department: "Meat/Fish Poultry"
	},
	{
		name: "Cold Cuts and Beacon (read label some have added sugar)",
		department: "Meat/Fish Poultry"
	},
	{
		name: "Egg White",
		department: "Cheese/Dairy"
	},
	{
		name: "Egg Yolk",
		department: "Cheese/Dairy"
	},
	{
		name: "Whole Egg",
		department: "Cheese/Dairy"
	},
	{
		name: "Half-and-Half",
		department: "Cheese/Dairy"
	},
	{
		name: "Plaint Full Fat Greek Yogurt",
		department: "Cheese/Dairy"
	},
	{
		name: "Full Fat Sour Cream (4 tbsp.)",
		department: "Cheese/Dairy"
	},
	{
		name: "Unsweetened Almond Milk",
		department: "Cheese/Dairy"
	},
	{
		name: "Gruyere Cheese",
		department: "Cheses In 1 Ounce Portions"
	},
	{
		name: "Fontina",
		department: "Cheses In 1 Ounce Portions"
	},
	{
		name: "Havarti",
		department: "Cheses In 1 Ounce Portions"
	},
	{
		name: "Gouda",
		department: "Cheses In 1 Ounce Portions"
	},
	{
		name: "Blue Cheese",
		department: "Cheses In 1 Ounce Portions"
	},
	{
		name: "Edam",
		department: "Cheses In 1 Ounce Portions"
	},
	{
		name: "Monterey",
		department: "Cheses In 1 Ounce Portions"
	},
	{
		name: "Muenster",
		department: "Cheses In 1 Ounce Portions"
	},
	{
		name: "Neufchatel",
		department: "Cheses In 1 Ounce Portions"
	},
	{
		name: "Crawfish",
		department: "Seafood"
	},
	{
		name: "Scallops",
		department: "Seafood"
	},
	{
		name: "Clams",
		department: "Seafood"
	},
	{
		name: "Squid",
		department: "Seafood"
	},
	{
		name: "Limes",
		department: "Fruits"
	},
	{
		name: "Lemons",
		department: "Fruits"
	},
	{
		name: "Rhubarb",
		department: "Fruits"
	},
	{
		name: "Apricots",
		department: "Fruits"
	},
	{
		name: "Red Grapefruit",
		department: "Fruits"
	},
	{
		name: "Grass Fed Butter",
		department: "Fats and Dressings"
	},
	{
		name: "Oils",
		department: "Fats and Dressings"
	},
	{
		name: "Blue Cheese Dressing (2 tbsp.)",
		department: "Fats and Dressings"
	},
	{
		name: "Italian Dressing (2 tbsp.)",
		department: "Fats and Dressings"
	},
	{
		name: "Cesar Dressing (2 tbsp.)",
		department: "Fats and Dressings"
	},
	{
		name: "Ranch Dressing (2 tbsp.)",
		department: "Fats and Dressings"
	},
	{
		name: "100 Island Dressing (2 tbsp.)",
		department: "Fats and Dressings"
	},
	{
		name: "Water",
		department: "Zero Carb Drinks"
	},
	{
		name: "Unsweetened Tea",
		department: "Zero Carb Drinks"
	},
	{
		name: "Unsweetened Coffee",
		department: "Zero Carb Drinks"
	},
	{
		name: "Club Soda",
		department: "Zero Carb Drinks"
	},
	{
		name: "Sugar-Free Sparkling Water",
		department: "Zero Carb Drinks"
	},
	{
		name: "No-Calorie Flavored Seltzers",
		department: "Zero Carb Drinks"
	},
	{
		name: "Herbal Tea (without added barley or fruit sugars)",
		department: "Zero Carb Drinks"
	},
	{
		name: "Almonds (2tbsp. whole)",
		department: "Nuts/Seeds"
	},
	{
		name: "Peanuts (2tbsp.)",
		department: "Nuts/Seeds"
	},
	{
		name: "Hazelnuts (2tbsp. chopped)",
		department: "Nuts/Seeds"
	},
	{
		name: "Macadamia Nuts (2tbsp. chopped)",
		department: "Nuts/Seeds"
	},
	{
		name: "Pecans (2tbsp. chopped)",
		department: "Nuts/Seeds"
	},
	{
		name: "Pine Nuts (2tbsp.)",
		department: "Nuts/Seeds"
	},
	{
		name: "Pistachio Nuts (2tbsp.)",
		department: "Nuts/Seeds"
	},
	{
		name: "Walnuts (2tbsp. chopped)",
		department: "Nuts/Seeds"
	},
	{
		name: "Pumpkin Seeds",
		department: "Nuts/Seeds"
	},
	{
		name: "Sunflower Seeds (2tbsp.)",
		department: "Nuts/Seeds"
	},
	{
		name: "Almond Butter",
		department: "Nuts/Seeds"
	},
	{
		name: "Peanut Butter",
		department: "Nuts/Seeds"
	},
	{
		name: "Shirataki Noodles",
		department: "Miscellaneous"
	},
	{
		name: "White Vinegar",
		department: "Miscellaneous"
	},
	{
		name: "Balsamic Vinegar",
		department: "Miscellaneous"
	},
	{
		name: "Red Wine Vinegar",
		department: "Miscellaneous"
	},
	{
		name: "Rice Vinegar (seasoned)",
		department: "Miscellaneous"
	},
	{
		name: "Soy Sauce",
		department: "Miscellaneous"
	},
	{
		name: "Unflavored, powdered gelatin (use as a binder in recipes)",
		department: "Miscellaneous"
	},
	{
		name: "Most Hot Sauces",
		department: "Miscellaneous"
	},
	{
		name: "Turkey or Beef Jerky (not teriyaki flavor)",
		department: "Miscellaneous"
	},
	{
		name: "Kale Chips",
		department: "Miscellaneous"
	},
	{
		name: "Coconut Flakes",
		department: "Miscellaneous"
	},
	{
		name: "Soybeans",
		department: "Soy Vegan Protein"
	},
	{
		name: "Soy Milk",
		department: "Soy Vegan Protein"
	},
	{
		name: "Firm Tofu",
		department: "Soy Vegan Protein"
	},
	{
		name: "Silken Tofu",
		department: "Soy Vegan Protein"
	},
	{
		name: "Soy Nuts",
		department: "Soy Vegan Protein"
	},
	{
		name: "All Herbs And Spices Have Very Few Carbs",
		department: "Herbs/Spices"
	},
	{
		name: "Martini",
		department: "Zero Carb Alcoholic Drinks"
	},
	{
		name: "Tequila",
		department: "Zero Carb Alcoholic Drinks"
	},
	{
		name: "pepper",
		department: "unclassified"
	},
	{
		name: "all-purpose flour",
		department: "unclassified"
	},
	{
		name: "garlic cloves",
		department: "unclassified"
	},
	{
		name: "baking powder",
		department: "unclassified"
	},
	{
		name: "unsalted butter",
		department: "unclassified"
	},
	{
		name: "sweet butter",
		department: "unclassified"
	},
	{
		name: "ground black pepper",
		department: "unclassified"
	},
	{
		name: "large eggs",
		department: "unclassified"
	},
	{
		name: "kosher salt",
		department: "unclassified"
	},
	{
		name: "brown sugar",
		department: "unclassified"
	},
	{
		name: "lemon",
		department: "unclassified"
	},
	{
		name: "baking soda",
		department: "unclassified"
	},
	{
		name: "sodium bicarbonate",
		department: "unclassified"
	},
	{
		name: "oil",
		department: "unclassified"
	},
	{
		name: "extra-virgin olive oil",
		department: "unclassified"
	},
	{
		name: "powdered sugar",
		department: "unclassified"
	},
	{
		name: "icing sugar",
		department: "unclassified"
	},
	{
		name: "granulated sugar",
		department: "unclassified"
	},
	{
		name: "sea salt",
		department: "unclassified"
	},
	{
		name: "ground cinnamon",
		department: "unclassified"
	},
	{
		name: "purple onion",
		department: "unclassified"
	},
	{
		name: "red onion",
		department: "unclassified"
	},
	{
		name: "soya sauce",
		department: "unclassified"
	},
	{
		name: "shallots",
		department: "unclassified"
	},
	{
		name: "corn starch",
		department: "unclassified"
	},
	{
		name: "cream",
		department: "unclassified"
	},
	{
		name: "grated parmesan cheese",
		department: "unclassified"
	},
	{
		name: "ground cumin",
		department: "unclassified"
	},
	{
		name: "parmesan cheese",
		department: "unclassified"
	},
	{
		name: "chicken broth",
		department: "unclassified"
	},
	{
		name: "lime",
		department: "unclassified"
	},
	{
		name: "bacon",
		department: "unclassified"
	},
	{
		name: "egg yolks",
		department: "unclassified"
	},
	{
		name: "fresh lemon juice",
		department: "unclassified"
	},
	{
		name: "dijon mustard",
		department: "unclassified"
	},
	{
		name: "fresh parsley",
		department: "unclassified"
	},
	{
		name: "worchestershire",
		department: "unclassified"
	},
	{
		name: "worcestershire",
		department: "unclassified"
	},
	{
		name: "red bell pepper",
		department: "unclassified"
	},
	{
		name: "nutmeg",
		department: "unclassified"
	},
	{
		name: "jalapeno chilies",
		department: "unclassified"
	},
	{
		name: "jalapeno chile",
		department: "unclassified"
	},
	{
		name: "jalapeno pepper",
		department: "unclassified"
	},
	{
		name: "canola oil",
		department: "unclassified"
	},
	{
		name: "thyme",
		department: "unclassified"
	},
	{
		name: "buttermilk",
		department: "unclassified"
	},
	{
		name: "egg whites",
		department: "unclassified"
	},
	{
		name: "scallions",
		department: "unclassified"
	},
	{
		name: "dried oregano",
		department: "unclassified"
	},
	{
		name: "lime juice",
		department: "unclassified"
	},
	{
		name: "chicken stock",
		department: "unclassified"
	},
	{
		name: "light brown sugar",
		department: "unclassified"
	},
	{
		name: "orange",
		department: "unclassified"
	},
	{
		name: "white sugar",
		department: "unclassified"
	},
	{
		name: "yellow onion",
		department: "unclassified"
	},
	{
		name: "chicken breasts",
		department: "unclassified"
	},
	{
		name: "ground ginger",
		department: "unclassified"
	},
	{
		name: "confectioners sugar",
		department: "unclassified"
	},
	{
		name: "diced tomatoes",
		department: "unclassified"
	},
	{
		name: "caster sugar",
		department: "unclassified"
	},
	{
		name: "castor sugar",
		department: "unclassified"
	},
	{
		name: "orange juice",
		department: "unclassified"
	},
	{
		name: "whole milk",
		department: "unclassified"
	},
	{
		name: "freshly ground pepper",
		department: "unclassified"
	},
	{
		name: "chives",
		department: "unclassified"
	},
	{
		name: "white wine",
		department: "unclassified"
	},
	{
		name: "boneless skinless chicken breasts",
		department: "unclassified"
	},
	{
		name: "bay leaf",
		department: "unclassified"
	},
	{
		name: "flat leaf parsley",
		department: "unclassified"
	},
	{
		name: "Italian parsley",
		department: "unclassified"
	},
	{
		name: "sesame oil",
		department: "unclassified"
	},
	{
		name: "whipping cream",
		department: "unclassified"
	},
	{
		name: "pure vanilla extract",
		department: "unclassified"
	},
	{
		name: "bay leaves",
		department: "unclassified"
	},
	{
		name: "fresh ginger",
		department: "unclassified"
	},
	{
		name: "fresh basil",
		department: "unclassified"
	},
	{
		name: "margarine",
		department: "unclassified"
	},
	{
		name: "tomato sauce",
		department: "unclassified"
	},
	{
		name: "mozzarella cheese",
		department: "unclassified"
	},
	{
		name: "spring onions",
		department: "unclassified"
	},
	{
		name: "clove",
		department: "unclassified"
	},
	{
		name: "spice clove",
		department: "unclassified"
	},
	{
		name: "ground nutmeg",
		department: "unclassified"
	},
	{
		name: "plain flour",
		department: "unclassified"
	},
	{
		name: "cocoa powder",
		department: "unclassified"
	},
	{
		name: "dry white wine",
		department: "unclassified"
	},
	{
		name: "shredded cheddar cheese",
		department: "unclassified"
	},
	{
		name: "bell pepper",
		department: "unclassified"
	},
	{
		name: "red pepper flakes",
		department: "unclassified"
	},
	{
		name: "chopped onion",
		department: "unclassified"
	},
	{
		name: "cilantro leaves",
		department: "unclassified"
	},
	{
		name: "ground pepper",
		department: "unclassified"
	},
	{
		name: "dried thyme",
		department: "unclassified"
	},
	{
		name: "semi-sweet chocolate morsels",
		department: "unclassified"
	},
	{
		name: "semi-sweet chocolate chips",
		department: "unclassified"
	},
	{
		name: "fresh lime juice",
		department: "unclassified"
	},
	{
		name: "rice vinegar",
		department: "unclassified"
	},
	{
		name: "rice wine vinegar",
		department: "unclassified"
	},
	{
		name: "green pepper",
		department: "unclassified"
	},
	{
		name: "curry powder",
		department: "unclassified"
	},
	{
		name: "unsweetened cocoa powder",
		department: "unclassified"
	},
	{
		name: "yoghurt",
		department: "unclassified"
	},
	{
		name: "freshly ground black pepper",
		department: "unclassified"
	},
	{
		name: "coriander",
		department: "unclassified"
	},
	{
		name: "warm water",
		department: "unclassified"
	},
	{
		name: "chocolate chips",
		department: "unclassified"
	},
	{
		name: "rosemary",
		department: "unclassified"
	},
	{
		name: "chocolate",
		department: "unclassified"
	},
	{
		name: "black beans",
		department: "unclassified"
	},
	{
		name: "melted butter",
		department: "unclassified"
	},
	{
		name: "lemon zest",
		department: "unclassified"
	},
	{
		name: "coarse salt",
		department: "unclassified"
	},
	{
		name: "sauce",
		department: "unclassified"
	},
	{
		name: "green bell pepper",
		department: "unclassified"
	},
	{
		name: "cold water",
		department: "unclassified"
	},
	{
		name: "celery ribs",
		department: "unclassified"
	},
	{
		name: "bread",
		department: "unclassified"
	},
	{
		name: "chopped pecans",
		department: "unclassified"
	},
	{
		name: "chopped walnuts",
		department: "unclassified"
	},
	{
		name: "cracked black pepper",
		department: "unclassified"
	},
	{
		name: "ground cloves",
		department: "unclassified"
	},
	{
		name: "capers",
		department: "unclassified"
	},
	{
		name: "white pepper",
		department: "unclassified"
	},
	{
		name: "fresh thyme",
		department: "unclassified"
	},
	{
		name: "ham",
		department: "unclassified"
	},
	{
		name: "dark brown sugar",
		department: "unclassified"
	},
	{
		name: "fresh rosemary",
		department: "unclassified"
	},
	{
		name: "white wine vinegar",
		department: "unclassified"
	},
	{
		name: "fresh cilantro",
		department: "unclassified"
	},
	{
		name: "dark chocolate",
		department: "unclassified"
	},
	{
		name: "chopped parsley",
		department: "unclassified"
	},
	{
		name: "sliced almonds",
		department: "unclassified"
	},
	{
		name: "almond flakes",
		department: "unclassified"
	},
	{
		name: "dried basil",
		department: "unclassified"
	},
	{
		name: "brinjal",
		department: "unclassified"
	},
	{
		name: "aubergine",
		department: "unclassified"
	},
	{
		name: "chickpeas",
		department: "unclassified"
	},
	{
		name: "chick peas",
		department: "unclassified"
	},
	{
		name: "vanilla sugar",
		department: "unclassified"
	},
	{
		name: "crushed red pepper flakes",
		department: "unclassified"
	},
	{
		name: "green chilies",
		department: "unclassified"
	},
	{
		name: "pinenuts",
		department: "unclassified"
	},
	{
		name: "pine nuts",
		department: "unclassified"
	},
	{
		name: "chopped fresh cilantro",
		department: "unclassified"
	},
	{
		name: "boiling water",
		department: "unclassified"
	},
	{
		name: "almond extract",
		department: "unclassified"
	},
	{
		name: "rolled oatmeal",
		department: "unclassified"
	},
	{
		name: "red wine",
		department: "unclassified"
	},
	{
		name: "fat",
		department: "unclassified"
	},
	{
		name: "active dry yeast",
		department: "unclassified"
	},
	{
		name: "fresh mint",
		department: "unclassified"
	},
	{
		name: "fresh mint leaves",
		department: "unclassified"
	},
	{
		name: "white onion",
		department: "unclassified"
	},
	{
		name: "cinnamon sticks",
		department: "unclassified"
	},
	{
		name: "cinnamon bark",
		department: "unclassified"
	},
	{
		name: "half and half",
		department: "unclassified"
	},
	{
		name: "dill",
		department: "unclassified"
	},
	{
		name: "cider vinegar",
		department: "unclassified"
	},
	{
		name: "red chili peppers",
		department: "unclassified"
	},
	{
		name: "cayenne",
		department: "unclassified"
	},
	{
		name: "sweetened condensed milk",
		department: "unclassified"
	},
	{
		name: "heavy whipping cream",
		department: "unclassified"
	},
	{
		name: "large egg yolks",
		department: "unclassified"
	},
	{
		name: "vegetable stock",
		department: "unclassified"
	},
	{
		name: "ground coriander",
		department: "unclassified"
	},
	{
		name: "fish sauce",
		department: "unclassified"
	},
	{
		name: "basil leaves",
		department: "unclassified"
	},
	{
		name: "cocoa",
		department: "unclassified"
	},
	{
		name: "vanilla beans",
		department: "unclassified"
	},
	{
		name: "chopped cilantro",
		department: "unclassified"
	},
	{
		name: "stem olives",
		department: "unclassified"
	},
	{
		name: "cumin seed",
		department: "unclassified"
	},
	{
		name: "fresh basil leaves",
		department: "unclassified"
	},
	{
		name: "spices",
		department: "unclassified"
	},
	{
		name: "ice",
		department: "unclassified"
	},
	{
		name: "frozen peas",
		department: "unclassified"
	},
	{
		name: "pumpkin purée",
		department: "unclassified"
	},
	{
		name: "shredded mozzarella cheese",
		department: "unclassified"
	},
	{
		name: "grated lemon zest",
		department: "unclassified"
	},
	{
		name: "plum tomatoes",
		department: "unclassified"
	},
	{
		name: "creamy peanut butter",
		department: "unclassified"
	},
	{
		name: "smooth peanut butter",
		department: "unclassified"
	},
	{
		name: "large egg whites",
		department: "unclassified"
	},
	{
		name: "garlic salt",
		department: "unclassified"
	},
	{
		name: "dried cranberries",
		department: "unclassified"
	},
	{
		name: "baby spinach",
		department: "unclassified"
	},
	{
		name: "evaporated milk",
		department: "unclassified"
	},
	{
		name: "sweet onion",
		department: "unclassified"
	},
	{
		name: "hot water",
		department: "unclassified"
	},
	{
		name: "molasses",
		department: "unclassified"
	},
	{
		name: "spaghetti",
		department: "unclassified"
	},
	{
		name: "beef broth",
		department: "unclassified"
	},
	{
		name: "gelatin",
		department: "unclassified"
	},
	{
		name: "lean ground beef",
		department: "unclassified"
	},
	{
		name: "semisweet chocolate",
		department: "unclassified"
	},
	{
		name: "flour tortillas",
		department: "unclassified"
	},
	{
		name: "crème fraîche",
		department: "unclassified"
	},
	{
		name: "tomato purée",
		department: "unclassified"
	},
	{
		name: "salmon fillets",
		department: "unclassified"
	},
	{
		name: "fresh dill",
		department: "unclassified"
	},
	{
		name: "peanut oil",
		department: "unclassified"
	},
	{
		name: "mint leaves",
		department: "unclassified"
	},
	{
		name: "dry mustard",
		department: "unclassified"
	},
	{
		name: "allspice",
		department: "unclassified"
	},
	{
		name: "new spice",
		department: "unclassified"
	},
	{
		name: "large garlic cloves",
		department: "unclassified"
	},
	{
		name: "plain yogurt",
		department: "unclassified"
	},
	{
		name: "Tabasco Pepper Sauce",
		department: "unclassified"
	},
	{
		name: "Tabasco",
		department: "unclassified"
	},
	{
		name: "grated nutmeg",
		department: "unclassified"
	},
	{
		name: "sunflower oil",
		department: "unclassified"
	},
	{
		name: "cornmeal",
		department: "unclassified"
	},
	{
		name: "fine sea salt",
		department: "unclassified"
	},
	{
		name: "cashew nuts",
		department: "unclassified"
	},
	{
		name: "ice cubes",
		department: "unclassified"
	},
	{
		name: "coconut",
		department: "unclassified"
	},
	{
		name: "ricotta cheese",
		department: "unclassified"
	},
	{
		name: "wine",
		department: "unclassified"
	},
	{
		name: "black peppercorns",
		department: "unclassified"
	},
	{
		name: "cream of tartar",
		department: "unclassified"
	},
	{
		name: "chili pepper",
		department: "unclassified"
	},
	{
		name: "romaine",
		department: "unclassified"
	},
	{
		name: "hazelnuts",
		department: "unclassified"
	},
	{
		name: "orange zest",
		department: "unclassified"
	},
	{
		name: "corn tortillas",
		department: "unclassified"
	},
	{
		name: "noodles",
		department: "unclassified"
	},
	{
		name: "light corn syrup",
		department: "unclassified"
	},
	{
		name: "bread flour",
		department: "unclassified"
	},
	{
		name: "cake flour",
		department: "unclassified"
	},
	{
		name: "cooked chicken",
		department: "unclassified"
	},
	{
		name: "chopped celery",
		department: "unclassified"
	},
	{
		name: "rocket",
		department: "unclassified"
	},
	{
		name: "vanilla ice cream",
		department: "unclassified"
	},
	{
		name: "boneless skinless chicken breast halves",
		department: "unclassified"
	},
	{
		name: "mascarpone",
		department: "unclassified"
	},
	{
		name: "granny smith apples",
		department: "unclassified"
	},
	{
		name: "Granny Smith apples",
		department: "unclassified"
	},
	{
		name: "low sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "pumpkin pie spice",
		department: "unclassified"
	},
	{
		name: "russet potatoes",
		department: "unclassified"
	},
	{
		name: "ground allspice",
		department: "unclassified"
	},
	{
		name: "pure maple syrup",
		department: "unclassified"
	},
	{
		name: "marjoram",
		department: "unclassified"
	},
	{
		name: "seasoning salt",
		department: "unclassified"
	},
	{
		name: "crushed tomatoes",
		department: "unclassified"
	},
	{
		name: "double cream",
		department: "unclassified"
	},
	{
		name: "panko breadcrumbs",
		department: "unclassified"
	},
	{
		name: "garam masala",
		department: "unclassified"
	},
	{
		name: "crushed red pepper",
		department: "unclassified"
	},
	{
		name: "self rising flour",
		department: "unclassified"
	},
	{
		name: "sausages",
		department: "unclassified"
	},
	{
		name: "sliced mushrooms",
		department: "unclassified"
	},
	{
		name: "oats",
		department: "unclassified"
	},
	{
		name: "broccoli florets",
		department: "unclassified"
	},
	{
		name: "red-skinned potato",
		department: "unclassified"
	},
	{
		name: "bittersweet chocolate",
		department: "unclassified"
	},
	{
		name: "peppercorns",
		department: "unclassified"
	},
	{
		name: "agave nectar",
		department: "unclassified"
	},
	{
		name: "beef stock",
		department: "unclassified"
	},
	{
		name: "coriander seeds",
		department: "unclassified"
	},
	{
		name: "fresh mushrooms",
		department: "unclassified"
	},
	{
		name: "fennel seeds",
		department: "unclassified"
	},
	{
		name: "white bread",
		department: "unclassified"
	},
	{
		name: "puff pastry",
		department: "unclassified"
	},
	{
		name: "brandy",
		department: "unclassified"
	},
	{
		name: "cooking oil",
		department: "unclassified"
	},
	{
		name: "white chocolate",
		department: "unclassified"
	},
	{
		name: "cool whip",
		department: "unclassified"
	},
	{
		name: "Cool Whip Whipped Topping",
		department: "unclassified"
	},
	{
		name: "fresh blueberries",
		department: "unclassified"
	},
	{
		name: "dates",
		department: "unclassified"
	},
	{
		name: "kidney",
		department: "unclassified"
	},
	{
		name: "pineapple juice",
		department: "unclassified"
	},
	{
		name: "skim milk",
		department: "unclassified"
	},
	{
		name: "unbleached all-purpose flour",
		department: "unclassified"
	},
	{
		name: "fresh thyme leaves",
		department: "unclassified"
	},
	{
		name: "apple juice",
		department: "unclassified"
	},
	{
		name: "chopped tomatoes",
		department: "unclassified"
	},
	{
		name: "feta cheese crumbles",
		department: "unclassified"
	},
	{
		name: "slivered almonds",
		department: "unclassified"
	},
	{
		name: "shredded coconut",
		department: "unclassified"
	},
	{
		name: "chopped garlic",
		department: "unclassified"
	},
	{
		name: "coconut sugar",
		department: "unclassified"
	},
	{
		name: "softened butter",
		department: "unclassified"
	},
	{
		name: "dough",
		department: "unclassified"
	},
	{
		name: "barbecue sauce",
		department: "unclassified"
	},
	{
		name: "sun-dried tomatoes",
		department: "unclassified"
	},
	{
		name: "grape tomatoes",
		department: "unclassified"
	},
	{
		name: "coffee",
		department: "unclassified"
	},
	{
		name: "fresh oregano",
		department: "unclassified"
	},
	{
		name: "corn flour",
		department: "unclassified"
	},
	{
		name: "cornflour",
		department: "unclassified"
	},
	{
		name: "finely chopped onion",
		department: "unclassified"
	},
	{
		name: "salted butter",
		department: "unclassified"
	},
	{
		name: "parmigiano reggiano cheese",
		department: "unclassified"
	},
	{
		name: "parmigiano-reggiano",
		department: "unclassified"
	},
	{
		name: "roma tomatoes",
		department: "unclassified"
	},
	{
		name: "kidney beans",
		department: "unclassified"
	},
	{
		name: "sharp cheddar cheese",
		department: "unclassified"
	},
	{
		name: "fresh spinach",
		department: "unclassified"
	},
	{
		name: "muscat",
		department: "unclassified"
	},
	{
		name: "cooked rice",
		department: "unclassified"
	},
	{
		name: "mini marshmallows",
		department: "unclassified"
	},
	{
		name: "ground cardamom",
		department: "unclassified"
	},
	{
		name: "cardamom powder",
		department: "unclassified"
	},
	{
		name: "chili flakes",
		department: "unclassified"
	},
	{
		name: "bourbon whiskey",
		department: "unclassified"
	},
	{
		name: "bourbon",
		department: "unclassified"
	},
	{
		name: "dried parsley",
		department: "unclassified"
	},
	{
		name: "mustard seeds",
		department: "unclassified"
	},
	{
		name: "chiles",
		department: "unclassified"
	},
	{
		name: "chilies",
		department: "unclassified"
	},
	{
		name: "sage",
		department: "unclassified"
	},
	{
		name: "low sodium soy sauce",
		department: "unclassified"
	},
	{
		name: "lime wedges",
		department: "unclassified"
	},
	{
		name: "diced onions",
		department: "unclassified"
	},
	{
		name: "rolls",
		department: "unclassified"
	},
	{
		name: "cranberries",
		department: "unclassified"
	},
	{
		name: "baguette",
		department: "unclassified"
	},
	{
		name: "tahini",
		department: "unclassified"
	},
	{
		name: "long-grain rice",
		department: "unclassified"
	},
	{
		name: "graham cracker crumbs",
		department: "unclassified"
	},
	{
		name: "poppy seeds",
		department: "unclassified"
	},
	{
		name: "chili sauce",
		department: "unclassified"
	},
	{
		name: "monterey jack",
		department: "unclassified"
	},
	{
		name: "monterey jack cheese",
		department: "unclassified"
	},
	{
		name: "chopped fresh thyme",
		department: "unclassified"
	},
	{
		name: "ground paprika",
		department: "unclassified"
	},
	{
		name: "pork tenderloin",
		department: "unclassified"
	},
	{
		name: "white chocolate chips",
		department: "unclassified"
	},
	{
		name: "salad",
		department: "unclassified"
	},
	{
		name: "dry bread crumbs",
		department: "unclassified"
	},
	{
		name: "starch",
		department: "unclassified"
	},
	{
		name: "starch powder",
		department: "unclassified"
	},
	{
		name: "seasoning",
		department: "unclassified"
	},
	{
		name: "prosciutto",
		department: "unclassified"
	},
	{
		name: "ground pork",
		department: "unclassified"
	},
	{
		name: "corn kernels",
		department: "unclassified"
	},
	{
		name: "hard-boiled egg",
		department: "unclassified"
	},
	{
		name: "swiss cheese",
		department: "unclassified"
	},
	{
		name: "roasted red peppers",
		department: "unclassified"
	},
	{
		name: "crushed pineapple",
		department: "unclassified"
	},
	{
		name: "clarified butter",
		department: "unclassified"
	},
	{
		name: "cream of mushroom soup",
		department: "unclassified"
	},
	{
		name: "fresh orange juice",
		department: "unclassified"
	},
	{
		name: "yellow bell pepper",
		department: "unclassified"
	},
	{
		name: "sage leaves",
		department: "unclassified"
	},
	{
		name: "red cabbage",
		department: "unclassified"
	},
	{
		name: "purple cabbage",
		department: "unclassified"
	},
	{
		name: "apple cider",
		department: "unclassified"
	},
	{
		name: "fresh chives",
		department: "unclassified"
	},
	{
		name: "artichoke hearts",
		department: "unclassified"
	},
	{
		name: "lemon wedges",
		department: "unclassified"
	},
	{
		name: "plain greek yogurt",
		department: "unclassified"
	},
	{
		name: "self raising flour",
		department: "unclassified"
	},
	{
		name: "hot pepper sauce",
		department: "unclassified"
	},
	{
		name: "lime zest",
		department: "unclassified"
	},
	{
		name: "cacao powder",
		department: "unclassified"
	},
	{
		name: "yukon gold potatoes",
		department: "unclassified"
	},
	{
		name: "sweet paprika",
		department: "unclassified"
	},
	{
		name: "fine sweet paprika",
		department: "unclassified"
	},
	{
		name: "beansprouts",
		department: "unclassified"
	},
	{
		name: "bean sprouts",
		department: "unclassified"
	},
	{
		name: "baby carrots",
		department: "unclassified"
	},
	{
		name: "mint candies",
		department: "unclassified"
	},
	{
		name: "mints",
		department: "unclassified"
	},
	{
		name: "mint candy",
		department: "unclassified"
	},
	{
		name: "cream of chicken soup",
		department: "unclassified"
	},
	{
		name: "ranch dressing",
		department: "unclassified"
	},
	{
		name: "fresh coriander",
		department: "unclassified"
	},
	{
		name: "dry red wine",
		department: "unclassified"
	},
	{
		name: "candy",
		department: "unclassified"
	},
	{
		name: "dried rosemary",
		department: "unclassified"
	},
	{
		name: "golden raisins",
		department: "unclassified"
	},
	{
		name: "saffron",
		department: "unclassified"
	},
	{
		name: "sprinkles",
		department: "unclassified"
	},
	{
		name: "beans",
		department: "unclassified"
	},
	{
		name: "dried apricot",
		department: "unclassified"
	},
	{
		name: "parsnips",
		department: "unclassified"
	},
	{
		name: "chopped fresh chives",
		department: "unclassified"
	},
	{
		name: "minced onion",
		department: "unclassified"
	},
	{
		name: "marinara sauce",
		department: "unclassified"
	},
	{
		name: "marinara",
		department: "unclassified"
	},
	{
		name: "cannellini beans",
		department: "unclassified"
	},
	{
		name: "cannellini",
		department: "unclassified"
	},
	{
		name: "minced meat",
		department: "unclassified"
	},
	{
		name: "grated orange",
		department: "unclassified"
	},
	{
		name: "ice water",
		department: "unclassified"
	},
	{
		name: "couscous",
		department: "unclassified"
	},
	{
		name: "hoisin sauce",
		department: "unclassified"
	},
	{
		name: "hoisin",
		department: "unclassified"
	},
	{
		name: "pie crust",
		department: "unclassified"
	},
	{
		name: "fennel bulb",
		department: "unclassified"
	},
	{
		name: "french bread",
		department: "unclassified"
	},
	{
		name: "fresh raspberries",
		department: "unclassified"
	},
	{
		name: "old-fashioned oats",
		department: "unclassified"
	},
	{
		name: "large shrimp",
		department: "unclassified"
	},
	{
		name: "button mushrooms",
		department: "unclassified"
	},
	{
		name: "star anise",
		department: "unclassified"
	},
	{
		name: "star anise seeds",
		department: "unclassified"
	},
	{
		name: "tarragon",
		department: "unclassified"
	},
	{
		name: "fresh parsley leaves",
		department: "unclassified"
	},
	{
		name: "food colouring",
		department: "unclassified"
	},
	{
		name: "food coloring",
		department: "unclassified"
	},
	{
		name: "sweetened coconut flakes",
		department: "unclassified"
	},
	{
		name: "curry",
		department: "unclassified"
	},
	{
		name: "shredded carrots",
		department: "unclassified"
	},
	{
		name: "instant yeast",
		department: "unclassified"
	},
	{
		name: "ground red pepper",
		department: "unclassified"
	},
	{
		name: "boneless skinless chicken thighs",
		department: "unclassified"
	},
	{
		name: "lemongrass",
		department: "unclassified"
	},
	{
		name: "ground white pepper",
		department: "unclassified"
	},
	{
		name: "shredded cheese",
		department: "unclassified"
	},
	{
		name: "wheat flour",
		department: "unclassified"
	},
	{
		name: "unsweetened chocolate",
		department: "unclassified"
	},
	{
		name: "lettuce leaves",
		department: "unclassified"
	},
	{
		name: "frozen corn",
		department: "unclassified"
	},
	{
		name: "chopped nuts",
		department: "unclassified"
	},
	{
		name: "dry sherry",
		department: "unclassified"
	},
	{
		name: "low-fat milk",
		department: "unclassified"
	},
	{
		name: "milk low-fat",
		department: "unclassified"
	},
	{
		name: "cocktail cherries",
		department: "unclassified"
	},
	{
		name: "maraschino cherries",
		department: "unclassified"
	},
	{
		name: "cardamom",
		department: "unclassified"
	},
	{
		name: "toasted sesame oil",
		department: "unclassified"
	},
	{
		name: "pancetta",
		department: "unclassified"
	},
	{
		name: "cake",
		department: "unclassified"
	},
	{
		name: "sliced green onions",
		department: "unclassified"
	},
	{
		name: "vegetable shortening",
		department: "unclassified"
	},
	{
		name: "kalamata",
		department: "unclassified"
	},
	{
		name: "kalamata olives",
		department: "unclassified"
	},
	{
		name: "baking potatoes",
		department: "unclassified"
	},
	{
		name: "basmati rice",
		department: "unclassified"
	},
	{
		name: "yellow cornmeal",
		department: "unclassified"
	},
	{
		name: "lemon peel",
		department: "unclassified"
	},
	{
		name: "dressing",
		department: "unclassified"
	},
	{
		name: "celery seed",
		department: "unclassified"
	},
	{
		name: "shiitake",
		department: "unclassified"
	},
	{
		name: "shitake mushroom",
		department: "unclassified"
	},
	{
		name: "shiitake mushrooms",
		department: "unclassified"
	},
	{
		name: "oyster sauce",
		department: "unclassified"
	},
	{
		name: "dry yeast",
		department: "unclassified"
	},
	{
		name: "light soy sauce",
		department: "unclassified"
	},
	{
		name: "OREO® Cookies",
		department: "unclassified"
	},
	{
		name: "graham crackers",
		department: "unclassified"
	},
	{
		name: "nonstick spray",
		department: "unclassified"
	},
	{
		name: "nonstick cooking spray",
		department: "unclassified"
	},
	{
		name: "pesto",
		department: "unclassified"
	},
	{
		name: "horseradish",
		department: "unclassified"
	},
	{
		name: "gingerroot",
		department: "unclassified"
	},
	{
		name: "dark rum",
		department: "unclassified"
	},
	{
		name: "shredded sharp cheddar cheese",
		department: "unclassified"
	},
	{
		name: "elbow macaroni",
		department: "unclassified"
	},
	{
		name: "meat",
		department: "unclassified"
	},
	{
		name: "pimentos",
		department: "unclassified"
	},
	{
		name: "frozen chopped spinach",
		department: "unclassified"
	},
	{
		name: "provolone cheese",
		department: "unclassified"
	},
	{
		name: "watercress",
		department: "unclassified"
	},
	{
		name: "pinto beans",
		department: "unclassified"
	},
	{
		name: "unsweetened applesauce",
		department: "unclassified"
	},
	{
		name: "fish fillets",
		department: "unclassified"
	},
	{
		name: "ice cream",
		department: "unclassified"
	},
	{
		name: "smoked salmon",
		department: "unclassified"
	},
	{
		name: "boneless chicken breast",
		department: "unclassified"
	},
	{
		name: "snowpeas",
		department: "unclassified"
	},
	{
		name: "steak",
		department: "unclassified"
	},
	{
		name: "table salt",
		department: "unclassified"
	},
	{
		name: "mirin",
		department: "unclassified"
	},
	{
		name: "cane sugar",
		department: "unclassified"
	},
	{
		name: "jam",
		department: "unclassified"
	},
	{
		name: "sambal chile paste",
		department: "unclassified"
	},
	{
		name: "sambal",
		department: "unclassified"
	},
	{
		name: "pizza doughs",
		department: "unclassified"
	},
	{
		name: "bicarbonate of soda",
		department: "unclassified"
	},
	{
		name: "pineapple chunks",
		department: "unclassified"
	},
	{
		name: "whole grain mustard",
		department: "unclassified"
	},
	{
		name: "milk chocolate",
		department: "unclassified"
	},
	{
		name: "mashed potatoes",
		department: "unclassified"
	},
	{
		name: "flaked coconut",
		department: "unclassified"
	},
	{
		name: "corn syrup",
		department: "unclassified"
	},
	{
		name: "ground almonds",
		department: "unclassified"
	},
	{
		name: "sherry",
		department: "unclassified"
	},
	{
		name: "vanilla instant pudding",
		department: "unclassified"
	},
	{
		name: "instant vanilla pudding",
		department: "unclassified"
	},
	{
		name: "mini chocolate chips",
		department: "unclassified"
	},
	{
		name: "firmly packed brown sugar",
		department: "unclassified"
	},
	{
		name: "sherry vinegar",
		department: "unclassified"
	},
	{
		name: "simple syrup",
		department: "unclassified"
	},
	{
		name: "milk chocolate chips",
		department: "unclassified"
	},
	{
		name: "macaroni",
		department: "unclassified"
	},
	{
		name: "yellow cake mix",
		department: "unclassified"
	},
	{
		name: "fresh tarragon",
		department: "unclassified"
	},
	{
		name: "pork chops",
		department: "unclassified"
	},
	{
		name: "hamburger buns",
		department: "unclassified"
	},
	{
		name: "seeds",
		department: "unclassified"
	},
	{
		name: "minced beef",
		department: "unclassified"
	},
	{
		name: "chicken wings",
		department: "unclassified"
	},
	{
		name: "chopped fresh mint",
		department: "unclassified"
	},
	{
		name: "shredded parmesan cheese",
		department: "unclassified"
	},
	{
		name: "vanilla essence",
		department: "unclassified"
	},
	{
		name: "english cucumber",
		department: "unclassified"
	},
	{
		name: "mustard powder",
		department: "unclassified"
	},
	{
		name: "new potatoes",
		department: "unclassified"
	},
	{
		name: "greens",
		department: "unclassified"
	},
	{
		name: "red food coloring",
		department: "unclassified"
	},
	{
		name: "mixed spice",
		department: "unclassified"
	},
	{
		name: "marshmallows",
		department: "unclassified"
	},
	{
		name: "yellow mustard",
		department: "unclassified"
	},
	{
		name: "celery root",
		department: "unclassified"
	},
	{
		name: "celery bulbs",
		department: "unclassified"
	},
	{
		name: "celeriac",
		department: "unclassified"
	},
	{
		name: "egg noodles",
		department: "unclassified"
	},
	{
		name: "cognac",
		department: "unclassified"
	},
	{
		name: "whipped topping",
		department: "unclassified"
	},
	{
		name: "mandarin oranges",
		department: "unclassified"
	},
	{
		name: "peeled fresh ginger",
		department: "unclassified"
	},
	{
		name: "caraway seeds",
		department: "unclassified"
	},
	{
		name: "ginger root",
		department: "unclassified"
	},
	{
		name: "caramels",
		department: "unclassified"
	},
	{
		name: "tomato juice",
		department: "unclassified"
	},
	{
		name: "pudding mix",
		department: "unclassified"
	},
	{
		name: "coconut cream",
		department: "unclassified"
	},
	{
		name: "soya milk",
		department: "unclassified"
	},
	{
		name: "soymilk",
		department: "unclassified"
	},
	{
		name: "green cabbage",
		department: "unclassified"
	},
	{
		name: "medium shrimp",
		department: "unclassified"
	},
	{
		name: "toasted sesame seeds",
		department: "unclassified"
	},
	{
		name: "fresh cranberries",
		department: "unclassified"
	},
	{
		name: "cajun seasoning",
		department: "unclassified"
	},
	{
		name: "2% reduced-fat milk",
		department: "unclassified"
	},
	{
		name: "smetana",
		department: "unclassified"
	},
	{
		name: "arborio rice",
		department: "unclassified"
	},
	{
		name: "leaves",
		department: "unclassified"
	},
	{
		name: "portabello mushroom",
		department: "unclassified"
	},
	{
		name: "portabella mushrooms",
		department: "unclassified"
	},
	{
		name: "portobello",
		department: "unclassified"
	},
	{
		name: "portobello mushrooms",
		department: "unclassified"
	},
	{
		name: "sugar pea",
		department: "unclassified"
	},
	{
		name: "sugar snap pea",
		department: "unclassified"
	},
	{
		name: "snap pea",
		department: "unclassified"
	},
	{
		name: "unflavored gelatin",
		department: "unclassified"
	},
	{
		name: "instant coffee",
		department: "unclassified"
	},
	{
		name: "unsweetened shredded dried coconut",
		department: "unclassified"
	},
	{
		name: "fresh breadcrumbs",
		department: "unclassified"
	},
	{
		name: "stevia",
		department: "unclassified"
	},
	{
		name: "chips",
		department: "unclassified"
	},
	{
		name: "almond meal",
		department: "unclassified"
	},
	{
		name: "prawns",
		department: "unclassified"
	},
	{
		name: "linguine",
		department: "unclassified"
	},
	{
		name: "yellow squash",
		department: "unclassified"
	},
	{
		name: "cremini mushrooms",
		department: "unclassified"
	},
	{
		name: "water chestnuts",
		department: "unclassified"
	},
	{
		name: "shredded Monterey Jack cheese",
		department: "unclassified"
	},
	{
		name: "gluten",
		department: "unclassified"
	},
	{
		name: "frosting",
		department: "unclassified"
	},
	{
		name: "grated lemon peel",
		department: "unclassified"
	},
	{
		name: "Nutella",
		department: "unclassified"
	},
	{
		name: "green olives",
		department: "unclassified"
	},
	{
		name: "quick-cooking oats",
		department: "unclassified"
	},
	{
		name: "penne pasta",
		department: "unclassified"
	},
	{
		name: "mixed salad greens",
		department: "unclassified"
	},
	{
		name: "white rice",
		department: "unclassified"
	},
	{
		name: "thyme leaves",
		department: "unclassified"
	},
	{
		name: "vegetable oil cooking spray",
		department: "unclassified"
	},
	{
		name: "nonstick vegetable spray",
		department: "unclassified"
	},
	{
		name: "tomato ketchup",
		department: "unclassified"
	},
	{
		name: "solid pack pumpkin",
		department: "unclassified"
	},
	{
		name: "canned pumpkin",
		department: "unclassified"
	},
	{
		name: "sweetener",
		department: "unclassified"
	},
	{
		name: "wine vinegar",
		department: "unclassified"
	},
	{
		name: "raw honey",
		department: "unclassified"
	},
	{
		name: "baby spinach leaves",
		department: "unclassified"
	},
	{
		name: "spanish onion",
		department: "unclassified"
	},
	{
		name: "grapeseed oil",
		department: "unclassified"
	},
	{
		name: "anchovy fillets",
		department: "unclassified"
	},
	{
		name: "parsley flakes",
		department: "unclassified"
	},
	{
		name: "whole wheat pastry flour",
		department: "unclassified"
	},
	{
		name: "lasagna noodles",
		department: "unclassified"
	},
	{
		name: "tamari soy sauce",
		department: "unclassified"
	},
	{
		name: "tamari",
		department: "unclassified"
	},
	{
		name: "grating cheese",
		department: "unclassified"
	},
	{
		name: "xanthan gum",
		department: "unclassified"
	},
	{
		name: "biscuits",
		department: "unclassified"
	},
	{
		name: "chillies",
		department: "unclassified"
	},
	{
		name: "toast",
		department: "unclassified"
	},
	{
		name: "sweet corn",
		department: "unclassified"
	},
	{
		name: "sweetcorn",
		department: "unclassified"
	},
	{
		name: "prepared horseradish",
		department: "unclassified"
	},
	{
		name: "vanilla bean paste",
		department: "unclassified"
	},
	{
		name: "garbanzo beans",
		department: "unclassified"
	},
	{
		name: "currant",
		department: "unclassified"
	},
	{
		name: "liqueur",
		department: "unclassified"
	},
	{
		name: "celery salt",
		department: "unclassified"
	},
	{
		name: "salt and ground black pepper",
		department: "unclassified"
	},
	{
		name: "crumbled blue cheese",
		department: "unclassified"
	},
	{
		name: "garlic paste",
		department: "unclassified"
	},
	{
		name: "Italian parsley leaves",
		department: "unclassified"
	},
	{
		name: "stewed tomatoes",
		department: "unclassified"
	},
	{
		name: "reduced sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "parsley leaves",
		department: "unclassified"
	},
	{
		name: "pizza sauce",
		department: "unclassified"
	},
	{
		name: "soup",
		department: "unclassified"
	},
	{
		name: "poultry seasoning",
		department: "unclassified"
	},
	{
		name: "fresh tomatoes",
		department: "unclassified"
	},
	{
		name: "chervil",
		department: "unclassified"
	},
	{
		name: "low-fat quark",
		department: "unclassified"
	},
	{
		name: "bouillon",
		department: "unclassified"
	},
	{
		name: "italian sausage",
		department: "unclassified"
	},
	{
		name: "frozen blueberries",
		department: "unclassified"
	},
	{
		name: "minced ginger",
		department: "unclassified"
	},
	{
		name: "yellow peppers",
		department: "unclassified"
	},
	{
		name: "diced celery",
		department: "unclassified"
	},
	{
		name: "white beans",
		department: "unclassified"
	},
	{
		name: "caramel sauce",
		department: "unclassified"
	},
	{
		name: "chipotles in adobo",
		department: "unclassified"
	},
	{
		name: "peppermint extract",
		department: "unclassified"
	},
	{
		name: "semolina",
		department: "unclassified"
	},
	{
		name: "polenta",
		department: "unclassified"
	},
	{
		name: "stock",
		department: "unclassified"
	},
	{
		name: "orange liqueur",
		department: "unclassified"
	},
	{
		name: "chocolate syrup",
		department: "unclassified"
	},
	{
		name: "liquid smoke",
		department: "unclassified"
	},
	{
		name: "1% low-fat milk",
		department: "unclassified"
	},
	{
		name: "apricot jam",
		department: "unclassified"
	},
	{
		name: "dry coconut",
		department: "unclassified"
	},
	{
		name: "condensed milk",
		department: "unclassified"
	},
	{
		name: "light mayonnaise",
		department: "unclassified"
	},
	{
		name: "red kidney beans",
		department: "unclassified"
	},
	{
		name: "superfine sugar",
		department: "unclassified"
	},
	{
		name: "onion soup mix",
		department: "unclassified"
	},
	{
		name: "chicken stock cubes",
		department: "unclassified"
	},
	{
		name: "chicken bouillon cubes",
		department: "unclassified"
	},
	{
		name: "rice flour",
		department: "unclassified"
	},
	{
		name: "glaze",
		department: "unclassified"
	},
	{
		name: "bbq glaze",
		department: "unclassified"
	},
	{
		name: "coarse sea salt",
		department: "unclassified"
	},
	{
		name: "juniper berries",
		department: "unclassified"
	},
	{
		name: "lemon slices",
		department: "unclassified"
	},
	{
		name: "white flour",
		department: "unclassified"
	},
	{
		name: "long grain white rice",
		department: "unclassified"
	},
	{
		name: "seasoned bread crumbs",
		department: "unclassified"
	},
	{
		name: "fish",
		department: "unclassified"
	},
	{
		name: "reduced sodium soy sauce",
		department: "unclassified"
	},
	{
		name: "flax seeds",
		department: "unclassified"
	},
	{
		name: "icing",
		department: "unclassified"
	},
	{
		name: "beaten eggs",
		department: "unclassified"
	},
	{
		name: "medjool date",
		department: "unclassified"
	},
	{
		name: "red chili powder",
		department: "unclassified"
	},
	{
		name: "pomegranate seeds",
		department: "unclassified"
	},
	{
		name: "bacon slices",
		department: "unclassified"
	},
	{
		name: "cooked bacon",
		department: "unclassified"
	},
	{
		name: "pecorino romano cheese",
		department: "unclassified"
	},
	{
		name: "pecorino romano",
		department: "unclassified"
	},
	{
		name: "orange marmalade",
		department: "unclassified"
	},
	{
		name: "refried beans",
		department: "unclassified"
	},
	{
		name: "fresh pineapple",
		department: "unclassified"
	},
	{
		name: "orange peel",
		department: "unclassified"
	},
	{
		name: "pepperoni",
		department: "unclassified"
	},
	{
		name: "golden syrup",
		department: "unclassified"
	},
	{
		name: "crabmeat",
		department: "unclassified"
	},
	{
		name: "lemon extract",
		department: "unclassified"
	},
	{
		name: "dried cherry",
		department: "unclassified"
	},
	{
		name: "italian salad dressing",
		department: "unclassified"
	},
	{
		name: "italian dressing",
		department: "unclassified"
	},
	{
		name: "pitted dates",
		department: "unclassified"
	},
	{
		name: "green peas",
		department: "unclassified"
	},
	{
		name: "brie cheese",
		department: "unclassified"
	},
	{
		name: "hot pepper",
		department: "unclassified"
	},
	{
		name: "corn oil",
		department: "unclassified"
	},
	{
		name: "tomatillos",
		department: "unclassified"
	},
	{
		name: "teas",
		department: "unclassified"
	},
	{
		name: "flax seed meal",
		department: "unclassified"
	},
	{
		name: "fresh sage",
		department: "unclassified"
	},
	{
		name: "penne",
		department: "unclassified"
	},
	{
		name: "artichokes",
		department: "unclassified"
	},
	{
		name: "vidalia onion",
		department: "unclassified"
	},
	{
		name: "chipotle chile",
		department: "unclassified"
	},
	{
		name: "ground lamb",
		department: "unclassified"
	},
	{
		name: "pie shell",
		department: "unclassified"
	},
	{
		name: "beef stock cubes",
		department: "unclassified"
	},
	{
		name: "beef bouillon cubes",
		department: "unclassified"
	},
	{
		name: "chinese five-spice powder",
		department: "unclassified"
	},
	{
		name: "five-spice",
		department: "unclassified"
	},
	{
		name: "brewed coffee",
		department: "unclassified"
	},
	{
		name: "cooked chicken breasts",
		department: "unclassified"
	},
	{
		name: "golden caster sugar",
		department: "unclassified"
	},
	{
		name: "raw cashews",
		department: "unclassified"
	},
	{
		name: "bow-tie pasta",
		department: "unclassified"
	},
	{
		name: "farfalle",
		department: "unclassified"
	},
	{
		name: "part-skim mozzarella cheese",
		department: "unclassified"
	},
	{
		name: "cream quark",
		department: "unclassified"
	},
	{
		name: "quark",
		department: "unclassified"
	},
	{
		name: "orange bell pepper",
		department: "unclassified"
	},
	{
		name: "beefsteak tomatoes",
		department: "unclassified"
	},
	{
		name: "rucola",
		department: "unclassified"
	},
	{
		name: "pork sausages",
		department: "unclassified"
	},
	{
		name: "coriander powder",
		department: "unclassified"
	},
	{
		name: "saffron threads",
		department: "unclassified"
	},
	{
		name: "old bay seasoning",
		department: "unclassified"
	},
	{
		name: "old bay",
		department: "unclassified"
	},
	{
		name: "Old Bay Seasoning",
		department: "unclassified"
	},
	{
		name: "frozen strawberries",
		department: "unclassified"
	},
	{
		name: "cardamom pods",
		department: "unclassified"
	},
	{
		name: "amaretto",
		department: "unclassified"
	},
	{
		name: "salami",
		department: "unclassified"
	},
	{
		name: "extract",
		department: "unclassified"
	},
	{
		name: "ground chicken",
		department: "unclassified"
	},
	{
		name: "Velveeta",
		department: "unclassified"
	},
	{
		name: "green chile",
		department: "unclassified"
	},
	{
		name: "marzipan",
		department: "unclassified"
	},
	{
		name: "croutons",
		department: "unclassified"
	},
	{
		name: "non-fat sour cream",
		department: "unclassified"
	},
	{
		name: "fat free sour cream",
		department: "unclassified"
	},
	{
		name: "nonfat sour cream",
		department: "unclassified"
	},
	{
		name: "marsala wine",
		department: "unclassified"
	},
	{
		name: "cooked ham",
		department: "unclassified"
	},
	{
		name: "thick-cut bacon",
		department: "unclassified"
	},
	{
		name: "egg substitute",
		department: "unclassified"
	},
	{
		name: "chorizo",
		department: "unclassified"
	},
	{
		name: "enchilada sauce",
		department: "unclassified"
	},
	{
		name: "cream style corn",
		department: "unclassified"
	},
	{
		name: "creamed corn",
		department: "unclassified"
	},
	{
		name: "rice wine",
		department: "unclassified"
	},
	{
		name: "gorgonzola",
		department: "unclassified"
	},
	{
		name: "fresh ginger root",
		department: "unclassified"
	},
	{
		name: "crust",
		department: "unclassified"
	},
	{
		name: "light cream",
		department: "unclassified"
	},
	{
		name: "chicken drumsticks",
		department: "unclassified"
	},
	{
		name: "chicken fillets",
		department: "unclassified"
	},
	{
		name: "sake",
		department: "unclassified"
	},
	{
		name: "spinach leaves",
		department: "unclassified"
	},
	{
		name: "chopped almonds",
		department: "unclassified"
	},
	{
		name: "unsweetened coconut milk",
		department: "unclassified"
	},
	{
		name: "frozen puff pastry sheets",
		department: "unclassified"
	},
	{
		name: "sourdough bread",
		department: "unclassified"
	},
	{
		name: "mashed banana",
		department: "unclassified"
	},
	{
		name: "spelt flour",
		department: "unclassified"
	},
	{
		name: "ground chuck",
		department: "unclassified"
	},
	{
		name: "oat flour",
		department: "unclassified"
	},
	{
		name: "potato starch",
		department: "unclassified"
	},
	{
		name: "turbinado",
		department: "unclassified"
	},
	{
		name: "turbinado sugar",
		department: "unclassified"
	},
	{
		name: "rapeseed oil",
		department: "unclassified"
	},
	{
		name: "raw sugar",
		department: "unclassified"
	},
	{
		name: "dried sage",
		department: "unclassified"
	},
	{
		name: "cooked quinoa",
		department: "unclassified"
	},
	{
		name: "Mexican cheese blend",
		department: "unclassified"
	},
	{
		name: "fish stock",
		department: "unclassified"
	},
	{
		name: "couverture chocolate",
		department: "unclassified"
	},
	{
		name: "nonfat milk",
		department: "unclassified"
	},
	{
		name: "cauliflower florets",
		department: "unclassified"
	},
	{
		name: "guacamole",
		department: "unclassified"
	},
	{
		name: "shredded lettuce",
		department: "unclassified"
	},
	{
		name: "marshmallow creme",
		department: "unclassified"
	},
	{
		name: "lemon rind",
		department: "unclassified"
	},
	{
		name: "dill weed",
		department: "unclassified"
	},
	{
		name: "quick oats",
		department: "unclassified"
	},
	{
		name: "dark soy sauce",
		department: "unclassified"
	},
	{
		name: "fresh mozzarella",
		department: "unclassified"
	},
	{
		name: "swiss chard",
		department: "unclassified"
	},
	{
		name: "blanched almonds",
		department: "unclassified"
	},
	{
		name: "sultana",
		department: "unclassified"
	},
	{
		name: "salad dressing",
		department: "unclassified"
	},
	{
		name: "light sour cream",
		department: "unclassified"
	},
	{
		name: "baby arugula",
		department: "unclassified"
	},
	{
		name: "granulated garlic",
		department: "unclassified"
	},
	{
		name: "fresh green beans",
		department: "unclassified"
	},
	{
		name: "chunky peanut butter",
		department: "unclassified"
	},
	{
		name: "crunchy peanut butter",
		department: "unclassified"
	},
	{
		name: "lump crab meat",
		department: "unclassified"
	},
	{
		name: "lemon pepper",
		department: "unclassified"
	},
	{
		name: "white mushrooms",
		department: "unclassified"
	},
	{
		name: "vanilla pods",
		department: "unclassified"
	},
	{
		name: "fine salt",
		department: "unclassified"
	},
	{
		name: "rosemary sprigs",
		department: "unclassified"
	},
	{
		name: "liquid",
		department: "unclassified"
	},
	{
		name: "sweet pepper",
		department: "unclassified"
	},
	{
		name: "crushed garlic",
		department: "unclassified"
	},
	{
		name: "mace",
		department: "unclassified"
	},
	{
		name: "ground mustard",
		department: "unclassified"
	},
	{
		name: "fillets",
		department: "unclassified"
	},
	{
		name: "fettucine",
		department: "unclassified"
	},
	{
		name: "fettuccini",
		department: "unclassified"
	},
	{
		name: "green food coloring",
		department: "unclassified"
	},
	{
		name: "poblano peppers",
		department: "unclassified"
	},
	{
		name: "extra firm tofu",
		department: "unclassified"
	},
	{
		name: "cold milk",
		department: "unclassified"
	},
	{
		name: "frozen raspberries",
		department: "unclassified"
	},
	{
		name: "anchovies",
		department: "unclassified"
	},
	{
		name: "chicken breast fillets",
		department: "unclassified"
	},
	{
		name: "medium eggs",
		department: "unclassified"
	},
	{
		name: "fat free milk",
		department: "unclassified"
	},
	{
		name: "sweet chili sauce",
		department: "unclassified"
	},
	{
		name: "Italian bread",
		department: "unclassified"
	},
	{
		name: "Dutch-processed cocoa powder",
		department: "unclassified"
	},
	{
		name: "low-fat buttermilk",
		department: "unclassified"
	},
	{
		name: "whole wheat white flour",
		department: "unclassified"
	},
	{
		name: "rice noodles",
		department: "unclassified"
	},
	{
		name: "teriyaki sauce",
		department: "unclassified"
	},
	{
		name: "freshly grated parmesan",
		department: "unclassified"
	},
	{
		name: "lemon balm",
		department: "unclassified"
	},
	{
		name: "large carrots",
		department: "unclassified"
	},
	{
		name: "curry paste",
		department: "unclassified"
	},
	{
		name: "ground cayenne pepper",
		department: "unclassified"
	},
	{
		name: "crystallized ginger",
		department: "unclassified"
	},
	{
		name: "vegetable soup",
		department: "unclassified"
	},
	{
		name: "reduced-fat sour cream",
		department: "unclassified"
	},
	{
		name: "wheat",
		department: "unclassified"
	},
	{
		name: "chicken breast halves",
		department: "unclassified"
	},
	{
		name: "pistachio nuts",
		department: "unclassified"
	},
	{
		name: "sliced black olives",
		department: "unclassified"
	},
	{
		name: "American cheese",
		department: "unclassified"
	},
	{
		name: "red lentils",
		department: "unclassified"
	},
	{
		name: "chicken legs",
		department: "unclassified"
	},
	{
		name: "dill pickles",
		department: "unclassified"
	},
	{
		name: "Grand Marnier",
		department: "unclassified"
	},
	{
		name: "crushed ice",
		department: "unclassified"
	},
	{
		name: "rosemary leaves",
		department: "unclassified"
	},
	{
		name: "crimini mushrooms",
		department: "unclassified"
	},
	{
		name: "espresso",
		department: "unclassified"
	},
	{
		name: "creole seasoning",
		department: "unclassified"
	},
	{
		name: "instant espresso powder",
		department: "unclassified"
	},
	{
		name: "sliced carrots",
		department: "unclassified"
	},
	{
		name: "asparagus spears",
		department: "unclassified"
	},
	{
		name: "jasmine rice",
		department: "unclassified"
	},
	{
		name: "cod fillets",
		department: "unclassified"
	},
	{
		name: "chopped green bell pepper",
		department: "unclassified"
	},
	{
		name: "asiago",
		department: "unclassified"
	},
	{
		name: "white cake mix",
		department: "unclassified"
	},
	{
		name: "sea salt flakes",
		department: "unclassified"
	},
	{
		name: "eggnog",
		department: "unclassified"
	},
	{
		name: "Philadelphia Cream Cheese",
		department: "unclassified"
	},
	{
		name: "savoy cabbage",
		department: "unclassified"
	},
	{
		name: "fresh parmesan cheese",
		department: "unclassified"
	},
	{
		name: "sea scallops",
		department: "unclassified"
	},
	{
		name: "toasted pecans",
		department: "unclassified"
	},
	{
		name: "wonton wrappers",
		department: "unclassified"
	},
	{
		name: "chicory",
		department: "unclassified"
	},
	{
		name: "mint sprigs",
		department: "unclassified"
	},
	{
		name: "romano cheese",
		department: "unclassified"
	},
	{
		name: "romano",
		department: "unclassified"
	},
	{
		name: "tart apples",
		department: "unclassified"
	},
	{
		name: "vanilla yogurt",
		department: "unclassified"
	},
	{
		name: "chopped fresh sage",
		department: "unclassified"
	},
	{
		name: "light coconut milk",
		department: "unclassified"
	},
	{
		name: "bacon bits",
		department: "unclassified"
	},
	{
		name: "kecap manis",
		department: "unclassified"
	},
	{
		name: "streaky bacon",
		department: "unclassified"
	},
	{
		name: "medium tomatoes",
		department: "unclassified"
	},
	{
		name: "ladyfingers",
		department: "unclassified"
	},
	{
		name: "pork shoulder",
		department: "unclassified"
	},
	{
		name: "crusty bread",
		department: "unclassified"
	},
	{
		name: "shredded cabbage",
		department: "unclassified"
	},
	{
		name: "ancho powder",
		department: "unclassified"
	},
	{
		name: "ancho chile seasoning",
		department: "unclassified"
	},
	{
		name: "buns",
		department: "unclassified"
	},
	{
		name: "napa cabbage",
		department: "unclassified"
	},
	{
		name: "onion flakes",
		department: "unclassified"
	},
	{
		name: "tapioca flour",
		department: "unclassified"
	},
	{
		name: "M&M\"s Candy",
		department: "unclassified"
	},
	{
		name: "raspberry jam",
		department: "unclassified"
	},
	{
		name: "butterscotch chips",
		department: "unclassified"
	},
	{
		name: "butterscotch morsels",
		department: "unclassified"
	},
	{
		name: "cherry pie filling",
		department: "unclassified"
	},
	{
		name: "coconut extract",
		department: "unclassified"
	},
	{
		name: "leg of lamb",
		department: "unclassified"
	},
	{
		name: "sirloin steak",
		department: "unclassified"
	},
	{
		name: "roasting chickens",
		department: "unclassified"
	},
	{
		name: "grated orange peel",
		department: "unclassified"
	},
	{
		name: "chorizo sausage",
		department: "unclassified"
	},
	{
		name: "small red potatoes",
		department: "unclassified"
	},
	{
		name: "black-eyed peas",
		department: "unclassified"
	},
	{
		name: "jelly",
		department: "unclassified"
	},
	{
		name: "curds",
		department: "unclassified"
	},
	{
		name: "dark sesame oil",
		department: "unclassified"
	},
	{
		name: "wheat germ",
		department: "unclassified"
	},
	{
		name: "panko",
		department: "unclassified"
	},
	{
		name: "canned tomatoes",
		department: "unclassified"
	},
	{
		name: "fresh herbs",
		department: "unclassified"
	},
	{
		name: "field lettuce",
		department: "unclassified"
	},
	{
		name: "field salad",
		department: "unclassified"
	},
	{
		name: "mache",
		department: "unclassified"
	},
	{
		name: "corn salad",
		department: "unclassified"
	},
	{
		name: "lamb\"s lettuce",
		department: "unclassified"
	},
	{
		name: "soda",
		department: "unclassified"
	},
	{
		name: "apricot preserves",
		department: "unclassified"
	},
	{
		name: "salad oil",
		department: "unclassified"
	},
	{
		name: "pearl onions",
		department: "unclassified"
	},
	{
		name: "cocktail onions",
		department: "unclassified"
	},
	{
		name: "Italian style breadcrumbs",
		department: "unclassified"
	},
	{
		name: "hamburger",
		department: "unclassified"
	},
	{
		name: "fontina cheese",
		department: "unclassified"
	},
	{
		name: "marinade",
		department: "unclassified"
	},
	{
		name: "vinaigrette",
		department: "unclassified"
	},
	{
		name: "prunes",
		department: "unclassified"
	},
	{
		name: "taco seasoning mix",
		department: "unclassified"
	},
	{
		name: "strawberry jam",
		department: "unclassified"
	},
	{
		name: "chile pepper",
		department: "unclassified"
	},
	{
		name: "essence",
		department: "unclassified"
	},
	{
		name: "spice essence",
		department: "unclassified"
	},
	{
		name: "pearl barley",
		department: "unclassified"
	},
	{
		name: "pitted kalamata olives",
		department: "unclassified"
	},
	{
		name: "part-skim ricotta cheese",
		department: "unclassified"
	},
	{
		name: "pork loin",
		department: "unclassified"
	},
	{
		name: "pork loin meat",
		department: "unclassified"
	},
	{
		name: "butter lettuce",
		department: "unclassified"
	},
	{
		name: "non dairy milk",
		department: "unclassified"
	},
	{
		name: "yolk",
		department: "unclassified"
	},
	{
		name: "brown rice flour",
		department: "unclassified"
	},
	{
		name: "smoked sausage",
		department: "unclassified"
	},
	{
		name: "capsicum",
		department: "unclassified"
	},
	{
		name: "great northern beans",
		department: "unclassified"
	},
	{
		name: "chocolate bars",
		department: "unclassified"
	},
	{
		name: "powdered milk",
		department: "unclassified"
	},
	{
		name: "finely chopped pecans",
		department: "unclassified"
	},
	{
		name: "herbes de provence",
		department: "unclassified"
	},
	{
		name: "frozen corn kernels",
		department: "unclassified"
	},
	{
		name: "diced red onions",
		department: "unclassified"
	},
	{
		name: "ginger ale",
		department: "unclassified"
	},
	{
		name: "pomegranate juice",
		department: "unclassified"
	},
	{
		name: "chicken bouillon",
		department: "unclassified"
	},
	{
		name: "raw almonds",
		department: "unclassified"
	},
	{
		name: "condensed cream of mushroom soup",
		department: "unclassified"
	},
	{
		name: "filo dough",
		department: "unclassified"
	},
	{
		name: "queso fresco",
		department: "unclassified"
	},
	{
		name: "lemonade",
		department: "unclassified"
	},
	{
		name: "pork belly",
		department: "unclassified"
	},
	{
		name: "stomach meat",
		department: "unclassified"
	},
	{
		name: "flavoring",
		department: "unclassified"
	},
	{
		name: "Himalayan salt",
		department: "unclassified"
	},
	{
		name: "serrano peppers",
		department: "unclassified"
	},
	{
		name: "tilapia fillets",
		department: "unclassified"
	},
	{
		name: "navel oranges",
		department: "unclassified"
	},
	{
		name: "tomato soup",
		department: "unclassified"
	},
	{
		name: "serrano chile",
		department: "unclassified"
	},
	{
		name: "beef brisket",
		department: "unclassified"
	},
	{
		name: "tea bags",
		department: "unclassified"
	},
	{
		name: "grated coconut",
		department: "unclassified"
	},
	{
		name: "coffee granules",
		department: "unclassified"
	},
	{
		name: "Rice Krispies Cereal",
		department: "unclassified"
	},
	{
		name: "Kellog\"s Rice Krispies",
		department: "unclassified"
	},
	{
		name: "protein powder",
		department: "unclassified"
	},
	{
		name: "roasted peanuts",
		department: "unclassified"
	},
	{
		name: "pastry",
		department: "unclassified"
	},
	{
		name: "chili paste",
		department: "unclassified"
	},
	{
		name: "rotisserie chicken",
		department: "unclassified"
	},
	{
		name: "sausage casings",
		department: "unclassified"
	},
	{
		name: "ground chipotle chile pepper",
		department: "unclassified"
	},
	{
		name: "fresh asparagus",
		department: "unclassified"
	},
	{
		name: "walnut halves",
		department: "unclassified"
	},
	{
		name: "natural peanut butter",
		department: "unclassified"
	},
	{
		name: "powdered gelatin",
		department: "unclassified"
	},
	{
		name: "spaghetti squash",
		department: "unclassified"
	},
	{
		name: "dried tarragon leaves",
		department: "unclassified"
	},
	{
		name: "white cheddar cheese",
		department: "unclassified"
	},
	{
		name: "pork fillets",
		department: "unclassified"
	},
	{
		name: "sherry wine",
		department: "unclassified"
	},
	{
		name: "walnut oil",
		department: "unclassified"
	},
	{
		name: "chicken fingers",
		department: "unclassified"
	},
	{
		name: "chicken tenders",
		department: "unclassified"
	},
	{
		name: "pepper jack",
		department: "unclassified"
	},
	{
		name: "pecorino cheese",
		department: "unclassified"
	},
	{
		name: "peccorino",
		department: "unclassified"
	},
	{
		name: "hot red pepper flakes",
		department: "unclassified"
	},
	{
		name: "tapioca starch",
		department: "unclassified"
	},
	{
		name: "shredded swiss cheese",
		department: "unclassified"
	},
	{
		name: "dried dill",
		department: "unclassified"
	},
	{
		name: "refrigerated piecrusts",
		department: "unclassified"
	},
	{
		name: "refrigerated pie crusts",
		department: "unclassified"
	},
	{
		name: "extra large eggs",
		department: "unclassified"
	},
	{
		name: "finely chopped fresh parsley",
		department: "unclassified"
	},
	{
		name: "chopped green chilies",
		department: "unclassified"
	},
	{
		name: "sheep’s milk cheese",
		department: "unclassified"
	},
	{
		name: "green apples",
		department: "unclassified"
	},
	{
		name: "palm sugar",
		department: "unclassified"
	},
	{
		name: "toasted walnuts",
		department: "unclassified"
	},
	{
		name: "chocolate instant pudding",
		department: "unclassified"
	},
	{
		name: "instant chocolate pudding",
		department: "unclassified"
	},
	{
		name: "low-fat plain yogurt",
		department: "unclassified"
	},
	{
		name: "angel hair",
		department: "unclassified"
	},
	{
		name: "cinnamon sugar",
		department: "unclassified"
	},
	{
		name: "ketjap",
		department: "unclassified"
	},
	{
		name: "smoked bacon",
		department: "unclassified"
	},
	{
		name: "skinless chicken breasts",
		department: "unclassified"
	},
	{
		name: "garlic chili sauce",
		department: "unclassified"
	},
	{
		name: "low-fat sour cream",
		department: "unclassified"
	},
	{
		name: "fresh mozzarella cheese",
		department: "unclassified"
	},
	{
		name: "fat free less sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "shells",
		department: "unclassified"
	},
	{
		name: "sauce thickener",
		department: "unclassified"
	},
	{
		name: "sliced tomatoes",
		department: "unclassified"
	},
	{
		name: "stewing beef",
		department: "unclassified"
	},
	{
		name: "port wine",
		department: "unclassified"
	},
	{
		name: "french fried onions",
		department: "unclassified"
	},
	{
		name: "salted peanuts",
		department: "unclassified"
	},
	{
		name: "buckwheat flour",
		department: "unclassified"
	},
	{
		name: "ripe olives",
		department: "unclassified"
	},
	{
		name: "white cabbage",
		department: "unclassified"
	},
	{
		name: "low salt chicken broth",
		department: "unclassified"
	},
	{
		name: "fresh oregano leaves",
		department: "unclassified"
	},
	{
		name: "rocket leaves",
		department: "unclassified"
	},
	{
		name: "arugula leaves",
		department: "unclassified"
	},
	{
		name: "orzo pasta",
		department: "unclassified"
	},
	{
		name: "red curry paste",
		department: "unclassified"
	},
	{
		name: "chicken pieces",
		department: "unclassified"
	},
	{
		name: "flat leaf spinach",
		department: "unclassified"
	},
	{
		name: "phyllo pastry",
		department: "unclassified"
	},
	{
		name: "pork loin chops",
		department: "unclassified"
	},
	{
		name: "sun-dried tomatoes in oil",
		department: "unclassified"
	},
	{
		name: "crumbs",
		department: "unclassified"
	},
	{
		name: "kaffir lime leaves",
		department: "unclassified"
	},
	{
		name: "sour cherries",
		department: "unclassified"
	},
	{
		name: "cooked white rice",
		department: "unclassified"
	},
	{
		name: "brownie mix",
		department: "unclassified"
	},
	{
		name: "gluten-free flour",
		department: "unclassified"
	},
	{
		name: "grenadine",
		department: "unclassified"
	},
	{
		name: "parma ham",
		department: "unclassified"
	},
	{
		name: "refrigerated crescent rolls",
		department: "unclassified"
	},
	{
		name: "filet",
		department: "unclassified"
	},
	{
		name: "port",
		department: "unclassified"
	},
	{
		name: "acorn squash",
		department: "unclassified"
	},
	{
		name: "roast beef",
		department: "unclassified"
	},
	{
		name: "chutney",
		department: "unclassified"
	},
	{
		name: "beef bouillon",
		department: "unclassified"
	},
	{
		name: "beef bouilion",
		department: "unclassified"
	},
	{
		name: "whole cloves",
		department: "unclassified"
	},
	{
		name: "pectin",
		department: "unclassified"
	},
	{
		name: "crescent rolls",
		department: "unclassified"
	},
	{
		name: "low-fat cream cheese",
		department: "unclassified"
	},
	{
		name: "espresso powder",
		department: "unclassified"
	},
	{
		name: "peanut butter chips",
		department: "unclassified"
	},
	{
		name: "galangal",
		department: "unclassified"
	},
	{
		name: "lime slices",
		department: "unclassified"
	},
	{
		name: "ale",
		department: "unclassified"
	},
	{
		name: "vanilla wafers",
		department: "unclassified"
	},
	{
		name: "chestnuts",
		department: "unclassified"
	},
	{
		name: "boneless pork chops",
		department: "unclassified"
	},
	{
		name: "condensed cream of chicken soup",
		department: "unclassified"
	},
	{
		name: "adobo sauce",
		department: "unclassified"
	},
	{
		name: "chuck roast",
		department: "unclassified"
	},
	{
		name: "cranberry sauce",
		department: "unclassified"
	},
	{
		name: "plain breadcrumbs",
		department: "unclassified"
	},
	{
		name: "heirloom tomatoes",
		department: "unclassified"
	},
	{
		name: "tomatoes with juice",
		department: "unclassified"
	},
	{
		name: "grated Gruyère cheese",
		department: "unclassified"
	},
	{
		name: "coffee liqueur",
		department: "unclassified"
	},
	{
		name: "coffee flavored liqueur",
		department: "unclassified"
	},
	{
		name: "pesto sauce",
		department: "unclassified"
	},
	{
		name: "light cream cheese",
		department: "unclassified"
	},
	{
		name: "unbleached flour",
		department: "unclassified"
	},
	{
		name: "whole wheat flour tortillas",
		department: "unclassified"
	},
	{
		name: "cake mix",
		department: "unclassified"
	},
	{
		name: "chocolate shavings",
		department: "unclassified"
	},
	{
		name: "pomegranate",
		department: "unclassified"
	},
	{
		name: "chanterelle",
		department: "unclassified"
	},
	{
		name: "dried thyme leaves",
		department: "unclassified"
	},
	{
		name: "reduced fat cream cheese",
		department: "unclassified"
	},
	{
		name: "granola",
		department: "unclassified"
	},
	{
		name: "rye bread",
		department: "unclassified"
	},
	{
		name: "black sesame seeds",
		department: "unclassified"
	},
	{
		name: "grapefruit juice",
		department: "unclassified"
	},
	{
		name: "cress",
		department: "unclassified"
	},
	{
		name: "kahlua",
		department: "unclassified"
	},
	{
		name: "corn flakes",
		department: "unclassified"
	},
	{
		name: "dried fig",
		department: "unclassified"
	},
	{
		name: "demerara sugar",
		department: "unclassified"
	},
	{
		name: "dried porcini mushrooms",
		department: "unclassified"
	},
	{
		name: "dried porcini",
		department: "unclassified"
	},
	{
		name: "andouille sausage",
		department: "unclassified"
	},
	{
		name: "chicken livers",
		department: "unclassified"
	},
	{
		name: "whole kernel corn, drained",
		department: "unclassified"
	},
	{
		name: "chipotle peppers",
		department: "unclassified"
	},
	{
		name: "lemon curd",
		department: "unclassified"
	},
	{
		name: "grated carrot",
		department: "unclassified"
	},
	{
		name: "rigatoni",
		department: "unclassified"
	},
	{
		name: "carbonated water",
		department: "unclassified"
	},
	{
		name: "sparkling water",
		department: "unclassified"
	},
	{
		name: "zest",
		department: "unclassified"
	},
	{
		name: "salsa verde",
		department: "unclassified"
	},
	{
		name: "graham cracker crust",
		department: "unclassified"
	},
	{
		name: "rotini",
		department: "unclassified"
	},
	{
		name: "bisquick",
		department: "unclassified"
	},
	{
		name: "Jell-O Gelatin",
		department: "unclassified"
	},
	{
		name: "medium potatoes",
		department: "unclassified"
	},
	{
		name: "ginger paste",
		department: "unclassified"
	},
	{
		name: "saltines",
		department: "unclassified"
	},
	{
		name: "saltine crackers",
		department: "unclassified"
	},
	{
		name: "parsley sprigs",
		department: "unclassified"
	},
	{
		name: "frozen mixed vegetables",
		department: "unclassified"
	},
	{
		name: "gluten free all purpose flour",
		department: "unclassified"
	},
	{
		name: "cooked brown rice",
		department: "unclassified"
	},
	{
		name: "pepitas",
		department: "unclassified"
	},
	{
		name: "mild olive oil",
		department: "unclassified"
	},
	{
		name: "nonfat yogurt",
		department: "unclassified"
	},
	{
		name: "nonfat plain greek yogurt",
		department: "unclassified"
	},
	{
		name: "marinated artichoke hearts",
		department: "unclassified"
	},
	{
		name: "slaw mix",
		department: "unclassified"
	},
	{
		name: "coleslaw mix",
		department: "unclassified"
	},
	{
		name: "thai chile",
		department: "unclassified"
	},
	{
		name: "Balsamico Bianco",
		department: "unclassified"
	},
	{
		name: "white balsamic vinegar",
		department: "unclassified"
	},
	{
		name: "beef stew meat",
		department: "unclassified"
	},
	{
		name: "diced green chilies",
		department: "unclassified"
	},
	{
		name: "hemp seeds",
		department: "unclassified"
	},
	{
		name: "crab meat",
		department: "unclassified"
	},
	{
		name: "blood orange",
		department: "unclassified"
	},
	{
		name: "rye flour",
		department: "unclassified"
	},
	{
		name: "gherkins",
		department: "unclassified"
	},
	{
		name: "lemon grass",
		department: "unclassified"
	},
	{
		name: "baking chocolate",
		department: "unclassified"
	},
	{
		name: "rose water",
		department: "unclassified"
	},
	{
		name: "tomato passata",
		department: "unclassified"
	},
	{
		name: "extra sharp cheddar cheese",
		department: "unclassified"
	},
	{
		name: "Shaoxing wine",
		department: "unclassified"
	},
	{
		name: "orange rind",
		department: "unclassified"
	},
	{
		name: "fresh chevre",
		department: "unclassified"
	},
	{
		name: "fresh goat cheese",
		department: "unclassified"
	},
	{
		name: "oyster mushrooms",
		department: "unclassified"
	},
	{
		name: "golden brown sugar",
		department: "unclassified"
	},
	{
		name: "chinese cabbage",
		department: "unclassified"
	},
	{
		name: "dry vermouth",
		department: "unclassified"
	},
	{
		name: "candy canes",
		department: "unclassified"
	},
	{
		name: "thai basil",
		department: "unclassified"
	},
	{
		name: "chocolate cake mix",
		department: "unclassified"
	},
	{
		name: "sausage links",
		department: "unclassified"
	},
	{
		name: "fusilli",
		department: "unclassified"
	},
	{
		name: "jack cheese",
		department: "unclassified"
	},
	{
		name: "pickle relish",
		department: "unclassified"
	},
	{
		name: "phyllo dough",
		department: "unclassified"
	},
	{
		name: "catsup",
		department: "unclassified"
	},
	{
		name: "mango chutney",
		department: "unclassified"
	},
	{
		name: "boneless pork loin",
		department: "unclassified"
	},
	{
		name: "vegan butter",
		department: "unclassified"
	},
	{
		name: "bulgur",
		department: "unclassified"
	},
	{
		name: "ramen noodles",
		department: "unclassified"
	},
	{
		name: "low-fat mayonnaise",
		department: "unclassified"
	},
	{
		name: "celery sticks",
		department: "unclassified"
	},
	{
		name: "whole peeled tomatoes",
		department: "unclassified"
	},
	{
		name: "light rum",
		department: "unclassified"
	},
	{
		name: "muscovado sugar",
		department: "unclassified"
	},
	{
		name: "duck breasts",
		department: "unclassified"
	},
	{
		name: "dried dillweed",
		department: "unclassified"
	},
	{
		name: "raw cacao powder",
		department: "unclassified"
	},
	{
		name: "white rum",
		department: "unclassified"
	},
	{
		name: "nonfat greek yogurt",
		department: "unclassified"
	},
	{
		name: "orange extract",
		department: "unclassified"
	},
	{
		name: "kale leaves",
		department: "unclassified"
	},
	{
		name: "asafoetida",
		department: "unclassified"
	},
	{
		name: "light butter",
		department: "unclassified"
	},
	{
		name: "cheese spread",
		department: "unclassified"
	},
	{
		name: "shredded zucchini",
		department: "unclassified"
	},
	{
		name: "browning",
		department: "unclassified"
	},
	{
		name: "meat bones",
		department: "unclassified"
	},
	{
		name: "hungarian paprika",
		department: "unclassified"
	},
	{
		name: "Kraft Miracle Whip Dressing",
		department: "unclassified"
	},
	{
		name: "Miracle Whip",
		department: "unclassified"
	},
	{
		name: "fresh spinach leaves",
		department: "unclassified"
	},
	{
		name: "hass avocado",
		department: "unclassified"
	},
	{
		name: "whole kernel corn",
		department: "unclassified"
	},
	{
		name: "cooking greens",
		department: "unclassified"
	},
	{
		name: "spicy brown mustard",
		department: "unclassified"
	},
	{
		name: "Swerve Sweetener",
		department: "unclassified"
	},
	{
		name: "almond paste",
		department: "unclassified"
	},
	{
		name: "wholemeal flour",
		department: "unclassified"
	},
	{
		name: "shortcrust pastry",
		department: "unclassified"
	},
	{
		name: "onion salt",
		department: "unclassified"
	},
	{
		name: "cod",
		department: "unclassified"
	},
	{
		name: "stuffing",
		department: "unclassified"
	},
	{
		name: "Alfredo sauce",
		department: "unclassified"
	},
	{
		name: "haricots verts",
		department: "unclassified"
	},
	{
		name: "rib eye steaks",
		department: "unclassified"
	},
	{
		name: "rib-eye steak",
		department: "unclassified"
	},
	{
		name: "beef rib eye steaks",
		department: "unclassified"
	},
	{
		name: "savory",
		department: "unclassified"
	},
	{
		name: "chocolate chunks",
		department: "unclassified"
	},
	{
		name: "clam juice",
		department: "unclassified"
	},
	{
		name: "ancho chile pepper",
		department: "unclassified"
	},
	{
		name: "ancho chile",
		department: "unclassified"
	},
	{
		name: "ancho chiles",
		department: "unclassified"
	},
	{
		name: "dried ancho chile",
		department: "unclassified"
	},
	{
		name: "potato chips",
		department: "unclassified"
	},
	{
		name: "harissa",
		department: "unclassified"
	},
	{
		name: "chile powder",
		department: "unclassified"
	},
	{
		name: "risotto rice",
		department: "unclassified"
	},
	{
		name: "corned beef",
		department: "unclassified"
	},
	{
		name: "tagliatelle",
		department: "unclassified"
	},
	{
		name: "jumbo shrimp",
		department: "unclassified"
	},
	{
		name: "cider",
		department: "unclassified"
	},
	{
		name: "extra lean ground beef",
		department: "unclassified"
	},
	{
		name: "splenda granular",
		department: "unclassified"
	},
	{
		name: "orzo",
		department: "unclassified"
	},
	{
		name: "low sodium vegetable broth",
		department: "unclassified"
	},
	{
		name: "cilantro sprigs",
		department: "unclassified"
	},
	{
		name: "seasoned rice wine vinegar",
		department: "unclassified"
	},
	{
		name: "seasoned rice vinegar",
		department: "unclassified"
	},
	{
		name: "vanilla protein powder",
		department: "unclassified"
	},
	{
		name: "cacao nibs",
		department: "unclassified"
	},
	{
		name: "beef soup",
		department: "unclassified"
	},
	{
		name: "dried currants",
		department: "unclassified"
	},
	{
		name: "crisco",
		department: "unclassified"
	},
	{
		name: "bittersweet chocolate chips",
		department: "unclassified"
	},
	{
		name: "seedless cucumber",
		department: "unclassified"
	},
	{
		name: "coconut butter",
		department: "unclassified"
	},
	{
		name: "Ritz Crackers",
		department: "unclassified"
	},
	{
		name: "meatballs",
		department: "unclassified"
	},
	{
		name: "pork roast",
		department: "unclassified"
	},
	{
		name: "chunky salsa",
		department: "unclassified"
	},
	{
		name: "duck",
		department: "unclassified"
	},
	{
		name: "chickpea flour",
		department: "unclassified"
	},
	{
		name: "frozen orange juice concentrate",
		department: "unclassified"
	},
	{
		name: "lardons",
		department: "unclassified"
	},
	{
		name: "ciabatta",
		department: "unclassified"
	},
	{
		name: "anchovy paste",
		department: "unclassified"
	},
	{
		name: "low-fat cottage cheese",
		department: "unclassified"
	},
	{
		name: "cotija",
		department: "unclassified"
	},
	{
		name: "marmalade",
		department: "unclassified"
	},
	{
		name: "tuna steaks",
		department: "unclassified"
	},
	{
		name: "frozen mixed berries",
		department: "unclassified"
	},
	{
		name: "coarse kosher salt",
		department: "unclassified"
	},
	{
		name: "brats",
		department: "unclassified"
	},
	{
		name: "bratwursts",
		department: "unclassified"
	},
	{
		name: "butter oil",
		department: "unclassified"
	},
	{
		name: "wild mushrooms",
		department: "unclassified"
	},
	{
		name: "yellow food coloring",
		department: "unclassified"
	},
	{
		name: "tarragon leaves",
		department: "unclassified"
	},
	{
		name: "instant pudding & pie filling",
		department: "unclassified"
	},
	{
		name: "virgin olive oil",
		department: "unclassified"
	},
	{
		name: "pepperoni slices",
		department: "unclassified"
	},
	{
		name: "coconut aminos",
		department: "unclassified"
	},
	{
		name: "cheese tortellini",
		department: "unclassified"
	},
	{
		name: "dark corn syrup",
		department: "unclassified"
	},
	{
		name: "cream of celery soup",
		department: "unclassified"
	},
	{
		name: "cointreau",
		department: "unclassified"
	},
	{
		name: "round steaks",
		department: "unclassified"
	},
	{
		name: "roasted tomatoes",
		department: "unclassified"
	},
	{
		name: "fire roasted tomatoes",
		department: "unclassified"
	},
	{
		name: "chili oil",
		department: "unclassified"
	},
	{
		name: "frozen broccoli",
		department: "unclassified"
	},
	{
		name: "corn husks",
		department: "unclassified"
	},
	{
		name: "pizza crust",
		department: "unclassified"
	},
	{
		name: "white miso",
		department: "unclassified"
	},
	{
		name: "chili beans",
		department: "unclassified"
	},
	{
		name: "French bread loaves",
		department: "unclassified"
	},
	{
		name: "toasted almonds",
		department: "unclassified"
	},
	{
		name: "fingerling potatoes",
		department: "unclassified"
	},
	{
		name: "meat stock",
		department: "unclassified"
	},
	{
		name: "boiling potatoes",
		department: "unclassified"
	},
	{
		name: "wide noodles",
		department: "unclassified"
	},
	{
		name: "dried chile",
		department: "unclassified"
	},
	{
		name: "ground sirloin",
		department: "unclassified"
	},
	{
		name: "chicken meat",
		department: "unclassified"
	},
	{
		name: "clear honey",
		department: "unclassified"
	},
	{
		name: "canned black beans",
		department: "unclassified"
	},
	{
		name: "large marshmallows",
		department: "unclassified"
	},
	{
		name: "green lentil",
		department: "unclassified"
	},
	{
		name: "skirt steak",
		department: "unclassified"
	},
	{
		name: "baby bok choy",
		department: "unclassified"
	},
	{
		name: "chestnut mushrooms",
		department: "unclassified"
	},
	{
		name: "lean ground turkey",
		department: "unclassified"
	},
	{
		name: "roasted hazelnuts",
		department: "unclassified"
	},
	{
		name: "sweetened whipped cream",
		department: "unclassified"
	},
	{
		name: "safflower oil",
		department: "unclassified"
	},
	{
		name: "key lime juice",
		department: "unclassified"
	},
	{
		name: "cupcakes",
		department: "unclassified"
	},
	{
		name: "buffalo sauce",
		department: "unclassified"
	},
	{
		name: "flatbread",
		department: "unclassified"
	},
	{
		name: "flat bread",
		department: "unclassified"
	},
	{
		name: "dijon-style mustard",
		department: "unclassified"
	},
	{
		name: "cacao",
		department: "unclassified"
	},
	{
		name: "frozen hash brown potatoes",
		department: "unclassified"
	},
	{
		name: "vanilla powder",
		department: "unclassified"
	},
	{
		name: "mixed berries",
		department: "unclassified"
	},
	{
		name: "rib",
		department: "unclassified"
	},
	{
		name: "large potatoes",
		department: "unclassified"
	},
	{
		name: "fat free cream cheese",
		department: "unclassified"
	},
	{
		name: "sprouts",
		department: "unclassified"
	},
	{
		name: "french baguette",
		department: "unclassified"
	},
	{
		name: "peppermint",
		department: "unclassified"
	},
	{
		name: "breakfast sausages",
		department: "unclassified"
	},
	{
		name: "cherry juice",
		department: "unclassified"
	},
	{
		name: "golden delicious apples",
		department: "unclassified"
	},
	{
		name: "beef tenderloin",
		department: "unclassified"
	},
	{
		name: "Bisquick Baking Mix",
		department: "unclassified"
	},
	{
		name: "whole berry cranberry sauce",
		department: "unclassified"
	},
	{
		name: "low sodium chicken stock",
		department: "unclassified"
	},
	{
		name: "oat bran",
		department: "unclassified"
	},
	{
		name: "stout",
		department: "unclassified"
	},
	{
		name: "crushed pineapples in juice",
		department: "unclassified"
	},
	{
		name: "Baileys Irish Cream Liqueur",
		department: "unclassified"
	},
	{
		name: "gnocchi",
		department: "unclassified"
	},
	{
		name: "sandwiches",
		department: "unclassified"
	},
	{
		name: "sweet italian sausage",
		department: "unclassified"
	},
	{
		name: "manchego cheese",
		department: "unclassified"
	},
	{
		name: "manchego",
		department: "unclassified"
	},
	{
		name: "pepper flakes",
		department: "unclassified"
	},
	{
		name: "toasted slivered almonds",
		department: "unclassified"
	},
	{
		name: "halibut fillets",
		department: "unclassified"
	},
	{
		name: "deli ham",
		department: "unclassified"
	},
	{
		name: "red apples",
		department: "unclassified"
	},
	{
		name: "bouillon cube",
		department: "unclassified"
	},
	{
		name: "sparkling wine",
		department: "unclassified"
	},
	{
		name: "ear of corn",
		department: "unclassified"
	},
	{
		name: "kielbasa",
		department: "unclassified"
	},
	{
		name: "jello",
		department: "unclassified"
	},
	{
		name: "cake glaze",
		department: "unclassified"
	},
	{
		name: "arrowroot powder",
		department: "unclassified"
	},
	{
		name: "plantains",
		department: "unclassified"
	},
	{
		name: "peach slices",
		department: "unclassified"
	},
	{
		name: "dry roasted peanuts",
		department: "unclassified"
	},
	{
		name: "szechwan peppercorns",
		department: "unclassified"
	},
	{
		name: "sichuan peppercorns",
		department: "unclassified"
	},
	{
		name: "toasted coconut",
		department: "unclassified"
	},
	{
		name: "crispy rice cereal",
		department: "unclassified"
	},
	{
		name: "calvados",
		department: "unclassified"
	},
	{
		name: "pasta shells",
		department: "unclassified"
	},
	{
		name: "anise seed",
		department: "unclassified"
	},
	{
		name: "pork schnitzel",
		department: "unclassified"
	},
	{
		name: "sweet cherries",
		department: "unclassified"
	},
	{
		name: "Emmenthal",
		department: "unclassified"
	},
	{
		name: "Emmental",
		department: "unclassified"
	},
	{
		name: "emmentaler",
		department: "unclassified"
	},
	{
		name: "Emmenthaler",
		department: "unclassified"
	},
	{
		name: "rotel tomatoes",
		department: "unclassified"
	},
	{
		name: "allspice berries",
		department: "unclassified"
	},
	{
		name: "baking mix",
		department: "unclassified"
	},
	{
		name: "colby jack cheese",
		department: "unclassified"
	},
	{
		name: "flaked oats",
		department: "unclassified"
	},
	{
		name: "baby potatoes",
		department: "unclassified"
	},
	{
		name: "base",
		department: "unclassified"
	},
	{
		name: "Meyer lemons",
		department: "unclassified"
	},
	{
		name: "shaved parmesan cheese",
		department: "unclassified"
	},
	{
		name: "fenugreek seeds",
		department: "unclassified"
	},
	{
		name: "crumbled goat cheese",
		department: "unclassified"
	},
	{
		name: "orange flower water",
		department: "unclassified"
	},
	{
		name: "Cafe Boheme Liqueur",
		department: "unclassified"
	},
	{
		name: "Barritts Ginger Beer",
		department: "unclassified"
	},
	{
		name: "absolut mandrin",
		department: "unclassified"
	},
	{
		name: "minced garlic",
		department: "unclassified"
	},
	{
		name: "celery stalks",
		department: "unclassified"
	},
	{
		name: "pumpkin pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "ground turmeric",
		department: "unclassified"
	},
	{
		name: "cr\\u00E8me fra\\u00EEche",
		department: "unclassified"
	},
	{
		name: "tomato pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "nuts",
		department: "unclassified"
	},
	{
		name: "gruyere",
		department: "unclassified"
	},
	{
		name: "chili",
		department: "unclassified"
	},
	{
		name: "OREO\\u00AE Cookies",
		department: "unclassified"
	},
	{
		name: "flank steak",
		department: "unclassified"
	},
	{
		name: "prepared mustard",
		department: "unclassified"
	},
	{
		name: "cranberry juice",
		department: "unclassified"
	},
	{
		name: "fettuccine",
		department: "unclassified"
	},
	{
		name: "M&M's Candy",
		department: "unclassified"
	},
	{
		name: "triple sec",
		department: "unclassified"
	},
	{
		name: "lamb's lettuce",
		department: "unclassified"
	},
	{
		name: "Kellog's Rice Krispies",
		department: "unclassified"
	},
	{
		name: "champagne vinegar",
		department: "unclassified"
	},
	{
		name: "sheep\\u2019s milk cheese",
		department: "unclassified"
	},
	{
		name: "grated Gruy\\u00E8re cheese",
		department: "unclassified"
	},
	{
		name: "basil pesto",
		department: "unclassified"
	},
	{
		name: "poblano chiles",
		department: "unclassified"
	},
	{
		name: "cage free eggs",
		department: "unclassified"
	},
	{
		name: "orange blossom water",
		department: "unclassified"
	},
	{
		name: "chicken cutlets",
		department: "unclassified"
	},
	{
		name: "herb seasoning",
		department: "unclassified"
	},
	{
		name: "vegetable oil spray",
		department: "unclassified"
	},
	{
		name: "rum extract",
		department: "unclassified"
	},
	{
		name: "sherry wine vinegar",
		department: "unclassified"
	},
	{
		name: "custard",
		department: "unclassified"
	},
	{
		name: "lasagna sheets",
		department: "unclassified"
	},
	{
		name: "stir fry vegetable blend",
		department: "unclassified"
	},
	{
		name: "stir-fry vegetables",
		department: "unclassified"
	},
	{
		name: "taco sauce",
		department: "unclassified"
	},
	{
		name: "chocolate sauce",
		department: "unclassified"
	},
	{
		name: "dried mint",
		department: "unclassified"
	},
	{
		name: "white sesame seeds",
		department: "unclassified"
	},
	{
		name: "whole milk ricotta cheese",
		department: "unclassified"
	},
	{
		name: "soy",
		department: "unclassified"
	},
	{
		name: "butter beans",
		department: "unclassified"
	},
	{
		name: "dried mixed herbs",
		department: "unclassified"
	},
	{
		name: "soba noodles",
		department: "unclassified"
	},
	{
		name: "pico de gallo",
		department: "unclassified"
	},
	{
		name: "beef steak",
		department: "unclassified"
	},
	{
		name: "chocolate sprinkles",
		department: "unclassified"
	},
	{
		name: "honey mustard",
		department: "unclassified"
	},
	{
		name: "passion fruit",
		department: "unclassified"
	},
	{
		name: "beef short ribs",
		department: "unclassified"
	},
	{
		name: "green tomatoes",
		department: "unclassified"
	},
	{
		name: "Angostura bitters",
		department: "unclassified"
	},
	{
		name: "angostura",
		department: "unclassified"
	},
	{
		name: "tamarind paste",
		department: "unclassified"
	},
	{
		name: "brown lentils",
		department: "unclassified"
	},
	{
		name: "tangerine",
		department: "unclassified"
	},
	{
		name: "country bread",
		department: "unclassified"
	},
	{
		name: "vine tomatoes",
		department: "unclassified"
	},
	{
		name: "serrano chilies",
		department: "unclassified"
	},
	{
		name: "fresh yeast",
		department: "unclassified"
	},
	{
		name: "nonfat yogurt plain",
		department: "unclassified"
	},
	{
		name: "nonfat plain yogurt",
		department: "unclassified"
	},
	{
		name: "cream of coconut",
		department: "unclassified"
	},
	{
		name: "garden peas",
		department: "unclassified"
	},
	{
		name: "kirsch",
		department: "unclassified"
	},
	{
		name: "vermouth",
		department: "unclassified"
	},
	{
		name: "large cage free eggs",
		department: "unclassified"
	},
	{
		name: "white button mushrooms",
		department: "unclassified"
	},
	{
		name: "low sodium beef broth",
		department: "unclassified"
	},
	{
		name: "vanilla pudding mix",
		department: "unclassified"
	},
	{
		name: "farro",
		department: "unclassified"
	},
	{
		name: "fat-free chicken broth",
		department: "unclassified"
	},
	{
		name: "ground veal",
		department: "unclassified"
	},
	{
		name: "sumac",
		department: "unclassified"
	},
	{
		name: "hot dog bun",
		department: "unclassified"
	},
	{
		name: "red capsicum",
		department: "unclassified"
	},
	{
		name: "olive oil cooking spray",
		department: "unclassified"
	},
	{
		name: "lamb shoulder",
		department: "unclassified"
	},
	{
		name: "fresh lemon",
		department: "unclassified"
	},
	{
		name: "pineapple slices",
		department: "unclassified"
	},
	{
		name: "steel-cut oats",
		department: "unclassified"
	},
	{
		name: "lemon pepper seasoning",
		department: "unclassified"
	},
	{
		name: "rutabaga",
		department: "unclassified"
	},
	{
		name: "ginger syrup",
		department: "unclassified"
	},
	{
		name: "pomegranate molasses",
		department: "unclassified"
	},
	{
		name: "baby corn",
		department: "unclassified"
	},
	{
		name: "rub",
		department: "unclassified"
	},
	{
		name: "caramel ice cream topping",
		department: "unclassified"
	},
	{
		name: "hash brown",
		department: "unclassified"
	},
	{
		name: "pork butt",
		department: "unclassified"
	},
	{
		name: "baby greens",
		department: "unclassified"
	},
	{
		name: "honeydew melon",
		department: "unclassified"
	},
	{
		name: "devil's food cake mix",
		department: "unclassified"
	},
	{
		name: "anise",
		department: "unclassified"
	},
	{
		name: "firmly packed light brown sugar",
		department: "unclassified"
	},
	{
		name: "chuck",
		department: "unclassified"
	},
	{
		name: "candied ginger",
		department: "unclassified"
	},
	{
		name: "olive oil spray",
		department: "unclassified"
	},
	{
		name: "angel food cake",
		department: "unclassified"
	},
	{
		name: "orange slices",
		department: "unclassified"
	},
	{
		name: "black mustard seeds",
		department: "unclassified"
	},
	{
		name: "liquid stevia",
		department: "unclassified"
	},
	{
		name: "apple pie filling",
		department: "unclassified"
	},
	{
		name: "leaf lettuce",
		department: "unclassified"
	},
	{
		name: "whole almonds",
		department: "unclassified"
	},
	{
		name: "nonfat dry milk powder",
		department: "unclassified"
	},
	{
		name: "fresh bay leaves",
		department: "unclassified"
	},
	{
		name: "chicken bouillon granules",
		department: "unclassified"
	},
	{
		name: "dulce de leche",
		department: "unclassified"
	},
	{
		name: "white rice flour",
		department: "unclassified"
	},
	{
		name: "unsweetened vanilla almond milk",
		department: "unclassified"
	},
	{
		name: "soda water",
		department: "unclassified"
	},
	{
		name: "celery leaves",
		department: "unclassified"
	},
	{
		name: "candied orange peel",
		department: "unclassified"
	},
	{
		name: "corn chips",
		department: "unclassified"
	},
	{
		name: "pitas",
		department: "unclassified"
	},
	{
		name: "arrowroot",
		department: "unclassified"
	},
	{
		name: "soft goat cheese",
		department: "unclassified"
	},
	{
		name: "liquor",
		department: "unclassified"
	},
	{
		name: "grits",
		department: "unclassified"
	},
	{
		name: "pie dough",
		department: "unclassified"
	},
	{
		name: "navy beans",
		department: "unclassified"
	},
	{
		name: "vanilla frosting",
		department: "unclassified"
	},
	{
		name: "crumbles",
		department: "unclassified"
	},
	{
		name: "shelled pistachios",
		department: "unclassified"
	},
	{
		name: "hot Italian sausage",
		department: "unclassified"
	},
	{
		name: "chocolate frosting",
		department: "unclassified"
	},
	{
		name: "bosc pears",
		department: "unclassified"
	},
	{
		name: "turkey schnitzel",
		department: "unclassified"
	},
	{
		name: "red grapes",
		department: "unclassified"
	},
	{
		name: "red beans",
		department: "unclassified"
	},
	{
		name: "rotelle",
		department: "unclassified"
	},
	{
		name: "rice vermicelli",
		department: "unclassified"
	},
	{
		name: "Maggi",
		department: "unclassified"
	},
	{
		name: "Maggi Seasoning",
		department: "unclassified"
	},
	{
		name: "Maggi Seasoning Sauce",
		department: "unclassified"
	},
	{
		name: "apple butter",
		department: "unclassified"
	},
	{
		name: "grated Monterey Jack cheese",
		department: "unclassified"
	},
	{
		name: "tortellini",
		department: "unclassified"
	},
	{
		name: "pork ribs",
		department: "unclassified"
	},
	{
		name: "candy melts",
		department: "unclassified"
	},
	{
		name: "roasted red peppers, drained",
		department: "unclassified"
	},
	{
		name: "beef fillet",
		department: "unclassified"
	},
	{
		name: "frozen whole kernel corn",
		department: "unclassified"
	},
	{
		name: "smoked gouda",
		department: "unclassified"
	},
	{
		name: "miso",
		department: "unclassified"
	},
	{
		name: "nori",
		department: "unclassified"
	},
	{
		name: "fresh peas",
		department: "unclassified"
	},
	{
		name: "grape juice",
		department: "unclassified"
	},
	{
		name: "dried minced onion",
		department: "unclassified"
	},
	{
		name: "whiting",
		department: "unclassified"
	},
	{
		name: "lamb chops",
		department: "unclassified"
	},
	{
		name: "pastry shell",
		department: "unclassified"
	},
	{
		name: "chicken soup",
		department: "unclassified"
	},
	{
		name: "processed cheese",
		department: "unclassified"
	},
	{
		name: "seedless red grapes",
		department: "unclassified"
	},
	{
		name: "steak seasoning",
		department: "unclassified"
	},
	{
		name: "dried red chile peppers",
		department: "unclassified"
	},
	{
		name: "dried basil leaves",
		department: "unclassified"
	},
	{
		name: "fire roasted diced tomatoes",
		department: "unclassified"
	},
	{
		name: "canadian bacon",
		department: "unclassified"
	},
	{
		name: "lacinato kale",
		department: "unclassified"
	},
	{
		name: "pepper cheese",
		department: "unclassified"
	},
	{
		name: "green cardamom",
		department: "unclassified"
	},
	{
		name: "whole wheat breadcrumbs",
		department: "unclassified"
	},
	{
		name: "Madeira",
		department: "unclassified"
	},
	{
		name: "vine ripened tomatoes",
		department: "unclassified"
	},
	{
		name: "ciabatta bread",
		department: "unclassified"
	},
	{
		name: "gala apples",
		department: "unclassified"
	},
	{
		name: "idaho potatoes",
		department: "unclassified"
	},
	{
		name: "kiwi fruits",
		department: "unclassified"
	},
	{
		name: "malt vinegar",
		department: "unclassified"
	},
	{
		name: "sanding sugar",
		department: "unclassified"
	},
	{
		name: "buttercream frosting",
		department: "unclassified"
	},
	{
		name: "sambal ulek",
		department: "unclassified"
	},
	{
		name: "sambal oelek",
		department: "unclassified"
	},
	{
		name: "samba oelek",
		department: "unclassified"
	},
	{
		name: "chocolate ice cream",
		department: "unclassified"
	},
	{
		name: "taco shells",
		department: "unclassified"
	},
	{
		name: "string beans",
		department: "unclassified"
	},
	{
		name: "cut beans",
		department: "unclassified"
	},
	{
		name: "low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "low fat yoghurt",
		department: "unclassified"
	},
	{
		name: "Anaheim chile",
		department: "unclassified"
	},
	{
		name: "wheat bran",
		department: "unclassified"
	},
	{
		name: "chocolate candy",
		department: "unclassified"
	},
	{
		name: "cornichons",
		department: "unclassified"
	},
	{
		name: "reduced fat mayonnaise",
		department: "unclassified"
	},
	{
		name: "toffee bits",
		department: "unclassified"
	},
	{
		name: "trout fillet",
		department: "unclassified"
	},
	{
		name: "lime rind",
		department: "unclassified"
	},
	{
		name: "muffin",
		department: "unclassified"
	},
	{
		name: "sliced ham",
		department: "unclassified"
	},
	{
		name: "pudding",
		department: "unclassified"
	},
	{
		name: "vermicelli",
		department: "unclassified"
	},
	{
		name: "dried shiitake mushrooms",
		department: "unclassified"
	},
	{
		name: "cooking apples",
		department: "unclassified"
	},
	{
		name: "italian salad dressing mix",
		department: "unclassified"
	},
	{
		name: "clementines",
		department: "unclassified"
	},
	{
		name: "dark molasses",
		department: "unclassified"
	},
	{
		name: "Boston lettuce",
		department: "unclassified"
	},
	{
		name: "Boston Bibb lettuce",
		department: "unclassified"
	},
	{
		name: "semolina flour",
		department: "unclassified"
	},
	{
		name: "durum wheat semolina",
		department: "unclassified"
	},
	{
		name: "sugar syrup",
		department: "unclassified"
	},
	{
		name: "broccoli rabe",
		department: "unclassified"
	},
	{
		name: "splenda",
		department: "unclassified"
	},
	{
		name: "rabbit",
		department: "unclassified"
	},
	{
		name: "sorghum flour",
		department: "unclassified"
	},
	{
		name: "lima beans",
		department: "unclassified"
	},
	{
		name: "whole chicken",
		department: "unclassified"
	},
	{
		name: "refrigerated biscuits",
		department: "unclassified"
	},
	{
		name: "Mexican style cheese",
		department: "unclassified"
	},
	{
		name: "raspberry vinegar",
		department: "unclassified"
	},
	{
		name: "sliced cucumber",
		department: "unclassified"
	},
	{
		name: "Belgian endive",
		department: "unclassified"
	},
	{
		name: "prosecco",
		department: "unclassified"
	},
	{
		name: "Neufch\\u00E2tel",
		department: "unclassified"
	},
	{
		name: "neufchatel cheese",
		department: "unclassified"
	},
	{
		name: "wide egg noodles",
		department: "unclassified"
	},
	{
		name: "orange juice concentrate",
		department: "unclassified"
	},
	{
		name: "instant rice",
		department: "unclassified"
	},
	{
		name: "coarse sugar",
		department: "unclassified"
	},
	{
		name: "truffle oil",
		department: "unclassified"
	},
	{
		name: "rice paper",
		department: "unclassified"
	},
	{
		name: "rice paper wrappers",
		department: "unclassified"
	},
	{
		name: "caesar salad dressing",
		department: "unclassified"
	},
	{
		name: "vegan mayonnaise",
		department: "unclassified"
	},
	{
		name: "stew meat",
		department: "unclassified"
	},
	{
		name: "apricot halves",
		department: "unclassified"
	},
	{
		name: "trout",
		department: "unclassified"
	},
	{
		name: "steamed rice",
		department: "unclassified"
	},
	{
		name: "pitted olives",
		department: "unclassified"
	},
	{
		name: "romaine lettuce leaves",
		department: "unclassified"
	},
	{
		name: "broccolini",
		department: "unclassified"
	},
	{
		name: "ground turkey breast",
		department: "unclassified"
	},
	{
		name: "bacon fat",
		department: "unclassified"
	},
	{
		name: "bone in chicken thighs",
		department: "unclassified"
	},
	{
		name: "Marshmallow Fluff",
		department: "unclassified"
	},
	{
		name: "stevia extract",
		department: "unclassified"
	},
	{
		name: "matzo meal",
		department: "unclassified"
	},
	{
		name: "matzoh meal",
		department: "unclassified"
	},
	{
		name: "picante sauce",
		department: "unclassified"
	},
	{
		name: "dipping sauce",
		department: "unclassified"
	},
	{
		name: "boneless chicken thighs",
		department: "unclassified"
	},
	{
		name: "matcha green tea powder",
		department: "unclassified"
	},
	{
		name: "raspberry preserves",
		department: "unclassified"
	},
	{
		name: "frisee",
		department: "unclassified"
	},
	{
		name: "loin pork roast",
		department: "unclassified"
	},
	{
		name: "cola",
		department: "unclassified"
	},
	{
		name: "cornbread",
		department: "unclassified"
	},
	{
		name: "apple pie spice",
		department: "unclassified"
	},
	{
		name: "grated romano cheese",
		department: "unclassified"
	},
	{
		name: "cubed ham",
		department: "unclassified"
	},
	{
		name: "nut butter",
		department: "unclassified"
	},
	{
		name: "dried lentils",
		department: "unclassified"
	},
	{
		name: "preserves",
		department: "unclassified"
	},
	{
		name: "pepper sauce",
		department: "unclassified"
	},
	{
		name: "masa harina",
		department: "unclassified"
	},
	{
		name: "custard powder",
		department: "unclassified"
	},
	{
		name: "vanilla pudding",
		department: "unclassified"
	},
	{
		name: "balsamic reduction",
		department: "unclassified"
	},
	{
		name: "balsamic glaze",
		department: "unclassified"
	},
	{
		name: "potato flour",
		department: "unclassified"
	},
	{
		name: "spiced rum",
		department: "unclassified"
	},
	{
		name: "pickle juice",
		department: "unclassified"
	},
	{
		name: "mushroom caps",
		department: "unclassified"
	},
	{
		name: "caramel topping",
		department: "unclassified"
	},
	{
		name: "white asparagus",
		department: "unclassified"
	},
	{
		name: "brownies",
		department: "unclassified"
	},
	{
		name: "roasted cashews",
		department: "unclassified"
	},
	{
		name: "leaf parsley",
		department: "unclassified"
	},
	{
		name: "Craisins",
		department: "unclassified"
	},
	{
		name: "camembert",
		department: "unclassified"
	},
	{
		name: "Camenbert",
		department: "unclassified"
	},
	{
		name: "yellow mustard seeds",
		department: "unclassified"
	},
	{
		name: "asian fish sauce",
		department: "unclassified"
	},
	{
		name: "kimchi",
		department: "unclassified"
	},
	{
		name: "plain whole-milk yogurt",
		department: "unclassified"
	},
	{
		name: "green bell pepper, sliced",
		department: "unclassified"
	},
	{
		name: "crumbled gorgonzola",
		department: "unclassified"
	},
	{
		name: "porridge oats",
		department: "unclassified"
	},
	{
		name: "paneer",
		department: "unclassified"
	},
	{
		name: "cardamom seeds",
		department: "unclassified"
	},
	{
		name: "cornflakes",
		department: "unclassified"
	},
	{
		name: "littleneck clams",
		department: "unclassified"
	},
	{
		name: "nonfat evaporated milk",
		department: "unclassified"
	},
	{
		name: "fat-free evaporated milk",
		department: "unclassified"
	},
	{
		name: "fat-free mayonnaise",
		department: "unclassified"
	},
	{
		name: "whitefish",
		department: "unclassified"
	},
	{
		name: "schnapps",
		department: "unclassified"
	},
	{
		name: "chopped hazelnuts",
		department: "unclassified"
	},
	{
		name: "hash brown potatoes",
		department: "unclassified"
	},
	{
		name: "bitters",
		department: "unclassified"
	},
	{
		name: "venison",
		department: "unclassified"
	},
	{
		name: "chicken sausage",
		department: "unclassified"
	},
	{
		name: "seedless raspberry jam",
		department: "unclassified"
	},
	{
		name: "broad beans",
		department: "unclassified"
	},
	{
		name: "blue cheese dressing",
		department: "unclassified"
	},
	{
		name: "vegetable bouillon",
		department: "unclassified"
	},
	{
		name: "mung bean sprouts",
		department: "unclassified"
	},
	{
		name: "croissants",
		department: "unclassified"
	},
	{
		name: "burger buns",
		department: "unclassified"
	},
	{
		name: "fish broth",
		department: "unclassified"
	},
	{
		name: "chow mein noodles",
		department: "unclassified"
	},
	{
		name: "sourdough starter",
		department: "unclassified"
	},
	{
		name: "orecchiette",
		department: "unclassified"
	},
	{
		name: "orecchiette noodles",
		department: "unclassified"
	},
	{
		name: "fettuccine pasta",
		department: "unclassified"
	},
	{
		name: "Chex Cereal",
		department: "unclassified"
	},
	{
		name: "lemon-lime soda",
		department: "unclassified"
	},
	{
		name: "masala",
		department: "unclassified"
	},
	{
		name: "preserved lemon",
		department: "unclassified"
	},
	{
		name: "salmon steaks",
		department: "unclassified"
	},
	{
		name: "kaiser rolls",
		department: "unclassified"
	},
	{
		name: "fat free half and half",
		department: "unclassified"
	},
	{
		name: "pickling spices",
		department: "unclassified"
	},
	{
		name: "small tomatoes",
		department: "unclassified"
	},
	{
		name: "veal stock",
		department: "unclassified"
	},
	{
		name: "pitted green olives",
		department: "unclassified"
	},
	{
		name: "urad dal",
		department: "unclassified"
	},
	{
		name: "cashew butter",
		department: "unclassified"
	},
	{
		name: "bouquet garni",
		department: "unclassified"
	},
	{
		name: "peeled tomatoes",
		department: "unclassified"
	},
	{
		name: "frozen lemonade concentrate",
		department: "unclassified"
	},
	{
		name: "catfish fillets",
		department: "unclassified"
	},
	{
		name: "green grapes",
		department: "unclassified"
	},
	{
		name: "semisweet baking chocolate",
		department: "unclassified"
	},
	{
		name: "gram flour",
		department: "unclassified"
	},
	{
		name: "besan",
		department: "unclassified"
	},
	{
		name: "cheese slices",
		department: "unclassified"
	},
	{
		name: "dinner rolls",
		department: "unclassified"
	},
	{
		name: "strawberry preserves",
		department: "unclassified"
	},
	{
		name: "mature cheddar",
		department: "unclassified"
	},
	{
		name: "seaweed",
		department: "unclassified"
	},
	{
		name: "challa",
		department: "unclassified"
	},
	{
		name: "challah",
		department: "unclassified"
	},
	{
		name: "fresh shiitake mushrooms",
		department: "unclassified"
	},
	{
		name: "fudge",
		department: "unclassified"
	},
	{
		name: "rock salt",
		department: "unclassified"
	},
	{
		name: "reduced fat milk",
		department: "unclassified"
	},
	{
		name: "hard cheese",
		department: "unclassified"
	},
	{
		name: "pork and beans",
		department: "unclassified"
	},
	{
		name: "whisky",
		department: "unclassified"
	},
	{
		name: "Guinness Beer",
		department: "unclassified"
	},
	{
		name: "guinness",
		department: "unclassified"
	},
	{
		name: "diced tomatoes in juice",
		department: "unclassified"
	},
	{
		name: "chocolate morsels",
		department: "unclassified"
	},
	{
		name: "wasabi paste",
		department: "unclassified"
	},
	{
		name: "corn-on-the-cob",
		department: "unclassified"
	},
	{
		name: "plain low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "cutlet",
		department: "unclassified"
	},
	{
		name: "coconut rum",
		department: "unclassified"
	},
	{
		name: "red leaf lettuce",
		department: "unclassified"
	},
	{
		name: "red beets",
		department: "unclassified"
	},
	{
		name: "wasabi",
		department: "unclassified"
	},
	{
		name: "top sirloin steak",
		department: "unclassified"
	},
	{
		name: "naan",
		department: "unclassified"
	},
	{
		name: "pastry dough",
		department: "unclassified"
	},
	{
		name: "pepperoncini",
		department: "unclassified"
	},
	{
		name: "kumquats",
		department: "unclassified"
	},
	{
		name: "sweet vermouth",
		department: "unclassified"
	},
	{
		name: "salad cream",
		department: "unclassified"
	},
	{
		name: "small carrots",
		department: "unclassified"
	},
	{
		name: "grass-fed butter",
		department: "unclassified"
	},
	{
		name: "jaggery",
		department: "unclassified"
	},
	{
		name: "chipotle",
		department: "unclassified"
	},
	{
		name: "pancake mix",
		department: "unclassified"
	},
	{
		name: "meringue",
		department: "unclassified"
	},
	{
		name: "beaten egg whites",
		department: "unclassified"
	},
	{
		name: "cornbread mix",
		department: "unclassified"
	},
	{
		name: "canola",
		department: "unclassified"
	},
	{
		name: "pancake",
		department: "unclassified"
	},
	{
		name: "pastry flour",
		department: "unclassified"
	},
	{
		name: "smoked ham",
		department: "unclassified"
	},
	{
		name: "goji berries",
		department: "unclassified"
	},
	{
		name: "lamb shanks",
		department: "unclassified"
	},
	{
		name: "whitefish fillets",
		department: "unclassified"
	},
	{
		name: "pickled onion",
		department: "unclassified"
	},
	{
		name: "oven-ready lasagna noodles",
		department: "unclassified"
	},
	{
		name: "no bake lasagna noodles",
		department: "unclassified"
	},
	{
		name: "grated chocolate",
		department: "unclassified"
	},
	{
		name: "chocolate curls",
		department: "unclassified"
	},
	{
		name: "tarragon vinegar",
		department: "unclassified"
	},
	{
		name: "brown rice syrup",
		department: "unclassified"
	},
	{
		name: "diced tomatoes and green chilies",
		department: "unclassified"
	},
	{
		name: "banana peppers",
		department: "unclassified"
	},
	{
		name: "imitation crab meat",
		department: "unclassified"
	},
	{
		name: "imitation crabmeat",
		department: "unclassified"
	},
	{
		name: "ground round",
		department: "unclassified"
	},
	{
		name: "hoagie rolls",
		department: "unclassified"
	},
	{
		name: "gari",
		department: "unclassified"
	},
	{
		name: "homemade chicken stock",
		department: "unclassified"
	},
	{
		name: "short-grain rice",
		department: "unclassified"
	},
	{
		name: "bird chile",
		department: "unclassified"
	},
	{
		name: "Bird's eye chili",
		department: "unclassified"
	},
	{
		name: "msg",
		department: "unclassified"
	},
	{
		name: "monosodium glutamate",
		department: "unclassified"
	},
	{
		name: "halibut",
		department: "unclassified"
	},
	{
		name: "candied lemon peel",
		department: "unclassified"
	},
	{
		name: "bay scallops",
		department: "unclassified"
	},
	{
		name: "bacon drippings",
		department: "unclassified"
	},
	{
		name: "grated pecorino",
		department: "unclassified"
	},
	{
		name: "tart",
		department: "unclassified"
	},
	{
		name: "pickled jalapenos",
		department: "unclassified"
	},
	{
		name: "roasted almonds",
		department: "unclassified"
	},
	{
		name: "coleslaw",
		department: "unclassified"
	},
	{
		name: "caviar",
		department: "unclassified"
	},
	{
		name: "bacon grease",
		department: "unclassified"
	},
	{
		name: "cooking wine",
		department: "unclassified"
	},
	{
		name: "brine",
		department: "unclassified"
	},
	{
		name: "waxy potatoes",
		department: "unclassified"
	},
	{
		name: "florets",
		department: "unclassified"
	},
	{
		name: "green leaf lettuce",
		department: "unclassified"
	},
	{
		name: "sliced apple",
		department: "unclassified"
	},
	{
		name: "ground meat",
		department: "unclassified"
	},
	{
		name: "sauce mix",
		department: "unclassified"
	},
	{
		name: "sauce powder",
		department: "unclassified"
	},
	{
		name: "sprite",
		department: "unclassified"
	},
	{
		name: "sushi rice",
		department: "unclassified"
	},
	{
		name: "chili pepper flakes",
		department: "unclassified"
	},
	{
		name: "salt water",
		department: "unclassified"
	},
	{
		name: "fava beans",
		department: "unclassified"
	},
	{
		name: "portobello caps",
		department: "unclassified"
	},
	{
		name: "balsamic vinaigrette",
		department: "unclassified"
	},
	{
		name: "pumpkinseed oil",
		department: "unclassified"
	},
	{
		name: "shrimp paste",
		department: "unclassified"
	},
	{
		name: "pumpkin flesh",
		department: "unclassified"
	},
	{
		name: "pork lard",
		department: "unclassified"
	},
	{
		name: "mixed dried fruit",
		department: "unclassified"
	},
	{
		name: "vanilla flavoring",
		department: "unclassified"
	},
	{
		name: "cinnamon candy canes",
		department: "unclassified"
	},
	{
		name: "amaretto liqueur",
		department: "unclassified"
	},
	{
		name: "bibb lettuce",
		department: "unclassified"
	},
	{
		name: "liquid honey",
		department: "unclassified"
	},
	{
		name: "sharp white cheddar cheese",
		department: "unclassified"
	},
	{
		name: "brioche",
		department: "unclassified"
	},
	{
		name: "truffles",
		department: "unclassified"
	},
	{
		name: "dashi",
		department: "unclassified"
	},
	{
		name: "Italian herbs",
		department: "unclassified"
	},
	{
		name: "lime leaves",
		department: "unclassified"
	},
	{
		name: "ginger beer",
		department: "unclassified"
	},
	{
		name: "gingerbread seasoning",
		department: "unclassified"
	},
	{
		name: "dill tips",
		department: "unclassified"
	},
	{
		name: "low-fat vanilla yogurt",
		department: "unclassified"
	},
	{
		name: "vegetable bouillon cube",
		department: "unclassified"
	},
	{
		name: "vegetable soup cubes",
		department: "unclassified"
	},
	{
		name: "vegetable broth cubes",
		department: "unclassified"
	},
	{
		name: "refrigerated buttermilk biscuits",
		department: "unclassified"
	},
	{
		name: "buttermilk biscuit dough",
		department: "unclassified"
	},
	{
		name: "unsalted cashews",
		department: "unclassified"
	},
	{
		name: "persian cucumber",
		department: "unclassified"
	},
	{
		name: "chocolate wafer",
		department: "unclassified"
	},
	{
		name: "candy sprinkles",
		department: "unclassified"
	},
	{
		name: "peach schnapps",
		department: "unclassified"
	},
	{
		name: "gold potatoes",
		department: "unclassified"
	},
	{
		name: "yellow potatoes",
		department: "unclassified"
	},
	{
		name: "bran",
		department: "unclassified"
	},
	{
		name: "sucanat",
		department: "unclassified"
	},
	{
		name: "Irish whiskey",
		department: "unclassified"
	},
	{
		name: "decorating sugars",
		department: "unclassified"
	},
	{
		name: "decorators sugar",
		department: "unclassified"
	},
	{
		name: "crystal sprinkles",
		department: "unclassified"
	},
	{
		name: "colored sugar",
		department: "unclassified"
	},
	{
		name: "amchur",
		department: "unclassified"
	},
	{
		name: "green mango powder",
		department: "unclassified"
	},
	{
		name: "dried mango powder",
		department: "unclassified"
	},
	{
		name: "amchoor",
		department: "unclassified"
	},
	{
		name: "chinese rice wine",
		department: "unclassified"
	},
	{
		name: "quick rolled oats",
		department: "unclassified"
	},
	{
		name: "popped popcorn",
		department: "unclassified"
	},
	{
		name: "minute rice",
		department: "unclassified"
	},
	{
		name: "jumbo pasta shells",
		department: "unclassified"
	},
	{
		name: "adobo",
		department: "unclassified"
	},
	{
		name: "lime peel",
		department: "unclassified"
	},
	{
		name: "fat free greek yogurt",
		department: "unclassified"
	},
	{
		name: "coca-cola",
		department: "unclassified"
	},
	{
		name: "Thai fish sauce",
		department: "unclassified"
	},
	{
		name: "I Can't Believe It's Not Butter!\\u00AE Spread",
		department: "unclassified"
	},
	{
		name: "dried chickpeas",
		department: "unclassified"
	},
	{
		name: "dried garbanzo beans",
		department: "unclassified"
	},
	{
		name: "colby cheese",
		department: "unclassified"
	},
	{
		name: "colby",
		department: "unclassified"
	},
	{
		name: "artificial sweetener",
		department: "unclassified"
	},
	{
		name: "shredded pepper jack cheese",
		department: "unclassified"
	},
	{
		name: "pretzel sticks",
		department: "unclassified"
	},
	{
		name: "diced ham",
		department: "unclassified"
	},
	{
		name: "whole wheat spaghetti",
		department: "unclassified"
	},
	{
		name: "kefir",
		department: "unclassified"
	},
	{
		name: "glace cherries",
		department: "unclassified"
	},
	{
		name: "fresh lime",
		department: "unclassified"
	},
	{
		name: "whey",
		department: "unclassified"
	},
	{
		name: "whipped cream cheese",
		department: "unclassified"
	},
	{
		name: "unsweetened baking chocolate",
		department: "unclassified"
	},
	{
		name: "mushroom soup",
		department: "unclassified"
	},
	{
		name: "twists",
		department: "unclassified"
	},
	{
		name: "whole grain dijon mustard",
		department: "unclassified"
	},
	{
		name: "sweet pickle relish",
		department: "unclassified"
	},
	{
		name: "refrigerated pizza dough",
		department: "unclassified"
	},
	{
		name: "dumplings",
		department: "unclassified"
	},
	{
		name: "skinless salmon fillets",
		department: "unclassified"
	},
	{
		name: "white peppercorns",
		department: "unclassified"
	},
	{
		name: "plain chocolate",
		department: "unclassified"
	},
	{
		name: "red currant jelly",
		department: "unclassified"
	},
	{
		name: "rose petals",
		department: "unclassified"
	},
	{
		name: "spanish paprika",
		department: "unclassified"
	},
	{
		name: "waffle",
		department: "unclassified"
	},
	{
		name: "coffee creamer",
		department: "unclassified"
	},
	{
		name: "gluten-free oats",
		department: "unclassified"
	},
	{
		name: "biscuit mix",
		department: "unclassified"
	},
	{
		name: "limoncello",
		department: "unclassified"
	},
	{
		name: "creole mustard",
		department: "unclassified"
	},
	{
		name: "peanut butter cups",
		department: "unclassified"
	},
	{
		name: "hominy",
		department: "unclassified"
	},
	{
		name: "vanilla vodka",
		department: "unclassified"
	},
	{
		name: "campari",
		department: "unclassified"
	},
	{
		name: "coconut fat",
		department: "unclassified"
	},
	{
		name: "rump steak",
		department: "unclassified"
	},
	{
		name: "orange segments",
		department: "unclassified"
	},
	{
		name: "orange slice",
		department: "unclassified"
	},
	{
		name: "beef bouillon granules",
		department: "unclassified"
	},
	{
		name: "root beer",
		department: "unclassified"
	},
	{
		name: "creme de cacao",
		department: "unclassified"
	},
	{
		name: "mixed mushrooms",
		department: "unclassified"
	},
	{
		name: "coffee beans",
		department: "unclassified"
	},
	{
		name: "green tea",
		department: "unclassified"
	},
	{
		name: "king prawns",
		department: "unclassified"
	},
	{
		name: "thousand island dressing",
		department: "unclassified"
	},
	{
		name: "frying oil",
		department: "unclassified"
	},
	{
		name: "maple sugar",
		department: "unclassified"
	},
	{
		name: "creamed coconut",
		department: "unclassified"
	},
	{
		name: "ganache",
		department: "unclassified"
	},
	{
		name: "boneless chicken",
		department: "unclassified"
	},
	{
		name: "salt pork",
		department: "unclassified"
	},
	{
		name: "shredded reduced fat cheddar cheese",
		department: "unclassified"
	},
	{
		name: "Boursin",
		department: "unclassified"
	},
	{
		name: "wheat bread",
		department: "unclassified"
	},
	{
		name: "baby back ribs",
		department: "unclassified"
	},
	{
		name: "sherbet",
		department: "unclassified"
	},
	{
		name: "spareribs",
		department: "unclassified"
	},
	{
		name: "quick-cooking tapioca",
		department: "unclassified"
	},
	{
		name: "hollandaise sauce",
		department: "unclassified"
	},
	{
		name: "pea shoots",
		department: "unclassified"
	},
	{
		name: "split peas",
		department: "unclassified"
	},
	{
		name: "tahini paste",
		department: "unclassified"
	},
	{
		name: "bread dough",
		department: "unclassified"
	},
	{
		name: "tortilla wraps",
		department: "unclassified"
	},
	{
		name: "tamarind",
		department: "unclassified"
	},
	{
		name: "baby kale",
		department: "unclassified"
	},
	{
		name: "digestive biscuit",
		department: "unclassified"
	},
	{
		name: "muenster cheese",
		department: "unclassified"
	},
	{
		name: "unsalted pistachios",
		department: "unclassified"
	},
	{
		name: "rack of lamb",
		department: "unclassified"
	},
	{
		name: "spring roll wrappers",
		department: "unclassified"
	},
	{
		name: "vital wheat gluten",
		department: "unclassified"
	},
	{
		name: "sweet rice flour",
		department: "unclassified"
	},
	{
		name: "popsicle",
		department: "unclassified"
	},
	{
		name: "seafood seasoning",
		department: "unclassified"
	},
	{
		name: "lemon cake mix",
		department: "unclassified"
	},
	{
		name: "gingersnap",
		department: "unclassified"
	},
	{
		name: "vegan chocolate chips",
		department: "unclassified"
	},
	{
		name: "loin",
		department: "unclassified"
	},
	{
		name: "quinces",
		department: "unclassified"
	},
	{
		name: "ground walnuts",
		department: "unclassified"
	},
	{
		name: "lobster meat",
		department: "unclassified"
	},
	{
		name: "blackstrap molasses",
		department: "unclassified"
	},
	{
		name: "green pesto",
		department: "unclassified"
	},
	{
		name: "candy corn",
		department: "unclassified"
	},
	{
		name: "beef sausage",
		department: "unclassified"
	},
	{
		name: "sweet mini bells",
		department: "unclassified"
	},
	{
		name: "baby bell peppers",
		department: "unclassified"
	},
	{
		name: "mini sweet peppers",
		department: "unclassified"
	},
	{
		name: "red enchilada sauce",
		department: "unclassified"
	},
	{
		name: "dill seed",
		department: "unclassified"
	},
	{
		name: "citric acid",
		department: "unclassified"
	},
	{
		name: "bone-in pork chops",
		department: "unclassified"
	},
	{
		name: "chile de arbol",
		department: "unclassified"
	},
	{
		name: "za'atar",
		department: "unclassified"
	},
	{
		name: "zatar",
		department: "unclassified"
	},
	{
		name: "baking apples",
		department: "unclassified"
	},
	{
		name: "day old bread",
		department: "unclassified"
	},
	{
		name: "green peppercorns",
		department: "unclassified"
	},
	{
		name: "sponge cake",
		department: "unclassified"
	},
	{
		name: "pearl couscous",
		department: "unclassified"
	},
	{
		name: "crepes",
		department: "unclassified"
	},
	{
		name: "unsalted chicken stock",
		department: "unclassified"
	},
	{
		name: "low-fat cheddar cheese",
		department: "unclassified"
	},
	{
		name: "pickling salt",
		department: "unclassified"
	},
	{
		name: "pitted Medjool dates",
		department: "unclassified"
	},
	{
		name: "italian tomatoes",
		department: "unclassified"
	},
	{
		name: "lavender",
		department: "unclassified"
	},
	{
		name: "glass noodles",
		department: "unclassified"
	},
	{
		name: "cellophane noodles",
		department: "unclassified"
	},
	{
		name: "ros\\u00E9 wine",
		department: "unclassified"
	},
	{
		name: "lamb stock",
		department: "unclassified"
	},
	{
		name: "oregano leaves",
		department: "unclassified"
	},
	{
		name: "sorbet",
		department: "unclassified"
	},
	{
		name: "chocolate wafer cookies",
		department: "unclassified"
	},
	{
		name: "trassi",
		department: "unclassified"
	},
	{
		name: "beef tenderloin steaks",
		department: "unclassified"
	},
	{
		name: "porcini",
		department: "unclassified"
	},
	{
		name: "porcini mushrooms",
		department: "unclassified"
	},
	{
		name: "onion tops",
		department: "unclassified"
	},
	{
		name: "greek seasoning",
		department: "unclassified"
	},
	{
		name: "crushed graham crackers",
		department: "unclassified"
	},
	{
		name: "frozen cherries",
		department: "unclassified"
	},
	{
		name: "turkey sausage",
		department: "unclassified"
	},
	{
		name: "seltzer water",
		department: "unclassified"
	},
	{
		name: "sesame",
		department: "unclassified"
	},
	{
		name: "golden beets",
		department: "unclassified"
	},
	{
		name: "mild curry powder",
		department: "unclassified"
	},
	{
		name: "lemon thyme",
		department: "unclassified"
	},
	{
		name: "psyllium husks",
		department: "unclassified"
	},
	{
		name: "japanese eggplants",
		department: "unclassified"
	},
	{
		name: "liver",
		department: "unclassified"
	},
	{
		name: "Frangelico",
		department: "unclassified"
	},
	{
		name: "Frangelico Liqueur",
		department: "unclassified"
	},
	{
		name: "horseradish sauce",
		department: "unclassified"
	},
	{
		name: "ham hock",
		department: "unclassified"
	},
	{
		name: "ground thyme",
		department: "unclassified"
	},
	{
		name: "herring",
		department: "unclassified"
	},
	{
		name: "pork spareribs",
		department: "unclassified"
	},
	{
		name: "chicken breast tenders",
		department: "unclassified"
	},
	{
		name: "light molasses",
		department: "unclassified"
	},
	{
		name: "agar",
		department: "unclassified"
	},
	{
		name: "sweet basil",
		department: "unclassified"
	},
	{
		name: "italian plum tomatoes",
		department: "unclassified"
	},
	{
		name: "fajita seasoning mix",
		department: "unclassified"
	},
	{
		name: "chicken base",
		department: "unclassified"
	},
	{
		name: "cardamon",
		department: "unclassified"
	},
	{
		name: "parsley root",
		department: "unclassified"
	},
	{
		name: "wheels",
		department: "unclassified"
	},
	{
		name: "sour milk",
		department: "unclassified"
	},
	{
		name: "sourdough",
		department: "unclassified"
	},
	{
		name: "sour dough",
		department: "unclassified"
	},
	{
		name: "dried apple",
		department: "unclassified"
	},
	{
		name: "beef gravy",
		department: "unclassified"
	},
	{
		name: "roast beef sauce",
		department: "unclassified"
	},
	{
		name: "chocolate-hazelnut spread",
		department: "unclassified"
	},
	{
		name: "arrowroot starch",
		department: "unclassified"
	},
	{
		name: "yellow summer squash",
		department: "unclassified"
	},
	{
		name: "whipped cream stabilizer",
		department: "unclassified"
	},
	{
		name: "cream stabilizer",
		department: "unclassified"
	},
	{
		name: "cream thickener",
		department: "unclassified"
	},
	{
		name: "apple jelly",
		department: "unclassified"
	},
	{
		name: "pernod",
		department: "unclassified"
	},
	{
		name: "aioli",
		department: "unclassified"
	},
	{
		name: "Earth Balance Buttery Spread",
		department: "unclassified"
	},
	{
		name: "five-spice powder",
		department: "unclassified"
	},
	{
		name: "small potatoes",
		department: "unclassified"
	},
	{
		name: "soybean sprouts",
		department: "unclassified"
	},
	{
		name: "soy bean sprouts",
		department: "unclassified"
	},
	{
		name: "strawberry gelatin",
		department: "unclassified"
	},
	{
		name: "gluten-free baking powder",
		department: "unclassified"
	},
	{
		name: "fryer chicken",
		department: "unclassified"
	},
	{
		name: "gingerbread",
		department: "unclassified"
	},
	{
		name: "large flour tortillas",
		department: "unclassified"
	},
	{
		name: "burrito size flour tortillas",
		department: "unclassified"
	},
	{
		name: "mustard greens",
		department: "unclassified"
	},
	{
		name: "cranberry juice cocktail",
		department: "unclassified"
	},
	{
		name: "habanero pepper",
		department: "unclassified"
	},
	{
		name: "hot fudge topping",
		department: "unclassified"
	},
	{
		name: "sirloin",
		department: "unclassified"
	},
	{
		name: "pure vanilla",
		department: "unclassified"
	},
	{
		name: "blue cura\\u00E7ao",
		department: "unclassified"
	},
	{
		name: "Madras curry powder",
		department: "unclassified"
	},
	{
		name: "chocolate candy bars",
		department: "unclassified"
	},
	{
		name: "San Marzano tomatoes",
		department: "unclassified"
	},
	{
		name: "cracker crumbs",
		department: "unclassified"
	},
	{
		name: "wasabi powder",
		department: "unclassified"
	},
	{
		name: "kirschwasser",
		department: "unclassified"
	},
	{
		name: "ham steak",
		department: "unclassified"
	},
	{
		name: "egg roll wrappers",
		department: "unclassified"
	},
	{
		name: "Equal Sweetener",
		department: "unclassified"
	},
	{
		name: "aleppo pepper",
		department: "unclassified"
	},
	{
		name: "tater tots",
		department: "unclassified"
	},
	{
		name: "ravioli",
		department: "unclassified"
	},
	{
		name: "bartlett pears",
		department: "unclassified"
	},
	{
		name: "frozen vegetables",
		department: "unclassified"
	},
	{
		name: "brown mustard",
		department: "unclassified"
	},
	{
		name: "lower sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "gooseberries",
		department: "unclassified"
	},
	{
		name: "tuna packed in olive oil",
		department: "unclassified"
	},
	{
		name: "baking chips",
		department: "unclassified"
	},
	{
		name: "serrano ham",
		department: "unclassified"
	},
	{
		name: "tzatziki sauce",
		department: "unclassified"
	},
	{
		name: "spice cake mix",
		department: "unclassified"
	},
	{
		name: "cracker pie crust",
		department: "unclassified"
	},
	{
		name: "white kidney beans",
		department: "unclassified"
	},
	{
		name: "bone-in chicken breasts",
		department: "unclassified"
	},
	{
		name: "malted milk powder",
		department: "unclassified"
	},
	{
		name: "cheesecake",
		department: "unclassified"
	},
	{
		name: "pitted prunes",
		department: "unclassified"
	},
	{
		name: "brisket",
		department: "unclassified"
	},
	{
		name: "rapid rise yeast",
		department: "unclassified"
	},
	{
		name: "soft fresh goat cheese",
		department: "unclassified"
	},
	{
		name: "sauce binder",
		department: "unclassified"
	},
	{
		name: "mexicorn",
		department: "unclassified"
	},
	{
		name: "mexican style corn",
		department: "unclassified"
	},
	{
		name: "corn tortilla chips",
		department: "unclassified"
	},
	{
		name: "malt syrup",
		department: "unclassified"
	},
	{
		name: "chocolate pudding",
		department: "unclassified"
	},
	{
		name: "lollipop",
		department: "unclassified"
	},
	{
		name: "xylitol sweetener",
		department: "unclassified"
	},
	{
		name: "green curry paste",
		department: "unclassified"
	},
	{
		name: "butter cooking spray",
		department: "unclassified"
	},
	{
		name: "7 Up",
		department: "unclassified"
	},
	{
		name: "frozen limeade concentrate",
		department: "unclassified"
	},
	{
		name: "adobo seasoning",
		department: "unclassified"
	},
	{
		name: "cookie crumbs",
		department: "unclassified"
	},
	{
		name: "lasagne",
		department: "unclassified"
	},
	{
		name: "sliced potatoes",
		department: "unclassified"
	},
	{
		name: "lovage",
		department: "unclassified"
	},
	{
		name: "center cut bacon",
		department: "unclassified"
	},
	{
		name: "franks",
		department: "unclassified"
	},
	{
		name: "boiled eggs",
		department: "unclassified"
	},
	{
		name: "alcohol",
		department: "unclassified"
	},
	{
		name: "pineapple rings",
		department: "unclassified"
	},
	{
		name: "shortbread cookies",
		department: "unclassified"
	},
	{
		name: "pink peppercorns",
		department: "unclassified"
	},
	{
		name: "long grain brown rice",
		department: "unclassified"
	},
	{
		name: "soya flour",
		department: "unclassified"
	},
	{
		name: "soy flour",
		department: "unclassified"
	},
	{
		name: "baby portobello mushrooms",
		department: "unclassified"
	},
	{
		name: "hothouse cucumber",
		department: "unclassified"
	},
	{
		name: "turkey stock",
		department: "unclassified"
	},
	{
		name: "pork baby back ribs",
		department: "unclassified"
	},
	{
		name: "dried date",
		department: "unclassified"
	},
	{
		name: "Reese's Peanut Butter Cups",
		department: "unclassified"
	},
	{
		name: "root vegetables",
		department: "unclassified"
	},
	{
		name: "roots",
		department: "unclassified"
	},
	{
		name: "red quinoa",
		department: "unclassified"
	},
	{
		name: "bone-in skin-on chicken thighs",
		department: "unclassified"
	},
	{
		name: "cheddar cheese soup",
		department: "unclassified"
	},
	{
		name: "fat-free cottage cheese",
		department: "unclassified"
	},
	{
		name: "fondant",
		department: "unclassified"
	},
	{
		name: "bread machine yeast",
		department: "unclassified"
	},
	{
		name: "gammon",
		department: "unclassified"
	},
	{
		name: "pork cutlets",
		department: "unclassified"
	},
	{
		name: "center cut pork chops",
		department: "unclassified"
	},
	{
		name: "muesli",
		department: "unclassified"
	},
	{
		name: "head lettuce",
		department: "unclassified"
	},
	{
		name: "edible flowers",
		department: "unclassified"
	},
	{
		name: "condensed cream of celery soup",
		department: "unclassified"
	},
	{
		name: "nougat",
		department: "unclassified"
	},
	{
		name: "currant jelly",
		department: "unclassified"
	},
	{
		name: "chopped ham",
		department: "unclassified"
	},
	{
		name: "calamari",
		department: "unclassified"
	},
	{
		name: "Quinoa Flour",
		department: "unclassified"
	},
	{
		name: "apple juice concentrate",
		department: "unclassified"
	},
	{
		name: "maple flavoring",
		department: "unclassified"
	},
	{
		name: "chilli paste",
		department: "unclassified"
	},
	{
		name: "apricot nectar",
		department: "unclassified"
	},
	{
		name: "winter squash",
		department: "unclassified"
	},
	{
		name: "frozen peas and carrots",
		department: "unclassified"
	},
	{
		name: "carrot juice",
		department: "unclassified"
	},
	{
		name: "Italian turkey sausage",
		department: "unclassified"
	},
	{
		name: "grape jelly",
		department: "unclassified"
	},
	{
		name: "wax beans",
		department: "unclassified"
	},
	{
		name: "yellow beans",
		department: "unclassified"
	},
	{
		name: "fenugreek",
		department: "unclassified"
	},
	{
		name: "bechamel",
		department: "unclassified"
	},
	{
		name: "vegan parmesan cheese",
		department: "unclassified"
	},
	{
		name: "soy parmesan cheese",
		department: "unclassified"
	},
	{
		name: "brown mustard seeds",
		department: "unclassified"
	},
	{
		name: "roquefort cheese",
		department: "unclassified"
	},
	{
		name: "pumpernickel bread",
		department: "unclassified"
	},
	{
		name: "suet",
		department: "unclassified"
	},
	{
		name: "lamb loin chops",
		department: "unclassified"
	},
	{
		name: "potato flakes",
		department: "unclassified"
	},
	{
		name: "meringue powder",
		department: "unclassified"
	},
	{
		name: "swordfish steaks",
		department: "unclassified"
	},
	{
		name: "fennel fronds",
		department: "unclassified"
	},
	{
		name: "fudge brownie mix",
		department: "unclassified"
	},
	{
		name: "butter-margarine blend",
		department: "unclassified"
	},
	{
		name: "chili seasoning mix",
		department: "unclassified"
	},
	{
		name: "shiitake mushroom caps",
		department: "unclassified"
	},
	{
		name: "fronds",
		department: "unclassified"
	},
	{
		name: "coffee cream",
		department: "unclassified"
	},
	{
		name: "cooking sherry",
		department: "unclassified"
	},
	{
		name: "sole fillet",
		department: "unclassified"
	},
	{
		name: "soul fillet",
		department: "unclassified"
	},
	{
		name: "dried shrimp",
		department: "unclassified"
	},
	{
		name: "american cheese slices",
		department: "unclassified"
	},
	{
		name: "seltzer",
		department: "unclassified"
	},
	{
		name: "brewed espresso",
		department: "unclassified"
	},
	{
		name: "sandwich buns",
		department: "unclassified"
	},
	{
		name: "pitted cherries",
		department: "unclassified"
	},
	{
		name: "sliced shallots",
		department: "unclassified"
	},
	{
		name: "egg noodles, cooked and drained",
		department: "unclassified"
	},
	{
		name: "egg noodles, cook and drain",
		department: "unclassified"
	},
	{
		name: "caster",
		department: "unclassified"
	},
	{
		name: "udon",
		department: "unclassified"
	},
	{
		name: "coarse ground mustard",
		department: "unclassified"
	},
	{
		name: "new york strip steaks",
		department: "unclassified"
	},
	{
		name: "millet flour",
		department: "unclassified"
	},
	{
		name: "roe",
		department: "unclassified"
	},
	{
		name: "duck fat",
		department: "unclassified"
	},
	{
		name: "chicken parts",
		department: "unclassified"
	},
	{
		name: "white corn",
		department: "unclassified"
	},
	{
		name: "white cornmeal",
		department: "unclassified"
	},
	{
		name: "chocolate sandwich cookies",
		department: "unclassified"
	},
	{
		name: "rock sugar",
		department: "unclassified"
	},
	{
		name: "rock candy",
		department: "unclassified"
	},
	{
		name: "white candied sugar",
		department: "unclassified"
	},
	{
		name: "red currants",
		department: "unclassified"
	},
	{
		name: "rusk",
		department: "unclassified"
	},
	{
		name: "sorrel",
		department: "unclassified"
	},
	{
		name: "wafer",
		department: "unclassified"
	},
	{
		name: "nonfat vanilla yogurt",
		department: "unclassified"
	},
	{
		name: "sweet and sour sauce",
		department: "unclassified"
	},
	{
		name: "unbaked pie crusts",
		department: "unclassified"
	},
	{
		name: "tapenade",
		department: "unclassified"
	},
	{
		name: "plum sauce",
		department: "unclassified"
	},
	{
		name: "fenugreek leaves",
		department: "unclassified"
	},
	{
		name: "pea pods",
		department: "unclassified"
	},
	{
		name: "bean pods",
		department: "unclassified"
	},
	{
		name: "dijon",
		department: "unclassified"
	},
	{
		name: "pointed cabbage",
		department: "unclassified"
	},
	{
		name: "halloumi cheese",
		department: "unclassified"
	},
	{
		name: "rainbow sprinkles",
		department: "unclassified"
	},
	{
		name: "smoked ham hocks",
		department: "unclassified"
	},
	{
		name: "silver tequila",
		department: "unclassified"
	},
	{
		name: "top round steak",
		department: "unclassified"
	},
	{
		name: "herb cheese",
		department: "unclassified"
	},
	{
		name: "herbal fresh cheese",
		department: "unclassified"
	},
	{
		name: "min",
		department: "unclassified"
	},
	{
		name: "kirby cucumbers",
		department: "unclassified"
	},
	{
		name: "soft tofu",
		department: "unclassified"
	},
	{
		name: "candied cherries",
		department: "unclassified"
	},
	{
		name: "arrowroot flour",
		department: "unclassified"
	},
	{
		name: "hazelnut oil",
		department: "unclassified"
	},
	{
		name: "free-range eggs",
		department: "unclassified"
	},
	{
		name: "scampi",
		department: "unclassified"
	},
	{
		name: "turkey breast deli meat",
		department: "unclassified"
	},
	{
		name: "shell pasta",
		department: "unclassified"
	},
	{
		name: "low-fat ricotta cheese",
		department: "unclassified"
	},
	{
		name: "nonfat ricotta cheese",
		department: "unclassified"
	},
	{
		name: "parmigiano",
		department: "unclassified"
	},
	{
		name: "lager beer",
		department: "unclassified"
	},
	{
		name: "ground fennel",
		department: "unclassified"
	},
	{
		name: "ground coffee",
		department: "unclassified"
	},
	{
		name: "sweet pickle",
		department: "unclassified"
	},
	{
		name: "pound cake",
		department: "unclassified"
	},
	{
		name: "soft cheese",
		department: "unclassified"
	},
	{
		name: "orange bitters",
		department: "unclassified"
	},
	{
		name: "baking spray",
		department: "unclassified"
	},
	{
		name: "fresh berries",
		department: "unclassified"
	},
	{
		name: "cheese ravioli",
		department: "unclassified"
	},
	{
		name: "pita chips",
		department: "unclassified"
	},
	{
		name: "spanish chorizo",
		department: "unclassified"
	},
	{
		name: "tapioca",
		department: "unclassified"
	},
	{
		name: "cashew milk",
		department: "unclassified"
	},
	{
		name: "slider buns",
		department: "unclassified"
	},
	{
		name: "peach nectar",
		department: "unclassified"
	},
	{
		name: "rice cereal",
		department: "unclassified"
	},
	{
		name: "broccoli slaw",
		department: "unclassified"
	},
	{
		name: "minced chicken",
		department: "unclassified"
	},
	{
		name: "rye",
		department: "unclassified"
	},
	{
		name: "ruby port",
		department: "unclassified"
	},
	{
		name: "Gold Medal All Purpose Flour",
		department: "unclassified"
	},
	{
		name: "puff pastry sheets",
		department: "unclassified"
	},
	{
		name: "almond liqueur",
		department: "unclassified"
	},
	{
		name: "flax egg",
		department: "unclassified"
	},
	{
		name: "gelatin sheet",
		department: "unclassified"
	},
	{
		name: "gelatin leaf",
		department: "unclassified"
	},
	{
		name: "curly kale",
		department: "unclassified"
	},
	{
		name: "grill seasoning",
		department: "unclassified"
	},
	{
		name: "old-fashioned oatmeal",
		department: "unclassified"
	},
	{
		name: "asian pear",
		department: "unclassified"
	},
	{
		name: "asian pears",
		department: "unclassified"
	},
	{
		name: "ricotta salata",
		department: "unclassified"
	},
	{
		name: "brown gravy mix",
		department: "unclassified"
	},
	{
		name: "lipton onion soup mix",
		department: "unclassified"
	},
	{
		name: "low-fat greek yogurt",
		department: "unclassified"
	},
	{
		name: "Kassler",
		department: "unclassified"
	},
	{
		name: "seasoning mix",
		department: "unclassified"
	},
	{
		name: "Splenda Brown Sugar Blend",
		department: "unclassified"
	},
	{
		name: "loosely packed fresh basil leaves",
		department: "unclassified"
	},
	{
		name: "strawberry ice cream",
		department: "unclassified"
	},
	{
		name: "mincemeat",
		department: "unclassified"
	},
	{
		name: "instant espresso",
		department: "unclassified"
	},
	{
		name: "sugar cubes",
		department: "unclassified"
	},
	{
		name: "cheese sauce",
		department: "unclassified"
	},
	{
		name: "french dressing",
		department: "unclassified"
	},
	{
		name: "toffee pieces",
		department: "unclassified"
	},
	{
		name: "reduced sodium beef broth",
		department: "unclassified"
	},
	{
		name: "cornish hens",
		department: "unclassified"
	},
	{
		name: "mountain cheese",
		department: "unclassified"
	},
	{
		name: "tart cherries",
		department: "unclassified"
	},
	{
		name: "ground hazelnuts",
		department: "unclassified"
	},
	{
		name: "Pam Cooking Spray",
		department: "unclassified"
	},
	{
		name: "oxtails",
		department: "unclassified"
	},
	{
		name: "mild Italian sausage",
		department: "unclassified"
	},
	{
		name: "rosewater",
		department: "unclassified"
	},
	{
		name: "ginger juice",
		department: "unclassified"
	},
	{
		name: "lychees",
		department: "unclassified"
	},
	{
		name: "microgreens",
		department: "unclassified"
	},
	{
		name: "egg beaters egg substitute",
		department: "unclassified"
	},
	{
		name: "chicken thigh fillets",
		department: "unclassified"
	},
	{
		name: "puy lentils",
		department: "unclassified"
	},
	{
		name: "chocolate cake",
		department: "unclassified"
	},
	{
		name: "pickling cucumbers",
		department: "unclassified"
	},
	{
		name: "quick-cooking oatmeal",
		department: "unclassified"
	},
	{
		name: "bocconcini",
		department: "unclassified"
	},
	{
		name: "beef consomme",
		department: "unclassified"
	},
	{
		name: "stilton cheese",
		department: "unclassified"
	},
	{
		name: "buffalo mozzarella",
		department: "unclassified"
	},
	{
		name: "frankfurters",
		department: "unclassified"
	},
	{
		name: "speculaas spice mix",
		department: "unclassified"
	},
	{
		name: "tart shells",
		department: "unclassified"
	},
	{
		name: "asafoetida powder",
		department: "unclassified"
	},
	{
		name: "asafetida powder",
		department: "unclassified"
	},
	{
		name: "burrata",
		department: "unclassified"
	},
	{
		name: "apple slices",
		department: "unclassified"
	},
	{
		name: "white truffle oil",
		department: "unclassified"
	},
	{
		name: "sponge",
		department: "unclassified"
	},
	{
		name: "chaat masala",
		department: "unclassified"
	},
	{
		name: "soepgroenten",
		department: "unclassified"
	},
	{
		name: "multigrain bread",
		department: "unclassified"
	},
	{
		name: "scotch bonnet chile",
		department: "unclassified"
	},
	{
		name: "scotch bonnet",
		department: "unclassified"
	},
	{
		name: "giblet",
		department: "unclassified"
	},
	{
		name: "amaretti biscuits",
		department: "unclassified"
	},
	{
		name: "Amarettini cookies",
		department: "unclassified"
	},
	{
		name: "Amarettini",
		department: "unclassified"
	},
	{
		name: "chocolate glaze",
		department: "unclassified"
	},
	{
		name: "frozen green beans",
		department: "unclassified"
	},
	{
		name: "key lime",
		department: "unclassified"
	},
	{
		name: "double-acting baking powder",
		department: "unclassified"
	},
	{
		name: "quail",
		department: "unclassified"
	},
	{
		name: "chocolate milk",
		department: "unclassified"
	},
	{
		name: "chocolate chip cookies",
		department: "unclassified"
	},
	{
		name: "mandarin orange segments",
		department: "unclassified"
	},
	{
		name: "whole wheat hamburger buns",
		department: "unclassified"
	},
	{
		name: "morel",
		department: "unclassified"
	},
	{
		name: "diced potatoes",
		department: "unclassified"
	},
	{
		name: "Kraft Grated Parmesan Cheese",
		department: "unclassified"
	},
	{
		name: "whey protein powder",
		department: "unclassified"
	},
	{
		name: "creamer",
		department: "unclassified"
	},
	{
		name: "coffee ice cream",
		department: "unclassified"
	},
	{
		name: "mustard oil",
		department: "unclassified"
	},
	{
		name: "Ni\\u00E7oise olives",
		department: "unclassified"
	},
	{
		name: "Cailletier olives",
		department: "unclassified"
	},
	{
		name: "pizza seasoning",
		department: "unclassified"
	},
	{
		name: "haddock fillets",
		department: "unclassified"
	},
	{
		name: "rump roast",
		department: "unclassified"
	},
	{
		name: "fruit vinegar",
		department: "unclassified"
	},
	{
		name: "chocolate graham crackers",
		department: "unclassified"
	},
	{
		name: "pie filling",
		department: "unclassified"
	},
	{
		name: "cannelloni",
		department: "unclassified"
	},
	{
		name: "raspberry liqueur",
		department: "unclassified"
	},
	{
		name: "quail eggs",
		department: "unclassified"
	},
	{
		name: "maldon sea salt",
		department: "unclassified"
	},
	{
		name: "crisco shortening",
		department: "unclassified"
	},
	{
		name: "strong flour",
		department: "unclassified"
	},
	{
		name: "breadstick",
		department: "unclassified"
	},
	{
		name: "habanero",
		department: "unclassified"
	},
	{
		name: "mozzarella balls",
		department: "unclassified"
	},
	{
		name: "ground pecans",
		department: "unclassified"
	},
	{
		name: "French lentils",
		department: "unclassified"
	},
	{
		name: "French green lentils",
		department: "unclassified"
	},
	{
		name: "lemonade concentrate",
		department: "unclassified"
	},
	{
		name: "crema",
		department: "unclassified"
	},
	{
		name: "mirepoix",
		department: "unclassified"
	},
	{
		name: "tangerine juice",
		department: "unclassified"
	},
	{
		name: "nonpareils",
		department: "unclassified"
	},
	{
		name: "mutton",
		department: "unclassified"
	},
	{
		name: "lobster tails",
		department: "unclassified"
	},
	{
		name: "granola cereal",
		department: "unclassified"
	},
	{
		name: "sandwich rolls",
		department: "unclassified"
	},
	{
		name: "irish cream liqueur",
		department: "unclassified"
	},
	{
		name: "peeled shrimp",
		department: "unclassified"
	},
	{
		name: "turkey breast tenderloins",
		department: "unclassified"
	},
	{
		name: "turkey breast fillet",
		department: "unclassified"
	},
	{
		name: "turkey fillet",
		department: "unclassified"
	},
	{
		name: "cookie dough",
		department: "unclassified"
	},
	{
		name: "chuck steaks",
		department: "unclassified"
	},
	{
		name: "sea bass",
		department: "unclassified"
	},
	{
		name: "wheat berries",
		department: "unclassified"
	},
	{
		name: "honey roasted peanuts",
		department: "unclassified"
	},
	{
		name: "Italian cheese",
		department: "unclassified"
	},
	{
		name: "tamarind pulp",
		department: "unclassified"
	},
	{
		name: "shredded extra sharp cheddar cheese",
		department: "unclassified"
	},
	{
		name: "farmer cheese",
		department: "unclassified"
	},
	{
		name: "baby lima beans",
		department: "unclassified"
	},
	{
		name: "tartar sauce",
		department: "unclassified"
	},
	{
		name: "small eggs",
		department: "unclassified"
	},
	{
		name: "pullet eggs",
		department: "unclassified"
	},
	{
		name: "Louisiana Hot Sauce",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Dressing",
		department: "unclassified"
	},
	{
		name: "veal schnitzel",
		department: "unclassified"
	},
	{
		name: "mortadella",
		department: "unclassified"
	},
	{
		name: "broiler-fryer chicken",
		department: "unclassified"
	},
	{
		name: "King Arthur Unbleached All-Purpose Flour",
		department: "unclassified"
	},
	{
		name: "bing cherries",
		department: "unclassified"
	},
	{
		name: "shredded Italian cheese",
		department: "unclassified"
	},
	{
		name: "Frank's\\u00AE RedHot\\u00AE Original Cayenne Pepper Sauce",
		department: "unclassified"
	},
	{
		name: "anjou pears",
		department: "unclassified"
	},
	{
		name: "light margarine",
		department: "unclassified"
	},
	{
		name: "low-fat margarine",
		department: "unclassified"
	},
	{
		name: "cilantro root",
		department: "unclassified"
	},
	{
		name: "coriander root",
		department: "unclassified"
	},
	{
		name: "veal cutlets",
		department: "unclassified"
	},
	{
		name: "smoked turkey",
		department: "unclassified"
	},
	{
		name: "Fuji Apple",
		department: "unclassified"
	},
	{
		name: "whole peppercorn",
		department: "unclassified"
	},
	{
		name: "lager",
		department: "unclassified"
	},
	{
		name: "kasuri methi",
		department: "unclassified"
	},
	{
		name: "kasoori methi",
		department: "unclassified"
	},
	{
		name: "maca powder",
		department: "unclassified"
	},
	{
		name: "soya bean",
		department: "unclassified"
	},
	{
		name: "soy bean",
		department: "unclassified"
	},
	{
		name: "riesling",
		department: "unclassified"
	},
	{
		name: "jerusalem artichokes",
		department: "unclassified"
	},
	{
		name: "red delicious apples",
		department: "unclassified"
	},
	{
		name: "macaroons",
		department: "unclassified"
	},
	{
		name: "german chocolate cake mix",
		department: "unclassified"
	},
	{
		name: "blueberry pie filling",
		department: "unclassified"
	},
	{
		name: "iodized salt",
		department: "unclassified"
	},
	{
		name: "garlic sauce",
		department: "unclassified"
	},
	{
		name: "nigella seeds",
		department: "unclassified"
	},
	{
		name: "frozen blackberries",
		department: "unclassified"
	},
	{
		name: "reduced fat mozzarella",
		department: "unclassified"
	},
	{
		name: "sliced leeks",
		department: "unclassified"
	},
	{
		name: "mild cheddar cheese",
		department: "unclassified"
	},
	{
		name: "prepared pizza crust",
		department: "unclassified"
	},
	{
		name: "roquefort",
		department: "unclassified"
	},
	{
		name: "bread mix",
		department: "unclassified"
	},
	{
		name: "tuna packed in water",
		department: "unclassified"
	},
	{
		name: "steak tartare",
		department: "unclassified"
	},
	{
		name: "fritos",
		department: "unclassified"
	},
	{
		name: "Fritos Corn Chips",
		department: "unclassified"
	},
	{
		name: "pak choi",
		department: "unclassified"
	},
	{
		name: "frozen peaches",
		department: "unclassified"
	},
	{
		name: "sliced olives",
		department: "unclassified"
	},
	{
		name: "whole wheat couscous",
		department: "unclassified"
	},
	{
		name: "shredded mild cheddar cheese",
		department: "unclassified"
	},
	{
		name: "sweet chocolate",
		department: "unclassified"
	},
	{
		name: "semi sweet mini chocolate chips",
		department: "unclassified"
	},
	{
		name: "semi-sweet mini chocolate chips",
		department: "unclassified"
	},
	{
		name: "gluten free soy sauce",
		department: "unclassified"
	},
	{
		name: "grape leaves",
		department: "unclassified"
	},
	{
		name: "dried salted codfish",
		department: "unclassified"
	},
	{
		name: "salt cod",
		department: "unclassified"
	},
	{
		name: "bacalao",
		department: "unclassified"
	},
	{
		name: "pure olive oil",
		department: "unclassified"
	},
	{
		name: "frozen bread dough",
		department: "unclassified"
	},
	{
		name: "short rib",
		department: "unclassified"
	},
	{
		name: "yoplait",
		department: "unclassified"
	},
	{
		name: "hand cheese",
		department: "unclassified"
	},
	{
		name: "swede",
		department: "unclassified"
	},
	{
		name: "Ciabatta rolls",
		department: "unclassified"
	},
	{
		name: "coconut milk yogurt",
		department: "unclassified"
	},
	{
		name: "whole nutmegs",
		department: "unclassified"
	},
	{
		name: "konbu",
		department: "unclassified"
	},
	{
		name: "kombu",
		department: "unclassified"
	},
	{
		name: "black forest ham",
		department: "unclassified"
	},
	{
		name: "cr\\u00E8me de menthe",
		department: "unclassified"
	},
	{
		name: "lemon twists",
		department: "unclassified"
	},
	{
		name: "compote",
		department: "unclassified"
	},
	{
		name: "phyllo",
		department: "unclassified"
	},
	{
		name: "pork neck",
		department: "unclassified"
	},
	{
		name: "Accent Seasoning",
		department: "unclassified"
	},
	{
		name: "fuji apples",
		department: "unclassified"
	},
	{
		name: "brown basmati rice",
		department: "unclassified"
	},
	{
		name: "doritos",
		department: "unclassified"
	},
	{
		name: "sea bass fillets",
		department: "unclassified"
	},
	{
		name: "prepared salsa",
		department: "unclassified"
	},
	{
		name: "mung beans",
		department: "unclassified"
	},
	{
		name: "fresno chiles",
		department: "unclassified"
	},
	{
		name: "rye whiskey",
		department: "unclassified"
	},
	{
		name: "liquid margarine",
		department: "unclassified"
	},
	{
		name: "enokitake",
		department: "unclassified"
	},
	{
		name: "enoki mushrooms",
		department: "unclassified"
	},
	{
		name: "enoki",
		department: "unclassified"
	},
	{
		name: "pappardelle",
		department: "unclassified"
	},
	{
		name: "baked ham",
		department: "unclassified"
	},
	{
		name: "garlic puree",
		department: "unclassified"
	},
	{
		name: "glucose",
		department: "unclassified"
	},
	{
		name: "biscuit dough",
		department: "unclassified"
	},
	{
		name: "passion fruit juice",
		department: "unclassified"
	},
	{
		name: "vinaigrette dressing",
		department: "unclassified"
	},
	{
		name: "candied fruit",
		department: "unclassified"
	},
	{
		name: "pimento stuffed olives",
		department: "unclassified"
	},
	{
		name: "buffalo meat",
		department: "unclassified"
	},
	{
		name: "buffalo",
		department: "unclassified"
	},
	{
		name: "liquid aminos",
		department: "unclassified"
	},
	{
		name: "strawberry pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "toasted pumpkinseeds",
		department: "unclassified"
	},
	{
		name: "Blue Band Vloeibaar Iedere Dag",
		department: "unclassified"
	},
	{
		name: "condensed cheddar cheese soup",
		department: "unclassified"
	},
	{
		name: "ziti",
		department: "unclassified"
	},
	{
		name: "liquid egg whites",
		department: "unclassified"
	},
	{
		name: "nonfat dry milk",
		department: "unclassified"
	},
	{
		name: "jeera",
		department: "unclassified"
	},
	{
		name: "french fries",
		department: "unclassified"
	},
	{
		name: "white distilled vinegar",
		department: "unclassified"
	},
	{
		name: "Haas avocados",
		department: "unclassified"
	},
	{
		name: "country ham",
		department: "unclassified"
	},
	{
		name: "pandanus leaf",
		department: "unclassified"
	},
	{
		name: "pandan leaf",
		department: "unclassified"
	},
	{
		name: "screwpine leaves",
		department: "unclassified"
	},
	{
		name: "pandan leaves",
		department: "unclassified"
	},
	{
		name: "vanilla whey protein powder",
		department: "unclassified"
	},
	{
		name: "penne rigate",
		department: "unclassified"
	},
	{
		name: "flaxseed oil",
		department: "unclassified"
	},
	{
		name: "shredded basil",
		department: "unclassified"
	},
	{
		name: "chile sauce",
		department: "unclassified"
	},
	{
		name: "mesclun",
		department: "unclassified"
	},
	{
		name: "Chinese egg noodles",
		department: "unclassified"
	},
	{
		name: "goose",
		department: "unclassified"
	},
	{
		name: "raisin bread",
		department: "unclassified"
	},
	{
		name: "bouillon powder",
		department: "unclassified"
	},
	{
		name: "sweet relish",
		department: "unclassified"
	},
	{
		name: "skinless chicken thighs",
		department: "unclassified"
	},
	{
		name: "canola mayonnaise",
		department: "unclassified"
	},
	{
		name: "sweet and sour mix",
		department: "unclassified"
	},
	{
		name: "filet mignon",
		department: "unclassified"
	},
	{
		name: "salted cashews",
		department: "unclassified"
	},
	{
		name: "red snapper",
		department: "unclassified"
	},
	{
		name: "dried pasta",
		department: "unclassified"
	},
	{
		name: "light beer",
		department: "unclassified"
	},
	{
		name: "meal",
		department: "unclassified"
	},
	{
		name: "Texas toast bread",
		department: "unclassified"
	},
	{
		name: "Texas toast",
		department: "unclassified"
	},
	{
		name: "ras el hanout",
		department: "unclassified"
	},
	{
		name: "whole wheat pita",
		department: "unclassified"
	},
	{
		name: "baking yeast",
		department: "unclassified"
	},
	{
		name: "mango nectar",
		department: "unclassified"
	},
	{
		name: "ramps",
		department: "unclassified"
	},
	{
		name: "rib roast",
		department: "unclassified"
	},
	{
		name: "chile paste",
		department: "unclassified"
	},
	{
		name: "sugar cookie dough",
		department: "unclassified"
	},
	{
		name: "cocktail sauce",
		department: "unclassified"
	},
	{
		name: "whole wheat pita bread",
		department: "unclassified"
	},
	{
		name: "Schinkenspeck",
		department: "unclassified"
	},
	{
		name: "chicken leg quarters",
		department: "unclassified"
	},
	{
		name: "unsweetened soymilk",
		department: "unclassified"
	},
	{
		name: "back bacon",
		department: "unclassified"
	},
	{
		name: "dried pineapple",
		department: "unclassified"
	},
	{
		name: "guar gum",
		department: "unclassified"
	},
	{
		name: "doughnuts",
		department: "unclassified"
	},
	{
		name: "pimento stuffed green olives",
		department: "unclassified"
	},
	{
		name: "delicata squash",
		department: "unclassified"
	},
	{
		name: "linguini",
		department: "unclassified"
	},
	{
		name: "chicken strips",
		department: "unclassified"
	},
	{
		name: "ponzu",
		department: "unclassified"
	},
	{
		name: "canola oil cooking spray",
		department: "unclassified"
	},
	{
		name: "bottled clam juice",
		department: "unclassified"
	},
	{
		name: "dry rub",
		department: "unclassified"
	},
	{
		name: "chocolate cookie",
		department: "unclassified"
	},
	{
		name: "tonic water",
		department: "unclassified"
	},
	{
		name: "fat-free buttermilk",
		department: "unclassified"
	},
	{
		name: "cane syrup",
		department: "unclassified"
	},
	{
		name: "whole milk yoghurt",
		department: "unclassified"
	},
	{
		name: "Cointreau Liqueur",
		department: "unclassified"
	},
	{
		name: "pork country-style ribs",
		department: "unclassified"
	},
	{
		name: "pork country ribs",
		department: "unclassified"
	},
	{
		name: "aged cheddar cheese",
		department: "unclassified"
	},
	{
		name: "jack",
		department: "unclassified"
	},
	{
		name: "cabbage leaves",
		department: "unclassified"
	},
	{
		name: "sweet soy sauce",
		department: "unclassified"
	},
	{
		name: "stevia powder",
		department: "unclassified"
	},
	{
		name: "smoked streaky bacon",
		department: "unclassified"
	},
	{
		name: "crumbled bacon",
		department: "unclassified"
	},
	{
		name: "orange food coloring",
		department: "unclassified"
	},
	{
		name: "onion rings",
		department: "unclassified"
	},
	{
		name: "risotto",
		department: "unclassified"
	},
	{
		name: "grana padano",
		department: "unclassified"
	},
	{
		name: "green plantains",
		department: "unclassified"
	},
	{
		name: "spam",
		department: "unclassified"
	},
	{
		name: "white corn syrup",
		department: "unclassified"
	},
	{
		name: "treacle",
		department: "unclassified"
	},
	{
		name: "fried eggs",
		department: "unclassified"
	},
	{
		name: "Nilla Wafers",
		department: "unclassified"
	},
	{
		name: "Honeycrisp apples",
		department: "unclassified"
	},
	{
		name: "Jell-O Gelatin Dessert",
		department: "unclassified"
	},
	{
		name: "dandelion greens",
		department: "unclassified"
	},
	{
		name: "fat-free cheddar cheese",
		department: "unclassified"
	},
	{
		name: "black treacle",
		department: "unclassified"
	},
	{
		name: "wildfond",
		department: "unclassified"
	},
	{
		name: "vanilla wafer crumbs",
		department: "unclassified"
	},
	{
		name: "Rice Chex",
		department: "unclassified"
	},
	{
		name: "chiffonade",
		department: "unclassified"
	},
	{
		name: "peppermint candy",
		department: "unclassified"
	},
	{
		name: "vanilla cake mix",
		department: "unclassified"
	},
	{
		name: "nonfat buttermilk",
		department: "unclassified"
	},
	{
		name: "Italian cheese blend",
		department: "unclassified"
	},
	{
		name: "sweet corn kernels",
		department: "unclassified"
	},
	{
		name: "lamb fillet",
		department: "unclassified"
	},
	{
		name: "bitter almond oil",
		department: "unclassified"
	},
	{
		name: "quick cooking brown rice",
		department: "unclassified"
	},
	{
		name: "green enchilada sauce",
		department: "unclassified"
	},
	{
		name: "brown mushroom",
		department: "unclassified"
	},
	{
		name: "soup mix",
		department: "unclassified"
	},
	{
		name: "persimmon",
		department: "unclassified"
	},
	{
		name: "kiwifruit",
		department: "unclassified"
	},
	{
		name: "vegetable juice",
		department: "unclassified"
	},
	{
		name: "cocoa butter",
		department: "unclassified"
	},
	{
		name: "cassis",
		department: "unclassified"
	},
	{
		name: "Truv\\u00EDa\\u00AE Baking Blend",
		department: "unclassified"
	},
	{
		name: "pheasant",
		department: "unclassified"
	},
	{
		name: "merlot",
		department: "unclassified"
	},
	{
		name: "butter crackers",
		department: "unclassified"
	},
	{
		name: "butter-flavored crackers",
		department: "unclassified"
	},
	{
		name: "corncobs",
		department: "unclassified"
	},
	{
		name: "brown cardamom",
		department: "unclassified"
	},
	{
		name: "black cardamom",
		department: "unclassified"
	},
	{
		name: "serrano",
		department: "unclassified"
	},
	{
		name: "white hominy",
		department: "unclassified"
	},
	{
		name: "pot roast",
		department: "unclassified"
	},
	{
		name: "kabocha squash",
		department: "unclassified"
	},
	{
		name: "garlic chives",
		department: "unclassified"
	},
	{
		name: "unsulphured molasses",
		department: "unclassified"
	},
	{
		name: "fat-free low-sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "banana leaves",
		department: "unclassified"
	},
	{
		name: "marjoram leaves",
		department: "unclassified"
	},
	{
		name: "chana dal",
		department: "unclassified"
	},
	{
		name: "dry beans",
		department: "unclassified"
	},
	{
		name: "shoyu",
		department: "unclassified"
	},
	{
		name: "condiments",
		department: "unclassified"
	},
	{
		name: "monkfish",
		department: "unclassified"
	},
	{
		name: "pork steaks",
		department: "unclassified"
	},
	{
		name: "Country Crock\\u00AE Spread",
		department: "unclassified"
	},
	{
		name: "flavored syrup",
		department: "unclassified"
	},
	{
		name: "ground chicken breast",
		department: "unclassified"
	},
	{
		name: "turkey broth",
		department: "unclassified"
	},
	{
		name: "spaghettini",
		department: "unclassified"
	},
	{
		name: "seitan",
		department: "unclassified"
	},
	{
		name: "pink salmon",
		department: "unclassified"
	},
	{
		name: "ground pork sausage",
		department: "unclassified"
	},
	{
		name: "jelly beans",
		department: "unclassified"
	},
	{
		name: "short pasta",
		department: "unclassified"
	},
	{
		name: "all purpose seasoning",
		department: "unclassified"
	},
	{
		name: "sugar cookies",
		department: "unclassified"
	},
	{
		name: "cavatappi",
		department: "unclassified"
	},
	{
		name: "crisps",
		department: "unclassified"
	},
	{
		name: "garlic shoots",
		department: "unclassified"
	},
	{
		name: "garlic stems",
		department: "unclassified"
	},
	{
		name: "garlic scapes",
		department: "unclassified"
	},
	{
		name: "chili seasoning",
		department: "unclassified"
	},
	{
		name: "angel food cake mix",
		department: "unclassified"
	},
	{
		name: "silver",
		department: "unclassified"
	},
	{
		name: "veal shanks",
		department: "unclassified"
	},
	{
		name: "white almond bark",
		department: "unclassified"
	},
	{
		name: "white confectionery coating",
		department: "unclassified"
	},
	{
		name: "eel",
		department: "unclassified"
	},
	{
		name: "soy yogurt",
		department: "unclassified"
	},
	{
		name: "quinoa flakes",
		department: "unclassified"
	},
	{
		name: "foie gras",
		department: "unclassified"
	},
	{
		name: "peeled apples",
		department: "unclassified"
	},
	{
		name: "sugar pumpkin",
		department: "unclassified"
	},
	{
		name: "Mrs. Dash",
		department: "unclassified"
	},
	{
		name: "bread rolls",
		department: "unclassified"
	},
	{
		name: "rice pudding",
		department: "unclassified"
	},
	{
		name: "milk rice",
		department: "unclassified"
	},
	{
		name: "caper berries",
		department: "unclassified"
	},
	{
		name: "caperberries",
		department: "unclassified"
	},
	{
		name: "sunflower seed butter",
		department: "unclassified"
	},
	{
		name: "strawberry jelly",
		department: "unclassified"
	},
	{
		name: "cayenne pepper sauce",
		department: "unclassified"
	},
	{
		name: "potato puree",
		department: "unclassified"
	},
	{
		name: "Tipo 00 flour",
		department: "unclassified"
	},
	{
		name: "00 flour",
		department: "unclassified"
	},
	{
		name: "durum wheat flour",
		department: "unclassified"
	},
	{
		name: "chardonnay",
		department: "unclassified"
	},
	{
		name: "Ranch Style Beans",
		department: "unclassified"
	},
	{
		name: "whole wheat penne",
		department: "unclassified"
	},
	{
		name: "medium-grain rice",
		department: "unclassified"
	},
	{
		name: "gluten-free breadcrumbs",
		department: "unclassified"
	},
	{
		name: "non-dairy margarine",
		department: "unclassified"
	},
	{
		name: "clover honey",
		department: "unclassified"
	},
	{
		name: "sparkling sugar",
		department: "unclassified"
	},
	{
		name: "unsalted roasted peanuts",
		department: "unclassified"
	},
	{
		name: "beer radish",
		department: "unclassified"
	},
	{
		name: "Campbell's Condensed Cream of Mushroom Soup",
		department: "unclassified"
	},
	{
		name: "mixed peel",
		department: "unclassified"
	},
	{
		name: "crab boil",
		department: "unclassified"
	},
	{
		name: "buttery spread",
		department: "unclassified"
	},
	{
		name: "potato gnocchi",
		department: "unclassified"
	},
	{
		name: "red pepper hot sauce",
		department: "unclassified"
	},
	{
		name: "slab bacon",
		department: "unclassified"
	},
	{
		name: "mcintosh apples",
		department: "unclassified"
	},
	{
		name: "guava",
		department: "unclassified"
	},
	{
		name: "tuna fillets",
		department: "unclassified"
	},
	{
		name: "liver pate",
		department: "unclassified"
	},
	{
		name: "citrus",
		department: "unclassified"
	},
	{
		name: "white grape juice",
		department: "unclassified"
	},
	{
		name: "black salt",
		department: "unclassified"
	},
	{
		name: "pastrami",
		department: "unclassified"
	},
	{
		name: "zesty italian dressing",
		department: "unclassified"
	},
	{
		name: "montreal steak seasoning",
		department: "unclassified"
	},
	{
		name: "herb vinegar",
		department: "unclassified"
	},
	{
		name: "french rolls",
		department: "unclassified"
	},
	{
		name: "egg wash",
		department: "unclassified"
	},
	{
		name: "turkey thigh",
		department: "unclassified"
	},
	{
		name: "shanks",
		department: "unclassified"
	},
	{
		name: "drippings",
		department: "unclassified"
	},
	{
		name: "kool-aid",
		department: "unclassified"
	},
	{
		name: "liquid sweetener",
		department: "unclassified"
	},
	{
		name: "cream sherry",
		department: "unclassified"
	},
	{
		name: "cabanossi sausage",
		department: "unclassified"
	},
	{
		name: "roasted pistachios",
		department: "unclassified"
	},
	{
		name: "unsalted almonds",
		department: "unclassified"
	},
	{
		name: "dried plum",
		department: "unclassified"
	},
	{
		name: "ch\\u00E8vre",
		department: "unclassified"
	},
	{
		name: "morello cherries",
		department: "unclassified"
	},
	{
		name: "chayotes",
		department: "unclassified"
	},
	{
		name: "assorted fresh vegetables",
		department: "unclassified"
	},
	{
		name: "ajvar",
		department: "unclassified"
	},
	{
		name: "pumpkin pie filling",
		department: "unclassified"
	},
	{
		name: "chopped bacon",
		department: "unclassified"
	},
	{
		name: "french onion soup",
		department: "unclassified"
	},
	{
		name: "halibut steak",
		department: "unclassified"
	},
	{
		name: "Malibu Caribbean Rum",
		department: "unclassified"
	},
	{
		name: "Malibu Rum",
		department: "unclassified"
	},
	{
		name: "malibu",
		department: "unclassified"
	},
	{
		name: "nori sheets",
		department: "unclassified"
	},
	{
		name: "curly parsley",
		department: "unclassified"
	},
	{
		name: "cooking liquid",
		department: "unclassified"
	},
	{
		name: "beef shank",
		department: "unclassified"
	},
	{
		name: "beef shank meat",
		department: "unclassified"
	},
	{
		name: "Hershey's Kisses",
		department: "unclassified"
	},
	{
		name: "guajillo chiles",
		department: "unclassified"
	},
	{
		name: "reduced-sodium tamari sauce",
		department: "unclassified"
	},
	{
		name: "low sodium tamari sauce",
		department: "unclassified"
	},
	{
		name: "zander fillets",
		department: "unclassified"
	},
	{
		name: "pikeperch fillets",
		department: "unclassified"
	},
	{
		name: "Puffed Rice Cereal",
		department: "unclassified"
	},
	{
		name: "moong dal",
		department: "unclassified"
	},
	{
		name: "banana chips",
		department: "unclassified"
	},
	{
		name: "Golden Reinette apples",
		department: "unclassified"
	},
	{
		name: "poblano",
		department: "unclassified"
	},
	{
		name: "snickers",
		department: "unclassified"
	},
	{
		name: "calf liver",
		department: "unclassified"
	},
	{
		name: "Nestle Carnation Evaporated Milk",
		department: "unclassified"
	},
	{
		name: "matzos",
		department: "unclassified"
	},
	{
		name: "boneless beef chuck",
		department: "unclassified"
	},
	{
		name: "habanero chile",
		department: "unclassified"
	},
	{
		name: "kruidenbouillon",
		department: "unclassified"
	},
	{
		name: "almond oil",
		department: "unclassified"
	},
	{
		name: "unbaked pie shells",
		department: "unclassified"
	},
	{
		name: "king bolete",
		department: "unclassified"
	},
	{
		name: "tomato basil sauce",
		department: "unclassified"
	},
	{
		name: "duck drumsticks",
		department: "unclassified"
	},
	{
		name: "cuban peppers",
		department: "unclassified"
	},
	{
		name: "Italian frying peppers",
		department: "unclassified"
	},
	{
		name: "cubanelles",
		department: "unclassified"
	},
	{
		name: "stem ginger",
		department: "unclassified"
	},
	{
		name: "epazote",
		department: "unclassified"
	},
	{
		name: "natural cocoa",
		department: "unclassified"
	},
	{
		name: "strawberry yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat mozzarella cheese",
		department: "unclassified"
	},
	{
		name: "ground sumac",
		department: "unclassified"
	},
	{
		name: "chinese noodles",
		department: "unclassified"
	},
	{
		name: "quick-cooking barley",
		department: "unclassified"
	},
	{
		name: "mexican chocolate",
		department: "unclassified"
	},
	{
		name: "coke",
		department: "unclassified"
	},
	{
		name: "chocolate liqueur",
		department: "unclassified"
	},
	{
		name: "hearts of romaine",
		department: "unclassified"
	},
	{
		name: "beef base",
		department: "unclassified"
	},
	{
		name: "brown rice vinegar",
		department: "unclassified"
	},
	{
		name: "bean paste",
		department: "unclassified"
	},
	{
		name: "self-rising cornmeal",
		department: "unclassified"
	},
	{
		name: "mango juice",
		department: "unclassified"
	},
	{
		name: "cherry peppers",
		department: "unclassified"
	},
	{
		name: "condensed golden mushroom soup",
		department: "unclassified"
	},
	{
		name: "cherry jam",
		department: "unclassified"
	},
	{
		name: "anise extract",
		department: "unclassified"
	},
	{
		name: "All-Bran Cereal",
		department: "unclassified"
	},
	{
		name: "apricot brandy",
		department: "unclassified"
	},
	{
		name: "radish sprouts",
		department: "unclassified"
	},
	{
		name: "baby beets",
		department: "unclassified"
	},
	{
		name: "onion soup",
		department: "unclassified"
	},
	{
		name: "haddock",
		department: "unclassified"
	},
	{
		name: "cream of potato soup",
		department: "unclassified"
	},
	{
		name: "ragu",
		department: "unclassified"
	},
	{
		name: "Campbell's Condensed Cream of Chicken Soup",
		department: "unclassified"
	},
	{
		name: "Amaretti Cookies",
		department: "unclassified"
	},
	{
		name: "mahi mahi fillets",
		department: "unclassified"
	},
	{
		name: "pimenton",
		department: "unclassified"
	},
	{
		name: "butter cookies",
		department: "unclassified"
	},
	{
		name: "crayfish",
		department: "unclassified"
	},
	{
		name: "river crabs",
		department: "unclassified"
	},
	{
		name: "blueberry jam",
		department: "unclassified"
	},
	{
		name: "plum pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "pumpernickel",
		department: "unclassified"
	},
	{
		name: "southern comfort",
		department: "unclassified"
	},
	{
		name: "white corn tortillas",
		department: "unclassified"
	},
	{
		name: "Scotch whisky",
		department: "unclassified"
	},
	{
		name: "soybean oil",
		department: "unclassified"
	},
	{
		name: "braggs liquid aminos",
		department: "unclassified"
	},
	{
		name: "black bean sauce",
		department: "unclassified"
	},
	{
		name: "herbal butter",
		department: "unclassified"
	},
	{
		name: "oil packed anchovy fillets",
		department: "unclassified"
	},
	{
		name: "mini pretzel twists",
		department: "unclassified"
	},
	{
		name: "sesame paste",
		department: "unclassified"
	},
	{
		name: "madeira wine",
		department: "unclassified"
	},
	{
		name: "red radishes",
		department: "unclassified"
	},
	{
		name: "basmati",
		department: "unclassified"
	},
	{
		name: "chinese black vinegar",
		department: "unclassified"
	},
	{
		name: "jerk seasoning",
		department: "unclassified"
	},
	{
		name: "nut oil",
		department: "unclassified"
	},
	{
		name: "all purpose potatoes",
		department: "unclassified"
	},
	{
		name: "dried beef",
		department: "unclassified"
	},
	{
		name: "bologna",
		department: "unclassified"
	},
	{
		name: "house seasoning",
		department: "unclassified"
	},
	{
		name: "sweet peas",
		department: "unclassified"
	},
	{
		name: "celery heart",
		department: "unclassified"
	},
	{
		name: "sole",
		department: "unclassified"
	},
	{
		name: "low-fat cheese",
		department: "unclassified"
	},
	{
		name: "focaccia",
		department: "unclassified"
	},
	{
		name: "roast beef deli meat",
		department: "unclassified"
	},
	{
		name: "Knudsen Sour Cream",
		department: "unclassified"
	},
	{
		name: "cajun spice mix",
		department: "unclassified"
	},
	{
		name: "flavored oil",
		department: "unclassified"
	},
	{
		name: "deep dish pie crust",
		department: "unclassified"
	},
	{
		name: "pizza toppings",
		department: "unclassified"
	},
	{
		name: "buckwheat groats",
		department: "unclassified"
	},
	{
		name: "meatloaf",
		department: "unclassified"
	},
	{
		name: "crostini",
		department: "unclassified"
	},
	{
		name: "pork rind",
		department: "unclassified"
	},
	{
		name: "pork rinds",
		department: "unclassified"
	},
	{
		name: "cracklings",
		department: "unclassified"
	},
	{
		name: "vanilla soy milk",
		department: "unclassified"
	},
	{
		name: "glutinous rice",
		department: "unclassified"
	},
	{
		name: "mexican chorizo",
		department: "unclassified"
	},
	{
		name: "Jiffy Corn Muffin Mix",
		department: "unclassified"
	},
	{
		name: "crayfish tails",
		department: "unclassified"
	},
	{
		name: "cubed potatoes",
		department: "unclassified"
	},
	{
		name: "vanilla bean ice cream",
		department: "unclassified"
	},
	{
		name: "fried rice",
		department: "unclassified"
	},
	{
		name: "fresh turmeric",
		department: "unclassified"
	},
	{
		name: "free-range chickens",
		department: "unclassified"
	},
	{
		name: "natural vanilla extract",
		department: "unclassified"
	},
	{
		name: "essential oils",
		department: "unclassified"
	},
	{
		name: "black rice",
		department: "unclassified"
	},
	{
		name: "Hellmann's\\u00AE Real Mayonnaise",
		department: "unclassified"
	},
	{
		name: "polish sausage",
		department: "unclassified"
	},
	{
		name: "Land O Lakes\\u00AE Butter",
		department: "unclassified"
	},
	{
		name: "2% lowfat greek yogurt",
		department: "unclassified"
	},
	{
		name: "grilled chicken breasts",
		department: "unclassified"
	},
	{
		name: "extra light olive oil",
		department: "unclassified"
	},
	{
		name: "manicotti",
		department: "unclassified"
	},
	{
		name: "shredded low-fat cheddar cheese",
		department: "unclassified"
	},
	{
		name: "peppermint oil",
		department: "unclassified"
	},
	{
		name: "piecrust",
		department: "unclassified"
	},
	{
		name: "malt",
		department: "unclassified"
	},
	{
		name: "diced chicken",
		department: "unclassified"
	},
	{
		name: "mild green chiles",
		department: "unclassified"
	},
	{
		name: "mild green chili peppers",
		department: "unclassified"
	},
	{
		name: "tuna drained and flaked",
		department: "unclassified"
	},
	{
		name: "apple brandy",
		department: "unclassified"
	},
	{
		name: "cachaca",
		department: "unclassified"
	},
	{
		name: "cacha\\u00E7a",
		department: "unclassified"
	},
	{
		name: "coco",
		department: "unclassified"
	},
	{
		name: "pasilla chiles",
		department: "unclassified"
	},
	{
		name: "karo syrup",
		department: "unclassified"
	},
	{
		name: "Gold Medal\\u00AE All-Purpose Flour",
		department: "unclassified"
	},
	{
		name: "chicken breast strips",
		department: "unclassified"
	},
	{
		name: "shortbread",
		department: "unclassified"
	},
	{
		name: "hazelnut liqueur",
		department: "unclassified"
	},
	{
		name: "mie",
		department: "unclassified"
	},
	{
		name: "colored sprinkles",
		department: "unclassified"
	},
	{
		name: "beef bones",
		department: "unclassified"
	},
	{
		name: "pork spare ribs",
		department: "unclassified"
	},
	{
		name: "lamb loin",
		department: "unclassified"
	},
	{
		name: "red sockeye",
		department: "unclassified"
	},
	{
		name: "red salmon",
		department: "unclassified"
	},
	{
		name: "lemon pudding",
		department: "unclassified"
	},
	{
		name: "uncle bens",
		department: "unclassified"
	},
	{
		name: "smoked cheddar cheese",
		department: "unclassified"
	},
	{
		name: "prepared pie crusts",
		department: "unclassified"
	},
	{
		name: "cornbread stuffing mix",
		department: "unclassified"
	},
	{
		name: "biscuit baking mix",
		department: "unclassified"
	},
	{
		name: "rice bran oil",
		department: "unclassified"
	},
	{
		name: "frozen sweet corn",
		department: "unclassified"
	},
	{
		name: "ouzo",
		department: "unclassified"
	},
	{
		name: "tamarind concentrate",
		department: "unclassified"
	},
	{
		name: "fermented black beans",
		department: "unclassified"
	},
	{
		name: "gumdrops",
		department: "unclassified"
	},
	{
		name: "gum drops",
		department: "unclassified"
	},
	{
		name: "armagnac",
		department: "unclassified"
	},
	{
		name: "wonton skins",
		department: "unclassified"
	},
	{
		name: "crispbreads",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Bacon",
		department: "unclassified"
	},
	{
		name: "strawberry cake mix",
		department: "unclassified"
	},
	{
		name: "fine granulated sugar",
		department: "unclassified"
	},
	{
		name: "tomatillo salsa",
		department: "unclassified"
	},
	{
		name: "sugar pearls",
		department: "unclassified"
	},
	{
		name: "channa dal",
		department: "unclassified"
	},
	{
		name: "ditalini",
		department: "unclassified"
	},
	{
		name: "black mission figs",
		department: "unclassified"
	},
	{
		name: "diced pimentos",
		department: "unclassified"
	},
	{
		name: "purple potatoes",
		department: "unclassified"
	},
	{
		name: "shark",
		department: "unclassified"
	},
	{
		name: "monkfish fillets",
		department: "unclassified"
	},
	{
		name: "tamarind juice",
		department: "unclassified"
	},
	{
		name: "baby gem lettuce",
		department: "unclassified"
	},
	{
		name: "wok oil",
		department: "unclassified"
	},
	{
		name: "green garlic",
		department: "unclassified"
	},
	{
		name: "Dr. Pepper\\u00AE",
		department: "unclassified"
	},
	{
		name: "cake batter",
		department: "unclassified"
	},
	{
		name: "boneless sirloin steak",
		department: "unclassified"
	},
	{
		name: "gochugaru",
		department: "unclassified"
	},
	{
		name: "redfish fillet",
		department: "unclassified"
	},
	{
		name: "hot chili oil",
		department: "unclassified"
	},
	{
		name: "ground tumeric",
		department: "unclassified"
	},
	{
		name: "pie pastry",
		department: "unclassified"
	},
	{
		name: "lemon verbena",
		department: "unclassified"
	},
	{
		name: "spelt",
		department: "unclassified"
	},
	{
		name: "Kitchen Bouquet",
		department: "unclassified"
	},
	{
		name: "fresh onion",
		department: "unclassified"
	},
	{
		name: "gai lan",
		department: "unclassified"
	},
	{
		name: "Chinese broccoli",
		department: "unclassified"
	},
	{
		name: "Chinese kale",
		department: "unclassified"
	},
	{
		name: "kai lan",
		department: "unclassified"
	},
	{
		name: "pork rib chops",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Pure Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "file powder",
		department: "unclassified"
	},
	{
		name: "gran marnier",
		department: "unclassified"
	},
	{
		name: "Grand Marnier Liqueur",
		department: "unclassified"
	},
	{
		name: "dal",
		department: "unclassified"
	},
	{
		name: "candlenuts",
		department: "unclassified"
	},
	{
		name: "lean minced beef",
		department: "unclassified"
	},
	{
		name: "blackberry jam",
		department: "unclassified"
	},
	{
		name: "Heath Candy Bars",
		department: "unclassified"
	},
	{
		name: "whole wheat lasagna noodles",
		department: "unclassified"
	},
	{
		name: "instant oats",
		department: "unclassified"
	},
	{
		name: "goose fat",
		department: "unclassified"
	},
	{
		name: "smoked sea salt",
		department: "unclassified"
	},
	{
		name: "hamburger patties",
		department: "unclassified"
	},
	{
		name: "margarita mix",
		department: "unclassified"
	},
	{
		name: "barbecue rub",
		department: "unclassified"
	},
	{
		name: "bbq rub",
		department: "unclassified"
	},
	{
		name: "palm oil",
		department: "unclassified"
	},
	{
		name: "vegan cheese",
		department: "unclassified"
	},
	{
		name: "flat iron steaks",
		department: "unclassified"
	},
	{
		name: "chai tea",
		department: "unclassified"
	},
	{
		name: "vanilla frozen yogurt",
		department: "unclassified"
	},
	{
		name: "chipotle sauce",
		department: "unclassified"
	},
	{
		name: "cream sauce",
		department: "unclassified"
	},
	{
		name: "Hatch Green Chiles",
		department: "unclassified"
	},
	{
		name: "borlotti beans",
		department: "unclassified"
	},
	{
		name: "beet greens",
		department: "unclassified"
	},
	{
		name: "chocolate wafer crumbs",
		department: "unclassified"
	},
	{
		name: "garlic pepper seasoning",
		department: "unclassified"
	},
	{
		name: "lemon yogurt",
		department: "unclassified"
	},
	{
		name: "roasted sesame seeds",
		department: "unclassified"
	},
	{
		name: "gray salt",
		department: "unclassified"
	},
	{
		name: "light pancake syrup",
		department: "unclassified"
	},
	{
		name: "instant polenta",
		department: "unclassified"
	},
	{
		name: "swordfish",
		department: "unclassified"
	},
	{
		name: "pasta shapes",
		department: "unclassified"
	},
	{
		name: "ice cream cones",
		department: "unclassified"
	},
	{
		name: "mince meat seasoning",
		department: "unclassified"
	},
	{
		name: "diced bell pepper",
		department: "unclassified"
	},
	{
		name: "orange jam",
		department: "unclassified"
	},
	{
		name: "green split peas",
		department: "unclassified"
	},
	{
		name: "albacore tuna in water",
		department: "unclassified"
	},
	{
		name: "sticky rice",
		department: "unclassified"
	},
	{
		name: "yellow tomato",
		department: "unclassified"
	},
	{
		name: "ahi",
		department: "unclassified"
	},
	{
		name: "pineapple preserves",
		department: "unclassified"
	},
	{
		name: "white cheese",
		department: "unclassified"
	},
	{
		name: "glutinous rice flour",
		department: "unclassified"
	},
	{
		name: "schmaltz",
		department: "unclassified"
	},
	{
		name: "chicken fat",
		department: "unclassified"
	},
	{
		name: "carrot sticks",
		department: "unclassified"
	},
	{
		name: "Kraft Caramels",
		department: "unclassified"
	},
	{
		name: "rice stick noodles",
		department: "unclassified"
	},
	{
		name: "black currant",
		department: "unclassified"
	},
	{
		name: "roux",
		department: "unclassified"
	},
	{
		name: "citron",
		department: "unclassified"
	},
	{
		name: "Fuyu persimmons",
		department: "unclassified"
	},
	{
		name: "honey dijon mustard",
		department: "unclassified"
	},
	{
		name: "summer savory",
		department: "unclassified"
	},
	{
		name: "bucatini",
		department: "unclassified"
	},
	{
		name: "cornish game hens",
		department: "unclassified"
	},
	{
		name: "soft margarine",
		department: "unclassified"
	},
	{
		name: "biscotti",
		department: "unclassified"
	},
	{
		name: "cantuccini",
		department: "unclassified"
	},
	{
		name: "yukon gold",
		department: "unclassified"
	},
	{
		name: "whole wheat pizza dough",
		department: "unclassified"
	},
	{
		name: "saffron powder",
		department: "unclassified"
	},
	{
		name: "sour mix",
		department: "unclassified"
	},
	{
		name: "teriyaki marinade",
		department: "unclassified"
	},
	{
		name: "barley flour",
		department: "unclassified"
	},
	{
		name: "lavender buds",
		department: "unclassified"
	},
	{
		name: "italian style stewed tomatoes",
		department: "unclassified"
	},
	{
		name: "shrimp stock",
		department: "unclassified"
	},
	{
		name: "olive oil mayonnaise",
		department: "unclassified"
	},
	{
		name: "cherry brandy",
		department: "unclassified"
	},
	{
		name: "chambord",
		department: "unclassified"
	},
	{
		name: "yardlong beans",
		department: "unclassified"
	},
	{
		name: "Chinese long beans",
		department: "unclassified"
	},
	{
		name: "nonfat powdered milk",
		department: "unclassified"
	},
	{
		name: "Biscoff Creamy Spread",
		department: "unclassified"
	},
	{
		name: "lamb stew meat",
		department: "unclassified"
	},
	{
		name: "gravy mix",
		department: "unclassified"
	},
	{
		name: "albacore",
		department: "unclassified"
	},
	{
		name: "queso blanco",
		department: "unclassified"
	},
	{
		name: "turkey gravy",
		department: "unclassified"
	},
	{
		name: "gluten flour",
		department: "unclassified"
	},
	{
		name: "cabernet sauvignon",
		department: "unclassified"
	},
	{
		name: "pink grapefruit juice",
		department: "unclassified"
	},
	{
		name: "nut milk",
		department: "unclassified"
	},
	{
		name: "textured soy protein",
		department: "unclassified"
	},
	{
		name: "V8 Vegetable Juice",
		department: "unclassified"
	},
	{
		name: "ginger garlic paste",
		department: "unclassified"
	},
	{
		name: "tostadas",
		department: "unclassified"
	},
	{
		name: "fast rising yeast",
		department: "unclassified"
	},
	{
		name: "fruit cocktail",
		department: "unclassified"
	},
	{
		name: "raw pistachios",
		department: "unclassified"
	},
	{
		name: "pappardelle pasta",
		department: "unclassified"
	},
	{
		name: "pan drippings",
		department: "unclassified"
	},
	{
		name: "bean threads",
		department: "unclassified"
	},
	{
		name: "chestnut pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "Gold Medal Flour",
		department: "unclassified"
	},
	{
		name: "thyme sprig",
		department: "unclassified"
	},
	{
		name: "candied peel",
		department: "unclassified"
	},
	{
		name: "whole milk greek yogurt",
		department: "unclassified"
	},
	{
		name: "gluten-free bread",
		department: "unclassified"
	},
	{
		name: "hazelnut flakes",
		department: "unclassified"
	},
	{
		name: "turkey kielbasa",
		department: "unclassified"
	},
	{
		name: "crusty rolls",
		department: "unclassified"
	},
	{
		name: "Old El Paso\\u2122 taco seasoning mix",
		department: "unclassified"
	},
	{
		name: "gluten-free pasta",
		department: "unclassified"
	},
	{
		name: "won ton wrappers",
		department: "unclassified"
	},
	{
		name: "canning salt",
		department: "unclassified"
	},
	{
		name: "bonito flakes",
		department: "unclassified"
	},
	{
		name: "cube steaks",
		department: "unclassified"
	},
	{
		name: "peppadews",
		department: "unclassified"
	},
	{
		name: "dried mango",
		department: "unclassified"
	},
	{
		name: "black vinegar",
		department: "unclassified"
	},
	{
		name: "bran flakes",
		department: "unclassified"
	},
	{
		name: "refrigerated sugar cookie dough",
		department: "unclassified"
	},
	{
		name: "cubed beef",
		department: "unclassified"
	},
	{
		name: "pear juice",
		department: "unclassified"
	},
	{
		name: "fudge topping",
		department: "unclassified"
	},
	{
		name: "jimmies",
		department: "unclassified"
	},
	{
		name: "double crust pie",
		department: "unclassified"
	},
	{
		name: "roasted pumpkin seeds",
		department: "unclassified"
	},
	{
		name: "pickled herring fillets",
		department: "unclassified"
	},
	{
		name: "rainbow trout",
		department: "unclassified"
	},
	{
		name: "salmon trout",
		department: "unclassified"
	},
	{
		name: "cornflake cereal",
		department: "unclassified"
	},
	{
		name: "brioche buns",
		department: "unclassified"
	},
	{
		name: "brioche rolls",
		department: "unclassified"
	},
	{
		name: "diabetic sweetner",
		department: "unclassified"
	},
	{
		name: "extra sharp white cheddar cheese",
		department: "unclassified"
	},
	{
		name: "sugar beet molasses",
		department: "unclassified"
	},
	{
		name: "sweet cream butter",
		department: "unclassified"
	},
	{
		name: "chicken bones",
		department: "unclassified"
	},
	{
		name: "hibiscus flowers",
		department: "unclassified"
	},
	{
		name: "egg beaters",
		department: "unclassified"
	},
	{
		name: "thin pizza crust",
		department: "unclassified"
	},
	{
		name: "chat masala",
		department: "unclassified"
	},
	{
		name: "cones",
		department: "unclassified"
	},
	{
		name: "remoulade",
		department: "unclassified"
	},
	{
		name: "raspberry syrup",
		department: "unclassified"
	},
	{
		name: "confit",
		department: "unclassified"
	},
	{
		name: "cured pork cutlet",
		department: "unclassified"
	},
	{
		name: "baby artichokes",
		department: "unclassified"
	},
	{
		name: "Marcona almonds",
		department: "unclassified"
	},
	{
		name: "white peaches",
		department: "unclassified"
	},
	{
		name: "rustic bread",
		department: "unclassified"
	},
	{
		name: "black truffles",
		department: "unclassified"
	},
	{
		name: "chinese sausage",
		department: "unclassified"
	},
	{
		name: "black bread",
		department: "unclassified"
	},
	{
		name: "whipped cream yoghurt",
		department: "unclassified"
	},
	{
		name: "candied pineapple",
		department: "unclassified"
	},
	{
		name: "Wish-Bone Italian Dressing",
		department: "unclassified"
	},
	{
		name: "tawny port",
		department: "unclassified"
	},
	{
		name: "kahl\\u00FAa",
		department: "unclassified"
	},
	{
		name: "country white bread",
		department: "unclassified"
	},
	{
		name: "clotted cream",
		department: "unclassified"
	},
	{
		name: "Mazola Corn Oil",
		department: "unclassified"
	},
	{
		name: "jack daniels",
		department: "unclassified"
	},
	{
		name: "medium dry sherry",
		department: "unclassified"
	},
	{
		name: "rhubarb stalks",
		department: "unclassified"
	},
	{
		name: "poblano chilies",
		department: "unclassified"
	},
	{
		name: "rice cakes",
		department: "unclassified"
	},
	{
		name: "pork blade steaks",
		department: "unclassified"
	},
	{
		name: "orange blossom honey",
		department: "unclassified"
	},
	{
		name: "Mexican seasoning mix",
		department: "unclassified"
	},
	{
		name: "Mexican seasoning",
		department: "unclassified"
	},
	{
		name: "white quinoa",
		department: "unclassified"
	},
	{
		name: "acacia honey",
		department: "unclassified"
	},
	{
		name: "straw mushrooms",
		department: "unclassified"
	},
	{
		name: "white creme de cacao",
		department: "unclassified"
	},
	{
		name: "cremini",
		department: "unclassified"
	},
	{
		name: "cheese soup",
		department: "unclassified"
	},
	{
		name: "Japanese soy sauce",
		department: "unclassified"
	},
	{
		name: "stone-ground cornmeal",
		department: "unclassified"
	},
	{
		name: "amaretti",
		department: "unclassified"
	},
	{
		name: "okra pods",
		department: "unclassified"
	},
	{
		name: "lamb rib chops",
		department: "unclassified"
	},
	{
		name: "wondra flour",
		department: "unclassified"
	},
	{
		name: "prawn crackers",
		department: "unclassified"
	},
	{
		name: "zwieback",
		department: "unclassified"
	},
	{
		name: "cr\\u00E8me de cassis",
		department: "unclassified"
	},
	{
		name: "spearmint",
		department: "unclassified"
	},
	{
		name: "steamer",
		department: "unclassified"
	},
	{
		name: "whole wheat english muffins",
		department: "unclassified"
	},
	{
		name: "hard cider",
		department: "unclassified"
	},
	{
		name: "whole grains",
		department: "unclassified"
	},
	{
		name: "hazelnut meal",
		department: "unclassified"
	},
	{
		name: "scotch",
		department: "unclassified"
	},
	{
		name: "peperoncini",
		department: "unclassified"
	},
	{
		name: "baby eggplants",
		department: "unclassified"
	},
	{
		name: "Hershey bars",
		department: "unclassified"
	},
	{
		name: "gemelli",
		department: "unclassified"
	},
	{
		name: "dried minced garlic",
		department: "unclassified"
	},
	{
		name: "white tequila",
		department: "unclassified"
	},
	{
		name: "poppyseeds",
		department: "unclassified"
	},
	{
		name: "hot chocolate mix",
		department: "unclassified"
	},
	{
		name: "red miso",
		department: "unclassified"
	},
	{
		name: "demi-glace",
		department: "unclassified"
	},
	{
		name: "bread and butter pickles",
		department: "unclassified"
	},
	{
		name: "dumpling wrappers",
		department: "unclassified"
	},
	{
		name: "cointreau liqueur",
		department: "unclassified"
	},
	{
		name: "absinthe",
		department: "unclassified"
	},
	{
		name: "strawberry extract",
		department: "unclassified"
	},
	{
		name: "honey mustard dressing",
		department: "unclassified"
	},
	{
		name: "frozen pie crust",
		department: "unclassified"
	},
	{
		name: "pear nectar",
		department: "unclassified"
	},
	{
		name: "parmigiana-reggiano",
		department: "unclassified"
	},
	{
		name: "KRAFT Zesty Italian Dressing",
		department: "unclassified"
	},
	{
		name: "cherry nectar",
		department: "unclassified"
	},
	{
		name: "red chile powder",
		department: "unclassified"
	},
	{
		name: "poultry",
		department: "unclassified"
	},
	{
		name: "lemon pie filling",
		department: "unclassified"
	},
	{
		name: "advocaat",
		department: "unclassified"
	},
	{
		name: "stilton",
		department: "unclassified"
	},
	{
		name: "pancake syrup",
		department: "unclassified"
	},
	{
		name: "pointed peppers",
		department: "unclassified"
	},
	{
		name: "taro",
		department: "unclassified"
	},
	{
		name: "smoked haddock",
		department: "unclassified"
	},
	{
		name: "vermicelli noodles",
		department: "unclassified"
	},
	{
		name: "splenda no calorie sweetener",
		department: "unclassified"
	},
	{
		name: "grappa",
		department: "unclassified"
	},
	{
		name: "olive tapenade",
		department: "unclassified"
	},
	{
		name: "Old El Paso\\u2122 chopped green chiles",
		department: "unclassified"
	},
	{
		name: "dried guajillo chiles",
		department: "unclassified"
	},
	{
		name: "tea leaves",
		department: "unclassified"
	},
	{
		name: "taleggio",
		department: "unclassified"
	},
	{
		name: "herb mix",
		department: "unclassified"
	},
	{
		name: "Bertolli\\u00AE Classico Olive Oil",
		department: "unclassified"
	},
	{
		name: "dream whip",
		department: "unclassified"
	},
	{
		name: "elderflower cordial",
		department: "unclassified"
	},
	{
		name: "peppermint schnapps",
		department: "unclassified"
	},
	{
		name: "goat",
		department: "unclassified"
	},
	{
		name: "whipping heavy cream",
		department: "unclassified"
	},
	{
		name: "turnip greens",
		department: "unclassified"
	},
	{
		name: "Pale Ale",
		department: "unclassified"
	},
	{
		name: "pasta dough",
		department: "unclassified"
	},
	{
		name: "noodle dough",
		department: "unclassified"
	},
	{
		name: "r\\u00F6sti",
		department: "unclassified"
	},
	{
		name: "oyster crackers",
		department: "unclassified"
	},
	{
		name: "crab sticks",
		department: "unclassified"
	},
	{
		name: "wing sauce",
		department: "unclassified"
	},
	{
		name: "low sodium black beans",
		department: "unclassified"
	},
	{
		name: "Spike Seasoning",
		department: "unclassified"
	},
	{
		name: "crumb crust",
		department: "unclassified"
	},
	{
		name: "spanish rice",
		department: "unclassified"
	},
	{
		name: "turkey legs",
		department: "unclassified"
	},
	{
		name: "london broil",
		department: "unclassified"
	},
	{
		name: "squirt",
		department: "unclassified"
	},
	{
		name: "cheerios",
		department: "unclassified"
	},
	{
		name: "shredded coleslaw mix",
		department: "unclassified"
	},
	{
		name: "Corn Flakes Cereal",
		department: "unclassified"
	},
	{
		name: "teff flour",
		department: "unclassified"
	},
	{
		name: "pinot noir",
		department: "unclassified"
	},
	{
		name: "curacao",
		department: "unclassified"
	},
	{
		name: "mushroom broth",
		department: "unclassified"
	},
	{
		name: "marrow",
		department: "unclassified"
	},
	{
		name: "chihuahua cheese",
		department: "unclassified"
	},
	{
		name: "queso chihuahua",
		department: "unclassified"
	},
	{
		name: "oaxaca cheese",
		department: "unclassified"
	},
	{
		name: "marmite",
		department: "unclassified"
	},
	{
		name: "refrigerated chocolate chip cookie dough",
		department: "unclassified"
	},
	{
		name: "salted roasted almonds",
		department: "unclassified"
	},
	{
		name: "frozen fruit",
		department: "unclassified"
	},
	{
		name: "dried rice noodles",
		department: "unclassified"
	},
	{
		name: "coconut syrup",
		department: "unclassified"
	},
	{
		name: "maraschino liqueur",
		department: "unclassified"
	},
	{
		name: "baby leaf lettuce",
		department: "unclassified"
	},
	{
		name: "baton",
		department: "unclassified"
	},
	{
		name: "fresh fava bean",
		department: "unclassified"
	},
	{
		name: "cheez whiz",
		department: "unclassified"
	},
	{
		name: "glycerin",
		department: "unclassified"
	},
	{
		name: "gingersnap crumbs",
		department: "unclassified"
	},
	{
		name: "gevogeltefond",
		department: "unclassified"
	},
	{
		name: "reduced-fat cheese",
		department: "unclassified"
	},
	{
		name: "white vermouth",
		department: "unclassified"
	},
	{
		name: "gold tequila",
		department: "unclassified"
	},
	{
		name: "elderflower liqueur",
		department: "unclassified"
	},
	{
		name: "shawarma",
		department: "unclassified"
	},
	{
		name: "fruit spread",
		department: "unclassified"
	},
	{
		name: "shaved chocolate",
		department: "unclassified"
	},
	{
		name: "Grape-Nuts Cereal",
		department: "unclassified"
	},
	{
		name: "farmer bread",
		department: "unclassified"
	},
	{
		name: "beef strips",
		department: "unclassified"
	},
	{
		name: "farina",
		department: "unclassified"
	},
	{
		name: "marrow bones",
		department: "unclassified"
	},
	{
		name: "cooked meatballs",
		department: "unclassified"
	},
	{
		name: "california avocado",
		department: "unclassified"
	},
	{
		name: "spirulina powder",
		department: "unclassified"
	},
	{
		name: "light agave nectar",
		department: "unclassified"
	},
	{
		name: "Reese's Pieces",
		department: "unclassified"
	},
	{
		name: "black walnut",
		department: "unclassified"
	},
	{
		name: "whole wheat toast",
		department: "unclassified"
	},
	{
		name: "jelly sugar",
		department: "unclassified"
	},
	{
		name: "salted pistachios",
		department: "unclassified"
	},
	{
		name: "dried peas",
		department: "unclassified"
	},
	{
		name: "condensed cream of potato soup",
		department: "unclassified"
	},
	{
		name: "smoked turkey sausage",
		department: "unclassified"
	},
	{
		name: "cow's milk",
		department: "unclassified"
	},
	{
		name: "crushed cornflakes",
		department: "unclassified"
	},
	{
		name: "strawberry pie filling",
		department: "unclassified"
	},
	{
		name: "poundcake",
		department: "unclassified"
	},
	{
		name: "filet mignon steaks",
		department: "unclassified"
	},
	{
		name: "masa",
		department: "unclassified"
	},
	{
		name: "mild salsa",
		department: "unclassified"
	},
	{
		name: "pumpkin butter",
		department: "unclassified"
	},
	{
		name: "sirloin tip roast",
		department: "unclassified"
	},
	{
		name: "green papaya",
		department: "unclassified"
	},
	{
		name: "whipped butter",
		department: "unclassified"
	},
	{
		name: "Bakers Semi-Sweet Baking Chocolate Bar",
		department: "unclassified"
	},
	{
		name: "violets",
		department: "unclassified"
	},
	{
		name: "converted rice",
		department: "unclassified"
	},
	{
		name: "fillet steaks",
		department: "unclassified"
	},
	{
		name: "fruit jelly",
		department: "unclassified"
	},
	{
		name: "chocolate mousse",
		department: "unclassified"
	},
	{
		name: "wafer crumbs",
		department: "unclassified"
	},
	{
		name: "mahi mahi",
		department: "unclassified"
	},
	{
		name: "italian chicken sausage",
		department: "unclassified"
	},
	{
		name: "Minute Tapioca",
		department: "unclassified"
	},
	{
		name: "bows",
		department: "unclassified"
	},
	{
		name: "sub rolls",
		department: "unclassified"
	},
	{
		name: "cura\\u00E7ao",
		department: "unclassified"
	},
	{
		name: "vleesfond",
		department: "unclassified"
	},
	{
		name: "elderflower",
		department: "unclassified"
	},
	{
		name: "elderflowers",
		department: "unclassified"
	},
	{
		name: "elderberries",
		department: "unclassified"
	},
	{
		name: "orange soda",
		department: "unclassified"
	},
	{
		name: "Best Foods\\u00AE Real Mayonnaise",
		department: "unclassified"
	},
	{
		name: "poppy seed filling",
		department: "unclassified"
	},
	{
		name: "beet juice",
		department: "unclassified"
	},
	{
		name: "russet",
		department: "unclassified"
	},
	{
		name: "medaillons of pork",
		department: "unclassified"
	},
	{
		name: "kaffir lime",
		department: "unclassified"
	},
	{
		name: "dried pear",
		department: "unclassified"
	},
	{
		name: "jellied cranberry sauce",
		department: "unclassified"
	},
	{
		name: "smoked mozzarella",
		department: "unclassified"
	},
	{
		name: "chocolate covered coffee beans",
		department: "unclassified"
	},
	{
		name: "sugar free instant chocolate pudding mix",
		department: "unclassified"
	},
	{
		name: "lemon flavor instant pudding mix",
		department: "unclassified"
	},
	{
		name: "Bartlett Pear",
		department: "unclassified"
	},
	{
		name: "low-fat plain greek yogurt",
		department: "unclassified"
	},
	{
		name: "whole oats",
		department: "unclassified"
	},
	{
		name: "peach pie filling",
		department: "unclassified"
	},
	{
		name: "crumb topping",
		department: "unclassified"
	},
	{
		name: "halloumi",
		department: "unclassified"
	},
	{
		name: "mousse",
		department: "unclassified"
	},
	{
		name: "meat tenderizer",
		department: "unclassified"
	},
	{
		name: "horseradish root",
		department: "unclassified"
	},
	{
		name: "oyster liquor",
		department: "unclassified"
	},
	{
		name: "varnish clams",
		department: "unclassified"
	},
	{
		name: "savoury clams",
		department: "unclassified"
	},
	{
		name: "manila clams",
		department: "unclassified"
	},
	{
		name: "proscuitto",
		department: "unclassified"
	},
	{
		name: "malted milk ball",
		department: "unclassified"
	},
	{
		name: "Jif Creamy Peanut Butter",
		department: "unclassified"
	},
	{
		name: "whole wheat buns",
		department: "unclassified"
	},
	{
		name: "kirschenliqueur",
		department: "unclassified"
	},
	{
		name: "cherry liqueur",
		department: "unclassified"
	},
	{
		name: "raclette",
		department: "unclassified"
	},
	{
		name: "raclette cheese",
		department: "unclassified"
	},
	{
		name: "cookie butter",
		department: "unclassified"
	},
	{
		name: "Chobani Yogurt",
		department: "unclassified"
	},
	{
		name: "hot cooked noodles",
		department: "unclassified"
	},
	{
		name: "chopped salmon",
		department: "unclassified"
	},
	{
		name: "butter flakes",
		department: "unclassified"
	},
	{
		name: "chicken carcass",
		department: "unclassified"
	},
	{
		name: "cream filled chocolate sandwich cookies",
		department: "unclassified"
	},
	{
		name: "Snickers Candy Bars",
		department: "unclassified"
	},
	{
		name: "Dungeness crabs",
		department: "unclassified"
	},
	{
		name: "canned salmon",
		department: "unclassified"
	},
	{
		name: "wide rice noodles",
		department: "unclassified"
	},
	{
		name: "star fruit",
		department: "unclassified"
	},
	{
		name: "sorghum",
		department: "unclassified"
	},
	{
		name: "streusel topping",
		department: "unclassified"
	},
	{
		name: "sesame seeds buns",
		department: "unclassified"
	},
	{
		name: "guinea fowl",
		department: "unclassified"
	},
	{
		name: "roasted sunflower seeds",
		department: "unclassified"
	},
	{
		name: "yellow miso",
		department: "unclassified"
	},
	{
		name: "blackening seasoning",
		department: "unclassified"
	},
	{
		name: "toor dal",
		department: "unclassified"
	},
	{
		name: "stewing steak",
		department: "unclassified"
	},
	{
		name: "sweet gherkin",
		department: "unclassified"
	},
	{
		name: "California bay leaves",
		department: "unclassified"
	},
	{
		name: "low-fat whipping cream",
		department: "unclassified"
	},
	{
		name: "giardiniera",
		department: "unclassified"
	},
	{
		name: "center-cut salmon fillet",
		department: "unclassified"
	},
	{
		name: "sugar free chocolate chips",
		department: "unclassified"
	},
	{
		name: "butterfinger",
		department: "unclassified"
	},
	{
		name: "dried orange peel",
		department: "unclassified"
	},
	{
		name: "reduced fat whipped topping",
		department: "unclassified"
	},
	{
		name: "green tea powder",
		department: "unclassified"
	},
	{
		name: "lecithin",
		department: "unclassified"
	},
	{
		name: "achiote paste",
		department: "unclassified"
	},
	{
		name: "light karo syrup",
		department: "unclassified"
	},
	{
		name: "dessert wine",
		department: "unclassified"
	},
	{
		name: "italian eggplant",
		department: "unclassified"
	},
	{
		name: "soba",
		department: "unclassified"
	},
	{
		name: "pork liver",
		department: "unclassified"
	},
	{
		name: "guanciale",
		department: "unclassified"
	},
	{
		name: "ground bison",
		department: "unclassified"
	},
	{
		name: "jackfruit",
		department: "unclassified"
	},
	{
		name: "Peeps",
		department: "unclassified"
	},
	{
		name: "powdered peanut butter",
		department: "unclassified"
	},
	{
		name: "tandoori spices",
		department: "unclassified"
	},
	{
		name: "tandoori masala",
		department: "unclassified"
	},
	{
		name: "pattypan squash",
		department: "unclassified"
	},
	{
		name: "scallop squash",
		department: "unclassified"
	},
	{
		name: "curry leaf",
		department: "unclassified"
	},
	{
		name: "top sirloin",
		department: "unclassified"
	},
	{
		name: "muffin mix",
		department: "unclassified"
	},
	{
		name: "chestnut flour",
		department: "unclassified"
	},
	{
		name: "coconut oil spray",
		department: "unclassified"
	},
	{
		name: "stem ginger in syrup",
		department: "unclassified"
	},
	{
		name: "fish bouillon cube",
		department: "unclassified"
	},
	{
		name: "hot cocoa mix",
		department: "unclassified"
	},
	{
		name: "earl grey tea",
		department: "unclassified"
	},
	{
		name: "frozen yogurt",
		department: "unclassified"
	},
	{
		name: "mango salsa",
		department: "unclassified"
	},
	{
		name: "pizza cheese",
		department: "unclassified"
	},
	{
		name: "black salsify",
		department: "unclassified"
	},
	{
		name: "Butterfinger Candy Bars",
		department: "unclassified"
	},
	{
		name: "octopuses",
		department: "unclassified"
	},
	{
		name: "octopus",
		department: "unclassified"
	},
	{
		name: "earl grey tea bags",
		department: "unclassified"
	},
	{
		name: "rice syrup",
		department: "unclassified"
	},
	{
		name: "ajwain",
		department: "unclassified"
	},
	{
		name: "romaine lettuce hearts",
		department: "unclassified"
	},
	{
		name: "oreo cookie crumbs",
		department: "unclassified"
	},
	{
		name: "stew",
		department: "unclassified"
	},
	{
		name: "lady apples",
		department: "unclassified"
	},
	{
		name: "clementine juice",
		department: "unclassified"
	},
	{
		name: "yellow curry paste",
		department: "unclassified"
	},
	{
		name: "apricot liqueur",
		department: "unclassified"
	},
	{
		name: "medium cheddar cheese",
		department: "unclassified"
	},
	{
		name: "lady fingers",
		department: "unclassified"
	},
	{
		name: "pigeon peas",
		department: "unclassified"
	},
	{
		name: "fat-free refried beans",
		department: "unclassified"
	},
	{
		name: "non-fat refried beans",
		department: "unclassified"
	},
	{
		name: "capellini",
		department: "unclassified"
	},
	{
		name: "carnaroli rice",
		department: "unclassified"
	},
	{
		name: "veal escalopes",
		department: "unclassified"
	},
	{
		name: "fresh orange",
		department: "unclassified"
	},
	{
		name: "Spring! Water",
		department: "unclassified"
	},
	{
		name: "crumbled cornbread",
		department: "unclassified"
	},
	{
		name: "Jarlsberg",
		department: "unclassified"
	},
	{
		name: "Progresso\\u2122 Chicken Broth",
		department: "unclassified"
	},
	{
		name: "dried bonito flakes",
		department: "unclassified"
	},
	{
		name: "gummy worms",
		department: "unclassified"
	},
	{
		name: "Kraft Miracle Whip Light Dressing",
		department: "unclassified"
	},
	{
		name: "quick oatmeal",
		department: "unclassified"
	},
	{
		name: "cracked wheat",
		department: "unclassified"
	},
	{
		name: "black lentil",
		department: "unclassified"
	},
	{
		name: "cinnamon graham crackers",
		department: "unclassified"
	},
	{
		name: "Grey Poupon Dijon Mustard",
		department: "unclassified"
	},
	{
		name: "shichimi togarashi",
		department: "unclassified"
	},
	{
		name: "mixed fruit",
		department: "unclassified"
	},
	{
		name: "black gram",
		department: "unclassified"
	},
	{
		name: "skin on salmon fillets",
		department: "unclassified"
	},
	{
		name: "bee pollen",
		department: "unclassified"
	},
	{
		name: "Knorr Aromat All Purpose Seasoning",
		department: "unclassified"
	},
	{
		name: "adzuki beans",
		department: "unclassified"
	},
	{
		name: "fines herbes",
		department: "unclassified"
	},
	{
		name: "Hawaiian salt",
		department: "unclassified"
	},
	{
		name: "hawaiian sea salt",
		department: "unclassified"
	},
	{
		name: "alaea sea salt",
		department: "unclassified"
	},
	{
		name: "distilled vinegar",
		department: "unclassified"
	},
	{
		name: "red kuri squash",
		department: "unclassified"
	},
	{
		name: "hokkaido pumpkin",
		department: "unclassified"
	},
	{
		name: "zucchini blossoms",
		department: "unclassified"
	},
	{
		name: "fresh pasta",
		department: "unclassified"
	},
	{
		name: "fromage frais",
		department: "unclassified"
	},
	{
		name: "malt powder",
		department: "unclassified"
	},
	{
		name: "petite peas",
		department: "unclassified"
	},
	{
		name: "Planters Pecans",
		department: "unclassified"
	},
	{
		name: "t-bone steak",
		department: "unclassified"
	},
	{
		name: "coconut vinegar",
		department: "unclassified"
	},
	{
		name: "carob chips",
		department: "unclassified"
	},
	{
		name: "cassia cinnamon",
		department: "unclassified"
	},
	{
		name: "cassia",
		department: "unclassified"
	},
	{
		name: "shrimp tails",
		department: "unclassified"
	},
	{
		name: "unseasoned breadcrumbs",
		department: "unclassified"
	},
	{
		name: "matchstick carrots",
		department: "unclassified"
	},
	{
		name: "piquillo peppers",
		department: "unclassified"
	},
	{
		name: "cooking cream",
		department: "unclassified"
	},
	{
		name: "Reddi Wip Whipped Cream",
		department: "unclassified"
	},
	{
		name: "aquafaba",
		department: "unclassified"
	},
	{
		name: "soppressata",
		department: "unclassified"
	},
	{
		name: "soprassata",
		department: "unclassified"
	},
	{
		name: "sopressata",
		department: "unclassified"
	},
	{
		name: "instant oatmeal",
		department: "unclassified"
	},
	{
		name: "light red kidney beans",
		department: "unclassified"
	},
	{
		name: "refried black beans",
		department: "unclassified"
	},
	{
		name: "bone-in turkey breast",
		department: "unclassified"
	},
	{
		name: "butternut",
		department: "unclassified"
	},
	{
		name: "chicken soup base",
		department: "unclassified"
	},
	{
		name: "peppermint candy canes",
		department: "unclassified"
	},
	{
		name: "bass fillets",
		department: "unclassified"
	},
	{
		name: "porterhouse steaks",
		department: "unclassified"
	},
	{
		name: "nonfat cottage cheese",
		department: "unclassified"
	},
	{
		name: "candied citron peel",
		department: "unclassified"
	},
	{
		name: "ravva",
		department: "unclassified"
	},
	{
		name: "duck stock",
		department: "unclassified"
	},
	{
		name: "cinnamon hot candy",
		department: "unclassified"
	},
	{
		name: "snails",
		department: "unclassified"
	},
	{
		name: "pasta sheets",
		department: "unclassified"
	},
	{
		name: "beef round",
		department: "unclassified"
	},
	{
		name: "pancake batter",
		department: "unclassified"
	},
	{
		name: "carp",
		department: "unclassified"
	},
	{
		name: "pretzel rods",
		department: "unclassified"
	},
	{
		name: "stoofperen",
		department: "unclassified"
	},
	{
		name: "chocolate kisses",
		department: "unclassified"
	},
	{
		name: "pear tomatoes",
		department: "unclassified"
	},
	{
		name: "hot chili",
		department: "unclassified"
	},
	{
		name: "cockles",
		department: "unclassified"
	},
	{
		name: "hanger steak",
		department: "unclassified"
	},
	{
		name: "mint chocolate chip ice cream",
		department: "unclassified"
	},
	{
		name: "karo",
		department: "unclassified"
	},
	{
		name: "all bran cereal",
		department: "unclassified"
	},
	{
		name: "chervil leaves",
		department: "unclassified"
	},
	{
		name: "pickled jalapeno peppers",
		department: "unclassified"
	},
	{
		name: "whole wheat linguine",
		department: "unclassified"
	},
	{
		name: "unsalted sunflower kernels",
		department: "unclassified"
	},
	{
		name: "lo mein noodles",
		department: "unclassified"
	},
	{
		name: "pig",
		department: "unclassified"
	},
	{
		name: "low fat cream",
		department: "unclassified"
	},
	{
		name: "hot chili paste",
		department: "unclassified"
	},
	{
		name: "regular sugar",
		department: "unclassified"
	},
	{
		name: "garbanzo bean flour",
		department: "unclassified"
	},
	{
		name: "chicken flavor stuffing mix",
		department: "unclassified"
	},
	{
		name: "white chips",
		department: "unclassified"
	},
	{
		name: "macadamia oil",
		department: "unclassified"
	},
	{
		name: "coconut liqueur",
		department: "unclassified"
	},
	{
		name: "currant juice",
		department: "unclassified"
	},
	{
		name: "peach jam",
		department: "unclassified"
	},
	{
		name: "snappers",
		department: "unclassified"
	},
	{
		name: "tostada shells",
		department: "unclassified"
	},
	{
		name: "single crust pie",
		department: "unclassified"
	},
	{
		name: "salam leaves",
		department: "unclassified"
	},
	{
		name: "yoghurtmayonaise",
		department: "unclassified"
	},
	{
		name: "nestle toll house",
		department: "unclassified"
	},
	{
		name: "snapper fillets",
		department: "unclassified"
	},
	{
		name: "pork shoulder boston butt",
		department: "unclassified"
	},
	{
		name: "instant espresso granules",
		department: "unclassified"
	},
	{
		name: "horseradish cream",
		department: "unclassified"
	},
	{
		name: "Heinz Chili Sauce",
		department: "unclassified"
	},
	{
		name: "pear brandy",
		department: "unclassified"
	},
	{
		name: "kecap asin",
		department: "unclassified"
	},
	{
		name: "veggie burgers",
		department: "unclassified"
	},
	{
		name: "boar",
		department: "unclassified"
	},
	{
		name: "wild boar",
		department: "unclassified"
	},
	{
		name: "sauvignon blanc",
		department: "unclassified"
	},
	{
		name: "toasted shredded coconut",
		department: "unclassified"
	},
	{
		name: "frozen lima beans",
		department: "unclassified"
	},
	{
		name: "arbol chile",
		department: "unclassified"
	},
	{
		name: "boneless turkey breast",
		department: "unclassified"
	},
	{
		name: "limeade",
		department: "unclassified"
	},
	{
		name: "shiso leaves",
		department: "unclassified"
	},
	{
		name: "luncheon meat",
		department: "unclassified"
	},
	{
		name: "lunch meat",
		department: "unclassified"
	},
	{
		name: "bitter chocolate",
		department: "unclassified"
	},
	{
		name: "lamb steaks",
		department: "unclassified"
	},
	{
		name: "Skippy Creamy Peanut Butter",
		department: "unclassified"
	},
	{
		name: "reduced sodium tamari",
		department: "unclassified"
	},
	{
		name: "galia melon",
		department: "unclassified"
	},
	{
		name: "evaporated low-fat milk",
		department: "unclassified"
	},
	{
		name: "low-fat evaporated milk",
		department: "unclassified"
	},
	{
		name: "annatto seeds",
		department: "unclassified"
	},
	{
		name: "matzo cake meal",
		department: "unclassified"
	},
	{
		name: "rice mix",
		department: "unclassified"
	},
	{
		name: "rice blend",
		department: "unclassified"
	},
	{
		name: "Imperial Sugar Extra Fine Granulated Sugar",
		department: "unclassified"
	},
	{
		name: "hot cherry peppers",
		department: "unclassified"
	},
	{
		name: "lamb leg",
		department: "unclassified"
	},
	{
		name: "maple-flavored syrup",
		department: "unclassified"
	},
	{
		name: "Galliano",
		department: "unclassified"
	},
	{
		name: "carnation",
		department: "unclassified"
	},
	{
		name: "paprika paste",
		department: "unclassified"
	},
	{
		name: "peach halves",
		department: "unclassified"
	},
	{
		name: "Tia Maria",
		department: "unclassified"
	},
	{
		name: "Tia Maria Coffee",
		department: "unclassified"
	},
	{
		name: "japanese cucumber",
		department: "unclassified"
	},
	{
		name: "snickers bars",
		department: "unclassified"
	},
	{
		name: "soft shell crabs",
		department: "unclassified"
	},
	{
		name: "ramen",
		department: "unclassified"
	},
	{
		name: "graham flour",
		department: "unclassified"
	},
	{
		name: "fruit sugar",
		department: "unclassified"
	},
	{
		name: "JELL-O Vanilla Flavor Instant Pudding & Pie Filling",
		department: "unclassified"
	},
	{
		name: "rabbit legs",
		department: "unclassified"
	},
	{
		name: "toasted cashews",
		department: "unclassified"
	},
	{
		name: "instant tapioca",
		department: "unclassified"
	},
	{
		name: "wildflower honey",
		department: "unclassified"
	},
	{
		name: "slider rolls",
		department: "unclassified"
	},
	{
		name: "rainbow chard",
		department: "unclassified"
	},
	{
		name: "roasted pecans",
		department: "unclassified"
	},
	{
		name: "whole milk cream",
		department: "unclassified"
	},
	{
		name: "methi",
		department: "unclassified"
	},
	{
		name: "cheese curds",
		department: "unclassified"
	},
	{
		name: "Chianti",
		department: "unclassified"
	},
	{
		name: "mustard sauce",
		department: "unclassified"
	},
	{
		name: "candied pecans",
		department: "unclassified"
	},
	{
		name: "oakleaf lettuce",
		department: "unclassified"
	},
	{
		name: "honey graham crackers",
		department: "unclassified"
	},
	{
		name: "chunky",
		department: "unclassified"
	},
	{
		name: "cream soda",
		department: "unclassified"
	},
	{
		name: "garlic flakes",
		department: "unclassified"
	},
	{
		name: "diced bacon",
		department: "unclassified"
	},
	{
		name: "mixed beans",
		department: "unclassified"
	},
	{
		name: "cheese crackers",
		department: "unclassified"
	},
	{
		name: "sweet white wine",
		department: "unclassified"
	},
	{
		name: "herbed goat cheese",
		department: "unclassified"
	},
	{
		name: "mulberries",
		department: "unclassified"
	},
	{
		name: "condensed cream",
		department: "unclassified"
	},
	{
		name: "hawaiian rolls",
		department: "unclassified"
	},
	{
		name: "decorating gel",
		department: "unclassified"
	},
	{
		name: "bacardi",
		department: "unclassified"
	},
	{
		name: "corn niblets",
		department: "unclassified"
	},
	{
		name: "redfish",
		department: "unclassified"
	},
	{
		name: "starfruit",
		department: "unclassified"
	},
	{
		name: "curing salt",
		department: "unclassified"
	},
	{
		name: "bean sauce",
		department: "unclassified"
	},
	{
		name: "stir fry oil",
		department: "unclassified"
	},
	{
		name: "white bread crumbs",
		department: "unclassified"
	},
	{
		name: "soft corn tortillas",
		department: "unclassified"
	},
	{
		name: "radicchio leaves",
		department: "unclassified"
	},
	{
		name: "squash blossoms",
		department: "unclassified"
	},
	{
		name: "asian eggplants",
		department: "unclassified"
	},
	{
		name: "mint sauce",
		department: "unclassified"
	},
	{
		name: "moscato",
		department: "unclassified"
	},
	{
		name: "jumbo shells",
		department: "unclassified"
	},
	{
		name: "phyllo sheets",
		department: "unclassified"
	},
	{
		name: "filo dough sheets",
		department: "unclassified"
	},
	{
		name: "KRAFT Shredded Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "roasted bell peppers",
		department: "unclassified"
	},
	{
		name: "table cream",
		department: "unclassified"
	},
	{
		name: "brown ale",
		department: "unclassified"
	},
	{
		name: "baby romaine lettuce",
		department: "unclassified"
	},
	{
		name: "mini cucumbers",
		department: "unclassified"
	},
	{
		name: "Jack Daniels Whiskey",
		department: "unclassified"
	},
	{
		name: "flageolet",
		department: "unclassified"
	},
	{
		name: "Old El Paso\\u2122 Thick 'n Chunky salsa",
		department: "unclassified"
	},
	{
		name: "unsalted shelled pistachio",
		department: "unclassified"
	},
	{
		name: "whole wheat baguette",
		department: "unclassified"
	},
	{
		name: "wine sauerkraut",
		department: "unclassified"
	},
	{
		name: "heirloom cherry tomatoes",
		department: "unclassified"
	},
	{
		name: "romanesco",
		department: "unclassified"
	},
	{
		name: "borage",
		department: "unclassified"
	},
	{
		name: "Campbell's Condensed Tomato Soup",
		department: "unclassified"
	},
	{
		name: "toasted sunflower seeds",
		department: "unclassified"
	},
	{
		name: "instant couscous",
		department: "unclassified"
	},
	{
		name: "calimyrna figs",
		department: "unclassified"
	},
	{
		name: "sazon goya",
		department: "unclassified"
	},
	{
		name: "Rhodes Dinner Rolls",
		department: "unclassified"
	},
	{
		name: "garden cress",
		department: "unclassified"
	},
	{
		name: "sbrinz",
		department: "unclassified"
	},
	{
		name: "medium salsa",
		department: "unclassified"
	},
	{
		name: "extra wide egg noodles",
		department: "unclassified"
	},
	{
		name: "fillet of beef",
		department: "unclassified"
	},
	{
		name: "brewed tea",
		department: "unclassified"
	},
	{
		name: "pinot grigio",
		department: "unclassified"
	},
	{
		name: "black cumin seeds",
		department: "unclassified"
	},
	{
		name: "nonfat vanilla greek yogurt",
		department: "unclassified"
	},
	{
		name: "pollock filet",
		department: "unclassified"
	},
	{
		name: "maui onion",
		department: "unclassified"
	},
	{
		name: "homemade chicken broth",
		department: "unclassified"
	},
	{
		name: "nonfat italian dressing",
		department: "unclassified"
	},
	{
		name: "hazelnut flour",
		department: "unclassified"
	},
	{
		name: "extra fine granulated sugar",
		department: "unclassified"
	},
	{
		name: "chocolate chip cookie dough",
		department: "unclassified"
	},
	{
		name: "Knox Gelatine",
		department: "unclassified"
	},
	{
		name: "wafer cookies",
		department: "unclassified"
	},
	{
		name: "ginger snaps",
		department: "unclassified"
	},
	{
		name: "crushed ritz crackers",
		department: "unclassified"
	},
	{
		name: "rice pilaf",
		department: "unclassified"
	},
	{
		name: "minute steaks",
		department: "unclassified"
	},
	{
		name: "chicken egg",
		department: "unclassified"
	},
	{
		name: "pisco",
		department: "unclassified"
	},
	{
		name: "laughing cow",
		department: "unclassified"
	},
	{
		name: "frozen stir fry vegetable blend",
		department: "unclassified"
	},
	{
		name: "turkey wings",
		department: "unclassified"
	},
	{
		name: "ancho",
		department: "unclassified"
	},
	{
		name: "panettone",
		department: "unclassified"
	},
	{
		name: "Old El Paso Flour Tortillas",
		department: "unclassified"
	},
	{
		name: "zinfandel",
		department: "unclassified"
	},
	{
		name: "sliced kalamata olives",
		department: "unclassified"
	},
	{
		name: "raspberry coulis",
		department: "unclassified"
	},
	{
		name: "boneless beef short ribs",
		department: "unclassified"
	},
	{
		name: "Knox unflavored gelatin",
		department: "unclassified"
	},
	{
		name: "tasso",
		department: "unclassified"
	},
	{
		name: "dried peach",
		department: "unclassified"
	},
	{
		name: "organic pumpkin pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "grouper fillets",
		department: "unclassified"
	},
	{
		name: "p\\u00E2t\\u00E9",
		department: "unclassified"
	},
	{
		name: "Kellogg's\\u00AE Crispix\\u00AE Cereal",
		department: "unclassified"
	},
	{
		name: "shirataki",
		department: "unclassified"
	},
	{
		name: "peperoncino",
		department: "unclassified"
	},
	{
		name: "chamomile",
		department: "unclassified"
	},
	{
		name: "Rice-A-Roni",
		department: "unclassified"
	},
	{
		name: "fresca",
		department: "unclassified"
	},
	{
		name: "low-fat feta",
		department: "unclassified"
	},
	{
		name: "McCormick Garlic Powder",
		department: "unclassified"
	},
	{
		name: "garlic olive oil",
		department: "unclassified"
	},
	{
		name: "gelato",
		department: "unclassified"
	},
	{
		name: "cookie mix",
		department: "unclassified"
	},
	{
		name: "ceylon cinnamon",
		department: "unclassified"
	},
	{
		name: "groundnut",
		department: "unclassified"
	},
	{
		name: "duck breast fillets",
		department: "unclassified"
	},
	{
		name: "stewed cucumber",
		department: "unclassified"
	},
	{
		name: "garlic bread",
		department: "unclassified"
	},
	{
		name: "reduced sodium chicken stock",
		department: "unclassified"
	},
	{
		name: "black pudding",
		department: "unclassified"
	},
	{
		name: "raspberry sherbet",
		department: "unclassified"
	},
	{
		name: "low sodium worcestershire sauce",
		department: "unclassified"
	},
	{
		name: "cheesecake filling",
		department: "unclassified"
	},
	{
		name: "sea bream",
		department: "unclassified"
	},
	{
		name: "honey glazed ham",
		department: "unclassified"
	},
	{
		name: "sugar free instant vanilla pudding mix",
		department: "unclassified"
	},
	{
		name: "flounder",
		department: "unclassified"
	},
	{
		name: "cold cut",
		department: "unclassified"
	},
	{
		name: "iced tea",
		department: "unclassified"
	},
	{
		name: "shredded colby",
		department: "unclassified"
	},
	{
		name: "rose syrup",
		department: "unclassified"
	},
	{
		name: "barbecue seasoning",
		department: "unclassified"
	},
	{
		name: "applejack",
		department: "unclassified"
	},
	{
		name: "Splenda Sugar Blend",
		department: "unclassified"
	},
	{
		name: "chex",
		department: "unclassified"
	},
	{
		name: "haloumi",
		department: "unclassified"
	},
	{
		name: "cipollini onions",
		department: "unclassified"
	},
	{
		name: "surimi",
		department: "unclassified"
	},
	{
		name: "chinese chives",
		department: "unclassified"
	},
	{
		name: "ground nuts",
		department: "unclassified"
	},
	{
		name: "clementine peel",
		department: "unclassified"
	},
	{
		name: "clementine rind",
		department: "unclassified"
	},
	{
		name: "powdered egg whites",
		department: "unclassified"
	},
	{
		name: "regular soy sauce",
		department: "unclassified"
	},
	{
		name: "pretzel salt",
		department: "unclassified"
	},
	{
		name: "italian seasoned dry bread crumbs",
		department: "unclassified"
	},
	{
		name: "crumbled cheese",
		department: "unclassified"
	},
	{
		name: "yellow rice",
		department: "unclassified"
	},
	{
		name: "Egg Beaters Egg Whites",
		department: "unclassified"
	},
	{
		name: "roasted chestnuts",
		department: "unclassified"
	},
	{
		name: "lean ground meat",
		department: "unclassified"
	},
	{
		name: "bloody mary mix",
		department: "unclassified"
	},
	{
		name: "asadero",
		department: "unclassified"
	},
	{
		name: "asadero cheese",
		department: "unclassified"
	},
	{
		name: "queso oaxaca",
		department: "unclassified"
	},
	{
		name: "southwest seasoning",
		department: "unclassified"
	},
	{
		name: "celery flakes",
		department: "unclassified"
	},
	{
		name: "duck fillet",
		department: "unclassified"
	},
	{
		name: "artichoke bottoms",
		department: "unclassified"
	},
	{
		name: "Rolo Caramels",
		department: "unclassified"
	},
	{
		name: "pierogi",
		department: "unclassified"
	},
	{
		name: "celtic salt",
		department: "unclassified"
	},
	{
		name: "mild molasses",
		department: "unclassified"
	},
	{
		name: "dutch cocoa",
		department: "unclassified"
	},
	{
		name: "jamaican rum",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch Salad\\u00AE Dressing & Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "butterhead lettuce",
		department: "unclassified"
	},
	{
		name: "tapioca pearls",
		department: "unclassified"
	},
	{
		name: "blue crabs",
		department: "unclassified"
	},
	{
		name: "maraschino",
		department: "unclassified"
	},
	{
		name: "whipped dessert topping",
		department: "unclassified"
	},
	{
		name: "salt substitute",
		department: "unclassified"
	},
	{
		name: "jamaican jerk seasoning",
		department: "unclassified"
	},
	{
		name: "coulis",
		department: "unclassified"
	},
	{
		name: "reposado",
		department: "unclassified"
	},
	{
		name: "Sugar In The Raw\\u00AE",
		department: "unclassified"
	},
	{
		name: "arctic char",
		department: "unclassified"
	},
	{
		name: "char",
		department: "unclassified"
	},
	{
		name: "artic char",
		department: "unclassified"
	},
	{
		name: "butterscotch pudding",
		department: "unclassified"
	},
	{
		name: "rice sticks",
		department: "unclassified"
	},
	{
		name: "manicotti shells",
		department: "unclassified"
	},
	{
		name: "salt free seasoning",
		department: "unclassified"
	},
	{
		name: "Heinz Ketchup",
		department: "unclassified"
	},
	{
		name: "hazelnut butter",
		department: "unclassified"
	},
	{
		name: "ground caraway",
		department: "unclassified"
	},
	{
		name: "jumbo eggs",
		department: "unclassified"
	},
	{
		name: "basa fillets",
		department: "unclassified"
	},
	{
		name: "pangasius fillets",
		department: "unclassified"
	},
	{
		name: "sliced salami",
		department: "unclassified"
	},
	{
		name: "cassava",
		department: "unclassified"
	},
	{
		name: "salmon roe",
		department: "unclassified"
	},
	{
		name: "pork stew meat",
		department: "unclassified"
	},
	{
		name: "low-fat swiss cheese",
		department: "unclassified"
	},
	{
		name: "potato rolls",
		department: "unclassified"
	},
	{
		name: "shishito chile peppers",
		department: "unclassified"
	},
	{
		name: "pickled vegetables",
		department: "unclassified"
	},
	{
		name: "low sodium beef stock",
		department: "unclassified"
	},
	{
		name: "salsify",
		department: "unclassified"
	},
	{
		name: "ranch dip mix",
		department: "unclassified"
	},
	{
		name: "cornflake crumbs",
		department: "unclassified"
	},
	{
		name: "scones",
		department: "unclassified"
	},
	{
		name: "smoked almonds",
		department: "unclassified"
	},
	{
		name: "fajita size flour tortillas",
		department: "unclassified"
	},
	{
		name: "peach juice",
		department: "unclassified"
	},
	{
		name: "watermelon juice",
		department: "unclassified"
	},
	{
		name: "boneless lamb",
		department: "unclassified"
	},
	{
		name: "chopped leaves",
		department: "unclassified"
	},
	{
		name: "beluga lentil",
		department: "unclassified"
	},
	{
		name: "black beluga lentils",
		department: "unclassified"
	},
	{
		name: "consomme",
		department: "unclassified"
	},
	{
		name: "Goldfish Crackers",
		department: "unclassified"
	},
	{
		name: "fish fingers",
		department: "unclassified"
	},
	{
		name: "round grain rice",
		department: "unclassified"
	},
	{
		name: "turkey drippings",
		department: "unclassified"
	},
	{
		name: "citrus juice",
		department: "unclassified"
	},
	{
		name: "Franks Hot Sauce",
		department: "unclassified"
	},
	{
		name: "meringue nests",
		department: "unclassified"
	},
	{
		name: "cream powder",
		department: "unclassified"
	},
	{
		name: "raspberry sorbet",
		department: "unclassified"
	},
	{
		name: "sunchokes",
		department: "unclassified"
	},
	{
		name: "cole slaw mix",
		department: "unclassified"
	},
	{
		name: "cooked meat",
		department: "unclassified"
	},
	{
		name: "boston butt",
		department: "unclassified"
	},
	{
		name: "macaroni and cheese dinner",
		department: "unclassified"
	},
	{
		name: "vietnamese fish sauce",
		department: "unclassified"
	},
	{
		name: "Golden Grahams Cereal",
		department: "unclassified"
	},
	{
		name: "boneless center cut pork chops",
		department: "unclassified"
	},
	{
		name: "cavolo nero",
		department: "unclassified"
	},
	{
		name: "diced chicken breast",
		department: "unclassified"
	},
	{
		name: "sofrito",
		department: "unclassified"
	},
	{
		name: "Aperol",
		department: "unclassified"
	},
	{
		name: "breakfast sausage links",
		department: "unclassified"
	},
	{
		name: "Campbell's Condensed Cheddar Cheese Soup",
		department: "unclassified"
	},
	{
		name: "a\\u00E7ai",
		department: "unclassified"
	},
	{
		name: "Philadelphia Cream Cheese Spread",
		department: "unclassified"
	},
	{
		name: "Raisin Bran Cereal",
		department: "unclassified"
	},
	{
		name: "prebaked pizza crusts",
		department: "unclassified"
	},
	{
		name: "kruidenbouillontabletten",
		department: "unclassified"
	},
	{
		name: "watermelon radishes",
		department: "unclassified"
	},
	{
		name: "bengal gram",
		department: "unclassified"
	},
	{
		name: "pastis",
		department: "unclassified"
	},
	{
		name: "tripe",
		department: "unclassified"
	},
	{
		name: "black tea leaves",
		department: "unclassified"
	},
	{
		name: "oregano flakes",
		department: "unclassified"
	},
	{
		name: "white baking bar",
		department: "unclassified"
	},
	{
		name: "fruit filling",
		department: "unclassified"
	},
	{
		name: "plum jam",
		department: "unclassified"
	},
	{
		name: "kit",
		department: "unclassified"
	},
	{
		name: "spring salad mix",
		department: "unclassified"
	},
	{
		name: "pink beans",
		department: "unclassified"
	},
	{
		name: "less sodium beef broth",
		department: "unclassified"
	},
	{
		name: "bagel chips",
		department: "unclassified"
	},
	{
		name: "oat milk",
		department: "unclassified"
	},
	{
		name: "low fat mozzarella",
		department: "unclassified"
	},
	{
		name: "Lea & Perrins Worcestershire Sauce",
		department: "unclassified"
	},
	{
		name: "Fiber One Cereal",
		department: "unclassified"
	},
	{
		name: "vin santo",
		department: "unclassified"
	},
	{
		name: "jenever",
		department: "unclassified"
	},
	{
		name: "vegetarian refried beans",
		department: "unclassified"
	},
	{
		name: "chimichurri",
		department: "unclassified"
	},
	{
		name: "beef goulash",
		department: "unclassified"
	},
	{
		name: "shiso",
		department: "unclassified"
	},
	{
		name: "poussins",
		department: "unclassified"
	},
	{
		name: "cavatelli",
		department: "unclassified"
	},
	{
		name: "boneless ham",
		department: "unclassified"
	},
	{
		name: "apple puree",
		department: "unclassified"
	},
	{
		name: "veal roast",
		department: "unclassified"
	},
	{
		name: "brown shrimp",
		department: "unclassified"
	},
	{
		name: "ground espresso",
		department: "unclassified"
	},
	{
		name: "pickled beets",
		department: "unclassified"
	},
	{
		name: "green creme de menthe",
		department: "unclassified"
	},
	{
		name: "seasoned croutons",
		department: "unclassified"
	},
	{
		name: "white cannellini beans",
		department: "unclassified"
	},
	{
		name: "whole wheat elbow macaroni",
		department: "unclassified"
	},
	{
		name: "tri tip",
		department: "unclassified"
	},
	{
		name: "loin pork chops",
		department: "unclassified"
	},
	{
		name: "eye of round roast",
		department: "unclassified"
	},
	{
		name: "lemon glaze",
		department: "unclassified"
	},
	{
		name: "loaves",
		department: "unclassified"
	},
	{
		name: "gluten free baking mix",
		department: "unclassified"
	},
	{
		name: "wakame",
		department: "unclassified"
	},
	{
		name: "cava",
		department: "unclassified"
	},
	{
		name: "dukkah",
		department: "unclassified"
	},
	{
		name: "falafel",
		department: "unclassified"
	},
	{
		name: "tarragon sprigs",
		department: "unclassified"
	},
	{
		name: "mizuna",
		department: "unclassified"
	},
	{
		name: "starchy potatoes",
		department: "unclassified"
	},
	{
		name: "sunflower kernels",
		department: "unclassified"
	},
	{
		name: "licorice",
		department: "unclassified"
	},
	{
		name: "parboiled rice",
		department: "unclassified"
	},
	{
		name: "sparkling mineral water",
		department: "unclassified"
	},
	{
		name: "Kraft Mayonnaise",
		department: "unclassified"
	},
	{
		name: "langoustines",
		department: "unclassified"
	},
	{
		name: "Swanson Chicken Broth",
		department: "unclassified"
	},
	{
		name: "TACO BELL\\u00AE Thick & Chunky Mild Salsa",
		department: "unclassified"
	},
	{
		name: "tentacles",
		department: "unclassified"
	},
	{
		name: "fillet medallions",
		department: "unclassified"
	},
	{
		name: "promise buttery spread",
		department: "unclassified"
	},
	{
		name: "reduced fat creamy peanut butter",
		department: "unclassified"
	},
	{
		name: "chablis",
		department: "unclassified"
	},
	{
		name: "reduced fat ranch dressing",
		department: "unclassified"
	},
	{
		name: "light ranch dressing",
		department: "unclassified"
	},
	{
		name: "India Pale Ale",
		department: "unclassified"
	},
	{
		name: "IPA",
		department: "unclassified"
	},
	{
		name: "dark chocolate couverture",
		department: "unclassified"
	},
	{
		name: "yellow lentils",
		department: "unclassified"
	},
	{
		name: "smoked kielbasa",
		department: "unclassified"
	},
	{
		name: "pork shoulder butt",
		department: "unclassified"
	},
	{
		name: "duck liver",
		department: "unclassified"
	},
	{
		name: "nam pla",
		department: "unclassified"
	},
	{
		name: "black bean garlic sauce",
		department: "unclassified"
	},
	{
		name: "dove",
		department: "unclassified"
	},
	{
		name: "Fondor",
		department: "unclassified"
	},
	{
		name: "soup beef",
		department: "unclassified"
	},
	{
		name: "smoked sweet Spanish paprika",
		department: "unclassified"
	},
	{
		name: "striped bass",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Natural Vanilla Ice Cream",
		department: "unclassified"
	},
	{
		name: "european style butter",
		department: "unclassified"
	},
	{
		name: "low sodium tomato sauce",
		department: "unclassified"
	},
	{
		name: "porter",
		department: "unclassified"
	},
	{
		name: "whole milk chocolate",
		department: "unclassified"
	},
	{
		name: "baby zucchini",
		department: "unclassified"
	},
	{
		name: "dark bread",
		department: "unclassified"
	},
	{
		name: "mustard dressing",
		department: "unclassified"
	},
	{
		name: "habanero hot sauce",
		department: "unclassified"
	},
	{
		name: "freekeh",
		department: "unclassified"
	},
	{
		name: "alfalfa",
		department: "unclassified"
	},
	{
		name: "bean curd",
		department: "unclassified"
	},
	{
		name: "low-fat chicken broth",
		department: "unclassified"
	},
	{
		name: "veal loin fillet",
		department: "unclassified"
	},
	{
		name: "veal fillet",
		department: "unclassified"
	},
	{
		name: "strip steaks",
		department: "unclassified"
	},
	{
		name: "yellow hominy",
		department: "unclassified"
	},
	{
		name: "dry gin",
		department: "unclassified"
	},
	{
		name: "unsalted roasted cashews",
		department: "unclassified"
	},
	{
		name: "raspberry lambic",
		department: "unclassified"
	},
	{
		name: "Kikkoman Soy Sauce",
		department: "unclassified"
	},
	{
		name: "dandelion",
		department: "unclassified"
	},
	{
		name: "whole grain rice",
		department: "unclassified"
	},
	{
		name: "low-fat granola",
		department: "unclassified"
	},
	{
		name: "cream of wheat",
		department: "unclassified"
	},
	{
		name: "hot dog rolls",
		department: "unclassified"
	},
	{
		name: "dhal",
		department: "unclassified"
	},
	{
		name: "caraway powder",
		department: "unclassified"
	},
	{
		name: "mild sausage",
		department: "unclassified"
	},
	{
		name: "mezcal",
		department: "unclassified"
	},
	{
		name: "cordial",
		department: "unclassified"
	},
	{
		name: "plaice",
		department: "unclassified"
	},
	{
		name: "Berbere",
		department: "unclassified"
	},
	{
		name: "sliced green olives",
		department: "unclassified"
	},
	{
		name: "light whipped topping",
		department: "unclassified"
	},
	{
		name: "apple schnapps",
		department: "unclassified"
	},
	{
		name: "vanilla custard",
		department: "unclassified"
	},
	{
		name: "v 8 vegetable juice",
		department: "unclassified"
	},
	{
		name: "sweet pickle juice",
		department: "unclassified"
	},
	{
		name: "italian rolls",
		department: "unclassified"
	},
	{
		name: "dumpling dough",
		department: "unclassified"
	},
	{
		name: "redcurrant jelly",
		department: "unclassified"
	},
	{
		name: "whole cashews",
		department: "unclassified"
	},
	{
		name: "toffee",
		department: "unclassified"
	},
	{
		name: "pollock",
		department: "unclassified"
	},
	{
		name: "corn grits",
		department: "unclassified"
	},
	{
		name: "peach liqueur",
		department: "unclassified"
	},
	{
		name: "raw ham",
		department: "unclassified"
	},
	{
		name: "Andes Creme De Menthe Thins",
		department: "unclassified"
	},
	{
		name: "braeburn apple",
		department: "unclassified"
	},
	{
		name: "low moisture mozzarella",
		department: "unclassified"
	},
	{
		name: "cheese dip",
		department: "unclassified"
	},
	{
		name: "whole wheat bread flour",
		department: "unclassified"
	},
	{
		name: "Spanish olives",
		department: "unclassified"
	},
	{
		name: "artisan bread",
		department: "unclassified"
	},
	{
		name: "low-fat parmesan cheese",
		department: "unclassified"
	},
	{
		name: "powdered garlic",
		department: "unclassified"
	},
	{
		name: "polenta corn meal",
		department: "unclassified"
	},
	{
		name: "dark rye flour",
		department: "unclassified"
	},
	{
		name: "peeled deveined shrimp",
		department: "unclassified"
	},
	{
		name: "cured chorizo",
		department: "unclassified"
	},
	{
		name: "peanut powder",
		department: "unclassified"
	},
	{
		name: "salted roasted pistachios",
		department: "unclassified"
	},
	{
		name: "apple wine",
		department: "unclassified"
	},
	{
		name: "hemp protein powder",
		department: "unclassified"
	},
	{
		name: "Imperial Granulated Sugar",
		department: "unclassified"
	},
	{
		name: "frozen pizza dough",
		department: "unclassified"
	},
	{
		name: "nettles",
		department: "unclassified"
	},
	{
		name: "chinese eggplants",
		department: "unclassified"
	},
	{
		name: "achiote",
		department: "unclassified"
	},
	{
		name: "veal demi-glace",
		department: "unclassified"
	},
	{
		name: "bottom round roast",
		department: "unclassified"
	},
	{
		name: "boysenberries",
		department: "unclassified"
	},
	{
		name: "reduced fat chunky peanut butter",
		department: "unclassified"
	},
	{
		name: "chile paste with garlic",
		department: "unclassified"
	},
	{
		name: "no-calorie sweetener",
		department: "unclassified"
	},
	{
		name: "hard rolls",
		department: "unclassified"
	},
	{
		name: "Italian seasoned diced tomatoes",
		department: "unclassified"
	},
	{
		name: "lemon olive oil",
		department: "unclassified"
	},
	{
		name: "salted almonds",
		department: "unclassified"
	},
	{
		name: "runner beans",
		department: "unclassified"
	},
	{
		name: "pie pumpkin",
		department: "unclassified"
	},
	{
		name: "lotus root",
		department: "unclassified"
	},
	{
		name: "fresh chili",
		department: "unclassified"
	},
	{
		name: "grouper",
		department: "unclassified"
	},
	{
		name: "veal shoulder",
		department: "unclassified"
	},
	{
		name: "saddle of lamb",
		department: "unclassified"
	},
	{
		name: "pork butt roast",
		department: "unclassified"
	},
	{
		name: "mettwurst",
		department: "unclassified"
	},
	{
		name: "boneless skinless turkey breasts",
		department: "unclassified"
	},
	{
		name: "fresh cheese",
		department: "unclassified"
	},
	{
		name: "alum",
		department: "unclassified"
	},
	{
		name: "london dry gin",
		department: "unclassified"
	},
	{
		name: "burgundy",
		department: "unclassified"
	},
	{
		name: "soup chicken",
		department: "unclassified"
	},
	{
		name: "entrecote",
		department: "unclassified"
	},
	{
		name: "crema mexicana",
		department: "unclassified"
	},
	{
		name: "baby turnips",
		department: "unclassified"
	},
	{
		name: "boneless salmon fillets",
		department: "unclassified"
	},
	{
		name: "paleo mayonnaise",
		department: "unclassified"
	},
	{
		name: "Challenge Butter",
		department: "unclassified"
	},
	{
		name: "bermuda onion",
		department: "unclassified"
	},
	{
		name: "low-fat ricotta",
		department: "unclassified"
	},
	{
		name: "fromage blanc",
		department: "unclassified"
	},
	{
		name: "pickle spears",
		department: "unclassified"
	},
	{
		name: "fatback",
		department: "unclassified"
	},
	{
		name: "soy creamer",
		department: "unclassified"
	},
	{
		name: "sago",
		department: "unclassified"
	},
	{
		name: "wholemeal bread",
		department: "unclassified"
	},
	{
		name: "smoked pork",
		department: "unclassified"
	},
	{
		name: "Bragg Liquid Aminos",
		department: "unclassified"
	},
	{
		name: "purslane",
		department: "unclassified"
	},
	{
		name: "pasilla pepper",
		department: "unclassified"
	},
	{
		name: "boiling onions",
		department: "unclassified"
	},
	{
		name: "piloncillo",
		department: "unclassified"
	},
	{
		name: "dried meat",
		department: "unclassified"
	},
	{
		name: "casings",
		department: "unclassified"
	},
	{
		name: "rome apples",
		department: "unclassified"
	},
	{
		name: "v8",
		department: "unclassified"
	},
	{
		name: "shredded low-fat mozzarella cheese",
		department: "unclassified"
	},
	{
		name: "low-fat coconut milk",
		department: "unclassified"
	},
	{
		name: "spaghetti sauce seasoning mix",
		department: "unclassified"
	},
	{
		name: "medium firm tofu",
		department: "unclassified"
	},
	{
		name: "medium tofu",
		department: "unclassified"
	},
	{
		name: "Vietnamese coriander",
		department: "unclassified"
	},
	{
		name: "rau ram",
		department: "unclassified"
	},
	{
		name: "vietnamese mint",
		department: "unclassified"
	},
	{
		name: "laksa leaves",
		department: "unclassified"
	},
	{
		name: "old fashioned stone ground grits",
		department: "unclassified"
	},
	{
		name: "meat sauce",
		department: "unclassified"
	},
	{
		name: "blanco tequila",
		department: "unclassified"
	},
	{
		name: "DeLallo Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "kelp",
		department: "unclassified"
	},
	{
		name: "curly-leaf parsley",
		department: "unclassified"
	},
	{
		name: "rice crackers",
		department: "unclassified"
	},
	{
		name: "hokkien noodles",
		department: "unclassified"
	},
	{
		name: "pork leg",
		department: "unclassified"
	},
	{
		name: "lamb leg steaks",
		department: "unclassified"
	},
	{
		name: "low sodium teriyaki sauce",
		department: "unclassified"
	},
	{
		name: "Cholula Hot Sauce",
		department: "unclassified"
	},
	{
		name: "baked pizza crust",
		department: "unclassified"
	},
	{
		name: "roast beef juice",
		department: "unclassified"
	},
	{
		name: "grated cotija",
		department: "unclassified"
	},
	{
		name: "cranberry compote",
		department: "unclassified"
	},
	{
		name: "branzini",
		department: "unclassified"
	},
	{
		name: "branzino",
		department: "unclassified"
	},
	{
		name: "japanese rice",
		department: "unclassified"
	},
	{
		name: "fat free feta cheese",
		department: "unclassified"
	},
	{
		name: "bran cereal",
		department: "unclassified"
	},
	{
		name: "vitamin c",
		department: "unclassified"
	},
	{
		name: "green gel food coloring",
		department: "unclassified"
	},
	{
		name: "Nutter Butter Cookies",
		department: "unclassified"
	},
	{
		name: "egg pasta",
		department: "unclassified"
	},
	{
		name: "dried fettuccine",
		department: "unclassified"
	},
	{
		name: "turkey ham",
		department: "unclassified"
	},
	{
		name: "beef drippings",
		department: "unclassified"
	},
	{
		name: "dried strawberries",
		department: "unclassified"
	},
	{
		name: "vegetable juice cocktail",
		department: "unclassified"
	},
	{
		name: "louisiana hot sauce",
		department: "unclassified"
	},
	{
		name: "vegemite",
		department: "unclassified"
	},
	{
		name: "blue cornmeal",
		department: "unclassified"
	},
	{
		name: "poha",
		department: "unclassified"
	},
	{
		name: "bone in pork shank",
		department: "unclassified"
	},
	{
		name: "piccalilli relish",
		department: "unclassified"
	},
	{
		name: "piccalilli",
		department: "unclassified"
	},
	{
		name: "baharat",
		department: "unclassified"
	},
	{
		name: "tangerine zest",
		department: "unclassified"
	},
	{
		name: "mandarin orange zest",
		department: "unclassified"
	},
	{
		name: "ground lemongrass",
		department: "unclassified"
	},
	{
		name: "lemongrass powder",
		department: "unclassified"
	},
	{
		name: "lettuce hearts",
		department: "unclassified"
	},
	{
		name: "mission figs",
		department: "unclassified"
	},
	{
		name: "sorghum syrup",
		department: "unclassified"
	},
	{
		name: "whole wheat sandwich bread",
		department: "unclassified"
	},
	{
		name: "sweetbreads",
		department: "unclassified"
	},
	{
		name: "french toast",
		department: "unclassified"
	},
	{
		name: "crumble topping",
		department: "unclassified"
	},
	{
		name: "samphire",
		department: "unclassified"
	},
	{
		name: "chicken gizzards",
		department: "unclassified"
	},
	{
		name: "crushed peppermint candy",
		department: "unclassified"
	},
	{
		name: "pike",
		department: "unclassified"
	},
	{
		name: "paella rice",
		department: "unclassified"
	},
	{
		name: "taco meat",
		department: "unclassified"
	},
	{
		name: "comice pears",
		department: "unclassified"
	},
	{
		name: "1% low-fat cottage cheese",
		department: "unclassified"
	},
	{
		name: "pomegranate syrup",
		department: "unclassified"
	},
	{
		name: "Bertolli Tomato & Basil Sauce",
		department: "unclassified"
	},
	{
		name: "date sugar",
		department: "unclassified"
	},
	{
		name: "choy sum",
		department: "unclassified"
	},
	{
		name: "unsalted pumpkinseeds",
		department: "unclassified"
	},
	{
		name: "Greek feta",
		department: "unclassified"
	},
	{
		name: "Eggland's Best\\u00AE eggs",
		department: "unclassified"
	},
	{
		name: "roasted turkey breast",
		department: "unclassified"
	},
	{
		name: "cereal flakes",
		department: "unclassified"
	},
	{
		name: "nasturtium",
		department: "unclassified"
	},
	{
		name: "curly endive",
		department: "unclassified"
	},
	{
		name: "standing rib roast",
		department: "unclassified"
	},
	{
		name: "capicola",
		department: "unclassified"
	},
	{
		name: "huckleberries",
		department: "unclassified"
	},
	{
		name: "low-fat vanilla ice cream",
		department: "unclassified"
	},
	{
		name: "tandoori paste",
		department: "unclassified"
	},
	{
		name: "Tabasco Green Pepper Sauce",
		department: "unclassified"
	},
	{
		name: "fried rice seasoning mix",
		department: "unclassified"
	},
	{
		name: "hoagie buns",
		department: "unclassified"
	},
	{
		name: "fructose",
		department: "unclassified"
	},
	{
		name: "labneh",
		department: "unclassified"
	},
	{
		name: "mixed berry jam",
		department: "unclassified"
	},
	{
		name: "wild rice mix",
		department: "unclassified"
	},
	{
		name: "hot curry powder",
		department: "unclassified"
	},
	{
		name: "turkey drumstick",
		department: "unclassified"
	},
	{
		name: "togarashi",
		department: "unclassified"
	},
	{
		name: "small red beans",
		department: "unclassified"
	},
	{
		name: "Hormel Chili",
		department: "unclassified"
	},
	{
		name: "Jonagolds",
		department: "unclassified"
	},
	{
		name: "cranberry beans",
		department: "unclassified"
	},
	{
		name: "lime dressing",
		department: "unclassified"
	},
	{
		name: "bittersweet baking chocolate",
		department: "unclassified"
	},
	{
		name: "plum wine",
		department: "unclassified"
	},
	{
		name: "cubed speck",
		department: "unclassified"
	},
	{
		name: "au jus",
		department: "unclassified"
	},
	{
		name: "lavash",
		department: "unclassified"
	},
	{
		name: "shredded gouda cheese",
		department: "unclassified"
	},
	{
		name: "raspberry jelly",
		department: "unclassified"
	},
	{
		name: "Minute White Rice",
		department: "unclassified"
	},
	{
		name: "wood ear mushrooms",
		department: "unclassified"
	},
	{
		name: "turkey breakfast sausage",
		department: "unclassified"
	},
	{
		name: "butter pecan ice cream",
		department: "unclassified"
	},
	{
		name: "reduced fat ricotta cheese",
		department: "unclassified"
	},
	{
		name: "calamata olives",
		department: "unclassified"
	},
	{
		name: "ground oats",
		department: "unclassified"
	},
	{
		name: "frozen waffles",
		department: "unclassified"
	},
	{
		name: "sub buns",
		department: "unclassified"
	},
	{
		name: "submarine rolls",
		department: "unclassified"
	},
	{
		name: "submarine sandwich rolls",
		department: "unclassified"
	},
	{
		name: "cr\\u00E8me de banane",
		department: "unclassified"
	},
	{
		name: "candy coated chocolate",
		department: "unclassified"
	},
	{
		name: "poached pears",
		department: "unclassified"
	},
	{
		name: "damask plums",
		department: "unclassified"
	},
	{
		name: "furikake",
		department: "unclassified"
	},
	{
		name: "reduced sodium black beans",
		department: "unclassified"
	},
	{
		name: "veggie crumbles",
		department: "unclassified"
	},
	{
		name: "vegetarian veggie crumbles",
		department: "unclassified"
	},
	{
		name: "meatless burger crumbles",
		department: "unclassified"
	},
	{
		name: "natural pistachios",
		department: "unclassified"
	},
	{
		name: "milk chocolate candy",
		department: "unclassified"
	},
	{
		name: "sweet rice",
		department: "unclassified"
	},
	{
		name: "puffed rice",
		department: "unclassified"
	},
	{
		name: "lamb racks",
		department: "unclassified"
	},
	{
		name: "whole grain buns",
		department: "unclassified"
	},
	{
		name: "Fleischmann's RapidRise Yeast",
		department: "unclassified"
	},
	{
		name: "comte",
		department: "unclassified"
	},
	{
		name: "Dubliner cheese",
		department: "unclassified"
	},
	{
		name: "Concord grapes",
		department: "unclassified"
	},
	{
		name: "Kewpie Mayonnaise",
		department: "unclassified"
	},
	{
		name: "Turkish bay leaves",
		department: "unclassified"
	},
	{
		name: "dried banana",
		department: "unclassified"
	},
	{
		name: "red bean paste",
		department: "unclassified"
	},
	{
		name: "Old El Paso Enchilada Sauce",
		department: "unclassified"
	},
	{
		name: "mushroom soy sauce",
		department: "unclassified"
	},
	{
		name: "chunk light tuna in water",
		department: "unclassified"
	},
	{
		name: "au jus mix",
		department: "unclassified"
	},
	{
		name: "Special K Cereal",
		department: "unclassified"
	},
	{
		name: "sourdough loaf",
		department: "unclassified"
	},
	{
		name: "cake crumbs",
		department: "unclassified"
	},
	{
		name: "roasted salted cashews",
		department: "unclassified"
	},
	{
		name: "chicken gravy",
		department: "unclassified"
	},
	{
		name: "cherry syrup",
		department: "unclassified"
	},
	{
		name: "virginia ham",
		department: "unclassified"
	},
	{
		name: "verjus",
		department: "unclassified"
	},
	{
		name: "sirloin tip",
		department: "unclassified"
	},
	{
		name: "raspberry pie filling",
		department: "unclassified"
	},
	{
		name: "drambuie",
		department: "unclassified"
	},
	{
		name: "chopped potatoes",
		department: "unclassified"
	},
	{
		name: "speculaas cookies",
		department: "unclassified"
	},
	{
		name: "cuminseed",
		department: "unclassified"
	},
	{
		name: "trout caviar",
		department: "unclassified"
	},
	{
		name: "tri-tip roast",
		department: "unclassified"
	},
	{
		name: "red rice",
		department: "unclassified"
	},
	{
		name: "Thai chili paste",
		department: "unclassified"
	},
	{
		name: "brown chicken stock",
		department: "unclassified"
	},
	{
		name: "smoked trout fillets",
		department: "unclassified"
	},
	{
		name: "pork back ribs",
		department: "unclassified"
	},
	{
		name: "tonic",
		department: "unclassified"
	},
	{
		name: "safflower",
		department: "unclassified"
	},
	{
		name: "mead",
		department: "unclassified"
	},
	{
		name: "frozen cheese ravioli",
		department: "unclassified"
	},
	{
		name: "strawberry sauce",
		department: "unclassified"
	},
	{
		name: "dried coconut flakes",
		department: "unclassified"
	},
	{
		name: "gyoza wrappers",
		department: "unclassified"
	},
	{
		name: "mixed berry juice",
		department: "unclassified"
	},
	{
		name: "carrot cake mix",
		department: "unclassified"
	},
	{
		name: "squash seeds",
		department: "unclassified"
	},
	{
		name: "crushed saltines",
		department: "unclassified"
	},
	{
		name: "tenderloin roast",
		department: "unclassified"
	},
	{
		name: "pigeons",
		department: "unclassified"
	},
	{
		name: "mesquite powder",
		department: "unclassified"
	},
	{
		name: "sloe gin",
		department: "unclassified"
	},
	{
		name: "chilled prosecco",
		department: "unclassified"
	},
	{
		name: "pork strips",
		department: "unclassified"
	},
	{
		name: "dill pickle slices",
		department: "unclassified"
	},
	{
		name: "hibiscus",
		department: "unclassified"
	},
	{
		name: "puff pastry cups",
		department: "unclassified"
	},
	{
		name: "wild garlic leaves",
		department: "unclassified"
	},
	{
		name: "sliced salmon",
		department: "unclassified"
	},
	{
		name: "Aiwar",
		department: "unclassified"
	},
	{
		name: "crudit\\u00E9s",
		department: "unclassified"
	},
	{
		name: "less sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "yogurt cheese",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Ground Cinnamon",
		department: "unclassified"
	},
	{
		name: "praline",
		department: "unclassified"
	},
	{
		name: "sugar cane",
		department: "unclassified"
	},
	{
		name: "soft-wheat flour",
		department: "unclassified"
	},
	{
		name: "prime rib",
		department: "unclassified"
	},
	{
		name: "ginger piece",
		department: "unclassified"
	},
	{
		name: "KRAFT Mexican Style Finely Shredded Four Cheese",
		department: "unclassified"
	},
	{
		name: "schupfnudeln",
		department: "unclassified"
	},
	{
		name: "homemade beef stock",
		department: "unclassified"
	},
	{
		name: "turkey meatballs",
		department: "unclassified"
	},
	{
		name: "italian-style meatballs",
		department: "unclassified"
	},
	{
		name: "fruit puree",
		department: "unclassified"
	},
	{
		name: "barley malt syrup",
		department: "unclassified"
	},
	{
		name: "hawaiian sweet rolls",
		department: "unclassified"
	},
	{
		name: "sambuca",
		department: "unclassified"
	},
	{
		name: "pineapple salsa",
		department: "unclassified"
	},
	{
		name: "mocha beans",
		department: "unclassified"
	},
	{
		name: "guava paste",
		department: "unclassified"
	},
	{
		name: "cream of broccoli soup",
		department: "unclassified"
	},
	{
		name: "steak fries",
		department: "unclassified"
	},
	{
		name: "dried mission figs",
		department: "unclassified"
	},
	{
		name: "low-fat butter",
		department: "unclassified"
	},
	{
		name: "mint syrup",
		department: "unclassified"
	},
	{
		name: "Crystal Hot Sauce",
		department: "unclassified"
	},
	{
		name: "sweet baking chocolate",
		department: "unclassified"
	},
	{
		name: "mugwort",
		department: "unclassified"
	},
	{
		name: "fennel greens",
		department: "unclassified"
	},
	{
		name: "persimmon pulp",
		department: "unclassified"
	},
	{
		name: "dried apple rings",
		department: "unclassified"
	},
	{
		name: "sheep",
		department: "unclassified"
	},
	{
		name: "salmon caviar",
		department: "unclassified"
	},
	{
		name: "whole wheat noodles",
		department: "unclassified"
	},
	{
		name: "waffle cones",
		department: "unclassified"
	},
	{
		name: "non-dairy creamer",
		department: "unclassified"
	},
	{
		name: "raw milk",
		department: "unclassified"
	},
	{
		name: "Young Herring Filet",
		department: "unclassified"
	},
	{
		name: "legumes",
		department: "unclassified"
	},
	{
		name: "shiro miso",
		department: "unclassified"
	},
	{
		name: "yogurt dressing",
		department: "unclassified"
	},
	{
		name: "oatmeal cookies",
		department: "unclassified"
	},
	{
		name: "semi-hard cheese",
		department: "unclassified"
	},
	{
		name: "reduced fat buttermilk",
		department: "unclassified"
	},
	{
		name: "light buttermilk",
		department: "unclassified"
	},
	{
		name: "Oreo Pie Crust",
		department: "unclassified"
	},
	{
		name: "trumpet royale mushrooms",
		department: "unclassified"
	},
	{
		name: "frozen potatoes",
		department: "unclassified"
	},
	{
		name: "thin pretzel sticks",
		department: "unclassified"
	},
	{
		name: "milk chocolate kisses",
		department: "unclassified"
	},
	{
		name: "tortelloni",
		department: "unclassified"
	},
	{
		name: "spring water",
		department: "unclassified"
	},
	{
		name: "rose essence",
		department: "unclassified"
	},
	{
		name: "bitter almond extract",
		department: "unclassified"
	},
	{
		name: "kasha",
		department: "unclassified"
	},
	{
		name: "yeast extract",
		department: "unclassified"
	},
	{
		name: "cornbread muffins",
		department: "unclassified"
	},
	{
		name: "corn muffin",
		department: "unclassified"
	},
	{
		name: "topping mix",
		department: "unclassified"
	},
	{
		name: "tomato chutney",
		department: "unclassified"
	},
	{
		name: "brown rice noodles",
		department: "unclassified"
	},
	{
		name: "pork goulash",
		department: "unclassified"
	},
	{
		name: "chocolate pie crust",
		department: "unclassified"
	},
	{
		name: "chocolate crumb crust",
		department: "unclassified"
	},
	{
		name: "caramel candies",
		department: "unclassified"
	},
	{
		name: "peapods",
		department: "unclassified"
	},
	{
		name: "iceberg",
		department: "unclassified"
	},
	{
		name: "Cheez-It Crackers",
		department: "unclassified"
	},
	{
		name: "cherrystone clams",
		department: "unclassified"
	},
	{
		name: "whole wheat rotini",
		department: "unclassified"
	},
	{
		name: "V8 Juice",
		department: "unclassified"
	},
	{
		name: "creme anglaise",
		department: "unclassified"
	},
	{
		name: "Bertolli\\u00AE Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "fillo dough",
		department: "unclassified"
	},
	{
		name: "carpaccio",
		department: "unclassified"
	},
	{
		name: "hot salsa",
		department: "unclassified"
	},
	{
		name: "cheddar cheese slices",
		department: "unclassified"
	},
	{
		name: "brown sugar substitute",
		department: "unclassified"
	},
	{
		name: "pork hocks",
		department: "unclassified"
	},
	{
		name: "green tea leaves",
		department: "unclassified"
	},
	{
		name: "nama shoyu",
		department: "unclassified"
	},
	{
		name: "chinkiang vinegar",
		department: "unclassified"
	},
	{
		name: "beau monde seasoning",
		department: "unclassified"
	},
	{
		name: "brewer's yeast",
		department: "unclassified"
	},
	{
		name: "yeast flakes",
		department: "unclassified"
	},
	{
		name: "Diamond Crystal\\u00AE Kosher Salt",
		department: "unclassified"
	},
	{
		name: "cake yeast",
		department: "unclassified"
	},
	{
		name: "gold rum",
		department: "unclassified"
	},
	{
		name: "sazon",
		department: "unclassified"
	},
	{
		name: "vegan beef crumbles",
		department: "unclassified"
	},
	{
		name: "shawarma spice mix",
		department: "unclassified"
	},
	{
		name: "laurel leaves",
		department: "unclassified"
	},
	{
		name: "bay laurel leaves",
		department: "unclassified"
	},
	{
		name: "potato salad",
		department: "unclassified"
	},
	{
		name: "pear halves",
		department: "unclassified"
	},
	{
		name: "veal bratwurst",
		department: "unclassified"
	},
	{
		name: "Baker's Angel Flake Coconut",
		department: "unclassified"
	},
	{
		name: "mushroom stock",
		department: "unclassified"
	},
	{
		name: "methi leaves",
		department: "unclassified"
	},
	{
		name: "somen",
		department: "unclassified"
	},
	{
		name: "rapini",
		department: "unclassified"
	},
	{
		name: "lower sodium beef broth",
		department: "unclassified"
	},
	{
		name: "Campbell's Condensed French Onion Soup",
		department: "unclassified"
	},
	{
		name: "cuttlefish",
		department: "unclassified"
	},
	{
		name: "non-dairy topping",
		department: "unclassified"
	},
	{
		name: "Cinnamon Toast Crunch Cereal",
		department: "unclassified"
	},
	{
		name: "shortcakes",
		department: "unclassified"
	},
	{
		name: "citrus zest",
		department: "unclassified"
	},
	{
		name: "tuinkruidenbouillon",
		department: "unclassified"
	},
	{
		name: "cherry compote",
		department: "unclassified"
	},
	{
		name: "beurre mani\\u00E9",
		department: "unclassified"
	},
	{
		name: "Truv\\u00EDa\\u00AE Brown Sugar Blend",
		department: "unclassified"
	},
	{
		name: "vidalia",
		department: "unclassified"
	},
	{
		name: "top loin steaks",
		department: "unclassified"
	},
	{
		name: "drumstick",
		department: "unclassified"
	},
	{
		name: "dragon fruit",
		department: "unclassified"
	},
	{
		name: "soybean paste",
		department: "unclassified"
	},
	{
		name: "garlic mayonnaise",
		department: "unclassified"
	},
	{
		name: "sauterne",
		department: "unclassified"
	},
	{
		name: "shrimp cocktail",
		department: "unclassified"
	},
	{
		name: "mini mozzarella balls",
		department: "unclassified"
	},
	{
		name: "kamut",
		department: "unclassified"
	},
	{
		name: "Castelvetrano olives",
		department: "unclassified"
	},
	{
		name: "kefalotyri",
		department: "unclassified"
	},
	{
		name: "kefalotiri",
		department: "unclassified"
	},
	{
		name: "green chartreuse",
		department: "unclassified"
	},
	{
		name: "unsalted beef stock",
		department: "unclassified"
	},
	{
		name: "fishcake",
		department: "unclassified"
	},
	{
		name: "peppered bacon",
		department: "unclassified"
	},
	{
		name: "partridges",
		department: "unclassified"
	},
	{
		name: "stone fruit",
		department: "unclassified"
	},
	{
		name: "cultured buttermilk",
		department: "unclassified"
	},
	{
		name: "whole wheat wraps",
		department: "unclassified"
	},
	{
		name: "table sugar",
		department: "unclassified"
	},
	{
		name: "cannoli shells",
		department: "unclassified"
	},
	{
		name: "dessertrijst",
		department: "unclassified"
	},
	{
		name: "tvp",
		department: "unclassified"
	},
	{
		name: "caul fat",
		department: "unclassified"
	},
	{
		name: "water packed artichoke hearts",
		department: "unclassified"
	},
	{
		name: "blade roast",
		department: "unclassified"
	},
	{
		name: "ground star anise",
		department: "unclassified"
	},
	{
		name: "iced coffee",
		department: "unclassified"
	},
	{
		name: " Cake",
		department: "unclassified"
	},
	{
		name: "fresh chile",
		department: "unclassified"
	},
	{
		name: "fish steaks",
		department: "unclassified"
	},
	{
		name: "veal scallops",
		department: "unclassified"
	},
	{
		name: "rib-eye roast",
		department: "unclassified"
	},
	{
		name: "low-fat natural yogurt",
		department: "unclassified"
	},
	{
		name: "pignolis",
		department: "unclassified"
	},
	{
		name: "meat seasoning",
		department: "unclassified"
	},
	{
		name: "gumbo file",
		department: "unclassified"
	},
	{
		name: "ground chile",
		department: "unclassified"
	},
	{
		name: "crushed peppercorn",
		department: "unclassified"
	},
	{
		name: "basil olive oil",
		department: "unclassified"
	},
	{
		name: "tomato bell peppers",
		department: "unclassified"
	},
	{
		name: "atjar tjampoer",
		department: "unclassified"
	},
	{
		name: "apricot juice",
		department: "unclassified"
	},
	{
		name: "Crisco Pure Vegetable Oil",
		department: "unclassified"
	},
	{
		name: "fiddleheads",
		department: "unclassified"
	},
	{
		name: "red caviar",
		department: "unclassified"
	},
	{
		name: "piri-piri sauce",
		department: "unclassified"
	},
	{
		name: "cracker meal",
		department: "unclassified"
	},
	{
		name: "Daiya",
		department: "unclassified"
	},
	{
		name: "malt beer",
		department: "unclassified"
	},
	{
		name: "bacon rind",
		department: "unclassified"
	},
	{
		name: "frozen peppers and onions",
		department: "unclassified"
	},
	{
		name: "Pace Chunky Salsa",
		department: "unclassified"
	},
	{
		name: "swordfish fillets",
		department: "unclassified"
	},
	{
		name: "char fillets",
		department: "unclassified"
	},
	{
		name: "semi pearled farro",
		department: "unclassified"
	},
	{
		name: "deviled ham",
		department: "unclassified"
	},
	{
		name: "gorgonzola dolce",
		department: "unclassified"
	},
	{
		name: "ciabatta buns",
		department: "unclassified"
	},
	{
		name: "table wine",
		department: "unclassified"
	},
	{
		name: "bock beer",
		department: "unclassified"
	},
	{
		name: "belacan",
		department: "unclassified"
	},
	{
		name: "seedless oranges",
		department: "unclassified"
	},
	{
		name: "beef rump steaks",
		department: "unclassified"
	},
	{
		name: "chocolate rolls",
		department: "unclassified"
	},
	{
		name: "black quinoa",
		department: "unclassified"
	},
	{
		name: "ground rosemary",
		department: "unclassified"
	},
	{
		name: "Maltesers",
		department: "unclassified"
	},
	{
		name: "Progresso Black Beans",
		department: "unclassified"
	},
	{
		name: "masoor dal",
		department: "unclassified"
	},
	{
		name: "red mullet",
		department: "unclassified"
	},
	{
		name: "queso anejo",
		department: "unclassified"
	},
	{
		name: "pickled okra",
		department: "unclassified"
	},
	{
		name: "hazelnut paste",
		department: "unclassified"
	},
	{
		name: "almond syrup",
		department: "unclassified"
	},
	{
		name: "gremolata",
		department: "unclassified"
	},
	{
		name: "beef shin",
		department: "unclassified"
	},
	{
		name: "goose breasts",
		department: "unclassified"
	},
	{
		name: "cranberry jam",
		department: "unclassified"
	},
	{
		name: "unfiltered apple cider vinegar",
		department: "unclassified"
	},
	{
		name: "keukenstroop",
		department: "unclassified"
	},
	{
		name: "cubed pumpkin",
		department: "unclassified"
	},
	{
		name: "nopales",
		department: "unclassified"
	},
	{
		name: "european cucumber",
		department: "unclassified"
	},
	{
		name: "gluten-free penne pasta",
		department: "unclassified"
	},
	{
		name: "hot italian turkey sausage",
		department: "unclassified"
	},
	{
		name: "seville oranges",
		department: "unclassified"
	},
	{
		name: "pink lady apple",
		department: "unclassified"
	},
	{
		name: "lingonberry",
		department: "unclassified"
	},
	{
		name: "earl grey tea leaves",
		department: "unclassified"
	},
	{
		name: "Melba toast",
		department: "unclassified"
	},
	{
		name: "cassis liqueur",
		department: "unclassified"
	},
	{
		name: "Godiva Chocolate Liqueur",
		department: "unclassified"
	},
	{
		name: "blueberry juice",
		department: "unclassified"
	},
	{
		name: "whole wheat orzo",
		department: "unclassified"
	},
	{
		name: "wieners",
		department: "unclassified"
	},
	{
		name: "blood sausage",
		department: "unclassified"
	},
	{
		name: "Ragu Sauce",
		department: "unclassified"
	},
	{
		name: "Ragu Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "pickling liquid",
		department: "unclassified"
	},
	{
		name: "margarita salt",
		department: "unclassified"
	},
	{
		name: "STOVE TOP Stuffing Mix for Chicken",
		department: "unclassified"
	},
	{
		name: "hake fillets",
		department: "unclassified"
	},
	{
		name: "pepper berries",
		department: "unclassified"
	},
	{
		name: "gyros spice mix",
		department: "unclassified"
	},
	{
		name: "carnitas",
		department: "unclassified"
	},
	{
		name: "Kahlua Liqueur",
		department: "unclassified"
	},
	{
		name: "potato wedges",
		department: "unclassified"
	},
	{
		name: "curd cheese",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Pure Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "turnip tops",
		department: "unclassified"
	},
	{
		name: "chinese mustard",
		department: "unclassified"
	},
	{
		name: "ragout",
		department: "unclassified"
	},
	{
		name: "german chocolate",
		department: "unclassified"
	},
	{
		name: "whole wheat fusilli",
		department: "unclassified"
	},
	{
		name: "tri-tip steak",
		department: "unclassified"
	},
	{
		name: "sazon seasoning",
		department: "unclassified"
	},
	{
		name: "Pace Picante Sauce",
		department: "unclassified"
	},
	{
		name: "olive brine",
		department: "unclassified"
	},
	{
		name: "less sodium soy sauce",
		department: "unclassified"
	},
	{
		name: "coffee syrup",
		department: "unclassified"
	},
	{
		name: "high-gluten flour",
		department: "unclassified"
	},
	{
		name: "peach pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "gluten free cooking spray",
		department: "unclassified"
	},
	{
		name: "boneless pork tenderloin",
		department: "unclassified"
	},
	{
		name: "Cabot Sharp Cheddar",
		department: "unclassified"
	},
	{
		name: "ginger pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "smoked beef",
		department: "unclassified"
	},
	{
		name: "stevia baking blend",
		department: "unclassified"
	},
	{
		name: "Mars Candy Bars",
		department: "unclassified"
	},
	{
		name: "carob",
		department: "unclassified"
	},
	{
		name: "nacho chips",
		department: "unclassified"
	},
	{
		name: "whole wheat fettuccine",
		department: "unclassified"
	},
	{
		name: "rib pork chops",
		department: "unclassified"
	},
	{
		name: "lamb shoulder chops",
		department: "unclassified"
	},
	{
		name: "dried lemon peel",
		department: "unclassified"
	},
	{
		name: "whole wheat panko",
		department: "unclassified"
	},
	{
		name: "toast points",
		department: "unclassified"
	},
	{
		name: "orgeat syrup",
		department: "unclassified"
	},
	{
		name: "orgeat",
		department: "unclassified"
	},
	{
		name: "frying fat",
		department: "unclassified"
	},
	{
		name: "Indonesian bay leaves",
		department: "unclassified"
	},
	{
		name: "bbq seasoning",
		department: "unclassified"
	},
	{
		name: "Old El Paso\\u2122 refried beans",
		department: "unclassified"
	},
	{
		name: "calamansi",
		department: "unclassified"
	},
	{
		name: "kalamansi",
		department: "unclassified"
	},
	{
		name: "Flatout\\u00AE Flatbreads",
		department: "unclassified"
	},
	{
		name: "soy crumbles",
		department: "unclassified"
	},
	{
		name: "top round roast",
		department: "unclassified"
	},
	{
		name: "bottom round",
		department: "unclassified"
	},
	{
		name: "cola-flavored carbonated beverage",
		department: "unclassified"
	},
	{
		name: "red chile sauce",
		department: "unclassified"
	},
	{
		name: "Pure Wesson Canola Oil",
		department: "unclassified"
	},
	{
		name: "mellow white miso",
		department: "unclassified"
	},
	{
		name: "fruit syrup",
		department: "unclassified"
	},
	{
		name: "wheat starch",
		department: "unclassified"
	},
	{
		name: "raita",
		department: "unclassified"
	},
	{
		name: "sooji",
		department: "unclassified"
	},
	{
		name: "cubed pancetta",
		department: "unclassified"
	},
	{
		name: "whole grain wheat flour",
		department: "unclassified"
	},
	{
		name: "merluza",
		department: "unclassified"
	},
	{
		name: "hake",
		department: "unclassified"
	},
	{
		name: "shahi jeera",
		department: "unclassified"
	},
	{
		name: "beef tongue",
		department: "unclassified"
	},
	{
		name: "yuca",
		department: "unclassified"
	},
	{
		name: "low sodium canned chicken stock",
		department: "unclassified"
	},
	{
		name: "buckwheat noodles",
		department: "unclassified"
	},
	{
		name: "drummettes",
		department: "unclassified"
	},
	{
		name: "verjuice",
		department: "unclassified"
	},
	{
		name: "Manzanilla olives",
		department: "unclassified"
	},
	{
		name: "whole wheat rolls",
		department: "unclassified"
	},
	{
		name: "butter cake",
		department: "unclassified"
	},
	{
		name: "mulled wine",
		department: "unclassified"
	},
	{
		name: "biscuit crumbs",
		department: "unclassified"
	},
	{
		name: "puff pastry shells",
		department: "unclassified"
	},
	{
		name: "chipotle puree",
		department: "unclassified"
	},
	{
		name: "low-fat graham crackers",
		department: "unclassified"
	},
	{
		name: "low fat graham crackers",
		department: "unclassified"
	},
	{
		name: "whole wheat macaroni",
		department: "unclassified"
	},
	{
		name: "ovaltine",
		department: "unclassified"
	},
	{
		name: "asian sauce",
		department: "unclassified"
	},
	{
		name: "white rice vinegar",
		department: "unclassified"
	},
	{
		name: "low-fat cooking spray",
		department: "unclassified"
	},
	{
		name: "black truffle oil",
		department: "unclassified"
	},
	{
		name: "kamut flour",
		department: "unclassified"
	},
	{
		name: "hawaiian bread",
		department: "unclassified"
	},
	{
		name: "aquavit",
		department: "unclassified"
	},
	{
		name: "capers in brine",
		department: "unclassified"
	},
	{
		name: "garden herbs",
		department: "unclassified"
	},
	{
		name: "bresaola",
		department: "unclassified"
	},
	{
		name: "truffle butter",
		department: "unclassified"
	},
	{
		name: "vanilla sauce",
		department: "unclassified"
	},
	{
		name: "collard leaves",
		department: "unclassified"
	},
	{
		name: "globe eggplant",
		department: "unclassified"
	},
	{
		name: "daal",
		department: "unclassified"
	},
	{
		name: "nonfat vanilla frozen yogurt",
		department: "unclassified"
	},
	{
		name: "Lucky Charms Cereal",
		department: "unclassified"
	},
	{
		name: "orange vodka",
		department: "unclassified"
	},
	{
		name: "sangria",
		department: "unclassified"
	},
	{
		name: "refrigerated seamless crescent dough",
		department: "unclassified"
	},
	{
		name: "jumbo marshmallows",
		department: "unclassified"
	},
	{
		name: "unsalted roasted almonds",
		department: "unclassified"
	},
	{
		name: "flanken short ribs",
		department: "unclassified"
	},
	{
		name: "flanken",
		department: "unclassified"
	},
	{
		name: "blood",
		department: "unclassified"
	},
	{
		name: "Mountain Dew Soda",
		department: "unclassified"
	},
	{
		name: "small pearl tapioca",
		department: "unclassified"
	},
	{
		name: "saltine crumbs",
		department: "unclassified"
	},
	{
		name: "pig feet",
		department: "unclassified"
	},
	{
		name: "red wine vinaigrette",
		department: "unclassified"
	},
	{
		name: "pickapeppa sauce",
		department: "unclassified"
	},
	{
		name: "nonfat mayonnaise",
		department: "unclassified"
	},
	{
		name: "non-fat mayonnaise",
		department: "unclassified"
	},
	{
		name: "chili bean paste",
		department: "unclassified"
	},
	{
		name: "poundcake mix",
		department: "unclassified"
	},
	{
		name: "chive stems",
		department: "unclassified"
	},
	{
		name: "pomelo",
		department: "unclassified"
	},
	{
		name: "elderberry juice",
		department: "unclassified"
	},
	{
		name: "dill pickle spear",
		department: "unclassified"
	},
	{
		name: "sweet cream",
		department: "unclassified"
	},
	{
		name: "peanut butter cookie dough",
		department: "unclassified"
	},
	{
		name: "almond chocolate milk",
		department: "unclassified"
	},
	{
		name: "bone-in short ribs",
		department: "unclassified"
	},
	{
		name: "jalape",
		department: "unclassified"
	},
	{
		name: "pasta flour",
		department: "unclassified"
	},
	{
		name: "dover sole",
		department: "unclassified"
	},
	{
		name: "Absolut Vodka",
		department: "unclassified"
	},
	{
		name: "purple sweet potatoes",
		department: "unclassified"
	},
	{
		name: "lemon basil",
		department: "unclassified"
	},
	{
		name: "fresh chicken stock",
		department: "unclassified"
	},
	{
		name: "hen",
		department: "unclassified"
	},
	{
		name: "limeade concentrate",
		department: "unclassified"
	},
	{
		name: "carambola",
		department: "unclassified"
	},
	{
		name: "pickled carrots",
		department: "unclassified"
	},
	{
		name: "shredded wheat",
		department: "unclassified"
	},
	{
		name: "japanese breadcrumbs",
		department: "unclassified"
	},
	{
		name: "gluten-free all-purpose baking flour",
		department: "unclassified"
	},
	{
		name: "amber rum",
		department: "unclassified"
	},
	{
		name: "gluten free chicken broth",
		department: "unclassified"
	},
	{
		name: "soup seasoning mix",
		department: "unclassified"
	},
	{
		name: "beef roulades",
		department: "unclassified"
	},
	{
		name: "satay dip",
		department: "unclassified"
	},
	{
		name: "satay marinade",
		department: "unclassified"
	},
	{
		name: "satay sauce",
		department: "unclassified"
	},
	{
		name: "potash",
		department: "unclassified"
	},
	{
		name: "shaoxing",
		department: "unclassified"
	},
	{
		name: "frozen broad beans",
		department: "unclassified"
	},
	{
		name: "Milo",
		department: "unclassified"
	},
	{
		name: "veal kidneys",
		department: "unclassified"
	},
	{
		name: "veal kidney",
		department: "unclassified"
	},
	{
		name: "nonfat beef broth",
		department: "unclassified"
	},
	{
		name: "dry fettuccine",
		department: "unclassified"
	},
	{
		name: "veal breast",
		department: "unclassified"
	},
	{
		name: "pork sirloin roast",
		department: "unclassified"
	},
	{
		name: "picholine olives",
		department: "unclassified"
	},
	{
		name: "soft rolls",
		department: "unclassified"
	},
	{
		name: "crusty french loaves",
		department: "unclassified"
	},
	{
		name: "crushed crackers",
		department: "unclassified"
	},
	{
		name: "Calumet Baking Powder",
		department: "unclassified"
	},
	{
		name: "fuji",
		department: "unclassified"
	},
	{
		name: "tamarind pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "pineapple wedges",
		department: "unclassified"
	},
	{
		name: "chocolate milk mix",
		department: "unclassified"
	},
	{
		name: "diet lemon lime soda",
		department: "unclassified"
	},
	{
		name: "sea robins",
		department: "unclassified"
	},
	{
		name: "granulated artificial sweetener",
		department: "unclassified"
	},
	{
		name: "Philadelphia Light Cream Cheese",
		department: "unclassified"
	},
	{
		name: "corn salsa",
		department: "unclassified"
	},
	{
		name: "deli lunch meat",
		department: "unclassified"
	},
	{
		name: "deli meat",
		department: "unclassified"
	},
	{
		name: "turkey sausage links",
		department: "unclassified"
	},
	{
		name: "toasted nori",
		department: "unclassified"
	},
	{
		name: "lox",
		department: "unclassified"
	},
	{
		name: "boneless duck breast",
		department: "unclassified"
	},
	{
		name: "mandarin juice",
		department: "unclassified"
	},
	{
		name: "german mustard",
		department: "unclassified"
	},
	{
		name: "gaeta olives",
		department: "unclassified"
	},
	{
		name: "brown gravy",
		department: "unclassified"
	},
	{
		name: "fast-rising active dry yeast",
		department: "unclassified"
	},
	{
		name: "bastogne cookies",
		department: "unclassified"
	},
	{
		name: "unsalted almond butter",
		department: "unclassified"
	},
	{
		name: "Philadelphia Neufchatel Cheese",
		department: "unclassified"
	},
	{
		name: "chocolate fudge sauce",
		department: "unclassified"
	},
	{
		name: "Amber Ale",
		department: "unclassified"
	},
	{
		name: "Marie biscuits",
		department: "unclassified"
	},
	{
		name: "Tofutti Better Than Cream Cheese",
		department: "unclassified"
	},
	{
		name: "yucca",
		department: "unclassified"
	},
	{
		name: "nonfat chicken broth",
		department: "unclassified"
	},
	{
		name: "stewing chicken",
		department: "unclassified"
	},
	{
		name: "citrus peel",
		department: "unclassified"
	},
	{
		name: "sour orange juice",
		department: "unclassified"
	},
	{
		name: "grapefruit soda",
		department: "unclassified"
	},
	{
		name: "queso panela",
		department: "unclassified"
	},
	{
		name: "paneer cheese",
		department: "unclassified"
	},
	{
		name: "I Can't Believe It's Not Butter!\\u00AE All Purpose Sticks",
		department: "unclassified"
	},
	{
		name: "gravy master",
		department: "unclassified"
	},
	{
		name: "wheat rolls",
		department: "unclassified"
	},
	{
		name: "unsalted peanut butter",
		department: "unclassified"
	},
	{
		name: "double crust",
		department: "unclassified"
	},
	{
		name: "Crisco All-Vegetable Shortening",
		department: "unclassified"
	},
	{
		name: "leek leaves",
		department: "unclassified"
	},
	{
		name: "everything bagels",
		department: "unclassified"
	},
	{
		name: "rennet",
		department: "unclassified"
	},
	{
		name: "cabbage head",
		department: "unclassified"
	},
	{
		name: "ratatouille",
		department: "unclassified"
	},
	{
		name: "Quorn crumbles",
		department: "unclassified"
	},
	{
		name: "apple wedges",
		department: "unclassified"
	},
	{
		name: "tobiko",
		department: "unclassified"
	},
	{
		name: "marrowfat peas",
		department: "unclassified"
	},
	{
		name: "bear",
		department: "unclassified"
	},
	{
		name: "red chard",
		department: "unclassified"
	},
	{
		name: "Campbell's Condensed Cream of Celery Soup",
		department: "unclassified"
	},
	{
		name: "boneless sirloin",
		department: "unclassified"
	},
	{
		name: "pina colada mix",
		department: "unclassified"
	},
	{
		name: "coconut juice",
		department: "unclassified"
	},
	{
		name: "pickle brine",
		department: "unclassified"
	},
	{
		name: "raspberry schnapps",
		department: "unclassified"
	},
	{
		name: "raspberry schnaps",
		department: "unclassified"
	},
	{
		name: "black grapes",
		department: "unclassified"
	},
	{
		name: "chipotle mayonnaise",
		department: "unclassified"
	},
	{
		name: "margarine spread",
		department: "unclassified"
	},
	{
		name: "balm leaves",
		department: "unclassified"
	},
	{
		name: "collards",
		department: "unclassified"
	},
	{
		name: "Peychaud's Bitters",
		department: "unclassified"
	},
	{
		name: "pimento cheese",
		department: "unclassified"
	},
	{
		name: "coleslaw dressing",
		department: "unclassified"
	},
	{
		name: "cream yogurt",
		department: "unclassified"
	},
	{
		name: "McCormick Black Pepper",
		department: "unclassified"
	},
	{
		name: "shelled hemp",
		department: "unclassified"
	},
	{
		name: "shelled hempseed",
		department: "unclassified"
	},
	{
		name: "yucca root",
		department: "unclassified"
	},
	{
		name: "yellow peas",
		department: "unclassified"
	},
	{
		name: "yellow crookneck squash",
		department: "unclassified"
	},
	{
		name: "toasted macadamia nuts",
		department: "unclassified"
	},
	{
		name: "pollock fillets",
		department: "unclassified"
	},
	{
		name: "back ribs",
		department: "unclassified"
	},
	{
		name: "Braeburn Apple",
		department: "unclassified"
	},
	{
		name: "chocolate chip ice cream",
		department: "unclassified"
	},
	{
		name: "mole sauce",
		department: "unclassified"
	},
	{
		name: "Fruity Pebbles Cereal",
		department: "unclassified"
	},
	{
		name: "spelt flakes",
		department: "unclassified"
	},
	{
		name: "sourdough rolls",
		department: "unclassified"
	},
	{
		name: "hot roll mix",
		department: "unclassified"
	},
	{
		name: "grains of paradise",
		department: "unclassified"
	},
	{
		name: "gluten-free cornmeal",
		department: "unclassified"
	},
	{
		name: "petits pois",
		department: "unclassified"
	},
	{
		name: "cantaloupe balls",
		department: "unclassified"
	},
	{
		name: "soft taco size flour tortillas",
		department: "unclassified"
	},
	{
		name: "seasoned panko bread crumbs",
		department: "unclassified"
	},
	{
		name: "pear juice concentrate",
		department: "unclassified"
	},
	{
		name: "Sabra\\u00AE Classic Hummus",
		department: "unclassified"
	},
	{
		name: "Sabra Hummus",
		department: "unclassified"
	},
	{
		name: "red onion slices",
		department: "unclassified"
	},
	{
		name: "chicken noodle soup",
		department: "unclassified"
	},
	{
		name: "pheasant breasts",
		department: "unclassified"
	},
	{
		name: "butterflied leg of lamb",
		department: "unclassified"
	},
	{
		name: "beef for stew",
		department: "unclassified"
	},
	{
		name: "crushed pineapple juice",
		department: "unclassified"
	},
	{
		name: "low-fat sweetened condensed milk",
		department: "unclassified"
	},
	{
		name: "tonkatsu sauce",
		department: "unclassified"
	},
	{
		name: "pistachio paste",
		department: "unclassified"
	},
	{
		name: "cornbread muffin mix",
		department: "unclassified"
	},
	{
		name: "rosettes",
		department: "unclassified"
	},
	{
		name: "bulghur",
		department: "unclassified"
	},
	{
		name: "mixed tomatoes",
		department: "unclassified"
	},
	{
		name: "cubed mango",
		department: "unclassified"
	},
	{
		name: "fregola",
		department: "unclassified"
	},
	{
		name: "fregula",
		department: "unclassified"
	},
	{
		name: "Taco Bell Taco Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "shimeji mushrooms",
		department: "unclassified"
	},
	{
		name: "jasmine",
		department: "unclassified"
	},
	{
		name: "chive blossoms",
		department: "unclassified"
	},
	{
		name: "water crackers",
		department: "unclassified"
	},
	{
		name: "whole wheat egg noodles",
		department: "unclassified"
	},
	{
		name: "Minute Brown Rice",
		department: "unclassified"
	},
	{
		name: "clamato juice",
		department: "unclassified"
	},
	{
		name: "2% low-fat cheddar cheese",
		department: "unclassified"
	},
	{
		name: "vanilla glaze",
		department: "unclassified"
	},
	{
		name: "chili bean sauce",
		department: "unclassified"
	},
	{
		name: "sichuan hot bean paste",
		department: "unclassified"
	},
	{
		name: "grey salt",
		department: "unclassified"
	},
	{
		name: "swiss roll",
		department: "unclassified"
	},
	{
		name: "pizza crust mix",
		department: "unclassified"
	},
	{
		name: "pita rounds",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Fudge Brownie Mix",
		department: "unclassified"
	},
	{
		name: "French breakfast radishes",
		department: "unclassified"
	},
	{
		name: "sack",
		department: "unclassified"
	},
	{
		name: "baby pineapple",
		department: "unclassified"
	},
	{
		name: "Hamburger Helper",
		department: "unclassified"
	},
	{
		name: "leyden cheese",
		department: "unclassified"
	},
	{
		name: "dinkel flour",
		department: "unclassified"
	},
	{
		name: "boiled beef fillet",
		department: "unclassified"
	},
	{
		name: "wheat sprouts",
		department: "unclassified"
	},
	{
		name: "unsalted pecans",
		department: "unclassified"
	},
	{
		name: "KRAFT Original Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "Kraft Barbeque Sauce",
		department: "unclassified"
	},
	{
		name: "cauliflowerets",
		department: "unclassified"
	},
	{
		name: "canned chipotles",
		department: "unclassified"
	},
	{
		name: "banana pudding",
		department: "unclassified"
	},
	{
		name: "mixed seafood",
		department: "unclassified"
	},
	{
		name: "cod fish",
		department: "unclassified"
	},
	{
		name: "bream",
		department: "unclassified"
	},
	{
		name: "whole wheat angel hair pasta",
		department: "unclassified"
	},
	{
		name: "shoulder roast",
		department: "unclassified"
	},
	{
		name: "half ham",
		department: "unclassified"
	},
	{
		name: "moroccan seasoning",
		department: "unclassified"
	},
	{
		name: "citrus vinaigrette",
		department: "unclassified"
	},
	{
		name: "whole wheat pizza crust",
		department: "unclassified"
	},
	{
		name: "fino sherry",
		department: "unclassified"
	},
	{
		name: "beef schnitzel",
		department: "unclassified"
	},
	{
		name: "savoy cabbage leaves",
		department: "unclassified"
	},
	{
		name: "wild cranberries",
		department: "unclassified"
	},
	{
		name: "baking wafers",
		department: "unclassified"
	},
	{
		name: "sliced mango",
		department: "unclassified"
	},
	{
		name: "dried chipotle pepper",
		department: "unclassified"
	},
	{
		name: "patis",
		department: "unclassified"
	},
	{
		name: "north sea crab meat",
		department: "unclassified"
	},
	{
		name: "cold-smoked salmon",
		department: "unclassified"
	},
	{
		name: "Sprite Zero",
		department: "unclassified"
	},
	{
		name: "Truv\\u00EDa\\u00AE Spoonable",
		department: "unclassified"
	},
	{
		name: "zuivelspread",
		department: "unclassified"
	},
	{
		name: "ciabatta roll",
		department: "unclassified"
	},
	{
		name: "peanut butter cookies",
		department: "unclassified"
	},
	{
		name: "unsalted margarine",
		department: "unclassified"
	},
	{
		name: "Honey Nut Cheerios Cereal",
		department: "unclassified"
	},
	{
		name: "minestrone soup",
		department: "unclassified"
	},
	{
		name: "corkscrew pasta",
		department: "unclassified"
	},
	{
		name: "veal for stew",
		department: "unclassified"
	},
	{
		name: "veal stew meat",
		department: "unclassified"
	},
	{
		name: "fresh ham",
		department: "unclassified"
	},
	{
		name: "crabapples",
		department: "unclassified"
	},
	{
		name: "crab apple",
		department: "unclassified"
	},
	{
		name: "hibiscus tea",
		department: "unclassified"
	},
	{
		name: "calamansi juice",
		department: "unclassified"
	},
	{
		name: "aged gouda",
		department: "unclassified"
	},
	{
		name: "low-fat italian dressing",
		department: "unclassified"
	},
	{
		name: "low-fat italian salad dressing",
		department: "unclassified"
	},
	{
		name: "leftover gravy",
		department: "unclassified"
	},
	{
		name: "anisette",
		department: "unclassified"
	},
	{
		name: "accent",
		department: "unclassified"
	},
	{
		name: "grissini",
		department: "unclassified"
	},
	{
		name: "campanelle",
		department: "unclassified"
	},
	{
		name: "garlic sausage",
		department: "unclassified"
	},
	{
		name: "kala namak",
		department: "unclassified"
	},
	{
		name: "frozen ravioli",
		department: "unclassified"
	},
	{
		name: "beef stew",
		department: "unclassified"
	},
	{
		name: "Dixie Crystals Confectioners Powdered Sugar",
		department: "unclassified"
	},
	{
		name: "maitake mushrooms",
		department: "unclassified"
	},
	{
		name: "liquorice",
		department: "unclassified"
	},
	{
		name: "silver dragees",
		department: "unclassified"
	},
	{
		name: "cortland apples",
		department: "unclassified"
	},
	{
		name: "black onion seeds",
		department: "unclassified"
	},
	{
		name: "kashi",
		department: "unclassified"
	},
	{
		name: "doughnut holes",
		department: "unclassified"
	},
	{
		name: "crescent dinner rolls",
		department: "unclassified"
	},
	{
		name: "anise liqueur",
		department: "unclassified"
	},
	{
		name: "hot Italian sausage links",
		department: "unclassified"
	},
	{
		name: "seedless strawberry jam",
		department: "unclassified"
	},
	{
		name: "Baker's Premium White Chocolate Baking Bar",
		department: "unclassified"
	},
	{
		name: "banana puree",
		department: "unclassified"
	},
	{
		name: "yellow bean sauce",
		department: "unclassified"
	},
	{
		name: "cooked long-grain brown rice",
		department: "unclassified"
	},
	{
		name: "Blue Diamond Almonds",
		department: "unclassified"
	},
	{
		name: "white radish",
		department: "unclassified"
	},
	{
		name: "satsumas",
		department: "unclassified"
	},
	{
		name: "green gram",
		department: "unclassified"
	},
	{
		name: "buttercup squash",
		department: "unclassified"
	},
	{
		name: "condensed cream of broccoli soup",
		department: "unclassified"
	},
	{
		name: "beef demi-glace",
		department: "unclassified"
	},
	{
		name: "perch",
		department: "unclassified"
	},
	{
		name: "oil packed anchovies",
		department: "unclassified"
	},
	{
		name: "brown rice pasta",
		department: "unclassified"
	},
	{
		name: "shoulder lamb chops",
		department: "unclassified"
	},
	{
		name: "tangelos",
		department: "unclassified"
	},
	{
		name: "lime curd",
		department: "unclassified"
	},
	{
		name: "harissa sauce",
		department: "unclassified"
	},
	{
		name: "salted anchovies",
		department: "unclassified"
	},
	{
		name: "Puffed Wheat Cereal",
		department: "unclassified"
	},
	{
		name: "tart crust",
		department: "unclassified"
	},
	{
		name: "brownie batter",
		department: "unclassified"
	},
	{
		name: "midori",
		department: "unclassified"
	},
	{
		name: "black fungus",
		department: "unclassified"
	},
	{
		name: "tallow",
		department: "unclassified"
	},
	{
		name: "sunflower sprouts",
		department: "unclassified"
	},
	{
		name: "passion fruit pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "sushi grade tuna",
		department: "unclassified"
	},
	{
		name: "roasted pepitas",
		department: "unclassified"
	},
	{
		name: "venison steaks",
		department: "unclassified"
	},
	{
		name: "low-fat cr\\u00E8me fra\\u00EEche",
		department: "unclassified"
	},
	{
		name: "hare",
		department: "unclassified"
	},
	{
		name: "vine leaves",
		department: "unclassified"
	},
	{
		name: "rich chicken stock",
		department: "unclassified"
	},
	{
		name: "black licorice",
		department: "unclassified"
	},
	{
		name: "butterscotch topping",
		department: "unclassified"
	},
	{
		name: "powdered drink mix",
		department: "unclassified"
	},
	{
		name: "low-fat vanilla frozen yogurt",
		department: "unclassified"
	},
	{
		name: "1% low-fat buttermilk",
		department: "unclassified"
	},
	{
		name: "nutmeats",
		department: "unclassified"
	},
	{
		name: "shake n bake",
		department: "unclassified"
	},
	{
		name: "powdered sugar icing",
		department: "unclassified"
	},
	{
		name: "eel fillets",
		department: "unclassified"
	},
	{
		name: "venison leg",
		department: "unclassified"
	},
	{
		name: "dill blossoms",
		department: "unclassified"
	},
	{
		name: "yuzu",
		department: "unclassified"
	},
	{
		name: "canela",
		department: "unclassified"
	},
	{
		name: "conchiglie",
		department: "unclassified"
	},
	{
		name: "taco seasoning reduced sodium",
		department: "unclassified"
	},
	{
		name: "reduced sodium taco seasoning",
		department: "unclassified"
	},
	{
		name: "gomashio",
		department: "unclassified"
	},
	{
		name: "gomasio",
		department: "unclassified"
	},
	{
		name: "McCormick Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Herb Seasoned Stuffing",
		department: "unclassified"
	},
	{
		name: "dried kelp",
		department: "unclassified"
	},
	{
		name: "collard green leaves",
		department: "unclassified"
	},
	{
		name: "organic low sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "homemade vegetable stock",
		department: "unclassified"
	},
	{
		name: "Honey Maid Graham Cracker Crumbs",
		department: "unclassified"
	},
	{
		name: "lamb sausage",
		department: "unclassified"
	},
	{
		name: "low-fat shredded cheddar cheese",
		department: "unclassified"
	},
	{
		name: "sweet red bean paste",
		department: "unclassified"
	},
	{
		name: "bolognese sauce",
		department: "unclassified"
	},
	{
		name: "cane vinegar",
		department: "unclassified"
	},
	{
		name: "rye flakes",
		department: "unclassified"
	},
	{
		name: "pound cake mix",
		department: "unclassified"
	},
	{
		name: "soft-shell clams",
		department: "unclassified"
	},
	{
		name: "steamer clams",
		department: "unclassified"
	},
	{
		name: "fluff",
		department: "unclassified"
	},
	{
		name: "diet margarine",
		department: "unclassified"
	},
	{
		name: "mochiko",
		department: "unclassified"
	},
	{
		name: "ramen soup mix",
		department: "unclassified"
	},
	{
		name: "watermelon seeds",
		department: "unclassified"
	},
	{
		name: "Triscuit Crackers",
		department: "unclassified"
	},
	{
		name: "conch",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Real Bacon Bits",
		department: "unclassified"
	},
	{
		name: "knockwurst",
		department: "unclassified"
	},
	{
		name: "ground turkey sausage",
		department: "unclassified"
	},
	{
		name: "whipped dessert topping mix",
		department: "unclassified"
	},
	{
		name: "caramel ice cream",
		department: "unclassified"
	},
	{
		name: "soya cheese",
		department: "unclassified"
	},
	{
		name: "soy cheese",
		department: "unclassified"
	},
	{
		name: "white poppy seeds",
		department: "unclassified"
	},
	{
		name: "Sicilian olives",
		department: "unclassified"
	},
	{
		name: "pecan meal",
		department: "unclassified"
	},
	{
		name: "copha",
		department: "unclassified"
	},
	{
		name: "KRAFT Mexican Style Shredded Four Cheese with a TOUCH OF PHILADELPHIA",
		department: "unclassified"
	},
	{
		name: "chocolate easter eggs",
		department: "unclassified"
	},
	{
		name: "gingerbread cookies",
		department: "unclassified"
	},
	{
		name: "guajillo",
		department: "unclassified"
	},
	{
		name: "whey powder",
		department: "unclassified"
	},
	{
		name: "McCormick Ground Ginger",
		department: "unclassified"
	},
	{
		name: "profiteroles",
		department: "unclassified"
	},
	{
		name: "cream puffs",
		department: "unclassified"
	},
	{
		name: "liquid coconut oil",
		department: "unclassified"
	},
	{
		name: "Silk Almond Milk",
		department: "unclassified"
	},
	{
		name: "whole wheat rotini pasta",
		department: "unclassified"
	},
	{
		name: "diced beef",
		department: "unclassified"
	},
	{
		name: "non-fat cooking spray",
		department: "unclassified"
	},
	{
		name: "cinnamon oil",
		department: "unclassified"
	},
	{
		name: "framboise liqueur",
		department: "unclassified"
	},
	{
		name: "brandy extract",
		department: "unclassified"
	},
	{
		name: "gummy bears",
		department: "unclassified"
	},
	{
		name: "katakuriko",
		department: "unclassified"
	},
	{
		name: "sweet red wine",
		department: "unclassified"
	},
	{
		name: "sugar free strawberry gelatin",
		department: "unclassified"
	},
	{
		name: "purple grapes",
		department: "unclassified"
	},
	{
		name: "pastina",
		department: "unclassified"
	},
	{
		name: "italian meatballs",
		department: "unclassified"
	},
	{
		name: "dried lime",
		department: "unclassified"
	},
	{
		name: "ground peppercorn",
		department: "unclassified"
	},
	{
		name: "Crisco Canola Oil",
		department: "unclassified"
	},
	{
		name: "cabernet",
		department: "unclassified"
	},
	{
		name: "teff",
		department: "unclassified"
	},
	{
		name: "baking sugar",
		department: "unclassified"
	},
	{
		name: "cape gooseberries",
		department: "unclassified"
	},
	{
		name: "reduced fat Mexican cheese",
		department: "unclassified"
	},
	{
		name: "nuoc cham",
		department: "unclassified"
	},
	{
		name: "slab fat",
		department: "unclassified"
	},
	{
		name: "Tootsie Rolls",
		department: "unclassified"
	},
	{
		name: "clementine zest",
		department: "unclassified"
	},
	{
		name: "canned chicken",
		department: "unclassified"
	},
	{
		name: "semi-dried tomatoes",
		department: "unclassified"
	},
	{
		name: "Spice Islands Saigon Cinnamon",
		department: "unclassified"
	},
	{
		name: "twinkies",
		department: "unclassified"
	},
	{
		name: "english walnuts",
		department: "unclassified"
	},
	{
		name: "mostaccioli",
		department: "unclassified"
	},
	{
		name: "dried papaya",
		department: "unclassified"
	},
	{
		name: "reduced fat provolone cheese",
		department: "unclassified"
	},
	{
		name: "Cocoa Krispies Cereal",
		department: "unclassified"
	},
	{
		name: "cinnamon raisin bread",
		department: "unclassified"
	},
	{
		name: "pilsner",
		department: "unclassified"
	},
	{
		name: "tricolor quinoa",
		department: "unclassified"
	},
	{
		name: "filo",
		department: "unclassified"
	},
	{
		name: "roasted walnut oil",
		department: "unclassified"
	},
	{
		name: "coppa",
		department: "unclassified"
	},
	{
		name: "apricot jelly",
		department: "unclassified"
	},
	{
		name: "Fiori di Sicilia",
		department: "unclassified"
	},
	{
		name: "buttermilk ranch dressing",
		department: "unclassified"
	},
	{
		name: "goose drumsticks",
		department: "unclassified"
	},
	{
		name: "wholemeal breadcrumbs",
		department: "unclassified"
	},
	{
		name: "gold leaf",
		department: "unclassified"
	},
	{
		name: "Imperial Sugar Light Brown Sugar",
		department: "unclassified"
	},
	{
		name: "roast nuts",
		department: "unclassified"
	},
	{
		name: "tomato jam",
		department: "unclassified"
	},
	{
		name: "chicken schnitzel",
		department: "unclassified"
	},
	{
		name: "galanga powder",
		department: "unclassified"
	},
	{
		name: "cooked sausages",
		department: "unclassified"
	},
	{
		name: "pasilla",
		department: "unclassified"
	},
	{
		name: "rice bran",
		department: "unclassified"
	},
	{
		name: "tenderloin steaks",
		department: "unclassified"
	},
	{
		name: "confit duck leg",
		department: "unclassified"
	},
	{
		name: "lemon low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "vegetable seasoning",
		department: "unclassified"
	},
	{
		name: "sun dried tomato dressing",
		department: "unclassified"
	},
	{
		name: "light alfredo sauce",
		department: "unclassified"
	},
	{
		name: "hot bean paste",
		department: "unclassified"
	},
	{
		name: "lean minced lamb",
		department: "unclassified"
	},
	{
		name: "a\\u00E7ai powder",
		department: "unclassified"
	},
	{
		name: "shortcrust biscuit",
		department: "unclassified"
	},
	{
		name: "glace",
		department: "unclassified"
	},
	{
		name: "pretzel hamburger buns",
		department: "unclassified"
	},
	{
		name: "pretzel buns",
		department: "unclassified"
	},
	{
		name: "shredded romano cheese",
		department: "unclassified"
	},
	{
		name: "stroganoff sauce",
		department: "unclassified"
	},
	{
		name: "lobster stock",
		department: "unclassified"
	},
	{
		name: "Godiva White Chocolate Liqueur",
		department: "unclassified"
	},
	{
		name: "white chocolate liqueur",
		department: "unclassified"
	},
	{
		name: "fish balls",
		department: "unclassified"
	},
	{
		name: "tongue",
		department: "unclassified"
	},
	{
		name: "lambs liver",
		department: "unclassified"
	},
	{
		name: "mac and cheese",
		department: "unclassified"
	},
	{
		name: "ume plum vinegar",
		department: "unclassified"
	},
	{
		name: "sour pickle",
		department: "unclassified"
	},
	{
		name: "mustard prepared",
		department: "unclassified"
	},
	{
		name: "wheat flakes",
		department: "unclassified"
	},
	{
		name: "tempura batter",
		department: "unclassified"
	},
	{
		name: "medium rye flour",
		department: "unclassified"
	},
	{
		name: "hero rolls",
		department: "unclassified"
	},
	{
		name: "Godiva Original Liqueur",
		department: "unclassified"
	},
	{
		name: "savoiardi",
		department: "unclassified"
	},
	{
		name: "dulse",
		department: "unclassified"
	},
	{
		name: "hazelnut brittle",
		department: "unclassified"
	},
	{
		name: "kalonji",
		department: "unclassified"
	},
	{
		name: "gluten-free Worcestershire sauce",
		department: "unclassified"
	},
	{
		name: "eau de vie",
		department: "unclassified"
	},
	{
		name: "hot brewed coffee",
		department: "unclassified"
	},
	{
		name: "feet",
		department: "unclassified"
	},
	{
		name: "Jameson Irish Whiskey",
		department: "unclassified"
	},
	{
		name: "bottle gourd",
		department: "unclassified"
	},
	{
		name: "perch fillets",
		department: "unclassified"
	},
	{
		name: "veal rump roast",
		department: "unclassified"
	},
	{
		name: "prune juice",
		department: "unclassified"
	},
	{
		name: "jasmine tea",
		department: "unclassified"
	},
	{
		name: "romana",
		department: "unclassified"
	},
	{
		name: "caciocavallo",
		department: "unclassified"
	},
	{
		name: "ramen noodles seasoning",
		department: "unclassified"
	},
	{
		name: "hickory smoke",
		department: "unclassified"
	},
	{
		name: "dark karo syrup",
		department: "unclassified"
	},
	{
		name: "cooking salt",
		department: "unclassified"
	},
	{
		name: "black rice vinegar",
		department: "unclassified"
	},
	{
		name: "anise oil",
		department: "unclassified"
	},
	{
		name: "buttered toast",
		department: "unclassified"
	},
	{
		name: "lillet",
		department: "unclassified"
	},
	{
		name: "pork bones",
		department: "unclassified"
	},
	{
		name: "chinese celery",
		department: "unclassified"
	},
	{
		name: "garnet yams",
		department: "unclassified"
	},
	{
		name: "dark soy",
		department: "unclassified"
	},
	{
		name: "turbot",
		department: "unclassified"
	},
	{
		name: "summer fruit",
		department: "unclassified"
	},
	{
		name: "Daisy Sour Cream",
		department: "unclassified"
	},
	{
		name: "dillweed",
		department: "unclassified"
	},
	{
		name: "vegetarian sausage",
		department: "unclassified"
	},
	{
		name: "granola bars",
		department: "unclassified"
	},
	{
		name: "orange roughy",
		department: "unclassified"
	},
	{
		name: "center cut pork loin roast",
		department: "unclassified"
	},
	{
		name: "Chevre Goat Cheese",
		department: "unclassified"
	},
	{
		name: "whole flaxseed",
		department: "unclassified"
	},
	{
		name: "creamy italian dressing",
		department: "unclassified"
	},
	{
		name: "low-fat flour tortillas",
		department: "unclassified"
	},
	{
		name: "xanthum gum",
		department: "unclassified"
	},
	{
		name: "coating mix",
		department: "unclassified"
	},
	{
		name: "grain alcohol",
		department: "unclassified"
	},
	{
		name: "grated parmesan romano",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Semi-Sweet Chocolate Morsels",
		department: "unclassified"
	},
	{
		name: "potato buns",
		department: "unclassified"
	},
	{
		name: "culantro",
		department: "unclassified"
	},
	{
		name: "Silk Original Soymilk",
		department: "unclassified"
	},
	{
		name: "black strap molasses",
		department: "unclassified"
	},
	{
		name: "fruit salad",
		department: "unclassified"
	},
	{
		name: "hacheevlees",
		department: "unclassified"
	},
	{
		name: "instant tea powder",
		department: "unclassified"
	},
	{
		name: "daikon sprouts",
		department: "unclassified"
	},
	{
		name: "melting wafers",
		department: "unclassified"
	},
	{
		name: "young ginger",
		department: "unclassified"
	},
	{
		name: "chunky tomatoes",
		department: "unclassified"
	},
	{
		name: "blue potatoes",
		department: "unclassified"
	},
	{
		name: "chocolate soy milk",
		department: "unclassified"
	},
	{
		name: "whole wheat pasta shells",
		department: "unclassified"
	},
	{
		name: "thai noodles",
		department: "unclassified"
	},
	{
		name: "forbidden rice",
		department: "unclassified"
	},
	{
		name: "ducklings",
		department: "unclassified"
	},
	{
		name: "soaking liquid",
		department: "unclassified"
	},
	{
		name: "pina colada nonalcoholic drink mix",
		department: "unclassified"
	},
	{
		name: "alouette",
		department: "unclassified"
	},
	{
		name: "brine cured green olives",
		department: "unclassified"
	},
	{
		name: "wheatberries",
		department: "unclassified"
	},
	{
		name: "Pillsbury Biscuits",
		department: "unclassified"
	},
	{
		name: "gingerbread mix",
		department: "unclassified"
	},
	{
		name: "pear liqueur",
		department: "unclassified"
	},
	{
		name: "Chambord Liqueur",
		department: "unclassified"
	},
	{
		name: "blackberry liqueur",
		department: "unclassified"
	},
	{
		name: "skate wing",
		department: "unclassified"
	},
	{
		name: "fernet branca",
		department: "unclassified"
	},
	{
		name: "holy basil",
		department: "unclassified"
	},
	{
		name: "gravy powder",
		department: "unclassified"
	},
	{
		name: "yellow chartreuse",
		department: "unclassified"
	},
	{
		name: "vegan dark chocolate chips",
		department: "unclassified"
	},
	{
		name: "Cabot Sharp Light Cheddar",
		department: "unclassified"
	},
	{
		name: "dill leaf",
		department: "unclassified"
	},
	{
		name: "bulb",
		department: "unclassified"
	},
	{
		name: "bitter almond",
		department: "unclassified"
	},
	{
		name: "lemon soda",
		department: "unclassified"
	},
	{
		name: "vanilla low-fat frozen yogurt",
		department: "unclassified"
	},
	{
		name: "saltpeter",
		department: "unclassified"
	},
	{
		name: "fat free ranch dressing",
		department: "unclassified"
	},
	{
		name: "sweet rolls",
		department: "unclassified"
	},
	{
		name: "italian loaf",
		department: "unclassified"
	},
	{
		name: "gluten-free pretzel",
		department: "unclassified"
	},
	{
		name: "sweet Italian turkey sausage",
		department: "unclassified"
	},
	{
		name: "bean curd skins",
		department: "unclassified"
	},
	{
		name: "yuba",
		department: "unclassified"
	},
	{
		name: "bean curd sheets",
		department: "unclassified"
	},
	{
		name: "cinnamon extract",
		department: "unclassified"
	},
	{
		name: "amontillado sherry",
		department: "unclassified"
	},
	{
		name: "green spelt",
		department: "unclassified"
	},
	{
		name: "caramel vodka",
		department: "unclassified"
	},
	{
		name: "Italian basil",
		department: "unclassified"
	},
	{
		name: "mushroom sauce",
		department: "unclassified"
	},
	{
		name: "cocktail wieners",
		department: "unclassified"
	},
	{
		name: "galanga",
		department: "unclassified"
	},
	{
		name: "lemon syrup",
		department: "unclassified"
	},
	{
		name: "apple vodka",
		department: "unclassified"
	},
	{
		name: "Jet-Puffed Marshmallow Creme",
		department: "unclassified"
	},
	{
		name: "cucumber salad",
		department: "unclassified"
	},
	{
		name: "bone-in chicken",
		department: "unclassified"
	},
	{
		name: "Kerrygold Butter",
		department: "unclassified"
	},
	{
		name: "pickle slices",
		department: "unclassified"
	},
	{
		name: "nappa cabbage",
		department: "unclassified"
	},
	{
		name: "chinese black mushrooms",
		department: "unclassified"
	},
	{
		name: "light chicken stock",
		department: "unclassified"
	},
	{
		name: "graham wafers",
		department: "unclassified"
	},
	{
		name: "tubetti",
		department: "unclassified"
	},
	{
		name: "long pasta",
		department: "unclassified"
	},
	{
		name: "asian noodles",
		department: "unclassified"
	},
	{
		name: "p\\u00E2te bris\\u00E9e",
		department: "unclassified"
	},
	{
		name: "seckel pears",
		department: "unclassified"
	},
	{
		name: "muskmelons",
		department: "unclassified"
	},
	{
		name: "greek-style vinaigrette",
		department: "unclassified"
	},
	{
		name: "greek vinaigrette",
		department: "unclassified"
	},
	{
		name: "duck sauce",
		department: "unclassified"
	},
	{
		name: "chinese hot mustard",
		department: "unclassified"
	},
	{
		name: "fat-free italian salad dressing",
		department: "unclassified"
	},
	{
		name: "steel-cut oatmeal",
		department: "unclassified"
	},
	{
		name: "appenzeller",
		department: "unclassified"
	},
	{
		name: "rose hip jam",
		department: "unclassified"
	},
	{
		name: "dark rye bread",
		department: "unclassified"
	},
	{
		name: "andouille chicken sausage",
		department: "unclassified"
	},
	{
		name: "fruit punch",
		department: "unclassified"
	},
	{
		name: "bakgember",
		department: "unclassified"
	},
	{
		name: "honey roasted almonds",
		department: "unclassified"
	},
	{
		name: "split black lentils",
		department: "unclassified"
	},
	{
		name: "fresh lima beans",
		department: "unclassified"
	},
	{
		name: "Whoppers",
		department: "unclassified"
	},
	{
		name: "Reeses Peanut Butter Cups",
		department: "unclassified"
	},
	{
		name: "liverwurst",
		department: "unclassified"
	},
	{
		name: "hog casings",
		department: "unclassified"
	},
	{
		name: "leftover meat",
		department: "unclassified"
	},
	{
		name: "prune puree",
		department: "unclassified"
	},
	{
		name: "nonfat cream cheese",
		department: "unclassified"
	},
	{
		name: "spaetzle",
		department: "unclassified"
	},
	{
		name: "angelica",
		department: "unclassified"
	},
	{
		name: "fine egg noodles",
		department: "unclassified"
	},
	{
		name: "cajeta",
		department: "unclassified"
	},
	{
		name: "turkey liver",
		department: "unclassified"
	},
	{
		name: "Chinese spice",
		department: "unclassified"
	},
	{
		name: "mirlitons",
		department: "unclassified"
	},
	{
		name: "lemon vodka",
		department: "unclassified"
	},
	{
		name: "ground steak",
		department: "unclassified"
	},
	{
		name: "vanilla quark",
		department: "unclassified"
	},
	{
		name: "venison back",
		department: "unclassified"
	},
	{
		name: "honey mustard sauce",
		department: "unclassified"
	},
	{
		name: "Hersheys Semi-Sweet Chocolate Chips",
		department: "unclassified"
	},
	{
		name: "potato bread",
		department: "unclassified"
	},
	{
		name: "low sodium chickpeas",
		department: "unclassified"
	},
	{
		name: "hot green chile",
		department: "unclassified"
	},
	{
		name: "elephant garlic",
		department: "unclassified"
	},
	{
		name: "whole wheat crackers",
		department: "unclassified"
	},
	{
		name: "dried udon",
		department: "unclassified"
	},
	{
		name: "dessert topping",
		department: "unclassified"
	},
	{
		name: "low-fat ranch dressing",
		department: "unclassified"
	},
	{
		name: "amarillo paste",
		department: "unclassified"
	},
	{
		name: "graham cereal",
		department: "unclassified"
	},
	{
		name: "soft dinner rolls",
		department: "unclassified"
	},
	{
		name: "licor 43",
		department: "unclassified"
	},
	{
		name: "apple liqueur",
		department: "unclassified"
	},
	{
		name: "vacherin",
		department: "unclassified"
	},
	{
		name: "squid rings",
		department: "unclassified"
	},
	{
		name: "alternative cheese",
		department: "unclassified"
	},
	{
		name: "cheese alternative",
		department: "unclassified"
	},
	{
		name: "cappuccino",
		department: "unclassified"
	},
	{
		name: "sirloin tip steak",
		department: "unclassified"
	},
	{
		name: "rajma",
		department: "unclassified"
	},
	{
		name: "soup noodles",
		department: "unclassified"
	},
	{
		name: "whole grain spaghetti",
		department: "unclassified"
	},
	{
		name: "strawberry juice",
		department: "unclassified"
	},
	{
		name: "chicken demi-glace",
		department: "unclassified"
	},
	{
		name: "low-fat strawberry yogurt",
		department: "unclassified"
	},
	{
		name: "plain bagels",
		department: "unclassified"
	},
	{
		name: "Bellino Minced Garlic",
		department: "unclassified"
	},
	{
		name: "pistachio oil",
		department: "unclassified"
	},
	{
		name: "grape jam",
		department: "unclassified"
	},
	{
		name: "deli mustard",
		department: "unclassified"
	},
	{
		name: "Cadbury Chocolate Creme Egg",
		department: "unclassified"
	},
	{
		name: "potato pancakes",
		department: "unclassified"
	},
	{
		name: "barramundi fillets",
		department: "unclassified"
	},
	{
		name: "beef heart",
		department: "unclassified"
	},
	{
		name: "instant cappuccino mix",
		department: "unclassified"
	},
	{
		name: "dairy",
		department: "unclassified"
	},
	{
		name: "Texas Pete Hot Sauce",
		department: "unclassified"
	},
	{
		name: "pita wedges",
		department: "unclassified"
	},
	{
		name: "fruit pie filling",
		department: "unclassified"
	},
	{
		name: "Simply Potatoes\\u00AE Hash Browns",
		department: "unclassified"
	},
	{
		name: "Simply Potatoes\\u00AE Shredded",
		department: "unclassified"
	},
	{
		name: "dijonnaise",
		department: "unclassified"
	},
	{
		name: "perciatelli",
		department: "unclassified"
	},
	{
		name: "idli",
		department: "unclassified"
	},
	{
		name: "caper brine",
		department: "unclassified"
	},
	{
		name: "sea trout fillet",
		department: "unclassified"
	},
	{
		name: "shredded American cheese",
		department: "unclassified"
	},
	{
		name: "hops",
		department: "unclassified"
	},
	{
		name: "soya granules",
		department: "unclassified"
	},
	{
		name: "metaxa",
		department: "unclassified"
	},
	{
		name: "fideos",
		department: "unclassified"
	},
	{
		name: "KRAFT Shredded Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "sandwich spread",
		department: "unclassified"
	},
	{
		name: "dark chicken stock",
		department: "unclassified"
	},
	{
		name: "razor clams",
		department: "unclassified"
	},
	{
		name: "chinese wheat noodles",
		department: "unclassified"
	},
	{
		name: "char siu",
		department: "unclassified"
	},
	{
		name: "tom yum paste",
		department: "unclassified"
	},
	{
		name: "au jus gravy mix",
		department: "unclassified"
	},
	{
		name: "frosted flaked cereal",
		department: "unclassified"
	},
	{
		name: "sucralose",
		department: "unclassified"
	},
	{
		name: "Pama Pomegranate Liqueur",
		department: "unclassified"
	},
	{
		name: "pilsner beer",
		department: "unclassified"
	},
	{
		name: "blackberry brandy",
		department: "unclassified"
	},
	{
		name: "herbal quark",
		department: "unclassified"
	},
	{
		name: "Biryani Masala",
		department: "unclassified"
	},
	{
		name: "waffle rolls",
		department: "unclassified"
	},
	{
		name: "dry ros\\u00E9 wine",
		department: "unclassified"
	},
	{
		name: "flower petals",
		department: "unclassified"
	},
	{
		name: "tahina",
		department: "unclassified"
	},
	{
		name: "pearled farro",
		department: "unclassified"
	},
	{
		name: "tea biscuits",
		department: "unclassified"
	},
	{
		name: "pea tendrils",
		department: "unclassified"
	},
	{
		name: "ascorbic acid",
		department: "unclassified"
	},
	{
		name: "chunk light tuna",
		department: "unclassified"
	},
	{
		name: "Nestl\\u00E9 Smarties",
		department: "unclassified"
	},
	{
		name: "unsweetened dried cranberries",
		department: "unclassified"
	},
	{
		name: "pie crust mix",
		department: "unclassified"
	},
	{
		name: "black icing",
		department: "unclassified"
	},
	{
		name: "chioggia",
		department: "unclassified"
	},
	{
		name: "Cheerios Cereal",
		department: "unclassified"
	},
	{
		name: "bulb fennel",
		department: "unclassified"
	},
	{
		name: "low-fat soy milk",
		department: "unclassified"
	},
	{
		name: "rich chicken broth",
		department: "unclassified"
	},
	{
		name: "pearl tapioca",
		department: "unclassified"
	},
	{
		name: "Milky Way Candy Bar",
		department: "unclassified"
	},
	{
		name: "Milky Way Candy Bars",
		department: "unclassified"
	},
	{
		name: "beef jerky",
		department: "unclassified"
	},
	{
		name: "escargot",
		department: "unclassified"
	},
	{
		name: "merguez sausage",
		department: "unclassified"
	},
	{
		name: "red bartlett pears",
		department: "unclassified"
	},
	{
		name: "spicy hot v8",
		department: "unclassified"
	},
	{
		name: "cherry cola",
		department: "unclassified"
	},
	{
		name: "nonfat frozen yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat sharp cheddar cheese",
		department: "unclassified"
	},
	{
		name: "sloppy joe mix",
		department: "unclassified"
	},
	{
		name: "italian vinaigrette",
		department: "unclassified"
	},
	{
		name: "dried garlic flakes",
		department: "unclassified"
	},
	{
		name: "japanese bread crumbs",
		department: "unclassified"
	},
	{
		name: "hulled barley",
		department: "unclassified"
	},
	{
		name: "crown royal",
		department: "unclassified"
	},
	{
		name: "tarragon mustard",
		department: "unclassified"
	},
	{
		name: "chinese pea pods",
		department: "unclassified"
	},
	{
		name: "olive paste",
		department: "unclassified"
	},
	{
		name: "rosehip",
		department: "unclassified"
	},
	{
		name: "tomato tapenade",
		department: "unclassified"
	},
	{
		name: "poi",
		department: "unclassified"
	},
	{
		name: "dillweed sprigs",
		department: "unclassified"
	},
	{
		name: "KRAFT Shredded Low-Moisture Part-Skim Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "strawberry cream cheese spread",
		department: "unclassified"
	},
	{
		name: "arrack",
		department: "unclassified"
	},
	{
		name: "dill sauce",
		department: "unclassified"
	},
	{
		name: "notenrijst",
		department: "unclassified"
	},
	{
		name: "uncooked vermicelli",
		department: "unclassified"
	},
	{
		name: "boneless duck breast halves",
		department: "unclassified"
	},
	{
		name: "cookies and cream ice cream",
		department: "unclassified"
	},
	{
		name: "nonfat milk powder",
		department: "unclassified"
	},
	{
		name: "fat-free cheese",
		department: "unclassified"
	},
	{
		name: "oat groats",
		department: "unclassified"
	},
	{
		name: "Honey Bunches of Oats Cereal",
		department: "unclassified"
	},
	{
		name: "fiber one",
		department: "unclassified"
	},
	{
		name: "Bran Flakes Cereal",
		department: "unclassified"
	},
	{
		name: "lamb neck fillets",
		department: "unclassified"
	},
	{
		name: "lemon vinegar",
		department: "unclassified"
	},
	{
		name: "watermelon pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "wild herbs",
		department: "unclassified"
	},
	{
		name: "nasigroenten",
		department: "unclassified"
	},
	{
		name: "biga",
		department: "unclassified"
	},
	{
		name: "cinnamon ice cream",
		department: "unclassified"
	},
	{
		name: "fiddlehead ferns",
		department: "unclassified"
	},
	{
		name: "bockwurst",
		department: "unclassified"
	},
	{
		name: "bee honey",
		department: "unclassified"
	},
	{
		name: "gyros",
		department: "unclassified"
	},
	{
		name: "buckwheat honey",
		department: "unclassified"
	},
	{
		name: "roasted white sesame seeds",
		department: "unclassified"
	},
	{
		name: "sandwich thins",
		department: "unclassified"
	},
	{
		name: "prepared coleslaw",
		department: "unclassified"
	},
	{
		name: "field peas",
		department: "unclassified"
	},
	{
		name: "KRAFT Shredded Mozzarella Cheese with a TOUCH OF PHILADELPHIA",
		department: "unclassified"
	},
	{
		name: "lemon sole",
		department: "unclassified"
	},
	{
		name: "uncooked ziti",
		department: "unclassified"
	},
	{
		name: "refrigerated tortellini",
		department: "unclassified"
	},
	{
		name: "veal loin",
		department: "unclassified"
	},
	{
		name: "duck breast halves",
		department: "unclassified"
	},
	{
		name: "diet coke",
		department: "unclassified"
	},
	{
		name: "pepsi",
		department: "unclassified"
	},
	{
		name: "garlic juice",
		department: "unclassified"
	},
	{
		name: "diet cola",
		department: "unclassified"
	},
	{
		name: "low fat fromage frais",
		department: "unclassified"
	},
	{
		name: "cholesterol free egg substitute",
		department: "unclassified"
	},
	{
		name: "red vinegar",
		department: "unclassified"
	},
	{
		name: "praline paste",
		department: "unclassified"
	},
	{
		name: "McCormick Ground Cumin",
		department: "unclassified"
	},
	{
		name: "grey poupon",
		department: "unclassified"
	},
	{
		name: "cracked peppercorn",
		department: "unclassified"
	},
	{
		name: "Gold Medal Whole Wheat Flour",
		department: "unclassified"
	},
	{
		name: "vitamin e",
		department: "unclassified"
	},
	{
		name: "burger rolls",
		department: "unclassified"
	},
	{
		name: "almond filling",
		department: "unclassified"
	},
	{
		name: "goldschlager",
		department: "unclassified"
	},
	{
		name: "burdock",
		department: "unclassified"
	},
	{
		name: "blossom honey",
		department: "unclassified"
	},
	{
		name: "seasoned black beans",
		department: "unclassified"
	},
	{
		name: "amarillo",
		department: "unclassified"
	},
	{
		name: "guinea hens",
		department: "unclassified"
	},
	{
		name: "Tofutti Better Than Sour Cream",
		department: "unclassified"
	},
	{
		name: "powdered turmeric",
		department: "unclassified"
	},
	{
		name: "sambal olek",
		department: "unclassified"
	},
	{
		name: "cubed feta",
		department: "unclassified"
	},
	{
		name: "haggis",
		department: "unclassified"
	},
	{
		name: "b\\u00E9n\\u00E9dictine",
		department: "unclassified"
	},
	{
		name: "Land O Lakes\\u00AE Eggs",
		department: "unclassified"
	},
	{
		name: "millet flakes",
		department: "unclassified"
	},
	{
		name: "peaches in heavy syrup",
		department: "unclassified"
	},
	{
		name: "mitsuba",
		department: "unclassified"
	},
	{
		name: "Hostess Twinkies",
		department: "unclassified"
	},
	{
		name: "sandwich wraps",
		department: "unclassified"
	},
	{
		name: "dried pappardelle",
		department: "unclassified"
	},
	{
		name: "squabs",
		department: "unclassified"
	},
	{
		name: "chipolata sausage",
		department: "unclassified"
	},
	{
		name: "distilled malt vinegar",
		department: "unclassified"
	},
	{
		name: "annatto",
		department: "unclassified"
	},
	{
		name: "ajinomoto",
		department: "unclassified"
	},
	{
		name: "toffee baking bits",
		department: "unclassified"
	},
	{
		name: "refined sugar",
		department: "unclassified"
	},
	{
		name: "mint liqueur",
		department: "unclassified"
	},
	{
		name: "bitter melon",
		department: "unclassified"
	},
	{
		name: "toffee sauce",
		department: "unclassified"
	},
	{
		name: "hachiya",
		department: "unclassified"
	},
	{
		name: "hachiya persimmons",
		department: "unclassified"
	},
	{
		name: "chicken wingettes",
		department: "unclassified"
	},
	{
		name: "boneless beef top sirloin steaks",
		department: "unclassified"
	},
	{
		name: "bass",
		department: "unclassified"
	},
	{
		name: "frozen deep dish pie crust",
		department: "unclassified"
	},
	{
		name: "snow pea pods",
		department: "unclassified"
	},
	{
		name: "veal medallions",
		department: "unclassified"
	},
	{
		name: "whole grain English muffins",
		department: "unclassified"
	},
	{
		name: "pluots",
		department: "unclassified"
	},
	{
		name: "peach yogurt",
		department: "unclassified"
	},
	{
		name: "chinese parsley",
		department: "unclassified"
	},
	{
		name: "light tuna packed in olive oil",
		department: "unclassified"
	},
	{
		name: "beef rump",
		department: "unclassified"
	},
	{
		name: "garlic dressing",
		department: "unclassified"
	},
	{
		name: "berry preserves",
		department: "unclassified"
	},
	{
		name: "Cabot 2% Plain Greek-Style Yogurt",
		department: "unclassified"
	},
	{
		name: "KRAFT Shredded Triple Cheddar Cheese with a TOUCH OF PHILADELPHIA",
		department: "unclassified"
	},
	{
		name: "Good Seasons Italian Dressing Mix",
		department: "unclassified"
	},
	{
		name: "chocolate malt",
		department: "unclassified"
	},
	{
		name: "light whipped cream",
		department: "unclassified"
	},
	{
		name: "mixed field greens",
		department: "unclassified"
	},
	{
		name: "coffee flavored liquor",
		department: "unclassified"
	},
	{
		name: "chicken and rice soup",
		department: "unclassified"
	},
	{
		name: "Pillsbury\\u2122 classic pizza crust",
		department: "unclassified"
	},
	{
		name: "umeboshi",
		department: "unclassified"
	},
	{
		name: "Goya Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Pop Rocks Popping Candy",
		department: "unclassified"
	},
	{
		name: "Lawrys Seasoned Salt",
		department: "unclassified"
	},
	{
		name: "romano beans",
		department: "unclassified"
	},
	{
		name: "unsalted vegetable stock",
		department: "unclassified"
	},
	{
		name: "acorn",
		department: "unclassified"
	},
	{
		name: "veal scallopini",
		department: "unclassified"
	},
	{
		name: "stir fry beef meat",
		department: "unclassified"
	},
	{
		name: "stir fry beef",
		department: "unclassified"
	},
	{
		name: "shoulder steak",
		department: "unclassified"
	},
	{
		name: "shell steak",
		department: "unclassified"
	},
	{
		name: "cola soft drink",
		department: "unclassified"
	},
	{
		name: "strained yogurt",
		department: "unclassified"
	},
	{
		name: "vodka sauce",
		department: "unclassified"
	},
	{
		name: "red pasta sauce",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Vegetable recipe mix",
		department: "unclassified"
	},
	{
		name: "waffle mix",
		department: "unclassified"
	},
	{
		name: "whipped honey",
		department: "unclassified"
	},
	{
		name: "creamed honey",
		department: "unclassified"
	},
	{
		name: "spun honey",
		department: "unclassified"
	},
	{
		name: "panga fillets",
		department: "unclassified"
	},
	{
		name: "capon",
		department: "unclassified"
	},
	{
		name: "bottarga",
		department: "unclassified"
	},
	{
		name: "Bertolli Pesto alla Genovese",
		department: "unclassified"
	},
	{
		name: "Potatoes O'Brien",
		department: "unclassified"
	},
	{
		name: "treviso",
		department: "unclassified"
	},
	{
		name: "dry mint",
		department: "unclassified"
	},
	{
		name: "kalamata olive halves",
		department: "unclassified"
	},
	{
		name: "squid ink",
		department: "unclassified"
	},
	{
		name: "light cherry pie filling",
		department: "unclassified"
	},
	{
		name: "poultry stock",
		department: "unclassified"
	},
	{
		name: "Duncan Hines Frosting",
		department: "unclassified"
	},
	{
		name: "Kettle Chips",
		department: "unclassified"
	},
	{
		name: "red chicory",
		department: "unclassified"
	},
	{
		name: "broccoli sprouts",
		department: "unclassified"
	},
	{
		name: "Honey Maid Honey Grahams",
		department: "unclassified"
	},
	{
		name: "boiler",
		department: "unclassified"
	},
	{
		name: "citrus fruit",
		department: "unclassified"
	},
	{
		name: "mountain dew",
		department: "unclassified"
	},
	{
		name: "low-fat soft cheese",
		department: "unclassified"
	},
	{
		name: "butter powder",
		department: "unclassified"
	},
	{
		name: "asian basil",
		department: "unclassified"
	},
	{
		name: "achiote powder",
		department: "unclassified"
	},
	{
		name: "shreddies cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat pita pockets",
		department: "unclassified"
	},
	{
		name: "toasted unsweetened coconut",
		department: "unclassified"
	},
	{
		name: "self-rising cake flour",
		department: "unclassified"
	},
	{
		name: "gluten-free pie crust",
		department: "unclassified"
	},
	{
		name: "compressed yeast",
		department: "unclassified"
	},
	{
		name: "hot pork sausage",
		department: "unclassified"
	},
	{
		name: "whole grain hamburger buns",
		department: "unclassified"
	},
	{
		name: "choux pastry",
		department: "unclassified"
	},
	{
		name: "roasted vegetables",
		department: "unclassified"
	},
	{
		name: "soya chunks",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Thyme Leaves",
		department: "unclassified"
	},
	{
		name: "Heinz Tomato Ketchup",
		department: "unclassified"
	},
	{
		name: "veal bouillon",
		department: "unclassified"
	},
	{
		name: "cassis jam",
		department: "unclassified"
	},
	{
		name: "blackcurrant jam",
		department: "unclassified"
	},
	{
		name: "beef cheek",
		department: "unclassified"
	},
	{
		name: "water spinach",
		department: "unclassified"
	},
	{
		name: "boneless skinless chicken breast cutlets",
		department: "unclassified"
	},
	{
		name: "brownie layer",
		department: "unclassified"
	},
	{
		name: "spiral-sliced ham",
		department: "unclassified"
	},
	{
		name: "lean meat",
		department: "unclassified"
	},
	{
		name: "carbonated beverages",
		department: "unclassified"
	},
	{
		name: "laksa paste",
		department: "unclassified"
	},
	{
		name: "green chile sauce",
		department: "unclassified"
	},
	{
		name: "butter salt",
		department: "unclassified"
	},
	{
		name: "ready-made pie crusts",
		department: "unclassified"
	},
	{
		name: "ready-made piecrusts",
		department: "unclassified"
	},
	{
		name: "gyoza skins",
		department: "unclassified"
	},
	{
		name: "shao hsing wine",
		department: "unclassified"
	},
	{
		name: "cilantro pesto",
		department: "unclassified"
	},
	{
		name: "white cranberry juice",
		department: "unclassified"
	},
	{
		name: "roasted ground cumin",
		department: "unclassified"
	},
	{
		name: "stir fry noodles",
		department: "unclassified"
	},
	{
		name: "expeller-pressed canola oil",
		department: "unclassified"
	},
	{
		name: "sparkling ros\\u00E9 wine",
		department: "unclassified"
	},
	{
		name: "lemon ice cream",
		department: "unclassified"
	},
	{
		name: "chourico",
		department: "unclassified"
	},
	{
		name: "silver balls",
		department: "unclassified"
	},
	{
		name: "ginger cookies",
		department: "unclassified"
	},
	{
		name: "drinking chocolate",
		department: "unclassified"
	},
	{
		name: "Amarena cherries",
		department: "unclassified"
	},
	{
		name: "mi",
		department: "unclassified"
	},
	{
		name: "hickory-flavored liquid smoke",
		department: "unclassified"
	},
	{
		name: "fish bones",
		department: "unclassified"
	},
	{
		name: "wheat crackers",
		department: "unclassified"
	},
	{
		name: "cranberry raspberry juice cocktail",
		department: "unclassified"
	},
	{
		name: "cranberry raspberry juice",
		department: "unclassified"
	},
	{
		name: "cashewnut powder",
		department: "unclassified"
	},
	{
		name: "ground cashews",
		department: "unclassified"
	},
	{
		name: "silver beet",
		department: "unclassified"
	},
	{
		name: "pansies",
		department: "unclassified"
	},
	{
		name: "oven fries",
		department: "unclassified"
	},
	{
		name: "soy chorizo",
		department: "unclassified"
	},
	{
		name: "regular tofu",
		department: "unclassified"
	},
	{
		name: "powdered soy protein concentrate",
		department: "unclassified"
	},
	{
		name: "Campbell's Condensed Golden Mushroom Soup",
		department: "unclassified"
	},
	{
		name: "Heath Candy Bar",
		department: "unclassified"
	},
	{
		name: "low-fat ice cream",
		department: "unclassified"
	},
	{
		name: "Reblochon",
		department: "unclassified"
	},
	{
		name: "Skippy\\u00AE Peanut Butter",
		department: "unclassified"
	},
	{
		name: "sesame chili oil",
		department: "unclassified"
	},
	{
		name: "no salt added ketchup",
		department: "unclassified"
	},
	{
		name: "crushed sage leaves",
		department: "unclassified"
	},
	{
		name: "chinese duck sauce",
		department: "unclassified"
	},
	{
		name: "fruitcake",
		department: "unclassified"
	},
	{
		name: "cornbread crumbs",
		department: "unclassified"
	},
	{
		name: "ginger preserves",
		department: "unclassified"
	},
	{
		name: "asparagus stock",
		department: "unclassified"
	},
	{
		name: "imitation vanilla extract",
		department: "unclassified"
	},
	{
		name: "deep sea crab meat",
		department: "unclassified"
	},
	{
		name: "bread improver",
		department: "unclassified"
	},
	{
		name: "vegan confectioners' sugar",
		department: "unclassified"
	},
	{
		name: "vegan powdered sugar",
		department: "unclassified"
	},
	{
		name: "kelp powder",
		department: "unclassified"
	},
	{
		name: "witbier",
		department: "unclassified"
	},
	{
		name: "gyoza",
		department: "unclassified"
	},
	{
		name: "Belle de Boskoop apple",
		department: "unclassified"
	},
	{
		name: "zander",
		department: "unclassified"
	},
	{
		name: "Karo\\u00AE Light Corn Syrup",
		department: "unclassified"
	},
	{
		name: "fresh bean",
		department: "unclassified"
	},
	{
		name: "english toffee",
		department: "unclassified"
	},
	{
		name: "hibiscus tea bags",
		department: "unclassified"
	},
	{
		name: "seasoning rub",
		department: "unclassified"
	},
	{
		name: "Hellmann''s Light Mayonnaise",
		department: "unclassified"
	},
	{
		name: "Karo Corn Syrup",
		department: "unclassified"
	},
	{
		name: "beef bouillon powder",
		department: "unclassified"
	},
	{
		name: "cherry vodka",
		department: "unclassified"
	},
	{
		name: "roompat\\u00E9",
		department: "unclassified"
	},
	{
		name: "cracked freekeh",
		department: "unclassified"
	},
	{
		name: "wasabi mayonnaise",
		department: "unclassified"
	},
	{
		name: "jerk marinade",
		department: "unclassified"
	},
	{
		name: "Kraft Sun Dried Tomato Vinaigrette",
		department: "unclassified"
	},
	{
		name: "orange cura\\u00E7ao",
		department: "unclassified"
	},
	{
		name: "posole",
		department: "unclassified"
	},
	{
		name: "goose liver",
		department: "unclassified"
	},
	{
		name: "peaches in syrup",
		department: "unclassified"
	},
	{
		name: "kibbeling",
		department: "unclassified"
	},
	{
		name: "lye rolls",
		department: "unclassified"
	},
	{
		name: "Cap''N Crunch Cereal",
		department: "unclassified"
	},
	{
		name: "Cap''n Crunch''s Cereal",
		department: "unclassified"
	},
	{
		name: "Ro-Tel Diced Tomatoes & Green Chilies",
		department: "unclassified"
	},
	{
		name: "black mushrooms",
		department: "unclassified"
	},
	{
		name: "imitation bacon bits",
		department: "unclassified"
	},
	{
		name: "unsalted pumpkinseed kernels",
		department: "unclassified"
	},
	{
		name: "v 8 juice",
		department: "unclassified"
	},
	{
		name: "Wish-Bone Balsamic Vinaigrette Dressing",
		department: "unclassified"
	},
	{
		name: "toasted sesame dressing",
		department: "unclassified"
	},
	{
		name: "sweet white miso",
		department: "unclassified"
	},
	{
		name: "dehydrated onion flakes",
		department: "unclassified"
	},
	{
		name: "sorghum molasses",
		department: "unclassified"
	},
	{
		name: "fruity pebbles",
		department: "unclassified"
	},
	{
		name: "hot cross buns",
		department: "unclassified"
	},
	{
		name: "sweet rice wine",
		department: "unclassified"
	},
	{
		name: "gluten free graham cracker crumbs",
		department: "unclassified"
	},
	{
		name: "lardo",
		department: "unclassified"
	},
	{
		name: "zuurkoolspek",
		department: "unclassified"
	},
	{
		name: "frozen garden peas",
		department: "unclassified"
	},
	{
		name: "dubonnet",
		department: "unclassified"
	},
	{
		name: "baby fennel",
		department: "unclassified"
	},
	{
		name: "melon balls",
		department: "unclassified"
	},
	{
		name: "Hellmann's\\u00AE Mayonnaise Dressing with Olive Oil",
		department: "unclassified"
	},
	{
		name: "gummies",
		department: "unclassified"
	},
	{
		name: "Smithfield Ham",
		department: "unclassified"
	},
	{
		name: "Breakstone\\u2019s Sour Cream",
		department: "unclassified"
	},
	{
		name: "Land O Lakes Unsalted Butter",
		department: "unclassified"
	},
	{
		name: "waffle fries",
		department: "unclassified"
	},
	{
		name: "dried chile peppers",
		department: "unclassified"
	},
	{
		name: "Planters Cocktail Peanuts",
		department: "unclassified"
	},
	{
		name: "lotus seeds",
		department: "unclassified"
	},
	{
		name: "aloe vera gel",
		department: "unclassified"
	},
	{
		name: "sirloin roast",
		department: "unclassified"
	},
	{
		name: "pippin apples",
		department: "unclassified"
	},
	{
		name: "i can't believe it's not butter! made with olive oil spread",
		department: "unclassified"
	},
	{
		name: "cream cheese with chives and onion",
		department: "unclassified"
	},
	{
		name: "spicy mayonnaise",
		department: "unclassified"
	},
	{
		name: "Kraft Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "korma paste",
		department: "unclassified"
	},
	{
		name: "annatto oil",
		department: "unclassified"
	},
	{
		name: "sambhar powder",
		department: "unclassified"
	},
	{
		name: "pocket bread",
		department: "unclassified"
	},
	{
		name: "pizza shells",
		department: "unclassified"
	},
	{
		name: "pita loaves",
		department: "unclassified"
	},
	{
		name: "oloroso sherry",
		department: "unclassified"
	},
	{
		name: "Hpnotiq Liqueur",
		department: "unclassified"
	},
	{
		name: "nuoc nam",
		department: "unclassified"
	},
	{
		name: "yeast dough",
		department: "unclassified"
	},
	{
		name: "Poire Williams",
		department: "unclassified"
	},
	{
		name: "hyssop",
		department: "unclassified"
	},
	{
		name: "kelp granules",
		department: "unclassified"
	},
	{
		name: "lingonberry jam",
		department: "unclassified"
	},
	{
		name: "whole wheat farfalle",
		department: "unclassified"
	},
	{
		name: "crushed tomatoes in puree",
		department: "unclassified"
	},
	{
		name: "lamb neck",
		department: "unclassified"
	},
	{
		name: "dulce de leche ice cream",
		department: "unclassified"
	},
	{
		name: "beef marrow",
		department: "unclassified"
	},
	{
		name: "lactose-free milk",
		department: "unclassified"
	},
	{
		name: "turkish delight",
		department: "unclassified"
	},
	{
		name: "falernum",
		department: "unclassified"
	},
	{
		name: "pineapple jam",
		department: "unclassified"
	},
	{
		name: "papadums",
		department: "unclassified"
	},
	{
		name: "macarons",
		department: "unclassified"
	},
	{
		name: "whole wheat hot dog buns",
		department: "unclassified"
	},
	{
		name: "Silk Unsweetened Original Almondmilk",
		department: "unclassified"
	},
	{
		name: "rustic white bread",
		department: "unclassified"
	},
	{
		name: "breakfast sausage patty",
		department: "unclassified"
	},
	{
		name: "empanada dough",
		department: "unclassified"
	},
	{
		name: "Pillsbury Pie Crusts",
		department: "unclassified"
	},
	{
		name: "Dove Chocolate",
		department: "unclassified"
	},
	{
		name: "teardrop tomatoes",
		department: "unclassified"
	},
	{
		name: "aleppo",
		department: "unclassified"
	},
	{
		name: "Knorr Chicken Flavor Bouillon",
		department: "unclassified"
	},
	{
		name: "unsalted roasted pistachios",
		department: "unclassified"
	},
	{
		name: "snack crackers",
		department: "unclassified"
	},
	{
		name: "rock cornish game hens",
		department: "unclassified"
	},
	{
		name: "lamb kidneys",
		department: "unclassified"
	},
	{
		name: "cooked italian meatballs",
		department: "unclassified"
	},
	{
		name: "bone marrow",
		department: "unclassified"
	},
	{
		name: "lumpia wrappers",
		department: "unclassified"
	},
	{
		name: "quince paste",
		department: "unclassified"
	},
	{
		name: "mini waffles",
		department: "unclassified"
	},
	{
		name: "roll icing",
		department: "unclassified"
	},
	{
		name: "pineapple cake mix",
		department: "unclassified"
	},
	{
		name: "panini",
		department: "unclassified"
	},
	{
		name: "red vermouth",
		department: "unclassified"
	},
	{
		name: "everclear",
		department: "unclassified"
	},
	{
		name: "unsalted creamy almond butter",
		department: "unclassified"
	},
	{
		name: "creamy unsalted almond butter",
		department: "unclassified"
	},
	{
		name: "wolffish fillet",
		department: "unclassified"
	},
	{
		name: "brown rice spaghetti",
		department: "unclassified"
	},
	{
		name: "black bean and corn salsa",
		department: "unclassified"
	},
	{
		name: "cervelats",
		department: "unclassified"
	},
	{
		name: "pork tenderloin roulade",
		department: "unclassified"
	},
	{
		name: "dried wood ear mushrooms",
		department: "unclassified"
	},
	{
		name: "maltose",
		department: "unclassified"
	},
	{
		name: "Kraft Tuscan House Italian Dressing",
		department: "unclassified"
	},
	{
		name: "salad burnet",
		department: "unclassified"
	},
	{
		name: "lobster bisque",
		department: "unclassified"
	},
	{
		name: "forest mushroom",
		department: "unclassified"
	},
	{
		name: "zucchini noodles",
		department: "unclassified"
	},
	{
		name: "milk chocolate couverture",
		department: "unclassified"
	},
	{
		name: "sugar free chocolate syrup",
		department: "unclassified"
	},
	{
		name: "plain soy yogurt",
		department: "unclassified"
	},
	{
		name: "atjar",
		department: "unclassified"
	},
	{
		name: "refrigerated fettuccine",
		department: "unclassified"
	},
	{
		name: "winter savory",
		department: "unclassified"
	},
	{
		name: "sugar snap",
		department: "unclassified"
	},
	{
		name: "low sodium tomato",
		department: "unclassified"
	},
	{
		name: "turkey giblet stock",
		department: "unclassified"
	},
	{
		name: "tostitos scoops",
		department: "unclassified"
	},
	{
		name: "Skor Candy Bars",
		department: "unclassified"
	},
	{
		name: "soup pasta",
		department: "unclassified"
	},
	{
		name: "summer sausage",
		department: "unclassified"
	},
	{
		name: "lamb rib",
		department: "unclassified"
	},
	{
		name: "dry-cured ham",
		department: "unclassified"
	},
	{
		name: "chili con carne",
		department: "unclassified"
	},
	{
		name: "golden pineapple",
		department: "unclassified"
	},
	{
		name: "calabaza",
		department: "unclassified"
	},
	{
		name: "V-8 Juice",
		department: "unclassified"
	},
	{
		name: "strawberry soda",
		department: "unclassified"
	},
	{
		name: "reduced sodium teriyaki sauce",
		department: "unclassified"
	},
	{
		name: "McCormick Parsley Flakes",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Dips Mix",
		department: "unclassified"
	},
	{
		name: "cherry flavored",
		department: "unclassified"
	},
	{
		name: "whole wheat bread slices",
		department: "unclassified"
	},
	{
		name: "kaiser",
		department: "unclassified"
	},
	{
		name: "St Germain Liqueur",
		department: "unclassified"
	},
	{
		name: "dry sweetener",
		department: "unclassified"
	},
	{
		name: "dried sweet cherries",
		department: "unclassified"
	},
	{
		name: "roasted rice powder",
		department: "unclassified"
	},
	{
		name: "grilled chicken strips",
		department: "unclassified"
	},
	{
		name: "veal mince",
		department: "unclassified"
	},
	{
		name: "tamarillos",
		department: "unclassified"
	},
	{
		name: "cherry heering",
		department: "unclassified"
	},
	{
		name: "wondra",
		department: "unclassified"
	},
	{
		name: "ginger nuts",
		department: "unclassified"
	},
	{
		name: "chicken ragout",
		department: "unclassified"
	},
	{
		name: "red decorating gel",
		department: "unclassified"
	},
	{
		name: "blended Scotch whisky",
		department: "unclassified"
	},
	{
		name: "kokum",
		department: "unclassified"
	},
	{
		name: "refrigerated mashed potatoes",
		department: "unclassified"
	},
	{
		name: "Punsch-roll",
		department: "unclassified"
	},
	{
		name: "frozen sweetened raspberries",
		department: "unclassified"
	},
	{
		name: "mandarin oranges in light syrup",
		department: "unclassified"
	},
	{
		name: "chocolate vodka",
		department: "unclassified"
	},
	{
		name: "Dole Pineapple Chunks",
		department: "unclassified"
	},
	{
		name: "Wholly Guacamole",
		department: "unclassified"
	},
	{
		name: "Hormel Pepperoni",
		department: "unclassified"
	},
	{
		name: "whole okra",
		department: "unclassified"
	},
	{
		name: "stinging nettle",
		department: "unclassified"
	},
	{
		name: "hubbard squash",
		department: "unclassified"
	},
	{
		name: "homemade stock",
		department: "unclassified"
	},
	{
		name: "M&M''s Chocolate Candies",
		department: "unclassified"
	},
	{
		name: "thai jasmine rice",
		department: "unclassified"
	},
	{
		name: "quinoa pasta",
		department: "unclassified"
	},
	{
		name: "pork sausage links",
		department: "unclassified"
	},
	{
		name: "braising beef",
		department: "unclassified"
	},
	{
		name: "Canada Dry Ginger Ale",
		department: "unclassified"
	},
	{
		name: "garlic and herb cheese spread",
		department: "unclassified"
	},
	{
		name: "pot barley",
		department: "unclassified"
	},
	{
		name: "whole wheat bagels",
		department: "unclassified"
	},
	{
		name: "whole wheat bagel",
		department: "unclassified"
	},
	{
		name: "soft buns",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Puff Pastry Sheets",
		department: "unclassified"
	},
	{
		name: "decaffeinated coffee",
		department: "unclassified"
	},
	{
		name: "baobab fruit powder",
		department: "unclassified"
	},
	{
		name: "chive flowers",
		department: "unclassified"
	},
	{
		name: "Italian seasoned panko bread crumbs",
		department: "unclassified"
	},
	{
		name: "ciliegine",
		department: "unclassified"
	},
	{
		name: "kewra essence",
		department: "unclassified"
	},
	{
		name: "mussel meat",
		department: "unclassified"
	},
	{
		name: "shredded medium cheddar cheese",
		department: "unclassified"
	},
	{
		name: "boboli",
		department: "unclassified"
	},
	{
		name: "pomegranate balsamic vinegar",
		department: "unclassified"
	},
	{
		name: "tatsoi",
		department: "unclassified"
	},
	{
		name: "soy glaze",
		department: "unclassified"
	},
	{
		name: "bolillo",
		department: "unclassified"
	},
	{
		name: "meat extract",
		department: "unclassified"
	},
	{
		name: "low fat honey graham crackers",
		department: "unclassified"
	},
	{
		name: "light vanilla ice cream",
		department: "unclassified"
	},
	{
		name: "farfel",
		department: "unclassified"
	},
	{
		name: "Mezzetta California Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Red Gold Petite Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Paprika",
		department: "unclassified"
	},
	{
		name: "green chard",
		department: "unclassified"
	},
	{
		name: "tostitos",
		department: "unclassified"
	},
	{
		name: "gluten-free cracker",
		department: "unclassified"
	},
	{
		name: "sushi nori",
		department: "unclassified"
	},
	{
		name: "branzino fillets",
		department: "unclassified"
	},
	{
		name: "black cod",
		department: "unclassified"
	},
	{
		name: "dried tagliatelle",
		department: "unclassified"
	},
	{
		name: "veal tongue",
		department: "unclassified"
	},
	{
		name: "dried mulberries",
		department: "unclassified"
	},
	{
		name: "spicy vegetable juice",
		department: "unclassified"
	},
	{
		name: "realemon juice",
		department: "unclassified"
	},
	{
		name: "Kraft Parmesan Cheese",
		department: "unclassified"
	},
	{
		name: "yellow rock sugar",
		department: "unclassified"
	},
	{
		name: "X Rated Fusion Liqueur",
		department: "unclassified"
	},
	{
		name: "silver rum",
		department: "unclassified"
	},
	{
		name: "burgundy wine",
		department: "unclassified"
	},
	{
		name: "King Arthur Gluten Free MultiPurpose Flour",
		department: "unclassified"
	},
	{
		name: "dried barberries",
		department: "unclassified"
	},
	{
		name: "chocolate crumbs",
		department: "unclassified"
	},
	{
		name: "bomba rice",
		department: "unclassified"
	},
	{
		name: "barberries",
		department: "unclassified"
	},
	{
		name: "tomato pieces",
		department: "unclassified"
	},
	{
		name: "bordeaux",
		department: "unclassified"
	},
	{
		name: "oatmeal cookie mix",
		department: "unclassified"
	},
	{
		name: "Dutch brandy",
		department: "unclassified"
	},
	{
		name: "bisto",
		department: "unclassified"
	},
	{
		name: "lamb tenderloins",
		department: "unclassified"
	},
	{
		name: "cynar",
		department: "unclassified"
	},
	{
		name: "gew\\u00FCrztraminer",
		department: "unclassified"
	},
	{
		name: "barolo",
		department: "unclassified"
	},
	{
		name: "vanilla rice milk",
		department: "unclassified"
	},
	{
		name: "mini bagels",
		department: "unclassified"
	},
	{
		name: "Kraft Miracle Whip Fat Free Dressing",
		department: "unclassified"
	},
	{
		name: "Conimex Mihoen",
		department: "unclassified"
	},
	{
		name: "multigrain rice",
		department: "unclassified"
	},
	{
		name: "wholemeal biscuits",
		department: "unclassified"
	},
	{
		name: "canned beets",
		department: "unclassified"
	},
	{
		name: "soy milk powder",
		department: "unclassified"
	},
	{
		name: "Sazon Goya Seasoning",
		department: "unclassified"
	},
	{
		name: "veal jus",
		department: "unclassified"
	},
	{
		name: "walla walla onion",
		department: "unclassified"
	},
	{
		name: "maize",
		department: "unclassified"
	},
	{
		name: "low sodium canned chicken broth",
		department: "unclassified"
	},
	{
		name: "calrose rice",
		department: "unclassified"
	},
	{
		name: "spring chicken",
		department: "unclassified"
	},
	{
		name: "pork loin back ribs",
		department: "unclassified"
	},
	{
		name: "deer",
		department: "unclassified"
	},
	{
		name: "rainbow sherbet",
		department: "unclassified"
	},
	{
		name: "strawberry frozen yogurt",
		department: "unclassified"
	},
	{
		name: "light balsamic vinaigrette",
		department: "unclassified"
	},
	{
		name: "hp steak sauce",
		department: "unclassified"
	},
	{
		name: "asian chile paste",
		department: "unclassified"
	},
	{
		name: "multigrain rolls",
		department: "unclassified"
	},
	{
		name: "shiraz",
		department: "unclassified"
	},
	{
		name: "salted herrings",
		department: "unclassified"
	},
	{
		name: "fruit tea",
		department: "unclassified"
	},
	{
		name: "pane toscano",
		department: "unclassified"
	},
	{
		name: "tuscan bread",
		department: "unclassified"
	},
	{
		name: "baking fat",
		department: "unclassified"
	},
	{
		name: "lemon sole fillets",
		department: "unclassified"
	},
	{
		name: "yufka dough",
		department: "unclassified"
	},
	{
		name: "unhulled sesame seeds",
		department: "unclassified"
	},
	{
		name: "mini pepperoni slices",
		department: "unclassified"
	},
	{
		name: "earl grey",
		department: "unclassified"
	},
	{
		name: "nettle leaves",
		department: "unclassified"
	},
	{
		name: "Mountain lentils",
		department: "unclassified"
	},
	{
		name: "seedless black grapes",
		department: "unclassified"
	},
	{
		name: "cerignola olives",
		department: "unclassified"
	},
	{
		name: "bitter gourd",
		department: "unclassified"
	},
	{
		name: "pawpaw",
		department: "unclassified"
	},
	{
		name: "praline topping",
		department: "unclassified"
	},
	{
		name: "honey ch\\u00E8vre",
		department: "unclassified"
	},
	{
		name: "potato dumplings",
		department: "unclassified"
	},
	{
		name: "Heinz Yellow Mustard",
		department: "unclassified"
	},
	{
		name: "canned jalapeno peppers",
		department: "unclassified"
	},
	{
		name: "peaches in light syrup",
		department: "unclassified"
	},
	{
		name: "mellowcreme pumpkins",
		department: "unclassified"
	},
	{
		name: "candy pumpkins",
		department: "unclassified"
	},
	{
		name: "Star Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "azuki bean",
		department: "unclassified"
	},
	{
		name: "baby broccoli",
		department: "unclassified"
	},
	{
		name: "organic soy sauce",
		department: "unclassified"
	},
	{
		name: "triscuits",
		department: "unclassified"
	},
	{
		name: "snow crab",
		department: "unclassified"
	},
	{
		name: "milkfish",
		department: "unclassified"
	},
	{
		name: "bluefish",
		department: "unclassified"
	},
	{
		name: "risoni",
		department: "unclassified"
	},
	{
		name: "rice pasta",
		department: "unclassified"
	},
	{
		name: "veal steak",
		department: "unclassified"
	},
	{
		name: "cumberland sausage",
		department: "unclassified"
	},
	{
		name: "brains",
		department: "unclassified"
	},
	{
		name: "breadfruit",
		department: "unclassified"
	},
	{
		name: "diet ginger ale",
		department: "unclassified"
	},
	{
		name: "mesquite seasoning",
		department: "unclassified"
	},
	{
		name: "maple glaze",
		department: "unclassified"
	},
	{
		name: "flavored vinegar",
		department: "unclassified"
	},
	{
		name: "Cavenders All Purpose Greek Seasoning",
		department: "unclassified"
	},
	{
		name: "achiote seeds",
		department: "unclassified"
	},
	{
		name: "pancake and waffle mix",
		department: "unclassified"
	},
	{
		name: "Crunch Cereal",
		department: "unclassified"
	},
	{
		name: "matzo balls",
		department: "unclassified"
	},
	{
		name: "gluten-free corn flour",
		department: "unclassified"
	},
	{
		name: "deli rolls",
		department: "unclassified"
	},
	{
		name: "lemon liqueur",
		department: "unclassified"
	},
	{
		name: "mint jelly",
		department: "unclassified"
	},
	{
		name: "cheese fondue",
		department: "unclassified"
	},
	{
		name: "brill fillets",
		department: "unclassified"
	},
	{
		name: "honey cake",
		department: "unclassified"
	},
	{
		name: "dip mix",
		department: "unclassified"
	},
	{
		name: "base sauce",
		department: "unclassified"
	},
	{
		name: "perilla",
		department: "unclassified"
	},
	{
		name: "boneless skinless chicken tenderloins",
		department: "unclassified"
	},
	{
		name: "cherry jelly",
		department: "unclassified"
	},
	{
		name: "beef medallions",
		department: "unclassified"
	},
	{
		name: "poffertjes",
		department: "unclassified"
	},
	{
		name: "vegetable margarine",
		department: "unclassified"
	},
	{
		name: "meat strips",
		department: "unclassified"
	},
	{
		name: "curry ketchup",
		department: "unclassified"
	},
	{
		name: "cranberry apple juice",
		department: "unclassified"
	},
	{
		name: "tuna packed in spring water",
		department: "unclassified"
	},
	{
		name: "country crock",
		department: "unclassified"
	},
	{
		name: "cream of tomato soup",
		department: "unclassified"
	},
	{
		name: "salad herb blend",
		department: "unclassified"
	},
	{
		name: "slavinken",
		department: "unclassified"
	},
	{
		name: "potato croquettes",
		department: "unclassified"
	},
	{
		name: "Trix Cereal",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Sea Salt",
		department: "unclassified"
	},
	{
		name: "shredded nori",
		department: "unclassified"
	},
	{
		name: "Muir Glen Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "cippolini onions",
		department: "unclassified"
	},
	{
		name: "pressed tofu",
		department: "unclassified"
	},
	{
		name: "red licorice",
		department: "unclassified"
	},
	{
		name: "bonito",
		department: "unclassified"
	},
	{
		name: "uncooked rigatoni",
		department: "unclassified"
	},
	{
		name: "radiatori",
		department: "unclassified"
	},
	{
		name: "turkey hot dogs",
		department: "unclassified"
	},
	{
		name: "precooked meatballs",
		department: "unclassified"
	},
	{
		name: "drum",
		department: "unclassified"
	},
	{
		name: "boneless veal shoulder",
		department: "unclassified"
	},
	{
		name: "pie cherries",
		department: "unclassified"
	},
	{
		name: "sauerkraut juice",
		department: "unclassified"
	},
	{
		name: "iced tea mix",
		department: "unclassified"
	},
	{
		name: "white sauce mix",
		department: "unclassified"
	},
	{
		name: "Tapatio Hot Sauce",
		department: "unclassified"
	},
	{
		name: "korean chile paste",
		department: "unclassified"
	},
	{
		name: "spelt berries",
		department: "unclassified"
	},
	{
		name: "panela",
		department: "unclassified"
	},
	{
		name: "old bread",
		department: "unclassified"
	},
	{
		name: "gluten-free pizza crust",
		department: "unclassified"
	},
	{
		name: "Conimex Sambal Badjak",
		department: "unclassified"
	},
	{
		name: "seasoned sea salt",
		department: "unclassified"
	},
	{
		name: "celery tops",
		department: "unclassified"
	},
	{
		name: "thick cut rolled oats",
		department: "unclassified"
	},
	{
		name: "dark miso",
		department: "unclassified"
	},
	{
		name: "Maldon Sea Salt Flakes",
		department: "unclassified"
	},
	{
		name: "Ling fish fillet",
		department: "unclassified"
	},
	{
		name: "leaf lard",
		department: "unclassified"
	},
	{
		name: "herbal melting cheese",
		department: "unclassified"
	},
	{
		name: "a\\u00F1ejo tequila",
		department: "unclassified"
	},
	{
		name: "grouse",
		department: "unclassified"
	},
	{
		name: "marc",
		department: "unclassified"
	},
	{
		name: "reduced sugar ketchup",
		department: "unclassified"
	},
	{
		name: "baking fruit",
		department: "unclassified"
	},
	{
		name: "Knudsen Light Sour Cream",
		department: "unclassified"
	},
	{
		name: "fried fish fillets",
		department: "unclassified"
	},
	{
		name: "beef rouladen",
		department: "unclassified"
	},
	{
		name: "groats",
		department: "unclassified"
	},
	{
		name: "mushroom cream sauce",
		department: "unclassified"
	},
	{
		name: "salted fish",
		department: "unclassified"
	},
	{
		name: "vegetarian meatballs",
		department: "unclassified"
	},
	{
		name: "vegetarian bacon",
		department: "unclassified"
	},
	{
		name: "non-fat soymilk",
		department: "unclassified"
	},
	{
		name: "homemade turkey stock",
		department: "unclassified"
	},
	{
		name: "codfish",
		department: "unclassified"
	},
	{
		name: "pasta twists",
		department: "unclassified"
	},
	{
		name: "semi-soft cheese",
		department: "unclassified"
	},
	{
		name: "fat-free frozen yogurt",
		department: "unclassified"
	},
	{
		name: "extra sharp aged cheddar cheese",
		department: "unclassified"
	},
	{
		name: "country crock spreadable sticks",
		department: "unclassified"
	},
	{
		name: "Sure Jell Fruit Pectin",
		department: "unclassified"
	},
	{
		name: "fruit flavoring",
		department: "unclassified"
	},
	{
		name: "Crisco Pure Canola Oil",
		department: "unclassified"
	},
	{
		name: "chinese chili paste",
		department: "unclassified"
	},
	{
		name: "aceto balsamico",
		department: "unclassified"
	},
	{
		name: "tanqueray",
		department: "unclassified"
	},
	{
		name: "country loaf",
		department: "unclassified"
	},
	{
		name: "kabuli channa",
		department: "unclassified"
	},
	{
		name: "halva",
		department: "unclassified"
	},
	{
		name: "carp fillets",
		department: "unclassified"
	},
	{
		name: "carp fillet pieces",
		department: "unclassified"
	},
	{
		name: "kamaboko",
		department: "unclassified"
	},
	{
		name: "Fanta",
		department: "unclassified"
	},
	{
		name: "KRAFT Reduced Fat Shredded Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "KRAFT 2% Milk Shredded Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "buttermilk ranch salad dressing mix",
		department: "unclassified"
	},
	{
		name: "nuoc mam",
		department: "unclassified"
	},
	{
		name: "Cabot Seriously Sharp Cheddar",
		department: "unclassified"
	},
	{
		name: "reduced sodium taco seasoning mix",
		department: "unclassified"
	},
	{
		name: "paupiette",
		department: "unclassified"
	},
	{
		name: "Conimex Sambal",
		department: "unclassified"
	},
	{
		name: "black licorice laces",
		department: "unclassified"
	},
	{
		name: "lemon mayonnaise",
		department: "unclassified"
	},
	{
		name: "diced pickles",
		department: "unclassified"
	},
	{
		name: "green curly kale",
		department: "unclassified"
	},
	{
		name: "Corona Beer",
		department: "unclassified"
	},
	{
		name: "Pompeian Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Toblerone Chocolates",
		department: "unclassified"
	},
	{
		name: "Honey Maid Graham Crackers",
		department: "unclassified"
	},
	{
		name: "niblet corn",
		department: "unclassified"
	},
	{
		name: "mulato chiles",
		department: "unclassified"
	},
	{
		name: "Swanson Premium White Chunk Chicken Breast in Water",
		department: "unclassified"
	},
	{
		name: "sweet dark chocolate",
		department: "unclassified"
	},
	{
		name: "gluten free graham crackers",
		department: "unclassified"
	},
	{
		name: "Butterfinger Candy Bar",
		department: "unclassified"
	},
	{
		name: "smoked whitefish",
		department: "unclassified"
	},
	{
		name: "mullet",
		department: "unclassified"
	},
	{
		name: "maccheroni",
		department: "unclassified"
	},
	{
		name: "veal loin chops",
		department: "unclassified"
	},
	{
		name: "linguica",
		department: "unclassified"
	},
	{
		name: "duck egg",
		department: "unclassified"
	},
	{
		name: "sweet biscuit crumbs",
		department: "unclassified"
	},
	{
		name: "portuguese rolls",
		department: "unclassified"
	},
	{
		name: "glazed doughnuts",
		department: "unclassified"
	},
	{
		name: "crusty loaf",
		department: "unclassified"
	},
	{
		name: "confectionery coating",
		department: "unclassified"
	},
	{
		name: "arrow root",
		department: "unclassified"
	},
	{
		name: "roti",
		department: "unclassified"
	},
	{
		name: "roasted bratwurst",
		department: "unclassified"
	},
	{
		name: "whole garam masala",
		department: "unclassified"
	},
	{
		name: "geranium",
		department: "unclassified"
	},
	{
		name: "recaito",
		department: "unclassified"
	},
	{
		name: "carne asada",
		department: "unclassified"
	},
	{
		name: "mild pork sausage",
		department: "unclassified"
	},
	{
		name: "country gravy",
		department: "unclassified"
	},
	{
		name: "callaloo",
		department: "unclassified"
	},
	{
		name: "Chinese sesame paste",
		department: "unclassified"
	},
	{
		name: "mini bananas",
		department: "unclassified"
	},
	{
		name: "baby bananas",
		department: "unclassified"
	},
	{
		name: "pipe rigate",
		department: "unclassified"
	},
	{
		name: "vegan mini chocolate chips",
		department: "unclassified"
	},
	{
		name: "arame",
		department: "unclassified"
	},
	{
		name: "boneless skin on chicken thighs",
		department: "unclassified"
	},
	{
		name: "KRAFT Balsamic Vinaigrette Dressing",
		department: "unclassified"
	},
	{
		name: "italian meringue",
		department: "unclassified"
	},
	{
		name: "quatre \\u00E9pices",
		department: "unclassified"
	},
	{
		name: "Chartreuse Liqueur",
		department: "unclassified"
	},
	{
		name: "white zinfandel",
		department: "unclassified"
	},
	{
		name: "plum jelly",
		department: "unclassified"
	},
	{
		name: "skate",
		department: "unclassified"
	},
	{
		name: "Becel Original",
		department: "unclassified"
	},
	{
		name: "Soy Vay\\u00AE Veri Veri Teriyaki\\u00AE Marinade & Sauce",
		department: "unclassified"
	},
	{
		name: "blueberry vodka",
		department: "unclassified"
	},
	{
		name: "gyros meat strips",
		department: "unclassified"
	},
	{
		name: "Grey Goose Vodka",
		department: "unclassified"
	},
	{
		name: "Homemade Yogurt",
		department: "unclassified"
	},
	{
		name: "McCormick Basil Leaves",
		department: "unclassified"
	},
	{
		name: "Badia Complete Seasoning",
		department: "unclassified"
	},
	{
		name: "prosciutto slices",
		department: "unclassified"
	},
	{
		name: "fresh cranberry beans",
		department: "unclassified"
	},
	{
		name: "black trumpet mushrooms",
		department: "unclassified"
	},
	{
		name: "Wheat Thins Crackers",
		department: "unclassified"
	},
	{
		name: "Planters Dry Roasted Peanuts",
		department: "unclassified"
	},
	{
		name: "claws",
		department: "unclassified"
	},
	{
		name: "whole wheat rigatoni",
		department: "unclassified"
	},
	{
		name: "pork kidneys",
		department: "unclassified"
	},
	{
		name: "prickly pear",
		department: "unclassified"
	},
	{
		name: "cactus fruit",
		department: "unclassified"
	},
	{
		name: "champagne grapes",
		department: "unclassified"
	},
	{
		name: "Wish-Bone Light Italian Dressing",
		department: "unclassified"
	},
	{
		name: "sweet almond oil",
		department: "unclassified"
	},
	{
		name: "sushi vinegar",
		department: "unclassified"
	},
	{
		name: "orange blossom",
		department: "unclassified"
	},
	{
		name: "Nestle Carnation Sweetened Condensed Milk",
		department: "unclassified"
	},
	{
		name: "fruit sauce",
		department: "unclassified"
	},
	{
		name: "toasted buns",
		department: "unclassified"
	},
	{
		name: "splenda artificial sweetener",
		department: "unclassified"
	},
	{
		name: "low calorie sweetener",
		department: "unclassified"
	},
	{
		name: "stoli",
		department: "unclassified"
	},
	{
		name: "Praline Liqueur",
		department: "unclassified"
	},
	{
		name: "cold seltzer",
		department: "unclassified"
	},
	{
		name: "cake donuts",
		department: "unclassified"
	},
	{
		name: "knoflookolijven",
		department: "unclassified"
	},
	{
		name: "mini chocolate eggs",
		department: "unclassified"
	},
	{
		name: "celery powder",
		department: "unclassified"
	},
	{
		name: "filberts",
		department: "unclassified"
	},
	{
		name: "surimi sticks",
		department: "unclassified"
	},
	{
		name: "chopped macadamias",
		department: "unclassified"
	},
	{
		name: "Beefeater Gin",
		department: "unclassified"
	},
	{
		name: "Hersheys Skor English Toffee Bits",
		department: "unclassified"
	},
	{
		name: "orange pineapple juice",
		department: "unclassified"
	},
	{
		name: "butter flavor vegetable shortening",
		department: "unclassified"
	},
	{
		name: "Crystal Farms\\u00AE Shredded Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "dolcelatte",
		department: "unclassified"
	},
	{
		name: "foccacia",
		department: "unclassified"
	},
	{
		name: "seeded rolls",
		department: "unclassified"
	},
	{
		name: "smoked meat",
		department: "unclassified"
	},
	{
		name: "gravlax",
		department: "unclassified"
	},
	{
		name: "peach salsa",
		department: "unclassified"
	},
	{
		name: "Biscoff Cookies",
		department: "unclassified"
	},
	{
		name: "Swiss cheese slices",
		department: "unclassified"
	},
	{
		name: "Brown Rice Flour Mix",
		department: "unclassified"
	},
	{
		name: "Green Giant\\u2122 sliced mushrooms",
		department: "unclassified"
	},
	{
		name: "mezzi rigatoni",
		department: "unclassified"
	},
	{
		name: "Kraft Reduced Fat Mayonnaise With Olive Oil",
		department: "unclassified"
	},
	{
		name: "Kraft Reduced Fat Mayonnaise with Olive Oil",
		department: "unclassified"
	},
	{
		name: "oxtail soup",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Chef Blends\\u2122 Shredded 6 Cheese Italian",
		department: "unclassified"
	},
	{
		name: "flavored tortilla chips",
		department: "unclassified"
	},
	{
		name: "raspberry fruit spread",
		department: "unclassified"
	},
	{
		name: "MorningStar Farms Veggie Crumbles",
		department: "unclassified"
	},
	{
		name: "Hellman's Light Mayonnaise",
		department: "unclassified"
	},
	{
		name: "Best Foods Light Mayonnaise",
		department: "unclassified"
	},
	{
		name: "Herdez Salsa Verde",
		department: "unclassified"
	},
	{
		name: "Land O Lakes Heavy Whipping Cream",
		department: "unclassified"
	},
	{
		name: "McCormick Pure Lemon Extract",
		department: "unclassified"
	},
	{
		name: "holland chile",
		department: "unclassified"
	},
	{
		name: "ramen noodle soup",
		department: "unclassified"
	},
	{
		name: "osetra caviar",
		department: "unclassified"
	},
	{
		name: "mahimahi",
		department: "unclassified"
	},
	{
		name: "white meat",
		department: "unclassified"
	},
	{
		name: "vienna sausage",
		department: "unclassified"
	},
	{
		name: "veal rib chops",
		department: "unclassified"
	},
	{
		name: "sandwich steak",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Deli Fresh Smoked Ham",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Smoked Ham",
		department: "unclassified"
	},
	{
		name: "beef soup bones",
		department: "unclassified"
	},
	{
		name: "Dole Crushed Pineapple",
		department: "unclassified"
	},
	{
		name: "low-fat chocolate ice cream",
		department: "unclassified"
	},
	{
		name: "Lipton\\u00AE Cup Size Tea Bags",
		department: "unclassified"
	},
	{
		name: "darjeeling tea",
		department: "unclassified"
	},
	{
		name: "shredded low-fat cheese",
		department: "unclassified"
	},
	{
		name: "2% low-fat cottage cheese",
		department: "unclassified"
	},
	{
		name: "white mustard seeds",
		department: "unclassified"
	},
	{
		name: "tomato sauce low sodium",
		department: "unclassified"
	},
	{
		name: "rustic rub",
		department: "unclassified"
	},
	{
		name: "jambalaya mix",
		department: "unclassified"
	},
	{
		name: "hamburger seasoning",
		department: "unclassified"
	},
	{
		name: "dried woodruff leaves",
		department: "unclassified"
	},
	{
		name: "woodruff",
		department: "unclassified"
	},
	{
		name: "Bertolli\\u00AE Arrabbiata Sauce",
		department: "unclassified"
	},
	{
		name: "whole wheat french bread",
		department: "unclassified"
	},
	{
		name: "whole wheat flatbreads",
		department: "unclassified"
	},
	{
		name: "cheesecake mix",
		department: "unclassified"
	},
	{
		name: "barley flakes",
		department: "unclassified"
	},
	{
		name: "chapati",
		department: "unclassified"
	},
	{
		name: "doenzang",
		department: "unclassified"
	},
	{
		name: "reduced sugar orange marmalade",
		department: "unclassified"
	},
	{
		name: "cambozola",
		department: "unclassified"
	},
	{
		name: "thyme honey",
		department: "unclassified"
	},
	{
		name: "pappadams",
		department: "unclassified"
	},
	{
		name: "gorgonzola cheese torta",
		department: "unclassified"
	},
	{
		name: "vegetable beef soup",
		department: "unclassified"
	},
	{
		name: "gram dal",
		department: "unclassified"
	},
	{
		name: "citrus slices",
		department: "unclassified"
	},
	{
		name: "Sun Gold tomatoes",
		department: "unclassified"
	},
	{
		name: "caponata",
		department: "unclassified"
	},
	{
		name: "sesame sticks",
		department: "unclassified"
	},
	{
		name: "cubed salmon",
		department: "unclassified"
	},
	{
		name: "demi baguette",
		department: "unclassified"
	},
	{
		name: "whole grain rye",
		department: "unclassified"
	},
	{
		name: "rouille",
		department: "unclassified"
	},
	{
		name: "cactus",
		department: "unclassified"
	},
	{
		name: "sumac powder",
		department: "unclassified"
	},
	{
		name: "rioja",
		department: "unclassified"
	},
	{
		name: "gumballs",
		department: "unclassified"
	},
	{
		name: "strawberry vodka",
		department: "unclassified"
	},
	{
		name: "burghul",
		department: "unclassified"
	},
	{
		name: "Pillsbury\\u2122 Crescent Recipe Creations\\u00AE refrigerated seamless dough sheet",
		department: "unclassified"
	},
	{
		name: "International Delight Iced Coffee",
		department: "unclassified"
	},
	{
		name: "sardine fillets",
		department: "unclassified"
	},
	{
		name: "roasted chili paste",
		department: "unclassified"
	},
	{
		name: "Spice Islands Garlic Powder",
		department: "unclassified"
	},
	{
		name: "Stevia In The Raw",
		department: "unclassified"
	},
	{
		name: "treviso radicchio",
		department: "unclassified"
	},
	{
		name: "radish greens",
		department: "unclassified"
	},
	{
		name: "butternut squash soup",
		department: "unclassified"
	},
	{
		name: "gelatin dessert",
		department: "unclassified"
	},
	{
		name: "smelt",
		department: "unclassified"
	},
	{
		name: "quahogs",
		department: "unclassified"
	},
	{
		name: "light tuna packed in water",
		department: "unclassified"
	},
	{
		name: "tabbouleh",
		department: "unclassified"
	},
	{
		name: "luster dust",
		department: "unclassified"
	},
	{
		name: "pig's ear",
		department: "unclassified"
	},
	{
		name: "moose",
		department: "unclassified"
	},
	{
		name: "meat filling",
		department: "unclassified"
	},
	{
		name: "cured meats",
		department: "unclassified"
	},
	{
		name: "nonfat sweetened condensed milk",
		department: "unclassified"
	},
	{
		name: "light whipping cream",
		department: "unclassified"
	},
	{
		name: "McCormick Garlic Salt",
		department: "unclassified"
	},
	{
		name: "McCormick Chili Powder",
		department: "unclassified"
	},
	{
		name: "i can't believe it's not butter! spray original",
		department: "unclassified"
	},
	{
		name: "gluten free dijon mustard",
		department: "unclassified"
	},
	{
		name: "glace fruit",
		department: "unclassified"
	},
	{
		name: "dijon vinaigrette",
		department: "unclassified"
	},
	{
		name: "canning and pickling salt",
		department: "unclassified"
	},
	{
		name: "toast rounds",
		department: "unclassified"
	},
	{
		name: "garlic Alfredo sauce",
		department: "unclassified"
	},
	{
		name: "jose cuervo especial",
		department: "unclassified"
	},
	{
		name: "leek tops",
		department: "unclassified"
	},
	{
		name: "egg salad",
		department: "unclassified"
	},
	{
		name: "venison medallions",
		department: "unclassified"
	},
	{
		name: "chunky mild salsa",
		department: "unclassified"
	},
	{
		name: "Fleischmann's\\u00AE active dry yeast",
		department: "unclassified"
	},
	{
		name: "edible gold leaf",
		department: "unclassified"
	},
	{
		name: "kasseri",
		department: "unclassified"
	},
	{
		name: "pitaya",
		department: "unclassified"
	},
	{
		name: "lemon marmalade",
		department: "unclassified"
	},
	{
		name: "intestines",
		department: "unclassified"
	},
	{
		name: "pistou",
		department: "unclassified"
	},
	{
		name: "dhaniya powder",
		department: "unclassified"
	},
	{
		name: "lemon jelly",
		department: "unclassified"
	},
	{
		name: "unsmoked streaky bacon rashers",
		department: "unclassified"
	},
	{
		name: "empanada wrappers",
		department: "unclassified"
	},
	{
		name: "boneless skinless salmon fillets",
		department: "unclassified"
	},
	{
		name: "veal ribeye steak",
		department: "unclassified"
	},
	{
		name: "Green Giant\\u2122 frozen chopped spinach",
		department: "unclassified"
	},
	{
		name: "chicken patty",
		department: "unclassified"
	},
	{
		name: "matzo farfel",
		department: "unclassified"
	},
	{
		name: "spiral cut ham",
		department: "unclassified"
	},
	{
		name: "Old El Paso Taco Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "low sodium pinto beans",
		department: "unclassified"
	},
	{
		name: "sansho",
		department: "unclassified"
	},
	{
		name: "japanese pepper",
		department: "unclassified"
	},
	{
		name: "fresno pepper",
		department: "unclassified"
	},
	{
		name: "avocado leaves",
		department: "unclassified"
	},
	{
		name: "seabass",
		department: "unclassified"
	},
	{
		name: "mein",
		department: "unclassified"
	},
	{
		name: "cooked vermicelli",
		department: "unclassified"
	},
	{
		name: "Wolf Brand Chili",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Pasta Sides\\u2122 - Alfredo",
		department: "unclassified"
	},
	{
		name: "zante currants",
		department: "unclassified"
	},
	{
		name: "Torani",
		department: "unclassified"
	},
	{
		name: "Maxwell House Instant Coffee",
		department: "unclassified"
	},
	{
		name: "chai tea teabags",
		department: "unclassified"
	},
	{
		name: "wheat free soy sauce",
		department: "unclassified"
	},
	{
		name: "tarragon wine vinegar",
		department: "unclassified"
	},
	{
		name: "porcini powder",
		department: "unclassified"
	},
	{
		name: "chile puree",
		department: "unclassified"
	},
	{
		name: "Bertolli\\u00AE Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Bertolli Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "chicken skins",
		department: "unclassified"
	},
	{
		name: "Kix Cereal",
		department: "unclassified"
	},
	{
		name: "soft sandwich rolls",
		department: "unclassified"
	},
	{
		name: "crusty country bread",
		department: "unclassified"
	},
	{
		name: "licorice root",
		department: "unclassified"
	},
	{
		name: "malanga",
		department: "unclassified"
	},
	{
		name: "French feta",
		department: "unclassified"
	},
	{
		name: "corn masa flour",
		department: "unclassified"
	},
	{
		name: "pear schnapps",
		department: "unclassified"
	},
	{
		name: "flowering chives",
		department: "unclassified"
	},
	{
		name: "onion marmalade",
		department: "unclassified"
	},
	{
		name: "medium grain brown rice",
		department: "unclassified"
	},
	{
		name: "refrigerated cookie dough",
		department: "unclassified"
	},
	{
		name: "peach vodka",
		department: "unclassified"
	},
	{
		name: "rose hips",
		department: "unclassified"
	},
	{
		name: "coconut 'bacon'",
		department: "unclassified"
	},
	{
		name: "non dairy sour cream",
		department: "unclassified"
	},
	{
		name: "bacon salt",
		department: "unclassified"
	},
	{
		name: "hare fillets",
		department: "unclassified"
	},
	{
		name: "king oyster mushroom",
		department: "unclassified"
	},
	{
		name: "habanero powder",
		department: "unclassified"
	},
	{
		name: "light lemonade",
		department: "unclassified"
	},
	{
		name: "Chiquita Bananas",
		department: "unclassified"
	},
	{
		name: "baby radishes",
		department: "unclassified"
	},
	{
		name: "levain",
		department: "unclassified"
	},
	{
		name: "JELL-O Lemon Flavor Instant Pudding",
		department: "unclassified"
	},
	{
		name: "roasted peeled chestnuts",
		department: "unclassified"
	},
	{
		name: "apple peel",
		department: "unclassified"
	},
	{
		name: "apple peels",
		department: "unclassified"
	},
	{
		name: "cal",
		department: "unclassified"
	},
	{
		name: "cajun seasoning mix",
		department: "unclassified"
	},
	{
		name: "Ghirardelli\\u00AE Unsweetened Cocoa Powder",
		department: "unclassified"
	},
	{
		name: "Ghirardelli\\u00AE Unsweetened Cocoa",
		department: "unclassified"
	},
	{
		name: "gluten free panko breadcrumbs",
		department: "unclassified"
	},
	{
		name: "soepballetjes",
		department: "unclassified"
	},
	{
		name: "chicken roulade",
		department: "unclassified"
	},
	{
		name: "chicken rouladen",
		department: "unclassified"
	},
	{
		name: "red serrano peppers",
		department: "unclassified"
	},
	{
		name: "boneless skinless chicken breast fillets",
		department: "unclassified"
	},
	{
		name: "tofu puffs",
		department: "unclassified"
	},
	{
		name: "Clabber Girl Baking Powder",
		department: "unclassified"
	},
	{
		name: "Hillshire Farm Polska Kielbasa",
		department: "unclassified"
	},
	{
		name: "sea vegetables",
		department: "unclassified"
	},
	{
		name: "garbonzo bean",
		department: "unclassified"
	},
	{
		name: "low fat cream of celery soup",
		department: "unclassified"
	},
	{
		name: "rockfish",
		department: "unclassified"
	},
	{
		name: "whole wheat spiral pasta",
		department: "unclassified"
	},
	{
		name: "tagliolini",
		department: "unclassified"
	},
	{
		name: "dried rigatoni",
		department: "unclassified"
	},
	{
		name: "lamb breast",
		department: "unclassified"
	},
	{
		name: "bone-in ribeye steak",
		department: "unclassified"
	},
	{
		name: "winter melon",
		department: "unclassified"
	},
	{
		name: "unsweetened kool-aid",
		department: "unclassified"
	},
	{
		name: "hawaiian punch drink",
		department: "unclassified"
	},
	{
		name: "frozen lemonade concentrate, thawed and undiluted",
		department: "unclassified"
	},
	{
		name: "bitter orange juice",
		department: "unclassified"
	},
	{
		name: "umeboshi vinegar",
		department: "unclassified"
	},
	{
		name: "low sodium salt",
		department: "unclassified"
	},
	{
		name: "KC Masterpiece\\u00AE Original Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "butter-flavored spray",
		department: "unclassified"
	},
	{
		name: "alfredo sauce mix",
		department: "unclassified"
	},
	{
		name: "golden grahams",
		department: "unclassified"
	},
	{
		name: "beet sugar",
		department: "unclassified"
	},
	{
		name: "sea trout",
		department: "unclassified"
	},
	{
		name: "lily buds",
		department: "unclassified"
	},
	{
		name: "sourdough pretzels",
		department: "unclassified"
	},
	{
		name: "cardoons",
		department: "unclassified"
	},
	{
		name: "prosciutto cotto",
		department: "unclassified"
	},
	{
		name: "multicolored cherry tomatoes",
		department: "unclassified"
	},
	{
		name: "unsweetened coconut water",
		department: "unclassified"
	},
	{
		name: "square pasta",
		department: "unclassified"
	},
	{
		name: "pot stickers",
		department: "unclassified"
	},
	{
		name: "KRAFT Shredded Three Cheese with a TOUCH OF PHILADELPHIA",
		department: "unclassified"
	},
	{
		name: "ti leaves",
		department: "unclassified"
	},
	{
		name: "frangipane",
		department: "unclassified"
	},
	{
		name: "gelfix",
		department: "unclassified"
	},
	{
		name: "lime sparkling water",
		department: "unclassified"
	},
	{
		name: "Stolichnaya Vodka",
		department: "unclassified"
	},
	{
		name: "Green Giant\\u2122 Steamers\\u2122 frozen mixed vegetables",
		department: "unclassified"
	},
	{
		name: "gluten free yellow cake mix",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Pitted Kalamata Olives",
		department: "unclassified"
	},
	{
		name: "potato sticks",
		department: "unclassified"
	},
	{
		name: "almond biscotti",
		department: "unclassified"
	},
	{
		name: "70% cocoa dark chocolate",
		department: "unclassified"
	},
	{
		name: "Spice Islands Fine Grind Black Pepper",
		department: "unclassified"
	},
	{
		name: "Rodelle Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "snow pea shoots",
		department: "unclassified"
	},
	{
		name: "coriander green",
		department: "unclassified"
	},
	{
		name: "stomach",
		department: "unclassified"
	},
	{
		name: "lamb shoulder roast",
		department: "unclassified"
	},
	{
		name: "wild strawberry",
		department: "unclassified"
	},
	{
		name: "jonathan apple",
		department: "unclassified"
	},
	{
		name: "maraschino juice",
		department: "unclassified"
	},
	{
		name: "acai juice",
		department: "unclassified"
	},
	{
		name: "non-fat strawberry yogurt",
		department: "unclassified"
	},
	{
		name: "teriyaki glaze",
		department: "unclassified"
	},
	{
		name: "mesquite marinade",
		department: "unclassified"
	},
	{
		name: "McCormick Pumpkin Pie Spice",
		department: "unclassified"
	},
	{
		name: "low sodium pasta sauce",
		department: "unclassified"
	},
	{
		name: "essence seasoning",
		department: "unclassified"
	},
	{
		name: "berry syrup",
		department: "unclassified"
	},
	{
		name: "hominy grits",
		department: "unclassified"
	},
	{
		name: "tartlet shells",
		department: "unclassified"
	},
	{
		name: "rye berries",
		department: "unclassified"
	},
	{
		name: "fry mix",
		department: "unclassified"
	},
	{
		name: "focaccia rolls",
		department: "unclassified"
	},
	{
		name: "herbal liqueur",
		department: "unclassified"
	},
	{
		name: "fruit liqueur",
		department: "unclassified"
	},
	{
		name: "bulgar",
		department: "unclassified"
	},
	{
		name: "crab butter",
		department: "unclassified"
	},
	{
		name: "rocket salad mix",
		department: "unclassified"
	},
	{
		name: "sweet marjoram",
		department: "unclassified"
	},
	{
		name: "Hillshire Farm Lit'l Smokies\\u00AE",
		department: "unclassified"
	},
	{
		name: "poolish",
		department: "unclassified"
	},
	{
		name: "chocolate sticks",
		department: "unclassified"
	},
	{
		name: "herbsaint",
		department: "unclassified"
	},
	{
		name: "psyllium seed husks",
		department: "unclassified"
	},
	{
		name: "walnut ice cream",
		department: "unclassified"
	},
	{
		name: "rollmops",
		department: "unclassified"
	},
	{
		name: "irish moss",
		department: "unclassified"
	},
	{
		name: "Kenya beans",
		department: "unclassified"
	},
	{
		name: "papaya nectar",
		department: "unclassified"
	},
	{
		name: "ficelle",
		department: "unclassified"
	},
	{
		name: "par-baked rolls",
		department: "unclassified"
	},
	{
		name: "Silk Unsweetened Vanilla Almondmilk",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Artisan Blends\\u00AE Shredded Parmesan Cheese",
		department: "unclassified"
	},
	{
		name: "reduced fat italian dressing",
		department: "unclassified"
	},
	{
		name: "dried cilantro leaves",
		department: "unclassified"
	},
	{
		name: "TABASCO\\u00AE Chipotle Pepper Sauce",
		department: "unclassified"
	},
	{
		name: "unsweetened instant tea",
		department: "unclassified"
	},
	{
		name: "salt-cured meat",
		department: "unclassified"
	},
	{
		name: "Pillsbury\\u00AE Moist Supreme\\u00AE Funfetti\\u00AE Cake Mix",
		department: "unclassified"
	},
	{
		name: "szechuan sauce",
		department: "unclassified"
	},
	{
		name: "sugar wafers",
		department: "unclassified"
	},
	{
		name: "Argo Corn Starch",
		department: "unclassified"
	},
	{
		name: "Red Star Yeast",
		department: "unclassified"
	},
	{
		name: "International Delight Coffee Creamer",
		department: "unclassified"
	},
	{
		name: "radish slices",
		department: "unclassified"
	},
	{
		name: "dry roasted soybeans",
		department: "unclassified"
	},
	{
		name: "red leicester",
		department: "unclassified"
	},
	{
		name: "miniature pumpkins",
		department: "unclassified"
	},
	{
		name: "long pepper",
		department: "unclassified"
	},
	{
		name: "dried arbol chile",
		department: "unclassified"
	},
	{
		name: "homemade vegetable broth",
		department: "unclassified"
	},
	{
		name: "Twix Candy Bars",
		department: "unclassified"
	},
	{
		name: "spiny lobsters",
		department: "unclassified"
	},
	{
		name: "shrimp meat",
		department: "unclassified"
	},
	{
		name: "ocean perch",
		department: "unclassified"
	},
	{
		name: "shanghai noodles",
		department: "unclassified"
	},
	{
		name: "honeydew balls",
		department: "unclassified"
	},
	{
		name: "potsticker wrappers",
		department: "unclassified"
	},
	{
		name: "unsweetened flavored drink mix",
		department: "unclassified"
	},
	{
		name: "Chavrie Goat Cheese",
		department: "unclassified"
	},
	{
		name: "teriyaki baste and glaze",
		department: "unclassified"
	},
	{
		name: "chinese plum sauce",
		department: "unclassified"
	},
	{
		name: "weetabix",
		department: "unclassified"
	},
	{
		name: "irish oatmeal",
		department: "unclassified"
	},
	{
		name: "splenda granulated",
		department: "unclassified"
	},
	{
		name: "pumpernickel rounds",
		department: "unclassified"
	},
	{
		name: "crusty sandwich rolls",
		department: "unclassified"
	},
	{
		name: "bread yeast",
		department: "unclassified"
	},
	{
		name: "multicolored carrots",
		department: "unclassified"
	},
	{
		name: "fat free ice cream",
		department: "unclassified"
	},
	{
		name: "turkey medallions",
		department: "unclassified"
	},
	{
		name: "pullman loaf",
		department: "unclassified"
	},
	{
		name: "cold brewed coffee",
		department: "unclassified"
	},
	{
		name: "smokey barbecue sauce",
		department: "unclassified"
	},
	{
		name: "oliebollenmix",
		department: "unclassified"
	},
	{
		name: "mochi",
		department: "unclassified"
	},
	{
		name: "banana squash",
		department: "unclassified"
	},
	{
		name: "carrot coleslaw",
		department: "unclassified"
	},
	{
		name: "brown rice penne",
		department: "unclassified"
	},
	{
		name: "brown rice penne pasta",
		department: "unclassified"
	},
	{
		name: "bouillon granules",
		department: "unclassified"
	},
	{
		name: "brill",
		department: "unclassified"
	},
	{
		name: "vanilla liqueur",
		department: "unclassified"
	},
	{
		name: "black cherry gelatin",
		department: "unclassified"
	},
	{
		name: "granular no-calorie sucralose sweetener",
		department: "unclassified"
	},
	{
		name: "shawarma strips",
		department: "unclassified"
	},
	{
		name: "sliced chorizo",
		department: "unclassified"
	},
	{
		name: "grass-fed cheese",
		department: "unclassified"
	},
	{
		name: "Green Giant\\u2122 Steamers\\u2122 Niblets\\u00AE frozen corn",
		department: "unclassified"
	},
	{
		name: "rice cereal squares",
		department: "unclassified"
	},
	{
		name: "low-fat refried beans",
		department: "unclassified"
	},
	{
		name: "nasivlees",
		department: "unclassified"
	},
	{
		name: "cracked green olives",
		department: "unclassified"
	},
	{
		name: "Challenge Unsalted Butter",
		department: "unclassified"
	},
	{
		name: "sugarcane",
		department: "unclassified"
	},
	{
		name: "roasted poblano",
		department: "unclassified"
	},
	{
		name: "palm hearts",
		department: "unclassified"
	},
	{
		name: "cajun style stewed tomatoes",
		department: "unclassified"
	},
	{
		name: "low-fat silken tofu",
		department: "unclassified"
	},
	{
		name: "rich turkey stock",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Beef flavored Bouillon Cube",
		department: "unclassified"
	},
	{
		name: "sturgeon",
		department: "unclassified"
	},
	{
		name: "fish paste",
		department: "unclassified"
	},
	{
		name: "ribbon pasta",
		department: "unclassified"
	},
	{
		name: "top sirloin roast",
		department: "unclassified"
	},
	{
		name: "rib steaks",
		department: "unclassified"
	},
	{
		name: "fully cooked luncheon meat",
		department: "unclassified"
	},
	{
		name: "english breakfast tea bags",
		department: "unclassified"
	},
	{
		name: "garlic herb feta",
		department: "unclassified"
	},
	{
		name: "roasted garlic oil",
		department: "unclassified"
	},
	{
		name: "McCormick Ground Black Pepper",
		department: "unclassified"
	},
	{
		name: "low-fat sesame ginger salad dressing",
		department: "unclassified"
	},
	{
		name: "low-fat peanut butter",
		department: "unclassified"
	},
	{
		name: "annatto powder",
		department: "unclassified"
	},
	{
		name: "Shredded Wheat Biscuits",
		department: "unclassified"
	},
	{
		name: "chinese pancakes",
		department: "unclassified"
	},
	{
		name: "whole wheat pita bread rounds",
		department: "unclassified"
	},
	{
		name: "sweet potato starch",
		department: "unclassified"
	},
	{
		name: "powdered sugar glaze",
		department: "unclassified"
	},
	{
		name: "walnut liqueur",
		department: "unclassified"
	},
	{
		name: "bergamot",
		department: "unclassified"
	},
	{
		name: "citric acid powder",
		department: "unclassified"
	},
	{
		name: "Cox's Orange Pippin",
		department: "unclassified"
	},
	{
		name: "sweet barbeque sauce",
		department: "unclassified"
	},
	{
		name: "chicken stock concentrate",
		department: "unclassified"
	},
	{
		name: "beaujolais",
		department: "unclassified"
	},
	{
		name: "raspberry lemonade",
		department: "unclassified"
	},
	{
		name: "Junior Mints",
		department: "unclassified"
	},
	{
		name: "whole grain toast",
		department: "unclassified"
	},
	{
		name: "chai concentrate",
		department: "unclassified"
	},
	{
		name: "coke zero",
		department: "unclassified"
	},
	{
		name: "rum raisins",
		department: "unclassified"
	},
	{
		name: "pomegranate liqueur",
		department: "unclassified"
	},
	{
		name: "Knorr Chicken Stock Cubes",
		department: "unclassified"
	},
	{
		name: "egg tagliatelle",
		department: "unclassified"
	},
	{
		name: "Vadouvan curry",
		department: "unclassified"
	},
	{
		name: "brown rice miso",
		department: "unclassified"
	},
	{
		name: "scamorza",
		department: "unclassified"
	},
	{
		name: "plum baby food",
		department: "unclassified"
	},
	{
		name: "unsweetened cacao",
		department: "unclassified"
	},
	{
		name: "Thai eggplants",
		department: "unclassified"
	},
	{
		name: "pear vodka",
		department: "unclassified"
	},
	{
		name: "vegan bouillon cubes",
		department: "unclassified"
	},
	{
		name: "whole grain rotini",
		department: "unclassified"
	},
	{
		name: "turkey fat",
		department: "unclassified"
	},
	{
		name: "sour apple schnapps",
		department: "unclassified"
	},
	{
		name: "light rye bread",
		department: "unclassified"
	},
	{
		name: "membrillo",
		department: "unclassified"
	},
	{
		name: "gluten free corn tortillas",
		department: "unclassified"
	},
	{
		name: "konnyaku",
		department: "unclassified"
	},
	{
		name: "black radish",
		department: "unclassified"
	},
	{
		name: "Cabot Extra Sharp Cheddar",
		department: "unclassified"
	},
	{
		name: "whole wheat pearl couscous",
		department: "unclassified"
	},
	{
		name: "Budweiser Beer",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Beef Bouillon",
		department: "unclassified"
	},
	{
		name: "tikka masala curry paste",
		department: "unclassified"
	},
	{
		name: "rundervinken",
		department: "unclassified"
	},
	{
		name: "wolffish",
		department: "unclassified"
	},
	{
		name: "chantilly cream",
		department: "unclassified"
	},
	{
		name: "Jimmy Dean Pork Sausage",
		department: "unclassified"
	},
	{
		name: "abalone",
		department: "unclassified"
	},
	{
		name: "soy mayonnaise",
		department: "unclassified"
	},
	{
		name: "crunchie bar",
		department: "unclassified"
	},
	{
		name: "crispy crunch bars",
		department: "unclassified"
	},
	{
		name: "crunch bars",
		department: "unclassified"
	},
	{
		name: "butterscotch flavored morsels",
		department: "unclassified"
	},
	{
		name: "uni",
		department: "unclassified"
	},
	{
		name: "sevruga caviar",
		department: "unclassified"
	},
	{
		name: "kingfish",
		department: "unclassified"
	},
	{
		name: "squirrel",
		department: "unclassified"
	},
	{
		name: "scallopini",
		department: "unclassified"
	},
	{
		name: "pork picnic shoulder",
		department: "unclassified"
	},
	{
		name: "pork cubes",
		department: "unclassified"
	},
	{
		name: "dogs",
		department: "unclassified"
	},
	{
		name: "cured pork",
		department: "unclassified"
	},
	{
		name: "chuck eye steak",
		department: "unclassified"
	},
	{
		name: "Country Time Lemonade",
		department: "unclassified"
	},
	{
		name: "aloe vera juice",
		department: "unclassified"
	},
	{
		name: "pasteurized process cheese spread",
		department: "unclassified"
	},
	{
		name: "low-fat cheddar",
		department: "unclassified"
	},
	{
		name: "Ragu\\u00AE Chunky Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "popcorn salt",
		department: "unclassified"
	},
	{
		name: "pesto sauce mix",
		department: "unclassified"
	},
	{
		name: "onion gravy",
		department: "unclassified"
	},
	{
		name: "low fat alfredo sauce",
		department: "unclassified"
	},
	{
		name: "pinhead oats",
		department: "unclassified"
	},
	{
		name: "tempura batter mix",
		department: "unclassified"
	},
	{
		name: "mini pie crusts",
		department: "unclassified"
	},
	{
		name: "ice wine",
		department: "unclassified"
	},
	{
		name: "cheese croutons",
		department: "unclassified"
	},
	{
		name: "red decorating icing",
		department: "unclassified"
	},
	{
		name: "rookkaas",
		department: "unclassified"
	},
	{
		name: "chipotle aioli",
		department: "unclassified"
	},
	{
		name: "black sea bass",
		department: "unclassified"
	},
	{
		name: "eierkoeken",
		department: "unclassified"
	},
	{
		name: "extra lean minced beef",
		department: "unclassified"
	},
	{
		name: "belgian endive heads",
		department: "unclassified"
	},
	{
		name: "yufka",
		department: "unclassified"
	},
	{
		name: "egg roll skins",
		department: "unclassified"
	},
	{
		name: "sangrita",
		department: "unclassified"
	},
	{
		name: "SAF Yeast",
		department: "unclassified"
	},
	{
		name: "creme de noyaux",
		department: "unclassified"
	},
	{
		name: "tuinkruidenbouillontablet",
		department: "unclassified"
	},
	{
		name: "tuinkruidenbouillontabletten",
		department: "unclassified"
	},
	{
		name: "cherry coke",
		department: "unclassified"
	},
	{
		name: "tri-color pasta",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Fiesta Sides Spanish Rice",
		department: "unclassified"
	},
	{
		name: "TruMoo 1% Lowfat Chocolate Milk",
		department: "unclassified"
	},
	{
		name: "McCormick Onion Powder",
		department: "unclassified"
	},
	{
		name: "Honig Tarly",
		department: "unclassified"
	},
	{
		name: "quick cooking white rice",
		department: "unclassified"
	},
	{
		name: "frozen sour cherries",
		department: "unclassified"
	},
	{
		name: "pickled shallots",
		department: "unclassified"
	},
	{
		name: "walleye",
		department: "unclassified"
	},
	{
		name: "Fisher Pecan Halves",
		department: "unclassified"
	},
	{
		name: "Tostitos Salsa",
		department: "unclassified"
	},
	{
		name: "Bacardi Rum",
		department: "unclassified"
	},
	{
		name: "San Marzano Crushed Tomatoes",
		department: "unclassified"
	},
	{
		name: "nopalitos",
		department: "unclassified"
	},
	{
		name: "litchi",
		department: "unclassified"
	},
	{
		name: "green ginger",
		department: "unclassified"
	},
	{
		name: "cipollini",
		department: "unclassified"
	},
	{
		name: "anasazi beans",
		department: "unclassified"
	},
	{
		name: "deep-fried tofu",
		department: "unclassified"
	},
	{
		name: "Ghirardelli Chocolate",
		department: "unclassified"
	},
	{
		name: "Dove Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "wagon wheels",
		department: "unclassified"
	},
	{
		name: "melissa",
		department: "unclassified"
	},
	{
		name: "turkey pastrami",
		department: "unclassified"
	},
	{
		name: "suckling pig",
		department: "unclassified"
	},
	{
		name: "ox tongue",
		department: "unclassified"
	},
	{
		name: "bison meat",
		department: "unclassified"
	},
	{
		name: "beef kidney",
		department: "unclassified"
	},
	{
		name: "pears in light syrup",
		department: "unclassified"
	},
	{
		name: "peanut butter ice cream",
		department: "unclassified"
	},
	{
		name: "lapsang souchong tea",
		department: "unclassified"
	},
	{
		name: "carnation fat-free evaporated milk",
		department: "unclassified"
	},
	{
		name: "whole wheat cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat self-rising flour",
		department: "unclassified"
	},
	{
		name: "sweet tart crust",
		department: "unclassified"
	},
	{
		name: "lumpia skins",
		department: "unclassified"
	},
	{
		name: "cranberry liqueur",
		department: "unclassified"
	},
	{
		name: "plum water",
		department: "unclassified"
	},
	{
		name: "Reese's peanut butter chocolate spread",
		department: "unclassified"
	},
	{
		name: "Reese's spread",
		department: "unclassified"
	},
	{
		name: "Betty Crocker\\u2122 oatmeal cookie mix",
		department: "unclassified"
	},
	{
		name: "unbleached pastry flour",
		department: "unclassified"
	},
	{
		name: "pomfret",
		department: "unclassified"
	},
	{
		name: "frog",
		department: "unclassified"
	},
	{
		name: "hash brown patties",
		department: "unclassified"
	},
	{
		name: "baby fennel bulbs",
		department: "unclassified"
	},
	{
		name: "flowerets",
		department: "unclassified"
	},
	{
		name: "kochujang",
		department: "unclassified"
	},
	{
		name: "honeycomb tripe",
		department: "unclassified"
	},
	{
		name: "yellow rocket",
		department: "unclassified"
	},
	{
		name: "winter cress",
		department: "unclassified"
	},
	{
		name: "vegetable demi-glace",
		department: "unclassified"
	},
	{
		name: "Evan Williams Whiskey",
		department: "unclassified"
	},
	{
		name: "Evan Williams Kentucky Straight Bourbon Whiskey",
		department: "unclassified"
	},
	{
		name: "dried shallots",
		department: "unclassified"
	},
	{
		name: "purple yam",
		department: "unclassified"
	},
	{
		name: "Argo Baking Powder",
		department: "unclassified"
	},
	{
		name: "McCormick Garlic",
		department: "unclassified"
	},
	{
		name: "Pace Salsa",
		department: "unclassified"
	},
	{
		name: "opal basil",
		department: "unclassified"
	},
	{
		name: "finger chili",
		department: "unclassified"
	},
	{
		name: "baby beetroots",
		department: "unclassified"
	},
	{
		name: "home made chicken stock",
		department: "unclassified"
	},
	{
		name: "giblet stock",
		department: "unclassified"
	},
	{
		name: "walnut meal",
		department: "unclassified"
	},
	{
		name: "Peanut M&Ms",
		department: "unclassified"
	},
	{
		name: "turkey breast steaks",
		department: "unclassified"
	},
	{
		name: "smoked chorizo",
		department: "unclassified"
	},
	{
		name: "rock cornish hens",
		department: "unclassified"
	},
	{
		name: "roast deli turkey breast",
		department: "unclassified"
	},
	{
		name: "meat drippings",
		department: "unclassified"
	},
	{
		name: "deer meat",
		department: "unclassified"
	},
	{
		name: "loganberries",
		department: "unclassified"
	},
	{
		name: "sweet and sour cocktail mix",
		department: "unclassified"
	},
	{
		name: "firm cheese",
		department: "unclassified"
	},
	{
		name: "fat-free swiss cheese",
		department: "unclassified"
	},
	{
		name: "brick cheese",
		department: "unclassified"
	},
	{
		name: "whip it",
		department: "unclassified"
	},
	{
		name: "Monin",
		department: "unclassified"
	},
	{
		name: "coarse-grain salt",
		department: "unclassified"
	},
	{
		name: "basic vinaigrette",
		department: "unclassified"
	},
	{
		name: "gluten-free pancake mix",
		department: "unclassified"
	},
	{
		name: "whole wheat bread cubes",
		department: "unclassified"
	},
	{
		name: "sprouted grain bread",
		department: "unclassified"
	},
	{
		name: "rolled barley",
		department: "unclassified"
	},
	{
		name: "party rolls",
		department: "unclassified"
	},
	{
		name: "clear rum",
		department: "unclassified"
	},
	{
		name: "breakfast pork sausage",
		department: "unclassified"
	},
	{
		name: "Jameson Whiskey",
		department: "unclassified"
	},
	{
		name: "Crown Royal Whiskey",
		department: "unclassified"
	},
	{
		name: "hijiki",
		department: "unclassified"
	},
	{
		name: "angus",
		department: "unclassified"
	},
	{
		name: "shelled roasted pistachios",
		department: "unclassified"
	},
	{
		name: "sago pearls",
		department: "unclassified"
	},
	{
		name: "air dried beef",
		department: "unclassified"
	},
	{
		name: "slivovitz",
		department: "unclassified"
	},
	{
		name: "robiola",
		department: "unclassified"
	},
	{
		name: "hickory nuts",
		department: "unclassified"
	},
	{
		name: "banger",
		department: "unclassified"
	},
	{
		name: "durian",
		department: "unclassified"
	},
	{
		name: "strawberry sorbet",
		department: "unclassified"
	},
	{
		name: "pineapple chunks in natural juice",
		department: "unclassified"
	},
	{
		name: "flat cut",
		department: "unclassified"
	},
	{
		name: "pear puree",
		department: "unclassified"
	},
	{
		name: "plum schnapps",
		department: "unclassified"
	},
	{
		name: "stollen",
		department: "unclassified"
	},
	{
		name: "coconut sorbet",
		department: "unclassified"
	},
	{
		name: "framboise eau-de-vie",
		department: "unclassified"
	},
	{
		name: "celery cabbage",
		department: "unclassified"
	},
	{
		name: "coconut macaroons",
		department: "unclassified"
	},
	{
		name: "gurnard fillets",
		department: "unclassified"
	},
	{
		name: "strawberry lemonade",
		department: "unclassified"
	},
	{
		name: "ackee",
		department: "unclassified"
	},
	{
		name: "gourd",
		department: "unclassified"
	},
	{
		name: "multi-grain penne pasta",
		department: "unclassified"
	},
	{
		name: "KRAFT Singles",
		department: "unclassified"
	},
	{
		name: "clementine sections",
		department: "unclassified"
	},
	{
		name: "seeded bread",
		department: "unclassified"
	},
	{
		name: "Quaker Cruesli",
		department: "unclassified"
	},
	{
		name: "red currant juice",
		department: "unclassified"
	},
	{
		name: "pheasant fillets",
		department: "unclassified"
	},
	{
		name: "Libby's 100% Pure Pumpkin",
		department: "unclassified"
	},
	{
		name: "Libbys 100% Pure Pumpkin",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Butter",
		department: "unclassified"
	},
	{
		name: "Hershey''s Chocolate Bar",
		department: "unclassified"
	},
	{
		name: "Thai Kitchen Red Curry Paste",
		department: "unclassified"
	},
	{
		name: "Honey Nut Chex Cereal",
		department: "unclassified"
	},
	{
		name: "red endive",
		department: "unclassified"
	},
	{
		name: "potato nuggets",
		department: "unclassified"
	},
	{
		name: "onion sprouts",
		department: "unclassified"
	},
	{
		name: "low sodium garbanzo beans",
		department: "unclassified"
	},
	{
		name: "Skippy\\u00AE Super Chunk\\u00AE Peanut Butter",
		department: "unclassified"
	},
	{
		name: "broccoli raab",
		department: "unclassified"
	},
	{
		name: "vegetable base",
		department: "unclassified"
	},
	{
		name: "large pearl tapioca",
		department: "unclassified"
	},
	{
		name: "Hershey''s Chocolate",
		department: "unclassified"
	},
	{
		name: "meat-filled tortellini",
		department: "unclassified"
	},
	{
		name: "crunchy chow mein noodles",
		department: "unclassified"
	},
	{
		name: "royal olives",
		department: "unclassified"
	},
	{
		name: "turtle",
		department: "unclassified"
	},
	{
		name: "sliced meat",
		department: "unclassified"
	},
	{
		name: "beef loin tri-tip roast",
		department: "unclassified"
	},
	{
		name: "fat-free chocolate syrup",
		department: "unclassified"
	},
	{
		name: "seville orange juice",
		department: "unclassified"
	},
	{
		name: "Maxwell House Coffee",
		department: "unclassified"
	},
	{
		name: "nonfat instant powdered milk",
		department: "unclassified"
	},
	{
		name: "low-fat peach yogurt",
		department: "unclassified"
	},
	{
		name: "tandoori seasoning",
		department: "unclassified"
	},
	{
		name: "sweet bean paste",
		department: "unclassified"
	},
	{
		name: "sesame butter",
		department: "unclassified"
	},
	{
		name: "brown bean sauce",
		department: "unclassified"
	},
	{
		name: "barley miso",
		department: "unclassified"
	},
	{
		name: "Stove Top Lower Sodium Stuffing Mix for Chicken",
		department: "unclassified"
	},
	{
		name: "pancake flour",
		department: "unclassified"
	},
	{
		name: "Jiffy Baking Mix",
		department: "unclassified"
	},
	{
		name: "chapati flour",
		department: "unclassified"
	},
	{
		name: "brut",
		department: "unclassified"
	},
	{
		name: "borlotti",
		department: "unclassified"
	},
	{
		name: "ginseng",
		department: "unclassified"
	},
	{
		name: "buttermilk cornbread",
		department: "unclassified"
	},
	{
		name: "home fries",
		department: "unclassified"
	},
	{
		name: "mature cheese",
		department: "unclassified"
	},
	{
		name: "grana",
		department: "unclassified"
	},
	{
		name: "Podravka Vegeta",
		department: "unclassified"
	},
	{
		name: "blueberry topping",
		department: "unclassified"
	},
	{
		name: "boerensoepgroente",
		department: "unclassified"
	},
	{
		name: "canned sweet potatoes",
		department: "unclassified"
	},
	{
		name: "sea salt crystals",
		department: "unclassified"
	},
	{
		name: "piping gel",
		department: "unclassified"
	},
	{
		name: "capocollo",
		department: "unclassified"
	},
	{
		name: "goya sazon",
		department: "unclassified"
	},
	{
		name: "urad dal split",
		department: "unclassified"
	},
	{
		name: "lamb rumps",
		department: "unclassified"
	},
	{
		name: "sauce single cream",
		department: "unclassified"
	},
	{
		name: "BERTOLLI Pesto Verde",
		department: "unclassified"
	},
	{
		name: "Nielsen-Massey Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "cannoli",
		department: "unclassified"
	},
	{
		name: "mahleb",
		department: "unclassified"
	},
	{
		name: "genoise",
		department: "unclassified"
	},
	{
		name: "maui",
		department: "unclassified"
	},
	{
		name: "Cabot Pepper Jack",
		department: "unclassified"
	},
	{
		name: "smoked provolone cheese",
		department: "unclassified"
	},
	{
		name: "Bulleit Bourbon Frontier Whiskey",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Chicken Flavor Rice Sides\\u2122",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Chocolate Ice Cream",
		department: "unclassified"
	},
	{
		name: "beef tendons",
		department: "unclassified"
	},
	{
		name: "tupelo honey",
		department: "unclassified"
	},
	{
		name: "Italian-style bread",
		department: "unclassified"
	},
	{
		name: "olive oil spread",
		department: "unclassified"
	},
	{
		name: "roomyoghurt",
		department: "unclassified"
	},
	{
		name: "carbonara sauce",
		department: "unclassified"
	},
	{
		name: "frozen spring roll wrappers",
		department: "unclassified"
	},
	{
		name: "Life Cereal",
		department: "unclassified"
	},
	{
		name: "Dole Pineapple Slices",
		department: "unclassified"
	},
	{
		name: "chocolate buttercream frosting",
		department: "unclassified"
	},
	{
		name: "Better Than Bouillon Chicken Base",
		department: "unclassified"
	},
	{
		name: "Quaker Quick Oats",
		department: "unclassified"
	},
	{
		name: "Hellmann's Light Mayonnaise",
		department: "unclassified"
	},
	{
		name: "Sunny D Juice",
		department: "unclassified"
	},
	{
		name: "Del Monte Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "calendula flowers",
		department: "unclassified"
	},
	{
		name: "tofu sour cream",
		department: "unclassified"
	},
	{
		name: "Fruit Roll-ups\\u2122",
		department: "unclassified"
	},
	{
		name: "smoked eel",
		department: "unclassified"
	},
	{
		name: "mahlab",
		department: "unclassified"
	},
	{
		name: "tortiglioni",
		department: "unclassified"
	},
	{
		name: "dry lasagna",
		department: "unclassified"
	},
	{
		name: "dried lasagna",
		department: "unclassified"
	},
	{
		name: "shoulder meat",
		department: "unclassified"
	},
	{
		name: "organic turkey",
		department: "unclassified"
	},
	{
		name: "beef eye of round steak",
		department: "unclassified"
	},
	{
		name: "canned ham",
		department: "unclassified"
	},
	{
		name: "v 8",
		department: "unclassified"
	},
	{
		name: "Thai Kitchen Coconut Milk",
		department: "unclassified"
	},
	{
		name: "fat-free shredded cheddar cheese",
		department: "unclassified"
	},
	{
		name: "country crock calcium plus vitamin d",
		department: "unclassified"
	},
	{
		name: "steak marinade",
		department: "unclassified"
	},
	{
		name: "sesame seed paste",
		department: "unclassified"
	},
	{
		name: "low-fat spaghetti sauce",
		department: "unclassified"
	},
	{
		name: "Gebhardt Chili Powder",
		department: "unclassified"
	},
	{
		name: "multigrain cereal",
		department: "unclassified"
	},
	{
		name: "Cocoa-Puffs Cereal",
		department: "unclassified"
	},
	{
		name: "muffin batter",
		department: "unclassified"
	},
	{
		name: "Tuaca Liqueur",
		department: "unclassified"
	},
	{
		name: "non-alcoholic beer",
		department: "unclassified"
	},
	{
		name: "cubed pork",
		department: "unclassified"
	},
	{
		name: "reduced fat crumbled feta cheese",
		department: "unclassified"
	},
	{
		name: "extra virgin olive oil spray",
		department: "unclassified"
	},
	{
		name: "betel leaves",
		department: "unclassified"
	},
	{
		name: "cooked seafood",
		department: "unclassified"
	},
	{
		name: "french vermouth",
		department: "unclassified"
	},
	{
		name: "tuaca",
		department: "unclassified"
	},
	{
		name: "rooibos",
		department: "unclassified"
	},
	{
		name: "knackwurst",
		department: "unclassified"
	},
	{
		name: "seasoned ground turkey",
		department: "unclassified"
	},
	{
		name: "tortilla bowls",
		department: "unclassified"
	},
	{
		name: "first cut",
		department: "unclassified"
	},
	{
		name: "grapefruit vodka",
		department: "unclassified"
	},
	{
		name: "mixed berry fruit cocktail",
		department: "unclassified"
	},
	{
		name: "merguez",
		department: "unclassified"
	},
	{
		name: "kippers",
		department: "unclassified"
	},
	{
		name: "jasmine flowers",
		department: "unclassified"
	},
	{
		name: "cucumber vodka",
		department: "unclassified"
	},
	{
		name: "yellow heirloom tomatoes",
		department: "unclassified"
	},
	{
		name: "tiramisu",
		department: "unclassified"
	},
	{
		name: "carnaroli",
		department: "unclassified"
	},
	{
		name: "orchid",
		department: "unclassified"
	},
	{
		name: "whitebait",
		department: "unclassified"
	},
	{
		name: "Cabot Vermont Premium Cream Cheese",
		department: "unclassified"
	},
	{
		name: "Tyson Crispy Chicken Strips",
		department: "unclassified"
	},
	{
		name: "roasted eggplant",
		department: "unclassified"
	},
	{
		name: "rooster",
		department: "unclassified"
	},
	{
		name: "dairy whipped topping",
		department: "unclassified"
	},
	{
		name: "Cento Crushed Red Pepper",
		department: "unclassified"
	},
	{
		name: "sparkling lemonade",
		department: "unclassified"
	},
	{
		name: "taco tortilla chips",
		department: "unclassified"
	},
	{
		name: "cracker sticks",
		department: "unclassified"
	},
	{
		name: "sugar free gelatin",
		department: "unclassified"
	},
	{
		name: "chocolate bitters",
		department: "unclassified"
	},
	{
		name: "masago",
		department: "unclassified"
	},
	{
		name: "Dreamfields Penne Rigate",
		department: "unclassified"
	},
	{
		name: "Cool Whip Frosting",
		department: "unclassified"
	},
	{
		name: "Nesquik Hot Cocoa Mix",
		department: "unclassified"
	},
	{
		name: "Rotel Diced Tomatoes & Green Chilies",
		department: "unclassified"
	},
	{
		name: "Pure Wesson Vegetable Oil",
		department: "unclassified"
	},
	{
		name: "Baileys Coffee Creamer",
		department: "unclassified"
	},
	{
		name: "young leeks",
		department: "unclassified"
	},
	{
		name: "bean thread vermicelli",
		department: "unclassified"
	},
	{
		name: "soy paste",
		department: "unclassified"
	},
	{
		name: "potato soup",
		department: "unclassified"
	},
	{
		name: "College Inn Chicken Broth",
		department: "unclassified"
	},
	{
		name: "Campbell's Condensed Cream of Potato Soup",
		department: "unclassified"
	},
	{
		name: "low-fat cinnamon graham crackers",
		department: "unclassified"
	},
	{
		name: "gelatin dessert mix",
		department: "unclassified"
	},
	{
		name: "sea urchin",
		department: "unclassified"
	},
	{
		name: "quahog clams",
		department: "unclassified"
	},
	{
		name: "lamb cubes",
		department: "unclassified"
	},
	{
		name: "Buddig Beef",
		department: "unclassified"
	},
	{
		name: "green figs",
		department: "unclassified"
	},
	{
		name: "reduced fat vanilla ice cream",
		department: "unclassified"
	},
	{
		name: "oolong tea",
		department: "unclassified"
	},
	{
		name: "energy drink",
		department: "unclassified"
	},
	{
		name: "Earth Balance Natural Buttery Spread",
		department: "unclassified"
	},
	{
		name: "1% low-fat chocolate milk",
		department: "unclassified"
	},
	{
		name: "1% chocolate low-fat milk",
		department: "unclassified"
	},
	{
		name: "liquid gravy browner",
		department: "unclassified"
	},
	{
		name: "Kraft Light Mayonnaise",
		department: "unclassified"
	},
	{
		name: "kim chee",
		department: "unclassified"
	},
	{
		name: "garlic and herb seasoning mix",
		department: "unclassified"
	},
	{
		name: "whole bran cereal",
		department: "unclassified"
	},
	{
		name: "Cocoa Pebbles Cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat bread dough",
		department: "unclassified"
	},
	{
		name: "stuffing croutons",
		department: "unclassified"
	},
	{
		name: "refrigerated flaky buttermilk biscuits",
		department: "unclassified"
	},
	{
		name: "low-fat baking mix",
		department: "unclassified"
	},
	{
		name: "kosher wine",
		department: "unclassified"
	},
	{
		name: "gatorade",
		department: "unclassified"
	},
	{
		name: "Silk Vanilla Almondmilk",
		department: "unclassified"
	},
	{
		name: "hass",
		department: "unclassified"
	},
	{
		name: "claret",
		department: "unclassified"
	},
	{
		name: "bread and butter pickle slices",
		department: "unclassified"
	},
	{
		name: "pea tips",
		department: "unclassified"
	},
	{
		name: "Alt beer",
		department: "unclassified"
	},
	{
		name: "jamon serrano",
		department: "unclassified"
	},
	{
		name: "au jus gravy",
		department: "unclassified"
	},
	{
		name: "strawberry compote",
		department: "unclassified"
	},
	{
		name: "rabbit fillets",
		department: "unclassified"
	},
	{
		name: "roasting vegetables",
		department: "unclassified"
	},
	{
		name: "john dory",
		department: "unclassified"
	},
	{
		name: "bamboo leaves",
		department: "unclassified"
	},
	{
		name: "pigeon breasts",
		department: "unclassified"
	},
	{
		name: "okara",
		department: "unclassified"
	},
	{
		name: "blackcurrant jenever",
		department: "unclassified"
	},
	{
		name: "Fleischmann's pizza crust yeast",
		department: "unclassified"
	},
	{
		name: "manioc",
		department: "unclassified"
	},
	{
		name: "Nielsen-Massey Madagascar Bourbon Pure Vanilla Bean Paste",
		department: "unclassified"
	},
	{
		name: "white grapefruit juice",
		department: "unclassified"
	},
	{
		name: "venison fillet",
		department: "unclassified"
	},
	{
		name: "sugar free orange gelatin",
		department: "unclassified"
	},
	{
		name: "yellow apples",
		department: "unclassified"
	},
	{
		name: "2% low fat American cheese",
		department: "unclassified"
	},
	{
		name: "hangop",
		department: "unclassified"
	},
	{
		name: "strozzapreti",
		department: "unclassified"
	},
	{
		name: "shrimp scampi",
		department: "unclassified"
	},
	{
		name: "Conimex Atjar Tjampoer",
		department: "unclassified"
	},
	{
		name: "kataifi",
		department: "unclassified"
	},
	{
		name: "soy protein powder",
		department: "unclassified"
	},
	{
		name: "frozen onion rings",
		department: "unclassified"
	},
	{
		name: "unsweetened chestnut pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "Italian rice",
		department: "unclassified"
	},
	{
		name: "Roman Meal Bread",
		department: "unclassified"
	},
	{
		name: "soy protein isolate",
		department: "unclassified"
	},
	{
		name: "homemade beef broth",
		department: "unclassified"
	},
	{
		name: "Better Than Bouillon Beef Base",
		department: "unclassified"
	},
	{
		name: "savoiardi cookies",
		department: "unclassified"
	},
	{
		name: "milano cookies",
		department: "unclassified"
	},
	{
		name: "soft-shelled crabs",
		department: "unclassified"
	},
	{
		name: "king salmon",
		department: "unclassified"
	},
	{
		name: "whole wheat penne rigate",
		department: "unclassified"
	},
	{
		name: "valencia rice",
		department: "unclassified"
	},
	{
		name: "pasta tubes",
		department: "unclassified"
	},
	{
		name: "crispy chow mein noodles",
		department: "unclassified"
	},
	{
		name: "cooked rigatoni",
		department: "unclassified"
	},
	{
		name: "portuguese chorizo",
		department: "unclassified"
	},
	{
		name: "meat loaf",
		department: "unclassified"
	},
	{
		name: "liver sausage",
		department: "unclassified"
	},
	{
		name: "arm roast",
		department: "unclassified"
	},
	{
		name: "unsweetened iced tea",
		department: "unclassified"
	},
	{
		name: "pandan juice",
		department: "unclassified"
	},
	{
		name: "chai tea concentrate",
		department: "unclassified"
	},
	{
		name: "parmigiana",
		department: "unclassified"
	},
	{
		name: "low-fat lemon yogurt",
		department: "unclassified"
	},
	{
		name: "Morton Kosher Salt",
		department: "unclassified"
	},
	{
		name: "mostarda",
		department: "unclassified"
	},
	{
		name: "Jif Peanut Butter",
		department: "unclassified"
	},
	{
		name: "jerk paste",
		department: "unclassified"
	},
	{
		name: "bottled balsamic vinaigrette",
		department: "unclassified"
	},
	{
		name: "special k",
		department: "unclassified"
	},
	{
		name: "whole wheat hoagie rolls",
		department: "unclassified"
	},
	{
		name: "whole wheat dinner rolls",
		department: "unclassified"
	},
	{
		name: "spring roll skins",
		department: "unclassified"
	},
	{
		name: "shredded phyllo dough",
		department: "unclassified"
	},
	{
		name: "masa dough",
		department: "unclassified"
	},
	{
		name: "manioc flour",
		department: "unclassified"
	},
	{
		name: "crumbled corn bread",
		department: "unclassified"
	},
	{
		name: "berry sugar",
		department: "unclassified"
	},
	{
		name: "passion fruit liqueur",
		department: "unclassified"
	},
	{
		name: "Hendricks Gin",
		department: "unclassified"
	},
	{
		name: "hop shoots",
		department: "unclassified"
	},
	{
		name: "apricot fruit spread",
		department: "unclassified"
	},
	{
		name: "apricot compote",
		department: "unclassified"
	},
	{
		name: "almond cookies",
		department: "unclassified"
	},
	{
		name: "yu choy",
		department: "unclassified"
	},
	{
		name: "kangkong",
		department: "unclassified"
	},
	{
		name: "chat",
		department: "unclassified"
	},
	{
		name: "green maraschino cherries",
		department: "unclassified"
	},
	{
		name: "single malt Scotch",
		department: "unclassified"
	},
	{
		name: "galette",
		department: "unclassified"
	},
	{
		name: "hot pepper rings",
		department: "unclassified"
	},
	{
		name: "tomato coulis",
		department: "unclassified"
	},
	{
		name: "calamari rings",
		department: "unclassified"
	},
	{
		name: "edible gold dust",
		department: "unclassified"
	},
	{
		name: "Bombay Sapphire Dry Gin",
		department: "unclassified"
	},
	{
		name: "stone flower",
		department: "unclassified"
	},
	{
		name: "kalpaasi",
		department: "unclassified"
	},
	{
		name: "Conimex Woksaus Teriyaki Honing",
		department: "unclassified"
	},
	{
		name: "spicy salami",
		department: "unclassified"
	},
	{
		name: "onion bagels",
		department: "unclassified"
	},
	{
		name: "venison stew meat",
		department: "unclassified"
	},
	{
		name: "knox",
		department: "unclassified"
	},
	{
		name: "gumbo file powder",
		department: "unclassified"
	},
	{
		name: "blue agave nectar",
		department: "unclassified"
	},
	{
		name: "pennette",
		department: "unclassified"
	},
	{
		name: "fat free fromage frais",
		department: "unclassified"
	},
	{
		name: "garlic vinegar",
		department: "unclassified"
	},
	{
		name: "paratha",
		department: "unclassified"
	},
	{
		name: "baking caramels",
		department: "unclassified"
	},
	{
		name: "labne",
		department: "unclassified"
	},
	{
		name: "creme brulee",
		department: "unclassified"
	},
	{
		name: "cr\\u00E8me br\\u00FBl\\u00E9e",
		department: "unclassified"
	},
	{
		name: "gluten free barbecue sauce",
		department: "unclassified"
	},
	{
		name: "jerk",
		department: "unclassified"
	},
	{
		name: "lamb bone",
		department: "unclassified"
	},
	{
		name: "Conimex Boemboe Bahmi Goreng",
		department: "unclassified"
	},
	{
		name: "sugar free chocolate",
		department: "unclassified"
	},
	{
		name: "blackcurrant syrup",
		department: "unclassified"
	},
	{
		name: "chicken noodle soup mix",
		department: "unclassified"
	},
	{
		name: "frozen mashed potatoes",
		department: "unclassified"
	},
	{
		name: "sugar free instant pudding mix",
		department: "unclassified"
	},
	{
		name: "chocolate flavored liquor",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Roasted Red Peppers",
		department: "unclassified"
	},
	{
		name: "Tuttorosso Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "Old El Paso Green Chiles",
		department: "unclassified"
	},
	{
		name: "Sara Lee Pound Cake",
		department: "unclassified"
	},
	{
		name: "Franks Wings Sauce",
		department: "unclassified"
	},
	{
		name: "Diamond of California Pecans",
		department: "unclassified"
	},
	{
		name: "Fisher Pecans",
		department: "unclassified"
	},
	{
		name: "Yoplait Yogurt",
		department: "unclassified"
	},
	{
		name: "Progresso Bread Crumbs",
		department: "unclassified"
	},
	{
		name: "Nakano Rice Vinegar",
		department: "unclassified"
	},
	{
		name: "yellow chives",
		department: "unclassified"
	},
	{
		name: "regular cucumber",
		department: "unclassified"
	},
	{
		name: "long green",
		department: "unclassified"
	},
	{
		name: "garlic sprouts",
		department: "unclassified"
	},
	{
		name: "dried funghi porcini",
		department: "unclassified"
	},
	{
		name: "regular chicken broth",
		department: "unclassified"
	},
	{
		name: "low sodium tomato soup",
		department: "unclassified"
	},
	{
		name: "heath bar",
		department: "unclassified"
	},
	{
		name: "dried chestnuts",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE PERFECT PORTIONS\\u00AE Boneless, Skinless Chicken Breast, All Natural",
		department: "unclassified"
	},
	{
		name: "small shells",
		department: "unclassified"
	},
	{
		name: "enriched white rice",
		department: "unclassified"
	},
	{
		name: "noilly prat",
		department: "unclassified"
	},
	{
		name: "young turkey",
		department: "unclassified"
	},
	{
		name: "wild turkey",
		department: "unclassified"
	},
	{
		name: "turkey parts",
		department: "unclassified"
	},
	{
		name: "Flatout\\u00AE Foldit Artisan Flatbreads",
		department: "unclassified"
	},
	{
		name: "stewing hen",
		department: "unclassified"
	},
	{
		name: "calf feet",
		department: "unclassified"
	},
	{
		name: "aspic",
		department: "unclassified"
	},
	{
		name: "cherry soda",
		department: "unclassified"
	},
	{
		name: "assam",
		department: "unclassified"
	},
	{
		name: "nonfat lemon yogurt",
		department: "unclassified"
	},
	{
		name: "tikka paste",
		department: "unclassified"
	},
	{
		name: "reduced sodium ketchup",
		department: "unclassified"
	},
	{
		name: "mojo marinade",
		department: "unclassified"
	},
	{
		name: "classic vinaigrette",
		department: "unclassified"
	},
	{
		name: "Fruit Loops Cereal",
		department: "unclassified"
	},
	{
		name: "sucralose sweetener",
		department: "unclassified"
	},
	{
		name: "Robin Hood All-Purpose Flour",
		department: "unclassified"
	},
	{
		name: "nut meal",
		department: "unclassified"
	},
	{
		name: "Corn Flakes Crumbs",
		department: "unclassified"
	},
	{
		name: "brat buns",
		department: "unclassified"
	},
	{
		name: "berry pie filling",
		department: "unclassified"
	},
	{
		name: "demerara rum",
		department: "unclassified"
	},
	{
		name: "paccheri",
		department: "unclassified"
	},
	{
		name: "whoopie pie",
		department: "unclassified"
	},
	{
		name: "banana blossom",
		department: "unclassified"
	},
	{
		name: "citrus glaze",
		department: "unclassified"
	},
	{
		name: "dried Black Mission figs",
		department: "unclassified"
	},
	{
		name: "purple asparagus",
		department: "unclassified"
	},
	{
		name: "empanada",
		department: "unclassified"
	},
	{
		name: "apricot puree",
		department: "unclassified"
	},
	{
		name: "morcilla",
		department: "unclassified"
	},
	{
		name: "granita",
		department: "unclassified"
	},
	{
		name: "bacon cubes",
		department: "unclassified"
	},
	{
		name: "italian vermouth",
		department: "unclassified"
	},
	{
		name: "guinea fowl fillets",
		department: "unclassified"
	},
	{
		name: "romanesco florets",
		department: "unclassified"
	},
	{
		name: "pineapple topping",
		department: "unclassified"
	},
	{
		name: "Italian soda",
		department: "unclassified"
	},
	{
		name: "Greek black olives",
		department: "unclassified"
	},
	{
		name: "picholine",
		department: "unclassified"
	},
	{
		name: "florida avocado",
		department: "unclassified"
	},
	{
		name: "light lager",
		department: "unclassified"
	},
	{
		name: "wholemeal buns",
		department: "unclassified"
	},
	{
		name: "mini pita rounds",
		department: "unclassified"
	},
	{
		name: "orange jelly",
		department: "unclassified"
	},
	{
		name: "Jersey Royal new potatoes",
		department: "unclassified"
	},
	{
		name: "huitlacoche",
		department: "unclassified"
	},
	{
		name: "sprouted almonds",
		department: "unclassified"
	},
	{
		name: "pale lager",
		department: "unclassified"
	},
	{
		name: "crown roast of pork",
		department: "unclassified"
	},
	{
		name: "refried pinto beans",
		department: "unclassified"
	},
	{
		name: "christmas lima beans",
		department: "unclassified"
	},
	{
		name: "christmas limas",
		department: "unclassified"
	},
	{
		name: "mustard soup",
		department: "unclassified"
	},
	{
		name: "fennel salad",
		department: "unclassified"
	},
	{
		name: "goat cheese rolls",
		department: "unclassified"
	},
	{
		name: "hash seasoning mix",
		department: "unclassified"
	},
	{
		name: "Goya Black Beans",
		department: "unclassified"
	},
	{
		name: "Fresh Express Baby Spinach",
		department: "unclassified"
	},
	{
		name: "Randall Great Northern Beans",
		department: "unclassified"
	},
	{
		name: "Wright Brand Bacon",
		department: "unclassified"
	},
	{
		name: "Kelapo Coconut Oil",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Baking Cocoa",
		department: "unclassified"
	},
	{
		name: "Toll House Cocoa",
		department: "unclassified"
	},
	{
		name: "White Lily Flour",
		department: "unclassified"
	},
	{
		name: "Cabot Vermont Sour Cream",
		department: "unclassified"
	},
	{
		name: "blintz",
		department: "unclassified"
	},
	{
		name: "blintzes",
		department: "unclassified"
	},
	{
		name: "McCormick Ground Nutmeg",
		department: "unclassified"
	},
	{
		name: "white lentils",
		department: "unclassified"
	},
	{
		name: "verbena",
		department: "unclassified"
	},
	{
		name: "upland cress",
		department: "unclassified"
	},
	{
		name: "sweet soy",
		department: "unclassified"
	},
	{
		name: "Organic Baby Carrots",
		department: "unclassified"
	},
	{
		name: "california chile",
		department: "unclassified"
	},
	{
		name: "vegetable stock base",
		department: "unclassified"
	},
	{
		name: "low sodium chicken bouillon cubes",
		department: "unclassified"
	},
	{
		name: "homemade turkey broth",
		department: "unclassified"
	},
	{
		name: "Planters Pecan Pieces",
		department: "unclassified"
	},
	{
		name: "Planters Pecan Halves",
		department: "unclassified"
	},
	{
		name: "muscovy",
		department: "unclassified"
	},
	{
		name: "crab salad",
		department: "unclassified"
	},
	{
		name: "ziti rigate",
		department: "unclassified"
	},
	{
		name: "turkey burgers",
		department: "unclassified"
	},
	{
		name: "sandwich meat",
		department: "unclassified"
	},
	{
		name: "pork heart",
		department: "unclassified"
	},
	{
		name: "pork tail",
		department: "unclassified"
	},
	{
		name: "pig tail",
		department: "unclassified"
	},
	{
		name: "low-fat sausage",
		department: "unclassified"
	},
	{
		name: "chopped cooked meat",
		department: "unclassified"
	},
	{
		name: "calf meat",
		department: "unclassified"
	},
	{
		name: "Baker's German's Sweet Chocolate Baking Bar",
		department: "unclassified"
	},
	{
		name: "bayonne ham",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Pasta Sides\\u2122 - Chicken flavor",
		department: "unclassified"
	},
	{
		name: "orange puree",
		department: "unclassified"
	},
	{
		name: "Ortega Green Chilies",
		department: "unclassified"
	},
	{
		name: "Red Bull Energy Drink",
		department: "unclassified"
	},
	{
		name: "plain seltzer",
		department: "unclassified"
	},
	{
		name: "lipton tea bags",
		department: "unclassified"
	},
	{
		name: "nonfat half-and-half",
		department: "unclassified"
	},
	{
		name: "non-fat half-and-half",
		department: "unclassified"
	},
	{
		name: "non dairy cheese",
		department: "unclassified"
	},
	{
		name: "natural low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "umeboshi paste",
		department: "unclassified"
	},
	{
		name: "McCormick Rosemary Leaves",
		department: "unclassified"
	},
	{
		name: "dry enchilada mix",
		department: "unclassified"
	},
	{
		name: "Oat Bran Cereal",
		department: "unclassified"
	},
	{
		name: "honeycomb cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat pastry",
		department: "unclassified"
	},
	{
		name: "meringue shells",
		department: "unclassified"
	},
	{
		name: "french sandwich rolls",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Brownie Mix",
		department: "unclassified"
	},
	{
		name: "Tanqueray Gin",
		department: "unclassified"
	},
	{
		name: "snickerdoodle",
		department: "unclassified"
	},
	{
		name: "cherimoya",
		department: "unclassified"
	},
	{
		name: "capuchin cress blossom",
		department: "unclassified"
	},
	{
		name: "black chanterelle",
		department: "unclassified"
	},
	{
		name: "whole farro",
		department: "unclassified"
	},
	{
		name: "lemon jam",
		department: "unclassified"
	},
	{
		name: "roe deer fillets",
		department: "unclassified"
	},
	{
		name: "dry-cured sausages",
		department: "unclassified"
	},
	{
		name: "aardappelgolfjes",
		department: "unclassified"
	},
	{
		name: "tex-mex shredded cheese",
		department: "unclassified"
	},
	{
		name: "Jordan almonds",
		department: "unclassified"
	},
	{
		name: "daiquiri concentrate",
		department: "unclassified"
	},
	{
		name: "china grass",
		department: "unclassified"
	},
	{
		name: "soy cream",
		department: "unclassified"
	},
	{
		name: "just whites",
		department: "unclassified"
	},
	{
		name: "Domino Granulated Sugar",
		department: "unclassified"
	},
	{
		name: "century eggs",
		department: "unclassified"
	},
	{
		name: "halvah",
		department: "unclassified"
	},
	{
		name: "pepper vodka",
		department: "unclassified"
	},
	{
		name: "duxelles",
		department: "unclassified"
	},
	{
		name: "tarama",
		department: "unclassified"
	},
	{
		name: "boerenyoghurt",
		department: "unclassified"
	},
	{
		name: "Dale's Steak Seasoning",
		department: "unclassified"
	},
	{
		name: "jamaica",
		department: "unclassified"
	},
	{
		name: "pepperocini",
		department: "unclassified"
	},
	{
		name: "veal sweetbreads",
		department: "unclassified"
	},
	{
		name: "Breyers\\u2122 Hot Fudge Ice Cream Sauce",
		department: "unclassified"
	},
	{
		name: "ketjap marinade",
		department: "unclassified"
	},
	{
		name: "curry sauce mix",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Light Dressing",
		department: "unclassified"
	},
	{
		name: "turkey chili",
		department: "unclassified"
	},
	{
		name: "wheat biscuits",
		department: "unclassified"
	},
	{
		name: "beef carpaccio",
		department: "unclassified"
	},
	{
		name: "pea soup",
		department: "unclassified"
	},
	{
		name: "Breakstone's Temp Tee Whipped Cream Cheese",
		department: "unclassified"
	},
	{
		name: "karashi",
		department: "unclassified"
	},
	{
		name: "purple bell peppers",
		department: "unclassified"
	},
	{
		name: "Imperial Sugar Dark Brown Sugar",
		department: "unclassified"
	},
	{
		name: "Dole Pineapple",
		department: "unclassified"
	},
	{
		name: "Johnny's Seasoning Salt",
		department: "unclassified"
	},
	{
		name: "Spice Islands Ground Cumin Seed",
		department: "unclassified"
	},
	{
		name: "sweet dumpling squash",
		department: "unclassified"
	},
	{
		name: "pepperoncino",
		department: "unclassified"
	},
	{
		name: "KRAFT 2% Milk Shredded Sharp Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "japanese pumpkin",
		department: "unclassified"
	},
	{
		name: "dried cornhusks",
		department: "unclassified"
	},
	{
		name: "Godiva Dark Chocolate Bar",
		department: "unclassified"
	},
	{
		name: "pompano",
		department: "unclassified"
	},
	{
		name: "98% fat free condensed cream of mushroom soup",
		department: "unclassified"
	},
	{
		name: "cream of rice",
		department: "unclassified"
	},
	{
		name: "veal leg",
		department: "unclassified"
	},
	{
		name: "round tip steak",
		department: "unclassified"
	},
	{
		name: "mild italian turkey sausage",
		department: "unclassified"
	},
	{
		name: "boneless pot roast",
		department: "unclassified"
	},
	{
		name: "ogen melon",
		department: "unclassified"
	},
	{
		name: "low-fat eggnog",
		department: "unclassified"
	},
	{
		name: "Lipton Lemon Iced Tea Mix",
		department: "unclassified"
	},
	{
		name: "english breakfast tea",
		department: "unclassified"
	},
	{
		name: "nonfat cheddar cheese",
		department: "unclassified"
	},
	{
		name: "low-fat tasty cheese",
		department: "unclassified"
	},
	{
		name: "low-fat goat cheese",
		department: "unclassified"
	},
	{
		name: "drawn butter",
		department: "unclassified"
	},
	{
		name: "tart filling",
		department: "unclassified"
	},
	{
		name: "sweet bean sauce",
		department: "unclassified"
	},
	{
		name: "meat marinade",
		department: "unclassified"
	},
	{
		name: "marrons",
		department: "unclassified"
	},
	{
		name: "low sodium ketchup",
		department: "unclassified"
	},
	{
		name: "Adobo All Purpose Seasoning",
		department: "unclassified"
	},
	{
		name: "sodium free baking powder",
		department: "unclassified"
	},
	{
		name: "quick bread mix",
		department: "unclassified"
	},
	{
		name: "prepared brownies",
		department: "unclassified"
	},
	{
		name: "pain au levain",
		department: "unclassified"
	},
	{
		name: "Domino Light Brown Sugar",
		department: "unclassified"
	},
	{
		name: "spanish brandy",
		department: "unclassified"
	},
	{
		name: "Southern Comfort Liqueur",
		department: "unclassified"
	},
	{
		name: "plum brandy",
		department: "unclassified"
	},
	{
		name: "passover wine",
		department: "unclassified"
	},
	{
		name: "muscatel",
		department: "unclassified"
	},
	{
		name: "Malbec",
		department: "unclassified"
	},
	{
		name: "mustard seed cheese",
		department: "unclassified"
	},
	{
		name: "medium whole wheat tortillas",
		department: "unclassified"
	},
	{
		name: "tandoori masala mix",
		department: "unclassified"
	},
	{
		name: "Dole Bananas",
		department: "unclassified"
	},
	{
		name: "multigrain tortillas",
		department: "unclassified"
	},
	{
		name: "banana flower",
		department: "unclassified"
	},
	{
		name: "comino",
		department: "unclassified"
	},
	{
		name: "low sodium gluten free soy sauce",
		department: "unclassified"
	},
	{
		name: "spicy ranch salad dressing",
		department: "unclassified"
	},
	{
		name: "cherry topping",
		department: "unclassified"
	},
	{
		name: "salmon loins",
		department: "unclassified"
	},
	{
		name: "hare legs",
		department: "unclassified"
	},
	{
		name: "hazenbouten",
		department: "unclassified"
	},
	{
		name: "cuervo especial gold",
		department: "unclassified"
	},
	{
		name: "unagi",
		department: "unclassified"
	},
	{
		name: "pastakaas",
		department: "unclassified"
	},
	{
		name: "KRAFT Shredded Colby & Monterey Jack Cheese",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Fiesta Sides\\u2122 - Mexican Rice",
		department: "unclassified"
	},
	{
		name: "granular sucrolose sweetener",
		department: "unclassified"
	},
	{
		name: "mini vegetables",
		department: "unclassified"
	},
	{
		name: "baby vegetables",
		department: "unclassified"
	},
	{
		name: "pear vinegar",
		department: "unclassified"
	},
	{
		name: "Italian sweet peppers",
		department: "unclassified"
	},
	{
		name: "honey liqueur",
		department: "unclassified"
	},
	{
		name: "spot prawns",
		department: "unclassified"
	},
	{
		name: "California spot prawns",
		department: "unclassified"
	},
	{
		name: "Alaskan prawns",
		department: "unclassified"
	},
	{
		name: "Norway lobster tails",
		department: "unclassified"
	},
	{
		name: "arepa",
		department: "unclassified"
	},
	{
		name: "montrachet",
		department: "unclassified"
	},
	{
		name: "Neapolitan ice cream",
		department: "unclassified"
	},
	{
		name: "honey gold potatoes",
		department: "unclassified"
	},
	{
		name: "lilac",
		department: "unclassified"
	},
	{
		name: "fudge icing",
		department: "unclassified"
	},
	{
		name: "Smirnoff Vodka",
		department: "unclassified"
	},
	{
		name: "sweet tea vodka",
		department: "unclassified"
	},
	{
		name: "rundersoepballetjes",
		department: "unclassified"
	},
	{
		name: "tilsit cheese",
		department: "unclassified"
	},
	{
		name: "mace blades",
		department: "unclassified"
	},
	{
		name: "vegetable bouillon granules",
		department: "unclassified"
	},
	{
		name: "beef stew seasoning mix",
		department: "unclassified"
	},
	{
		name: "Breyers\\u2122 Caramel Flavored Ice Cream Sauce",
		department: "unclassified"
	},
	{
		name: "curry mix",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Puff Pastry Cups",
		department: "unclassified"
	},
	{
		name: "Wish-Bone\\u00AE Robusto Italian Dressing",
		department: "unclassified"
	},
	{
		name: "strawberry milk",
		department: "unclassified"
	},
	{
		name: "large brown eggs",
		department: "unclassified"
	},
	{
		name: "whole wheat tortilla wraps",
		department: "unclassified"
	},
	{
		name: "lime marmalade",
		department: "unclassified"
	},
	{
		name: "Camargue rice",
		department: "unclassified"
	},
	{
		name: "vegan bacon",
		department: "unclassified"
	},
	{
		name: "wagyu",
		department: "unclassified"
	},
	{
		name: "Lifeway Kefir",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Italian Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Ortega Taco Seasoning",
		department: "unclassified"
	},
	{
		name: "Jones Dairy Farm Canadian Bacon",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Premier White Morsels",
		department: "unclassified"
	},
	{
		name: "Nestle White Morsels",
		department: "unclassified"
	},
	{
		name: "Old El Paso Taco Shells",
		department: "unclassified"
	},
	{
		name: "wild asparagus",
		department: "unclassified"
	},
	{
		name: "matsutake mushrooms",
		department: "unclassified"
	},
	{
		name: "lotus leaves",
		department: "unclassified"
	},
	{
		name: "ground meat substitute",
		department: "unclassified"
	},
	{
		name: "Swanson Beef Broth",
		department: "unclassified"
	},
	{
		name: "Campbell's Condensed Broccoli Cheese Soup",
		department: "unclassified"
	},
	{
		name: "red licorice laces",
		department: "unclassified"
	},
	{
		name: "spanish mackerel",
		department: "unclassified"
	},
	{
		name: "amberjack fillet",
		department: "unclassified"
	},
	{
		name: "amaranth seeds",
		department: "unclassified"
	},
	{
		name: "skinless chicken fillets",
		department: "unclassified"
	},
	{
		name: "roast meat",
		department: "unclassified"
	},
	{
		name: "low-fat smoked sausage",
		department: "unclassified"
	},
	{
		name: "irish bacon",
		department: "unclassified"
	},
	{
		name: "Ambrosia apple",
		department: "unclassified"
	},
	{
		name: "wonton noodles",
		department: "unclassified"
	},
	{
		name: "vegetable cocktail",
		department: "unclassified"
	},
	{
		name: "Country Time  Lemonade",
		department: "unclassified"
	},
	{
		name: "black cherry soda",
		department: "unclassified"
	},
	{
		name: "nonfat parmesan cheese",
		department: "unclassified"
	},
	{
		name: "jamaican curry powder",
		department: "unclassified"
	},
	{
		name: "gum paste",
		department: "unclassified"
	},
	{
		name: "dende oil",
		department: "unclassified"
	},
	{
		name: "burrito seasoning mix",
		department: "unclassified"
	},
	{
		name: "crushed cereal",
		department: "unclassified"
	},
	{
		name: "crusty buns",
		department: "unclassified"
	},
	{
		name: "amber agave nectar",
		department: "unclassified"
	},
	{
		name: "fruit brandy",
		department: "unclassified"
	},
	{
		name: "Budweiser",
		department: "unclassified"
	},
	{
		name: "dragees",
		department: "unclassified"
	},
	{
		name: "apple jam",
		department: "unclassified"
	},
	{
		name: "garganelli",
		department: "unclassified"
	},
	{
		name: "favas",
		department: "unclassified"
	},
	{
		name: "spot",
		department: "unclassified"
	},
	{
		name: "turkey strips",
		department: "unclassified"
	},
	{
		name: "apricot wedges",
		department: "unclassified"
	},
	{
		name: "condensed cream of asparagus soup",
		department: "unclassified"
	},
	{
		name: "caribou",
		department: "unclassified"
	},
	{
		name: "unsalted creamy peanut butter",
		department: "unclassified"
	},
	{
		name: "reduced fat olive oil mayonnaise",
		department: "unclassified"
	},
	{
		name: "watermelon vodka",
		department: "unclassified"
	},
	{
		name: "conchigliette",
		department: "unclassified"
	},
	{
		name: "tomato basil feta",
		department: "unclassified"
	},
	{
		name: "fresh masa",
		department: "unclassified"
	},
	{
		name: "moringa powder",
		department: "unclassified"
	},
	{
		name: "Irish Red ale",
		department: "unclassified"
	},
	{
		name: "boy choy",
		department: "unclassified"
	},
	{
		name: "viola",
		department: "unclassified"
	},
	{
		name: "viola flowers",
		department: "unclassified"
	},
	{
		name: "hamburger potato buns",
		department: "unclassified"
	},
	{
		name: "raki",
		department: "unclassified"
	},
	{
		name: "hung curds",
		department: "unclassified"
	},
	{
		name: "Pillsbury Grands! Jr. Golden Layers refrigerated buttermilk biscuits",
		department: "unclassified"
	},
	{
		name: "blended whiskey",
		department: "unclassified"
	},
	{
		name: "game stock",
		department: "unclassified"
	},
	{
		name: "BACARDI\\u00AE Lim\\u00F3n",
		department: "unclassified"
	},
	{
		name: "chicken breast deli meat",
		department: "unclassified"
	},
	{
		name: "Irish butter",
		department: "unclassified"
	},
	{
		name: "Cabot Alpine Cheddar",
		department: "unclassified"
	},
	{
		name: "Prego Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "crepe batter",
		department: "unclassified"
	},
	{
		name: "pastry filling",
		department: "unclassified"
	},
	{
		name: "extra light mayonnaise",
		department: "unclassified"
	},
	{
		name: "Hunts Tomato Sauce",
		department: "unclassified"
	},
	{
		name: "sea lavender",
		department: "unclassified"
	},
	{
		name: "medlars",
		department: "unclassified"
	},
	{
		name: "lentil soup",
		department: "unclassified"
	},
	{
		name: "nacho cheese tortilla chips",
		department: "unclassified"
	},
	{
		name: "pork roll",
		department: "unclassified"
	},
	{
		name: "fat free salad dressing",
		department: "unclassified"
	},
	{
		name: "nonfat American cheese",
		department: "unclassified"
	},
	{
		name: "new mexico red chile",
		department: "unclassified"
	},
	{
		name: "McCormick Dill Weed",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Marinated Artichoke Hearts",
		department: "unclassified"
	},
	{
		name: "Diamond of California Walnuts",
		department: "unclassified"
	},
	{
		name: "Hormel Black Label Bacon",
		department: "unclassified"
	},
	{
		name: "Kettle Potato Chips",
		department: "unclassified"
	},
	{
		name: "Vegeta Seasoning",
		department: "unclassified"
	},
	{
		name: "Canada Dry Sparkling Seltzer Water",
		department: "unclassified"
	},
	{
		name: "Holland House White Cooking Wine",
		department: "unclassified"
	},
	{
		name: "Tuttorosso Crushed Tomatoes",
		department: "unclassified"
	},
	{
		name: "garlic greens",
		department: "unclassified"
	},
	{
		name: "chinese black bean",
		department: "unclassified"
	},
	{
		name: "broccoflower",
		department: "unclassified"
	},
	{
		name: "Flatout\\u00AE Flatbread Artisan Thin Pizza Crusts",
		department: "unclassified"
	},
	{
		name: "non-fat frozen whipped topping",
		department: "unclassified"
	},
	{
		name: "clam chowder",
		department: "unclassified"
	},
	{
		name: "nabisco triscuits",
		department: "unclassified"
	},
	{
		name: "shrimp chips",
		department: "unclassified"
	},
	{
		name: "shrimp crackers",
		department: "unclassified"
	},
	{
		name: "texmati rice",
		department: "unclassified"
	},
	{
		name: "precooked rice",
		department: "unclassified"
	},
	{
		name: "shoulder pot roast",
		department: "unclassified"
	},
	{
		name: "turkey patties",
		department: "unclassified"
	},
	{
		name: "turkey burger patties",
		department: "unclassified"
	},
	{
		name: "elk meat",
		department: "unclassified"
	},
	{
		name: "chateaubriand",
		department: "unclassified"
	},
	{
		name: "33% less sodium ham",
		department: "unclassified"
	},
	{
		name: "mexican lime",
		department: "unclassified"
	},
	{
		name: "apple pear",
		department: "unclassified"
	},
	{
		name: "low-fat coffee ice cream",
		department: "unclassified"
	},
	{
		name: "coffee low-fat ice cream",
		department: "unclassified"
	},
	{
		name: "Ocean Spray Cranberry Juice Cocktail",
		department: "unclassified"
	},
	{
		name: "Lipton Green Tea with Mandarin Orange Flavor Pyramid Tea Bag",
		department: "unclassified"
	},
	{
		name: "velveeta cheese melted",
		department: "unclassified"
	},
	{
		name: "I Can't Believe It's Not Butter!\\u00AE Light Spread",
		department: "unclassified"
	},
	{
		name: "liquid non-dairy creamer",
		department: "unclassified"
	},
	{
		name: "soy-based liquid seasoning",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Chili Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "black currant jelly",
		department: "unclassified"
	},
	{
		name: "annatto paste",
		department: "unclassified"
	},
	{
		name: "gluten-free cereal",
		department: "unclassified"
	},
	{
		name: "Banana Nut Crunch Cereal",
		department: "unclassified"
	},
	{
		name: "yellow cupcakes",
		department: "unclassified"
	},
	{
		name: "water chestnut flour",
		department: "unclassified"
	},
	{
		name: "sourdough buns",
		department: "unclassified"
	},
	{
		name: "pineapple pie filling",
		department: "unclassified"
	},
	{
		name: "low-fat graham cracker crust",
		department: "unclassified"
	},
	{
		name: "low-fat brownie mix",
		department: "unclassified"
	},
	{
		name: "italian sandwich rolls",
		department: "unclassified"
	},
	{
		name: "invert sugar",
		department: "unclassified"
	},
	{
		name: "crusty italian rolls",
		department: "unclassified"
	},
	{
		name: "syrah",
		department: "unclassified"
	},
	{
		name: "hard wheat berries",
		department: "unclassified"
	},
	{
		name: "poffertjesmix",
		department: "unclassified"
	},
	{
		name: "frozen popcorn chicken",
		department: "unclassified"
	},
	{
		name: "cubed salami",
		department: "unclassified"
	},
	{
		name: "glace de viande",
		department: "unclassified"
	},
	{
		name: "pomegranate vodka",
		department: "unclassified"
	},
	{
		name: "Godiva Liqueur",
		department: "unclassified"
	},
	{
		name: "couscous mix",
		department: "unclassified"
	},
	{
		name: "chocolate balls",
		department: "unclassified"
	},
	{
		name: "bruschetta topping",
		department: "unclassified"
	},
	{
		name: "ground chicken thighs",
		department: "unclassified"
	},
	{
		name: "chermoula",
		department: "unclassified"
	},
	{
		name: "jim beam",
		department: "unclassified"
	},
	{
		name: "roasted asparagus",
		department: "unclassified"
	},
	{
		name: "arak",
		department: "unclassified"
	},
	{
		name: "graviera",
		department: "unclassified"
	},
	{
		name: "garlic herb goat cheese",
		department: "unclassified"
	},
	{
		name: "prosciutto fat",
		department: "unclassified"
	},
	{
		name: "jujube",
		department: "unclassified"
	},
	{
		name: "Chinese date",
		department: "unclassified"
	},
	{
		name: "Silk Unsweetened Coconutmilk",
		department: "unclassified"
	},
	{
		name: "veal heart",
		department: "unclassified"
	},
	{
		name: "rolled rye",
		department: "unclassified"
	},
	{
		name: "chervil stalks",
		department: "unclassified"
	},
	{
		name: "Country Crock\\u00AE Simply Delicious",
		department: "unclassified"
	},
	{
		name: "instant corn masa flour",
		department: "unclassified"
	},
	{
		name: "edible gold stars",
		department: "unclassified"
	},
	{
		name: "canned snails",
		department: "unclassified"
	},
	{
		name: "cranberry vodka",
		department: "unclassified"
	},
	{
		name: "Rodelle Pure Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "roerbakrijst",
		department: "unclassified"
	},
	{
		name: "chocolate muffin",
		department: "unclassified"
	},
	{
		name: "whipped frosting",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Lean Ground Turkey",
		department: "unclassified"
	},
	{
		name: "Silk Vanilla Dairy-Free Yogurt Alternative",
		department: "unclassified"
	},
	{
		name: "KNORR Basis Chinapfanne",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Whole Milk Ricotta Cheese",
		department: "unclassified"
	},
	{
		name: "fat free red wine vinaigrette",
		department: "unclassified"
	},
	{
		name: "lobster base",
		department: "unclassified"
	},
	{
		name: "chicory roots",
		department: "unclassified"
	},
	{
		name: "La Choy Soy Sauce",
		department: "unclassified"
	},
	{
		name: "Colman's Mustard Powder",
		department: "unclassified"
	},
	{
		name: "cavaillon melon",
		department: "unclassified"
	},
	{
		name: "charentais melon",
		department: "unclassified"
	},
	{
		name: "frozen mixed fruit",
		department: "unclassified"
	},
	{
		name: "cherry fruit spread",
		department: "unclassified"
	},
	{
		name: "unsalted matzos",
		department: "unclassified"
	},
	{
		name: "boneless skinless chicken thigh fillets",
		department: "unclassified"
	},
	{
		name: "Hormel Real Bacon Pieces",
		department: "unclassified"
	},
	{
		name: "Filippo Berio Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "A&W Root Beer",
		department: "unclassified"
	},
	{
		name: "Johnsonville Kielbasa",
		department: "unclassified"
	},
	{
		name: "pea beans",
		department: "unclassified"
	},
	{
		name: "lemon cucumber",
		department: "unclassified"
	},
	{
		name: "kashmiri chile",
		department: "unclassified"
	},
	{
		name: "recipe crumbles",
		department: "unclassified"
	},
	{
		name: "Town House Crackers",
		department: "unclassified"
	},
	{
		name: "stock fish",
		department: "unclassified"
	},
	{
		name: "coho salmon",
		department: "unclassified"
	},
	{
		name: "barramundi",
		department: "unclassified"
	},
	{
		name: "thin rice stick noodles",
		department: "unclassified"
	},
	{
		name: "dried soba",
		department: "unclassified"
	},
	{
		name: "ditali",
		department: "unclassified"
	},
	{
		name: "asian rice noodles",
		department: "unclassified"
	},
	{
		name: "picnic ham",
		department: "unclassified"
	},
	{
		name: "low-fat kielbasa",
		department: "unclassified"
	},
	{
		name: "low-fat ham",
		department: "unclassified"
	},
	{
		name: "diet root beer",
		department: "unclassified"
	},
	{
		name: "triple cream cheese",
		department: "unclassified"
	},
	{
		name: "shredded low-fat cheddar",
		department: "unclassified"
	},
	{
		name: "fat-free blueberry yogurt",
		department: "unclassified"
	},
	{
		name: "brummel and brown spread",
		department: "unclassified"
	},
	{
		name: "palm vinegar",
		department: "unclassified"
	},
	{
		name: "olivada",
		department: "unclassified"
	},
	{
		name: "mellow miso",
		department: "unclassified"
	},
	{
		name: "meat loaf mix",
		department: "unclassified"
	},
	{
		name: "low-fat marinara sauce",
		department: "unclassified"
	},
	{
		name: "low-fat balsamic vinaigrette",
		department: "unclassified"
	},
	{
		name: "Bertolli Garlic Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "basil mayonnaise",
		department: "unclassified"
	},
	{
		name: "Bertolli\\u00AE Extra Light in Taste Olive Oil",
		department: "unclassified"
	},
	{
		name: "almond glaze",
		department: "unclassified"
	},
	{
		name: "ready-to-eat cereal",
		department: "unclassified"
	},
	{
		name: "irish oats",
		department: "unclassified"
	},
	{
		name: "Corn Pops Cereal",
		department: "unclassified"
	},
	{
		name: "submarine buns",
		department: "unclassified"
	},
	{
		name: "Pillsbury Hot Roll Mix",
		department: "unclassified"
	},
	{
		name: "low-fat biscuit mix",
		department: "unclassified"
	},
	{
		name: "crumb mixture",
		department: "unclassified"
	},
	{
		name: "Everclear Grain Alcohol",
		department: "unclassified"
	},
	{
		name: "hamburger bacon",
		department: "unclassified"
	},
	{
		name: "baby red beets",
		department: "unclassified"
	},
	{
		name: "Apfelkorn",
		department: "unclassified"
	},
	{
		name: "pomegranate vinaigrette dressing",
		department: "unclassified"
	},
	{
		name: "Mazola\\u00AE Chicken Flavor Bouillon Powder",
		department: "unclassified"
	},
	{
		name: "strawberry rhubarb jam",
		department: "unclassified"
	},
	{
		name: "Simply Potatoes Diced Potatoes with Onion",
		department: "unclassified"
	},
	{
		name: "mastic gum",
		department: "unclassified"
	},
	{
		name: "Kraft Shredded Mild Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "chinese leaf",
		department: "unclassified"
	},
	{
		name: "eye round roast",
		department: "unclassified"
	},
	{
		name: "boquerones",
		department: "unclassified"
	},
	{
		name: "eiswein",
		department: "unclassified"
	},
	{
		name: "smoked rashers",
		department: "unclassified"
	},
	{
		name: "elderflower concentrate",
		department: "unclassified"
	},
	{
		name: "superfine white sugar",
		department: "unclassified"
	},
	{
		name: "chinese spinach",
		department: "unclassified"
	},
	{
		name: "wheat meal",
		department: "unclassified"
	},
	{
		name: "veal back",
		department: "unclassified"
	},
	{
		name: "Thai chili garlic sauce",
		department: "unclassified"
	},
	{
		name: "cheddar cheese crackers",
		department: "unclassified"
	},
	{
		name: "ginger brew",
		department: "unclassified"
	},
	{
		name: "compound chocolate",
		department: "unclassified"
	},
	{
		name: "kudzu",
		department: "unclassified"
	},
	{
		name: "honeybells",
		department: "unclassified"
	},
	{
		name: "pumpkinseed kernels",
		department: "unclassified"
	},
	{
		name: "mocha liqueur",
		department: "unclassified"
	},
	{
		name: "quail breasts",
		department: "unclassified"
	},
	{
		name: "italian essence",
		department: "unclassified"
	},
	{
		name: "viognier",
		department: "unclassified"
	},
	{
		name: "celery salad",
		department: "unclassified"
	},
	{
		name: "stroopwafel",
		department: "unclassified"
	},
	{
		name: "fat free vanilla ice cream",
		department: "unclassified"
	},
	{
		name: "gumbo",
		department: "unclassified"
	},
	{
		name: "vruchtenhagel",
		department: "unclassified"
	},
	{
		name: "sablefish",
		department: "unclassified"
	},
	{
		name: "queso asadero",
		department: "unclassified"
	},
	{
		name: "bisquik",
		department: "unclassified"
	},
	{
		name: "terasi",
		department: "unclassified"
	},
	{
		name: "wafer ice cream cones",
		department: "unclassified"
	},
	{
		name: "rasam powder",
		department: "unclassified"
	},
	{
		name: "lapsang souchong",
		department: "unclassified"
	},
	{
		name: "fowl",
		department: "unclassified"
	},
	{
		name: "cracked farro",
		department: "unclassified"
	},
	{
		name: "dried apple slices",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Mild Italian Sausage",
		department: "unclassified"
	},
	{
		name: "red wine sauce",
		department: "unclassified"
	},
	{
		name: "red bell pepper coulis",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Cinnamon",
		department: "unclassified"
	},
	{
		name: "raw blue agave nectar",
		department: "unclassified"
	},
	{
		name: "Enjoy Life Semi-Sweet Chocolate Chips",
		department: "unclassified"
	},
	{
		name: "half fat cr\\u00E8me fraiche",
		department: "unclassified"
	},
	{
		name: "earl grey teabags",
		department: "unclassified"
	},
	{
		name: "Spice Islands Ground Nutmeg",
		department: "unclassified"
	},
	{
		name: "wokgarnalen",
		department: "unclassified"
	},
	{
		name: "beef bacon",
		department: "unclassified"
	},
	{
		name: "mild banana pepper rings",
		department: "unclassified"
	},
	{
		name: "matzo ball mix",
		department: "unclassified"
	},
	{
		name: "Green Giant Whole Kernel Sweet Corn",
		department: "unclassified"
	},
	{
		name: "Dole Baby Spinach",
		department: "unclassified"
	},
	{
		name: "Hershey''s Cookies",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Sun Dried Tomatoes",
		department: "unclassified"
	},
	{
		name: "McCormick Taco Seasoning",
		department: "unclassified"
	},
	{
		name: "StarKist Tuna",
		department: "unclassified"
	},
	{
		name: "Butterball Turkey Bacon",
		department: "unclassified"
	},
	{
		name: "Old El Paso Taco Sauce",
		department: "unclassified"
	},
	{
		name: "Reese's Mini Pieces",
		department: "unclassified"
	},
	{
		name: "alkaline water",
		department: "unclassified"
	},
	{
		name: "El Yucateco Hot Sauce",
		department: "unclassified"
	},
	{
		name: "Spice Islands Medium Grind Black Pepper",
		department: "unclassified"
	},
	{
		name: "Simply Organic Cinnamon",
		department: "unclassified"
	},
	{
		name: "tree ear mushrooms",
		department: "unclassified"
	},
	{
		name: "low-fat tofu",
		department: "unclassified"
	},
	{
		name: "fermented bean curd",
		department: "unclassified"
	},
	{
		name: "nonfat vanilla soymilk",
		department: "unclassified"
	},
	{
		name: "non-fat vanilla soy milk",
		department: "unclassified"
	},
	{
		name: "Swanson Vegetable Broth",
		department: "unclassified"
	},
	{
		name: "honey graham",
		department: "unclassified"
	},
	{
		name: "apricot pits",
		department: "unclassified"
	},
	{
		name: "brownie chunks",
		department: "unclassified"
	},
	{
		name: "skate wing fillets",
		department: "unclassified"
	},
	{
		name: "porgy",
		department: "unclassified"
	},
	{
		name: "nova",
		department: "unclassified"
	},
	{
		name: "maine lobster meat",
		department: "unclassified"
	},
	{
		name: "butterfish",
		department: "unclassified"
	},
	{
		name: "dried ziti",
		department: "unclassified"
	},
	{
		name: "cannelloni shells",
		department: "unclassified"
	},
	{
		name: "turkey sausage patties",
		department: "unclassified"
	},
	{
		name: "smoked bratwurst",
		department: "unclassified"
	},
	{
		name: "Johnsonville Italian Sausage",
		department: "unclassified"
	},
	{
		name: "cubed meat",
		department: "unclassified"
	},
	{
		name: "chicken pan drippings",
		department: "unclassified"
	},
	{
		name: "chicken drippings",
		department: "unclassified"
	},
	{
		name: "longan",
		department: "unclassified"
	},
	{
		name: "lipton green tea",
		department: "unclassified"
	},
	{
		name: "Lipton Green Tea",
		department: "unclassified"
	},
	{
		name: "jasmine tea leaves",
		department: "unclassified"
	},
	{
		name: "jasmine green tea",
		department: "unclassified"
	},
	{
		name: "beefeater",
		department: "unclassified"
	},
	{
		name: "myzithra",
		department: "unclassified"
	},
	{
		name: "manouri cheese",
		department: "unclassified"
	},
	{
		name: "low-fat custard",
		department: "unclassified"
	},
	{
		name: "Kerrygold Pure Irish Butter",
		department: "unclassified"
	},
	{
		name: "clabbered cream",
		department: "unclassified"
	},
	{
		name: "teriyaki baste",
		department: "unclassified"
	},
	{
		name: "rock candy syrup",
		department: "unclassified"
	},
	{
		name: "prune butter",
		department: "unclassified"
	},
	{
		name: "enchilada seasoning",
		department: "unclassified"
	},
	{
		name: "bacon ranch dressing",
		department: "unclassified"
	},
	{
		name: "whole wheat flake cereal",
		department: "unclassified"
	},
	{
		name: "fruit loops",
		department: "unclassified"
	},
	{
		name: "won ton skins",
		department: "unclassified"
	},
	{
		name: "whole wheat flat bread",
		department: "unclassified"
	},
	{
		name: "whole wheat croutons",
		department: "unclassified"
	},
	{
		name: "sweet hawaiian rolls",
		department: "unclassified"
	},
	{
		name: "low-fat fudge brownie mix",
		department: "unclassified"
	},
	{
		name: "pinot blanc",
		department: "unclassified"
	},
	{
		name: "apple jack",
		department: "unclassified"
	},
	{
		name: "imitation vanilla flavoring",
		department: "unclassified"
	},
	{
		name: "Noilly Prat Vermouth",
		department: "unclassified"
	},
	{
		name: "meat fats",
		department: "unclassified"
	},
	{
		name: "stracchino",
		department: "unclassified"
	},
	{
		name: "Belvedere Vodka",
		department: "unclassified"
	},
	{
		name: "gluten free chocolate cake mix",
		department: "unclassified"
	},
	{
		name: "fern",
		department: "unclassified"
	},
	{
		name: "italian vegetable mix",
		department: "unclassified"
	},
	{
		name: "tomato basil soup",
		department: "unclassified"
	},
	{
		name: "kangaroo",
		department: "unclassified"
	},
	{
		name: "baby pattypan squash",
		department: "unclassified"
	},
	{
		name: "val",
		department: "unclassified"
	},
	{
		name: "kashk",
		department: "unclassified"
	},
	{
		name: "milk bread",
		department: "unclassified"
	},
	{
		name: "licorice whips",
		department: "unclassified"
	},
	{
		name: "fat free blue cheese dressing",
		department: "unclassified"
	},
	{
		name: "ratatouille vegetable mix",
		department: "unclassified"
	},
	{
		name: "Foster Farms chicken thighs",
		department: "unclassified"
	},
	{
		name: "chrysanthemum leaves",
		department: "unclassified"
	},
	{
		name: "gai choy",
		department: "unclassified"
	},
	{
		name: "Chinese mustard greens",
		department: "unclassified"
	},
	{
		name: "Russian Standard Vodka",
		department: "unclassified"
	},
	{
		name: "peeled crushed tomatoes",
		department: "unclassified"
	},
	{
		name: "herb sprig",
		department: "unclassified"
	},
	{
		name: "wafer rolls",
		department: "unclassified"
	},
	{
		name: "graffiti eggplants",
		department: "unclassified"
	},
	{
		name: "cucumber peel",
		department: "unclassified"
	},
	{
		name: "scone mix",
		department: "unclassified"
	},
	{
		name: "laver",
		department: "unclassified"
	},
	{
		name: "ijsgarnalen",
		department: "unclassified"
	},
	{
		name: "ricard",
		department: "unclassified"
	},
	{
		name: "fire roasted tomatoes with chilies",
		department: "unclassified"
	},
	{
		name: "Conimex Kruidenmix voor Bahmi",
		department: "unclassified"
	},
	{
		name: "tomato bouillon",
		department: "unclassified"
	},
	{
		name: "mini doughnuts",
		department: "unclassified"
	},
	{
		name: "long-grain and wild rice blend",
		department: "unclassified"
	},
	{
		name: "canton noodles",
		department: "unclassified"
	},
	{
		name: "Jagermeister Liqueur",
		department: "unclassified"
	},
	{
		name: "sesame rolls",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Extra Lean Ground Turkey Breast",
		department: "unclassified"
	},
	{
		name: "Ragu Traditional Sauce",
		department: "unclassified"
	},
	{
		name: "sparkling apple juice",
		department: "unclassified"
	},
	{
		name: "chicken liver p\\u00E2t\\u00E9",
		department: "unclassified"
	},
	{
		name: "onion pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "Bertolli Pastasaus Knoflook",
		department: "unclassified"
	},
	{
		name: "Spice Islands Oregano",
		department: "unclassified"
	},
	{
		name: "Heinz Apple Cider Vinegar",
		department: "unclassified"
	},
	{
		name: "Kraft Mild Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "Kikkoman Less Sodium Soy Sauce",
		department: "unclassified"
	},
	{
		name: "chicken chorizo sausages",
		department: "unclassified"
	},
	{
		name: "whole grain thin spaghetti",
		department: "unclassified"
	},
	{
		name: "red horseradish",
		department: "unclassified"
	},
	{
		name: "McCormick Smoked Paprika",
		department: "unclassified"
	},
	{
		name: "S&W Black Beans",
		department: "unclassified"
	},
	{
		name: "Quorn Chik''n Tenders",
		department: "unclassified"
	},
	{
		name: "Johnsonville Andouille",
		department: "unclassified"
	},
	{
		name: "Dreamfields Rotini",
		department: "unclassified"
	},
	{
		name: "La Choy Chow Mein Noodles",
		department: "unclassified"
	},
	{
		name: "Dr Pepper Soda",
		department: "unclassified"
	},
	{
		name: "Dr. Pepper Soda",
		department: "unclassified"
	},
	{
		name: "Monk Fruit in the Raw\\u00AE",
		department: "unclassified"
	},
	{
		name: "Adobo All-Purpose Seasoning",
		department: "unclassified"
	},
	{
		name: "Claussen Sauerkraut",
		department: "unclassified"
	},
	{
		name: "herb cream cheese",
		department: "unclassified"
	},
	{
		name: "Diamond of California Pecan Halves",
		department: "unclassified"
	},
	{
		name: "Dole Pineapple Tidbits",
		department: "unclassified"
	},
	{
		name: "thai ginger",
		department: "unclassified"
	},
	{
		name: "small green chile",
		department: "unclassified"
	},
	{
		name: "shanghai bok choy",
		department: "unclassified"
	},
	{
		name: "new mexican chile",
		department: "unclassified"
	},
	{
		name: "green soybeans",
		department: "unclassified"
	},
	{
		name: "dried rose hips",
		department: "unclassified"
	},
	{
		name: "Contadina Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "boniato",
		department: "unclassified"
	},
	{
		name: "low-fat chicken stock",
		department: "unclassified"
	},
	{
		name: "low-fat beef broth",
		department: "unclassified"
	},
	{
		name: "toffee bar",
		department: "unclassified"
	},
	{
		name: "Godiva Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Ghirardelli Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "custard mix",
		department: "unclassified"
	},
	{
		name: "yellowtail snapper fillets",
		department: "unclassified"
	},
	{
		name: "rock lobster",
		department: "unclassified"
	},
	{
		name: "lumpfish roe",
		department: "unclassified"
	},
	{
		name: "king crab",
		department: "unclassified"
	},
	{
		name: "whole wheat ziti",
		department: "unclassified"
	},
	{
		name: "taglierini",
		department: "unclassified"
	},
	{
		name: "mini ravioli",
		department: "unclassified"
	},
	{
		name: "locatelli",
		department: "unclassified"
	},
	{
		name: "veal liver",
		department: "unclassified"
	},
	{
		name: "shank end",
		department: "unclassified"
	},
	{
		name: "round tip roast",
		department: "unclassified"
	},
	{
		name: "pork drippings",
		department: "unclassified"
	},
	{
		name: "fresh bacon",
		department: "unclassified"
	},
	{
		name: "elk",
		department: "unclassified"
	},
	{
		name: "center cut pork roast",
		department: "unclassified"
	},
	{
		name: "breast of lamb",
		department: "unclassified"
	},
	{
		name: "braunschweiger",
		department: "unclassified"
	},
	{
		name: "pineapple chunks in natural juice, drained",
		department: "unclassified"
	},
	{
		name: "mixed citrus peel",
		department: "unclassified"
	},
	{
		name: "empire apple",
		department: "unclassified"
	},
	{
		name: "candied mixed citrus peel",
		department: "unclassified"
	},
	{
		name: "McCormick Taco Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "thai tea leaves",
		department: "unclassified"
	},
	{
		name: "Lipton\\u00AE Iced Tea Brew Family Size Tea Bags",
		department: "unclassified"
	},
	{
		name: "jasmine tea bags",
		department: "unclassified"
	},
	{
		name: "instant cocoa mix",
		department: "unclassified"
	},
	{
		name: "cola beverage",
		department: "unclassified"
	},
	{
		name: "queso fresca",
		department: "unclassified"
	},
	{
		name: "chestnut cream",
		department: "unclassified"
	},
	{
		name: "wine yeast",
		department: "unclassified"
	},
	{
		name: "vegetable dip",
		department: "unclassified"
	},
	{
		name: "Philadelphia Cooking Creme",
		department: "unclassified"
	},
	{
		name: "pan gravy",
		department: "unclassified"
	},
	{
		name: "Open Pit Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "mustard glaze",
		department: "unclassified"
	},
	{
		name: "mole paste",
		department: "unclassified"
	},
	{
		name: "McCormick Cloves",
		department: "unclassified"
	},
	{
		name: "liquid certo",
		department: "unclassified"
	},
	{
		name: "french vinaigrette",
		department: "unclassified"
	},
	{
		name: "whole wheat pancake mix",
		department: "unclassified"
	},
	{
		name: "nutlike cereal",
		department: "unclassified"
	},
	{
		name: "multigrain hot cereal",
		department: "unclassified"
	},
	{
		name: "krusteaz",
		department: "unclassified"
	},
	{
		name: "whole wheat pita rounds",
		department: "unclassified"
	},
	{
		name: "rice malt",
		department: "unclassified"
	},
	{
		name: "low-fat whole wheat tortillas",
		department: "unclassified"
	},
	{
		name: "green decorating gel",
		department: "unclassified"
	},
	{
		name: "gluten free cake mix",
		department: "unclassified"
	},
	{
		name: "crusty sub rolls",
		department: "unclassified"
	},
	{
		name: "baking ammonia",
		department: "unclassified"
	},
	{
		name: "yellowtail",
		department: "unclassified"
	},
	{
		name: "rhine wine",
		department: "unclassified"
	},
	{
		name: "pizza dough mix",
		department: "unclassified"
	},
	{
		name: "Blue Moon Beer",
		department: "unclassified"
	},
	{
		name: "goo",
		department: "unclassified"
	},
	{
		name: "dark lager",
		department: "unclassified"
	},
	{
		name: "boneless strip steak",
		department: "unclassified"
	},
	{
		name: "danish blue",
		department: "unclassified"
	},
	{
		name: "nocello",
		department: "unclassified"
	},
	{
		name: "cinnamon raisin bagels",
		department: "unclassified"
	},
	{
		name: "cinnamon liqueur",
		department: "unclassified"
	},
	{
		name: "Parrano cheese",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Original Breakfast Sausage",
		department: "unclassified"
	},
	{
		name: "recao",
		department: "unclassified"
	},
	{
		name: "apple compote",
		department: "unclassified"
	},
	{
		name: "refrigerated bread dough",
		department: "unclassified"
	},
	{
		name: "pistachio cream",
		department: "unclassified"
	},
	{
		name: "sausage slices",
		department: "unclassified"
	},
	{
		name: "yogurt covered pretzels",
		department: "unclassified"
	},
	{
		name: "cherry schnapps",
		department: "unclassified"
	},
	{
		name: "monk fruit",
		department: "unclassified"
	},
	{
		name: "vegetable balls",
		department: "unclassified"
	},
	{
		name: "Finlandia Vodka",
		department: "unclassified"
	},
	{
		name: "hamachi",
		department: "unclassified"
	},
	{
		name: "kala jeera",
		department: "unclassified"
	},
	{
		name: "natto",
		department: "unclassified"
	},
	{
		name: "pork sausage patties",
		department: "unclassified"
	},
	{
		name: "full-flavored molasses",
		department: "unclassified"
	},
	{
		name: "Tipo 0 flour",
		department: "unclassified"
	},
	{
		name: "0 flour",
		department: "unclassified"
	},
	{
		name: "ngo gai",
		department: "unclassified"
	},
	{
		name: "sourdough english muffins",
		department: "unclassified"
	},
	{
		name: "tamari almonds",
		department: "unclassified"
	},
	{
		name: "fruit schnapps",
		department: "unclassified"
	},
	{
		name: "pork tenderloin medallions",
		department: "unclassified"
	},
	{
		name: "roasted almond oil",
		department: "unclassified"
	},
	{
		name: "mush",
		department: "unclassified"
	},
	{
		name: "Indian spice",
		department: "unclassified"
	},
	{
		name: "strawberry coulis",
		department: "unclassified"
	},
	{
		name: "Pomegranate Wine",
		department: "unclassified"
	},
	{
		name: "thick curds",
		department: "unclassified"
	},
	{
		name: "pitted Spanish olives",
		department: "unclassified"
	},
	{
		name: "komatsuna",
		department: "unclassified"
	},
	{
		name: "canned carrots",
		department: "unclassified"
	},
	{
		name: "crinkle cut carrots",
		department: "unclassified"
	},
	{
		name: "instant decaffeinated coffee",
		department: "unclassified"
	},
	{
		name: "baby purple potatoes",
		department: "unclassified"
	},
	{
		name: "finnan haddie",
		department: "unclassified"
	},
	{
		name: "garlic dill pickles",
		department: "unclassified"
	},
	{
		name: "kalamata olive oil",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Plain Cream Cheese",
		department: "unclassified"
	},
	{
		name: "soy cream cheese",
		department: "unclassified"
	},
	{
		name: "Mezzetta Deli-Sliced Hot Jalape\\u00F1o Pepper Rings",
		department: "unclassified"
	},
	{
		name: "ridge cut potato chips",
		department: "unclassified"
	},
	{
		name: "crinkle cut potato chips",
		department: "unclassified"
	},
	{
		name: "wavy potato chips",
		department: "unclassified"
	},
	{
		name: "feijoa",
		department: "unclassified"
	},
	{
		name: "smoked pork chop",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Semi-Sweet Chocolate Mini Morsels",
		department: "unclassified"
	},
	{
		name: "sel gris",
		department: "unclassified"
	},
	{
		name: "Sabra\\u00AE Guacamole",
		department: "unclassified"
	},
	{
		name: "Grey Poupon Honey Mustard",
		department: "unclassified"
	},
	{
		name: "Shake 'N Bake Seasoned Panko Coating Mix",
		department: "unclassified"
	},
	{
		name: "SHAKE \\u2018N BAKE Panko Seasoned Coating Mix",
		department: "unclassified"
	},
	{
		name: "low fat cool whip",
		department: "unclassified"
	},
	{
		name: "popcorn chicken",
		department: "unclassified"
	},
	{
		name: "low-fat vanilla soy milk",
		department: "unclassified"
	},
	{
		name: "cream of asparagus soup",
		department: "unclassified"
	},
	{
		name: "king prawn tails",
		department: "unclassified"
	},
	{
		name: "orange marinade",
		department: "unclassified"
	},
	{
		name: "diced candied citron",
		department: "unclassified"
	},
	{
		name: "gluten free white bread",
		department: "unclassified"
	},
	{
		name: "Sierra Mist",
		department: "unclassified"
	},
	{
		name: "Sierra Mist Soda",
		department: "unclassified"
	},
	{
		name: "Kraft Lite Ranch Dressing",
		department: "unclassified"
	},
	{
		name: "Kraft Reduced Fat Ranch Mayonnaise",
		department: "unclassified"
	},
	{
		name: "Cento Chick Peas",
		department: "unclassified"
	},
	{
		name: "Best Food's Mayonnaise with Lime Juice",
		department: "unclassified"
	},
	{
		name: "Kerrygold Aged Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "Contadina Tomato Paste",
		department: "unclassified"
	},
	{
		name: "Spice Islands Italian Herb Seasoning",
		department: "unclassified"
	},
	{
		name: "blackcurrant juice",
		department: "unclassified"
	},
	{
		name: "Kraft Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "orange pekoe tea",
		department: "unclassified"
	},
	{
		name: "taartgelei",
		department: "unclassified"
	},
	{
		name: "beef neck",
		department: "unclassified"
	},
	{
		name: "turkey breakfast sausage links",
		department: "unclassified"
	},
	{
		name: "frozen pizza",
		department: "unclassified"
	},
	{
		name: "nonfat mozzarella cheese",
		department: "unclassified"
	},
	{
		name: "English-cut short ribs",
		department: "unclassified"
	},
	{
		name: "konbu dashi",
		department: "unclassified"
	},
	{
		name: "Dreamfields Angel Hair",
		department: "unclassified"
	},
	{
		name: "Old El Paso Tostada Shells",
		department: "unclassified"
	},
	{
		name: "Progresso Artichoke Hearts",
		department: "unclassified"
	},
	{
		name: "Doritos Chips",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Pepperoni",
		department: "unclassified"
	},
	{
		name: "Slap Ya Mama Cajun Seasoning",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Gel Food Colors",
		department: "unclassified"
	},
	{
		name: "Simply Organic Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "Heinz Worcestershire Sauce",
		department: "unclassified"
	},
	{
		name: "Herdez Salsa Casera",
		department: "unclassified"
	},
	{
		name: "Thomas English Muffins",
		department: "unclassified"
	},
	{
		name: "Del Monte Green Beans",
		department: "unclassified"
	},
	{
		name: "Athens Fillo Dough",
		department: "unclassified"
	},
	{
		name: "Goya Seasoning",
		department: "unclassified"
	},
	{
		name: "Rhodes White Dinner Rolls",
		department: "unclassified"
	},
	{
		name: "prepared cr\\u00EApes",
		department: "unclassified"
	},
	{
		name: "yaki-nori",
		department: "unclassified"
	},
	{
		name: "flat leaf",
		department: "unclassified"
	},
	{
		name: "sodium free chicken stock",
		department: "unclassified"
	},
	{
		name: "Lindt Chocolate",
		department: "unclassified"
	},
	{
		name: "Cadbury Chocolate",
		department: "unclassified"
	},
	{
		name: "baccala",
		department: "unclassified"
	},
	{
		name: "Alaska halibut",
		department: "unclassified"
	},
	{
		name: "tubettini",
		department: "unclassified"
	},
	{
		name: "top ramen",
		department: "unclassified"
	},
	{
		name: "broken vermicelli",
		department: "unclassified"
	},
	{
		name: "acini di pepe",
		department: "unclassified"
	},
	{
		name: "Virginia Baked Ham",
		department: "unclassified"
	},
	{
		name: "pork loin rib chops",
		department: "unclassified"
	},
	{
		name: "pickled pork",
		department: "unclassified"
	},
	{
		name: "ostrich",
		department: "unclassified"
	},
	{
		name: "eye of round steak",
		department: "unclassified"
	},
	{
		name: "breaded chicken fillets",
		department: "unclassified"
	},
	{
		name: "boneless chops",
		department: "unclassified"
	},
	{
		name: "alligator",
		department: "unclassified"
	},
	{
		name: "chocolate chip cookie dough ice cream",
		department: "unclassified"
	},
	{
		name: "satsuma juice",
		department: "unclassified"
	},
	{
		name: "instant breakfast drink mix",
		department: "unclassified"
	},
	{
		name: "mimolette cheese",
		department: "unclassified"
	},
	{
		name: "low-fat blueberry yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat American cheese",
		department: "unclassified"
	},
	{
		name: "earth balance whipped spread",
		department: "unclassified"
	},
	{
		name: "Nestle Carnation Lowfat 2% Evaporated Milk",
		department: "unclassified"
	},
	{
		name: "cabrales",
		department: "unclassified"
	},
	{
		name: "BREAKSTONE'S Sour Cream",
		department: "unclassified"
	},
	{
		name: "violet syrup",
		department: "unclassified"
	},
	{
		name: "umeboshi plum vinegar",
		department: "unclassified"
	},
	{
		name: "ume vinegar",
		department: "unclassified"
	},
	{
		name: "Ragu Cheesy Roasted Garlic Parmesan Sauce",
		department: "unclassified"
	},
	{
		name: "nonfat thousand island dressing",
		department: "unclassified"
	},
	{
		name: "McCormick Cream of Tartar",
		department: "unclassified"
	},
	{
		name: "McCormick Bay Leaves",
		department: "unclassified"
	},
	{
		name: "maple vinaigrette",
		department: "unclassified"
	},
	{
		name: "low sodium chili sauce",
		department: "unclassified"
	},
	{
		name: "dried majoram",
		department: "unclassified"
	},
	{
		name: "dried lime powder",
		department: "unclassified"
	},
	{
		name: "chinese red vinegar",
		department: "unclassified"
	},
	{
		name: "ancho puree",
		department: "unclassified"
	},
	{
		name: "Krusteaz Pancake Mix",
		department: "unclassified"
	},
	{
		name: "unfrosted cupcakes",
		department: "unclassified"
	},
	{
		name: "pumpernickel flour",
		department: "unclassified"
	},
	{
		name: "melba rounds",
		department: "unclassified"
	},
	{
		name: "butter cookie dough",
		department: "unclassified"
	},
	{
		name: "pure grain alcohol",
		department: "unclassified"
	},
	{
		name: "Newcastle Brown Ale",
		department: "unclassified"
	},
	{
		name: "Amarula Liqueur",
		department: "unclassified"
	},
	{
		name: "vegan chicken flavored bouillon",
		department: "unclassified"
	},
	{
		name: "torta rolls",
		department: "unclassified"
	},
	{
		name: "wattleseed",
		department: "unclassified"
	},
	{
		name: "dried Bird's eye chilies",
		department: "unclassified"
	},
	{
		name: "gingerbread men",
		department: "unclassified"
	},
	{
		name: "chrysanthemum",
		department: "unclassified"
	},
	{
		name: "leg roast",
		department: "unclassified"
	},
	{
		name: "rainbow peppercorns",
		department: "unclassified"
	},
	{
		name: "four peppercorn blend",
		department: "unclassified"
	},
	{
		name: "granadilla",
		department: "unclassified"
	},
	{
		name: "crushed tomatoes in juice",
		department: "unclassified"
	},
	{
		name: "muscadet",
		department: "unclassified"
	},
	{
		name: "fine vermicelli",
		department: "unclassified"
	},
	{
		name: "zabaglione",
		department: "unclassified"
	},
	{
		name: "isomalt",
		department: "unclassified"
	},
	{
		name: "madeleine",
		department: "unclassified"
	},
	{
		name: "pineapple vodka",
		department: "unclassified"
	},
	{
		name: "ham strips",
		department: "unclassified"
	},
	{
		name: "Spanish Queen olives",
		department: "unclassified"
	},
	{
		name: "shado beni",
		department: "unclassified"
	},
	{
		name: "chicken coating mix",
		department: "unclassified"
	},
	{
		name: "taro leaf",
		department: "unclassified"
	},
	{
		name: "taro leaves",
		department: "unclassified"
	},
	{
		name: "bovril powder",
		department: "unclassified"
	},
	{
		name: "ma\\u00EFskipfilet",
		department: "unclassified"
	},
	{
		name: "dry jack",
		department: "unclassified"
	},
	{
		name: "multigrain crackers",
		department: "unclassified"
	},
	{
		name: "hatcho miso",
		department: "unclassified"
	},
	{
		name: "boneless skin-on salmon fillets",
		department: "unclassified"
	},
	{
		name: "soy ice cream",
		department: "unclassified"
	},
	{
		name: "lemon sparkling water",
		department: "unclassified"
	},
	{
		name: "pork knuckles",
		department: "unclassified"
	},
	{
		name: "Soy Vay\\u00AE Toasted Sesame Dressing & Marinade",
		department: "unclassified"
	},
	{
		name: "dessert mints",
		department: "unclassified"
	},
	{
		name: "hen of the woods",
		department: "unclassified"
	},
	{
		name: "Crystal Farms\\u00AE Shredded Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "tatsoi leaves",
		department: "unclassified"
	},
	{
		name: "unsweetened green tea",
		department: "unclassified"
	},
	{
		name: "blueberry extract",
		department: "unclassified"
	},
	{
		name: "spinach tagliatelle",
		department: "unclassified"
	},
	{
		name: "comice",
		department: "unclassified"
	},
	{
		name: "orange ice cream",
		department: "unclassified"
	},
	{
		name: "light vanilla yogurt",
		department: "unclassified"
	},
	{
		name: "diet 7up",
		department: "unclassified"
	},
	{
		name: "pangasius",
		department: "unclassified"
	},
	{
		name: "basa",
		department: "unclassified"
	},
	{
		name: "Captain Morgan Rum",
		department: "unclassified"
	},
	{
		name: "sun-dried tomato tapenade",
		department: "unclassified"
	},
	{
		name: "jambalaya",
		department: "unclassified"
	},
	{
		name: "spicy pasta sauce",
		department: "unclassified"
	},
	{
		name: "chokecherry",
		department: "unclassified"
	},
	{
		name: "confetti cake mix",
		department: "unclassified"
	},
	{
		name: "ice cream wafers",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Mild Italian Ground Sausage",
		department: "unclassified"
	},
	{
		name: "fresh chickpeas",
		department: "unclassified"
	},
	{
		name: "wine sauce",
		department: "unclassified"
	},
	{
		name: "Kung Pao sauce",
		department: "unclassified"
	},
	{
		name: "Bud Light Lager",
		department: "unclassified"
	},
	{
		name: "Fireball Cinnamon Whisky",
		department: "unclassified"
	},
	{
		name: "salmon p\\u00E2t\\u00E9",
		department: "unclassified"
	},
	{
		name: "pumpkin soup",
		department: "unclassified"
	},
	{
		name: "Bertolli Pastasaus Bolognese",
		department: "unclassified"
	},
	{
		name: "Colavita White Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "reduced fat cr\\u00E8me fra\\u00EEche",
		department: "unclassified"
	},
	{
		name: "countrykoekjes",
		department: "unclassified"
	},
	{
		name: "schenkhoning",
		department: "unclassified"
	},
	{
		name: "kalfsragout",
		department: "unclassified"
	},
	{
		name: "Hidden Valley Ranch Fiesta Dip Mix",
		department: "unclassified"
	},
	{
		name: "reduced sodium navy beans",
		department: "unclassified"
	},
	{
		name: "fine grind white cornmeal",
		department: "unclassified"
	},
	{
		name: "masticha",
		department: "unclassified"
	},
	{
		name: "Mike and Ike Candies",
		department: "unclassified"
	},
	{
		name: "Spice Islands Pumpkin Pie Spice",
		department: "unclassified"
	},
	{
		name: "Mezzetta Deli-Sliced Tamed Jalape\\u00F1o Peppers",
		department: "unclassified"
	},
	{
		name: "Watkins Black Pepper",
		department: "unclassified"
	},
	{
		name: "Blue Bunny Ice Cream",
		department: "unclassified"
	},
	{
		name: "Progresso Red Kidney Beans",
		department: "unclassified"
	},
	{
		name: "Fisher Walnuts",
		department: "unclassified"
	},
	{
		name: "Spice Islands Sea Salt",
		department: "unclassified"
	},
	{
		name: "Nakano Seasoned Rice Vinegar",
		department: "unclassified"
	},
	{
		name: "Hot Tamales",
		department: "unclassified"
	},
	{
		name: "chickpea brine",
		department: "unclassified"
	},
	{
		name: "Zatarain\\u2019s Jambalaya Mix",
		department: "unclassified"
	},
	{
		name: "Wonderful Pistachios",
		department: "unclassified"
	},
	{
		name: "Bisquick Biscuits Mix",
		department: "unclassified"
	},
	{
		name: "Randall Pinto Beans",
		department: "unclassified"
	},
	{
		name: "Simply Organic Garlic Powder",
		department: "unclassified"
	},
	{
		name: "Smart Balance Buttery Spread",
		department: "unclassified"
	},
	{
		name: "pasilla chile pepper",
		department: "unclassified"
	},
	{
		name: "nori paper",
		department: "unclassified"
	},
	{
		name: "korean chile",
		department: "unclassified"
	},
	{
		name: "soy nut butter",
		department: "unclassified"
	},
	{
		name: "ground crumbles",
		department: "unclassified"
	},
	{
		name: "homemade fish stock",
		department: "unclassified"
	},
	{
		name: "Social Tea Biscuits",
		department: "unclassified"
	},
	{
		name: "Rolo Candy",
		department: "unclassified"
	},
	{
		name: "nestle crunch bars",
		department: "unclassified"
	},
	{
		name: "Nestle Crunch Bars",
		department: "unclassified"
	},
	{
		name: "low-fat vanilla pudding",
		department: "unclassified"
	},
	{
		name: "low-fat ritz crackers",
		department: "unclassified"
	},
	{
		name: "Grasshopper Cookies",
		department: "unclassified"
	},
	{
		name: "Chips Ahoy! Chocolate Chip Cookies",
		department: "unclassified"
	},
	{
		name: "brownie squares",
		department: "unclassified"
	},
	{
		name: "Baby Ruth Candy Bars",
		department: "unclassified"
	},
	{
		name: "whitefish caviar",
		department: "unclassified"
	},
	{
		name: "snail shells",
		department: "unclassified"
	},
	{
		name: "scrod",
		department: "unclassified"
	},
	{
		name: "ono",
		department: "unclassified"
	},
	{
		name: "Louis Kemp Crab Delights",
		department: "unclassified"
	},
	{
		name: "GOYA\\u00AE Adobo All-Purpose Seasoning With Pepper",
		department: "unclassified"
	},
	{
		name: "cod roe",
		department: "unclassified"
	},
	{
		name: "whole wheat shell pasta",
		department: "unclassified"
	},
	{
		name: "tip roast",
		department: "unclassified"
	},
	{
		name: "pork filet",
		department: "unclassified"
	},
	{
		name: "low-fat turkey kielbasa",
		department: "unclassified"
	},
	{
		name: "veal scaloppini",
		department: "unclassified"
	},
	{
		name: "V8 100% Vegetable Juice",
		department: "unclassified"
	},
	{
		name: "oolong tea leaves",
		department: "unclassified"
	},
	{
		name: "Minute Maid Lemonade",
		department: "unclassified"
	},
	{
		name: "shredded reduced-fat mild cheddar cheese",
		department: "unclassified"
	},
	{
		name: "low-fat plain kefir",
		department: "unclassified"
	},
	{
		name: "low-fat frozen yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat cultured buttermilk",
		department: "unclassified"
	},
	{
		name: "evaporated low-fat 2% milk",
		department: "unclassified"
	},
	{
		name: "castle cheese",
		department: "unclassified"
	},
	{
		name: "Thai Kitchen Premium Fish Sauce",
		department: "unclassified"
	},
	{
		name: "sundried tomato sauce",
		department: "unclassified"
	},
	{
		name: "stir fry seasoning",
		department: "unclassified"
	},
	{
		name: "pureed prunes",
		department: "unclassified"
	},
	{
		name: "pickled asparagus",
		department: "unclassified"
	},
	{
		name: "pecan flavoring",
		department: "unclassified"
	},
	{
		name: "low-fat pasta sauce",
		department: "unclassified"
	},
	{
		name: "whole oat groats",
		department: "unclassified"
	},
	{
		name: "Total Cereal",
		department: "unclassified"
	},
	{
		name: "urad dal flour",
		department: "unclassified"
	},
	{
		name: "toasted sourdough",
		department: "unclassified"
	},
	{
		name: "nutrasweet",
		department: "unclassified"
	},
	{
		name: "bratwurst buns",
		department: "unclassified"
	},
	{
		name: "lambrusco",
		department: "unclassified"
	},
	{
		name: "dark chocolate liqueur",
		department: "unclassified"
	},
	{
		name: "Bushmills Irish Whiskey",
		department: "unclassified"
	},
	{
		name: "yautia",
		department: "unclassified"
	},
	{
		name: "baobab fruit",
		department: "unclassified"
	},
	{
		name: "fajita marinade",
		department: "unclassified"
	},
	{
		name: "nocino",
		department: "unclassified"
	},
	{
		name: "Chiquita Banana",
		department: "unclassified"
	},
	{
		name: "reduced fat crumbled blue cheese",
		department: "unclassified"
	},
	{
		name: "clearjel",
		department: "unclassified"
	},
	{
		name: "ground short rib",
		department: "unclassified"
	},
	{
		name: "chewing gum",
		department: "unclassified"
	},
	{
		name: "popcorn butter",
		department: "unclassified"
	},
	{
		name: "Chopin Vodka",
		department: "unclassified"
	},
	{
		name: "Morningstar Farms\\u00AE Meal Starters\\u2122 Chik'n Strips",
		department: "unclassified"
	},
	{
		name: "baklava",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Shredded Gouda Cheese",
		department: "unclassified"
	},
	{
		name: "egg-shaped candies",
		department: "unclassified"
	},
	{
		name: "Queso Para Freir",
		department: "unclassified"
	},
	{
		name: "white wine sauce",
		department: "unclassified"
	},
	{
		name: "Bulgarian feta",
		department: "unclassified"
	},
	{
		name: "Hefeweizen Beer",
		department: "unclassified"
	},
	{
		name: "beef ramen noodles",
		department: "unclassified"
	},
	{
		name: "guinea fowl legs",
		department: "unclassified"
	},
	{
		name: "blueberry bagels",
		department: "unclassified"
	},
	{
		name: "goulash seasoning",
		department: "unclassified"
	},
	{
		name: "mixed radishes",
		department: "unclassified"
	},
	{
		name: "rum raisin ice cream",
		department: "unclassified"
	},
	{
		name: "golden quinoa",
		department: "unclassified"
	},
	{
		name: "mango vodka",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Refrigerated Chocolate Chip Cookie Bar Dough",
		department: "unclassified"
	},
	{
		name: "george dickel",
		department: "unclassified"
	},
	{
		name: "safflower mayonnaise",
		department: "unclassified"
	},
	{
		name: "reduced sugar strawberry jam",
		department: "unclassified"
	},
	{
		name: "half wheat flour",
		department: "unclassified"
	},
	{
		name: "trofie",
		department: "unclassified"
	},
	{
		name: "beer yeast",
		department: "unclassified"
	},
	{
		name: "montasio",
		department: "unclassified"
	},
	{
		name: "agnolotti",
		department: "unclassified"
	},
	{
		name: "baby okra",
		department: "unclassified"
	},
	{
		name: "vanilla creme sandwich cookies",
		department: "unclassified"
	},
	{
		name: "cantal",
		department: "unclassified"
	},
	{
		name: "mussel stock",
		department: "unclassified"
	},
	{
		name: "saddle of hare",
		department: "unclassified"
	},
	{
		name: "raspberry ice cream",
		department: "unclassified"
	},
	{
		name: "turmeric leaves",
		department: "unclassified"
	},
	{
		name: "pita loaves with pockets",
		department: "unclassified"
	},
	{
		name: "Cabot Chipotle Cheddar",
		department: "unclassified"
	},
	{
		name: "smoked cod",
		department: "unclassified"
	},
	{
		name: "TACO BELL\\u00AE Thick & Chunky Medium Salsa",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Grated Parmesan Cheese",
		department: "unclassified"
	},
	{
		name: "Pillsbury\\u2122 Grands\\u00AE! Big & Flaky crescent dinner rolls",
		department: "unclassified"
	},
	{
		name: "Old El Paso\\u2122 mild red enchilada sauce",
		department: "unclassified"
	},
	{
		name: "Green Giant\\u2122 frozen cut green beans",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Perfect Pinch\\u00AE Lemon & Pepper Seasoning",
		department: "unclassified"
	},
	{
		name: "Conimex Boemboe Babi Ketjap",
		department: "unclassified"
	},
	{
		name: "herbed oil",
		department: "unclassified"
	},
	{
		name: "Oreo Mini Bite Size Sandwich Cookies",
		department: "unclassified"
	},
	{
		name: "low fat chocolate milk",
		department: "unclassified"
	},
	{
		name: "chocolate coconut milk",
		department: "unclassified"
	},
	{
		name: "Knorr Homestyle Chicken Stock",
		department: "unclassified"
	},
	{
		name: "Contadina Tomato Sauce",
		department: "unclassified"
	},
	{
		name: "frozen tropical fruit",
		department: "unclassified"
	},
	{
		name: "whole grain sourdough",
		department: "unclassified"
	},
	{
		name: "frozen corn-on-the-cob",
		department: "unclassified"
	},
	{
		name: "reduced sugar preserves",
		department: "unclassified"
	},
	{
		name: "chocolate yogurt",
		department: "unclassified"
	},
	{
		name: "dried coriander seeds",
		department: "unclassified"
	},
	{
		name: "jalape\\u00F1o jelly",
		department: "unclassified"
	},
	{
		name: "baby sweet potatoes",
		department: "unclassified"
	},
	{
		name: "Watkins Garlic Powder",
		department: "unclassified"
	},
	{
		name: "Success White Rice",
		department: "unclassified"
	},
	{
		name: "Johnsonville Brats",
		department: "unclassified"
	},
	{
		name: "Dreamfields Elbows",
		department: "unclassified"
	},
	{
		name: "McCormick Sea Salt Grinder",
		department: "unclassified"
	},
	{
		name: "Skyy Vodka",
		department: "unclassified"
	},
	{
		name: "Reeses Peanut Butter Chips",
		department: "unclassified"
	},
	{
		name: "Premium Saltine Crackers",
		department: "unclassified"
	},
	{
		name: "red meat",
		department: "unclassified"
	},
	{
		name: "Agave In The Raw\\u00AE",
		department: "unclassified"
	},
	{
		name: "Frosted Flakes Cereal",
		department: "unclassified"
	},
	{
		name: "Bellino Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Fage Yogurt",
		department: "unclassified"
	},
	{
		name: "Wilton Candy Eyeballs",
		department: "unclassified"
	},
	{
		name: "Jelly Belly Jelly Beans",
		department: "unclassified"
	},
	{
		name: "Barilla Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "Spice Islands Chili Powder",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Gluten Free Tortillas",
		department: "unclassified"
	},
	{
		name: "Hood Sour Cream",
		department: "unclassified"
	},
	{
		name: "Jell-O Cheesecake",
		department: "unclassified"
	},
	{
		name: "white fungus",
		department: "unclassified"
	},
	{
		name: "ruby chard",
		department: "unclassified"
	},
	{
		name: "pequin peppers",
		department: "unclassified"
	},
	{
		name: "manzanilla",
		department: "unclassified"
	},
	{
		name: "low sodium corn",
		department: "unclassified"
	},
	{
		name: "long green pepper",
		department: "unclassified"
	},
	{
		name: "hungarian pepper",
		department: "unclassified"
	},
	{
		name: "dinosaur kale",
		department: "unclassified"
	},
	{
		name: "tofu mayonnaise",
		department: "unclassified"
	},
	{
		name: "skor bars",
		department: "unclassified"
	},
	{
		name: "nilla wafers",
		department: "unclassified"
	},
	{
		name: "Nabisco Ginger Snaps",
		department: "unclassified"
	},
	{
		name: "Mounds Candy Bars",
		department: "unclassified"
	},
	{
		name: "Ibarra Chocolate",
		department: "unclassified"
	},
	{
		name: "Almond Joy Candy Bars",
		department: "unclassified"
	},
	{
		name: "yellowfin",
		department: "unclassified"
	},
	{
		name: "sea urchin roe",
		department: "unclassified"
	},
	{
		name: "hamour fillet",
		department: "unclassified"
	},
	{
		name: "ground dried shrimp",
		department: "unclassified"
	},
	{
		name: "flying fish roe",
		department: "unclassified"
	},
	{
		name: "tagliarini",
		department: "unclassified"
	},
	{
		name: "fried chow mein noodles",
		department: "unclassified"
	},
	{
		name: "powdered ascorbic acid",
		department: "unclassified"
	},
	{
		name: "sweet sopressata",
		department: "unclassified"
	},
	{
		name: "swedish meatballs",
		department: "unclassified"
	},
	{
		name: "proscuitto di parma",
		department: "unclassified"
	},
	{
		name: "fajita meat",
		department: "unclassified"
	},
	{
		name: "chinese ham",
		department: "unclassified"
	},
	{
		name: "breakfast meat",
		department: "unclassified"
	},
	{
		name: "white currant",
		department: "unclassified"
	},
	{
		name: "satsuma orange",
		department: "unclassified"
	},
	{
		name: "Torani Caramel Sauce",
		department: "unclassified"
	},
	{
		name: "margarita mix concentrate",
		department: "unclassified"
	},
	{
		name: "pepato cheese",
		department: "unclassified"
	},
	{
		name: "nonfat dried milk",
		department: "unclassified"
	},
	{
		name: "neufchatel low-fat cream cheese",
		department: "unclassified"
	},
	{
		name: "Mountain High Yoghurt",
		department: "unclassified"
	},
	{
		name: "large shell-on shrimp",
		department: "unclassified"
	},
	{
		name: "chile con queso",
		department: "unclassified"
	},
	{
		name: "worcestershire sauce low sodium",
		department: "unclassified"
	},
	{
		name: "true cinnamon",
		department: "unclassified"
	},
	{
		name: "sour salt",
		department: "unclassified"
	},
	{
		name: "Smart Balance Cooking Spray",
		department: "unclassified"
	},
	{
		name: "sesame salt",
		department: "unclassified"
	},
	{
		name: "plum vinegar",
		department: "unclassified"
	},
	{
		name: "pickled eggs",
		department: "unclassified"
	},
	{
		name: "McCormick Italian Seasoning",
		department: "unclassified"
	},
	{
		name: "deli turkey breast slices",
		department: "unclassified"
	},
	{
		name: "Marmite Yeast Extract",
		department: "unclassified"
	},
	{
		name: "low-fat blue cheese dressing",
		department: "unclassified"
	},
	{
		name: "chile verde",
		department: "unclassified"
	},
	{
		name: "asian spice",
		department: "unclassified"
	},
	{
		name: "infant cereal",
		department: "unclassified"
	},
	{
		name: "Cranberry Almond Crunch Cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat matzos",
		department: "unclassified"
	},
	{
		name: "whole wheat matzo",
		department: "unclassified"
	},
	{
		name: "whole wheat italian bread",
		department: "unclassified"
	},
	{
		name: "whole wheat dough",
		department: "unclassified"
	},
	{
		name: "sourdough toasts",
		department: "unclassified"
	},
	{
		name: "pita wraps",
		department: "unclassified"
	},
	{
		name: "long sandwich rolls",
		department: "unclassified"
	},
	{
		name: "cracker bread",
		department: "unclassified"
	},
	{
		name: "chinese rock sugar",
		department: "unclassified"
	},
	{
		name: "bar sugar",
		department: "unclassified"
	},
	{
		name: "saki",
		department: "unclassified"
	},
	{
		name: "lambrusco wine",
		department: "unclassified"
	},
	{
		name: "brown rum",
		department: "unclassified"
	},
	{
		name: "reindeer",
		department: "unclassified"
	},
	{
		name: "puffcorn",
		department: "unclassified"
	},
	{
		name: "lamb rump steaks",
		department: "unclassified"
	},
	{
		name: "cucuzza",
		department: "unclassified"
	},
	{
		name: "elderflower blossoms",
		department: "unclassified"
	},
	{
		name: "date filling",
		department: "unclassified"
	},
	{
		name: "white decorating gel",
		department: "unclassified"
	},
	{
		name: "white asparagus spears",
		department: "unclassified"
	},
	{
		name: "vinegar concentrate",
		department: "unclassified"
	},
	{
		name: "johannisberg riesling",
		department: "unclassified"
	},
	{
		name: "center cut ham",
		department: "unclassified"
	},
	{
		name: "waffle cookies",
		department: "unclassified"
	},
	{
		name: "camomile",
		department: "unclassified"
	},
	{
		name: "cowpeas",
		department: "unclassified"
	},
	{
		name: "canadian whisky",
		department: "unclassified"
	},
	{
		name: "yellowfin tuna steaks",
		department: "unclassified"
	},
	{
		name: "mosselgroente",
		department: "unclassified"
	},
	{
		name: "makrut",
		department: "unclassified"
	},
	{
		name: "tournedos",
		department: "unclassified"
	},
	{
		name: "unsweetened chocolate almond milk",
		department: "unclassified"
	},
	{
		name: "fraise",
		department: "unclassified"
	},
	{
		name: "whole grain wraps",
		department: "unclassified"
	},
	{
		name: "gum arabic",
		department: "unclassified"
	},
	{
		name: "cheese-flavored crackers",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE organic ground nutmeg",
		department: "unclassified"
	},
	{
		name: "sable",
		department: "unclassified"
	},
	{
		name: "black cabbage",
		department: "unclassified"
	},
	{
		name: "I Can\\u2019t Believe It\\u2019s Not Butter!\\u00AE Deliciously Simple",
		department: "unclassified"
	},
	{
		name: "Kim Crawford Sauvignon Blanc",
		department: "unclassified"
	},
	{
		name: "banh pho rice noodles",
		department: "unclassified"
	},
	{
		name: "bijol",
		department: "unclassified"
	},
	{
		name: "kashkaval",
		department: "unclassified"
	},
	{
		name: "KNUDSEN 2% Milkfat Low Fat Cottage Cheese",
		department: "unclassified"
	},
	{
		name: "dory",
		department: "unclassified"
	},
	{
		name: "thyme tips",
		department: "unclassified"
	},
	{
		name: "chartreuse",
		department: "unclassified"
	},
	{
		name: "spicy refried beans",
		department: "unclassified"
	},
	{
		name: "rabbit back",
		department: "unclassified"
	},
	{
		name: "jose cuervo platino",
		department: "unclassified"
	},
	{
		name: "packet soup",
		department: "unclassified"
	},
	{
		name: "coffee rub",
		department: "unclassified"
	},
	{
		name: "blade pot roast",
		department: "unclassified"
	},
	{
		name: "wild boar fillet",
		department: "unclassified"
	},
	{
		name: "DeKuyper Triple Sec",
		department: "unclassified"
	},
	{
		name: "smoked turkey drumstick",
		department: "unclassified"
	},
	{
		name: "strega",
		department: "unclassified"
	},
	{
		name: "pizza kits",
		department: "unclassified"
	},
	{
		name: "boudin",
		department: "unclassified"
	},
	{
		name: "lamb seasoning",
		department: "unclassified"
	},
	{
		name: "gianduja",
		department: "unclassified"
	},
	{
		name: "dark chocolate ice cream",
		department: "unclassified"
	},
	{
		name: "Olivier salad",
		department: "unclassified"
	},
	{
		name: "onaga",
		department: "unclassified"
	},
	{
		name: "field roast sausage",
		department: "unclassified"
	},
	{
		name: "su",
		department: "unclassified"
	},
	{
		name: "Greek extra virgin olive oil",
		department: "unclassified"
	},
	{
		name: "Soju",
		department: "unclassified"
	},
	{
		name: "Absolut Citron Vodka",
		department: "unclassified"
	},
	{
		name: "asian barbecue sauce",
		department: "unclassified"
	},
	{
		name: "Cabot White Oak Cheddar",
		department: "unclassified"
	},
	{
		name: "roasted red pepper strips",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Carving Board Slow Cooked Ham",
		department: "unclassified"
	},
	{
		name: "potato slider buns",
		department: "unclassified"
	},
	{
		name: "Soy Vay\\u00AE Island Teriyaki Marinade & Sauce",
		department: "unclassified"
	},
	{
		name: "flavor enhancer",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Homemade Vanilla Ice Cream",
		department: "unclassified"
	},
	{
		name: "chicken seasoning mix",
		department: "unclassified"
	},
	{
		name: "chestnut spread",
		department: "unclassified"
	},
	{
		name: "Pompeian Red Wine Vinegar",
		department: "unclassified"
	},
	{
		name: "pearl tomatoes",
		department: "unclassified"
	},
	{
		name: "C\\u00EAlaV\\u00EDta Aardappeldobbeltjes",
		department: "unclassified"
	},
	{
		name: "licorice laces",
		department: "unclassified"
	},
	{
		name: "papaya juice",
		department: "unclassified"
	},
	{
		name: "ginger brandy",
		department: "unclassified"
	},
	{
		name: "Stonefire Tandoori Original Naan",
		department: "unclassified"
	},
	{
		name: "Mezzetta Deli-Sliced Roasted Red Peppers",
		department: "unclassified"
	},
	{
		name: "Nerds Candy",
		department: "unclassified"
	},
	{
		name: "Mezzetta Non-Pareil Capers",
		department: "unclassified"
	},
	{
		name: "Ore-Ida Hash Browns",
		department: "unclassified"
	},
	{
		name: "McCormick Rubbed Sage",
		department: "unclassified"
	},
	{
		name: "Nestle Table Cream",
		department: "unclassified"
	},
	{
		name: "Kit Kat Candy Bars",
		department: "unclassified"
	},
	{
		name: "Saffron Road Vegetable Broth",
		department: "unclassified"
	},
	{
		name: "Cento Minced Clams",
		department: "unclassified"
	},
	{
		name: "Plugra Unsalted Butter",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Decorating Icing",
		department: "unclassified"
	},
	{
		name: "Froot Loops Cereal",
		department: "unclassified"
	},
	{
		name: "Cheez Whiz Cheese Dip",
		department: "unclassified"
	},
	{
		name: "Diamond of California Whole Almonds",
		department: "unclassified"
	},
	{
		name: "Snickers Candy",
		department: "unclassified"
	},
	{
		name: "Hebrew National Beef Franks",
		department: "unclassified"
	},
	{
		name: "Spice Islands Poppy Seed",
		department: "unclassified"
	},
	{
		name: "salad spinach",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Carving Board Oven Roasted Turkey Breast",
		department: "unclassified"
	},
	{
		name: "hungarian wax pepper",
		department: "unclassified"
	},
	{
		name: "green cauliflower",
		department: "unclassified"
	},
	{
		name: "dried bonito",
		department: "unclassified"
	},
	{
		name: "Knorr Onion Minicubes",
		department: "unclassified"
	},
	{
		name: "beef broth 25% less sodium",
		department: "unclassified"
	},
	{
		name: "Terra Chips",
		department: "unclassified"
	},
	{
		name: "Teddy Grahams Cookies",
		department: "unclassified"
	},
	{
		name: "Snickers Candy Bar",
		department: "unclassified"
	},
	{
		name: "Lorna Doone Cookies",
		department: "unclassified"
	},
	{
		name: "yellowtail snapper",
		department: "unclassified"
	},
	{
		name: "steelhead trout",
		department: "unclassified"
	},
	{
		name: "seabass fillets",
		department: "unclassified"
	},
	{
		name: "marlin",
		department: "unclassified"
	},
	{
		name: "whole wheat shells",
		department: "unclassified"
	},
	{
		name: "thin rice sticks",
		department: "unclassified"
	},
	{
		name: "pearl rice",
		department: "unclassified"
	},
	{
		name: "chuka soba noodles",
		department: "unclassified"
	},
	{
		name: "asian wheat noodles",
		department: "unclassified"
	},
	{
		name: "honey mustard vinaigrette",
		department: "unclassified"
	},
	{
		name: "thin cut",
		department: "unclassified"
	},
	{
		name: "smoked pork neck bones",
		department: "unclassified"
	},
	{
		name: "side pork",
		department: "unclassified"
	},
	{
		name: "roasting hen",
		department: "unclassified"
	},
	{
		name: "pork loin roast center cut",
		department: "unclassified"
	},
	{
		name: "pork loin center cut",
		department: "unclassified"
	},
	{
		name: "minced peperoncini",
		department: "unclassified"
	},
	{
		name: "lamb riblets",
		department: "unclassified"
	},
	{
		name: "horse meat",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Rice Sides\\u2122 - Creamy Chicken flavor",
		department: "unclassified"
	},
	{
		name: "luxardo maraschino",
		department: "unclassified"
	},
	{
		name: "green coconut",
		department: "unclassified"
	},
	{
		name: "custard apple",
		department: "unclassified"
	},
	{
		name: "non-fat ice cream",
		department: "unclassified"
	},
	{
		name: "Ortega Chiles",
		department: "unclassified"
	},
	{
		name: "vanilla cream soda",
		department: "unclassified"
	},
	{
		name: "grape soda",
		department: "unclassified"
	},
	{
		name: "darjeeling tea leaves",
		department: "unclassified"
	},
	{
		name: "aloe juice",
		department: "unclassified"
	},
	{
		name: "Velveeta Cheese Spread",
		department: "unclassified"
	},
	{
		name: "soy sour cream",
		department: "unclassified"
	},
	{
		name: "turkey bacon strips",
		department: "unclassified"
	},
	{
		name: "low-fat quark cheese",
		department: "unclassified"
	},
	{
		name: "country crock spreadable butter with canola oil",
		department: "unclassified"
	},
	{
		name: "american cheese food",
		department: "unclassified"
	},
	{
		name: "Tony Chacheres Creole Seasoning",
		department: "unclassified"
	},
	{
		name: "sweet miso",
		department: "unclassified"
	},
	{
		name: "meatball mix",
		department: "unclassified"
	},
	{
		name: "McCormick Chili Seasoning",
		department: "unclassified"
	},
	{
		name: "orange sprinkles",
		department: "unclassified"
	},
	{
		name: "Knorr Pesto Sauce Mix",
		department: "unclassified"
	},
	{
		name: "ice cream salt",
		department: "unclassified"
	},
	{
		name: "guacamole seasoning mix",
		department: "unclassified"
	},
	{
		name: "extra spicy seasoning",
		department: "unclassified"
	},
	{
		name: "blueberry vinegar",
		department: "unclassified"
	},
	{
		name: "black bean sauce with garlic",
		department: "unclassified"
	},
	{
		name: "waffle batter",
		department: "unclassified"
	},
	{
		name: "Cocoa Puffs Cereal",
		department: "unclassified"
	},
	{
		name: "Cap''n Crunch Cereal",
		department: "unclassified"
	},
	{
		name: "belgian waffle mix",
		department: "unclassified"
	},
	{
		name: "Apple Jacks Cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat biscuits",
		department: "unclassified"
	},
	{
		name: "Pillsbury Brownie Mix",
		department: "unclassified"
	},
	{
		name: "maize cornflour",
		department: "unclassified"
	},
	{
		name: "levain bread",
		department: "unclassified"
	},
	{
		name: "Bisquick Original All-Purpose Baking Mix",
		department: "unclassified"
	},
	{
		name: "ammonium carbonate",
		department: "unclassified"
	},
	{
		name: "baby cereal",
		department: "unclassified"
	},
	{
		name: "spumante",
		department: "unclassified"
	},
	{
		name: "soft wheat berries",
		department: "unclassified"
	},
	{
		name: "lemon concentrate",
		department: "unclassified"
	},
	{
		name: "banana schnapps",
		department: "unclassified"
	},
	{
		name: "Jose Cuervo",
		department: "unclassified"
	},
	{
		name: "ground asafetida",
		department: "unclassified"
	},
	{
		name: "dasheen",
		department: "unclassified"
	},
	{
		name: "carrageenan",
		department: "unclassified"
	},
	{
		name: "green apple vodka",
		department: "unclassified"
	},
	{
		name: "DeLallo Lemon Juice",
		department: "unclassified"
	},
	{
		name: "chitterlings",
		department: "unclassified"
	},
	{
		name: "manouri",
		department: "unclassified"
	},
	{
		name: "nashi",
		department: "unclassified"
	},
	{
		name: "wholemeal tortilla wraps",
		department: "unclassified"
	},
	{
		name: "karela",
		department: "unclassified"
	},
	{
		name: "daylily",
		department: "unclassified"
	},
	{
		name: "Breyers\\u2122 Rainbow Sprinkles",
		department: "unclassified"
	},
	{
		name: "Entwine Chardonnay",
		department: "unclassified"
	},
	{
		name: "ready to serve beef broth",
		department: "unclassified"
	},
	{
		name: "store-bought ravioli",
		department: "unclassified"
	},
	{
		name: "honey tangerine",
		department: "unclassified"
	},
	{
		name: "beef ragout",
		department: "unclassified"
	},
	{
		name: "Ice Ice",
		department: "unclassified"
	},
	{
		name: "dorado",
		department: "unclassified"
	},
	{
		name: "Knorr Beef Stock Pots",
		department: "unclassified"
	},
	{
		name: "plum compote",
		department: "unclassified"
	},
	{
		name: "candied chestnuts",
		department: "unclassified"
	},
	{
		name: "soup paste",
		department: "unclassified"
	},
	{
		name: "sugar free cherry gelatin",
		department: "unclassified"
	},
	{
		name: "guanabana",
		department: "unclassified"
	},
	{
		name: "2% low fat buttermilk",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Spicy Ranch Dressing",
		department: "unclassified"
	},
	{
		name: "peach mango juice",
		department: "unclassified"
	},
	{
		name: "Bhutanese red rice",
		department: "unclassified"
	},
	{
		name: "blood orange liqueur",
		department: "unclassified"
	},
	{
		name: "habenero",
		department: "unclassified"
	},
	{
		name: "wood mushrooms",
		department: "unclassified"
	},
	{
		name: "mangosteen",
		department: "unclassified"
	},
	{
		name: "shanghai-style noodles",
		department: "unclassified"
	},
	{
		name: "gigli",
		department: "unclassified"
	},
	{
		name: "clabber",
		department: "unclassified"
	},
	{
		name: "branston pickle",
		department: "unclassified"
	},
	{
		name: "KRAFT Shredded Pepper Jack Cheese with a TOUCH OF PHILADELPHIA",
		department: "unclassified"
	},
	{
		name: "veal glace",
		department: "unclassified"
	},
	{
		name: "masoor",
		department: "unclassified"
	},
	{
		name: "watermelon schnapps",
		department: "unclassified"
	},
	{
		name: "skinless whitefish",
		department: "unclassified"
	},
	{
		name: "Gold's Cantonese-style Duck Sauce",
		department: "unclassified"
	},
	{
		name: "grated celeriac",
		department: "unclassified"
	},
	{
		name: "Victoria perch",
		department: "unclassified"
	},
	{
		name: "cocktail gherkins",
		department: "unclassified"
	},
	{
		name: "linguisa",
		department: "unclassified"
	},
	{
		name: "vialone nano",
		department: "unclassified"
	},
	{
		name: "bovril",
		department: "unclassified"
	},
	{
		name: "tuinkruidenbouillonpoeder",
		department: "unclassified"
	},
	{
		name: "mushroom bouillon cubes",
		department: "unclassified"
	},
	{
		name: "hot dog potato buns",
		department: "unclassified"
	},
	{
		name: "sliced Spanish olives",
		department: "unclassified"
	},
	{
		name: "multigrain rotini",
		department: "unclassified"
	},
	{
		name: "surimi flakes",
		department: "unclassified"
	},
	{
		name: "Philadelphia Spicy Jalape\\u00F1o Cream Cheese Spread",
		department: "unclassified"
	},
	{
		name: "vincotto",
		department: "unclassified"
	},
	{
		name: "licorice stick",
		department: "unclassified"
	},
	{
		name: "diet pepsi",
		department: "unclassified"
	},
	{
		name: "Mount Gay Rum",
		department: "unclassified"
	},
	{
		name: "brown creme de cacao",
		department: "unclassified"
	},
	{
		name: "Light Boursin",
		department: "unclassified"
	},
	{
		name: "lamb strips",
		department: "unclassified"
	},
	{
		name: "cooked onions",
		department: "unclassified"
	},
	{
		name: "MorningStar Farms Veggie Bacon Strips",
		department: "unclassified"
	},
	{
		name: "Kraft Big Slice Colby Jack Cheese Slices",
		department: "unclassified"
	},
	{
		name: "Bread Flour Mix",
		department: "unclassified"
	},
	{
		name: "salsa seasoning mix",
		department: "unclassified"
	},
	{
		name: "cheese bread",
		department: "unclassified"
	},
	{
		name: "chicken flavored rice",
		department: "unclassified"
	},
	{
		name: "instant chocolate drink mix",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Natural Strawberry Ice Cream",
		department: "unclassified"
	},
	{
		name: "reduced fat pork sausages",
		department: "unclassified"
	},
	{
		name: "diet cream soda",
		department: "unclassified"
	},
	{
		name: "chunky medium salsa",
		department: "unclassified"
	},
	{
		name: "Wish-Bone House Italian Dressing",
		department: "unclassified"
	},
	{
		name: "beef leg bones",
		department: "unclassified"
	},
	{
		name: "caramel coloring",
		department: "unclassified"
	},
	{
		name: "Hunts Tomato Paste",
		department: "unclassified"
	},
	{
		name: "Spice Islands Onion Powder",
		department: "unclassified"
	},
	{
		name: "dried allspice berries",
		department: "unclassified"
	},
	{
		name: "pineapple pulp",
		department: "unclassified"
	},
	{
		name: "lemon quark",
		department: "unclassified"
	},
	{
		name: "sunflower seed bread",
		department: "unclassified"
	},
	{
		name: "canned crab",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Ground Black Pepper",
		department: "unclassified"
	},
	{
		name: "semi dry red wine",
		department: "unclassified"
	},
	{
		name: "hot pepperoni",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Crushed Garlic",
		department: "unclassified"
	},
	{
		name: "blonde ale",
		department: "unclassified"
	},
	{
		name: "Lucid Absinthe Superieure",
		department: "unclassified"
	},
	{
		name: "Watkins Cumin",
		department: "unclassified"
	},
	{
		name: "Success Brown Rice",
		department: "unclassified"
	},
	{
		name: "McCormick Peppermint Extract",
		department: "unclassified"
	},
	{
		name: "Sabra Supremely Spicy Hummus",
		department: "unclassified"
	},
	{
		name: "Butterfinger Candy",
		department: "unclassified"
	},
	{
		name: "Goya Recaito",
		department: "unclassified"
	},
	{
		name: "Rhodes Bread",
		department: "unclassified"
	},
	{
		name: "Frontier Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "Once Again Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Sun-Maid Raisins",
		department: "unclassified"
	},
	{
		name: "Lays Potato Chips",
		department: "unclassified"
	},
	{
		name: "Dr Oetker Baking Powder",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Turkey Bacon",
		department: "unclassified"
	},
	{
		name: "Nandos Peri-Peri Sauce",
		department: "unclassified"
	},
	{
		name: "Zulka Pure Cane Sugar",
		department: "unclassified"
	},
	{
		name: "Oatmeal Squares Cereal",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Cake Mix",
		department: "unclassified"
	},
	{
		name: "Quaker Instant Oatmeal",
		department: "unclassified"
	},
	{
		name: "Bragg Apple Cider Vinegar",
		department: "unclassified"
	},
	{
		name: "Goya Yellow Rice",
		department: "unclassified"
	},
	{
		name: "Nature Valley Crunchy Granola Bars",
		department: "unclassified"
	},
	{
		name: "Dreamfields Linguine",
		department: "unclassified"
	},
	{
		name: "Ortega Taco Sauce",
		department: "unclassified"
	},
	{
		name: "Velveeta Queso Blanco",
		department: "unclassified"
	},
	{
		name: "Wilton Icing",
		department: "unclassified"
	},
	{
		name: "Williams Chili Seasoning",
		department: "unclassified"
	},
	{
		name: "Dream Whip Whipped Topping Mix",
		department: "unclassified"
	},
	{
		name: "Pop Secret Popcorn",
		department: "unclassified"
	},
	{
		name: "Jones Dairy Farm Ham Steak",
		department: "unclassified"
	},
	{
		name: "Star Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Divine Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Lingham's Hot Sauce",
		department: "unclassified"
	},
	{
		name: "Simply Organic Black pepper",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Gluten Free Yellow Cake Mix",
		department: "unclassified"
	},
	{
		name: "S&W White Beans",
		department: "unclassified"
	},
	{
		name: "Nutiva Coconut Oil",
		department: "unclassified"
	},
	{
		name: "Stonyfield Yogurt",
		department: "unclassified"
	},
	{
		name: "Rhodes White Bread",
		department: "unclassified"
	},
	{
		name: "young okra",
		department: "unclassified"
	},
	{
		name: "new mexico chile pods",
		department: "unclassified"
	},
	{
		name: "marigold petals",
		department: "unclassified"
	},
	{
		name: "refried low-fat black beans",
		department: "unclassified"
	},
	{
		name: "low-fat refried black beans",
		department: "unclassified"
	},
	{
		name: "luau leaves",
		department: "unclassified"
	},
	{
		name: "Karo Dark Corn Syrup",
		department: "unclassified"
	},
	{
		name: "green tomato relish",
		department: "unclassified"
	},
	{
		name: "globe artichoke",
		department: "unclassified"
	},
	{
		name: "dried hibiscus blossoms",
		department: "unclassified"
	},
	{
		name: "currant tomatoes",
		department: "unclassified"
	},
	{
		name: "low-fat firm tofu",
		department: "unclassified"
	},
	{
		name: "aburage",
		department: "unclassified"
	},
	{
		name: "oriental flavor ramen noodle soup",
		department: "unclassified"
	},
	{
		name: "whole wheat cracker crumbs",
		department: "unclassified"
	},
	{
		name: "pistachio slivers",
		department: "unclassified"
	},
	{
		name: "wahoo",
		department: "unclassified"
	},
	{
		name: "steelhead trout fillet",
		department: "unclassified"
	},
	{
		name: "shad roe",
		department: "unclassified"
	},
	{
		name: "frozen cod fillets",
		department: "unclassified"
	},
	{
		name: "amberjack",
		department: "unclassified"
	},
	{
		name: "risotto mix",
		department: "unclassified"
	},
	{
		name: "patna rice",
		department: "unclassified"
	},
	{
		name: "carolina rice",
		department: "unclassified"
	},
	{
		name: "Hormel Bacon Bits",
		department: "unclassified"
	},
	{
		name: "heritage turkey",
		department: "unclassified"
	},
	{
		name: "chicken hot dogs",
		department: "unclassified"
	},
	{
		name: "butt end",
		department: "unclassified"
	},
	{
		name: "Buddig Corned Beef",
		department: "unclassified"
	},
	{
		name: "dried pitted dates",
		department: "unclassified"
	},
	{
		name: "Simply Potatoes Southwest Style Hash Browns",
		department: "unclassified"
	},
	{
		name: "mandarin peel",
		department: "unclassified"
	},
	{
		name: "bitter lemon",
		department: "unclassified"
	},
	{
		name: "non-fat whipped topping",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Extra Creamy Vanilla Ice Cream",
		department: "unclassified"
	},
	{
		name: "pomegranate soda",
		department: "unclassified"
	},
	{
		name: "Nescafe Instant Coffee",
		department: "unclassified"
	},
	{
		name: "chai tea powder",
		department: "unclassified"
	},
	{
		name: "cane juice",
		department: "unclassified"
	},
	{
		name: "sheep yogurt",
		department: "unclassified"
	},
	{
		name: "nonfat dry milk solid",
		department: "unclassified"
	},
	{
		name: "low-fat powdered milk",
		department: "unclassified"
	},
	{
		name: "low-fat french vanilla yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat chocolate frozen yogurt",
		department: "unclassified"
	},
	{
		name: "fortune cookies",
		department: "unclassified"
	},
	{
		name: "szechuan seasoning",
		department: "unclassified"
	},
	{
		name: "southwest seasoning mix",
		department: "unclassified"
	},
	{
		name: "sour cherry syrup",
		department: "unclassified"
	},
	{
		name: "shrimp powder",
		department: "unclassified"
	},
	{
		name: "seafood boil",
		department: "unclassified"
	},
	{
		name: "nonfat fudge sauce",
		department: "unclassified"
	},
	{
		name: "meat loaf mixture",
		department: "unclassified"
	},
	{
		name: "low-fat vinaigrette dressing",
		department: "unclassified"
	},
	{
		name: "Louisiana Cajun Seasoning",
		department: "unclassified"
	},
	{
		name: "Bertolli Organic Olive Oil, Basil & Garlic Sauce",
		department: "unclassified"
	},
	{
		name: "aka miso",
		department: "unclassified"
	},
	{
		name: "whole wheat berries",
		department: "unclassified"
	},
	{
		name: "torpedo rolls",
		department: "unclassified"
	},
	{
		name: "rolled wheat",
		department: "unclassified"
	},
	{
		name: "prepared piecrust",
		department: "unclassified"
	},
	{
		name: "multigrain buns",
		department: "unclassified"
	},
	{
		name: "low fat graham cracker pie crust",
		department: "unclassified"
	},
	{
		name: "Krispy Kreme Doughnuts",
		department: "unclassified"
	},
	{
		name: "jowar flour",
		department: "unclassified"
	},
	{
		name: "Grissini Breadsticks",
		department: "unclassified"
	},
	{
		name: "grinder rolls",
		department: "unclassified"
	},
	{
		name: "frozen pizza crust",
		department: "unclassified"
	},
	{
		name: "sweet sake",
		department: "unclassified"
	},
	{
		name: "Godiva Dark Chocolate Liqueur",
		department: "unclassified"
	},
	{
		name: "a\\u00F1ejo rum",
		department: "unclassified"
	},
	{
		name: "aguardiente",
		department: "unclassified"
	},
	{
		name: "cheshire",
		department: "unclassified"
	},
	{
		name: "reduced fat whipped cream cheese",
		department: "unclassified"
	},
	{
		name: "johnnie walker black label",
		department: "unclassified"
	},
	{
		name: "catalina",
		department: "unclassified"
	},
	{
		name: "black cerignola olives",
		department: "unclassified"
	},
	{
		name: "italian squash",
		department: "unclassified"
	},
	{
		name: "gloucester",
		department: "unclassified"
	},
	{
		name: "hoja santa",
		department: "unclassified"
	},
	{
		name: "sea cucumber",
		department: "unclassified"
	},
	{
		name: "OSCAR MAYER Real Bacon Recipe Pieces",
		department: "unclassified"
	},
	{
		name: "holiday morsels",
		department: "unclassified"
	},
	{
		name: "herb croutons",
		department: "unclassified"
	},
	{
		name: "chinese turnip",
		department: "unclassified"
	},
	{
		name: "lavosh",
		department: "unclassified"
	},
	{
		name: "peeled diced tomatoes",
		department: "unclassified"
	},
	{
		name: "sheep stomach",
		department: "unclassified"
	},
	{
		name: "cajun marinade",
		department: "unclassified"
	},
	{
		name: "petit beurre",
		department: "unclassified"
	},
	{
		name: "Yuengling Beer",
		department: "unclassified"
	},
	{
		name: "cloudberry",
		department: "unclassified"
	},
	{
		name: "gooseberry preserves",
		department: "unclassified"
	},
	{
		name: "golden caviar",
		department: "unclassified"
	},
	{
		name: "cactus pad",
		department: "unclassified"
	},
	{
		name: "gum powder",
		department: "unclassified"
	},
	{
		name: "black moss",
		department: "unclassified"
	},
	{
		name: "Appenzeller cheese",
		department: "unclassified"
	},
	{
		name: "Alchermes",
		department: "unclassified"
	},
	{
		name: "pad thai brown rice noodles",
		department: "unclassified"
	},
	{
		name: "pad thai noodles",
		department: "unclassified"
	},
	{
		name: "Kraft Roka Blue Cheese Dressing",
		department: "unclassified"
	},
	{
		name: "gluten-free hot dog",
		department: "unclassified"
	},
	{
		name: "Merguez lamb sausage",
		department: "unclassified"
	},
	{
		name: "marshmallow candies",
		department: "unclassified"
	},
	{
		name: "jambon de bayonne",
		department: "unclassified"
	},
	{
		name: "citronge",
		department: "unclassified"
	},
	{
		name: "sicilian",
		department: "unclassified"
	},
	{
		name: "reduced sugar raspberry jam",
		department: "unclassified"
	},
	{
		name: "fig chutney",
		department: "unclassified"
	},
	{
		name: "gold dust",
		department: "unclassified"
	},
	{
		name: "rock oysters",
		department: "unclassified"
	},
	{
		name: "spiral macaroni",
		department: "unclassified"
	},
	{
		name: "pomegranate blueberry juice",
		department: "unclassified"
	},
	{
		name: "hot sopressata",
		department: "unclassified"
	},
	{
		name: "citrus rind",
		department: "unclassified"
	},
	{
		name: "light yogurt",
		department: "unclassified"
	},
	{
		name: "bigoli",
		department: "unclassified"
	},
	{
		name: "hakurei turnips",
		department: "unclassified"
	},
	{
		name: "lamb shawarma",
		department: "unclassified"
	},
	{
		name: "pistachio dust",
		department: "unclassified"
	},
	{
		name: "almond macaroons",
		department: "unclassified"
	},
	{
		name: "burrito size whole wheat tortillas",
		department: "unclassified"
	},
	{
		name: "cupcake icing",
		department: "unclassified"
	},
	{
		name: "ground wattleseed",
		department: "unclassified"
	},
	{
		name: "gluten free English muffins",
		department: "unclassified"
	},
	{
		name: "telera",
		department: "unclassified"
	},
	{
		name: "horned melon",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE Turkey Breast Cutlets",
		department: "unclassified"
	},
	{
		name: "creme de peche",
		department: "unclassified"
	},
	{
		name: "Sangiovese",
		department: "unclassified"
	},
	{
		name: "Sugar In The Raw Organic White\\u2122",
		department: "unclassified"
	},
	{
		name: "raspberry fruit topping",
		department: "unclassified"
	},
	{
		name: "snapper head",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Dark Chocolate Morsels",
		department: "unclassified"
	},
	{
		name: "beluga caviar",
		department: "unclassified"
	},
	{
		name: "poured fondant",
		department: "unclassified"
	},
	{
		name: "sarsaparilla",
		department: "unclassified"
	},
	{
		name: "cotechino",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Finely Shredded Asiago & Parmesan Cheese",
		department: "unclassified"
	},
	{
		name: "pistachio meal",
		department: "unclassified"
	},
	{
		name: "sesame breadsticks",
		department: "unclassified"
	},
	{
		name: "barbecue marinade",
		department: "unclassified"
	},
	{
		name: "Cabot Horseradish Cheddar",
		department: "unclassified"
	},
	{
		name: "Sabra\\u00AE Roasted Red Pepper Hummus",
		department: "unclassified"
	},
	{
		name: "Sabra Fresh-Roasted Red Pepper Hummus",
		department: "unclassified"
	},
	{
		name: "Earthbound Farm Baby Spinach",
		department: "unclassified"
	},
	{
		name: "Kraft Slim Cut Mozzarella Cheese Slices",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Traditional Cut Shredded 4 Cheese Mexican",
		department: "unclassified"
	},
	{
		name: "frozen grape juice concentrate",
		department: "unclassified"
	},
	{
		name: "Mezzetta Sliced Greek Kalamata Olives",
		department: "unclassified"
	},
	{
		name: "sausage filling",
		department: "unclassified"
	},
	{
		name: "pistachio butter",
		department: "unclassified"
	},
	{
		name: "Unox Pittige Rookworst",
		department: "unclassified"
	},
	{
		name: "Colavita Capers",
		department: "unclassified"
	},
	{
		name: "lean beef rump steaks",
		department: "unclassified"
	},
	{
		name: "scalloped potatoes mix",
		department: "unclassified"
	},
	{
		name: "boontjesmix",
		department: "unclassified"
	},
	{
		name: "tiger bread",
		department: "unclassified"
	},
	{
		name: "dutch crunch",
		department: "unclassified"
	},
	{
		name: "strawberry milk mix",
		department: "unclassified"
	},
	{
		name: "challah dough",
		department: "unclassified"
	},
	{
		name: "molasses cookies",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE California Hot Sauce",
		department: "unclassified"
	},
	{
		name: "Muir Glen Crushed Tomatoes",
		department: "unclassified"
	},
	{
		name: "Mezzetta Garlic",
		department: "unclassified"
	},
	{
		name: "Billy Bee Honey",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White Turkey Breast Tenderloins",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE Turkey Breast Tenderloins",
		department: "unclassified"
	},
	{
		name: "Goya Red Kidney Beans",
		department: "unclassified"
	},
	{
		name: "Pompeian Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Ortega Taco Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "Alouette Baby Brie",
		department: "unclassified"
	},
	{
		name: "San Marzano Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "Morton Salt",
		department: "unclassified"
	},
	{
		name: "Planters Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Doritos Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Pompeian Grapeseed Oil",
		department: "unclassified"
	},
	{
		name: "Squirt Soda",
		department: "unclassified"
	},
	{
		name: "Roses Lime Juice",
		department: "unclassified"
	},
	{
		name: "Everglades Seasoning",
		department: "unclassified"
	},
	{
		name: "Pillsbury Breadsticks",
		department: "unclassified"
	},
	{
		name: "SweetLeaf Liquid Stevia",
		department: "unclassified"
	},
	{
		name: "ghost pepper",
		department: "unclassified"
	},
	{
		name: "Manischewitz Vegetable Broth",
		department: "unclassified"
	},
	{
		name: "Cookie Crisp Cereal",
		department: "unclassified"
	},
	{
		name: "Hamburger Helper Lasagna",
		department: "unclassified"
	},
	{
		name: "Keebler Graham Cracker Crumbs",
		department: "unclassified"
	},
	{
		name: "Spice Islands Ground Cloves",
		department: "unclassified"
	},
	{
		name: "Spice Islands Crushed Red Pepper",
		department: "unclassified"
	},
	{
		name: "Pillsbury Brownie",
		department: "unclassified"
	},
	{
		name: "Daisy Cottage Cheese",
		department: "unclassified"
	},
	{
		name: "Watkins Chili Powder",
		department: "unclassified"
	},
	{
		name: "El Yucateco Red Hot Sauce",
		department: "unclassified"
	},
	{
		name: "Lindt Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Cacique Queso Fresco",
		department: "unclassified"
	},
	{
		name: "Johnsonville Smoked Brats",
		department: "unclassified"
	},
	{
		name: "Wilton Icing Decorations",
		department: "unclassified"
	},
	{
		name: "Pillsbury Cake Mix",
		department: "unclassified"
	},
	{
		name: "Farmland Bacon",
		department: "unclassified"
	},
	{
		name: "Ortega Salsa",
		department: "unclassified"
	},
	{
		name: "Herdez Salsa",
		department: "unclassified"
	},
	{
		name: "PBfit",
		department: "unclassified"
	},
	{
		name: "yellow turnip",
		department: "unclassified"
	},
	{
		name: "yellow chile",
		department: "unclassified"
	},
	{
		name: "vegetable marrow",
		department: "unclassified"
	},
	{
		name: "turban squash",
		department: "unclassified"
	},
	{
		name: "tree ears",
		department: "unclassified"
	},
	{
		name: "spanish pepper",
		department: "unclassified"
	},
	{
		name: "reduced calorie mayonnaise",
		department: "unclassified"
	},
	{
		name: "chile negro",
		department: "unclassified"
	},
	{
		name: "arhar dal",
		department: "unclassified"
	},
	{
		name: "veggie patties",
		department: "unclassified"
	},
	{
		name: "nigari tofu",
		department: "unclassified"
	},
	{
		name: "low-fat firm silken tofu",
		department: "unclassified"
	},
	{
		name: "low-fat extra-firm tofu",
		department: "unclassified"
	},
	{
		name: "Green Giant\\u2122 Steamers\\u2122 frozen backyard grilled potatoes",
		department: "unclassified"
	},
	{
		name: "low-fat vegetable broth",
		department: "unclassified"
	},
	{
		name: "Red Hots Candies",
		department: "unclassified"
	},
	{
		name: "quick tapioca",
		department: "unclassified"
	},
	{
		name: "prepared low-fat custard",
		department: "unclassified"
	},
	{
		name: "low-fat baked tortilla chips",
		department: "unclassified"
	},
	{
		name: "mounds bars",
		department: "unclassified"
	},
	{
		name: "wahoo fillets",
		department: "unclassified"
	},
	{
		name: "spanish mackerel fillets",
		department: "unclassified"
	},
	{
		name: "seapak jumbo",
		department: "unclassified"
	},
	{
		name: "lobster roe",
		department: "unclassified"
	},
	{
		name: "crab cake",
		department: "unclassified"
	},
	{
		name: "tri-colored tortellini",
		department: "unclassified"
	},
	{
		name: "tabouli mix",
		department: "unclassified"
	},
	{
		name: "roasted vermicelli",
		department: "unclassified"
	},
	{
		name: "japanese noodles",
		department: "unclassified"
	},
	{
		name: "Ghirardelli Brownie Mix",
		department: "unclassified"
	},
	{
		name: "cooked fettuccini",
		department: "unclassified"
	},
	{
		name: "cholent",
		department: "unclassified"
	},
	{
		name: "bhutanese red rice",
		department: "unclassified"
	},
	{
		name: "Barilla Penne",
		department: "unclassified"
	},
	{
		name: "wild goose",
		department: "unclassified"
	},
	{
		name: "white sausage",
		department: "unclassified"
	},
	{
		name: "rattlesnake",
		department: "unclassified"
	},
	{
		name: "rack of veal",
		department: "unclassified"
	},
	{
		name: "mignons",
		department: "unclassified"
	},
	{
		name: "cocktail meatballs",
		department: "unclassified"
	},
	{
		name: "chop suey meat",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Pasta Sides\\u2122 - Parmesan",
		department: "unclassified"
	},
	{
		name: "chocolate flavored crispy rice cereal",
		department: "unclassified"
	},
	{
		name: "sweetened iced tea",
		department: "unclassified"
	},
	{
		name: "rooibos tea leaves",
		department: "unclassified"
	},
	{
		name: "mint tea leaves",
		department: "unclassified"
	},
	{
		name: "Lipton Pure Leaf Iced Tea with Raspberry",
		department: "unclassified"
	},
	{
		name: "kalamansi juice",
		department: "unclassified"
	},
	{
		name: "raspberry low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat unsweetened yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat provolone cheese",
		department: "unclassified"
	},
	{
		name: "low-fat frozen vanilla yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat cherry yogurt",
		department: "unclassified"
	},
	{
		name: "devonshire cream",
		department: "unclassified"
	},
	{
		name: "country crock honey spread",
		department: "unclassified"
	},
	{
		name: "Thai Kitchen Fish Sauce",
		department: "unclassified"
	},
	{
		name: "Tabasco Habanero Sauce",
		department: "unclassified"
	},
	{
		name: "Sweet Baby Rays Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "rice paddy herb",
		department: "unclassified"
	},
	{
		name: "red mustard",
		department: "unclassified"
	},
	{
		name: "pickle wedges",
		department: "unclassified"
	},
	{
		name: "mild soy sauce",
		department: "unclassified"
	},
	{
		name: "mild jerk sauce",
		department: "unclassified"
	},
	{
		name: "meatloaf seasoning",
		department: "unclassified"
	},
	{
		name: "low sodium barbecue sauce",
		department: "unclassified"
	},
	{
		name: "low-fat creamy peanut butter",
		department: "unclassified"
	},
	{
		name: "jerk rub",
		department: "unclassified"
	},
	{
		name: "jamaican jerk rub",
		department: "unclassified"
	},
	{
		name: "chocolate coated caramel candies",
		department: "unclassified"
	},
	{
		name: "creole spice mix",
		department: "unclassified"
	},
	{
		name: "creole seafood seasoning",
		department: "unclassified"
	},
	{
		name: "Certo Fruit Pectin",
		department: "unclassified"
	},
	{
		name: "brown bean paste",
		department: "unclassified"
	},
	{
		name: "Red River Cereal",
		department: "unclassified"
	},
	{
		name: "quick-cooking hominy grits",
		department: "unclassified"
	},
	{
		name: "mandarin pancakes",
		department: "unclassified"
	},
	{
		name: "wafer biscuits",
		department: "unclassified"
	},
	{
		name: "Rumford Baking Powder",
		department: "unclassified"
	},
	{
		name: "pumpernickel slices",
		department: "unclassified"
	},
	{
		name: "pearl sago",
		department: "unclassified"
	},
	{
		name: "malt flour",
		department: "unclassified"
	},
	{
		name: "kaiser bun",
		department: "unclassified"
	},
	{
		name: "instant-blending flour",
		department: "unclassified"
	},
	{
		name: "batter frying mix",
		department: "unclassified"
	},
	{
		name: "Pernod Liqueur",
		department: "unclassified"
	},
	{
		name: "late harvest wine",
		department: "unclassified"
	},
	{
		name: "fortified wine",
		department: "unclassified"
	},
	{
		name: "corn whiskey",
		department: "unclassified"
	},
	{
		name: "carrageen",
		department: "unclassified"
	},
	{
		name: "milk chocolate hot cocoa mix",
		department: "unclassified"
	},
	{
		name: "gravox",
		department: "unclassified"
	},
	{
		name: "flowering kale",
		department: "unclassified"
	},
	{
		name: "large snails",
		department: "unclassified"
	},
	{
		name: "asti spumante",
		department: "unclassified"
	},
	{
		name: "whole grain wheat bread",
		department: "unclassified"
	},
	{
		name: "durum wheat pasta",
		department: "unclassified"
	},
	{
		name: "berry sparkling water",
		department: "unclassified"
	},
	{
		name: "morello",
		department: "unclassified"
	},
	{
		name: "foie gras terrine",
		department: "unclassified"
	},
	{
		name: "schuddebuikjes",
		department: "unclassified"
	},
	{
		name: "crunchy topping",
		department: "unclassified"
	},
	{
		name: "mahlepi",
		department: "unclassified"
	},
	{
		name: "marble cake mix",
		department: "unclassified"
	},
	{
		name: "smoked tongue",
		department: "unclassified"
	},
	{
		name: "baby tatsoi",
		department: "unclassified"
	},
	{
		name: "chicken supremes",
		department: "unclassified"
	},
	{
		name: "cubed game",
		department: "unclassified"
	},
	{
		name: "elderberry jam",
		department: "unclassified"
	},
	{
		name: "comfrey",
		department: "unclassified"
	},
	{
		name: "tomato cream sauce",
		department: "unclassified"
	},
	{
		name: "canary melon",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Cayenne Pepper",
		department: "unclassified"
	},
	{
		name: "christophene",
		department: "unclassified"
	},
	{
		name: "granulated tapioca",
		department: "unclassified"
	},
	{
		name: "nut cookies",
		department: "unclassified"
	},
	{
		name: "chocolate cream filled chocolate sandwich cookies",
		department: "unclassified"
	},
	{
		name: "shaved truffle",
		department: "unclassified"
	},
	{
		name: "baby ginger",
		department: "unclassified"
	},
	{
		name: "chinese radish",
		department: "unclassified"
	},
	{
		name: "quiche dough",
		department: "unclassified"
	},
	{
		name: "buttery cracker crumbs",
		department: "unclassified"
	},
	{
		name: "frozen Italian blend vegetables",
		department: "unclassified"
	},
	{
		name: "diet dr pepper",
		department: "unclassified"
	},
	{
		name: "beef stock concentrate",
		department: "unclassified"
	},
	{
		name: "Appleton Rum",
		department: "unclassified"
	},
	{
		name: "Italian herb pasta sauce",
		department: "unclassified"
	},
	{
		name: "Losso Rosso",
		department: "unclassified"
	},
	{
		name: "yeast starter",
		department: "unclassified"
	},
	{
		name: "snowball",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Traditional Cut Shredded Extra Sharp Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "antelope",
		department: "unclassified"
	},
	{
		name: "cactus leaves",
		department: "unclassified"
	},
	{
		name: "Kahlua Coffee",
		department: "unclassified"
	},
	{
		name: "Canadian Club Whisky",
		department: "unclassified"
	},
	{
		name: "Nielsen-Massey Lemon Extract",
		department: "unclassified"
	},
	{
		name: "kipper fillets",
		department: "unclassified"
	},
	{
		name: "Patron Silver Tequila",
		department: "unclassified"
	},
	{
		name: "garlic breadsticks",
		department: "unclassified"
	},
	{
		name: "honey teriyaki sauce",
		department: "unclassified"
	},
	{
		name: "whole baby okra",
		department: "unclassified"
	},
	{
		name: "Fire & Flavor coffee rub",
		department: "unclassified"
	},
	{
		name: "foie gras mousse",
		department: "unclassified"
	},
	{
		name: "Pinnacle Vodka",
		department: "unclassified"
	},
	{
		name: "nuremberg bratwurst",
		department: "unclassified"
	},
	{
		name: "curly chicory",
		department: "unclassified"
	},
	{
		name: "Goya Ground Cumin",
		department: "unclassified"
	},
	{
		name: "Kraken Rum",
		department: "unclassified"
	},
	{
		name: "raspberry tea",
		department: "unclassified"
	},
	{
		name: "low fat crumbled feta cheese",
		department: "unclassified"
	},
	{
		name: "cinnamon honey",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Traditional Cut Shredded Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "wensleydale",
		department: "unclassified"
	},
	{
		name: "chinese wolfberries",
		department: "unclassified"
	},
	{
		name: "edible blossoms",
		department: "unclassified"
	},
	{
		name: "B\\u00E1nh M\\u00EC rolls",
		department: "unclassified"
	},
	{
		name: "kewra",
		department: "unclassified"
	},
	{
		name: "gold dragees",
		department: "unclassified"
	},
	{
		name: "edible silver leaf",
		department: "unclassified"
	},
	{
		name: "crispy fried onions",
		department: "unclassified"
	},
	{
		name: "dry cured salami",
		department: "unclassified"
	},
	{
		name: "peppered salami",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Deli-Sliced Roasted Sweet Bell Pepper Strips",
		department: "unclassified"
	},
	{
		name: "Kraft Big Slice Swiss Cheese Slices",
		department: "unclassified"
	},
	{
		name: "low sodium cajun seasoning",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Italian All Natural Hot Ground Sausage",
		department: "unclassified"
	},
	{
		name: "pork spice rub",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Strawberry Cake Mix",
		department: "unclassified"
	},
	{
		name: "Mezzetta Whole Kalamata Olives",
		department: "unclassified"
	},
	{
		name: "Soy Vay\\u00AE Hoisin Garlic Marinade & Sauce",
		department: "unclassified"
	},
	{
		name: "Coors Light Beer",
		department: "unclassified"
	},
	{
		name: "lobster carcasses",
		department: "unclassified"
	},
	{
		name: "Canderel",
		department: "unclassified"
	},
	{
		name: "low-fat berry yogurt",
		department: "unclassified"
	},
	{
		name: "berry low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "Conimex Boemboe Smoor Vlees",
		department: "unclassified"
	},
	{
		name: "reduced sodium pinto beans",
		department: "unclassified"
	},
	{
		name: "lemon iced tea",
		department: "unclassified"
	},
	{
		name: "reduced calorie white bread",
		department: "unclassified"
	},
	{
		name: "reduced fat mature cheddar",
		department: "unclassified"
	},
	{
		name: "Nellie's Cage Free Eggs",
		department: "unclassified"
	},
	{
		name: "Wholesome Sweeteners Organic Sugar",
		department: "unclassified"
	},
	{
		name: "nut pate",
		department: "unclassified"
	},
	{
		name: "citrus leaves",
		department: "unclassified"
	},
	{
		name: "juliennesoep",
		department: "unclassified"
	},
	{
		name: "raspberry lemonade syrup",
		department: "unclassified"
	},
	{
		name: "Maggi bouillon cubes",
		department: "unclassified"
	},
	{
		name: "lamb burgers",
		department: "unclassified"
	},
	{
		name: "fruit cocktail in heavy syrup",
		department: "unclassified"
	},
	{
		name: "low fat honey mustard dressing",
		department: "unclassified"
	},
	{
		name: "Godiva Cappuccino Liqueur",
		department: "unclassified"
	},
	{
		name: "hot banana pepper rings",
		department: "unclassified"
	},
	{
		name: "Stonefire Tandoori Garlic Naan",
		department: "unclassified"
	},
	{
		name: "Mae Ploy Sweet Chili Sauce",
		department: "unclassified"
	},
	{
		name: "ramp leaves",
		department: "unclassified"
	},
	{
		name: "Mission Yellow Corn Tortillas",
		department: "unclassified"
	},
	{
		name: "Malt-O-Meal Hot Wheat Cereal",
		department: "unclassified"
	},
	{
		name: "Dove Dark Chocolate Promises",
		department: "unclassified"
	},
	{
		name: "Crunch Candy Bars",
		department: "unclassified"
	},
	{
		name: "Nestle Chocolate",
		department: "unclassified"
	},
	{
		name: "Tillamook Butter",
		department: "unclassified"
	},
	{
		name: "Planters Salted Peanuts",
		department: "unclassified"
	},
	{
		name: "Chocolate Cheerios Cereal",
		department: "unclassified"
	},
	{
		name: "Pops Cereal",
		department: "unclassified"
	},
	{
		name: "Ranch Style Black Beans",
		department: "unclassified"
	},
	{
		name: "Butterfinger Candies",
		department: "unclassified"
	},
	{
		name: "Cheez Whiz Cheese Spread",
		department: "unclassified"
	},
	{
		name: "Nordica Cottage Cheese",
		department: "unclassified"
	},
	{
		name: "Spice Islands Bay Leaves",
		department: "unclassified"
	},
	{
		name: "Bud Light Lime Beer",
		department: "unclassified"
	},
	{
		name: "Welch's 100% Grape Juice",
		department: "unclassified"
	},
	{
		name: "Goya Corn Oil",
		department: "unclassified"
	},
	{
		name: "McCormick Cilantro Leaves",
		department: "unclassified"
	},
	{
		name: "MorningStar Farms Veggie Sausage Patties",
		department: "unclassified"
	},
	{
		name: "San-J Tamari",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Ground Ginger",
		department: "unclassified"
	},
	{
		name: "Hormel Bacon Pieces",
		department: "unclassified"
	},
	{
		name: "Horizon Organic Butter",
		department: "unclassified"
	},
	{
		name: "Goya Lemon Juice",
		department: "unclassified"
	},
	{
		name: "Bertolli\\u00AE Riserva Marinara Sauce",
		department: "unclassified"
	},
	{
		name: "Kings Hawaiian Bread",
		department: "unclassified"
	},
	{
		name: "Nu-Salt Salt Substitute",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Cookie Icing",
		department: "unclassified"
	},
	{
		name: "Better Than Bouillon Vegetable Base",
		department: "unclassified"
	},
	{
		name: "Classico Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "New York Style Bagel Crisps",
		department: "unclassified"
	},
	{
		name: "Diamond of California Almonds",
		department: "unclassified"
	},
	{
		name: "Fleischmann's\\u00AE Bread Machine Yeast",
		department: "unclassified"
	},
	{
		name: "Mission Flour Tortillas",
		department: "unclassified"
	},
	{
		name: "Mounds Sweetened Coconut Flakes",
		department: "unclassified"
	},
	{
		name: "Smithfield Bacon",
		department: "unclassified"
	},
	{
		name: "Domino Confectioners Sugar",
		department: "unclassified"
	},
	{
		name: "Goya Coconut Milk",
		department: "unclassified"
	},
	{
		name: "Sandies Cookies",
		department: "unclassified"
	},
	{
		name: "Del Monte Cut Green Beans",
		department: "unclassified"
	},
	{
		name: "Snickers Candies",
		department: "unclassified"
	},
	{
		name: "Sixlets Candy",
		department: "unclassified"
	},
	{
		name: "Kikkoman Hoisin Sauce",
		department: "unclassified"
	},
	{
		name: "Van Camps Pork and Beans",
		department: "unclassified"
	},
	{
		name: "McCormick Hamburger Seasoning",
		department: "unclassified"
	},
	{
		name: "wild leek",
		department: "unclassified"
	},
	{
		name: "vegetable slaw",
		department: "unclassified"
	},
	{
		name: "sweet potato vermicelli",
		department: "unclassified"
	},
	{
		name: "sunburst squash",
		department: "unclassified"
	},
	{
		name: "regular black beans",
		department: "unclassified"
	},
	{
		name: "sugar-free jam",
		department: "unclassified"
	},
	{
		name: "opo squash",
		department: "unclassified"
	},
	{
		name: "new mexico green chile",
		department: "unclassified"
	},
	{
		name: "mole poblano",
		department: "unclassified"
	},
	{
		name: "hawaiian chile",
		department: "unclassified"
	},
	{
		name: "flower pepper",
		department: "unclassified"
	},
	{
		name: "Mazola\\u00AE Sobrecitos\\u2122 Chicken Flavor Bouillon Packets",
		department: "unclassified"
	},
	{
		name: "dried carrots",
		department: "unclassified"
	},
	{
		name: "preserved bean curd",
		department: "unclassified"
	},
	{
		name: "vleesvervanger",
		department: "unclassified"
	},
	{
		name: "Kitchen Basics Chicken Stock",
		department: "unclassified"
	},
	{
		name: "pure chocolate",
		department: "unclassified"
	},
	{
		name: "cereal bars",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE FIT & EASY\\u00AE Boneless, Skinless Chicken Breasts",
		department: "unclassified"
	},
	{
		name: "butterscotch filling",
		department: "unclassified"
	},
	{
		name: "petrale sole",
		department: "unclassified"
	},
	{
		name: "mussel liquid",
		department: "unclassified"
	},
	{
		name: "yam noodles",
		department: "unclassified"
	},
	{
		name: "meat tortellini",
		department: "unclassified"
	},
	{
		name: "frozen mini ravioli",
		department: "unclassified"
	},
	{
		name: "fideos pasta",
		department: "unclassified"
	},
	{
		name: "farfallini",
		department: "unclassified"
	},
	{
		name: "westphalian ham",
		department: "unclassified"
	},
	{
		name: "strip loin",
		department: "unclassified"
	},
	{
		name: "sloppy joe meat",
		department: "unclassified"
	},
	{
		name: "shank portion",
		department: "unclassified"
	},
	{
		name: "roast duck meat",
		department: "unclassified"
	},
	{
		name: "pork blade roast",
		department: "unclassified"
	},
	{
		name: "burger meat",
		department: "unclassified"
	},
	{
		name: "Armour Dried Beef",
		department: "unclassified"
	},
	{
		name: "pancit canton",
		department: "unclassified"
	},
	{
		name: "red banana",
		department: "unclassified"
	},
	{
		name: "muscat raisins",
		department: "unclassified"
	},
	{
		name: "calimyrna",
		department: "unclassified"
	},
	{
		name: "low-fat strawberry ice cream",
		department: "unclassified"
	},
	{
		name: "soft water",
		department: "unclassified"
	},
	{
		name: "Nestle Dulce de Leche",
		department: "unclassified"
	},
	{
		name: "green tea teabags",
		department: "unclassified"
	},
	{
		name: "soft chevre",
		department: "unclassified"
	},
	{
		name: "queso manchego",
		department: "unclassified"
	},
	{
		name: "nonfat peach yogurt",
		department: "unclassified"
	},
	{
		name: "lukewarm low-fat milk",
		department: "unclassified"
	},
	{
		name: "low sodium cheddar cheese",
		department: "unclassified"
	},
	{
		name: "low-fat canned coconut milk",
		department: "unclassified"
	},
	{
		name: "kefir cheese",
		department: "unclassified"
	},
	{
		name: "fresh mexican cheese",
		department: "unclassified"
	},
	{
		name: "Wish-Bone Bruschetta Italian Dressing",
		department: "unclassified"
	},
	{
		name: "Wish-Bone Light Ranch Dressing",
		department: "unclassified"
	},
	{
		name: "vietnamese chili paste",
		department: "unclassified"
	},
	{
		name: "soul food seasoning",
		department: "unclassified"
	},
	{
		name: "sloppy joe seasoning",
		department: "unclassified"
	},
	{
		name: "seafood seasoning blend",
		department: "unclassified"
	},
	{
		name: "rotisserie seasoning",
		department: "unclassified"
	},
	{
		name: "Ragu\\u00AE Robusto!\\u00AE Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "Ragu Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "pineapple vinegar",
		department: "unclassified"
	},
	{
		name: "pickled cauliflower",
		department: "unclassified"
	},
	{
		name: "peppercorn mix",
		department: "unclassified"
	},
	{
		name: "mocha glaze",
		department: "unclassified"
	},
	{
		name: "mango vinegar",
		department: "unclassified"
	},
	{
		name: "low fat prepared pasta sauce",
		department: "unclassified"
	},
	{
		name: "low-fat french dressing",
		department: "unclassified"
	},
	{
		name: "liquid margarita mix",
		department: "unclassified"
	},
	{
		name: "hickory seasoning",
		department: "unclassified"
	},
	{
		name: "crystallized flowers",
		department: "unclassified"
	},
	{
		name: "Bertolli Mushroom Alfredo with Portobello Mushrooms Sauce",
		department: "unclassified"
	},
	{
		name: "roasted buckwheat groats",
		department: "unclassified"
	},
	{
		name: "100% Bran Cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat graham cracker crumbs",
		department: "unclassified"
	},
	{
		name: "unsweetened cornbread",
		department: "unclassified"
	},
	{
		name: "split buns",
		department: "unclassified"
	},
	{
		name: "prepared poundcake",
		department: "unclassified"
	},
	{
		name: "low sodium baking powder",
		department: "unclassified"
	},
	{
		name: "italian breadsticks",
		department: "unclassified"
	},
	{
		name: "egg buns",
		department: "unclassified"
	},
	{
		name: "dry malt extract",
		department: "unclassified"
	},
	{
		name: "chinese buns",
		department: "unclassified"
	},
	{
		name: "bisquick low-fat baking mix",
		department: "unclassified"
	},
	{
		name: "artificial vanilla flavoring",
		department: "unclassified"
	},
	{
		name: "ammonium bicarbonate",
		department: "unclassified"
	},
	{
		name: "pinot gris",
		department: "unclassified"
	},
	{
		name: "ap\\u00E9ritif",
		department: "unclassified"
	},
	{
		name: "aji mirin",
		department: "unclassified"
	},
	{
		name: "beer cheese",
		department: "unclassified"
	},
	{
		name: "red rice vinegar",
		department: "unclassified"
	},
	{
		name: "burpless cucumber",
		department: "unclassified"
	},
	{
		name: "Absolut Vanilia Vodka",
		department: "unclassified"
	},
	{
		name: "brown flaxseed",
		department: "unclassified"
	},
	{
		name: "light fruit pie filling",
		department: "unclassified"
	},
	{
		name: "blachan",
		department: "unclassified"
	},
	{
		name: "pumpkinseeds",
		department: "unclassified"
	},
	{
		name: "kizami nori",
		department: "unclassified"
	},
	{
		name: "praline powder",
		department: "unclassified"
	},
	{
		name: "batavia arrack",
		department: "unclassified"
	},
	{
		name: "testicles",
		department: "unclassified"
	},
	{
		name: "lekvar",
		department: "unclassified"
	},
	{
		name: "ravioli filling",
		department: "unclassified"
	},
	{
		name: "carne seca",
		department: "unclassified"
	},
	{
		name: "strawberry wafers",
		department: "unclassified"
	},
	{
		name: "orange sparkling water",
		department: "unclassified"
	},
	{
		name: "Pacific oysters",
		department: "unclassified"
	},
	{
		name: "hard winter wheatberries",
		department: "unclassified"
	},
	{
		name: "hawaij",
		department: "unclassified"
	},
	{
		name: "clover leaf",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Traditional Cut Shredded Mild Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "leg of veal",
		department: "unclassified"
	},
	{
		name: "sesame ginger stir-fry sauce",
		department: "unclassified"
	},
	{
		name: "nixtamal",
		department: "unclassified"
	},
	{
		name: "hoja santa leaves",
		department: "unclassified"
	},
	{
		name: "echinacea",
		department: "unclassified"
	},
	{
		name: "paddestoelenfond",
		department: "unclassified"
	},
	{
		name: "creme de cacoa",
		department: "unclassified"
	},
	{
		name: "crescenza",
		department: "unclassified"
	},
	{
		name: "groentenfond",
		department: "unclassified"
	},
	{
		name: "maifun",
		department: "unclassified"
	},
	{
		name: "young gouda",
		department: "unclassified"
	},
	{
		name: "meat jelly",
		department: "unclassified"
	},
	{
		name: "bilimbi",
		department: "unclassified"
	},
	{
		name: "wholemeal wraps",
		department: "unclassified"
	},
	{
		name: "nondairy ice cream",
		department: "unclassified"
	},
	{
		name: "marzipan roses",
		department: "unclassified"
	},
	{
		name: "sweet curd",
		department: "unclassified"
	},
	{
		name: "sparkling juice",
		department: "unclassified"
	},
	{
		name: "milk chocolate baking bar",
		department: "unclassified"
	},
	{
		name: "KRAFT Zesty Lime Vinaigrette Dressing",
		department: "unclassified"
	},
	{
		name: "crenshaw melon",
		department: "unclassified"
	},
	{
		name: "red white and blue star sprinkles",
		department: "unclassified"
	},
	{
		name: "Fire & Flavor everyday rub",
		department: "unclassified"
	},
	{
		name: "orange tangerine juice",
		department: "unclassified"
	},
	{
		name: "Modelo Beer",
		department: "unclassified"
	},
	{
		name: "teleme",
		department: "unclassified"
	},
	{
		name: "sea aster",
		department: "unclassified"
	},
	{
		name: "Square One Organic Vodka",
		department: "unclassified"
	},
	{
		name: "edible wafer paper",
		department: "unclassified"
	},
	{
		name: "pummelo",
		department: "unclassified"
	},
	{
		name: "shredded low-fat sharp cheddar",
		department: "unclassified"
	},
	{
		name: "Gold's Horseradish",
		department: "unclassified"
	},
	{
		name: "whole anise",
		department: "unclassified"
	},
	{
		name: "oelek",
		department: "unclassified"
	},
	{
		name: "cream cheese wedges",
		department: "unclassified"
	},
	{
		name: "Pravda Vodka",
		department: "unclassified"
	},
	{
		name: "unsalted crunchy peanut butter",
		department: "unclassified"
	},
	{
		name: "Entwine Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "beehoon",
		department: "unclassified"
	},
	{
		name: "basting liquid",
		department: "unclassified"
	},
	{
		name: "satay marinade mix",
		department: "unclassified"
	},
	{
		name: "satay sauce mix",
		department: "unclassified"
	},
	{
		name: "tendons",
		department: "unclassified"
	},
	{
		name: "ground cacao",
		department: "unclassified"
	},
	{
		name: "mini gnocchi",
		department: "unclassified"
	},
	{
		name: "banyuls",
		department: "unclassified"
	},
	{
		name: "natuuryoghurt",
		department: "unclassified"
	},
	{
		name: "casaba melon",
		department: "unclassified"
	},
	{
		name: "brown rice fettuccine",
		department: "unclassified"
	},
	{
		name: "gluten free brown rice fettuccine pasta",
		department: "unclassified"
	},
	{
		name: "empanada discos",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Chef Blends\\u2122 Shredded 4 State Cheddar\\u2122 Cheese",
		department: "unclassified"
	},
	{
		name: "gjetost",
		department: "unclassified"
	},
	{
		name: "MorningStar Farms Chick'n Patties",
		department: "unclassified"
	},
	{
		name: "deer tenderloins",
		department: "unclassified"
	},
	{
		name: "lapsang",
		department: "unclassified"
	},
	{
		name: "Knorr Lente Ui-Knoflooksaus",
		department: "unclassified"
	},
	{
		name: "smoked mackerel fillets",
		department: "unclassified"
	},
	{
		name: "Cabot Sharp Extra Light Cheddar",
		department: "unclassified"
	},
	{
		name: "Tyson Fajita Chicken Strips",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Digestive Health Tortillas",
		department: "unclassified"
	},
	{
		name: "Stacy's\\u00AE Toasted Cheddar Pita Chips",
		department: "unclassified"
	},
	{
		name: "breaded chicken strips",
		department: "unclassified"
	},
	{
		name: "Hershey\\u00AE\\u2019s Mini Semisweet Chocolate Chips",
		department: "unclassified"
	},
	{
		name: "chicken spice rub",
		department: "unclassified"
	},
	{
		name: "mantou",
		department: "unclassified"
	},
	{
		name: "boule bread",
		department: "unclassified"
	},
	{
		name: "Old El Paso Original Taco Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "straight bourbon whiskey",
		department: "unclassified"
	},
	{
		name: "chunky hot salsa",
		department: "unclassified"
	},
	{
		name: "Nielsen-Massey Pure Vanilla Bean Paste",
		department: "unclassified"
	},
	{
		name: "Tropicana Pure Premium\\u00AE Orange Juice",
		department: "unclassified"
	},
	{
		name: "Fresh Express\\u00AE Hearts of Romaine",
		department: "unclassified"
	},
	{
		name: "Spectrum Organic Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "mango coulis",
		department: "unclassified"
	},
	{
		name: "lean back bacon",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Homestyle Stock\\u2122 Chicken Stock",
		department: "unclassified"
	},
	{
		name: "Kraft Shredded Pepper Jack Cheese",
		department: "unclassified"
	},
	{
		name: "Kraft Sharp Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "scharreleierkoeken",
		department: "unclassified"
	},
	{
		name: "peperonata",
		department: "unclassified"
	},
	{
		name: "ratatouille seasoning",
		department: "unclassified"
	},
	{
		name: "kreeftenfond",
		department: "unclassified"
	},
	{
		name: "skinless boneless pheasant breasts",
		department: "unclassified"
	},
	{
		name: "mushroom pate",
		department: "unclassified"
	},
	{
		name: "frozen french toast",
		department: "unclassified"
	},
	{
		name: "pineapple chunks in heavy syrup",
		department: "unclassified"
	},
	{
		name: "chocolate chocolate chip cookies",
		department: "unclassified"
	},
	{
		name: "Accent Flavor Enhancer",
		department: "unclassified"
	},
	{
		name: "reduced sugar jam",
		department: "unclassified"
	},
	{
		name: "spicy dill pickles",
		department: "unclassified"
	},
	{
		name: "spicy deli mustard",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Castelvetrano Olives",
		department: "unclassified"
	},
	{
		name: "boneless chuck eye steak",
		department: "unclassified"
	},
	{
		name: "applesauce baby food",
		department: "unclassified"
	},
	{
		name: "Indian prawns",
		department: "unclassified"
	},
	{
		name: "Skippy Peanut Butter Spread",
		department: "unclassified"
	},
	{
		name: "Harris Teeter Butter",
		department: "unclassified"
	},
	{
		name: "Old El Paso Cheese n'' Salsa Dip",
		department: "unclassified"
	},
	{
		name: "Oikos Yogurt",
		department: "unclassified"
	},
	{
		name: "Duncan Hines Cake Mix",
		department: "unclassified"
	},
	{
		name: "Las Palmas Enchilada Sauce",
		department: "unclassified"
	},
	{
		name: "Little Debbie Swiss Rolls",
		department: "unclassified"
	},
	{
		name: "Harissa Harissa",
		department: "unclassified"
	},
	{
		name: "Crunch Candy Bar",
		department: "unclassified"
	},
	{
		name: "Mezzetta Deli-Sliced Hot Cherry Peppers",
		department: "unclassified"
	},
	{
		name: "Svedka Vodka",
		department: "unclassified"
	},
	{
		name: "Bisquick Pancake Mix",
		department: "unclassified"
	},
	{
		name: "Hormel Bacon",
		department: "unclassified"
	},
	{
		name: "non-pareil capers",
		department: "unclassified"
	},
	{
		name: "ReaLemon Lemon Juice",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Fruit Roll-Ups",
		department: "unclassified"
	},
	{
		name: "Hershey''s Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Frontier Ginger",
		department: "unclassified"
	},
	{
		name: "Pompeian Canola Oil and Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Phillips Seafood Seasoning",
		department: "unclassified"
	},
	{
		name: "Vintage Seltzer",
		department: "unclassified"
	},
	{
		name: "Lucky Leaf Fruit Filling",
		department: "unclassified"
	},
	{
		name: "White Castle Hamburgers",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE 85/15 Ground Turkey",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms Ground Turkey",
		department: "unclassified"
	},
	{
		name: "Perugina Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "OrganicGirl Baby Spinach",
		department: "unclassified"
	},
	{
		name: "McCormick Ground Mustard",
		department: "unclassified"
	},
	{
		name: "Rodelle Baking Cocoa",
		department: "unclassified"
	},
	{
		name: "Kingsford''s Corn Starch",
		department: "unclassified"
	},
	{
		name: "Dare Crackers",
		department: "unclassified"
	},
	{
		name: "Blue Diamond Almond Milk",
		department: "unclassified"
	},
	{
		name: "Manischewitz Chicken Broth",
		department: "unclassified"
	},
	{
		name: "DeLallo Roasted Red Peppers",
		department: "unclassified"
	},
	{
		name: "Crisco All-Vegetable Shortening Sticks",
		department: "unclassified"
	},
	{
		name: "Ecco Domani Pinot Grigio",
		department: "unclassified"
	},
	{
		name: "Taco Bell Taco Sauce",
		department: "unclassified"
	},
	{
		name: "Hersheys Chocolate Bar",
		department: "unclassified"
	},
	{
		name: "Fleischmanns Yeast",
		department: "unclassified"
	},
	{
		name: "Simply Organic Rosemary",
		department: "unclassified"
	},
	{
		name: "peanut butter filled chocolate chips",
		department: "unclassified"
	},
	{
		name: "Big Red Soda",
		department: "unclassified"
	},
	{
		name: "Peter Pan Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Cento Chicken Broth",
		department: "unclassified"
	},
	{
		name: "Simply Organic Parsley",
		department: "unclassified"
	},
	{
		name: "Perugina White Chocolate",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Turkey Breast Tenderloins",
		department: "unclassified"
	},
	{
		name: "Starbucks Coffee",
		department: "unclassified"
	},
	{
		name: "Spice Islands Dill Weed",
		department: "unclassified"
	},
	{
		name: "Goya Vegetable Oil",
		department: "unclassified"
	},
	{
		name: "Zevia Ginger Ale",
		department: "unclassified"
	},
	{
		name: "S&W Garbanzo Beans",
		department: "unclassified"
	},
	{
		name: "Toblerone Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Pillsbury Sugar Cookies",
		department: "unclassified"
	},
	{
		name: "Madhava Coconut Sugar",
		department: "unclassified"
	},
	{
		name: "Bob Evans Italian Sausage",
		department: "unclassified"
	},
	{
		name: "Homemade Ice Cream",
		department: "unclassified"
	},
	{
		name: "Progresso Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "yellow finn potatoes",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Sesame Seeds",
		department: "unclassified"
	},
	{
		name: "purple corn",
		department: "unclassified"
	},
	{
		name: "pepperoncini brine",
		department: "unclassified"
	},
	{
		name: "pea eggplants",
		department: "unclassified"
	},
	{
		name: "green bellpepper",
		department: "unclassified"
	},
	{
		name: "drained peperoncini",
		department: "unclassified"
	},
	{
		name: "chile colorado",
		department: "unclassified"
	},
	{
		name: "bottled peperoncini",
		department: "unclassified"
	},
	{
		name: "vegan veggie burgers",
		department: "unclassified"
	},
	{
		name: "soy beverage",
		department: "unclassified"
	},
	{
		name: "vegetable gumbo",
		department: "unclassified"
	},
	{
		name: "seafood base",
		department: "unclassified"
	},
	{
		name: "homemade meat broth",
		department: "unclassified"
	},
	{
		name: "Pillsbury\\u2122 Grands!\\u2122 Big & Buttery refrigerated crescent dinner rolls",
		department: "unclassified"
	},
	{
		name: "non-fat tortilla chips",
		department: "unclassified"
	},
	{
		name: "low-fat vanilla wafers",
		department: "unclassified"
	},
	{
		name: "junket danish dessert mix",
		department: "unclassified"
	},
	{
		name: "gluten-free cookies",
		department: "unclassified"
	},
	{
		name: "smelt roe",
		department: "unclassified"
	},
	{
		name: "skinless snapper fillets",
		department: "unclassified"
	},
	{
		name: "geoduck",
		department: "unclassified"
	},
	{
		name: "chinook salmon",
		department: "unclassified"
	},
	{
		name: "white arborio rice",
		department: "unclassified"
	},
	{
		name: "popcorn rice",
		department: "unclassified"
	},
	{
		name: "Near East Couscous",
		department: "unclassified"
	},
	{
		name: "mochi rice",
		department: "unclassified"
	},
	{
		name: "lasagnette",
		department: "unclassified"
	},
	{
		name: "flat pasta",
		department: "unclassified"
	},
	{
		name: "farfalline",
		department: "unclassified"
	},
	{
		name: "tender steak",
		department: "unclassified"
	},
	{
		name: "reserved drippings",
		department: "unclassified"
	},
	{
		name: "pork picnic roast",
		department: "unclassified"
	},
	{
		name: "pork cube steak",
		department: "unclassified"
	},
	{
		name: "low-fat deli ham",
		department: "unclassified"
	},
	{
		name: "low-fat breakfast sausage",
		department: "unclassified"
	},
	{
		name: "lop chong",
		department: "unclassified"
	},
	{
		name: "lamb loin roast",
		department: "unclassified"
	},
	{
		name: "lamb leg chop",
		department: "unclassified"
	},
	{
		name: "lamb for stew",
		department: "unclassified"
	},
	{
		name: "homemade meatballs",
		department: "unclassified"
	},
	{
		name: "fresh pork butt",
		department: "unclassified"
	},
	{
		name: "crown roast of lamb",
		department: "unclassified"
	},
	{
		name: "boston roast",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Rice Sides\\u2122 - Chicken flavor Broccoli",
		department: "unclassified"
	},
	{
		name: "winesap",
		department: "unclassified"
	},
	{
		name: "Williams pear",
		department: "unclassified"
	},
	{
		name: "umeboshi plums",
		department: "unclassified"
	},
	{
		name: "dried persimmon",
		department: "unclassified"
	},
	{
		name: "dried citrus peel",
		department: "unclassified"
	},
	{
		name: "sugarcane juice",
		department: "unclassified"
	},
	{
		name: "red cream soda",
		department: "unclassified"
	},
	{
		name: "pina colada concentrate",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9 NESQUIK Chocolate Flavor Powder",
		department: "unclassified"
	},
	{
		name: "Lipton 100% Natural Iced Tea with Pomegranate Blueberry",
		department: "unclassified"
	},
	{
		name: "acidulated water",
		department: "unclassified"
	},
	{
		name: "port salut cheese",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE 85/15 Ground Turkey",
		department: "unclassified"
	},
	{
		name: "non-fat coffee creamer",
		department: "unclassified"
	},
	{
		name: "morbier cheese",
		department: "unclassified"
	},
	{
		name: "breaded chicken breasts",
		department: "unclassified"
	},
	{
		name: "low-fat orange yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat mascarpone cheese",
		department: "unclassified"
	},
	{
		name: "Kraft Cheese Spread",
		department: "unclassified"
	},
	{
		name: "humboldt fog cheese",
		department: "unclassified"
	},
	{
		name: "country crock pumpkin spice spread",
		department: "unclassified"
	},
	{
		name: "soy marinade",
		department: "unclassified"
	},
	{
		name: "Sambal Oelek Ground Fresh Chili Paste",
		department: "unclassified"
	},
	{
		name: "pickled peperoncini",
		department: "unclassified"
	},
	{
		name: "paprika gravy",
		department: "unclassified"
	},
	{
		name: "Muir Glen Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "mojito marinade",
		department: "unclassified"
	},
	{
		name: "McCormick Poultry Seasoning",
		department: "unclassified"
	},
	{
		name: "milk chocolate ice cream",
		department: "unclassified"
	},
	{
		name: "Mazola Canola Oil",
		department: "unclassified"
	},
	{
		name: "jamaican jerk",
		department: "unclassified"
	},
	{
		name: "Jack Daniels Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "Hellmanns Deli Mustard",
		department: "unclassified"
	},
	{
		name: "Crisco Cooking Spray",
		department: "unclassified"
	},
	{
		name: "cranberry vinegar",
		department: "unclassified"
	},
	{
		name: "chinese red rice vinegar",
		department: "unclassified"
	},
	{
		name: "chile vinaigrette",
		department: "unclassified"
	},
	{
		name: "Cavenders Greek Seasoning",
		department: "unclassified"
	},
	{
		name: "banana nectar",
		department: "unclassified"
	},
	{
		name: "Campbell's Turkey Gravy",
		department: "unclassified"
	},
	{
		name: "asian black bean sauce",
		department: "unclassified"
	},
	{
		name: "aji yellow paste",
		department: "unclassified"
	},
	{
		name: "Reese''s Puffs Cereal",
		department: "unclassified"
	},
	{
		name: "frosted cheerios",
		department: "unclassified"
	},
	{
		name: "Cracklin Oat Bran Cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat sandwich buns",
		department: "unclassified"
	},
	{
		name: "whole wheat sandwich rolls",
		department: "unclassified"
	},
	{
		name: "whole wheat italian breadcrumbs",
		department: "unclassified"
	},
	{
		name: "whole wheat bread crusts trimmed",
		department: "unclassified"
	},
	{
		name: "tostado shells",
		department: "unclassified"
	},
	{
		name: "spring wheat berries",
		department: "unclassified"
	},
	{
		name: "sourdough french rolls",
		department: "unclassified"
	},
	{
		name: "quinoa flour",
		department: "unclassified"
	},
	{
		name: "pita toasts",
		department: "unclassified"
	},
	{
		name: "Pillsbury Frosting",
		department: "unclassified"
	},
	{
		name: "patty shell",
		department: "unclassified"
	},
	{
		name: "pane di casa",
		department: "unclassified"
	},
	{
		name: "low-fat tortilla",
		department: "unclassified"
	},
	{
		name: "low-fat soy flour",
		department: "unclassified"
	},
	{
		name: "hard bread",
		department: "unclassified"
	},
	{
		name: "cream of broccoli soup mix",
		department: "unclassified"
	},
	{
		name: "cottage roll",
		department: "unclassified"
	},
	{
		name: "black barley",
		department: "unclassified"
	},
	{
		name: "bialys",
		department: "unclassified"
	},
	{
		name: "port salut",
		department: "unclassified"
	},
	{
		name: "amer picon",
		department: "unclassified"
	},
	{
		name: "kway teow",
		department: "unclassified"
	},
	{
		name: "canadian club",
		department: "unclassified"
	},
	{
		name: "candied angelica",
		department: "unclassified"
	},
	{
		name: "wafer cones",
		department: "unclassified"
	},
	{
		name: "No. Ten Gin",
		department: "unclassified"
	},
	{
		name: "kaffir leaf",
		department: "unclassified"
	},
	{
		name: "Saaz hops",
		department: "unclassified"
	},
	{
		name: "purple spring onions",
		department: "unclassified"
	},
	{
		name: "Jack Daniels Tennessee Honey",
		department: "unclassified"
	},
	{
		name: "Maui Schnapps",
		department: "unclassified"
	},
	{
		name: "stir fry kit",
		department: "unclassified"
	},
	{
		name: "chunk feta",
		department: "unclassified"
	},
	{
		name: "whole wheat frankfurter buns",
		department: "unclassified"
	},
	{
		name: "triticale",
		department: "unclassified"
	},
	{
		name: "citrus wedges",
		department: "unclassified"
	},
	{
		name: "espresso sticks",
		department: "unclassified"
	},
	{
		name: "chenin blanc",
		department: "unclassified"
	},
	{
		name: "Himalayan sulfur salt",
		department: "unclassified"
	},
	{
		name: "butterscotch liqueur",
		department: "unclassified"
	},
	{
		name: "sesame meal",
		department: "unclassified"
	},
	{
		name: "instant dessert topping",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Pepperoni Slices",
		department: "unclassified"
	},
	{
		name: "strooigoed",
		department: "unclassified"
	},
	{
		name: "tat soi",
		department: "unclassified"
	},
	{
		name: "grilling sausages",
		department: "unclassified"
	},
	{
		name: "sierra",
		department: "unclassified"
	},
	{
		name: "helix snails",
		department: "unclassified"
	},
	{
		name: "hare hind legs",
		department: "unclassified"
	},
	{
		name: "cinnamon cookies",
		department: "unclassified"
	},
	{
		name: "extra crispy tater tots",
		department: "unclassified"
	},
	{
		name: "light creme de cacao",
		department: "unclassified"
	},
	{
		name: "suey choy",
		department: "unclassified"
	},
	{
		name: "frozen turkey burgers",
		department: "unclassified"
	},
	{
		name: "Crystal Farms\\u00AE Better\\u2019n Eggs",
		department: "unclassified"
	},
	{
		name: "sauce ravigote",
		department: "unclassified"
	},
	{
		name: "freshwater prawn",
		department: "unclassified"
	},
	{
		name: "Bacardi Coconut Rum",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9\\u00AE TOLL HOUSE\\u00AE Holiday Morsels",
		department: "unclassified"
	},
	{
		name: "vegan salted caramel",
		department: "unclassified"
	},
	{
		name: "double gloucester",
		department: "unclassified"
	},
	{
		name: "godiva",
		department: "unclassified"
	},
	{
		name: "toffee ice cream",
		department: "unclassified"
	},
	{
		name: "red cubanelle peppers",
		department: "unclassified"
	},
	{
		name: "tea cake",
		department: "unclassified"
	},
	{
		name: "harp lager",
		department: "unclassified"
	},
	{
		name: "lamb medallions",
		department: "unclassified"
	},
	{
		name: "Citadelle Gin",
		department: "unclassified"
	},
	{
		name: "mamey",
		department: "unclassified"
	},
	{
		name: "freeze-dried oregano",
		department: "unclassified"
	},
	{
		name: "almond milk yogurt",
		department: "unclassified"
	},
	{
		name: "kashi cereal",
		department: "unclassified"
	},
	{
		name: "smoked chili powder",
		department: "unclassified"
	},
	{
		name: "Kim Crawford Pinot Noir",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Butterscotch Flavored Morsels",
		department: "unclassified"
	},
	{
		name: "chocolate sugar pearls",
		department: "unclassified"
	},
	{
		name: "soursop",
		department: "unclassified"
	},
	{
		name: "tomato flakes",
		department: "unclassified"
	},
	{
		name: "tomato bouillon cubes",
		department: "unclassified"
	},
	{
		name: "bigarreaux cherries",
		department: "unclassified"
	},
	{
		name: "quail legs",
		department: "unclassified"
	},
	{
		name: "sodium alginate",
		department: "unclassified"
	},
	{
		name: "knox gelatin powder",
		department: "unclassified"
	},
	{
		name: "cappelletti",
		department: "unclassified"
	},
	{
		name: "unfiltered olive oil",
		department: "unclassified"
	},
	{
		name: "wild cranberry",
		department: "unclassified"
	},
	{
		name: "jalapeno jack",
		department: "unclassified"
	},
	{
		name: "coral",
		department: "unclassified"
	},
	{
		name: "chocolate holly leaves",
		department: "unclassified"
	},
	{
		name: "sprout mix",
		department: "unclassified"
	},
	{
		name: "Nielsen-Massey Pure Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "vegan chicken flavored bouillon cubes",
		department: "unclassified"
	},
	{
		name: "dried matsutake mushrooms",
		department: "unclassified"
	},
	{
		name: "X-Rated Vodka",
		department: "unclassified"
	},
	{
		name: "gold balls",
		department: "unclassified"
	},
	{
		name: "katsuo bushi",
		department: "unclassified"
	},
	{
		name: "extra fine egg noodles",
		department: "unclassified"
	},
	{
		name: "Grey Poupon Spicy Brown Mustard",
		department: "unclassified"
	},
	{
		name: "snake gourd",
		department: "unclassified"
	},
	{
		name: "kobe",
		department: "unclassified"
	},
	{
		name: "Mark West Pinot Noir",
		department: "unclassified"
	},
	{
		name: "peanut clusters",
		department: "unclassified"
	},
	{
		name: "horehound leaves",
		department: "unclassified"
	},
	{
		name: "jalape\\u00F1o hamburger",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Fine Cut Shredded Sharp Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "kappa",
		department: "unclassified"
	},
	{
		name: "melon vodka",
		department: "unclassified"
	},
	{
		name: "pepato",
		department: "unclassified"
	},
	{
		name: "mozart",
		department: "unclassified"
	},
	{
		name: "shortbread tart shells",
		department: "unclassified"
	},
	{
		name: "speculaas liqueur",
		department: "unclassified"
	},
	{
		name: "spinach lasagna sheets",
		department: "unclassified"
	},
	{
		name: "Campbell's\\u00AE Condensed 98% Fat Free Broccoli Cheese Soup",
		department: "unclassified"
	},
	{
		name: "goat cheese rounds",
		department: "unclassified"
	},
	{
		name: "bone-in rib roast",
		department: "unclassified"
	},
	{
		name: "skinless swordfish steaks",
		department: "unclassified"
	},
	{
		name: "large pitted olives",
		department: "unclassified"
	},
	{
		name: "cr\\u00E8me de p\\u00EAche",
		department: "unclassified"
	},
	{
		name: "diastatic malt",
		department: "unclassified"
	},
	{
		name: "duck drippings",
		department: "unclassified"
	},
	{
		name: "rondele",
		department: "unclassified"
	},
	{
		name: "poultry liver",
		department: "unclassified"
	},
	{
		name: "Breyers\\u2122 Real Fruit Strawberry Topping",
		department: "unclassified"
	},
	{
		name: "wood pigeon",
		department: "unclassified"
	},
	{
		name: "fireweed blossoms",
		department: "unclassified"
	},
	{
		name: "baby marrow",
		department: "unclassified"
	},
	{
		name: "Fire & Flavor classic rub",
		department: "unclassified"
	},
	{
		name: "konnyaku powder",
		department: "unclassified"
	},
	{
		name: "citrus punch",
		department: "unclassified"
	},
	{
		name: "Mazola\\u00AE Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "nonalkalized cocoa",
		department: "unclassified"
	},
	{
		name: "beef hip",
		department: "unclassified"
	},
	{
		name: "hickory smoke flavoring",
		department: "unclassified"
	},
	{
		name: "kix",
		department: "unclassified"
	},
	{
		name: "KRAFT Chipotle Flavored Reduced Fat Mayonnaise",
		department: "unclassified"
	},
	{
		name: "papalo",
		department: "unclassified"
	},
	{
		name: "baby heirloom carrots",
		department: "unclassified"
	},
	{
		name: "country dijon",
		department: "unclassified"
	},
	{
		name: "red pepper tapenade",
		department: "unclassified"
	},
	{
		name: "soy eggnog",
		department: "unclassified"
	},
	{
		name: "Tyson Chicken Strips",
		department: "unclassified"
	},
	{
		name: "everything bagel seasoning",
		department: "unclassified"
	},
	{
		name: "vanilla pound cake",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Golden Greek Peperoncini",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Bac-Os",
		department: "unclassified"
	},
	{
		name: "Kraft Big Slice Pepper Jack Cheese Slices",
		department: "unclassified"
	},
	{
		name: "Simply Potatoes Steakhouse Seasoned Diced Potatoes",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Part Skim Ricotta Cheese",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Fine Cut Shredded Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Fine Grind Sea Salt",
		department: "unclassified"
	},
	{
		name: "Spice Islands Pure Almond Extract",
		department: "unclassified"
	},
	{
		name: "Spice Islands Almond Extract",
		department: "unclassified"
	},
	{
		name: "Pillsbury\\u2122 refrigerated garlic butter crescent dinner rolls",
		department: "unclassified"
	},
	{
		name: "kiwi strawberry juice",
		department: "unclassified"
	},
	{
		name: "citrus seasoning blend",
		department: "unclassified"
	},
	{
		name: "garlic chutney",
		department: "unclassified"
	},
	{
		name: "Gold'n Plump Ground Chicken",
		department: "unclassified"
	},
	{
		name: "cockerel",
		department: "unclassified"
	},
	{
		name: "split pea soup",
		department: "unclassified"
	},
	{
		name: "low-fat raspberry yogurt",
		department: "unclassified"
	},
	{
		name: "low sodium refried beans",
		department: "unclassified"
	},
	{
		name: "Village Harvest Arborio Rice",
		department: "unclassified"
	},
	{
		name: "Nasoya Firm Tofu",
		department: "unclassified"
	},
	{
		name: "Nasoya Silken Tofu",
		department: "unclassified"
	},
	{
		name: "Winter Oreo Cookies",
		department: "unclassified"
	},
	{
		name: "Nestle Carnation Evaporated Fat Free Milk",
		department: "unclassified"
	},
	{
		name: "Kraft Sour Cream",
		department: "unclassified"
	},
	{
		name: "Hy-Vee Ground Cinnamon",
		department: "unclassified"
	},
	{
		name: "Heinz Reduced Sugar Ketchup",
		department: "unclassified"
	},
	{
		name: "La Choy Lite Soy Sauce",
		department: "unclassified"
	},
	{
		name: "Grey Poupon Country Dijon Mustard",
		department: "unclassified"
	},
	{
		name: "Spice Islands Thyme",
		department: "unclassified"
	},
	{
		name: "smoked gammon joint",
		department: "unclassified"
	},
	{
		name: "Thai Kitchen Lite Coconut Milk",
		department: "unclassified"
	},
	{
		name: "passion fruit wine",
		department: "unclassified"
	},
	{
		name: "Heinz Distilled White Vinegar",
		department: "unclassified"
	},
	{
		name: "Kraft Extra Sharp Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "Tyson Boneless Skinless Chicken Breasts",
		department: "unclassified"
	},
	{
		name: "Breakstone\\u2019s Reduced Fat Sour Cream",
		department: "unclassified"
	},
	{
		name: "cinnamon biscuits",
		department: "unclassified"
	},
	{
		name: "Manischewitz Wine",
		department: "unclassified"
	},
	{
		name: "frozen chicken strips",
		department: "unclassified"
	},
	{
		name: "fruit cocktail in light syrup",
		department: "unclassified"
	},
	{
		name: "frozen string beans",
		department: "unclassified"
	},
	{
		name: "reduced sugar jelly",
		department: "unclassified"
	},
	{
		name: "low fat coleslaw dressing",
		department: "unclassified"
	},
	{
		name: "nonfat cheese",
		department: "unclassified"
	},
	{
		name: "72% cacao dark chocolate",
		department: "unclassified"
	},
	{
		name: "Gold's Wasabi Sauce",
		department: "unclassified"
	},
	{
		name: "Stonefire Italian Artisan Pizza Crust",
		department: "unclassified"
	},
	{
		name: "Stonefire Tandoori Naan",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Blue Cheese Stuffed Olives",
		department: "unclassified"
	},
	{
		name: "beet bulbs",
		department: "unclassified"
	},
	{
		name: "calf tongue",
		department: "unclassified"
	},
	{
		name: "herring roe",
		department: "unclassified"
	},
	{
		name: "Saffron Road Chicken Broth",
		department: "unclassified"
	},
	{
		name: "McCormick Apple Pie Spice",
		department: "unclassified"
	},
	{
		name: "Heinz Beans",
		department: "unclassified"
	},
	{
		name: "Del Monte Pineapple Slices",
		department: "unclassified"
	},
	{
		name: "Spice Islands Ground Allspice",
		department: "unclassified"
	},
	{
		name: "Simply Organic Chili Powder",
		department: "unclassified"
	},
	{
		name: "Del Monte Peas",
		department: "unclassified"
	},
	{
		name: "Bisto Gravy Mix",
		department: "unclassified"
	},
	{
		name: "Quinoa Penne",
		department: "unclassified"
	},
	{
		name: "Philadelphia Ready to Eat Cheesecake Filling",
		department: "unclassified"
	},
	{
		name: "McCormick Celery Salt",
		department: "unclassified"
	},
	{
		name: "Kellogg\\u2019s Rice Krispies Treats",
		department: "unclassified"
	},
	{
		name: "Prego Italian Sauce",
		department: "unclassified"
	},
	{
		name: "RiceSelect Arborio Rice",
		department: "unclassified"
	},
	{
		name: "Jiffy Cake Mix",
		department: "unclassified"
	},
	{
		name: "Kona Coast\\u2122 Hawaiian Honey Mustard",
		department: "unclassified"
	},
	{
		name: "Kona Coast Honey Mustard",
		department: "unclassified"
	},
	{
		name: "Manischewitz Honey",
		department: "unclassified"
	},
	{
		name: "Darigold Butter",
		department: "unclassified"
	},
	{
		name: "Quinoa Linguine",
		department: "unclassified"
	},
	{
		name: "maple icing",
		department: "unclassified"
	},
	{
		name: "Stonyfield Organic Yogurt",
		department: "unclassified"
	},
	{
		name: "Dorot Garlic",
		department: "unclassified"
	},
	{
		name: "Walden Farms Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "Peanut Butter & Co Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Heineken Beer",
		department: "unclassified"
	},
	{
		name: "Friendship Cottage Cheese",
		department: "unclassified"
	},
	{
		name: "Sugar in the Raw Turbinado Sugar",
		department: "unclassified"
	},
	{
		name: "Zatarains Creole Seasoning",
		department: "unclassified"
	},
	{
		name: "Andes Creme de Menthe Thins",
		department: "unclassified"
	},
	{
		name: "McCormick Ground Cloves",
		department: "unclassified"
	},
	{
		name: "Watkins Cinnamon",
		department: "unclassified"
	},
	{
		name: "Panda Express Kung Pao Sauce",
		department: "unclassified"
	},
	{
		name: "Horizon Sour Cream",
		department: "unclassified"
	},
	{
		name: "Thai Kitchen Green Curry Paste",
		department: "unclassified"
	},
	{
		name: "Hersheys Chocolate",
		department: "unclassified"
	},
	{
		name: "Dole Tropical Fruit",
		department: "unclassified"
	},
	{
		name: "Cento Whole Cherry Tomatoes",
		department: "unclassified"
	},
	{
		name: "Dofino Havarti",
		department: "unclassified"
	},
	{
		name: "Scharffen Berger Cocoa Powder",
		department: "unclassified"
	},
	{
		name: "Silver Floss Sauerkraut",
		department: "unclassified"
	},
	{
		name: "Krusteaz Pie Crust Mix",
		department: "unclassified"
	},
	{
		name: "Once Again Almond Butter",
		department: "unclassified"
	},
	{
		name: "Smuckers Hot Fudge",
		department: "unclassified"
	},
	{
		name: "Land O Lakes Half & Half",
		department: "unclassified"
	},
	{
		name: "Coors Beer",
		department: "unclassified"
	},
	{
		name: "Ruffles Potato Chips",
		department: "unclassified"
	},
	{
		name: "Werther''s Original Chewy Caramels",
		department: "unclassified"
	},
	{
		name: "Heineken Lager Beer",
		department: "unclassified"
	},
	{
		name: "Martha White Cornbread Mix",
		department: "unclassified"
	},
	{
		name: "Uncle Sam Cereal",
		department: "unclassified"
	},
	{
		name: "McCormick Turkey Gravy Mix",
		department: "unclassified"
	},
	{
		name: "Green Giant Cream Style Corn",
		department: "unclassified"
	},
	{
		name: "Diamond of California Pine Nuts",
		department: "unclassified"
	},
	{
		name: "Sutter Home Chardonnay",
		department: "unclassified"
	},
	{
		name: "Naked Juice",
		department: "unclassified"
	},
	{
		name: "white lotus paste",
		department: "unclassified"
	},
	{
		name: "Francesco Rinaldi Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "Count Chocula Cereal",
		department: "unclassified"
	},
	{
		name: "Goya Pinto Beans",
		department: "unclassified"
	},
	{
		name: "Rodelle Almond Extract",
		department: "unclassified"
	},
	{
		name: "Cape Cod Potato Chips",
		department: "unclassified"
	},
	{
		name: "Spice Islands Beau Monde Seasoning",
		department: "unclassified"
	},
	{
		name: "Watkins Vanilla Extract",
		department: "unclassified"
	},
	{
		name: "Atkins Bake Mix",
		department: "unclassified"
	},
	{
		name: "Spice Islands Paprika",
		department: "unclassified"
	},
	{
		name: "Organic Valley Heavy Whipping Cream",
		department: "unclassified"
	},
	{
		name: "Barefoot Pinot Grigio",
		department: "unclassified"
	},
	{
		name: "Hoegaarden Beer",
		department: "unclassified"
	},
	{
		name: "After Eight Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Nasoya Egg Roll Wraps",
		department: "unclassified"
	},
	{
		name: "Phil''s Fresh Eggs",
		department: "unclassified"
	},
	{
		name: "Lone Star Beer",
		department: "unclassified"
	},
	{
		name: "Colavita Balsamic Glace",
		department: "unclassified"
	},
	{
		name: "Miracle Noodle Angel Hair",
		department: "unclassified"
	},
	{
		name: "Hillshire Farm Beef Smoked Sausage",
		department: "unclassified"
	},
	{
		name: "Hood Heavy Cream",
		department: "unclassified"
	},
	{
		name: "Old El Paso Thick'N Chunky Salsa, Medium",
		department: "unclassified"
	},
	{
		name: "Rolo Chewy Caramels",
		department: "unclassified"
	},
	{
		name: "Frontier Black Pepper",
		department: "unclassified"
	},
	{
		name: "Lipton Iced Tea",
		department: "unclassified"
	},
	{
		name: "Real Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Walkers Shortbread Fingers",
		department: "unclassified"
	},
	{
		name: "Mug Root Beer",
		department: "unclassified"
	},
	{
		name: "young pandan leaves",
		department: "unclassified"
	},
	{
		name: "white beets",
		department: "unclassified"
	},
	{
		name: "sugarcane sticks",
		department: "unclassified"
	},
	{
		name: "saga blue",
		department: "unclassified"
	},
	{
		name: "oriental radish",
		department: "unclassified"
	},
	{
		name: "japanese radish",
		department: "unclassified"
	},
	{
		name: "no salt added navy beans",
		department: "unclassified"
	},
	{
		name: "greenhouse cucumber",
		department: "unclassified"
	},
	{
		name: "dried cascabel chile",
		department: "unclassified"
	},
	{
		name: "calabash",
		department: "unclassified"
	},
	{
		name: "Brooks Chili Beans",
		department: "unclassified"
	},
	{
		name: "Green Giant Creamed Spinach",
		department: "unclassified"
	},
	{
		name: "undiluted chicken broth",
		department: "unclassified"
	},
	{
		name: "swanson low sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "gumbo base mix",
		department: "unclassified"
	},
	{
		name: "Goya Chicken Bouillon",
		department: "unclassified"
	},
	{
		name: "College Inn Beef Broth",
		department: "unclassified"
	},
	{
		name: "toffee crunch",
		department: "unclassified"
	},
	{
		name: "Reese Peanut Butter Cup",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Crackers",
		department: "unclassified"
	},
	{
		name: "Oreo Chocolate Cookie Crumbs",
		department: "unclassified"
	},
	{
		name: "nacho rings",
		department: "unclassified"
	},
	{
		name: "jasmine pearls",
		department: "unclassified"
	},
	{
		name: "english toffee bar",
		department: "unclassified"
	},
	{
		name: "whole snapper",
		department: "unclassified"
	},
	{
		name: "talapia fillets",
		department: "unclassified"
	},
	{
		name: "smoked sablefish",
		department: "unclassified"
	},
	{
		name: "sea legs",
		department: "unclassified"
	},
	{
		name: "sand dab",
		department: "unclassified"
	},
	{
		name: "moreton bay bugs",
		department: "unclassified"
	},
	{
		name: "lobster coral",
		department: "unclassified"
	},
	{
		name: "wehani rice",
		department: "unclassified"
	},
	{
		name: "small rigatoni",
		department: "unclassified"
	},
	{
		name: "green fettuccine",
		department: "unclassified"
	},
	{
		name: "fedelini",
		department: "unclassified"
	},
	{
		name: "Dreamfields Lasagna",
		department: "unclassified"
	},
	{
		name: "weisswurst",
		department: "unclassified"
	},
	{
		name: "veal round steak",
		department: "unclassified"
	},
	{
		name: "top blade steak",
		department: "unclassified"
	},
	{
		name: "Duncan Hines Brownie Mix",
		department: "unclassified"
	},
	{
		name: "scrapple",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Bacon Bits",
		department: "unclassified"
	},
	{
		name: "low-fat turkey bacon",
		department: "unclassified"
	},
	{
		name: "low fat bacon bits",
		department: "unclassified"
	},
	{
		name: "low-fat bacon",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Turkey Breast Cutlets",
		department: "unclassified"
	},
	{
		name: "jimmy dean low-fat sausage",
		department: "unclassified"
	},
	{
		name: "cold meatloaf",
		department: "unclassified"
	},
	{
		name: "club steak",
		department: "unclassified"
	},
	{
		name: "baby goat",
		department: "unclassified"
	},
	{
		name: "Wolf Chili",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Rice Sides\\u2122 - Herb & Butter",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Pasta Sides\\u2122 - Butter & Herb",
		department: "unclassified"
	},
	{
		name: "plaintains",
		department: "unclassified"
	},
	{
		name: "persian lime",
		department: "unclassified"
	},
	{
		name: "myers",
		department: "unclassified"
	},
	{
		name: "mission figlets",
		department: "unclassified"
	},
	{
		name: "fish shaped crackers",
		department: "unclassified"
	},
	{
		name: "cameo apple",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE French Vanilla Ice Cream",
		department: "unclassified"
	},
	{
		name: "siu mai wrappers",
		department: "unclassified"
	},
	{
		name: "Minute Maid Limeade",
		department: "unclassified"
	},
	{
		name: "Lipton 100% natural iced tea with lemon",
		department: "unclassified"
	},
	{
		name: "queso ranchero",
		department: "unclassified"
	},
	{
		name: "unsweetened low-fat coconut milk",
		department: "unclassified"
	},
	{
		name: "unflavored low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "shredded kraftlow-fat cheddar cheese",
		department: "unclassified"
	},
	{
		name: "semi-firm cheese",
		department: "unclassified"
	},
	{
		name: "pasteurized process cheese sauce",
		department: "unclassified"
	},
	{
		name: "nonfat strawberry frozen yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat whipped cream cheese",
		department: "unclassified"
	},
	{
		name: "melted non-hydrogenated margarine",
		department: "unclassified"
	},
	{
		name: "low fat condensed milk",
		department: "unclassified"
	},
	{
		name: "low-fat banana yogurt",
		department: "unclassified"
	},
	{
		name: "1% milk fat cottage cheese",
		department: "unclassified"
	},
	{
		name: "Wish-Bone Balsamic Italian Vinaigrette Dressing",
		department: "unclassified"
	},
	{
		name: "vinaigrette base",
		department: "unclassified"
	},
	{
		name: "vietnamese chile paste",
		department: "unclassified"
	},
	{
		name: "teriyaki seasoning mix",
		department: "unclassified"
	},
	{
		name: "teriyaki sauce low sodium",
		department: "unclassified"
	},
	{
		name: "lombok",
		department: "unclassified"
	},
	{
		name: "sodium free chili powder",
		department: "unclassified"
	},
	{
		name: "seafood rub",
		department: "unclassified"
	},
	{
		name: "salt low sodium",
		department: "unclassified"
	},
	{
		name: "roast garlic puree",
		department: "unclassified"
	},
	{
		name: "meat glaze",
		department: "unclassified"
	},
	{
		name: "McCormick Cajun Seasoning",
		department: "unclassified"
	},
	{
		name: "maraschino syrup",
		department: "unclassified"
	},
	{
		name: "low-fat pizza sauce",
		department: "unclassified"
	},
	{
		name: "boneless NY strip steaks",
		department: "unclassified"
	},
	{
		name: "japanese horseradish",
		department: "unclassified"
	},
	{
		name: "gumbo file seasoning",
		department: "unclassified"
	},
	{
		name: "gluten-free honey mustard",
		department: "unclassified"
	},
	{
		name: "french fry seasoning",
		department: "unclassified"
	},
	{
		name: "chorizo seasoning",
		department: "unclassified"
	},
	{
		name: "chinese chile paste",
		department: "unclassified"
	},
	{
		name: "baby bam seasoning",
		department: "unclassified"
	},
	{
		name: "toasted buckwheat groats",
		department: "unclassified"
	},
	{
		name: "harvest crunch cereal",
		department: "unclassified"
	},
	{
		name: "go lean cereal",
		department: "unclassified"
	},
	{
		name: "barley grits",
		department: "unclassified"
	},
	{
		name: "whole wheat hot roll mix",
		department: "unclassified"
	},
	{
		name: "sourdough sandwich rolls",
		department: "unclassified"
	},
	{
		name: "sourdough loaves",
		department: "unclassified"
	},
	{
		name: "seafood breader",
		department: "unclassified"
	},
	{
		name: "pumpernickel rolls",
		department: "unclassified"
	},
	{
		name: "low-fat corn tortillas",
		department: "unclassified"
	},
	{
		name: "long buns",
		department: "unclassified"
	},
	{
		name: "large sandwich rolls",
		department: "unclassified"
	},
	{
		name: "hushpuppy mix",
		department: "unclassified"
	},
	{
		name: "crusty deli rolls",
		department: "unclassified"
	},
	{
		name: "crusty cobb loaf",
		department: "unclassified"
	},
	{
		name: "chocolate batter",
		department: "unclassified"
	},
	{
		name: "butterscotch glaze",
		department: "unclassified"
	},
	{
		name: "butterscotch baking bits",
		department: "unclassified"
	},
	{
		name: "brownie crust",
		department: "unclassified"
	},
	{
		name: "blue corn flour",
		department: "unclassified"
	},
	{
		name: "aspartame sweetener",
		department: "unclassified"
	},
	{
		name: "Zen Green Tea Liqueur",
		department: "unclassified"
	},
	{
		name: "pisco brandy",
		department: "unclassified"
	},
	{
		name: "godiva chocolate flavored liqueur",
		department: "unclassified"
	},
	{
		name: "fruit wine",
		department: "unclassified"
	},
	{
		name: "Abita Beer",
		department: "unclassified"
	},
	{
		name: "Anchor Steam Beer",
		department: "unclassified"
	},
	{
		name: "harp",
		department: "unclassified"
	},
	{
		name: "heirloom fingerling potatoes",
		department: "unclassified"
	},
	{
		name: "imitation almond extract",
		department: "unclassified"
	},
	{
		name: "apricot orange marmalade",
		department: "unclassified"
	},
	{
		name: "olio nuovo",
		department: "unclassified"
	},
	{
		name: "Gold's Cocktail Sauce",
		department: "unclassified"
	},
	{
		name: "fava leaves",
		department: "unclassified"
	},
	{
		name: "bull testicles",
		department: "unclassified"
	},
	{
		name: "pickapeppa",
		department: "unclassified"
	},
	{
		name: "creme yvette",
		department: "unclassified"
	},
	{
		name: "Hennessy Cognac",
		department: "unclassified"
	},
	{
		name: "ravioli dough",
		department: "unclassified"
	},
	{
		name: "habas",
		department: "unclassified"
	},
	{
		name: "chocolate hazelnut milk",
		department: "unclassified"
	},
	{
		name: "pickled eggplant",
		department: "unclassified"
	},
	{
		name: "edible silver spray",
		department: "unclassified"
	},
	{
		name: "chipolata pudding",
		department: "unclassified"
	},
	{
		name: "Jones Dairy Farm Ham",
		department: "unclassified"
	},
	{
		name: "Kraft Extra Thin Swiss Cheese Slices",
		department: "unclassified"
	},
	{
		name: "Ragu Classic Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "instant onion soup mix",
		department: "unclassified"
	},
	{
		name: "file gumbo powder",
		department: "unclassified"
	},
	{
		name: "sliced endive",
		department: "unclassified"
	},
	{
		name: "vacherin cheese",
		department: "unclassified"
	},
	{
		name: "Kraft Homestyle Real Mayonnaise",
		department: "unclassified"
	},
	{
		name: "KRAFT Mayo Homestyle Real Mayonnaise",
		department: "unclassified"
	},
	{
		name: "birthday cake ice cream",
		department: "unclassified"
	},
	{
		name: "Tofutti Better Than Ricotta Cheese",
		department: "unclassified"
	},
	{
		name: "Frontera Chardonnay",
		department: "unclassified"
	},
	{
		name: "golden mushroom",
		department: "unclassified"
	},
	{
		name: "vanaspati",
		department: "unclassified"
	},
	{
		name: "Harp Beer",
		department: "unclassified"
	},
	{
		name: "chinook",
		department: "unclassified"
	},
	{
		name: "hervekaas",
		department: "unclassified"
	},
	{
		name: "Herve",
		department: "unclassified"
	},
	{
		name: "Rocoto pepper",
		department: "unclassified"
	},
	{
		name: "small sandwich rolls",
		department: "unclassified"
	},
	{
		name: "candied flowers",
		department: "unclassified"
	},
	{
		name: "Silk Light Vanilla Almondmilk",
		department: "unclassified"
	},
	{
		name: "sponge cake dessert shells",
		department: "unclassified"
	},
	{
		name: "wild boar steak",
		department: "unclassified"
	},
	{
		name: "boar steak",
		department: "unclassified"
	},
	{
		name: "wasabe",
		department: "unclassified"
	},
	{
		name: "deer chops",
		department: "unclassified"
	},
	{
		name: "sugar free instant banana pudding mix",
		department: "unclassified"
	},
	{
		name: "irish mist",
		department: "unclassified"
	},
	{
		name: "bisto powder",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Organic Cayenne Pepper",
		department: "unclassified"
	},
	{
		name: "ruote",
		department: "unclassified"
	},
	{
		name: "orata",
		department: "unclassified"
	},
	{
		name: "LavAzza Coffee",
		department: "unclassified"
	},
	{
		name: "Tim Tams",
		department: "unclassified"
	},
	{
		name: "bols",
		department: "unclassified"
	},
	{
		name: "nonfat protein powder",
		department: "unclassified"
	},
	{
		name: "Starbucks  Coffee",
		department: "unclassified"
	},
	{
		name: "samp",
		department: "unclassified"
	},
	{
		name: "oka",
		department: "unclassified"
	},
	{
		name: "tikka powder",
		department: "unclassified"
	},
	{
		name: "Kraft Finely Shredded Mild Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "foie gras medallions",
		department: "unclassified"
	},
	{
		name: "poppy seed bagels",
		department: "unclassified"
	},
	{
		name: "fig compote",
		department: "unclassified"
	},
	{
		name: "cashel blue",
		department: "unclassified"
	},
	{
		name: "roasted red pepper spread",
		department: "unclassified"
	},
	{
		name: "gummy spiders",
		department: "unclassified"
	},
	{
		name: "Carolans Irish Cream",
		department: "unclassified"
	},
	{
		name: "candied clementine",
		department: "unclassified"
	},
	{
		name: "london gin",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE White Corn Tortillas",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Traditional Cut Shredded Sharp Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "burgundy snails",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Deli Fresh Smoked Turkey Breast",
		department: "unclassified"
	},
	{
		name: "lahvosh",
		department: "unclassified"
	},
	{
		name: "culatello",
		department: "unclassified"
	},
	{
		name: "milnot",
		department: "unclassified"
	},
	{
		name: "fajita size whole wheat tortillas",
		department: "unclassified"
	},
	{
		name: "hiziki",
		department: "unclassified"
	},
	{
		name: "caciotta",
		department: "unclassified"
	},
	{
		name: "maduros",
		department: "unclassified"
	},
	{
		name: "sobrasada",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Wisconsin 1/3 Less Fat Cream Cheese",
		department: "unclassified"
	},
	{
		name: "banh trang",
		department: "unclassified"
	},
	{
		name: "lambic",
		department: "unclassified"
	},
	{
		name: "coriander spice mix",
		department: "unclassified"
	},
	{
		name: "edible orchid leaves",
		department: "unclassified"
	},
	{
		name: "turkey breakfast sausage patties",
		department: "unclassified"
	},
	{
		name: "west indian pumpkin",
		department: "unclassified"
	},
	{
		name: "McCormick Roasted Ground Cumin",
		department: "unclassified"
	},
	{
		name: "yarrow leaves",
		department: "unclassified"
	},
	{
		name: "baby eels",
		department: "unclassified"
	},
	{
		name: "rolled spelt",
		department: "unclassified"
	},
	{
		name: "crushed sumac",
		department: "unclassified"
	},
	{
		name: "terasi powder",
		department: "unclassified"
	},
	{
		name: "kha",
		department: "unclassified"
	},
	{
		name: "chocolate ice cream sauce",
		department: "unclassified"
	},
	{
		name: "gray sole",
		department: "unclassified"
	},
	{
		name: "puffed corn",
		department: "unclassified"
	},
	{
		name: "boterwafeltjes",
		department: "unclassified"
	},
	{
		name: "tapioca balls",
		department: "unclassified"
	},
	{
		name: "espelette powder",
		department: "unclassified"
	},
	{
		name: "edible gold spray",
		department: "unclassified"
	},
	{
		name: "Yoplait\\u00AE Greek 2% caf\\u00E9 mocha yogurt",
		department: "unclassified"
	},
	{
		name: "Royal Baking Powder",
		department: "unclassified"
	},
	{
		name: "flathead",
		department: "unclassified"
	},
	{
		name: "powdered citric acid",
		department: "unclassified"
	},
	{
		name: "bundt cake mix",
		department: "unclassified"
	},
	{
		name: "gorditas",
		department: "unclassified"
	},
	{
		name: "Weber\\u00AE No-Stick Grill Spray",
		department: "unclassified"
	},
	{
		name: "chorizo spanish",
		department: "unclassified"
	},
	{
		name: "kandijkoek",
		department: "unclassified"
	},
	{
		name: "moringa leaf",
		department: "unclassified"
	},
	{
		name: "regular cocoa",
		department: "unclassified"
	},
	{
		name: "chocolate macaroon",
		department: "unclassified"
	},
	{
		name: "pork loin steak",
		department: "unclassified"
	},
	{
		name: "vegan English muffins",
		department: "unclassified"
	},
	{
		name: "gum tragacanth",
		department: "unclassified"
	},
	{
		name: "beaufort",
		department: "unclassified"
	},
	{
		name: "Kraft Thick & Spicy Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "Wilton Icing Colors",
		department: "unclassified"
	},
	{
		name: "plugra",
		department: "unclassified"
	},
	{
		name: "puff paste",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Milk Chocolate Morsels",
		department: "unclassified"
	},
	{
		name: "passion fruit vodka",
		department: "unclassified"
	},
	{
		name: "nonfat strawberry greek yogurt",
		department: "unclassified"
	},
	{
		name: "Ruffino Prosecco",
		department: "unclassified"
	},
	{
		name: "mango habanero hot sauce",
		department: "unclassified"
	},
	{
		name: "creme bouquet",
		department: "unclassified"
	},
	{
		name: "whole grain sandwich rolls",
		department: "unclassified"
	},
	{
		name: "smoked thick cut streaky bacon",
		department: "unclassified"
	},
	{
		name: "bluegill fillets",
		department: "unclassified"
	},
	{
		name: "Oronoco Rum",
		department: "unclassified"
	},
	{
		name: "diet orange soda",
		department: "unclassified"
	},
	{
		name: "banana quark",
		department: "unclassified"
	},
	{
		name: "Canadian Mist Whiskey",
		department: "unclassified"
	},
	{
		name: "candied citrus zest",
		department: "unclassified"
	},
	{
		name: "Hiram Walker Triple-Sec",
		department: "unclassified"
	},
	{
		name: "cake rolls",
		department: "unclassified"
	},
	{
		name: "lime vodka",
		department: "unclassified"
	},
	{
		name: "Rumple Minze Peppermint Schnapps",
		department: "unclassified"
	},
	{
		name: "Estancia Chardonnay",
		department: "unclassified"
	},
	{
		name: "chinese jujubes",
		department: "unclassified"
	},
	{
		name: "farofa",
		department: "unclassified"
	},
	{
		name: "Yoplait\\u00AE Greek 100 apple pie yogurt",
		department: "unclassified"
	},
	{
		name: "Godiva Hot Cocoa",
		department: "unclassified"
	},
	{
		name: "non dairy cream",
		department: "unclassified"
	},
	{
		name: "Tamari Tamari",
		department: "unclassified"
	},
	{
		name: "sweet & sour stir fry sauce",
		department: "unclassified"
	},
	{
		name: "chili pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "petrale",
		department: "unclassified"
	},
	{
		name: "chicken franks",
		department: "unclassified"
	},
	{
		name: "chicken frankfurter",
		department: "unclassified"
	},
	{
		name: "Conimex Serehpoeder",
		department: "unclassified"
	},
	{
		name: "Spice Hunter Chef's Shake Blend",
		department: "unclassified"
	},
	{
		name: "lavender bitters",
		department: "unclassified"
	},
	{
		name: "whole wheat matzah meal",
		department: "unclassified"
	},
	{
		name: "Li\\u00E8ge waffles",
		department: "unclassified"
	},
	{
		name: "sapodilla",
		department: "unclassified"
	},
	{
		name: "boneless pork loin fillets",
		department: "unclassified"
	},
	{
		name: "cassia buds",
		department: "unclassified"
	},
	{
		name: "jose cuervo tradicional",
		department: "unclassified"
	},
	{
		name: "Presidente Brandy",
		department: "unclassified"
	},
	{
		name: "chuck eye",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Shredded Swiss Cheese",
		department: "unclassified"
	},
	{
		name: "multigrain cereal mix",
		department: "unclassified"
	},
	{
		name: "cascabel powder",
		department: "unclassified"
	},
	{
		name: "Silk Light Original Soymilk",
		department: "unclassified"
	},
	{
		name: "Cento Italian Seasoning",
		department: "unclassified"
	},
	{
		name: "elderberry nectar",
		department: "unclassified"
	},
	{
		name: "Sobieski Vodka",
		department: "unclassified"
	},
	{
		name: "rump of veal",
		department: "unclassified"
	},
	{
		name: "mamey sapote",
		department: "unclassified"
	},
	{
		name: "fish bouillon",
		department: "unclassified"
	},
	{
		name: "Jack Daniels Tennessee Whiskey",
		department: "unclassified"
	},
	{
		name: "Estancia Pinot Noir",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Vanilla, Chocolate, Strawberry Ice Cream",
		department: "unclassified"
	},
	{
		name: "International Delight Almond Joy Creamer",
		department: "unclassified"
	},
	{
		name: "high-fructose corn syrup",
		department: "unclassified"
	},
	{
		name: "condensed consomme",
		department: "unclassified"
	},
	{
		name: "non-fat chocolate ice cream",
		department: "unclassified"
	},
	{
		name: "cajun remoulade",
		department: "unclassified"
	},
	{
		name: "Double IPA",
		department: "unclassified"
	},
	{
		name: "rainwater madeira",
		department: "unclassified"
	},
	{
		name: "cranberry p\\u00E2t\\u00E9",
		department: "unclassified"
	},
	{
		name: "Wilton Gel Food Colors",
		department: "unclassified"
	},
	{
		name: "greengage plum",
		department: "unclassified"
	},
	{
		name: "greengage plums",
		department: "unclassified"
	},
	{
		name: "strawberry cheesecake ice cream",
		department: "unclassified"
	},
	{
		name: "spaghetti alla chitarra",
		department: "unclassified"
	},
	{
		name: "hard shell ice cream topping",
		department: "unclassified"
	},
	{
		name: "unsalted tomato sauce",
		department: "unclassified"
	},
	{
		name: "Alaska cod",
		department: "unclassified"
	},
	{
		name: "Cabot Habanero Cheddar",
		department: "unclassified"
	},
	{
		name: "cajun meat seasoning",
		department: "unclassified"
	},
	{
		name: "bbq gravy",
		department: "unclassified"
	},
	{
		name: "hot garlic sauce",
		department: "unclassified"
	},
	{
		name: "barley grass powder",
		department: "unclassified"
	},
	{
		name: "Stacy's\\u00AE Multigrain Pita Chips",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Whole Peperoncini",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Roasted Red Bell Pepper Strips & Caramelized Onions",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Napa Valley Bistro Authentic Pizza Sauce",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Roasted Yellow and Red Sweet Bell Peppers",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Roasted Garlic Dressing",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Farmhouse Originals Italian with Herbs Dressing",
		department: "unclassified"
	},
	{
		name: "Bertolli Carbonara Sauce",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Provolone Cheese",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "Yoplait\\u00AE Greek 2% lemon meringue yogurt",
		department: "unclassified"
	},
	{
		name: "mediterranean seasoning mix",
		department: "unclassified"
	},
	{
		name: "whole wheat potato rolls",
		department: "unclassified"
	},
	{
		name: "Grandmas Molasses",
		department: "unclassified"
	},
	{
		name: "Kraft Blue Cheese Dressing",
		department: "unclassified"
	},
	{
		name: "oatmeal cookie dough",
		department: "unclassified"
	},
	{
		name: "Nigori",
		department: "unclassified"
	},
	{
		name: "Ital\\u00ADian sweet pep\\u00ADpers",
		department: "unclassified"
	},
	{
		name: "Duvel",
		department: "unclassified"
	},
	{
		name: "cinnamon sugar doughnuts",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Ice Cream",
		department: "unclassified"
	},
	{
		name: "Breyers BLASTS!\\u00AE OREO\\u00AE Cookies & Cream",
		department: "unclassified"
	},
	{
		name: "Solerno Blood Orange Liqueur",
		department: "unclassified"
	},
	{
		name: "cracked wheat bread",
		department: "unclassified"
	},
	{
		name: "Kroger Black Beans",
		department: "unclassified"
	},
	{
		name: "ground salmon",
		department: "unclassified"
	},
	{
		name: "Nasoya Extra Firm Tofu",
		department: "unclassified"
	},
	{
		name: "Silk Dark Chocolate Almondmilk",
		department: "unclassified"
	},
	{
		name: "Jose Cuervo Gold Tequila",
		department: "unclassified"
	},
	{
		name: "Bellino White Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Maille Honey Dijon Mustard",
		department: "unclassified"
	},
	{
		name: "Bellino White Wine Vinegar",
		department: "unclassified"
	},
	{
		name: "seafood seasoning mix",
		department: "unclassified"
	},
	{
		name: "au gratin potato mix",
		department: "unclassified"
	},
	{
		name: "Spectrum Canola Mayonnaise",
		department: "unclassified"
	},
	{
		name: "slagersham",
		department: "unclassified"
	},
	{
		name: "cod burger",
		department: "unclassified"
	},
	{
		name: "cream of chevril soup",
		department: "unclassified"
	},
	{
		name: "scharreladvocaat",
		department: "unclassified"
	},
	{
		name: "kohlrabi greens",
		department: "unclassified"
	},
	{
		name: "cheese schnitzel",
		department: "unclassified"
	},
	{
		name: "Fanta Orange",
		department: "unclassified"
	},
	{
		name: "mushroom marinara",
		department: "unclassified"
	},
	{
		name: "canned potatoes",
		department: "unclassified"
	},
	{
		name: "light American cheese",
		department: "unclassified"
	},
	{
		name: "nonfat vanilla ice cream",
		department: "unclassified"
	},
	{
		name: "low-fat caesar dressing",
		department: "unclassified"
	},
	{
		name: "cranberry grape cocktail",
		department: "unclassified"
	},
	{
		name: "cranberry grape juice",
		department: "unclassified"
	},
	{
		name: "ground decaffeinated coffee",
		department: "unclassified"
	},
	{
		name: "roasted walnuts",
		department: "unclassified"
	},
	{
		name: "egg barley",
		department: "unclassified"
	},
	{
		name: "Manischewitz Matzo Meal",
		department: "unclassified"
	},
	{
		name: "beef bratwurst",
		department: "unclassified"
	},
	{
		name: "multigrain linguine",
		department: "unclassified"
	},
	{
		name: "Morningstar Farms\\u00AE Meal Starters\\u2122 Steak Strips",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Sweet Cherry Peppers",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Sundried Tomato & Basil Everything Spread",
		department: "unclassified"
	},
	{
		name: "Country Crock Spreadable Butter",
		department: "unclassified"
	},
	{
		name: "S&W Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "Baci Chocolates",
		department: "unclassified"
	},
	{
		name: "Walkers Shortbread Rounds",
		department: "unclassified"
	},
	{
		name: "Dole Field Greens",
		department: "unclassified"
	},
	{
		name: "Applegate Pepperoni",
		department: "unclassified"
	},
	{
		name: "Tyson Chicken Breasts",
		department: "unclassified"
	},
	{
		name: "Mrs. Butterworth''s Syrup",
		department: "unclassified"
	},
	{
		name: "Mezzetta Napa Valley Homemade Spicy Marinara",
		department: "unclassified"
	},
	{
		name: "Mizkan Rice Vinegar",
		department: "unclassified"
	},
	{
		name: "Planters Cashews",
		department: "unclassified"
	},
	{
		name: "McCormick Sea Salt",
		department: "unclassified"
	},
	{
		name: "Yoplait Light Yogurt",
		department: "unclassified"
	},
	{
		name: "Country Time Pink Lemonade",
		department: "unclassified"
	},
	{
		name: "Mezzetta Red Hot Chili Pepper Everything Spread",
		department: "unclassified"
	},
	{
		name: "San Luis Sourdough Bread",
		department: "unclassified"
	},
	{
		name: "Knox Original Gelatine",
		department: "unclassified"
	},
	{
		name: "Snickers Ice Cream Bars",
		department: "unclassified"
	},
	{
		name: "Dole Blueberries",
		department: "unclassified"
	},
	{
		name: "Andre Champagne",
		department: "unclassified"
	},
	{
		name: "S&W Pinto Beans",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Wieners",
		department: "unclassified"
	},
	{
		name: "Pepsi Cola",
		department: "unclassified"
	},
	{
		name: "Godiva White Chocolate",
		department: "unclassified"
	},
	{
		name: "Noosa Yoghurt",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9\\u00AE TOLL HOUSE\\u00AE Peanut Butter & Milk Chocolate Morsels",
		department: "unclassified"
	},
	{
		name: "DeLallo Fusilli",
		department: "unclassified"
	},
	{
		name: "Organic Valley Butter",
		department: "unclassified"
	},
	{
		name: "Johnsonville Bratwurst",
		department: "unclassified"
	},
	{
		name: "El Pato Enchilada Sauce",
		department: "unclassified"
	},
	{
		name: "salted popped popcorn",
		department: "unclassified"
	},
	{
		name: "Siggis Yogurt",
		department: "unclassified"
	},
	{
		name: "La Victoria Salsa Verde",
		department: "unclassified"
	},
	{
		name: "Quaker Instant Oats",
		department: "unclassified"
	},
	{
		name: "McCormick Caraway Seed",
		department: "unclassified"
	},
	{
		name: "Gevalia Coffee",
		department: "unclassified"
	},
	{
		name: "On the Border Salsa",
		department: "unclassified"
	},
	{
		name: "Farm Rich Turkey Meatballs",
		department: "unclassified"
	},
	{
		name: "Horizon Heavy Whipping Cream",
		department: "unclassified"
	},
	{
		name: "Woodchuck Hard Cider",
		department: "unclassified"
	},
	{
		name: "Maille Traditional Dijon Mustard",
		department: "unclassified"
	},
	{
		name: "So Delicious Coconut Milk Beverage",
		department: "unclassified"
	},
	{
		name: "Buddig Ham",
		department: "unclassified"
	},
	{
		name: "Goya Hot Sauce",
		department: "unclassified"
	},
	{
		name: "Lay''s Potato Chips",
		department: "unclassified"
	},
	{
		name: "Kikkoman Rice Vinegar",
		department: "unclassified"
	},
	{
		name: "McCormick Chives",
		department: "unclassified"
	},
	{
		name: "Bigelow Green Tea",
		department: "unclassified"
	},
	{
		name: "French Toast Crunch Cereal",
		department: "unclassified"
	},
	{
		name: "Ruffles  Potato Chips",
		department: "unclassified"
	},
	{
		name: "Weetabix Biscuits",
		department: "unclassified"
	},
	{
		name: "S&W Chili Beans",
		department: "unclassified"
	},
	{
		name: "Red Gold Ketchup",
		department: "unclassified"
	},
	{
		name: "Butterball\\u00AE turkey",
		department: "unclassified"
	},
	{
		name: "Red Hots Candy",
		department: "unclassified"
	},
	{
		name: "Community Coffee",
		department: "unclassified"
	},
	{
		name: "Nabisco Graham Cracker Crumbs",
		department: "unclassified"
	},
	{
		name: "Woodbridge Chardonnay",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE organic turmeric",
		department: "unclassified"
	},
	{
		name: "Dole Dates",
		department: "unclassified"
	},
	{
		name: "Wesson Vegetable Oil",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Garlic Bread",
		department: "unclassified"
	},
	{
		name: "Pioneer Brand Baking Mix",
		department: "unclassified"
	},
	{
		name: "Fever-Tree Ginger Beer",
		department: "unclassified"
	},
	{
		name: "RC Cola",
		department: "unclassified"
	},
	{
		name: "Vintage Seltzer Water",
		department: "unclassified"
	},
	{
		name: "Cadbury Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Vigo Yellow Rice",
		department: "unclassified"
	},
	{
		name: "Dos Equis Beer",
		department: "unclassified"
	},
	{
		name: "Royal Basmati Rice",
		department: "unclassified"
	},
	{
		name: "Juicy Juice 100% Juice",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Pie Crust Mix",
		department: "unclassified"
	},
	{
		name: "Simply Jif Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Knorr Vegetable Bouillon",
		department: "unclassified"
	},
	{
		name: "Goya Capers",
		department: "unclassified"
	},
	{
		name: "Thomas Bagels",
		department: "unclassified"
	},
	{
		name: "Flatout Flatbread Wraps",
		department: "unclassified"
	},
	{
		name: "Bellino Pesto Sauce",
		department: "unclassified"
	},
	{
		name: "Artisana Coconut Butter",
		department: "unclassified"
	},
	{
		name: "Linwoods Flaxseed",
		department: "unclassified"
	},
	{
		name: "Greek Gods Yogurt",
		department: "unclassified"
	},
	{
		name: "Wild Planet Tuna",
		department: "unclassified"
	},
	{
		name: "Golden Blossom Honey",
		department: "unclassified"
	},
	{
		name: "Bakers Coconut",
		department: "unclassified"
	},
	{
		name: "McCormick Allspice",
		department: "unclassified"
	},
	{
		name: "Airheads Candy",
		department: "unclassified"
	},
	{
		name: "Smithfield Pork Tenderloin",
		department: "unclassified"
	},
	{
		name: "DeLallo Orzo",
		department: "unclassified"
	},
	{
		name: " Corn Bread",
		department: "unclassified"
	},
	{
		name: "Kitchen Basics Beef Stock",
		department: "unclassified"
	},
	{
		name: "Dole Raspberries",
		department: "unclassified"
	},
	{
		name: "La Croix Sparkling Water",
		department: "unclassified"
	},
	{
		name: "Organic Valley Half & Half",
		department: "unclassified"
	},
	{
		name: "Carapelli Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Simply Organic Cayenne",
		department: "unclassified"
	},
	{
		name: "McCormick Pepper",
		department: "unclassified"
	},
	{
		name: "Willamette hops",
		department: "unclassified"
	},
	{
		name: "white squash",
		department: "unclassified"
	},
	{
		name: "white eggplant",
		department: "unclassified"
	},
	{
		name: "turnip cabbage",
		department: "unclassified"
	},
	{
		name: "tiger lily buds",
		department: "unclassified"
	},
	{
		name: "silk squash",
		department: "unclassified"
	},
	{
		name: "salted cabbage",
		department: "unclassified"
	},
	{
		name: "reduced sodium stewed tomatoes",
		department: "unclassified"
	},
	{
		name: "malagueta pepper",
		department: "unclassified"
	},
	{
		name: "grape vine leaves",
		department: "unclassified"
	},
	{
		name: "cremini caps",
		department: "unclassified"
	},
	{
		name: "cornhusks",
		department: "unclassified"
	},
	{
		name: "california garlic",
		department: "unclassified"
	},
	{
		name: "B&M Baked Beans",
		department: "unclassified"
	},
	{
		name: "tofurkey",
		department: "unclassified"
	},
	{
		name: "Green Giant\\u2122 Steamers\\u2122 frozen honey roasted sweet corn",
		department: "unclassified"
	},
	{
		name: "light chocolate soymilk",
		department: "unclassified"
	},
	{
		name: "low-fat chocolate soy milk",
		department: "unclassified"
	},
	{
		name: "tomato soup low sodium",
		department: "unclassified"
	},
	{
		name: "pulp free orange juice",
		department: "unclassified"
	},
	{
		name: "maggi vegetable cubes",
		department: "unclassified"
	},
	{
		name: "low-fat tomato soup",
		department: "unclassified"
	},
	{
		name: "sugarcane swizzle sticks",
		department: "unclassified"
	},
	{
		name: "low-fat popcorn",
		department: "unclassified"
	},
	{
		name: "italian almond cookies",
		department: "unclassified"
	},
	{
		name: "instant pearl tapioca",
		department: "unclassified"
	},
	{
		name: "ibarra",
		department: "unclassified"
	},
	{
		name: "hostess twinkies",
		department: "unclassified"
	},
	{
		name: "skinless pollock fillets",
		department: "unclassified"
	},
	{
		name: "opah fillets",
		department: "unclassified"
	},
	{
		name: "opah",
		department: "unclassified"
	},
	{
		name: "ono fillets",
		department: "unclassified"
	},
	{
		name: "crappie fillets",
		department: "unclassified"
	},
	{
		name: "whole wheat ditalini",
		department: "unclassified"
	},
	{
		name: "uncooked lasagna",
		department: "unclassified"
	},
	{
		name: "stuffed pasta",
		department: "unclassified"
	},
	{
		name: "powdered vitamin c",
		department: "unclassified"
	},
	{
		name: "gold leaf foil",
		department: "unclassified"
	},
	{
		name: "sheep casings",
		department: "unclassified"
	},
	{
		name: "round bone pot roast",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Beef Franks",
		department: "unclassified"
	},
	{
		name: "meat jus",
		department: "unclassified"
	},
	{
		name: "low-fat pepperoni",
		department: "unclassified"
	},
	{
		name: "Hormel Corned Beef",
		department: "unclassified"
	},
	{
		name: "crocodile",
		department: "unclassified"
	},
	{
		name: "chopmeat",
		department: "unclassified"
	},
	{
		name: "breakfast steak",
		department: "unclassified"
	},
	{
		name: "purchased coleslaw",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Asian Sides\\u2122 - Chicken Fried Rice",
		department: "unclassified"
	},
	{
		name: "zante raisins",
		department: "unclassified"
	},
	{
		name: "uniq fruit",
		department: "unclassified"
	},
	{
		name: "eureka lemon",
		department: "unclassified"
	},
	{
		name: "cooked Italian sweet sausages",
		department: "unclassified"
	},
	{
		name: "Peruvian corn",
		department: "unclassified"
	},
	{
		name: "Zing Zang Bloody Mary Mix",
		department: "unclassified"
	},
	{
		name: "wheatgrass juice",
		department: "unclassified"
	},
	{
		name: "tom collins mix",
		department: "unclassified"
	},
	{
		name: "rosehip tea",
		department: "unclassified"
	},
	{
		name: "low sodium vegetable juice cocktail",
		department: "unclassified"
	},
	{
		name: "Lipton Bedtime Story Caffeine-Free Herbal Pyramid Tea Bag",
		department: "unclassified"
	},
	{
		name: "lemon-lime seltzer water",
		department: "unclassified"
	},
	{
		name: "green jasmine tea",
		department: "unclassified"
	},
	{
		name: "espresso creme anglaise",
		department: "unclassified"
	},
	{
		name: "english breakfast tea leaves",
		department: "unclassified"
	},
	{
		name: "diet black cherry soda",
		department: "unclassified"
	},
	{
		name: "crystal light powdered drink mix",
		department: "unclassified"
	},
	{
		name: "take control light spread",
		department: "unclassified"
	},
	{
		name: "soft low-fat cream cheese",
		department: "unclassified"
	},
	{
		name: "requeson cheese",
		department: "unclassified"
	},
	{
		name: "nonfat fruit yogurt",
		department: "unclassified"
	},
	{
		name: "lukewarm 2% low-fat milk",
		department: "unclassified"
	},
	{
		name: "low-fat monterey jack",
		department: "unclassified"
	},
	{
		name: "low-fat fruit yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat double cream",
		department: "unclassified"
	},
	{
		name: "low-fat coffee-flavored yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat banana cream yogurt",
		department: "unclassified"
	},
	{
		name: "hoop cheese",
		department: "unclassified"
	},
	{
		name: "fat-free frozen chocolate yogurt",
		department: "unclassified"
	},
	{
		name: "Danish Creamery Butter",
		department: "unclassified"
	},
	{
		name: "coffee low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "coffee low-fat frozen yogurt",
		department: "unclassified"
	},
	{
		name: "2% low-fat evaporated milk",
		department: "unclassified"
	},
	{
		name: "xeres vinegar",
		department: "unclassified"
	},
	{
		name: "vindaloo paste",
		department: "unclassified"
	},
	{
		name: "tomato sauce reduced sodium",
		department: "unclassified"
	},
	{
		name: "sweet cumin",
		department: "unclassified"
	},
	{
		name: "seasoned fries",
		department: "unclassified"
	},
	{
		name: "reduced sodium fish sauce",
		department: "unclassified"
	},
	{
		name: "Pam No-Stick Cooking Spray",
		department: "unclassified"
	},
	{
		name: "ms dash",
		department: "unclassified"
	},
	{
		name: "morton nature seasoning",
		department: "unclassified"
	},
	{
		name: "low-fat vinaigrette",
		department: "unclassified"
	},
	{
		name: "low-fat raspberry vinaigrette",
		department: "unclassified"
	},
	{
		name: "low-fat ginger vinaigrette",
		department: "unclassified"
	},
	{
		name: "low-fat chunky pasta sauce",
		department: "unclassified"
	},
	{
		name: "lite sodium soy sauce",
		department: "unclassified"
	},
	{
		name: "liquid aloe vera",
		department: "unclassified"
	},
	{
		name: "latin seasoning mix",
		department: "unclassified"
	},
	{
		name: "Knorr Four Cheese sauce mix",
		department: "unclassified"
	},
	{
		name: "jerez vinegar",
		department: "unclassified"
	},
	{
		name: "chesapeake seasoning",
		department: "unclassified"
	},
	{
		name: "akamiso",
		department: "unclassified"
	},
	{
		name: "ajwain seed",
		department: "unclassified"
	},
	{
		name: "accent seasoning",
		department: "unclassified"
	},
	{
		name: "Smart Start Cereal",
		department: "unclassified"
	},
	{
		name: "low-fat waffles",
		department: "unclassified"
	},
	{
		name: "crunchy oat cereal",
		department: "unclassified"
	},
	{
		name: "Cream of Wheat Farina",
		department: "unclassified"
	},
	{
		name: "cream of buckwheat",
		department: "unclassified"
	},
	{
		name: "corn cereal flakes",
		department: "unclassified"
	},
	{
		name: "whole wheat sourdough",
		department: "unclassified"
	},
	{
		name: "whole wheat kaiser rolls",
		department: "unclassified"
	},
	{
		name: "whole wheat ciabatta",
		department: "unclassified"
	},
	{
		name: "wet yeast",
		department: "unclassified"
	},
	{
		name: "sourdough levain",
		department: "unclassified"
	},
	{
		name: "rolled lamb roast",
		department: "unclassified"
	},
	{
		name: "pumpernickel loaf",
		department: "unclassified"
	},
	{
		name: "portuguese sweet bread",
		department: "unclassified"
	},
	{
		name: "pastry tart shell",
		department: "unclassified"
	},
	{
		name: "panini buns",
		department: "unclassified"
	},
	{
		name: "mochi flour",
		department: "unclassified"
	},
	{
		name: "malt sugar",
		department: "unclassified"
	},
	{
		name: "Jiffy Biscuit Mix",
		department: "unclassified"
	},
	{
		name: "italian style rolls",
		department: "unclassified"
	},
	{
		name: "high fiber rolls",
		department: "unclassified"
	},
	{
		name: "french style sandwich rolls",
		department: "unclassified"
	},
	{
		name: "Bakers Angel Flake Coconut",
		department: "unclassified"
	},
	{
		name: "yukon jack",
		department: "unclassified"
	},
	{
		name: "stolichnaya",
		department: "unclassified"
	},
	{
		name: "flavored wine",
		department: "unclassified"
	},
	{
		name: "cab",
		department: "unclassified"
	},
	{
		name: "Bluecoat Gin",
		department: "unclassified"
	},
	{
		name: "anise-flavor liqueur",
		department: "unclassified"
	},
	{
		name: "cassis puree",
		department: "unclassified"
	},
	{
		name: "low fat thousand island dressing",
		department: "unclassified"
	},
	{
		name: "Yoplait\\u00AE Greek 2% Key lime pie yogurt",
		department: "unclassified"
	},
	{
		name: "white chard",
		department: "unclassified"
	},
	{
		name: "dark chocolate hot cocoa mix",
		department: "unclassified"
	},
	{
		name: "garlic rolls",
		department: "unclassified"
	},
	{
		name: "tasajo",
		department: "unclassified"
	},
	{
		name: "New Amsterdam Gin",
		department: "unclassified"
	},
	{
		name: "japanese peanuts",
		department: "unclassified"
	},
	{
		name: "House Foods Medium Firm Tofu",
		department: "unclassified"
	},
	{
		name: "Mavrodaphne",
		department: "unclassified"
	},
	{
		name: "macaroon crumbs",
		department: "unclassified"
	},
	{
		name: "ground sassafras leaves",
		department: "unclassified"
	},
	{
		name: "Sutter Home Sauvignon Blanc",
		department: "unclassified"
	},
	{
		name: "kishke",
		department: "unclassified"
	},
	{
		name: "Driscolls Raspberries",
		department: "unclassified"
	},
	{
		name: "chinese winter melon",
		department: "unclassified"
	},
	{
		name: "white chocolate ice cream",
		department: "unclassified"
	},
	{
		name: "dill hamburger slices",
		department: "unclassified"
	},
	{
		name: "croustade",
		department: "unclassified"
	},
	{
		name: "corvina",
		department: "unclassified"
	},
	{
		name: "hedgehog mushroom",
		department: "unclassified"
	},
	{
		name: "cassia sticks",
		department: "unclassified"
	},
	{
		name: "chitarra",
		department: "unclassified"
	},
	{
		name: "sesame baguettes",
		department: "unclassified"
	},
	{
		name: "Taiwanese bok choy",
		department: "unclassified"
	},
	{
		name: "peach lemonade",
		department: "unclassified"
	},
	{
		name: "victoria perch fillet",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE Sweet Italian Turkey Sausage Links",
		department: "unclassified"
	},
	{
		name: "fat free strawberry cream cheese",
		department: "unclassified"
	},
	{
		name: "boneless sirloin roast",
		department: "unclassified"
	},
	{
		name: "cooked snails",
		department: "unclassified"
	},
	{
		name: "ground pumpkin seeds",
		department: "unclassified"
	},
	{
		name: "pinoli",
		department: "unclassified"
	},
	{
		name: "cuitlacoche",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Sweet Chili Dressing",
		department: "unclassified"
	},
	{
		name: "green cubanelle peppers",
		department: "unclassified"
	},
	{
		name: "kudzu leaves",
		department: "unclassified"
	},
	{
		name: "Rice-A-Roni Long Grain & Wild Rice",
		department: "unclassified"
	},
	{
		name: "Kraft Shredded Low-Moisture Whole Milk Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "babka",
		department: "unclassified"
	},
	{
		name: "chinese vermicelli",
		department: "unclassified"
	},
	{
		name: "gold leaves",
		department: "unclassified"
	},
	{
		name: "fast food fries",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Apple Chicken Sausage",
		department: "unclassified"
	},
	{
		name: "cepe",
		department: "unclassified"
	},
	{
		name: "Treasure Cave Crumbled Blue Cheese",
		department: "unclassified"
	},
	{
		name: "pepper-crusted steak",
		department: "unclassified"
	},
	{
		name: "jumbo pitted olives",
		department: "unclassified"
	},
	{
		name: "chermoula spice blend",
		department: "unclassified"
	},
	{
		name: "sweet tamarind",
		department: "unclassified"
	},
	{
		name: "maisscharreleieren",
		department: "unclassified"
	},
	{
		name: "daun salam",
		department: "unclassified"
	},
	{
		name: "fuggles hops",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Light Buttermilk Dressing",
		department: "unclassified"
	},
	{
		name: "Almond Dream Yogurt",
		department: "unclassified"
	},
	{
		name: "Simi Chardonnay",
		department: "unclassified"
	},
	{
		name: "frosting glaze",
		department: "unclassified"
	},
	{
		name: "lebanon bologna",
		department: "unclassified"
	},
	{
		name: "ready-made sweet pastry cases",
		department: "unclassified"
	},
	{
		name: "hong kong-style noodles",
		department: "unclassified"
	},
	{
		name: "baby shells",
		department: "unclassified"
	},
	{
		name: "toaster strudel",
		department: "unclassified"
	},
	{
		name: "blanc de noir",
		department: "unclassified"
	},
	{
		name: "whole fava",
		department: "unclassified"
	},
	{
		name: "lattice crust",
		department: "unclassified"
	},
	{
		name: "bel paese",
		department: "unclassified"
	},
	{
		name: "vegan gravy",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Vermont Maple Syrup Breakfast Sausage Links",
		department: "unclassified"
	},
	{
		name: "chinese ginger",
		department: "unclassified"
	},
	{
		name: "stem lettuce",
		department: "unclassified"
	},
	{
		name: "Oreo Golden Chocolate Creme Sandwich Cookies",
		department: "unclassified"
	},
	{
		name: "pistachio spinach pesto",
		department: "unclassified"
	},
	{
		name: "vermicelli nests",
		department: "unclassified"
	},
	{
		name: "rouget",
		department: "unclassified"
	},
	{
		name: "lap chong",
		department: "unclassified"
	},
	{
		name: "smooth low-fat ricotta",
		department: "unclassified"
	},
	{
		name: "whole rye berries",
		department: "unclassified"
	},
	{
		name: "turkey london broil",
		department: "unclassified"
	},
	{
		name: "Barefoot Pinot Noir",
		department: "unclassified"
	},
	{
		name: "sweet cucumber",
		department: "unclassified"
	},
	{
		name: "Casillero del Diablo Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "lactose-free whole milk",
		department: "unclassified"
	},
	{
		name: "trottole pasta",
		department: "unclassified"
	},
	{
		name: "tomato garlic pasta sauce",
		department: "unclassified"
	},
	{
		name: "friselle",
		department: "unclassified"
	},
	{
		name: "ground french roast coffee",
		department: "unclassified"
	},
	{
		name: "eggplant spread",
		department: "unclassified"
	},
	{
		name: "harusame",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Finely Shredded 6 Cheese Italian",
		department: "unclassified"
	},
	{
		name: "Hiram Walker Pomegranate Schnapps",
		department: "unclassified"
	},
	{
		name: "Gypsy peppers",
		department: "unclassified"
	},
	{
		name: "sambal bajak",
		department: "unclassified"
	},
	{
		name: "plantenmargarine",
		department: "unclassified"
	},
	{
		name: "Mirassou Sauvignon Blanc",
		department: "unclassified"
	},
	{
		name: "Johnsonville Andouille Dinner Sausage",
		department: "unclassified"
	},
	{
		name: "imitation brandy extract",
		department: "unclassified"
	},
	{
		name: "Jim Beam Whiskey",
		department: "unclassified"
	},
	{
		name: "gluten-free quinoa",
		department: "unclassified"
	},
	{
		name: "Goslings Rum",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Cucumber Dressing",
		department: "unclassified"
	},
	{
		name: "Frontier Natural Products Co-Op Bay Leaf",
		department: "unclassified"
	},
	{
		name: "lemonade iced tea",
		department: "unclassified"
	},
	{
		name: "gold leaf sheets",
		department: "unclassified"
	},
	{
		name: "edible gold luster dust",
		department: "unclassified"
	},
	{
		name: "vanilla batter",
		department: "unclassified"
	},
	{
		name: "Earthbound Farm Frozen Organic Blueberries",
		department: "unclassified"
	},
	{
		name: "rosemary aioli",
		department: "unclassified"
	},
	{
		name: "chaurice",
		department: "unclassified"
	},
	{
		name: "Ultimat Vodka",
		department: "unclassified"
	},
	{
		name: "Pyrat Rum",
		department: "unclassified"
	},
	{
		name: "garlic & herb marinade",
		department: "unclassified"
	},
	{
		name: "pineapple cream cheese spread",
		department: "unclassified"
	},
	{
		name: "yabbie",
		department: "unclassified"
	},
	{
		name: "crispy crowns",
		department: "unclassified"
	},
	{
		name: "egg linguine",
		department: "unclassified"
	},
	{
		name: "mild Gruy\\u00E9re",
		department: "unclassified"
	},
	{
		name: "soluble fiber",
		department: "unclassified"
	},
	{
		name: "Pearl Vodka",
		department: "unclassified"
	},
	{
		name: "leavening agents",
		department: "unclassified"
	},
	{
		name: "glayva",
		department: "unclassified"
	},
	{
		name: "delicioso adobo",
		department: "unclassified"
	},
	{
		name: "Earthbound Farm Deep Green Blends Kale",
		department: "unclassified"
	},
	{
		name: "orange lemonade syrup",
		department: "unclassified"
	},
	{
		name: "chrysanthemum petals",
		department: "unclassified"
	},
	{
		name: "fresh vegetable sticks",
		department: "unclassified"
	},
	{
		name: "breadstick crackers",
		department: "unclassified"
	},
	{
		name: "potsticker skins",
		department: "unclassified"
	},
	{
		name: "forest mushroom soup",
		department: "unclassified"
	},
	{
		name: "cream of wild mushroom soup",
		department: "unclassified"
	},
	{
		name: "sugar free ice cream",
		department: "unclassified"
	},
	{
		name: "pistachio nougatine",
		department: "unclassified"
	},
	{
		name: "cooked streusel topping",
		department: "unclassified"
	},
	{
		name: "Ghirardelli Classic White Chocolate Baking Chips",
		department: "unclassified"
	},
	{
		name: "vegetable-filled ravioli",
		department: "unclassified"
	},
	{
		name: "fenugreek sprouts",
		department: "unclassified"
	},
	{
		name: "chunky pico de gallo",
		department: "unclassified"
	},
	{
		name: "dense pumpernickel",
		department: "unclassified"
	},
	{
		name: "cascade hops",
		department: "unclassified"
	},
	{
		name: "serviceberries",
		department: "unclassified"
	},
	{
		name: "cuarenta y tres",
		department: "unclassified"
	},
	{
		name: "dianthus",
		department: "unclassified"
	},
	{
		name: "Smirnoff Watermelon Vodka",
		department: "unclassified"
	},
	{
		name: "hibiscus agua fresca",
		department: "unclassified"
	},
	{
		name: "Absolut Mango Vodka",
		department: "unclassified"
	},
	{
		name: "butter toffees",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Napa Valley Bistro Homemade Style Basil Pesto",
		department: "unclassified"
	},
	{
		name: "Frontier White Pepper",
		department: "unclassified"
	},
	{
		name: "unsalted roasted pecans",
		department: "unclassified"
	},
	{
		name: "blueberry nectar",
		department: "unclassified"
	},
	{
		name: "Gold's Mustard",
		department: "unclassified"
	},
	{
		name: "cultured butter with sea salt",
		department: "unclassified"
	},
	{
		name: "baby hakurei turnips",
		department: "unclassified"
	},
	{
		name: "baby purple artichokes",
		department: "unclassified"
	},
	{
		name: "english roast",
		department: "unclassified"
	},
	{
		name: "spicy fat-free refried beans",
		department: "unclassified"
	},
	{
		name: "spicy non-fat refried beans",
		department: "unclassified"
	},
	{
		name: "fresh paprika cheese",
		department: "unclassified"
	},
	{
		name: "amaretto vodka",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Smoked Paprika",
		department: "unclassified"
	},
	{
		name: "24 karat gold leaf",
		department: "unclassified"
	},
	{
		name: "Pete and Gerry's Organic Eggs",
		department: "unclassified"
	},
	{
		name: "licorice gumdrops",
		department: "unclassified"
	},
	{
		name: "DeLallo Balsamic Glaze",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Rice Sides\\u2122 Steak Fajitas flavor",
		department: "unclassified"
	},
	{
		name: "reduced sugar apricot jam",
		department: "unclassified"
	},
	{
		name: "ham sausages",
		department: "unclassified"
	},
	{
		name: "Crown Royal Blended Canadian Whisky",
		department: "unclassified"
	},
	{
		name: "canistel",
		department: "unclassified"
	},
	{
		name: "tuvar",
		department: "unclassified"
	},
	{
		name: "emu",
		department: "unclassified"
	},
	{
		name: "horseradish puree",
		department: "unclassified"
	},
	{
		name: "blueberry honey",
		department: "unclassified"
	},
	{
		name: "kettle dumplings",
		department: "unclassified"
	},
	{
		name: "toffee shards",
		department: "unclassified"
	},
	{
		name: "grape vodka",
		department: "unclassified"
	},
	{
		name: "yuzu rice vinegar",
		department: "unclassified"
	},
	{
		name: "cassava meal",
		department: "unclassified"
	},
	{
		name: "farinha de mandioca",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Lean Italian Seasoned Ground Turkey",
		department: "unclassified"
	},
	{
		name: "frozen salmon fillets",
		department: "unclassified"
	},
	{
		name: "Gorton\\u2019s Simply Bake Salmon",
		department: "unclassified"
	},
	{
		name: "yaki dofu",
		department: "unclassified"
	},
	{
		name: "grilled tofu",
		department: "unclassified"
	},
	{
		name: "trenette pasta",
		department: "unclassified"
	},
	{
		name: "pointed gourd",
		department: "unclassified"
	},
	{
		name: "Stacy's\\u00AE Parmesan Garlic & Herb Pita Chips",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Deli-Sliced Golden Greek Peperoncini",
		department: "unclassified"
	},
	{
		name: "Earthbound Farm Organic Red Raspberries",
		department: "unclassified"
	},
	{
		name: "Silk Chocolate Soymilk",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Greek Yogurt Original Ranch\\u00AE Dressing Mix",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Greek Yogurt Original Ranch\\u00AE Dip Mix",
		department: "unclassified"
	},
	{
		name: "Kraft Slim Cut Swiss Cheese Slices",
		department: "unclassified"
	},
	{
		name: "Kraft Horseradish",
		department: "unclassified"
	},
	{
		name: "KRAFT Slim Cut Sharp Cheddar Cheese Slices",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Shredded Wisconsin Monterey Jack Cheese",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Ancho Chile Powder",
		department: "unclassified"
	},
	{
		name: "Crystal Farms\\u00AE Shredded Parmesan Cheese",
		department: "unclassified"
	},
	{
		name: "gluten-free oyster sauce",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Sweet Italian Sausage Links",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Classic Italian Style Meatballs",
		department: "unclassified"
	},
	{
		name: "Green Giant\\u2122 Roasted Veggie Zesty Cheddar Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Brancamenta Mint Liqueur",
		department: "unclassified"
	},
	{
		name: "Starbucks\\u00AE Unsweetened Iced Coffee Beverage - Brewed to Personalize",
		department: "unclassified"
	},
	{
		name: "tortilla soup spice blend",
		department: "unclassified"
	},
	{
		name: "coleslaw seasoning blend",
		department: "unclassified"
	},
	{
		name: "fried chicken seasoning mix",
		department: "unclassified"
	},
	{
		name: "basil cream sauce",
		department: "unclassified"
	},
	{
		name: "Deluxe Yellow Cake Mix",
		department: "unclassified"
	},
	{
		name: "black patent malt",
		department: "unclassified"
	},
	{
		name: "turkey tournedos",
		department: "unclassified"
	},
	{
		name: "kalkoentournedos",
		department: "unclassified"
	},
	{
		name: "quail stock",
		department: "unclassified"
	},
	{
		name: "Leffe",
		department: "unclassified"
	},
	{
		name: "light apple pie filling",
		department: "unclassified"
	},
	{
		name: "low-fat pineapple yogurt",
		department: "unclassified"
	},
	{
		name: "nonfat strawberry-banana yogurt",
		department: "unclassified"
	},
	{
		name: "plain donuts",
		department: "unclassified"
	},
	{
		name: "Breyers\\u2122 Chocolate Flavored Ice Cream Sauce",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Coffee Ice Cream",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE 1/2 the Fat Creamy Chocolate Light Ice Cream",
		department: "unclassified"
	},
	{
		name: "Breyers BLASTS!\\u00AE Girl Scout Cookies\\u00AE Thin Mints\\u00AE",
		department: "unclassified"
	},
	{
		name: "Unox Pompoensoep",
		department: "unclassified"
	},
	{
		name: "Conimex Laos",
		department: "unclassified"
	},
	{
		name: "Bertolli Pastasaus Kaas & Basilicum",
		department: "unclassified"
	},
	{
		name: "Blue Dragon Light Coconut Milk",
		department: "unclassified"
	},
	{
		name: "Pasta Roni Angel Hair Pasta",
		department: "unclassified"
	},
	{
		name: "Maille Red Wine Vinegar",
		department: "unclassified"
	},
	{
		name: "Wish-Bone Light Buffalo Ranch Dressing",
		department: "unclassified"
	},
	{
		name: "Goya Chick Peas",
		department: "unclassified"
	},
	{
		name: "Progresso Chick Peas",
		department: "unclassified"
	},
	{
		name: "Kraft Monterey Jack Cheese",
		department: "unclassified"
	},
	{
		name: "DiGiorno Grated Romano Cheese",
		department: "unclassified"
	},
	{
		name: "Sargento Shredded Mild Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "2% reduced fat chocolate milk",
		department: "unclassified"
	},
	{
		name: "triple mushroom pasta sauce",
		department: "unclassified"
	},
	{
		name: "Hy-Vee Garlic Powder",
		department: "unclassified"
	},
	{
		name: "Stoli Vanil",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Homestyle Stock\\u2122 Vegetable Stock",
		department: "unclassified"
	},
	{
		name: "Kraft Pepper Jack Cheese",
		department: "unclassified"
	},
	{
		name: "Domino Dark Brown Sugar",
		department: "unclassified"
	},
	{
		name: "naturelchips",
		department: "unclassified"
	},
	{
		name: "fish nuggets",
		department: "unclassified"
	},
	{
		name: "banana gummies",
		department: "unclassified"
	},
	{
		name: "pork bouillon",
		department: "unclassified"
	},
	{
		name: "fennel tea",
		department: "unclassified"
	},
	{
		name: "canned chili peppers",
		department: "unclassified"
	},
	{
		name: "canned shrimp",
		department: "unclassified"
	},
	{
		name: "canned peas and carrots",
		department: "unclassified"
	},
	{
		name: "cheese puffs",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Dried Oregano",
		department: "unclassified"
	},
	{
		name: "chocolate frosting mix",
		department: "unclassified"
	},
	{
		name: "coffee bitters",
		department: "unclassified"
	},
	{
		name: "johnnycake meal",
		department: "unclassified"
	},
	{
		name: "purple curly kale",
		department: "unclassified"
	},
	{
		name: "barley meal",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Hot Cherry Peppers",
		department: "unclassified"
	},
	{
		name: "Manischewitz Matzo Ball Mix",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Spanish Manzanilla Olives with Minced Pimento",
		department: "unclassified"
	},
	{
		name: "Mezzetta Napa Valley Homemade Tomato & Sweet Basil Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "white beech mushrooms",
		department: "unclassified"
	},
	{
		name: "Mezzetta Sweet Banana Wax Peppers",
		department: "unclassified"
	},
	{
		name: "Sargento Ricotta Cheese",
		department: "unclassified"
	},
	{
		name: "Snack Factory Pretzel Crisps",
		department: "unclassified"
	},
	{
		name: "Goya Beans",
		department: "unclassified"
	},
	{
		name: "Kikkoman Oyster Sauce",
		department: "unclassified"
	},
	{
		name: "Simply Organic Paprika",
		department: "unclassified"
	},
	{
		name: "M&Ms Chocolate Candies",
		department: "unclassified"
	},
	{
		name: "DeLallo Penne Ziti",
		department: "unclassified"
	},
	{
		name: "Hershey's Eggies",
		department: "unclassified"
	},
	{
		name: "Dole Peaches",
		department: "unclassified"
	},
	{
		name: "McCormick Poppy Seed",
		department: "unclassified"
	},
	{
		name: "Walden Farms Pancake Syrup",
		department: "unclassified"
	},
	{
		name: "Jimmy Dean Bacon",
		department: "unclassified"
	},
	{
		name: "Krakus Ham",
		department: "unclassified"
	},
	{
		name: "Organic Valley Pasture Butter",
		department: "unclassified"
	},
	{
		name: "Lindt White Chocolate",
		department: "unclassified"
	},
	{
		name: "turtle candy",
		department: "unclassified"
	},
	{
		name: "Turtles Candy",
		department: "unclassified"
	},
	{
		name: "Ritz Toasted Chips",
		department: "unclassified"
	},
	{
		name: "Wilton Cookie Icing",
		department: "unclassified"
	},
	{
		name: "Melt Buttery Spread",
		department: "unclassified"
	},
	{
		name: "MorningStar Farms Garden Veggie Patties",
		department: "unclassified"
	},
	{
		name: "La Victoria Taco Sauce",
		department: "unclassified"
	},
	{
		name: "Smuckers Hot Fudge Topping",
		department: "unclassified"
	},
	{
		name: "Modena Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Tantillo Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Red Gold Salsa",
		department: "unclassified"
	},
	{
		name: "Kraft Tartar Sauce",
		department: "unclassified"
	},
	{
		name: "Light N'' Fluffy Egg Noodles",
		department: "unclassified"
	},
	{
		name: "Thai Kitchen Jasmine Rice",
		department: "unclassified"
	},
	{
		name: "Goya Pink Beans",
		department: "unclassified"
	},
	{
		name: "Bisquick Pancake and Baking Mix",
		department: "unclassified"
	},
	{
		name: "Pacific Chicken Broth",
		department: "unclassified"
	},
	{
		name: "McCormick Greek Seasoning",
		department: "unclassified"
	},
	{
		name: "Creamette Elbow Macaroni",
		department: "unclassified"
	},
	{
		name: "Scharffen Berger Chocolate",
		department: "unclassified"
	},
	{
		name: "Oreo Brownie",
		department: "unclassified"
	},
	{
		name: "Artisanal Cheddar",
		department: "unclassified"
	},
	{
		name: "Hershey''s Candy",
		department: "unclassified"
	},
	{
		name: "Dunkin Donuts Coffee",
		department: "unclassified"
	},
	{
		name: "Lipton Black Tea",
		department: "unclassified"
	},
	{
		name: "Hersheys Cocoa",
		department: "unclassified"
	},
	{
		name: "McCormick Seafood Fry Mix",
		department: "unclassified"
	},
	{
		name: "Horizon Half & Half",
		department: "unclassified"
	},
	{
		name: "Borden Cottage Cheese",
		department: "unclassified"
	},
	{
		name: "Del Monte Ketchup",
		department: "unclassified"
	},
	{
		name: "McCormick Italian Herb Seasoning",
		department: "unclassified"
	},
	{
		name: "Pillsbury Brownies",
		department: "unclassified"
	},
	{
		name: "Wrights Liquid Smoke",
		department: "unclassified"
	},
	{
		name: "Knudsen Cottage Cheese",
		department: "unclassified"
	},
	{
		name: "Lee Kum Kee Hoisin Sauce",
		department: "unclassified"
	},
	{
		name: "Tone''s Garlic",
		department: "unclassified"
	},
	{
		name: "Davis Baking Powder",
		department: "unclassified"
	},
	{
		name: "Spice Islands Garlic Salt",
		department: "unclassified"
	},
	{
		name: "fruit flavored breath mints",
		department: "unclassified"
	},
	{
		name: "Skittles Candies",
		department: "unclassified"
	},
	{
		name: "Almond Joy Candy",
		department: "unclassified"
	},
	{
		name: "Wholesome Sweeteners Organic Light Brown Sugar",
		department: "unclassified"
	},
	{
		name: "Domino Brown Sugar",
		department: "unclassified"
	},
	{
		name: "Organic Valley Eggnog",
		department: "unclassified"
	},
	{
		name: "McCormick Coconut Extract",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Bread",
		department: "unclassified"
	},
	{
		name: "Simply Organic Ginger",
		department: "unclassified"
	},
	{
		name: "Folgers Coffee",
		department: "unclassified"
	},
	{
		name: "Kraft Dressing",
		department: "unclassified"
	},
	{
		name: "Black Butte Porter",
		department: "unclassified"
	},
	{
		name: "Spice Islands Parsley",
		department: "unclassified"
	},
	{
		name: "Bar S Franks",
		department: "unclassified"
	},
	{
		name: "Del Monte Sliced Carrots",
		department: "unclassified"
	},
	{
		name: "Tostitos  Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Nido Milk Powder",
		department: "unclassified"
	},
	{
		name: "Old Bay Blackened Seasoning",
		department: "unclassified"
	},
	{
		name: "Anna Ditalini",
		department: "unclassified"
	},
	{
		name: "Dairy Fresh Sour Cream",
		department: "unclassified"
	},
	{
		name: "Planters Cashew",
		department: "unclassified"
	},
	{
		name: "Angry Orchard Hard Cider",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Chipotle Chile Powder",
		department: "unclassified"
	},
	{
		name: "Spice Islands Ground Chipotle Chile",
		department: "unclassified"
	},
	{
		name: "Maria Biscuits",
		department: "unclassified"
	},
	{
		name: "Farmer John Bacon",
		department: "unclassified"
	},
	{
		name: "Manitoba Harvest Hemp Protein Powder",
		department: "unclassified"
	},
	{
		name: "Colgin Liquid Smoke",
		department: "unclassified"
	},
	{
		name: "Spectrum Coconut Oil",
		department: "unclassified"
	},
	{
		name: "Reddi-wip Whipped Cream",
		department: "unclassified"
	},
	{
		name: "Country Corn Flakes Cereal",
		department: "unclassified"
	},
	{
		name: "Applegate Turkey Bacon",
		department: "unclassified"
	},
	{
		name: "Simply Organic Cumin",
		department: "unclassified"
	},
	{
		name: "Once Again Cashew Butter",
		department: "unclassified"
	},
	{
		name: "Chips Ahoy! Cookies",
		department: "unclassified"
	},
	{
		name: "Simply Organic Basil",
		department: "unclassified"
	},
	{
		name: "Toasted Oat Bran Cereal",
		department: "unclassified"
	},
	{
		name: "Velveeta Cheese Sauce",
		department: "unclassified"
	},
	{
		name: "Colavita Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Woodbridge Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "Amore Garlic Paste",
		department: "unclassified"
	},
	{
		name: "Gekkeikan Sake",
		department: "unclassified"
	},
	{
		name: "Minute Maid Pink Lemonade",
		department: "unclassified"
	},
	{
		name: "Thai Kitchen Peanut Satay Sauce",
		department: "unclassified"
	},
	{
		name: "Goya Pimientos",
		department: "unclassified"
	},
	{
		name: "Underwood Deviled Ham Spread",
		department: "unclassified"
	},
	{
		name: "Diamond of California Hazelnuts",
		department: "unclassified"
	},
	{
		name: "Buitoni Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "McCormick Celery Seed",
		department: "unclassified"
	},
	{
		name: "McCormick Ground White Pepper",
		department: "unclassified"
	},
	{
		name: "Just Bare Chicken Thighs",
		department: "unclassified"
	},
	{
		name: "Frosted Mini Wheats Cereal",
		department: "unclassified"
	},
	{
		name: "Rice A Roni Rice Pilaf",
		department: "unclassified"
	},
	{
		name: "Watkins Paprika",
		department: "unclassified"
	},
	{
		name: "Mrs Dash Garlic & Herb Seasoning Blend",
		department: "unclassified"
	},
	{
		name: "Organic Valley Cream Cheese",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Gourmet Collection Ancho Chile Pepper",
		department: "unclassified"
	},
	{
		name: "Barilla Rigatoni",
		department: "unclassified"
	},
	{
		name: "Barefoot Chardonnay",
		department: "unclassified"
	},
	{
		name: "Manischewitz Egg Noodles",
		department: "unclassified"
	},
	{
		name: "Planters Peanuts",
		department: "unclassified"
	},
	{
		name: "Jumex Peach Nectar",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Cupcake Icing",
		department: "unclassified"
	},
	{
		name: "McCormick Cinnamon Extract",
		department: "unclassified"
	},
	{
		name: "Just Bare Chicken Drumsticks",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Hard Salami",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Salami",
		department: "unclassified"
	},
	{
		name: "Holland House White Wine Vinegar",
		department: "unclassified"
	},
	{
		name: "Thai Kitchen Thin Rice Noodles",
		department: "unclassified"
	},
	{
		name: "Chicken in a Biskit Crackers",
		department: "unclassified"
	},
	{
		name: "Mrs. T''s Pierogies",
		department: "unclassified"
	},
	{
		name: "McCormick Chipotle Chile Pepper",
		department: "unclassified"
	},
	{
		name: "Wilton Rolled Fondant",
		department: "unclassified"
	},
	{
		name: "Spice Islands Celery Salt",
		department: "unclassified"
	},
	{
		name: "Fruit & Fibre Cereal",
		department: "unclassified"
	},
	{
		name: "Dole Red Grapefruit Sunrise",
		department: "unclassified"
	},
	{
		name: "Sara Lee Cheesecake",
		department: "unclassified"
	},
	{
		name: "Anna Capellini",
		department: "unclassified"
	},
	{
		name: "Alexia Waffle Fries",
		department: "unclassified"
	},
	{
		name: "Mezzetta Pesto",
		department: "unclassified"
	},
	{
		name: "Fudge Stripes Cookies",
		department: "unclassified"
	},
	{
		name: "Manischewitz Potato Pancake Mix",
		department: "unclassified"
	},
	{
		name: "La Choy Rice Noodles",
		department: "unclassified"
	},
	{
		name: "Monster Energy Drink",
		department: "unclassified"
	},
	{
		name: "Red Pack Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "DeLallo Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Rodelle Lemon Extract",
		department: "unclassified"
	},
	{
		name: "Stubbs BBQ Sauce",
		department: "unclassified"
	},
	{
		name: "smoked turkey slices",
		department: "unclassified"
	},
	{
		name: "winged beans",
		department: "unclassified"
	},
	{
		name: "whole peperoncini",
		department: "unclassified"
	},
	{
		name: "turtle beans",
		department: "unclassified"
	},
	{
		name: "sweet banana",
		department: "unclassified"
	},
	{
		name: "swede turnip",
		department: "unclassified"
	},
	{
		name: "low fat granola without raisins",
		department: "unclassified"
	},
	{
		name: "squash flowers",
		department: "unclassified"
	},
	{
		name: "nopal cactus paddles",
		department: "unclassified"
	},
	{
		name: "nonpoisonous flowers",
		department: "unclassified"
	},
	{
		name: "matchstick fries",
		department: "unclassified"
	},
	{
		name: "makrut lime leaf",
		department: "unclassified"
	},
	{
		name: "low sodium green beans",
		department: "unclassified"
	},
	{
		name: "limestone lettuce",
		department: "unclassified"
	},
	{
		name: "italian garlic",
		department: "unclassified"
	},
	{
		name: "italian flat leaf",
		department: "unclassified"
	},
	{
		name: "dried cloud ears",
		department: "unclassified"
	},
	{
		name: "chinese pepper",
		department: "unclassified"
	},
	{
		name: "calabrian chile",
		department: "unclassified"
	},
	{
		name: "broccoli romanesco",
		department: "unclassified"
	},
	{
		name: "begonia blossoms",
		department: "unclassified"
	},
	{
		name: "bee balm",
		department: "unclassified"
	},
	{
		name: "banana chile",
		department: "unclassified"
	},
	{
		name: "firm silken low-fat tofu",
		department: "unclassified"
	},
	{
		name: "soy bacon",
		department: "unclassified"
	},
	{
		name: "plain low-fat soymilk",
		department: "unclassified"
	},
	{
		name: "low sodium chicken stock powder",
		department: "unclassified"
	},
	{
		name: "low sodium canned beef broth",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Homestyle Stock - Reduced Sodium Chicken",
		department: "unclassified"
	},
	{
		name: "knorr chicken broth",
		department: "unclassified"
	},
	{
		name: "Knorr Chicken Broth",
		department: "unclassified"
	},
	{
		name: "homemade giblet stock",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Fruit Roll Ups",
		department: "unclassified"
	},
	{
		name: "chicken glace",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE HARVESTLAND\\u00AE Fresh Whole Chicken With Giblets",
		department: "unclassified"
	},
	{
		name: "brown chicken broth",
		department: "unclassified"
	},
	{
		name: "whole wheat honey graham crackers",
		department: "unclassified"
	},
	{
		name: "Wheatables Crackers",
		department: "unclassified"
	},
	{
		name: "unsalted roasted macadamias",
		department: "unclassified"
	},
	{
		name: "Skor Candy Bar",
		department: "unclassified"
	},
	{
		name: "Reeses Peanut Butter Cup",
		department: "unclassified"
	},
	{
		name: "lorna doone",
		department: "unclassified"
	},
	{
		name: "Hostess Cupcakes",
		department: "unclassified"
	},
	{
		name: "Goya Maria Cookies",
		department: "unclassified"
	},
	{
		name: "Ginger Snaps Cookies",
		department: "unclassified"
	},
	{
		name: "continental chocolate",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE HARVESTLAND\\u00AE Fresh Boneless Skinless Chicken Breasts",
		department: "unclassified"
	},
	{
		name: "white sea bass",
		department: "unclassified"
	},
	{
		name: "smoked sable",
		department: "unclassified"
	},
	{
		name: "lumache",
		department: "unclassified"
	},
	{
		name: "lingcod",
		department: "unclassified"
	},
	{
		name: "escolar",
		department: "unclassified"
	},
	{
		name: "wild pecan rice",
		department: "unclassified"
	},
	{
		name: "whole wheat capellini",
		department: "unclassified"
	},
	{
		name: "Pasta Roni Angel Hair Pasta with Herbs",
		department: "unclassified"
	},
	{
		name: "napkin dumplings",
		department: "unclassified"
	},
	{
		name: "Lundberg Wild Rice",
		department: "unclassified"
	},
	{
		name: "dried fettuccini",
		department: "unclassified"
	},
	{
		name: "dried conchiglie",
		department: "unclassified"
	},
	{
		name: "black pasta",
		department: "unclassified"
	},
	{
		name: "veal rib",
		department: "unclassified"
	},
	{
		name: "sweet chorizo",
		department: "unclassified"
	},
	{
		name: "spicy low-fat chicken sausages",
		department: "unclassified"
	},
	{
		name: "side meat",
		department: "unclassified"
	},
	{
		name: "sheep tongue",
		department: "unclassified"
	},
	{
		name: "Pacific halibut fillets",
		department: "unclassified"
	},
	{
		name: "reindeer meat",
		department: "unclassified"
	},
	{
		name: "pork loin end roast",
		department: "unclassified"
	},
	{
		name: "pickled tongue",
		department: "unclassified"
	},
	{
		name: "pork neck steak",
		department: "unclassified"
	},
	{
		name: "low fat mild Italian turkey sausage",
		department: "unclassified"
	},
	{
		name: "low-fat italian sausage",
		department: "unclassified"
	},
	{
		name: "low-fat ground turkey",
		department: "unclassified"
	},
	{
		name: "low fat chicken in water",
		department: "unclassified"
	},
	{
		name: "lean reduced sodium ham",
		department: "unclassified"
	},
	{
		name: "lean chop meat",
		department: "unclassified"
	},
	{
		name: "lamb spareribs",
		department: "unclassified"
	},
	{
		name: "lamb rib roast",
		department: "unclassified"
	},
	{
		name: "italian bacon",
		department: "unclassified"
	},
	{
		name: "fresh pork picnic",
		department: "unclassified"
	},
	{
		name: "eye steaks",
		department: "unclassified"
	},
	{
		name: "denver lamb ribs",
		department: "unclassified"
	},
	{
		name: "degreased turkey drippings",
		department: "unclassified"
	},
	{
		name: "coppa salami",
		department: "unclassified"
	},
	{
		name: "camel",
		department: "unclassified"
	},
	{
		name: "boneless turkey roast",
		department: "unclassified"
	},
	{
		name: "baloney",
		department: "unclassified"
	},
	{
		name: "low-fat coleslaw",
		department: "unclassified"
	},
	{
		name: "peeled yuca",
		department: "unclassified"
	},
	{
		name: "gravenstein apple",
		department: "unclassified"
	},
	{
		name: "whipped nondairy topping",
		department: "unclassified"
	},
	{
		name: "low-fat peppermint ice cream",
		department: "unclassified"
	},
	{
		name: "Ortega Thick & Chunky Salsa",
		department: "unclassified"
	},
	{
		name: "v8 vegetable juice",
		department: "unclassified"
	},
	{
		name: "tropical punch mix",
		department: "unclassified"
	},
	{
		name: "ReaLime Lime Juice",
		department: "unclassified"
	},
	{
		name: "pina colada cocktail mixer",
		department: "unclassified"
	},
	{
		name: "Lipton Sparkling Diet Green Tea with Strawberry Kiwi",
		department: "unclassified"
	},
	{
		name: "lipton recipe secrets",
		department: "unclassified"
	},
	{
		name: "Lipton Diet Green Tea with Citrus",
		department: "unclassified"
	},
	{
		name: "goya mojo juice",
		department: "unclassified"
	},
	{
		name: "concentrate juice",
		department: "unclassified"
	},
	{
		name: "chile juice",
		department: "unclassified"
	},
	{
		name: "chai green tea",
		department: "unclassified"
	},
	{
		name: "whole wheat four cheese ravioli",
		department: "unclassified"
	},
	{
		name: "whipped margarine",
		department: "unclassified"
	},
	{
		name: "tasty low-fat cheese",
		department: "unclassified"
	},
	{
		name: "soft low-fat cheese",
		department: "unclassified"
	},
	{
		name: "nonfat frozen vanilla yogurt",
		department: "unclassified"
	},
	{
		name: "non-fat non-dairy creamer",
		department: "unclassified"
	},
	{
		name: "maytag blue",
		department: "unclassified"
	},
	{
		name: "low-fat unsweetened coconut milk",
		department: "unclassified"
	},
	{
		name: "low-fat taco cheese",
		department: "unclassified"
	},
	{
		name: "low-fat soft goat cheese",
		department: "unclassified"
	},
	{
		name: "low-fat passionfruit yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat panir",
		department: "unclassified"
	},
	{
		name: "low-fat lime yogurt",
		department: "unclassified"
	},
	{
		name: "Dairy Fresh Buttermilk",
		department: "unclassified"
	},
	{
		name: "Coffee-Mate Coffee Creamer",
		department: "unclassified"
	},
	{
		name: "carnation evaporated milk",
		department: "unclassified"
	},
	{
		name: "cacciocavallo",
		department: "unclassified"
	},
	{
		name: "Wesson Canola Oil",
		department: "unclassified"
	},
	{
		name: "Vegit Seasoning",
		department: "unclassified"
	},
	{
		name: "szechuan chili paste",
		department: "unclassified"
	},
	{
		name: "sunday gravy",
		department: "unclassified"
	},
	{
		name: "sofrito seasoning",
		department: "unclassified"
	},
	{
		name: "sazon seasoning blend",
		department: "unclassified"
	},
	{
		name: "rogan josh seasoning",
		department: "unclassified"
	},
	{
		name: "sundried tomato chicken sausage",
		department: "unclassified"
	},
	{
		name: "picadillo seasoning",
		department: "unclassified"
	},
	{
		name: "non-fat curry dressing",
		department: "unclassified"
	},
	{
		name: "mixed essence",
		department: "unclassified"
	},
	{
		name: "McCormick Cinnamon Sugar",
		department: "unclassified"
	},
	{
		name: "Luzianne Cajun Seasoning",
		department: "unclassified"
	},
	{
		name: "low-fat white sauce",
		department: "unclassified"
	},
	{
		name: "low-fat tartar sauce",
		department: "unclassified"
	},
	{
		name: "low-fat salad dressing",
		department: "unclassified"
	},
	{
		name: "low-fat italian parmesan dressing",
		department: "unclassified"
	},
	{
		name: "low-fat creamy salad dressing",
		department: "unclassified"
	},
	{
		name: "Kraft Horseradish Sauce",
		department: "unclassified"
	},
	{
		name: "Kraft Cocktail Sauce",
		department: "unclassified"
	},
	{
		name: "japanese vinaigrette",
		department: "unclassified"
	},
	{
		name: "hot black bean sauce",
		department: "unclassified"
	},
	{
		name: "dry rub seasoning mix",
		department: "unclassified"
	},
	{
		name: "citrus grill seasoning",
		department: "unclassified"
	},
	{
		name: "kitchen king masala",
		department: "unclassified"
	},
	{
		name: "Bulls-Eye Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "brown malt vinegar",
		department: "unclassified"
	},
	{
		name: "piri piri powder",
		department: "unclassified"
	},
	{
		name: "anise basil",
		department: "unclassified"
	},
	{
		name: "adobo rub",
		department: "unclassified"
	},
	{
		name: "Hidden Valley Caesar Salad Dressing",
		department: "unclassified"
	},
	{
		name: "zoom quick hot cereal",
		department: "unclassified"
	},
	{
		name: "barley groats",
		department: "unclassified"
	},
	{
		name: "Alpha-Bits Cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat peasant bread",
		department: "unclassified"
	},
	{
		name: "water chestnut starch",
		department: "unclassified"
	},
	{
		name: "unfrosted brownies",
		department: "unclassified"
	},
	{
		name: "portugese rolls",
		department: "unclassified"
	},
	{
		name: "poppyseed buns",
		department: "unclassified"
	},
	{
		name: "mini filo tartlet shells",
		department: "unclassified"
	},
	{
		name: "low-fat croutons",
		department: "unclassified"
	},
	{
		name: "indian flat bread",
		department: "unclassified"
	},
	{
		name: "Hodgson Mill White Whole Wheat Flour",
		department: "unclassified"
	},
	{
		name: "hard-wheat flour",
		department: "unclassified"
	},
	{
		name: "frankfurter rolls",
		department: "unclassified"
	},
	{
		name: "crusty french roll",
		department: "unclassified"
	},
	{
		name: "crushed low-fat graham crackers",
		department: "unclassified"
	},
	{
		name: "corn bread crumbs",
		department: "unclassified"
	},
	{
		name: "cocktail rolls",
		department: "unclassified"
	},
	{
		name: "banana cream pie filling",
		department: "unclassified"
	},
	{
		name: "bakery sandwich rolls",
		department: "unclassified"
	},
	{
		name: "Azteca Flour Tortillas",
		department: "unclassified"
	},
	{
		name: "aspartame artificial sweetener",
		department: "unclassified"
	},
	{
		name: "artificial granulated brown sweetener",
		department: "unclassified"
	},
	{
		name: "Arm & Hammer Baking Soda",
		department: "unclassified"
	},
	{
		name: "honey wine",
		department: "unclassified"
	},
	{
		name: "Holland House Cooking Wine",
		department: "unclassified"
	},
	{
		name: "fruit-flavored brandy",
		department: "unclassified"
	},
	{
		name: "dulce de leche liqueur",
		department: "unclassified"
	},
	{
		name: "Drambuie Liqueur",
		department: "unclassified"
	},
	{
		name: "cabernet franc",
		department: "unclassified"
	},
	{
		name: "abita amber",
		department: "unclassified"
	},
	{
		name: "Yoplait\\u00AE Greek 100 blackberry pie yogurt",
		department: "unclassified"
	},
	{
		name: "limburger",
		department: "unclassified"
	},
	{
		name: "Old English cheese spread",
		department: "unclassified"
	},
	{
		name: "Yoplait\\u00AE Greek 100 mango yogurt",
		department: "unclassified"
	},
	{
		name: "summer savoy cabbage",
		department: "unclassified"
	},
	{
		name: "rockweed",
		department: "unclassified"
	},
	{
		name: "petits-gris snails",
		department: "unclassified"
	},
	{
		name: "Smithfield Pork Chops",
		department: "unclassified"
	},
	{
		name: "Santa Rita Sauvignon Blanc",
		department: "unclassified"
	},
	{
		name: "pigeon breast fillets",
		department: "unclassified"
	},
	{
		name: "Del Monte Bananas",
		department: "unclassified"
	},
	{
		name: "baby multicolored carrots",
		department: "unclassified"
	},
	{
		name: "pink ice cream",
		department: "unclassified"
	},
	{
		name: "anglerfish",
		department: "unclassified"
	},
	{
		name: "raspberry ginger ale",
		department: "unclassified"
	},
	{
		name: "Spice Islands Celery Seed",
		department: "unclassified"
	},
	{
		name: "mini chicken schnitzel",
		department: "unclassified"
	},
	{
		name: "shasliksaus",
		department: "unclassified"
	},
	{
		name: "yellow chinese chives",
		department: "unclassified"
	},
	{
		name: "beef cervelats",
		department: "unclassified"
	},
	{
		name: "Black Box Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "hibiscus pods",
		department: "unclassified"
	},
	{
		name: "country style gravy",
		department: "unclassified"
	},
	{
		name: "multigrain pancakes",
		department: "unclassified"
	},
	{
		name: "chorizo filling",
		department: "unclassified"
	},
	{
		name: "porcino",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Butcher Thick Cut Applewood Smoked Bacon",
		department: "unclassified"
	},
	{
		name: "maiseieren",
		department: "unclassified"
	},
	{
		name: "imported sopressata",
		department: "unclassified"
	},
	{
		name: "Rodelle Vanilla Beans",
		department: "unclassified"
	},
	{
		name: "molinari",
		department: "unclassified"
	},
	{
		name: "Earthbound Farm Organic Mango Chunks",
		department: "unclassified"
	},
	{
		name: "cubed venison",
		department: "unclassified"
	},
	{
		name: "holland rusks",
		department: "unclassified"
	},
	{
		name: "erwtensoeppakket",
		department: "unclassified"
	},
	{
		name: "stolichnaya stoli razberi",
		department: "unclassified"
	},
	{
		name: "celery root leaves",
		department: "unclassified"
	},
	{
		name: "dillseeds",
		department: "unclassified"
	},
	{
		name: "zapallo",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Imitation Strawberry Extract",
		department: "unclassified"
	},
	{
		name: "hawaiian style marinade",
		department: "unclassified"
	},
	{
		name: "peanut butter chocolate spread",
		department: "unclassified"
	},
	{
		name: "brown rice rotini",
		department: "unclassified"
	},
	{
		name: "ngo om",
		department: "unclassified"
	},
	{
		name: "Korean strawberries",
		department: "unclassified"
	},
	{
		name: "Mirassou Chardonnay",
		department: "unclassified"
	},
	{
		name: "pomegranate citrus roasting glaze",
		department: "unclassified"
	},
	{
		name: "apple grape juice",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9\\u00AE TOLL HOUSE\\u00AE DelightFulls\\u2122 Candy Cane Morsels",
		department: "unclassified"
	},
	{
		name: "mai fun",
		department: "unclassified"
	},
	{
		name: "grain milk",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE 1/2 the Fat Creamy Vanilla Light Ice Cream",
		department: "unclassified"
	},
	{
		name: "campari bitters",
		department: "unclassified"
	},
	{
		name: "Chang Beer",
		department: "unclassified"
	},
	{
		name: "souffle topping",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Fine Cut Shredded Cheddar Jack Cheese",
		department: "unclassified"
	},
	{
		name: "spring vegetable ragout",
		department: "unclassified"
	},
	{
		name: "spicy fries",
		department: "unclassified"
	},
	{
		name: "pink ginger",
		department: "unclassified"
	},
	{
		name: "lemonfish",
		department: "unclassified"
	},
	{
		name: "green ice cream",
		department: "unclassified"
	},
	{
		name: "pineau de charentes",
		department: "unclassified"
	},
	{
		name: "soy paper",
		department: "unclassified"
	},
	{
		name: "granulated fructose",
		department: "unclassified"
	},
	{
		name: "cheesecake pieces",
		department: "unclassified"
	},
	{
		name: "OSCAR MAYER CARVING BOARD Sweet & Spicy Seasoned Pulled Pork",
		department: "unclassified"
	},
	{
		name: "sheepshead",
		department: "unclassified"
	},
	{
		name: "fillets of seabass",
		department: "unclassified"
	},
	{
		name: "Kraft Big Slice Chipotle Cheese Slices",
		department: "unclassified"
	},
	{
		name: "Conimex Sat\\u00E9saus Pikant",
		department: "unclassified"
	},
	{
		name: "sugar doughnuts",
		department: "unclassified"
	},
	{
		name: "angled loofah",
		department: "unclassified"
	},
	{
		name: "Natural & Kosher Fresh Mozzarella",
		department: "unclassified"
	},
	{
		name: "rennin",
		department: "unclassified"
	},
	{
		name: "skin-on halibut steaks",
		department: "unclassified"
	},
	{
		name: "pancit",
		department: "unclassified"
	},
	{
		name: "Cynar Liqueur",
		department: "unclassified"
	},
	{
		name: "popcorn cakes",
		department: "unclassified"
	},
	{
		name: "KC Masterpiece\\u00AE Garlic & Herb Marinade",
		department: "unclassified"
	},
	{
		name: "dried smoked chili pepper",
		department: "unclassified"
	},
	{
		name: "wolffish tenderloin",
		department: "unclassified"
	},
	{
		name: "katsuo dashi",
		department: "unclassified"
	},
	{
		name: "yellow tail snapper",
		department: "unclassified"
	},
	{
		name: "Mo Qua",
		department: "unclassified"
	},
	{
		name: "spicy rub",
		department: "unclassified"
	},
	{
		name: "stelle",
		department: "unclassified"
	},
	{
		name: "English Pale Ale",
		department: "unclassified"
	},
	{
		name: "bison tenderloin",
		department: "unclassified"
	},
	{
		name: "sourdough french loaf",
		department: "unclassified"
	},
	{
		name: "caper water",
		department: "unclassified"
	},
	{
		name: "Zwack Liqueur",
		department: "unclassified"
	},
	{
		name: "gluten-free vegetable",
		department: "unclassified"
	},
	{
		name: "heat stable artificial sweetener",
		department: "unclassified"
	},
	{
		name: "Crystal Head Vodka",
		department: "unclassified"
	},
	{
		name: "shoga",
		department: "unclassified"
	},
	{
		name: "eight ball squash",
		department: "unclassified"
	},
	{
		name: "spicy rouille",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Avocado Dressing",
		department: "unclassified"
	},
	{
		name: "cracked wheat sourdough bread",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9 TOLL HOUSE Semi-Sweet Chocolate Chunks",
		department: "unclassified"
	},
	{
		name: "parfait amour",
		department: "unclassified"
	},
	{
		name: "pumpernickel toast points",
		department: "unclassified"
	},
	{
		name: "rye bagels",
		department: "unclassified"
	},
	{
		name: "frozen salmon",
		department: "unclassified"
	},
	{
		name: "smoked hog jowl",
		department: "unclassified"
	},
	{
		name: "imitation strawberry extract",
		department: "unclassified"
	},
	{
		name: "acid blend",
		department: "unclassified"
	},
	{
		name: "braise liquid reduction",
		department: "unclassified"
	},
	{
		name: "International Delight Amaretto",
		department: "unclassified"
	},
	{
		name: "brown gel coloring",
		department: "unclassified"
	},
	{
		name: "Illy Espresso",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Shredded Asiago Cheese",
		department: "unclassified"
	},
	{
		name: "guinea pepper",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Pumpkin Spice Morsels",
		department: "unclassified"
	},
	{
		name: "Tandoori sauce",
		department: "unclassified"
	},
	{
		name: "multicolored Tinkerbell peppers",
		department: "unclassified"
	},
	{
		name: "Myers''s Rum",
		department: "unclassified"
	},
	{
		name: "large mouth bass",
		department: "unclassified"
	},
	{
		name: "Tres Leches Liqueur",
		department: "unclassified"
	},
	{
		name: "jumbo kalamata olives",
		department: "unclassified"
	},
	{
		name: "Appleton Estate Rum",
		department: "unclassified"
	},
	{
		name: "herb olives",
		department: "unclassified"
	},
	{
		name: "cherry whiskey",
		department: "unclassified"
	},
	{
		name: "Jack's Gourmet Sweet Italian Sausage",
		department: "unclassified"
	},
	{
		name: "Yoplait\\u00AE Greek 2% caramel yogurt",
		department: "unclassified"
	},
	{
		name: "Roman Meal Original Bread",
		department: "unclassified"
	},
	{
		name: "firm pumpernickel",
		department: "unclassified"
	},
	{
		name: "Moon Mountain Vodka",
		department: "unclassified"
	},
	{
		name: "swamp cabbage",
		department: "unclassified"
	},
	{
		name: "peach soda",
		department: "unclassified"
	},
	{
		name: "flat prosecco",
		department: "unclassified"
	},
	{
		name: "toasted cinnamon cereal",
		department: "unclassified"
	},
	{
		name: "Watkins Italian Seasoning",
		department: "unclassified"
	},
	{
		name: "chuck tender",
		department: "unclassified"
	},
	{
		name: "Jack's Gourmet Facon",
		department: "unclassified"
	},
	{
		name: "spring mushrooms",
		department: "unclassified"
	},
	{
		name: "Maple Grove Farms Organic Maple Syrup",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Sides\\u2122 Thai Sweet Chili",
		department: "unclassified"
	},
	{
		name: "extra firm silken",
		department: "unclassified"
	},
	{
		name: "porcini ravioli",
		department: "unclassified"
	},
	{
		name: "ragu alla napoletana",
		department: "unclassified"
	},
	{
		name: "whelks",
		department: "unclassified"
	},
	{
		name: "french parsley",
		department: "unclassified"
	},
	{
		name: "raw wildflower honey",
		department: "unclassified"
	},
	{
		name: "raspberry iced tea",
		department: "unclassified"
	},
	{
		name: "bigoli bianchi",
		department: "unclassified"
	},
	{
		name: "winter lettuce",
		department: "unclassified"
	},
	{
		name: "egg lasagna noodles",
		department: "unclassified"
	},
	{
		name: "orris",
		department: "unclassified"
	},
	{
		name: "cactus leaf",
		department: "unclassified"
	},
	{
		name: "Nestle Crunch Buncha Crunch",
		department: "unclassified"
	},
	{
		name: "finocchiona",
		department: "unclassified"
	},
	{
		name: "Fire & Flavor garlic & herb brine",
		department: "unclassified"
	},
	{
		name: "yau choy",
		department: "unclassified"
	},
	{
		name: "santa maria style seasoning",
		department: "unclassified"
	},
	{
		name: "chuck shoulder steak",
		department: "unclassified"
	},
	{
		name: "Athenos Crumbled Feta Cheese with Tomato & Basil",
		department: "unclassified"
	},
	{
		name: "bison ribeye",
		department: "unclassified"
	},
	{
		name: "margarine flakes",
		department: "unclassified"
	},
	{
		name: "shata peppers",
		department: "unclassified"
	},
	{
		name: "fresh calamari rings",
		department: "unclassified"
	},
	{
		name: "Absolut Orient Apple Vodka",
		department: "unclassified"
	},
	{
		name: "amish batter",
		department: "unclassified"
	},
	{
		name: "water chestnut powder",
		department: "unclassified"
	},
	{
		name: "buah keras",
		department: "unclassified"
	},
	{
		name: "Smirnoff Twist of Green Apple Vodka",
		department: "unclassified"
	},
	{
		name: "flowering chinese chives",
		department: "unclassified"
	},
	{
		name: "garlic cheese bread",
		department: "unclassified"
	},
	{
		name: "scharffen berger cacao nibs",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Blue Cheese Crumbles",
		department: "unclassified"
	},
	{
		name: "Mazola\\u00AE Pure Olive Oil",
		department: "unclassified"
	},
	{
		name: "Kraft Big Slice Mild Cheddar Cheese Slices",
		department: "unclassified"
	},
	{
		name: "hickory bbq riblets",
		department: "unclassified"
	},
	{
		name: "turkey breast strips",
		department: "unclassified"
	},
	{
		name: "yucca fries",
		department: "unclassified"
	},
	{
		name: "capacollo",
		department: "unclassified"
	},
	{
		name: "hoisin baste",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Rice Sides\\u2122 Asian BBQ",
		department: "unclassified"
	},
	{
		name: "Hodgson Mill Active Dry Yeast",
		department: "unclassified"
	},
	{
		name: "pineapple soda",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Fresh Bone-In Turkey Breast",
		department: "unclassified"
	},
	{
		name: "vandermint",
		department: "unclassified"
	},
	{
		name: "picon",
		department: "unclassified"
	},
	{
		name: "southwest essence",
		department: "unclassified"
	},
	{
		name: "Jack Daniels Whisky",
		department: "unclassified"
	},
	{
		name: "tofu sausage",
		department: "unclassified"
	},
	{
		name: "regular tapioca",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Morsels",
		department: "unclassified"
	},
	{
		name: "Badia Seasoning",
		department: "unclassified"
	},
	{
		name: "jalapenos brine",
		department: "unclassified"
	},
	{
		name: "comb honey",
		department: "unclassified"
	},
	{
		name: "cascade whole leaf",
		department: "unclassified"
	},
	{
		name: "chocolate covered marshmallows",
		department: "unclassified"
	},
	{
		name: "Crown Royal Whisky",
		department: "unclassified"
	},
	{
		name: "frenched racks",
		department: "unclassified"
	},
	{
		name: "frenched rack of lamb",
		department: "unclassified"
	},
	{
		name: "Absolut Ruby Red Vodka",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Pasta Sides\\u2122  Cheesy Spinach Dip Pasta",
		department: "unclassified"
	},
	{
		name: "Near East Spanish Rice Pilaf Mix",
		department: "unclassified"
	},
	{
		name: "pork tenderloin tips",
		department: "unclassified"
	},
	{
		name: "ravioli sheets",
		department: "unclassified"
	},
	{
		name: "nonfat peach greek yogurt",
		department: "unclassified"
	},
	{
		name: "Hellmann's Mayonnaise with a Zing of Lemon",
		department: "unclassified"
	},
	{
		name: "Mezzetta Napa Valley Bistro Sun Ripened Dried Tomato Pesto",
		department: "unclassified"
	},
	{
		name: "sirloin tip center steak",
		department: "unclassified"
	},
	{
		name: "Osem Beef Flavor Soup & Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE organic white pepper",
		department: "unclassified"
	},
	{
		name: "egg bagels",
		department: "unclassified"
	},
	{
		name: "amaretto ice cream",
		department: "unclassified"
	},
	{
		name: "Merguez spice blend",
		department: "unclassified"
	},
	{
		name: "heirloom cucumbers",
		department: "unclassified"
	},
	{
		name: "vegetable coloring",
		department: "unclassified"
	},
	{
		name: "Crown Royal Canadian Whisky",
		department: "unclassified"
	},
	{
		name: "Earthbound Farm Deep Green Blends Power",
		department: "unclassified"
	},
	{
		name: "gianduia",
		department: "unclassified"
	},
	{
		name: "Cambria Pinot Noir",
		department: "unclassified"
	},
	{
		name: "Crave Chocolate Mint Liqueur",
		department: "unclassified"
	},
	{
		name: "spelt kernels",
		department: "unclassified"
	},
	{
		name: "Gallo Family Vineyards Hearty Burgundy",
		department: "unclassified"
	},
	{
		name: "crepe mix",
		department: "unclassified"
	},
	{
		name: "game roulade",
		department: "unclassified"
	},
	{
		name: "molukhia",
		department: "unclassified"
	},
	{
		name: "Cazadores Tequila",
		department: "unclassified"
	},
	{
		name: "cream topped yogurt",
		department: "unclassified"
	},
	{
		name: "herb wine vinegar",
		department: "unclassified"
	},
	{
		name: "maypo",
		department: "unclassified"
	},
	{
		name: "country rye bread",
		department: "unclassified"
	},
	{
		name: "Entwine Pinot Grigio",
		department: "unclassified"
	},
	{
		name: "Frontera Cabernet Sauvignon/Merlot",
		department: "unclassified"
	},
	{
		name: "Woodbridge by Robert Mondavi Chardonnay",
		department: "unclassified"
	},
	{
		name: "ginseng tea",
		department: "unclassified"
	},
	{
		name: "Rainstorm Pinot Gris",
		department: "unclassified"
	},
	{
		name: "Gold's Horseradish Sauce",
		department: "unclassified"
	},
	{
		name: "Christian Brothers Brandy",
		department: "unclassified"
	},
	{
		name: "wine gums",
		department: "unclassified"
	},
	{
		name: "whole grain white bread",
		department: "unclassified"
	},
	{
		name: "Tinkerbell peppers",
		department: "unclassified"
	},
	{
		name: "hierba santa",
		department: "unclassified"
	},
	{
		name: "bar salt",
		department: "unclassified"
	},
	{
		name: "Little Black Dress Pinot Noir",
		department: "unclassified"
	},
	{
		name: "Gorton's Beer Batter Fillets",
		department: "unclassified"
	},
	{
		name: "Goya Bay Leaf",
		department: "unclassified"
	},
	{
		name: "Katherine''s Vineyard Chardonnay",
		department: "unclassified"
	},
	{
		name: "periwinkles",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Rice Sides\\u2122 White Cheddar Queso",
		department: "unclassified"
	},
	{
		name: "Cruzan Rum",
		department: "unclassified"
	},
	{
		name: "Bushmills Whiskey",
		department: "unclassified"
	},
	{
		name: "Cantuccini Cookies",
		department: "unclassified"
	},
	{
		name: "Leinenkugels Summer Shandy",
		department: "unclassified"
	},
	{
		name: "rijstbuiltjes",
		department: "unclassified"
	},
	{
		name: "Jacobs Creek Shiraz Cabernet",
		department: "unclassified"
	},
	{
		name: "Bertolli Light Garlic Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "maria bolachas",
		department: "unclassified"
	},
	{
		name: "Sauza Silver Tequila",
		department: "unclassified"
	},
	{
		name: "gluten free frozen waffles",
		department: "unclassified"
	},
	{
		name: "Familia Camarena Silver Tequila",
		department: "unclassified"
	},
	{
		name: "mini lentils",
		department: "unclassified"
	},
	{
		name: "hagelslagmix",
		department: "unclassified"
	},
	{
		name: "gluten free Italian sausage",
		department: "unclassified"
	},
	{
		name: "sodium nitrate",
		department: "unclassified"
	},
	{
		name: "cioppino base",
		department: "unclassified"
	},
	{
		name: "Harpoon Beer",
		department: "unclassified"
	},
	{
		name: "scharrelmayonaise",
		department: "unclassified"
	},
	{
		name: "chinese prickly ash",
		department: "unclassified"
	},
	{
		name: "trenne",
		department: "unclassified"
	},
	{
		name: "Goose Bay Sauvignon Blanc",
		department: "unclassified"
	},
	{
		name: "salmon cream cheese spread",
		department: "unclassified"
	},
	{
		name: "whole wheat potato buns",
		department: "unclassified"
	},
	{
		name: "orange grapefruit juice",
		department: "unclassified"
	},
	{
		name: "Moet & Chandon Champagne",
		department: "unclassified"
	},
	{
		name: "slagroomvla",
		department: "unclassified"
	},
	{
		name: "B\\u00E1nh M\\u00EC spice blend",
		department: "unclassified"
	},
	{
		name: "st john's wort blossoms",
		department: "unclassified"
	},
	{
		name: "soup nuts",
		department: "unclassified"
	},
	{
		name: "homemade rich chicken stock",
		department: "unclassified"
	},
	{
		name: "alphabet cookies",
		department: "unclassified"
	},
	{
		name: "Centennial hops",
		department: "unclassified"
	},
	{
		name: "A1 Sweet Mesquite BBQ Dry Rub",
		department: "unclassified"
	},
	{
		name: "medium pitted olives",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Fully Cooked Hardwood Smoked Turkey Sausage",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Lean Taco Seasoned Ground Turkey",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Ground Turkey",
		department: "unclassified"
	},
	{
		name: "porchetta di testa",
		department: "unclassified"
	},
	{
		name: "bream fillets",
		department: "unclassified"
	},
	{
		name: "beef tenderloin fillets",
		department: "unclassified"
	},
	{
		name: "Alaska halibut fillets",
		department: "unclassified"
	},
	{
		name: "Alaska cod fillets",
		department: "unclassified"
	},
	{
		name: "peperocini",
		department: "unclassified"
	},
	{
		name: "frozen tilapia fillets",
		department: "unclassified"
	},
	{
		name: "Gorton\\u2019s Simply Bake Tilapia",
		department: "unclassified"
	},
	{
		name: "Gorton\\u2019s Grilled Signature Tilapia",
		department: "unclassified"
	},
	{
		name: "Gorton's Classic Grilled Salmon Fillets",
		department: "unclassified"
	},
	{
		name: "Gorton's Smart & Crunchy Breaded Fish Fillets",
		department: "unclassified"
	},
	{
		name: "Gorton\\u2019s Parmesan Crusted Cod Fillets",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Sweet Basil",
		department: "unclassified"
	},
	{
		name: "reduced-fat lactose-free milk",
		department: "unclassified"
	},
	{
		name: "Cabot Clothbound Cheddar",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Burrito Carb Balance\\u00AE Whole Wheat Tortillas",
		department: "unclassified"
	},
	{
		name: "Sabra\\u00AE Pico de Gallo",
		department: "unclassified"
	},
	{
		name: "pound cake batter",
		department: "unclassified"
	},
	{
		name: "solid pack tuna",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Andouille Split Rope Sausage",
		department: "unclassified"
	},
	{
		name: "Silk Light Chocolate Soymilk",
		department: "unclassified"
	},
	{
		name: "Bell's Oberon Ale",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Reduced Fat Shredded Sharp Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Deli Fresh Virginia Brand Ham",
		department: "unclassified"
	},
	{
		name: "Kraft Big Slice Sharp Cheddar Cheese Slices",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Reduced Fat Shredded Marble Jack Cheese",
		department: "unclassified"
	},
	{
		name: "Crystal Farms eggs",
		department: "unclassified"
	},
	{
		name: "Hidden Valley Original Ranch Organic Dressing",
		department: "unclassified"
	},
	{
		name: "sugar-free simple syrup",
		department: "unclassified"
	},
	{
		name: "kiwi juice",
		department: "unclassified"
	},
	{
		name: "moth beans",
		department: "unclassified"
	},
	{
		name: "Silk Unsweetened Soymilk",
		department: "unclassified"
	},
	{
		name: "shredded low sodium cheddar cheese",
		department: "unclassified"
	},
	{
		name: "Starbucks\\u00AE Caramel Iced Coffee Beverage - Brewed to Personalize",
		department: "unclassified"
	},
	{
		name: "white chili seasoning mix",
		department: "unclassified"
	},
	{
		name: "onion focaccia",
		department: "unclassified"
	},
	{
		name: "mild curry sauce",
		department: "unclassified"
	},
	{
		name: "BelGioioso Mascarpone",
		department: "unclassified"
	},
	{
		name: "House Foods Soft Tofu",
		department: "unclassified"
	},
	{
		name: "Munich malt",
		department: "unclassified"
	},
	{
		name: "rye malt",
		department: "unclassified"
	},
	{
		name: "Soy Vay Wasabi Teriyaki Marinade & Sauce",
		department: "unclassified"
	},
	{
		name: "Soy Vay\\u00AE Wasabi Teriyaki Marinade & Sauce",
		department: "unclassified"
	},
	{
		name: "cholesterol free mayonnaise",
		department: "unclassified"
	},
	{
		name: "Hellmann's Mayonnaise with a touch of Garlic",
		department: "unclassified"
	},
	{
		name: "Wild Turkey American Honey",
		department: "unclassified"
	},
	{
		name: "Becel pro-activ",
		department: "unclassified"
	},
	{
		name: "foie gras p\\u00E2t\\u00E9",
		department: "unclassified"
	},
	{
		name: "goose breast halves",
		department: "unclassified"
	},
	{
		name: "clementine wedges",
		department: "unclassified"
	},
	{
		name: "almond pastry",
		department: "unclassified"
	},
	{
		name: "Philadelphia Strawberry Cream Cheese Spread",
		department: "unclassified"
	},
	{
		name: "House Foods Firm Tofu",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE Guacamole Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "TABASCO\\u00AE Original Pepper Sauce",
		department: "unclassified"
	},
	{
		name: "Country Crock\\u00AE Cinnamon Spread",
		department: "unclassified"
	},
	{
		name: "Kellogg's\\u00AE Eggo\\u00AE Homestyle Waffles",
		department: "unclassified"
	},
	{
		name: "chunk chicken in water",
		department: "unclassified"
	},
	{
		name: "Breyers BLASTS!\\u00AE M&M'S\\u00AE Brand Light Ice Cream",
		department: "unclassified"
	},
	{
		name: "Mezzetta Super Colossal Spanish Queen Olives Pimiento Stuffed",
		department: "unclassified"
	},
	{
		name: "Blue Band Brood",
		department: "unclassified"
	},
	{
		name: "Kroger Red Beans",
		department: "unclassified"
	},
	{
		name: "Kamora Coffee Liqueur",
		department: "unclassified"
	},
	{
		name: "Premio Sweet Italian Sausage",
		department: "unclassified"
	},
	{
		name: "Colavita Pesto Sauce",
		department: "unclassified"
	},
	{
		name: "Eden Toasted Sesame Oil",
		department: "unclassified"
	},
	{
		name: "Ghirardelli Bittersweet Chocolate Bar",
		department: "unclassified"
	},
	{
		name: "Blue Diamond Chocolate Almond Milk",
		department: "unclassified"
	},
	{
		name: "lablab beans",
		department: "unclassified"
	},
	{
		name: "LouAna Coconut Oil",
		department: "unclassified"
	},
	{
		name: "pitted Castelvetrano olives",
		department: "unclassified"
	},
	{
		name: "kalamata extra virgin olive oil",
		department: "unclassified"
	},
	{
		name: "Rachael Ray Low Sodium Chicken Stock",
		department: "unclassified"
	},
	{
		name: "whole chocolate milk",
		department: "unclassified"
	},
	{
		name: "Kroger Fat Free Cream Cheese",
		department: "unclassified"
	},
	{
		name: "Mama Francesca Parmesan",
		department: "unclassified"
	},
	{
		name: "Mezzetta Colossal Sicilian Spiced Olives",
		department: "unclassified"
	},
	{
		name: "Emmi Le Gruyere",
		department: "unclassified"
	},
	{
		name: "Kroger Reduced Fat Sour Cream",
		department: "unclassified"
	},
	{
		name: "House Foods Extra Firm Tofu",
		department: "unclassified"
	},
	{
		name: "Guittard Semisweet Chocolate Chips",
		department: "unclassified"
	},
	{
		name: "Heinz Red Wine Vinegar",
		department: "unclassified"
	},
	{
		name: "Del Monte Tomato Sauce",
		department: "unclassified"
	},
	{
		name: "Darigold Whole Milk",
		department: "unclassified"
	},
	{
		name: "Yamasa Soy Sauce",
		department: "unclassified"
	},
	{
		name: "Eden Organic Tamari Soy Sauce",
		department: "unclassified"
	},
	{
		name: "Pinnacle Vanilla Vodka",
		department: "unclassified"
	},
	{
		name: "Crystal Sugar Granulated Sugar",
		department: "unclassified"
	},
	{
		name: "seafood marinade",
		department: "unclassified"
	},
	{
		name: "Cazadores Blanco Tequila",
		department: "unclassified"
	},
	{
		name: "Heinz Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "herb pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Homestyle Stock\\u2122 Beef Stock",
		department: "unclassified"
	},
	{
		name: "chocolate straws",
		department: "unclassified"
	},
	{
		name: "Foster Farms boneless skinless chicken breasts",
		department: "unclassified"
	},
	{
		name: "Watkins Ground Nutmeg",
		department: "unclassified"
	},
	{
		name: "Kraft Colby Cheese",
		department: "unclassified"
	},
	{
		name: "Bellino Red Wine Vinegar",
		department: "unclassified"
	},
	{
		name: "Eden Organic Shoyu Soy Sauce",
		department: "unclassified"
	},
	{
		name: "zucchini salad",
		department: "unclassified"
	},
	{
		name: "emping",
		department: "unclassified"
	},
	{
		name: "spaghettigroenten",
		department: "unclassified"
	},
	{
		name: "taramasalata",
		department: "unclassified"
	},
	{
		name: "milk chocolate biscuits",
		department: "unclassified"
	},
	{
		name: "wortelballetjes",
		department: "unclassified"
	},
	{
		name: "boerencakejes",
		department: "unclassified"
	},
	{
		name: "oerkaas",
		department: "unclassified"
	},
	{
		name: "fish schnitzel",
		department: "unclassified"
	},
	{
		name: "salted soybeans",
		department: "unclassified"
	},
	{
		name: "frozen pancakes",
		department: "unclassified"
	},
	{
		name: "Goya Blackeye Peas",
		department: "unclassified"
	},
	{
		name: "canned meat",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Ground Cumin",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Blackened Organic Seafood Seasoning",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Arrowroot Powder",
		department: "unclassified"
	},
	{
		name: "Frontier Arrowroot",
		department: "unclassified"
	},
	{
		name: "Stonyfield Farm Organic Milk",
		department: "unclassified"
	},
	{
		name: "pineapple slices in light syrup",
		department: "unclassified"
	},
	{
		name: "pineapple chunks in light syrup",
		department: "unclassified"
	},
	{
		name: "nonfat Swiss cheese",
		department: "unclassified"
	},
	{
		name: "eggnog liqueur",
		department: "unclassified"
	},
	{
		name: "salted margarine",
		department: "unclassified"
	},
	{
		name: "orange flavored brandy",
		department: "unclassified"
	},
	{
		name: "Elea Olive Oil",
		department: "unclassified"
	},
	{
		name: "Stonefire Italian Thin Pizza Crust",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Italian Mix Giardiniera",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Habanero Hot Sauce",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE California Habanero Hot Sauce Twist & Shout",
		department: "unclassified"
	},
	{
		name: "boneless flanken short ribs",
		department: "unclassified"
	},
	{
		name: "boneless flanken",
		department: "unclassified"
	},
	{
		name: "Better Than Milk Soy Beverage Mix",
		department: "unclassified"
	},
	{
		name: "Mezzetta Napa Valley Homemade Wild Mushroom Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "Barilla Arrabbiata Sauce",
		department: "unclassified"
	},
	{
		name: "French endive",
		department: "unclassified"
	},
	{
		name: "seafood curry powder",
		department: "unclassified"
	},
	{
		name: "Smart Balance Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Gravy Master Seasoning and Browning Sauce",
		department: "unclassified"
	},
	{
		name: "Cento Basil",
		department: "unclassified"
	},
	{
		name: "Saco Buttermilk",
		department: "unclassified"
	},
	{
		name: "Guerrero Corn Tortillas",
		department: "unclassified"
	},
	{
		name: "Goya Chorizo",
		department: "unclassified"
	},
	{
		name: "Farm Rich French Toast Sticks",
		department: "unclassified"
	},
	{
		name: "Romanoff Caviar",
		department: "unclassified"
	},
	{
		name: "Food Should Taste Good Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Ben & Jerry''s Ice Cream",
		department: "unclassified"
	},
	{
		name: "Hunts Ketchup",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Honey Ham",
		department: "unclassified"
	},
	{
		name: "Green & Black''s Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Pillsbury Pie Crust Mix",
		department: "unclassified"
	},
	{
		name: "Pillsbury Cookie Dough",
		department: "unclassified"
	},
	{
		name: "Pillsbury  Flour",
		department: "unclassified"
	},
	{
		name: "unsalted roasted hazelnuts",
		department: "unclassified"
	},
	{
		name: "IBC Root Beer",
		department: "unclassified"
	},
	{
		name: "Horizon Organic Cottage Cheese",
		department: "unclassified"
	},
	{
		name: "Stouffer''s Lasagna",
		department: "unclassified"
	},
	{
		name: "Dove Dark Chocolate Hearts",
		department: "unclassified"
	},
	{
		name: "Kikkoman Katsu Sauce",
		department: "unclassified"
	},
	{
		name: "La Victoria Enchilada Sauce",
		department: "unclassified"
	},
	{
		name: "Sapporo Beer",
		department: "unclassified"
	},
	{
		name: "Wonder Bread",
		department: "unclassified"
	},
	{
		name: "Cara Mia Artichoke Hearts",
		department: "unclassified"
	},
	{
		name: "Tuttorosso Peeled Plum Shaped Tomatoes",
		department: "unclassified"
	},
	{
		name: "Ortega Taco Shells",
		department: "unclassified"
	},
	{
		name: "Spice Islands Whole Cumin Seed",
		department: "unclassified"
	},
	{
		name: "Litehouse Garlic",
		department: "unclassified"
	},
	{
		name: "Knorr Tomato Bouillon",
		department: "unclassified"
	},
	{
		name: "Louisiana Pepper Sauce",
		department: "unclassified"
	},
	{
		name: "Frontera Enchilada Sauce",
		department: "unclassified"
	},
	{
		name: "Cajun Power Garlic Sauce",
		department: "unclassified"
	},
	{
		name: "Ore-Ida Waffle Fries",
		department: "unclassified"
	},
	{
		name: "Huy Fong Foods Chili Sauce",
		department: "unclassified"
	},
	{
		name: "Planters Almonds",
		department: "unclassified"
	},
	{
		name: "Hodgson Mill Bread Flour",
		department: "unclassified"
	},
	{
		name: "La Choy Chop Suey Vegetables",
		department: "unclassified"
	},
	{
		name: "La Victoria Hot Sauce",
		department: "unclassified"
	},
	{
		name: "Crisco Pure Corn Oil",
		department: "unclassified"
	},
	{
		name: "3 Musketeers Candy Bars",
		department: "unclassified"
	},
	{
		name: "Bud LIght Beer",
		department: "unclassified"
	},
	{
		name: "Motts Applesauce",
		department: "unclassified"
	},
	{
		name: "DeLallo Pine Nuts",
		department: "unclassified"
	},
	{
		name: "Smithfield Pork Loin Filet",
		department: "unclassified"
	},
	{
		name: "Nestle Hot Cocoa Mix",
		department: "unclassified"
	},
	{
		name: "DeLallo Farfalle",
		department: "unclassified"
	},
	{
		name: "Reames Egg Noodles",
		department: "unclassified"
	},
	{
		name: "Maranatha Almond Butter",
		department: "unclassified"
	},
	{
		name: "Treasure Cave Blue Cheese",
		department: "unclassified"
	},
	{
		name: "House-Autry Seafood Breader",
		department: "unclassified"
	},
	{
		name: "Dove Roasted Almonds",
		department: "unclassified"
	},
	{
		name: "Badia Cinnamon",
		department: "unclassified"
	},
	{
		name: "Coke Cola",
		department: "unclassified"
	},
	{
		name: "Nature Valley Granola Bars",
		department: "unclassified"
	},
	{
		name: "McCann''s Irish Oatmeal",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Ham",
		department: "unclassified"
	},
	{
		name: "Lifeway Kefir Cultured Milk Smoothie",
		department: "unclassified"
	},
	{
		name: "Heinz Hot Ketchup",
		department: "unclassified"
	},
	{
		name: "Applegate Farms Ham",
		department: "unclassified"
	},
	{
		name: "Guiltless Gourmet Baked Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Margherita Pepperoni",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9\\u00AE TOLL HOUSE\\u00AE Dark Chocolate Baking Bar",
		department: "unclassified"
	},
	{
		name: "Frito Lay Corn Chips",
		department: "unclassified"
	},
	{
		name: "Nature Valley Granola",
		department: "unclassified"
	},
	{
		name: "Hood Light Cream",
		department: "unclassified"
	},
	{
		name: "Simply Organic Sage",
		department: "unclassified"
	},
	{
		name: "Arrowhead Mills Organic Brown Rice Flour",
		department: "unclassified"
	},
	{
		name: "Frontier Vanilla Bean",
		department: "unclassified"
	},
	{
		name: "McCormick Cumin",
		department: "unclassified"
	},
	{
		name: "Quaker Quick Cooking Oats",
		department: "unclassified"
	},
	{
		name: "Ortega Green Chiles",
		department: "unclassified"
	},
	{
		name: "Keebler Cookies",
		department: "unclassified"
	},
	{
		name: "Goya Guava Nectar",
		department: "unclassified"
	},
	{
		name: "Cape Cod Chips",
		department: "unclassified"
	},
	{
		name: "Birds Eye Sweet Garden Peas",
		department: "unclassified"
	},
	{
		name: "Raisin Nut Bran Cereal",
		department: "unclassified"
	},
	{
		name: "Cento Whole Peeled Tomatoes",
		department: "unclassified"
	},
	{
		name: "McCormick Diced Jalapeno Peppers",
		department: "unclassified"
	},
	{
		name: "Scharffen Berger Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Alessi Sea Salt",
		department: "unclassified"
	},
	{
		name: "Alessi Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Tasters Choice Instant Coffee",
		department: "unclassified"
	},
	{
		name: "505 Southwestern Green Chile Sauce",
		department: "unclassified"
	},
	{
		name: "Plugra Salted Butter",
		department: "unclassified"
	},
	{
		name: "DeLallo Fusilli col Buco",
		department: "unclassified"
	},
	{
		name: "Nestum Cereal",
		department: "unclassified"
	},
	{
		name: "Smucker''s Jelly Beans",
		department: "unclassified"
	},
	{
		name: "A&W Cream Soda",
		department: "unclassified"
	},
	{
		name: "Spectrum Peanut Oil",
		department: "unclassified"
	},
	{
		name: "Simply Organic Coriander",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Cookie Mix",
		department: "unclassified"
	},
	{
		name: "Fiber One English Muffins",
		department: "unclassified"
	},
	{
		name: "DaVinci Gourmet Classic Caramel Syrup",
		department: "unclassified"
	},
	{
		name: "McCormick Tarragon Leaves",
		department: "unclassified"
	},
	{
		name: "Applegate Bacon",
		department: "unclassified"
	},
	{
		name: "Sanders Hot Fudge",
		department: "unclassified"
	},
	{
		name: "Spice Islands Ground Cardamom",
		department: "unclassified"
	},
	{
		name: "Green Giant White Shoepeg Corn",
		department: "unclassified"
	},
	{
		name: "Goya Basmati Rice",
		department: "unclassified"
	},
	{
		name: "Muller Yogurt",
		department: "unclassified"
	},
	{
		name: "Ferrara Tubetti",
		department: "unclassified"
	},
	{
		name: "On the Border Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "MorningStar Farms Asian Veggie Patties",
		department: "unclassified"
	},
	{
		name: "Malt-O-Meal Cereal",
		department: "unclassified"
	},
	{
		name: "Green Giant Broccoli",
		department: "unclassified"
	},
	{
		name: "Mirassou Pinot Noir",
		department: "unclassified"
	},
	{
		name: "Cascadian Farm Blueberries",
		department: "unclassified"
	},
	{
		name: "Goya All-Purpose Seasoning",
		department: "unclassified"
	},
	{
		name: "Alessi Pine Nuts",
		department: "unclassified"
	},
	{
		name: "Tribe Hummus",
		department: "unclassified"
	},
	{
		name: "Season Salmon",
		department: "unclassified"
	},
	{
		name: "Del Monte Fiesta Corn",
		department: "unclassified"
	},
	{
		name: "Horizon Cream Cheese",
		department: "unclassified"
	},
	{
		name: "Smithfield Pork Sirloin",
		department: "unclassified"
	},
	{
		name: "DeLallo Capellini",
		department: "unclassified"
	},
	{
		name: "Necco Wafers",
		department: "unclassified"
	},
	{
		name: "Godiva Chocolate",
		department: "unclassified"
	},
	{
		name: "Pacific Pumpkin Puree",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Herbes De Provence",
		department: "unclassified"
	},
	{
		name: "Twix Cookie Bars",
		department: "unclassified"
	},
	{
		name: "Koda Farms Sweet Rice Flour",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House DelightFulls Peanut Butter Filled Morsels",
		department: "unclassified"
	},
	{
		name: "Rubschlager Bread",
		department: "unclassified"
	},
	{
		name: "ghost pepper salt",
		department: "unclassified"
	},
	{
		name: "EAS Protein Powder",
		department: "unclassified"
	},
	{
		name: "DeLallo Gnocchi",
		department: "unclassified"
	},
	{
		name: "Dole Classic Romaine",
		department: "unclassified"
	},
	{
		name: "Del Monte Crushed Pineapple",
		department: "unclassified"
	},
	{
		name: "Chicken Of The Sea Pink Salmon",
		department: "unclassified"
	},
	{
		name: "PayDay Candy Bars",
		department: "unclassified"
	},
	{
		name: "Star Grapeseed Oil",
		department: "unclassified"
	},
	{
		name: "Weber Seasoning Salt",
		department: "unclassified"
	},
	{
		name: "Naturally Yours Fat Free Sour Cream",
		department: "unclassified"
	},
	{
		name: "Del Monte Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "DaVinci Gourmet Almond Syrup",
		department: "unclassified"
	},
	{
		name: "SweetTarts Candy",
		department: "unclassified"
	},
	{
		name: "Borden Sour Cream",
		department: "unclassified"
	},
	{
		name: "Frontera Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Blue Bell Ice Cream",
		department: "unclassified"
	},
	{
		name: "Sunflower Flour",
		department: "unclassified"
	},
	{
		name: "Spectrum Canola Oil Baking Spray",
		department: "unclassified"
	},
	{
		name: "DeLallo Rigatoni",
		department: "unclassified"
	},
	{
		name: "Woolwich Dairy Goat Cheese",
		department: "unclassified"
	},
	{
		name: "Kinder Chocolate",
		department: "unclassified"
	},
	{
		name: "Peroni Lager",
		department: "unclassified"
	},
	{
		name: "Tone''s Cayenne Pepper",
		department: "unclassified"
	},
	{
		name: "Triscuit Thin Crisps",
		department: "unclassified"
	},
	{
		name: "Mott''s 100% Apple Juice",
		department: "unclassified"
	},
	{
		name: "Barilla Linguine",
		department: "unclassified"
	},
	{
		name: "Del Monte Petite Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "Barefoot Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "Del Monte Corn",
		department: "unclassified"
	},
	{
		name: "Minute Premium Rice",
		department: "unclassified"
	},
	{
		name: "CHI-CHI'S\\u00AE salsa",
		department: "unclassified"
	},
	{
		name: "Green Giant Whole Mushrooms",
		department: "unclassified"
	},
	{
		name: "Hungry Jack Syrup",
		department: "unclassified"
	},
	{
		name: "Black Box Wines Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "Sweet Dreams Brown Rice Syrup",
		department: "unclassified"
	},
	{
		name: "Puck Cream Cheese Spread",
		department: "unclassified"
	},
	{
		name: "Ro-Tel Tomatoes & Green Chiles",
		department: "unclassified"
	},
	{
		name: "Earthbound Farm Carrots",
		department: "unclassified"
	},
	{
		name: "Take 5 Candy Bars",
		department: "unclassified"
	},
	{
		name: "Barilla Lasagne",
		department: "unclassified"
	},
	{
		name: "Bob''s Red Mill Wheat Berries",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Frosting",
		department: "unclassified"
	},
	{
		name: "Barilla Fettuccine",
		department: "unclassified"
	},
	{
		name: "Goya Peas",
		department: "unclassified"
	},
	{
		name: "Toll House Cookie Dough",
		department: "unclassified"
	},
	{
		name: "Horizon Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "Sure Jell Premium Fruit Pectin",
		department: "unclassified"
	},
	{
		name: "Cento White Kidney Beans",
		department: "unclassified"
	},
	{
		name: "Arnold Bread",
		department: "unclassified"
	},
	{
		name: "Green Giant Sweet Corn",
		department: "unclassified"
	},
	{
		name: "belVita Breakfast Biscuits",
		department: "unclassified"
	},
	{
		name: "McCormick Almond Extract",
		department: "unclassified"
	},
	{
		name: "S&W Kidney Beans",
		department: "unclassified"
	},
	{
		name: "Boo Berry Cereal",
		department: "unclassified"
	},
	{
		name: "DeLallo Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "Camellia Red Kidney Beans",
		department: "unclassified"
	},
	{
		name: "Star Wars Cereal",
		department: "unclassified"
	},
	{
		name: "Little Debbie Cosmic Brownies",
		department: "unclassified"
	},
	{
		name: "Clos Du Bois Chardonnay",
		department: "unclassified"
	},
	{
		name: "Tampico Citrus Punch",
		department: "unclassified"
	},
	{
		name: "Sara Lee 100% Whole Wheat Bread",
		department: "unclassified"
	},
	{
		name: "Foster Farms Chicken Breasts",
		department: "unclassified"
	},
	{
		name: "Welch''s 100% Juice",
		department: "unclassified"
	},
	{
		name: "College Inn Turkey Broth",
		department: "unclassified"
	},
	{
		name: "Country Time Strawberry Lemonade",
		department: "unclassified"
	},
	{
		name: "Salerno Butter Cookies",
		department: "unclassified"
	},
	{
		name: "Smithfield Peppercorn & Garlic Seasoned Pork Tenderloin",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE organic Garam Masala",
		department: "unclassified"
	},
	{
		name: "Pabst Blue Ribbon Beer",
		department: "unclassified"
	},
	{
		name: "Progresso Kidney Beans",
		department: "unclassified"
	},
	{
		name: "Walkers Shortbread",
		department: "unclassified"
	},
	{
		name: "Simply Organic Turmeric",
		department: "unclassified"
	},
	{
		name: "Simply Organic Ground Cloves",
		department: "unclassified"
	},
	{
		name: "Peanut Butter & Co. Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Jimmy Dean Premium Pork Sausage",
		department: "unclassified"
	},
	{
		name: "Adams 100% Natural Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Mountain Valley Spring Water",
		department: "unclassified"
	},
	{
		name: "Goya Pineapple Chunks",
		department: "unclassified"
	},
	{
		name: "Weight Watchers Cream Cheese Spread",
		department: "unclassified"
	},
	{
		name: "Ocean Spray Cranberry Sauce",
		department: "unclassified"
	},
	{
		name: "Bob Evans Pork Sausage",
		department: "unclassified"
	},
	{
		name: "Maggi Chili Sauce",
		department: "unclassified"
	},
	{
		name: "Horizon Butter",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Organics Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Swedish Fish Candy",
		department: "unclassified"
	},
	{
		name: "Land O Lakes Sour Cream",
		department: "unclassified"
	},
	{
		name: "Organic Valley Cultured Butter",
		department: "unclassified"
	},
	{
		name: "Baci Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Kikkoman Roasted Garlic, Teriyaki, Marinade & Sauce",
		department: "unclassified"
	},
	{
		name: "Life Savers Candy",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Super Size Yellow Corn Tortillas",
		department: "unclassified"
	},
	{
		name: "Watkins Ginger",
		department: "unclassified"
	},
	{
		name: "Fever-Tree Club Soda",
		department: "unclassified"
	},
	{
		name: "Healthy Choice Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "Spice Islands Fennel Seed",
		department: "unclassified"
	},
	{
		name: "Krusteaz Cookie Mix",
		department: "unclassified"
	},
	{
		name: "Vermont Common Crackers",
		department: "unclassified"
	},
	{
		name: "Tinkyada Brown Rice Pasta",
		department: "unclassified"
	},
	{
		name: "Yellow Label Syrup",
		department: "unclassified"
	},
	{
		name: "Hunts Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "Honey Grahams Cereal",
		department: "unclassified"
	},
	{
		name: "Hood Cottage Cheese",
		department: "unclassified"
	},
	{
		name: "Del Monte Zucchini",
		department: "unclassified"
	},
	{
		name: "Simply Organic Almond Extract",
		department: "unclassified"
	},
	{
		name: "Betty Crocker  Corn Syrup",
		department: "unclassified"
	},
	{
		name: "Holland House Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Fisher Almonds",
		department: "unclassified"
	},
	{
		name: "Hormel Beef",
		department: "unclassified"
	},
	{
		name: "Torani Almond Syrup",
		department: "unclassified"
	},
	{
		name: "Morton Table Salt",
		department: "unclassified"
	},
	{
		name: "Premio Italian Sausage",
		department: "unclassified"
	},
	{
		name: "Dr Pepper BBQ Sauce",
		department: "unclassified"
	},
	{
		name: "Just Right Cereal",
		department: "unclassified"
	},
	{
		name: "Green Giant Cut Green Beans",
		department: "unclassified"
	},
	{
		name: "Dole Hearts of Romaine",
		department: "unclassified"
	},
	{
		name: "Siljans Croustades",
		department: "unclassified"
	},
	{
		name: "McCormick Lemon Pepper",
		department: "unclassified"
	},
	{
		name: "Starbucks Hot Cocoa Mix",
		department: "unclassified"
	},
	{
		name: "Breakstone\\u2019s Cottage Cheese",
		department: "unclassified"
	},
	{
		name: "Perdue Chicken Breasts",
		department: "unclassified"
	},
	{
		name: "DeLallo Cannellini Beans",
		department: "unclassified"
	},
	{
		name: "whole reduced sodium black beans",
		department: "unclassified"
	},
	{
		name: "thai green chile",
		department: "unclassified"
	},
	{
		name: "tepary beans",
		department: "unclassified"
	},
	{
		name: "sport pepper",
		department: "unclassified"
	},
	{
		name: "Weber\\u00AE Chicago Steak Seasoning",
		department: "unclassified"
	},
	{
		name: "pudina leaf",
		department: "unclassified"
	},
	{
		name: "Progresso Crushed Tomatoes",
		department: "unclassified"
	},
	{
		name: "ornamental kale",
		department: "unclassified"
	},
	{
		name: "morita pepper",
		department: "unclassified"
	},
	{
		name: "lo bok",
		department: "unclassified"
	},
	{
		name: "japanese roasted nori",
		department: "unclassified"
	},
	{
		name: "green pumpkin",
		department: "unclassified"
	},
	{
		name: "green hatch chile",
		department: "unclassified"
	},
	{
		name: "fresh wax bean",
		department: "unclassified"
	},
	{
		name: "california green chile",
		department: "unclassified"
	},
	{
		name: "african bird pepper",
		department: "unclassified"
	},
	{
		name: "vegetable protein",
		department: "unclassified"
	},
	{
		name: "low sodium/low fat chicken stock",
		department: "unclassified"
	},
	{
		name: "low sodium organic beef stock",
		department: "unclassified"
	},
	{
		name: "homemade brown chicken stock",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE FIT & EASY\\u00AE Boneless, Skinless Chicken Thigh Filets",
		department: "unclassified"
	},
	{
		name: "campbell low sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "broccoli soup",
		department: "unclassified"
	},
	{
		name: "whole wheat snack crackers",
		department: "unclassified"
	},
	{
		name: "tapioca granules",
		department: "unclassified"
	},
	{
		name: "semi-sweet mint chocolate chips",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE OVEN STUFFER\\u00AE Whole Roaster, Extra Meaty",
		department: "unclassified"
	},
	{
		name: "minute tapioca",
		department: "unclassified"
	},
	{
		name: "marshmallow miniatures",
		department: "unclassified"
	},
	{
		name: "low sodium saltines",
		department: "unclassified"
	},
	{
		name: "low-fat saltine crackers",
		department: "unclassified"
	},
	{
		name: "low-fat ginger snaps",
		department: "unclassified"
	},
	{
		name: "low-fat crackers",
		department: "unclassified"
	},
	{
		name: "low-fat chocolate wafer cookies",
		department: "unclassified"
	},
	{
		name: "Lifesavers Candy",
		department: "unclassified"
	},
	{
		name: "hickory blend jerky cure",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE SIMPLY SMART\\u00AE Individually Wrapped, Boneless, Skinless, Chicken Breast",
		department: "unclassified"
	},
	{
		name: "custard dessert mix",
		department: "unclassified"
	},
	{
		name: "Chips Ahoy! Real Chocolate Chip Cookies",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE Fresh Split Chicken Breasts",
		department: "unclassified"
	},
	{
		name: "skinless yellowtail snapper fillets",
		department: "unclassified"
	},
	{
		name: "sea clam",
		department: "unclassified"
	},
	{
		name: "lump meat",
		department: "unclassified"
	},
	{
		name: "low sodium chunk tuna",
		department: "unclassified"
	},
	{
		name: "flatfish",
		department: "unclassified"
	},
	{
		name: "chowder clam",
		department: "unclassified"
	},
	{
		name: "blackfish",
		department: "unclassified"
	},
	{
		name: "Soy Vay\\u00AE Spicy\\u2019N Sweet Chili Heat Marinade & Sauce",
		department: "unclassified"
	},
	{
		name: "anchovy puree",
		department: "unclassified"
	},
	{
		name: "whole wheat ravioli",
		department: "unclassified"
	},
	{
		name: "thai black glutinous rice",
		department: "unclassified"
	},
	{
		name: "ramen noodle bunches",
		department: "unclassified"
	},
	{
		name: "polished rice",
		department: "unclassified"
	},
	{
		name: "pecan rice",
		department: "unclassified"
	},
	{
		name: "malloreddus",
		department: "unclassified"
	},
	{
		name: "espresso cavatelli",
		department: "unclassified"
	},
	{
		name: "Barilla Ditalini",
		department: "unclassified"
	},
	{
		name: "gold foil",
		department: "unclassified"
	},
	{
		name: "veal rib roast",
		department: "unclassified"
	},
	{
		name: "strip sirloin",
		department: "unclassified"
	},
	{
		name: "seal meat",
		department: "unclassified"
	},
	{
		name: "rolled rib roast",
		department: "unclassified"
	},
	{
		name: "reduced sodium baked ham",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Fresh Seasoned Turkey Patties",
		department: "unclassified"
	},
	{
		name: "picnic shoulder",
		department: "unclassified"
	},
	{
		name: "olive loaf",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Turkey Thighs",
		department: "unclassified"
	},
	{
		name: "low-fat spicy chicken sausage",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Turkey Drumsticks",
		department: "unclassified"
	},
	{
		name: "lamb testicles",
		department: "unclassified"
	},
	{
		name: "fresh ham steak",
		department: "unclassified"
	},
	{
		name: "fat free less sodium chicken",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Traditional Turkey Bratwurst",
		department: "unclassified"
	},
	{
		name: "cold meat loaf slices",
		department: "unclassified"
	},
	{
		name: "cold duck",
		department: "unclassified"
	},
	{
		name: "calabrese sausage",
		department: "unclassified"
	},
	{
		name: "butt portion",
		department: "unclassified"
	},
	{
		name: "bull fillet",
		department: "unclassified"
	},
	{
		name: "boneless chicken halves",
		department: "unclassified"
	},
	{
		name: "Ball Park Franks",
		department: "unclassified"
	},
	{
		name: "Stagg Chili",
		department: "unclassified"
	},
	{
		name: "low-fat vegetarian chili",
		department: "unclassified"
	},
	{
		name: "low-fat chili",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Peppermint Cookie Ice Cream",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Hot Dogs",
		department: "unclassified"
	},
	{
		name: "rangpur lime",
		department: "unclassified"
	},
	{
		name: "mutsu apple",
		department: "unclassified"
	},
	{
		name: "kumquats in syrup",
		department: "unclassified"
	},
	{
		name: "dried nectarines",
		department: "unclassified"
	},
	{
		name: "candied grapefruit peel",
		department: "unclassified"
	},
	{
		name: "strawberry low-fat ice cream",
		department: "unclassified"
	},
	{
		name: "pina colada sorbet",
		department: "unclassified"
	},
	{
		name: "Keebler Ice Cream Cups",
		department: "unclassified"
	},
	{
		name: "Tabasco Bloody Mary Mix",
		department: "unclassified"
	},
	{
		name: "orange cream soda",
		department: "unclassified"
	},
	{
		name: "Roses Sweetened Lime Juice",
		department: "unclassified"
	},
	{
		name: "pina colada mix concentrate",
		department: "unclassified"
	},
	{
		name: "Nescafe Coffee",
		department: "unclassified"
	},
	{
		name: "natural jus",
		department: "unclassified"
	},
	{
		name: "Minute Maid Lemon Juice",
		department: "unclassified"
	},
	{
		name: "instant drink powder",
		department: "unclassified"
	},
	{
		name: "iced tea powder",
		department: "unclassified"
	},
	{
		name: "goji juice",
		department: "unclassified"
	},
	{
		name: "ginseng tea bags",
		department: "unclassified"
	},
	{
		name: "General Foods International Coffees Cappuccino",
		department: "unclassified"
	},
	{
		name: "Cafe Du Monde Coffee",
		department: "unclassified"
	},
	{
		name: "butter flavored sprinkles",
		department: "unclassified"
	},
	{
		name: "unsweetened low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "tomme de savoie cheese",
		department: "unclassified"
	},
	{
		name: "thick low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "syrian cheese",
		department: "unclassified"
	},
	{
		name: "shredded low-fat jarlsberg cheese",
		department: "unclassified"
	},
	{
		name: "Promise Light Spread",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE Hardwood Smoked Turkey Bacon",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE Hot Italian Turkey Sausage Links",
		department: "unclassified"
	},
	{
		name: "nonfat sugar-free lime yogurt",
		department: "unclassified"
	},
	{
		name: "nonfat dry creamer",
		department: "unclassified"
	},
	{
		name: "nonfat chocolate milk",
		department: "unclassified"
	},
	{
		name: "nonfat chocolate frozen yogurt",
		department: "unclassified"
	},
	{
		name: "nonfat banana yogurt",
		department: "unclassified"
	},
	{
		name: "natural low-fat unsweetened yogurt",
		department: "unclassified"
	},
	{
		name: "natural low-fat plain yogurt",
		department: "unclassified"
	},
	{
		name: "low-fat powdered nondairy creamer",
		department: "unclassified"
	},
	{
		name: "low-fat pepper jack",
		department: "unclassified"
	},
	{
		name: "low-fat jalapeno cheddar cheese",
		department: "unclassified"
	},
	{
		name: "low-fat cherry vanilla yogurt",
		department: "unclassified"
	},
	{
		name: "low fat apricot-mango yogurt",
		department: "unclassified"
	},
	{
		name: "italian cream cheese",
		department: "unclassified"
	},
	{
		name: "gluten-free yogurt",
		department: "unclassified"
	},
	{
		name: "fat free chocolate frozen yogurt",
		department: "unclassified"
	},
	{
		name: "eagle condensed milk",
		department: "unclassified"
	},
	{
		name: "dannon low-fat plain yogurt",
		department: "unclassified"
	},
	{
		name: "Whole Foods Market\\u2122 General Tso\\u2019s Sauce",
		department: "unclassified"
	},
	{
		name: "Belle Chevre Goat Cheese",
		department: "unclassified"
	},
	{
		name: "2% low-fat cheese",
		department: "unclassified"
	},
	{
		name: "vietnamese soy sauce",
		department: "unclassified"
	},
	{
		name: "versatile vinaigrette",
		department: "unclassified"
	},
	{
		name: "ultra low-fat mayonnaise",
		department: "unclassified"
	},
	{
		name: "tamari reduced sodium soy sauce",
		department: "unclassified"
	},
	{
		name: "sweet dill pickles",
		department: "unclassified"
	},
	{
		name: "Stokes Green Chile Sauce with Pork",
		department: "unclassified"
	},
	{
		name: "spicy seafood seasoning",
		department: "unclassified"
	},
	{
		name: "souvlaki marinade",
		department: "unclassified"
	},
	{
		name: "sodium free seasoning mix",
		department: "unclassified"
	},
	{
		name: "seasoned batter mix",
		department: "unclassified"
	},
	{
		name: "reduced sodium brown gravy mix",
		department: "unclassified"
	},
	{
		name: "red bean sauce",
		department: "unclassified"
	},
	{
		name: "ramen oriental seasoning",
		department: "unclassified"
	},
	{
		name: "prepared low-fat pesto",
		department: "unclassified"
	},
	{
		name: "portobello gravy",
		department: "unclassified"
	},
	{
		name: "pickled chipotles",
		department: "unclassified"
	},
	{
		name: "panch phoron",
		department: "unclassified"
	},
	{
		name: "365 Everyday Value\\u00AE Goat Cheese",
		department: "unclassified"
	},
	{
		name: "365 Everyday Value\\u00AE Artichoke Quarters Packed in Water",
		department: "unclassified"
	},
	{
		name: "nonfat asian-style dressing",
		department: "unclassified"
	},
	{
		name: "Morton Iodized Salt",
		department: "unclassified"
	},
	{
		name: "mojito glaze",
		department: "unclassified"
	},
	{
		name: "mesquite flavored seasoning",
		department: "unclassified"
	},
	{
		name: "meat magic flavor enhancer",
		department: "unclassified"
	},
	{
		name: "meat enhancer",
		department: "unclassified"
	},
	{
		name: "McCormick Smokehouse Ground Black Pepper",
		department: "unclassified"
	},
	{
		name: "McCormick Curry Powder",
		department: "unclassified"
	},
	{
		name: "chocolate ice cream mix",
		department: "unclassified"
	},
	{
		name: "McCormick Brown Gravy Mix",
		department: "unclassified"
	},
	{
		name: "low-fat sesame-ginger dressing",
		department: "unclassified"
	},
	{
		name: "low-fat salsa",
		department: "unclassified"
	},
	{
		name: "low fat herb vinaigrette dressing",
		department: "unclassified"
	},
	{
		name: "low-fat catalina dressing",
		department: "unclassified"
	},
	{
		name: "low-fat ginger dressing",
		department: "unclassified"
	},
	{
		name: "low-fat caramel sauce",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Au Jus gravy mix",
		department: "unclassified"
	},
	{
		name: "jerk rub seasoning",
		department: "unclassified"
	},
	{
		name: "hot and sour vinaigrette",
		department: "unclassified"
	},
	{
		name: "Hellmann's\\u00AE Honey Mustard",
		department: "unclassified"
	},
	{
		name: "Best Foods\\u00AE Honey Mustard",
		department: "unclassified"
	},
	{
		name: "Hellmanns Light Mayonnaise",
		department: "unclassified"
	},
	{
		name: "gluten-free sweet chili sauce",
		department: "unclassified"
	},
	{
		name: "El Pato Hot Sauce",
		department: "unclassified"
	},
	{
		name: "dried neem leaves",
		department: "unclassified"
	},
	{
		name: "caribbean jerk",
		department: "unclassified"
	},
	{
		name: "Budweiser Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "annato oil",
		department: "unclassified"
	},
	{
		name: "anise pepper",
		department: "unclassified"
	},
	{
		name: "allegro marinade",
		department: "unclassified"
	},
	{
		name: "acesulfame potassium sweetener",
		department: "unclassified"
	},
	{
		name: "waffle cereal",
		department: "unclassified"
	},
	{
		name: "scotch oats",
		department: "unclassified"
	},
	{
		name: "low-fat whole grain waffles",
		department: "unclassified"
	},
	{
		name: "Honey Smacks Cereal",
		department: "unclassified"
	},
	{
		name: "Heartland Granola Cereal",
		department: "unclassified"
	},
	{
		name: "Frosted Mini-Wheats Cereal",
		department: "unclassified"
	},
	{
		name: "flaked oatmeal",
		department: "unclassified"
	},
	{
		name: "Corn Bran Cereal",
		department: "unclassified"
	},
	{
		name: "cooked cereal",
		department: "unclassified"
	},
	{
		name: "whole wheat sandwich loaf",
		department: "unclassified"
	},
	{
		name: "whole wheat kernels",
		department: "unclassified"
	},
	{
		name: "Goya Peach Halves",
		department: "unclassified"
	},
	{
		name: "whole wheat bread machine flour",
		department: "unclassified"
	},
	{
		name: "triticale flour",
		department: "unclassified"
	},
	{
		name: "torpedo sandwich rolls",
		department: "unclassified"
	},
	{
		name: "sweetbread nuggets",
		department: "unclassified"
	},
	{
		name: "spongecake",
		department: "unclassified"
	},
	{
		name: "single-acting baking powder",
		department: "unclassified"
	},
	{
		name: "sammy buns",
		department: "unclassified"
	},
	{
		name: "pita loaf",
		department: "unclassified"
	},
	{
		name: "Pillsbury Cornbread Twists",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Dinner Rolls",
		department: "unclassified"
	},
	{
		name: "organic sweetener",
		department: "unclassified"
	},
	{
		name: "nonfat flour tortillas",
		department: "unclassified"
	},
	{
		name: "nonfat country-style bread",
		department: "unclassified"
	},
	{
		name: "mini pita loaves",
		department: "unclassified"
	},
	{
		name: "hero sandwich rolls",
		department: "unclassified"
	},
	{
		name: "cornbread sticks",
		department: "unclassified"
	},
	{
		name: "coating batter",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Supreme Brownie Mix",
		department: "unclassified"
	},
	{
		name: "baked cupcake",
		department: "unclassified"
	},
	{
		name: "Stella Artois Beer",
		department: "unclassified"
	},
	{
		name: "Old Milwaukee Beer",
		department: "unclassified"
	},
	{
		name: "moscatel",
		department: "unclassified"
	},
	{
		name: "mandarine liqueur",
		department: "unclassified"
	},
	{
		name: "malmsey madeira",
		department: "unclassified"
	},
	{
		name: "Bombay Gin",
		department: "unclassified"
	},
	{
		name: "Bombay Dry Gin",
		department: "unclassified"
	},
	{
		name: "black muscat wine",
		department: "unclassified"
	},
	{
		name: "berry wine",
		department: "unclassified"
	},
	{
		name: "golden needles",
		department: "unclassified"
	},
	{
		name: "martin pears",
		department: "unclassified"
	},
	{
		name: "roerbakchampignons",
		department: "unclassified"
	},
	{
		name: "reduced fat chive and onion soft cream cheese",
		department: "unclassified"
	},
	{
		name: "puttanesca coulis",
		department: "unclassified"
	},
	{
		name: "Hine Cognac",
		department: "unclassified"
	},
	{
		name: "land snails",
		department: "unclassified"
	},
	{
		name: "italian brown mushroom",
		department: "unclassified"
	},
	{
		name: "Malaga wine",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Orange Peel",
		department: "unclassified"
	},
	{
		name: "Sutter Home Zinfandel",
		department: "unclassified"
	},
	{
		name: "gluten free coffee liqueur",
		department: "unclassified"
	},
	{
		name: "lichee",
		department: "unclassified"
	},
	{
		name: "Casillero del Diablo Sauvignon Blanc",
		department: "unclassified"
	},
	{
		name: "kirch",
		department: "unclassified"
	},
	{
		name: "Malaga ice cream",
		department: "unclassified"
	},
	{
		name: "Gold's Hot Horseradish",
		department: "unclassified"
	},
	{
		name: "Junmai Ginjo sake",
		department: "unclassified"
	},
	{
		name: "coarsely ground sumac",
		department: "unclassified"
	},
	{
		name: "nonfat cottage cheese small curd",
		department: "unclassified"
	},
	{
		name: "vegan provolone cheese",
		department: "unclassified"
	},
	{
		name: "Kendall-Jackson Chardonnay",
		department: "unclassified"
	},
	{
		name: "espellette",
		department: "unclassified"
	},
	{
		name: "Genesee Beer",
		department: "unclassified"
	},
	{
		name: "veal riblets",
		department: "unclassified"
	},
	{
		name: "real gold leaf",
		department: "unclassified"
	},
	{
		name: "Diet Mountain Dew",
		department: "unclassified"
	},
	{
		name: "beef loin roast",
		department: "unclassified"
	},
	{
		name: "whole wheat rustic bread",
		department: "unclassified"
	},
	{
		name: "broccoli cheddar soup",
		department: "unclassified"
	},
	{
		name: "extra-large brown eggs",
		department: "unclassified"
	},
	{
		name: "eierpannenkoekmix",
		department: "unclassified"
	},
	{
		name: "hoagie loaves",
		department: "unclassified"
	},
	{
		name: "pig powder",
		department: "unclassified"
	},
	{
		name: "Makers Mark Whisky",
		department: "unclassified"
	},
	{
		name: "crappie",
		department: "unclassified"
	},
	{
		name: "Bolthouse Farms Holiday Nog",
		department: "unclassified"
	},
	{
		name: "kudzu blossoms",
		department: "unclassified"
	},
	{
		name: "no salt added lima beans",
		department: "unclassified"
	},
	{
		name: "canadian herrings",
		department: "unclassified"
	},
	{
		name: "Hellmann's Mayonnaise with a twist of Pepper",
		department: "unclassified"
	},
	{
		name: "Claussen Kosher Dill Sandwich Slice Pickles",
		department: "unclassified"
	},
	{
		name: "golden gravy",
		department: "unclassified"
	},
	{
		name: "soft taco size whole wheat tortillas",
		department: "unclassified"
	},
	{
		name: "rabbit roast",
		department: "unclassified"
	},
	{
		name: "soy vermicelli",
		department: "unclassified"
	},
	{
		name: "Morningstar Farms Meal Starters Veggie Meatballs",
		department: "unclassified"
	},
	{
		name: "whiskey sour mix",
		department: "unclassified"
	},
	{
		name: "sweet pickle spears",
		department: "unclassified"
	},
	{
		name: "Fire & Flavor gourmet turkey kit",
		department: "unclassified"
	},
	{
		name: "leftover jambalaya",
		department: "unclassified"
	},
	{
		name: "Cheriyaki Glaze",
		department: "unclassified"
	},
	{
		name: "vegetable fat spread",
		department: "unclassified"
	},
	{
		name: "thrushes",
		department: "unclassified"
	},
	{
		name: "single barrel bourbon",
		department: "unclassified"
	},
	{
		name: "onion crackers",
		department: "unclassified"
	},
	{
		name: "337 Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "Rice Dream Classic Original Rice Drink",
		department: "unclassified"
	},
	{
		name: "pork rib eye steaks",
		department: "unclassified"
	},
	{
		name: "choupique",
		department: "unclassified"
	},
	{
		name: "low-fat drinking cocoa powder",
		department: "unclassified"
	},
	{
		name: "canolli shells",
		department: "unclassified"
	},
	{
		name: "Robert Mondavi Fume Blanc",
		department: "unclassified"
	},
	{
		name: "Silk Peach & Mango Dairy-Free Yogurt Alternative",
		department: "unclassified"
	},
	{
		name: "cajun-seasoned snack mix",
		department: "unclassified"
	},
	{
		name: "Ragu Chunky Sundried Tomato & Sweet Basil Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "basturma",
		department: "unclassified"
	},
	{
		name: "hawaiian creme brulee",
		department: "unclassified"
	},
	{
		name: "Korbel  Brandy",
		department: "unclassified"
	},
	{
		name: "ground filberts",
		department: "unclassified"
	},
	{
		name: "Sargento\\u00AE Artisan Blends\\u00AE Shredded Whole Milk Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "casserole mince",
		department: "unclassified"
	},
	{
		name: "cream of pumpkin soup",
		department: "unclassified"
	},
	{
		name: "channa besan",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Refrigerated Mini Chocolate Chip Cookie Bar Dough",
		department: "unclassified"
	},
	{
		name: "swansons low sodium beef broth",
		department: "unclassified"
	},
	{
		name: "yellow stamens",
		department: "unclassified"
	},
	{
		name: "barbecue sauce sodium reduced",
		department: "unclassified"
	},
	{
		name: "Breyers\\u2122 Chocolate Sprinkles",
		department: "unclassified"
	},
	{
		name: "Vermut Negre",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE Turkey Breakfast Sausage Patties",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE 99% Fat Free Ground Turkey Breast",
		department: "unclassified"
	},
	{
		name: "yunnan ham",
		department: "unclassified"
	},
	{
		name: "dry roasted macadamias",
		department: "unclassified"
	},
	{
		name: "asakusa nori",
		department: "unclassified"
	},
	{
		name: "rosamarina",
		department: "unclassified"
	},
	{
		name: "whole wheat blueberry muffin mix",
		department: "unclassified"
	},
	{
		name: "purple ice cream",
		department: "unclassified"
	},
	{
		name: "Courvoisier Cognac",
		department: "unclassified"
	},
	{
		name: "Absolut Pear Vodka",
		department: "unclassified"
	},
	{
		name: "mint schnapps",
		department: "unclassified"
	},
	{
		name: "Barefoot Sauvignon Blanc",
		department: "unclassified"
	},
	{
		name: "La Marca Prosecco",
		department: "unclassified"
	},
	{
		name: "fudgy topping",
		department: "unclassified"
	},
	{
		name: "reduced sodium refried beans",
		department: "unclassified"
	},
	{
		name: "saskatoon",
		department: "unclassified"
	},
	{
		name: "vanilla meal replacement powder",
		department: "unclassified"
	},
	{
		name: "meat pot stickers",
		department: "unclassified"
	},
	{
		name: "sandwich patties",
		department: "unclassified"
	},
	{
		name: "erwtensoepvleespakket",
		department: "unclassified"
	},
	{
		name: "ground cuminseed",
		department: "unclassified"
	},
	{
		name: "chicken breast nuggets",
		department: "unclassified"
	},
	{
		name: "nonfat sugar-free fruit yogurt",
		department: "unclassified"
	},
	{
		name: "Cento Pine Nuts",
		department: "unclassified"
	},
	{
		name: "powdered licorice",
		department: "unclassified"
	},
	{
		name: "triangle roll",
		department: "unclassified"
	},
	{
		name: "cubed turkey thigh",
		department: "unclassified"
	},
	{
		name: "decaffeinated earl grey tea leaves",
		department: "unclassified"
	},
	{
		name: "Eden Dried Cranberries",
		department: "unclassified"
	},
	{
		name: "Gloria Ferrer Pinot Noir",
		department: "unclassified"
	},
	{
		name: "nettle linguine",
		department: "unclassified"
	},
	{
		name: "creme de methe",
		department: "unclassified"
	},
	{
		name: "frozen chicken wingettes",
		department: "unclassified"
	},
	{
		name: "Grow and Behold Bratwurst",
		department: "unclassified"
	},
	{
		name: "chili flavor kettle chips",
		department: "unclassified"
	},
	{
		name: "whole wheat rotis",
		department: "unclassified"
	},
	{
		name: "venison ragout meat",
		department: "unclassified"
	},
	{
		name: "Bertolli Light Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "puritan",
		department: "unclassified"
	},
	{
		name: "samosa seasoning mix",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Pasta Sides\\u2122  Chipotle Rosa",
		department: "unclassified"
	},
	{
		name: "Snoqualmie Chardonnay",
		department: "unclassified"
	},
	{
		name: "crema media",
		department: "unclassified"
	},
	{
		name: "Fire & Flavor beef brine",
		department: "unclassified"
	},
	{
		name: "Mita Crema sheep's milk cheese",
		department: "unclassified"
	},
	{
		name: "toasted cheese ravioli",
		department: "unclassified"
	},
	{
		name: "gros sel",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Decorating Gel",
		department: "unclassified"
	},
	{
		name: "Green Ball cauliflower",
		department: "unclassified"
	},
	{
		name: "Johnsonville\\u00AE Vermont Maple Syrup Breakfast Sausage Patties",
		department: "unclassified"
	},
	{
		name: "Conimex Mix voor Bahmi Goreng",
		department: "unclassified"
	},
	{
		name: "Taster''s Choice Instant Coffee",
		department: "unclassified"
	},
	{
		name: "roomijsflensjes",
		department: "unclassified"
	},
	{
		name: "chocolate macaroon pie shell",
		department: "unclassified"
	},
	{
		name: "Taco Bell Hot Sauce",
		department: "unclassified"
	},
	{
		name: "round bone sirloin",
		department: "unclassified"
	},
	{
		name: "condensed less sodium consomme",
		department: "unclassified"
	},
	{
		name: "sulfur salt",
		department: "unclassified"
	},
	{
		name: "Volpi Pancetta",
		department: "unclassified"
	},
	{
		name: "chocolate chip bagels",
		department: "unclassified"
	},
	{
		name: "gluten free corned beef",
		department: "unclassified"
	},
	{
		name: "Pimms Liqueur",
		department: "unclassified"
	},
	{
		name: "non-dairy eggnog",
		department: "unclassified"
	},
	{
		name: "Victory Garden Sweet Grape Tomatoes",
		department: "unclassified"
	},
	{
		name: "poppadum",
		department: "unclassified"
	},
	{
		name: "Crepes Bonaparte crepe mix",
		department: "unclassified"
	},
	{
		name: "decaffeinated hibiscus tea bags",
		department: "unclassified"
	},
	{
		name: "whole wheat baking mix",
		department: "unclassified"
	},
	{
		name: "pasta sauce mix",
		department: "unclassified"
	},
	{
		name: "kentjur",
		department: "unclassified"
	},
	{
		name: "Yoplait\\u00AE Greek 100 pineapple yogurt",
		department: "unclassified"
	},
	{
		name: "refried red beans",
		department: "unclassified"
	},
	{
		name: "thin red licorice",
		department: "unclassified"
	},
	{
		name: "blue licorice",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Black Sesame Seeds",
		department: "unclassified"
	},
	{
		name: "Candoni Pinot Grigio",
		department: "unclassified"
	},
	{
		name: "Les Petites Fermi\\u00E8res Goat Cheese",
		department: "unclassified"
	},
	{
		name: "spicy tomato soup",
		department: "unclassified"
	},
	{
		name: "stawberry topping",
		department: "unclassified"
	},
	{
		name: "whole wheat round thin sandwich bread",
		department: "unclassified"
	},
	{
		name: "stuffed bird",
		department: "unclassified"
	},
	{
		name: "babi pangang mix",
		department: "unclassified"
	},
	{
		name: "Gloria Ferrer Chardonnay",
		department: "unclassified"
	},
	{
		name: "edible carnations",
		department: "unclassified"
	},
	{
		name: "hot fudge microwavable sundae topping",
		department: "unclassified"
	},
	{
		name: "kaiware",
		department: "unclassified"
	},
	{
		name: "casimiroa",
		department: "unclassified"
	},
	{
		name: "grootmoedersgehaktballen",
		department: "unclassified"
	},
	{
		name: "fennel vinegar",
		department: "unclassified"
	},
	{
		name: "Goldschlager Liqueur",
		department: "unclassified"
	},
	{
		name: "Columbus hops",
		department: "unclassified"
	},
	{
		name: "suckling pig loin fillet",
		department: "unclassified"
	},
	{
		name: "Gallo Family Vineyards Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "carne adovada marinade",
		department: "unclassified"
	},
	{
		name: "Johnsonville Andouille Premium Cooking Sausage",
		department: "unclassified"
	},
	{
		name: "chicken brine",
		department: "unclassified"
	},
	{
		name: "boiling mettwurst",
		department: "unclassified"
	},
	{
		name: "cinnamon raisin english muffins",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Rice Sides\\u2122 Buffalo Chicken flavor",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Rice Sides\\u2122 Creole Garlic Butter",
		department: "unclassified"
	},
	{
		name: "white jelly fungus",
		department: "unclassified"
	},
	{
		name: "Effen Vodka",
		department: "unclassified"
	},
	{
		name: "John Wayne spice rub",
		department: "unclassified"
	},
	{
		name: "sambar masala",
		department: "unclassified"
	},
	{
		name: "Gold's Snappy Ginger Duck Sauce",
		department: "unclassified"
	},
	{
		name: "raspberry sweet tea vodka",
		department: "unclassified"
	},
	{
		name: "Smirnoff Vanilla Twist Vodka",
		department: "unclassified"
	},
	{
		name: "Frey Organic Wine",
		department: "unclassified"
	},
	{
		name: "Junipero Gin",
		department: "unclassified"
	},
	{
		name: "hare medallions",
		department: "unclassified"
	},
	{
		name: "Godiva Orange Flavored Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Red Stripe Lager",
		department: "unclassified"
	},
	{
		name: "Apple Nestle Juicy Juice 100% Juice",
		department: "unclassified"
	},
	{
		name: "Les Petitie Fremiere Fontina",
		department: "unclassified"
	},
	{
		name: "low-fat medium cheddar cheese",
		department: "unclassified"
	},
	{
		name: "sparkling sangria tradicional",
		department: "unclassified"
	},
	{
		name: "raw green pumpkinseed kernels",
		department: "unclassified"
	},
	{
		name: "Fernet-Branca Liqueur",
		department: "unclassified"
	},
	{
		name: "ginkgo leaves",
		department: "unclassified"
	},
	{
		name: "young marrow",
		department: "unclassified"
	},
	{
		name: "gum glue",
		department: "unclassified"
	},
	{
		name: "Godiva White Chocolate Ice Cream",
		department: "unclassified"
	},
	{
		name: "San Francisco Bay Coffee",
		department: "unclassified"
	},
	{
		name: "Del Monte Watermelon",
		department: "unclassified"
	},
	{
		name: "reduced fat roasted garlic cream cheese",
		department: "unclassified"
	},
	{
		name: "kriek lambic",
		department: "unclassified"
	},
	{
		name: "seafood glaze",
		department: "unclassified"
	},
	{
		name: "english daisy blossoms",
		department: "unclassified"
	},
	{
		name: "east kent goldings hops",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Basil",
		department: "unclassified"
	},
	{
		name: "Kendall-Jackson Pinot Gris",
		department: "unclassified"
	},
	{
		name: "cooked and mashed yuca",
		department: "unclassified"
	},
	{
		name: "Lipton\\u00AE Tea & Honey Blackberry Pomegranate Iced Green Tea Mix Pitcher Packet",
		department: "unclassified"
	},
	{
		name: "(RI) 1 Whiskey",
		department: "unclassified"
	},
	{
		name: "Geuze",
		department: "unclassified"
	},
	{
		name: "OneHope Sauvignon Blanc",
		department: "unclassified"
	},
	{
		name: "whole wheat flake cereal crumbs",
		department: "unclassified"
	},
	{
		name: "espresso and chili brine",
		department: "unclassified"
	},
	{
		name: "Louis Roederer Champagne",
		department: "unclassified"
	},
	{
		name: "pheasant breast fillets",
		department: "unclassified"
	},
	{
		name: "game steaks",
		department: "unclassified"
	},
	{
		name: "Tanqueray Vodka",
		department: "unclassified"
	},
	{
		name: "low-fat lean ground beef",
		department: "unclassified"
	},
	{
		name: "light buttermilk ranch dressing",
		department: "unclassified"
	},
	{
		name: "Weber\\u00AE Kick'N Chicken Seasoning",
		department: "unclassified"
	},
	{
		name: "Homade Chili Sauce",
		department: "unclassified"
	},
	{
		name: "bahmi goreng mix",
		department: "unclassified"
	},
	{
		name: "Vermont Ham",
		department: "unclassified"
	},
	{
		name: "zalmvinken",
		department: "unclassified"
	},
	{
		name: "lapsang souchang teabags",
		department: "unclassified"
	},
	{
		name: "Hogue Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "kruidenbouillonzakjes",
		department: "unclassified"
	},
	{
		name: "Watkins Pure Almond Extract",
		department: "unclassified"
	},
	{
		name: "Herradura Silver Tequila",
		department: "unclassified"
	},
	{
		name: "Platinum 7X Vodka",
		department: "unclassified"
	},
	{
		name: "mafalde",
		department: "unclassified"
	},
	{
		name: "JOHNSONVILLE\\u00AE Hot 'N Spicy Brats",
		department: "unclassified"
	},
	{
		name: "spinach stock",
		department: "unclassified"
	},
	{
		name: "spam strips",
		department: "unclassified"
	},
	{
		name: "fuerte avocado",
		department: "unclassified"
	},
	{
		name: "Black Box Wines Chardonnay",
		department: "unclassified"
	},
	{
		name: "wild-caught yellowfin tuna steaks",
		department: "unclassified"
	},
	{
		name: "fat-free vegetarian refried beans",
		department: "unclassified"
	},
	{
		name: "Kraft Greek Vinaigrette Dressing with Feta Cheese",
		department: "unclassified"
	},
	{
		name: "Yellow Tail Shiraz",
		department: "unclassified"
	},
	{
		name: "chocolate decorating gel",
		department: "unclassified"
	},
	{
		name: "National Bohemian Beer",
		department: "unclassified"
	},
	{
		name: "blue foot mushrooms",
		department: "unclassified"
	},
	{
		name: "Level Vodka",
		department: "unclassified"
	},
	{
		name: "slivowitz",
		department: "unclassified"
	},
	{
		name: "barbera",
		department: "unclassified"
	},
	{
		name: "sapote",
		department: "unclassified"
	},
	{
		name: "Blue Diamond Unsweetened Vanilla Almond Milk",
		department: "unclassified"
	},
	{
		name: "low sodium seafood seasoning",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Pasta Sides\\u2122  Cheddar Chipotle",
		department: "unclassified"
	},
	{
		name: "citrus buerre blanc",
		department: "unclassified"
	},
	{
		name: "flagels",
		department: "unclassified"
	},
	{
		name: "Pampero Rum",
		department: "unclassified"
	},
	{
		name: "pimiento cod fillets",
		department: "unclassified"
	},
	{
		name: "pimiento fillets",
		department: "unclassified"
	},
	{
		name: "whole grain butter biscuit",
		department: "unclassified"
	},
	{
		name: "Brugal Rum",
		department: "unclassified"
	},
	{
		name: "unsweetened pear applesauce",
		department: "unclassified"
	},
	{
		name: "milk rolls",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Deli Fresh Bold Mesquite Smoked Turkey Breast",
		department: "unclassified"
	},
	{
		name: "french snails",
		department: "unclassified"
	},
	{
		name: "whole cuminseed",
		department: "unclassified"
	},
	{
		name: "La Crema Pinot Noir",
		department: "unclassified"
	},
	{
		name: "green tai leaves",
		department: "unclassified"
	},
	{
		name: "refrigerator-dried sopressata",
		department: "unclassified"
	},
	{
		name: "urad dal skinned and split",
		department: "unclassified"
	},
	{
		name: "Sierra Nevada Pale Ale",
		department: "unclassified"
	},
	{
		name: "tomato vegetable soup",
		department: "unclassified"
	},
	{
		name: "earl gray",
		department: "unclassified"
	},
	{
		name: "heirloom squash",
		department: "unclassified"
	},
	{
		name: "pot prepared low-fat custard",
		department: "unclassified"
	},
	{
		name: "unsweetened espresso concentrate",
		department: "unclassified"
	},
	{
		name: "flan shell",
		department: "unclassified"
	},
	{
		name: "tied curds",
		department: "unclassified"
	},
	{
		name: "whole wheat yeast",
		department: "unclassified"
	},
	{
		name: "gazpacho coulis",
		department: "unclassified"
	},
	{
		name: "whole grain breadsticks",
		department: "unclassified"
	},
	{
		name: "Cake Mate Decorating Gel",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9\\u00AE TOLL HOUSE\\u00AE DelightFulls\\u2122 Dark Chocolate Morsels With Artificial Coconut Flavored Filling",
		department: "unclassified"
	},
	{
		name: "saga wagyu",
		department: "unclassified"
	},
	{
		name: "black caraway",
		department: "unclassified"
	},
	{
		name: "english bitter",
		department: "unclassified"
	},
	{
		name: "Victory Beer",
		department: "unclassified"
	},
	{
		name: "citrus reduction",
		department: "unclassified"
	},
	{
		name: "low fat butter pecan ice cream",
		department: "unclassified"
	},
	{
		name: "Kinnikinnick frozen gluten-free pizza crust",
		department: "unclassified"
	},
	{
		name: "GOYA\\u00AE Rice & Red Beans",
		department: "unclassified"
	},
	{
		name: "gumbo base",
		department: "unclassified"
	},
	{
		name: "ribbon kelp",
		department: "unclassified"
	},
	{
		name: "flavored mineral water",
		department: "unclassified"
	},
	{
		name: "low-fat creme anglaise",
		department: "unclassified"
	},
	{
		name: "bamboo fungus",
		department: "unclassified"
	},
	{
		name: "kerstboomaardappeltjes",
		department: "unclassified"
	},
	{
		name: "Weber\\u00AE Black Peppercorn Marinade Mix",
		department: "unclassified"
	},
	{
		name: "dry pasta dumplings",
		department: "unclassified"
	},
	{
		name: "Cadbury Fudge",
		department: "unclassified"
	},
	{
		name: "Honey Brown Lager",
		department: "unclassified"
	},
	{
		name: "plain gomashio",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9\\u00AE TOLL HOUSE\\u00AE Refrigerated Sugar Cookie Bar Dough",
		department: "unclassified"
	},
	{
		name: "radicchio leaf bowls",
		department: "unclassified"
	},
	{
		name: "SHAKE \\u2018N BAKE Crunchy Pretzel Flavor Seasoned Coating Mix",
		department: "unclassified"
	},
	{
		name: "Mirassou Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "Gallo Family Vineyards Pinot Noir",
		department: "unclassified"
	},
	{
		name: "marudaizu shoyu",
		department: "unclassified"
	},
	{
		name: "patataardappelen",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9\\u00AE TOLL HOUSE\\u00AE Bittersweet Chocolate Morsels",
		department: "unclassified"
	},
	{
		name: "1554 Enlightened Black Ale",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Tomato Flakes",
		department: "unclassified"
	},
	{
		name: "mini powdered doughnuts",
		department: "unclassified"
	},
	{
		name: "cranraspberry concentrate",
		department: "unclassified"
	},
	{
		name: "grated montasio",
		department: "unclassified"
	},
	{
		name: "Guinness Lager",
		department: "unclassified"
	},
	{
		name: "pareve chicken flavored bouillon",
		department: "unclassified"
	},
	{
		name: "Fire & Flavor turkey glaze",
		department: "unclassified"
	},
	{
		name: "asparagus broth",
		department: "unclassified"
	},
	{
		name: "barbecue beef ribs",
		department: "unclassified"
	},
	{
		name: "Dogfish Head Indian Brown Ale",
		department: "unclassified"
	},
	{
		name: "wild-caught yellowfin tuna",
		department: "unclassified"
	},
	{
		name: "fen szu",
		department: "unclassified"
	},
	{
		name: "ethyl alcohol",
		department: "unclassified"
	},
	{
		name: "blue ice cream",
		department: "unclassified"
	},
	{
		name: "cusk",
		department: "unclassified"
	},
	{
		name: "Sutter Home White Zinfandel",
		department: "unclassified"
	},
	{
		name: "jose cuervo flavored tequilas",
		department: "unclassified"
	},
	{
		name: "plain low-fat feta",
		department: "unclassified"
	},
	{
		name: "Santa Cruz Rum",
		department: "unclassified"
	},
	{
		name: "mild smoked sausage",
		department: "unclassified"
	},
	{
		name: "gluten free cinnamon sugar donuts",
		department: "unclassified"
	},
	{
		name: "sumac concentrate",
		department: "unclassified"
	},
	{
		name: "Caposaldo Prosecco",
		department: "unclassified"
	},
	{
		name: "denver ribs",
		department: "unclassified"
	},
	{
		name: "Milagro Silver Tequila",
		department: "unclassified"
	},
	{
		name: "Sierra Nevada Porter",
		department: "unclassified"
	},
	{
		name: "southern whisky",
		department: "unclassified"
	},
	{
		name: "macallan",
		department: "unclassified"
	},
	{
		name: "Rogue Dead Guy Ale",
		department: "unclassified"
	},
	{
		name: "baby zebra eggplants",
		department: "unclassified"
	},
	{
		name: "powdered doughnuts",
		department: "unclassified"
	},
	{
		name: "packaged cookies",
		department: "unclassified"
	},
	{
		name: "chile pepper (dried)",
		department: "unclassified"
	},
	{
		name: "gluten free cookie dough",
		department: "unclassified"
	},
	{
		name: "McCormick\\u00AE California Style Garlic Pepper with Red Bell and Black Pepper",
		department: "unclassified"
	},
	{
		name: "usu-age",
		department: "unclassified"
	},
	{
		name: "coffee wafers",
		department: "unclassified"
	},
	{
		name: "White Labs WLP007 Dry English Ale Yeast",
		department: "unclassified"
	},
	{
		name: "onion bouillon",
		department: "unclassified"
	},
	{
		name: "Cadbury Chocolate Bar",
		department: "unclassified"
	},
	{
		name: "powdered gold leaf",
		department: "unclassified"
	},
	{
		name: "Kraft Cheese Slices, Extra Thin, Extra Sharp White Cheddar, Slim Cut",
		department: "unclassified"
	},
	{
		name: "groningerkoek",
		department: "unclassified"
	},
	{
		name: "Cerveza Beer",
		department: "unclassified"
	},
	{
		name: "Ghirardelli\\u00AE Intense Dark Sea Salt Soiree Bar",
		department: "unclassified"
	},
	{
		name: "rocoto chile",
		department: "unclassified"
	},
	{
		name: "whole branzini",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Shredded Mexican 4 Cheese",
		department: "unclassified"
	},
	{
		name: "hekka marinade",
		department: "unclassified"
	},
	{
		name: "freshly grated montasio",
		department: "unclassified"
	},
	{
		name: "Sailor Jerry Rum",
		department: "unclassified"
	},
	{
		name: "Betty Crocker\\u2122 Homestyle Stuffing",
		department: "unclassified"
	},
	{
		name: "konafah",
		department: "unclassified"
	},
	{
		name: "Nestle Toll House Semi-Sweet Chocolate Baking Bar",
		department: "unclassified"
	},
	{
		name: "DiSaronno Originale Liqueur",
		department: "unclassified"
	},
	{
		name: "amber rhum agricole",
		department: "unclassified"
	},
	{
		name: "nonfat raspberry greek yogurt",
		department: "unclassified"
	},
	{
		name: "sui choy",
		department: "unclassified"
	},
	{
		name: "hop pellets",
		department: "unclassified"
	},
	{
		name: "vegetable nuggets",
		department: "unclassified"
	},
	{
		name: "Hengstenberg Sauerkraut",
		department: "unclassified"
	},
	{
		name: "Lipton\\u00AE Tea & Honey Strawberry Acai Decaf Iced Green Tea Mix To Go Packe",
		department: "unclassified"
	},
	{
		name: "Knorr\\u00AE Menu Flavors Rice Sides\\u2122 Thai Curry",
		department: "unclassified"
	},
	{
		name: "kadota",
		department: "unclassified"
	},
	{
		name: "sunflower seed rolls",
		department: "unclassified"
	},
	{
		name: "Cedar Springs Veal",
		department: "unclassified"
	},
	{
		name: "shad",
		department: "unclassified"
	},
	{
		name: "irish breakfast tea leaves",
		department: "unclassified"
	},
	{
		name: "JOHNSONVILLE Hot & Spicy Sausage Slices",
		department: "unclassified"
	},
	{
		name: "crespelle batter",
		department: "unclassified"
	},
	{
		name: "turkey bratwurst",
		department: "unclassified"
	},
	{
		name: "Vietnamese noodles",
		department: "unclassified"
	},
	{
		name: "whole sweet pickle",
		department: "unclassified"
	},
	{
		name: "breaded chicken breast patties",
		department: "unclassified"
	},
	{
		name: "Estancia Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "NestFresh Eggs",
		department: "unclassified"
	},
	{
		name: "Crystal Farms American Cheese Slices",
		department: "unclassified"
	},
	{
		name: "kent goldings hops",
		department: "unclassified"
	},
	{
		name: "chocolate covered nuts",
		department: "unclassified"
	},
	{
		name: "bison fillets",
		department: "unclassified"
	},
	{
		name: "whole grain baguette roll",
		department: "unclassified"
	},
	{
		name: "Scrappys lavender bitters",
		department: "unclassified"
	},
	{
		name: "table pears",
		department: "unclassified"
	},
	{
		name: "UV Vodka",
		department: "unclassified"
	},
	{
		name: "gelatinous cold gravy",
		department: "unclassified"
	},
	{
		name: "ginger garlic stir fry sauce",
		department: "unclassified"
	},
	{
		name: "tramezzini soft white bread",
		department: "unclassified"
	},
	{
		name: "Woodbridge by Robert Mondavi Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "venison roll roast",
		department: "unclassified"
	},
	{
		name: "Earthbound Farm Kale Berry Smoothie Kickstart",
		department: "unclassified"
	},
	{
		name: "kentucky whisky",
		department: "unclassified"
	},
	{
		name: "Murphy-Goode Zinfandel",
		department: "unclassified"
	},
	{
		name: "Round of Hungary peppers",
		department: "unclassified"
	},
	{
		name: "reduced sugar peach jam",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Italian Homemade Style Basil Pesto",
		department: "unclassified"
	},
	{
		name: "Sicilia Lime Juice",
		department: "unclassified"
	},
	{
		name: "groentesoeppakket",
		department: "unclassified"
	},
	{
		name: "pork caul",
		department: "unclassified"
	},
	{
		name: "Woodbridge Pinot Noir",
		department: "unclassified"
	},
	{
		name: "Oreo Ultimate Icing",
		department: "unclassified"
	},
	{
		name: "dried hops flowers",
		department: "unclassified"
	},
	{
		name: "Kraft Big Slice Hot Habanero Cheese Slices",
		department: "unclassified"
	},
	{
		name: "Prairie Vodka",
		department: "unclassified"
	},
	{
		name: "yellow ice cream",
		department: "unclassified"
	},
	{
		name: "veal goulash meat",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Buttermilk Recipe Salad Dressing Mix",
		department: "unclassified"
	},
	{
		name: "RedRum Rum",
		department: "unclassified"
	},
	{
		name: "Nielsen-Massey Peppermint Extract",
		department: "unclassified"
	},
	{
		name: "vegetable burger patty",
		department: "unclassified"
	},
	{
		name: "confit quesadillas",
		department: "unclassified"
	},
	{
		name: "vermont chevre",
		department: "unclassified"
	},
	{
		name: "gator tail",
		department: "unclassified"
	},
	{
		name: "crusty semolina submarine rolls",
		department: "unclassified"
	},
	{
		name: "Cambria Chardonnay",
		department: "unclassified"
	},
	{
		name: "Trader Joe's Organic Raspberry Fruit Spread",
		department: "unclassified"
	},
	{
		name: "root beer vodka",
		department: "unclassified"
	},
	{
		name: "meal replacement powder",
		department: "unclassified"
	},
	{
		name: "Martha White Self Rising White Buttermilk Corn Meal Mix",
		department: "unclassified"
	},
	{
		name: "TAO sour mix",
		department: "unclassified"
	},
	{
		name: "Filone bread",
		department: "unclassified"
	},
	{
		name: "Korbel Champagne",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE Frozen Whole Turkey",
		department: "unclassified"
	},
	{
		name: "Tyson\\u00AE frozen popcorn chicken pieces",
		department: "unclassified"
	},
	{
		name: "chicken shawarma",
		department: "unclassified"
	},
	{
		name: "instant apple cinnamon oatmeal",
		department: "unclassified"
	},
	{
		name: "rabbit kidneys",
		department: "unclassified"
	},
	{
		name: "Lipton\\u00AE Tea & Honey Blackberry Pomegranate Iced Green Tea Mix To Go Packet",
		department: "unclassified"
	},
	{
		name: "coon",
		department: "unclassified"
	},
	{
		name: "savoy spinach",
		department: "unclassified"
	},
	{
		name: "soy half & half",
		department: "unclassified"
	},
	{
		name: "turnip green pasta",
		department: "unclassified"
	},
	{
		name: "shortbread cookie sticks",
		department: "unclassified"
	},
	{
		name: "salpicao",
		department: "unclassified"
	},
	{
		name: "Dole Baby Lettuces",
		department: "unclassified"
	},
	{
		name: "wild marjoram",
		department: "unclassified"
	},
	{
		name: "aziki",
		department: "unclassified"
	},
	{
		name: "Maesri Panang Curry Paste",
		department: "unclassified"
	},
	{
		name: "light hot fudge topping",
		department: "unclassified"
	},
	{
		name: "cherry liqueur chocolates",
		department: "unclassified"
	},
	{
		name: "Rutherford Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Shredded Mac and Cheese 3 Cheese Blend",
		department: "unclassified"
	},
	{
		name: "italian moscato",
		department: "unclassified"
	},
	{
		name: "bleu de bresse",
		department: "unclassified"
	},
	{
		name: "plain ravioli",
		department: "unclassified"
	},
	{
		name: "Ragu Golden Veggie Fettuccine Pasta",
		department: "unclassified"
	},
	{
		name: "bacon flavored sausage",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Super Soft Large Burrito Size Flour Tortillas",
		department: "unclassified"
	},
	{
		name: "imported proscuitto",
		department: "unclassified"
	},
	{
		name: "golden poundcake",
		department: "unclassified"
	},
	{
		name: "air-dried sopressata",
		department: "unclassified"
	},
	{
		name: "abdijbloem",
		department: "unclassified"
	},
	{
		name: "valdeon",
		department: "unclassified"
	},
	{
		name: "Oreo Chocolate Creme Sandwich Cookies",
		department: "unclassified"
	},
	{
		name: "tropical coulis",
		department: "unclassified"
	},
	{
		name: "Kenwood Chardonnay",
		department: "unclassified"
	},
	{
		name: "apricot quarters",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Basil Pesto",
		department: "unclassified"
	},
	{
		name: "Santa Margherita Pinot Grigio",
		department: "unclassified"
	},
	{
		name: "beet linguine",
		department: "unclassified"
	},
	{
		name: "Leibniz Biscuits",
		department: "unclassified"
	},
	{
		name: "softshells",
		department: "unclassified"
	},
	{
		name: "red sea bream",
		department: "unclassified"
	},
	{
		name: "linden leaves",
		department: "unclassified"
	},
	{
		name: "Jack's Gourmet Spicy Italian Style Salami",
		department: "unclassified"
	},
	{
		name: "Heritage Gin",
		department: "unclassified"
	},
	{
		name: "Sutter Home Pinot Noir",
		department: "unclassified"
	},
	{
		name: "Alamos Cabernet Sauvignon",
		department: "unclassified"
	},
	{
		name: "spicy bratwurst",
		department: "unclassified"
	},
	{
		name: "spicy brats",
		department: "unclassified"
	},
	{
		name: "pork coating mix",
		department: "unclassified"
	},
	{
		name: "shizu leaves",
		department: "unclassified"
	},
	{
		name: "whole wheat French bread rolls",
		department: "unclassified"
	},
	{
		name: "whole wheat nut bread",
		department: "unclassified"
	},
	{
		name: "dixie fry",
		department: "unclassified"
	},
	{
		name: "Biscoff Crunchy Spread",
		department: "unclassified"
	},
	{
		name: "Clos Du Bois Pinot Grigio",
		department: "unclassified"
	},
	{
		name: "certo light crystals",
		department: "unclassified"
	},
	{
		name: "Les Petites Fermi\\u00E8res Gouda",
		department: "unclassified"
	},
	{
		name: "Junmai sake",
		department: "unclassified"
	},
	{
		name: "lamb chuck",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Selects Slow Roasted Turkey Breast",
		department: "unclassified"
	},
	{
		name: "game poulet",
		department: "unclassified"
	},
	{
		name: "parsi sambar masala",
		department: "unclassified"
	},
	{
		name: "cafe au lait creme anglaise",
		department: "unclassified"
	},
	{
		name: "gold mini balls",
		department: "unclassified"
	},
	{
		name: "cran/raspberry concentrate",
		department: "unclassified"
	},
	{
		name: "whole yellowtail snapper fillets",
		department: "unclassified"
	},
	{
		name: "Morad Danue Passion Fruit Wine",
		department: "unclassified"
	},
	{
		name: "Amarena syrup",
		department: "unclassified"
	},
	{
		name: "Imperial Beer",
		department: "unclassified"
	},
	{
		name: "kosher pickle spears",
		department: "unclassified"
	},
	{
		name: "low-fat chicken meat",
		department: "unclassified"
	},
	{
		name: "liquid chai concentrate",
		department: "unclassified"
	},
	{
		name: "Savannah Bee Honey",
		department: "unclassified"
	},
	{
		name: "Wholly Avocado",
		department: "unclassified"
	},
	{
		name: "Fris Vodka",
		department: "unclassified"
	},
	{
		name: "HORMEL\\u00AE Turkey Chili No Beans",
		department: "unclassified"
	},
	{
		name: "HORMEL\\u00AE Turkey Chili",
		department: "unclassified"
	},
	{
		name: "HORMEL\\u00AE Turkey Chili with Beans",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Lower Sodium Turkey Bacon made with Sea Salt",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Lean Turkey Breakfast Sausage Patties",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Sun Dried Tomato Turkey Breast",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Extra Lean Turkey Breast Cutlets",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Lean Seasoned Turkey Burger Patties",
		department: "unclassified"
	},
	{
		name: "HOUSE OF TSANG\\u00AE ginger flavored soy sauce",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Lean Sweet Italian Turkey Sausage",
		department: "unclassified"
	},
	{
		name: "tomato and basil tortilla wraps",
		department: "unclassified"
	},
	{
		name: "no-salt-added diced petite tomatoes",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Lean Ground Turkey Roll",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE GRAND CHAMPION\\u00AE Oven Roasted Turkey Breast",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Hickory Smoked Honey Roasted Turkey Breast",
		department: "unclassified"
	},
	{
		name: "JENNIE-O\\u00AE Lean Turkey Breakfast Sausage Roll",
		department: "unclassified"
	},
	{
		name: "HORMEL\\u00AE Pizza Style Canadian Bacon",
		department: "unclassified"
	},
	{
		name: "herbed panko crumbs",
		department: "unclassified"
	},
	{
		name: "pesto mayonnaise",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE HARVESTLAND\\u00AE Boneless Skinless Chicken Thighs",
		department: "unclassified"
	},
	{
		name: "bonito fillets",
		department: "unclassified"
	},
	{
		name: "coley fillets",
		department: "unclassified"
	},
	{
		name: "Gorton's Shrimp Scampi",
		department: "unclassified"
	},
	{
		name: "Gorton\\u2019s Pub-Style Beer Battered Cod Fillets",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Chinese Five Spice",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Ground White Pepper",
		department: "unclassified"
	},
	{
		name: "sambal tomat",
		department: "unclassified"
	},
	{
		name: "sambal belachan",
		department: "unclassified"
	},
	{
		name: "caribbean style jerk seasoning",
		department: "unclassified"
	},
	{
		name: "caribbean-style rub",
		department: "unclassified"
	},
	{
		name: "Buffalo-style chicken wings",
		department: "unclassified"
	},
	{
		name: "Cabot Sharp Yellow Cheddar",
		department: "unclassified"
	},
	{
		name: "barley grass",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Whole Wheat Tortillas",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Carb Balance Medium Soft Taco Tortillas",
		department: "unclassified"
	},
	{
		name: "dill cream cheese",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Artisan\\u00AE Corn & Whole Wheat Tortillas",
		department: "unclassified"
	},
	{
		name: "Stacy's\\u00AE Everything Bagel Chips",
		department: "unclassified"
	},
	{
		name: "Sabra\\u00AE Roasted Garlic Salsa",
		department: "unclassified"
	},
	{
		name: "Stacy's\\u00AE Simply Cocoa\\u00AE Pita Chips",
		department: "unclassified"
	},
	{
		name: "Stacy\\u2019s\\u00AE Toasted Garlic Bagel Chips",
		department: "unclassified"
	},
	{
		name: "chocolate pound cake",
		department: "unclassified"
	},
	{
		name: "currywurst",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Cocktail Onions",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Italian Plum Tomato Marinara Sauce",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Napa Valley Bistro\\u00AE Pitted Kalamata Olives",
		department: "unclassified"
	},
	{
		name: "light pepper jack cheese slices",
		department: "unclassified"
	},
	{
		name: "Sourdough Starter for Artisan Breads",
		department: "unclassified"
	},
	{
		name: "unsweetened chai tea",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Whole Milk Ricotta Cheese",
		department: "unclassified"
	},
	{
		name: "Simply Potatoes\\u00AE Traditional Mashed Potatoes",
		department: "unclassified"
	},
	{
		name: "David\\u2019s Deli\\u00AE Plain Bagels",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Reduced Fat Marble Jack Cheese",
		department: "unclassified"
	},
	{
		name: "Crystal Farms Wisconsin Marble Jack Stick Cheese",
		department: "unclassified"
	},
	{
		name: "Bacon and Gouda Mashed Potatoes",
		department: "unclassified"
	},
	{
		name: "Gluten-Free Soda Bread Flour Blend",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Farmhouse Originals Homestyle Italian Dressing & Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "Maille Dijon Mustard with Basil and Fennel",
		department: "unclassified"
	},
	{
		name: "Yoplait\\u00AE Greek 100 raspberry yogurt",
		department: "unclassified"
	},
	{
		name: "Green Giant\\u2122 Select\\u00AE frozen baby sweet peas",
		department: "unclassified"
	},
	{
		name: "Yoplait honey-flavored Greek-style yogurt",
		department: "unclassified"
	},
	{
		name: "cranberry bagels",
		department: "unclassified"
	},
	{
		name: "cinnamon bagels",
		department: "unclassified"
	},
	{
		name: "Classico Vodka Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "8th Continent Original Light Soymilk",
		department: "unclassified"
	},
	{
		name: "Black Diamond Cheddar Cheese",
		department: "unclassified"
	},
	{
		name: "Vigo Bread Crumbs",
		department: "unclassified"
	},
	{
		name: "4C Bread Crumbs",
		department: "unclassified"
	},
	{
		name: "gray squash",
		department: "unclassified"
	},
	{
		name: "Swedish seasoning blend",
		department: "unclassified"
	},
	{
		name: "celery microgreens",
		department: "unclassified"
	},
	{
		name: "sparkling pomegranate juice",
		department: "unclassified"
	},
	{
		name: "low-fat bacon ranch dressing",
		department: "unclassified"
	},
	{
		name: "Mori-Nu Soft Tofu",
		department: "unclassified"
	},
	{
		name: "reduced sodium italian style stewed tomatoes",
		department: "unclassified"
	},
	{
		name: "Kroger Sliced Olives",
		department: "unclassified"
	},
	{
		name: "2-row malt",
		department: "unclassified"
	},
	{
		name: "extra light dry malt extract",
		department: "unclassified"
	},
	{
		name: "dry lager yeast",
		department: "unclassified"
	},
	{
		name: "caramel malt",
		department: "unclassified"
	},
	{
		name: "pilsner malt",
		department: "unclassified"
	},
	{
		name: "vienna malt",
		department: "unclassified"
	},
	{
		name: "hard red spring wheat",
		department: "unclassified"
	},
	{
		name: "Philadelphia Fat Free Strawberry Cream Cheese",
		department: "unclassified"
	},
	{
		name: "Philadelphia Pineapple Cream Cheese Spread",
		department: "unclassified"
	},
	{
		name: "Prego Artisan Three Cheese Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "Wild Turkey 101",
		department: "unclassified"
	},
	{
		name: "truffle puree",
		department: "unclassified"
	},
	{
		name: "snail stock",
		department: "unclassified"
	},
	{
		name: "salsify juice",
		department: "unclassified"
	},
	{
		name: "pomegranate pur\\u00E9e",
		department: "unclassified"
	},
	{
		name: "pork liver p\\u00E2t\\u00E9",
		department: "unclassified"
	},
	{
		name: "pepper p\\u00E2t\\u00E9",
		department: "unclassified"
	},
	{
		name: "white chocolate couverture",
		department: "unclassified"
	},
	{
		name: "meatball soup",
		department: "unclassified"
	},
	{
		name: "Kellogg's\\u00AE Eggo\\u00AE Minis Homestyle Waffles",
		department: "unclassified"
	},
	{
		name: "Chef Tim Love Wild Game Rub",
		department: "unclassified"
	},
	{
		name: "Breyers\\u2122 Real Fruit Wild Berry Topping",
		department: "unclassified"
	},
	{
		name: "mixed berry topping",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Summer Berry Cobbler",
		department: "unclassified"
	},
	{
		name: "Breyers\\u00AE Fat Free Creamy Vanilla Light Ice Cream",
		department: "unclassified"
	},
	{
		name: "Breyers BLASTS!\\u00AE Sara Lee\\u00AE Strawberry Cheesecake",
		department: "unclassified"
	},
	{
		name: "Breyers BLASTS!\\u00AE Birthday Blast!",
		department: "unclassified"
	},
	{
		name: "Kikkoman Seasoned Rice Vinegar",
		department: "unclassified"
	},
	{
		name: "Sierra Mist Diet Soda",
		department: "unclassified"
	},
	{
		name: "Sabra Chocolate Orange Liqueur",
		department: "unclassified"
	},
	{
		name: "low-fat cookies and cream ice cream",
		department: "unclassified"
	},
	{
		name: "Rice Select Arborio Rice",
		department: "unclassified"
	},
	{
		name: "Chateau Ste. Michelle Sauvignon Blanc",
		department: "unclassified"
	},
	{
		name: "Kroger Original Cream Cheese",
		department: "unclassified"
	},
	{
		name: "Philadelphia Whipped Cream Cheese",
		department: "unclassified"
	},
	{
		name: "Del Monte Fruit Cocktail",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Bacon Ranch",
		department: "unclassified"
	},
	{
		name: "Grimmway\\u00AE shredded carrots",
		department: "unclassified"
	},
	{
		name: "sweet pepper salsa",
		department: "unclassified"
	},
	{
		name: "Kroger Monterey Jack Cheese",
		department: "unclassified"
	},
	{
		name: "Natural & Kosher Monterey Jack",
		department: "unclassified"
	},
	{
		name: "Wegmans Peanut Oil",
		department: "unclassified"
	},
	{
		name: "eucalyptus honey",
		department: "unclassified"
	},
	{
		name: "Kroger Mozzarella Cheese",
		department: "unclassified"
	},
	{
		name: "Litehouse Freeze-Dried Oregano",
		department: "unclassified"
	},
	{
		name: "Private Selection Turbinado Sugar",
		department: "unclassified"
	},
	{
		name: "Kikkoman Gluten-Free Soy Sauce",
		department: "unclassified"
	},
	{
		name: "Wegmans Heavy Cream",
		department: "unclassified"
	},
	{
		name: "Kraft Light Sour Cream",
		department: "unclassified"
	},
	{
		name: "Perdue Boneless Skinless Chicken Breasts",
		department: "unclassified"
	},
	{
		name: "Tabasco Worcestershire",
		department: "unclassified"
	},
	{
		name: "Hy-Vee Worcestershire Sauce",
		department: "unclassified"
	},
	{
		name: "Kroger Baking Powder",
		department: "unclassified"
	},
	{
		name: "Market Pantry Unsalted Butter",
		department: "unclassified"
	},
	{
		name: "Super Chill Ginger Ale",
		department: "unclassified"
	},
	{
		name: "Giant Garbanzo Beans",
		department: "unclassified"
	},
	{
		name: "Essential Everyday Garbanzo Beans",
		department: "unclassified"
	},
	{
		name: "Del Monte Tomato Paste",
		department: "unclassified"
	},
	{
		name: "Regina Red Wine Vinegar",
		department: "unclassified"
	},
	{
		name: "Spice Islands Ground Oregano",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Home Style Olives",
		department: "unclassified"
	},
	{
		name: "Simply Organic Crushed Red Pepper",
		department: "unclassified"
	},
	{
		name: "Wan Ja Shan Soy Sauce",
		department: "unclassified"
	},
	{
		name: "House Of Tsang Less Sodium Soy Sauce",
		department: "unclassified"
	},
	{
		name: "Kikkoman Tamari Soy Sauce",
		department: "unclassified"
	},
	{
		name: "McCormick Minced Garlic",
		department: "unclassified"
	},
	{
		name: "SKYY Vanilla Vodka",
		department: "unclassified"
	},
	{
		name: "White House Apple Cider Vinegar",
		department: "unclassified"
	},
	{
		name: "Svedka Vanilla Vodka",
		department: "unclassified"
	},
	{
		name: "McCormick Imitation Almond Extract",
		department: "unclassified"
	},
	{
		name: "McCormick Sicilian Sea Salt",
		department: "unclassified"
	},
	{
		name: "Spice Islands California Onion Powder",
		department: "unclassified"
	},
	{
		name: "Spice Islands Ground Thyme",
		department: "unclassified"
	},
	{
		name: "McCormick Ground Thyme",
		department: "unclassified"
	},
	{
		name: "raspberry tea cake",
		department: "unclassified"
	},
	{
		name: "nut biscuits",
		department: "unclassified"
	},
	{
		name: "Lipton Earl Grey Tea",
		department: "unclassified"
	},
	{
		name: "liquid chicken bouillon",
		department: "unclassified"
	},
	{
		name: "low sodium vegetable stock cubes",
		department: "unclassified"
	},
	{
		name: "Ciao Bella Coconut Sorbet",
		department: "unclassified"
	},
	{
		name: "Manischewitz Potato Starch",
		department: "unclassified"
	},
	{
		name: "Foster Farms boneless skinless chicken thighs",
		department: "unclassified"
	},
	{
		name: "Bobs Red Mill Finely Ground Almond Meal",
		department: "unclassified"
	},
	{
		name: "Simply Organic Nutmeg",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Onion Salt",
		department: "unclassified"
	},
	{
		name: "Frontier Ground Nutmeg",
		department: "unclassified"
	},
	{
		name: "Spectrum Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Appetizer Olives Pitted Kalamata with Orange Zest",
		department: "unclassified"
	},
	{
		name: "Del Monte Tomato Ketchup",
		department: "unclassified"
	},
	{
		name: "Foster Farms chicken drumsticks",
		department: "unclassified"
	},
	{
		name: "Foster Farms thin-sliced chicken breast fillets",
		department: "unclassified"
	},
	{
		name: "spicy nuts",
		department: "unclassified"
	},
	{
		name: "reduced sodium sauerkraut",
		department: "unclassified"
	},
	{
		name: "low sodium garlic dill pickles",
		department: "unclassified"
	},
	{
		name: "notenbroodjes",
		department: "unclassified"
	},
	{
		name: "gl\\u00FChweinextract",
		department: "unclassified"
	},
	{
		name: "slagersrookworsten",
		department: "unclassified"
	},
	{
		name: "scharrelkalkoenschnitzel",
		department: "unclassified"
	},
	{
		name: "biokwark",
		department: "unclassified"
	},
	{
		name: "Passo\\u00E3",
		department: "unclassified"
	},
	{
		name: "paashagel",
		department: "unclassified"
	},
	{
		name: "kipsatesalade",
		department: "unclassified"
	},
	{
		name: "cappuccino bavarian cream",
		department: "unclassified"
	},
	{
		name: "boerenrookworsten",
		department: "unclassified"
	},
	{
		name: "lontong",
		department: "unclassified"
	},
	{
		name: "almond wreath cookies",
		department: "unclassified"
	},
	{
		name: "red gurnard",
		department: "unclassified"
	},
	{
		name: "dessert fondue",
		department: "unclassified"
	},
	{
		name: "aardappelmix",
		department: "unclassified"
	},
	{
		name: "mini chipolata sausages",
		department: "unclassified"
	},
	{
		name: "schiaffoni",
		department: "unclassified"
	},
	{
		name: "Honey Maid Honey Graham Pie Crust",
		department: "unclassified"
	},
	{
		name: "Hungry Jack Lite Syrup",
		department: "unclassified"
	},
	{
		name: "frozen chocolate yogurt",
		department: "unclassified"
	},
	{
		name: "ranch tortilla chips",
		department: "unclassified"
	},
	{
		name: "Lipton Onion Dip Mix",
		department: "unclassified"
	},
	{
		name: "flavored non-dairy creamer",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Sesame Seeds",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Dried Thyme",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Fine Sea Salt",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Curry Powder",
		department: "unclassified"
	},
	{
		name: "frozen Chinese stir fry vegetables",
		department: "unclassified"
	},
	{
		name: "Farmer's Market Organic Canned Pumpkin",
		department: "unclassified"
	},
	{
		name: "Barowsky's Organic Whole Wheat Bread",
		department: "unclassified"
	},
	{
		name: "Newman's Own Organics Alphabet Cookies",
		department: "unclassified"
	},
	{
		name: "Santa Cruz Organic Chocolate Flavored Syrup",
		department: "unclassified"
	},
	{
		name: "Stonyfield Farm Organic Whole Milk Plain Yogurt",
		department: "unclassified"
	},
	{
		name: "Vermont Bread Company Organic Multigrain Bread",
		department: "unclassified"
	},
	{
		name: "Atlantic Organic Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Barowsky's Organic White Bread",
		department: "unclassified"
	},
	{
		name: "Catania-Spagna Atlantic Organic Olive Oil",
		department: "unclassified"
	},
	{
		name: "vanilla frosting mix",
		department: "unclassified"
	},
	{
		name: "reduced sodium beans",
		department: "unclassified"
	},
	{
		name: "pork frankfurters",
		department: "unclassified"
	},
	{
		name: "pork franks",
		department: "unclassified"
	},
	{
		name: "chocolate mint liqueur",
		department: "unclassified"
	},
	{
		name: "reduced sugar grape jam",
		department: "unclassified"
	},
	{
		name: "Godiva Caramel Milk Chocolate Liqueur",
		department: "unclassified"
	},
	{
		name: "semi dry wine",
		department: "unclassified"
	},
	{
		name: "orange holland bell peppers",
		department: "unclassified"
	},
	{
		name: "red holland bell peppers",
		department: "unclassified"
	},
	{
		name: "chicken consomm\\u00E9 stock cubes",
		department: "unclassified"
	},
	{
		name: "Natural & Kosher Parmesan",
		department: "unclassified"
	},
	{
		name: "Natural & Kosher Shredded Cheddar",
		department: "unclassified"
	},
	{
		name: "meat-flavored bouillon powder",
		department: "unclassified"
	},
	{
		name: "Fannie May Mint Meltaways",
		department: "unclassified"
	},
	{
		name: "Gold's Red Horseradish",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Spicy Pickled Garlic",
		department: "unclassified"
	},
	{
		name: "whole grain matzo meal",
		department: "unclassified"
	},
	{
		name: "dry cured pepperoni",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Gourmet Deli Sweet and Hot Pepper Rings",
		department: "unclassified"
	},
	{
		name: "temptin cheese",
		department: "unclassified"
	},
	{
		name: "herbed brie",
		department: "unclassified"
	},
	{
		name: "Mezzetta Napa Valley Bistro Almond Stuffed Olives",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Grilled Artichoke Hearts",
		department: "unclassified"
	},
	{
		name: "Manischewitz Matzos",
		department: "unclassified"
	},
	{
		name: "peeled white shrimp",
		department: "unclassified"
	},
	{
		name: "DeLallo Crushed Tomatoes",
		department: "unclassified"
	},
	{
		name: "Tofurky Kielbasa",
		department: "unclassified"
	},
	{
		name: "Cascadian Farm Broccoli Florets",
		department: "unclassified"
	},
	{
		name: "Smuckers Natural Creamy Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Del Monte Mixed Fruit",
		department: "unclassified"
	},
	{
		name: "Krusteaz Complete Buttermilk Pancake Mix",
		department: "unclassified"
	},
	{
		name: "Walden Farms Ketchup",
		department: "unclassified"
	},
	{
		name: "Glory Foods Kale Greens",
		department: "unclassified"
	},
	{
		name: "Durkee Chili Powder",
		department: "unclassified"
	},
	{
		name: "Trans Ocean Crab Classic",
		department: "unclassified"
	},
	{
		name: "Hood Buttermilk",
		department: "unclassified"
	},
	{
		name: "Wunderbar Bologna",
		department: "unclassified"
	},
	{
		name: "Birds Eye Corn",
		department: "unclassified"
	},
	{
		name: "Cheez Whiz Cheese Sauce",
		department: "unclassified"
	},
	{
		name: "Perdue Ground Chicken",
		department: "unclassified"
	},
	{
		name: "Oreo Brownies",
		department: "unclassified"
	},
	{
		name: "Mazola Cooking Oil",
		department: "unclassified"
	},
	{
		name: "Borden Buttermilk",
		department: "unclassified"
	},
	{
		name: "Mazola Vegetable Oil",
		department: "unclassified"
	},
	{
		name: "Mission Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Little Debbie Brownies",
		department: "unclassified"
	},
	{
		name: "al fresco Chicken Sausage",
		department: "unclassified"
	},
	{
		name: "Birds Eye Vegetables",
		department: "unclassified"
	},
	{
		name: "Fisher Premium Whole Cashews",
		department: "unclassified"
	},
	{
		name: "Pillsbury Italian Bread",
		department: "unclassified"
	},
	{
		name: "Dak Ham",
		department: "unclassified"
	},
	{
		name: "Really Raw Honey",
		department: "unclassified"
	},
	{
		name: "McCormick Fennel Seed",
		department: "unclassified"
	},
	{
		name: "Birds Eye Sweet Peas",
		department: "unclassified"
	},
	{
		name: "Hunny B''s Cereal",
		department: "unclassified"
	},
	{
		name: "Twix Ice Cream",
		department: "unclassified"
	},
	{
		name: "Nature''s Earthly Choice Quinoa",
		department: "unclassified"
	},
	{
		name: "Jones Cream Soda",
		department: "unclassified"
	},
	{
		name: "Organic Valley Eggs",
		department: "unclassified"
	},
	{
		name: "Spectrum Canola Oil",
		department: "unclassified"
	},
	{
		name: "Werther''s Original Hard Candies",
		department: "unclassified"
	},
	{
		name: "Twinings Earl Grey Tea",
		department: "unclassified"
	},
	{
		name: "Botticelli Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Univer Goulash Cream",
		department: "unclassified"
	},
	{
		name: "McCormick Chicken Base",
		department: "unclassified"
	},
	{
		name: "FIJI Water",
		department: "unclassified"
	},
	{
		name: "Spice Islands Basil",
		department: "unclassified"
	},
	{
		name: "Chicken Of The Sea Chopped Clams",
		department: "unclassified"
	},
	{
		name: "Spectrum Avocado Oil",
		department: "unclassified"
	},
	{
		name: "Shock-Top Beer",
		department: "unclassified"
	},
	{
		name: "Lindt Chocolate Bar",
		department: "unclassified"
	},
	{
		name: "Rumford Baking Soda",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Turkey",
		department: "unclassified"
	},
	{
		name: "Sara Lee Butter Pound Cake",
		department: "unclassified"
	},
	{
		name: "Dole Romaine",
		department: "unclassified"
	},
	{
		name: "Schweppes Ginger Ale",
		department: "unclassified"
	},
	{
		name: "Hodgson Mill Yellow Corn Meal",
		department: "unclassified"
	},
	{
		name: "Birds Eye Garden Peas",
		department: "unclassified"
	},
	{
		name: "Pop-Secret Popcorn",
		department: "unclassified"
	},
	{
		name: "Jimmy Dean Pork Sausage, Regular",
		department: "unclassified"
	},
	{
		name: "Sun Luck Chili Garlic Sauce",
		department: "unclassified"
	},
	{
		name: "Stouffer''s Creamed Chipped Beef",
		department: "unclassified"
	},
	{
		name: "McCormick Anise Seed",
		department: "unclassified"
	},
	{
		name: "Hormel Roast Beef",
		department: "unclassified"
	},
	{
		name: "W Garlic Powder",
		department: "unclassified"
	},
	{
		name: "American Beauty Linguine",
		department: "unclassified"
	},
	{
		name: "DeLallo Penne Rigate",
		department: "unclassified"
	},
	{
		name: "Bushs Best Chili Beans",
		department: "unclassified"
	},
	{
		name: "Glory Foods Butter Beans",
		department: "unclassified"
	},
	{
		name: "Orca Bay Flounder",
		department: "unclassified"
	},
	{
		name: "Pop-Secret Microwave Popcorn",
		department: "unclassified"
	},
	{
		name: "Hersheys Chocolate Bars",
		department: "unclassified"
	},
	{
		name: "Sargento Cheese  Sticks",
		department: "unclassified"
	},
	{
		name: "College Inn Culinary Broth",
		department: "unclassified"
	},
	{
		name: "Enjoy Life Cereal",
		department: "unclassified"
	},
	{
		name: "Fever-Tree Ginger Ale",
		department: "unclassified"
	},
	{
		name: "Fiesta Beans",
		department: "unclassified"
	},
	{
		name: "Designer Whey Protein Powder",
		department: "unclassified"
	},
	{
		name: "Florida Crystals Cane Sugar",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Caraway Seed",
		department: "unclassified"
	},
	{
		name: "Hillshire Farm Lit''l Wieners",
		department: "unclassified"
	},
	{
		name: "Bread du Jour Italian Rolls",
		department: "unclassified"
	},
	{
		name: "Chex Oven Toasted Rice, Corn, Wheat Cereal",
		department: "unclassified"
	},
	{
		name: "Tones Chicken Base",
		department: "unclassified"
	},
	{
		name: "French Market Coffee",
		department: "unclassified"
	},
	{
		name: "Rosetto Cheese Ravioli",
		department: "unclassified"
	},
	{
		name: "Pamela''s Products Baking & Pancake Mix",
		department: "unclassified"
	},
	{
		name: "Dei Fratelli All Purpose Italian Sauce",
		department: "unclassified"
	},
	{
		name: "Captain Rodney''s Boucan Glaze",
		department: "unclassified"
	},
	{
		name: "Del Monte Pear Halves",
		department: "unclassified"
	},
	{
		name: "Watkins Curry Powder",
		department: "unclassified"
	},
	{
		name: "SunSpire Chocolate Chips",
		department: "unclassified"
	},
	{
		name: "Milk Duds Candy",
		department: "unclassified"
	},
	{
		name: "Ortega Black Beans",
		department: "unclassified"
	},
	{
		name: "De Cecco Fettuccine",
		department: "unclassified"
	},
	{
		name: "Sun-Maid Currants",
		department: "unclassified"
	},
	{
		name: "Guittard Chocolate Chips",
		department: "unclassified"
	},
	{
		name: "Royal Gelatin",
		department: "unclassified"
	},
	{
		name: "Watkins Cloves",
		department: "unclassified"
	},
	{
		name: "La Victoria Red Chile Sauce",
		department: "unclassified"
	},
	{
		name: "So Delicious Creamer",
		department: "unclassified"
	},
	{
		name: "Maggi Vegetable Bouillon",
		department: "unclassified"
	},
	{
		name: "Wise Popcorn",
		department: "unclassified"
	},
	{
		name: "McCormick Lemon Extract",
		department: "unclassified"
	},
	{
		name: "Log Cabin Syrup",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Saffron",
		department: "unclassified"
	},
	{
		name: "Parkay Butter",
		department: "unclassified"
	},
	{
		name: "Sabra Hummus with Roasted Pine Nuts",
		department: "unclassified"
	},
	{
		name: "Odwalla Lemonade",
		department: "unclassified"
	},
	{
		name: "Red Pack Petite Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "Dole Raisins",
		department: "unclassified"
	},
	{
		name: "Roland Whole Baby Clams",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Cracker Chips",
		department: "unclassified"
	},
	{
		name: "Bumble Bee Salmon",
		department: "unclassified"
	},
	{
		name: "Manischewitz Creamy Horseradish Sauce",
		department: "unclassified"
	},
	{
		name: "Crunchy Nut Cereal",
		department: "unclassified"
	},
	{
		name: "Darigold Half & Half",
		department: "unclassified"
	},
	{
		name: "Giant Cookies",
		department: "unclassified"
	},
	{
		name: "Minis Candy",
		department: "unclassified"
	},
	{
		name: "Gold Peak Lemonade Iced Tea",
		department: "unclassified"
	},
	{
		name: "Boars Head Pepperoni",
		department: "unclassified"
	},
	{
		name: "Jimmy Dean Italian Sausage",
		department: "unclassified"
	},
	{
		name: "McCormick Caraway Seeds",
		department: "unclassified"
	},
	{
		name: "Goya Red Beans",
		department: "unclassified"
	},
	{
		name: "Icelandic Haddock Fillets",
		department: "unclassified"
	},
	{
		name: "Tonnino Tuna Fillets",
		department: "unclassified"
	},
	{
		name: "Del Monte Sweet Peas",
		department: "unclassified"
	},
	{
		name: "Mezzetta Hot Fire-Roasted Green Chili Peppers",
		department: "unclassified"
	},
	{
		name: "Mission Salsa Verde",
		department: "unclassified"
	},
	{
		name: "Morton Sea Salt",
		department: "unclassified"
	},
	{
		name: "Hereford Corned Beef",
		department: "unclassified"
	},
	{
		name: "Goya Corn",
		department: "unclassified"
	},
	{
		name: "Mang Tomas All Purpose Sauce",
		department: "unclassified"
	},
	{
		name: "Perdue Chicken Wings",
		department: "unclassified"
	},
	{
		name: "NESTL\\u00C9\\u00AE BUTTERFINGER\\u00AE Jingles",
		department: "unclassified"
	},
	{
		name: "Sun-Maid Golden Raisins",
		department: "unclassified"
	},
	{
		name: "Giusti Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Sara Lee Dinner Rolls",
		department: "unclassified"
	},
	{
		name: "Cascadian Farm Winter Squash",
		department: "unclassified"
	},
	{
		name: "Tropicana  Apple Juice",
		department: "unclassified"
	},
	{
		name: "Sunsweet Pineapple",
		department: "unclassified"
	},
	{
		name: "Ideal Brown Sugar",
		department: "unclassified"
	},
	{
		name: "Mezzetta Hot Sauce",
		department: "unclassified"
	},
	{
		name: "Quaker Granola",
		department: "unclassified"
	},
	{
		name: "Coconut Dreams Cookies",
		department: "unclassified"
	},
	{
		name: "Nature''s Own Bread",
		department: "unclassified"
	},
	{
		name: "Martini & Rossi Prosecco",
		department: "unclassified"
	},
	{
		name: "Kit Kat Candy",
		department: "unclassified"
	},
	{
		name: "Poore Brothers Potato Chips",
		department: "unclassified"
	},
	{
		name: "Applegate Ham",
		department: "unclassified"
	},
	{
		name: "Knorr Beef Rib Flavor Bouillon",
		department: "unclassified"
	},
	{
		name: "Hebrew National Salami",
		department: "unclassified"
	},
	{
		name: "Goya Corn Meal",
		department: "unclassified"
	},
	{
		name: "New York Style Pita Chips",
		department: "unclassified"
	},
	{
		name: "Perdue Chicken Drumsticks",
		department: "unclassified"
	},
	{
		name: "Arrowhead Mills Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Star Rice Vinegar",
		department: "unclassified"
	},
	{
		name: "Milky Way Chocolate Bars",
		department: "unclassified"
	},
	{
		name: "Santa Barbara Salsa",
		department: "unclassified"
	},
	{
		name: "Hersheys Cookies",
		department: "unclassified"
	},
	{
		name: "Litehouse Dill",
		department: "unclassified"
	},
	{
		name: "Friendship Sour Cream",
		department: "unclassified"
	},
	{
		name: "Spice Islands Turmeric",
		department: "unclassified"
	},
	{
		name: "Mozzarella Fresca Fresh Mozzarella",
		department: "unclassified"
	},
	{
		name: "Quaker Cereal",
		department: "unclassified"
	},
	{
		name: "Coco Lopez Coconut Milk",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Turkey Bacon Bits",
		department: "unclassified"
	},
	{
		name: "Starburst Jelly Beans",
		department: "unclassified"
	},
	{
		name: "Pillsbury Dinner Rolls",
		department: "unclassified"
	},
	{
		name: "Christopher Ranch Garlic",
		department: "unclassified"
	},
	{
		name: "Baby Ruth Candy Bar",
		department: "unclassified"
	},
	{
		name: "Betty Crocker Decorating Cupcake Icing",
		department: "unclassified"
	},
	{
		name: "Tantillo Lime Juice",
		department: "unclassified"
	},
	{
		name: "Tone''s Lemon Pepper",
		department: "unclassified"
	},
	{
		name: "Grace Coconut Water",
		department: "unclassified"
	},
	{
		name: "Rold Gold Pretzels",
		department: "unclassified"
	},
	{
		name: "Simply Grapefruit Grapefruit Juice",
		department: "unclassified"
	},
	{
		name: "Bumble Bee Pink Salmon",
		department: "unclassified"
	},
	{
		name: "Dublin Dr. Pepper\\u00AE",
		department: "unclassified"
	},
	{
		name: "Frontier Fenugreek Seed",
		department: "unclassified"
	},
	{
		name: "Knorr Beef Flavor Bouillon",
		department: "unclassified"
	},
	{
		name: "Ener-G Baking Powder",
		department: "unclassified"
	},
	{
		name: "Cafe Du Monde Coffee and Chicory",
		department: "unclassified"
	},
	{
		name: "Perugina Chocolate",
		department: "unclassified"
	},
	{
		name: "Weight Watchers Chicken Tenders",
		department: "unclassified"
	},
	{
		name: "Arrowhead Mills Baking Mix",
		department: "unclassified"
	},
	{
		name: "Cameo Creme Sandwich Cookies",
		department: "unclassified"
	},
	{
		name: "Volpi Prosciutto",
		department: "unclassified"
	},
	{
		name: "MET-Rx Protein Powder",
		department: "unclassified"
	},
	{
		name: "Morton Canning & Pickling Salt",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Bologna",
		department: "unclassified"
	},
	{
		name: "Hanover Green Beans",
		department: "unclassified"
	},
	{
		name: "Weight Watchers Ice Cream Bars",
		department: "unclassified"
	},
	{
		name: "Nabisco Crackers",
		department: "unclassified"
	},
	{
		name: "Goya All Purpose Seasoning",
		department: "unclassified"
	},
	{
		name: "Jelly Belly Candy Corn",
		department: "unclassified"
	},
	{
		name: "Applegate Hot Dogs",
		department: "unclassified"
	},
	{
		name: "Oreo Icing",
		department: "unclassified"
	},
	{
		name: "Progresso Red Clam Sauce",
		department: "unclassified"
	},
	{
		name: "Barilla Rotini",
		department: "unclassified"
	},
	{
		name: "Red Pack Crushed Tomatoes",
		department: "unclassified"
	},
	{
		name: "Quaker Old Fashioned Grits",
		department: "unclassified"
	},
	{
		name: "Bobs Red Mill Date Sugar",
		department: "unclassified"
	},
	{
		name: "Ball Park Hot Dog Buns",
		department: "unclassified"
	},
	{
		name: "Knauss Dried Beef",
		department: "unclassified"
	},
	{
		name: "Dasani Water",
		department: "unclassified"
	},
	{
		name: "Tasty Bite Madras Lentils",
		department: "unclassified"
	},
	{
		name: "Badia Garlic",
		department: "unclassified"
	},
	{
		name: "Sunkist Soda",
		department: "unclassified"
	},
	{
		name: "Stouffer''s Harvest Apples",
		department: "unclassified"
	},
	{
		name: "Arbor Mist White Zinfandel",
		department: "unclassified"
	},
	{
		name: "Guittard Butterscotch Chips",
		department: "unclassified"
	},
	{
		name: "Bellino Gnocchi",
		department: "unclassified"
	},
	{
		name: "Native Forest Organic Coconut Milk",
		department: "unclassified"
	},
	{
		name: "Simply Potatoes Sliced Home Fries",
		department: "unclassified"
	},
	{
		name: "A Taste of Thai Rice Noodles",
		department: "unclassified"
	},
	{
		name: "Goya Fancy Pimientos",
		department: "unclassified"
	},
	{
		name: "Honey-Comb Cereal",
		department: "unclassified"
	},
	{
		name: "Goya Beef Bouillon",
		department: "unclassified"
	},
	{
		name: "Old Savannah Seafood Seasoning",
		department: "unclassified"
	},
	{
		name: "Meadow Gold Sour Cream",
		department: "unclassified"
	},
	{
		name: "Lee Kum Kee Chili Garlic Sauce",
		department: "unclassified"
	},
	{
		name: "Chicken Of The Sea Minced Clams",
		department: "unclassified"
	},
	{
		name: "Maille Dijon Mustard",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Sandwich Buns",
		department: "unclassified"
	},
	{
		name: "Old Bay Cocktail Sauce",
		department: "unclassified"
	},
	{
		name: "Del Monte Pear Chunks",
		department: "unclassified"
	},
	{
		name: "Mazola Cooking Spray",
		department: "unclassified"
	},
	{
		name: "Solo Pure Almond Paste",
		department: "unclassified"
	},
	{
		name: "Wheat Thins Toasted Chips",
		department: "unclassified"
	},
	{
		name: "Tyson Chicken Thighs",
		department: "unclassified"
	},
	{
		name: "Nestle Crunch Bar",
		department: "unclassified"
	},
	{
		name: "Ore-Ida Crispy Crowns!",
		department: "unclassified"
	},
	{
		name: "Bumble Bee Premium Albacore",
		department: "unclassified"
	},
	{
		name: "Green Giant Corn",
		department: "unclassified"
	},
	{
		name: "Supremo Queso Fresco",
		department: "unclassified"
	},
	{
		name: "Goya Pineapple Juice",
		department: "unclassified"
	},
	{
		name: "Butterball Fresh Ground Turkey",
		department: "unclassified"
	},
	{
		name: "Spice Islands Cinnamon",
		department: "unclassified"
	},
	{
		name: "breath mints",
		department: "unclassified"
	},
	{
		name: "Hebrew National Franks",
		department: "unclassified"
	},
	{
		name: "La Tourangelle Pistachio Oil",
		department: "unclassified"
	},
	{
		name: "Old Bay Crab Cake Classic",
		department: "unclassified"
	},
	{
		name: "Pastariso White Rice Pasta",
		department: "unclassified"
	},
	{
		name: "Quaker Oats Quick-1 Minute Oatmeal",
		department: "unclassified"
	},
	{
		name: "Barilla Campanelle",
		department: "unclassified"
	},
	{
		name: "McCormick Seasoned Salt",
		department: "unclassified"
	},
	{
		name: "Silk Creamer",
		department: "unclassified"
	},
	{
		name: "Premium Crackers",
		department: "unclassified"
	},
	{
		name: "Del Monte Raisins",
		department: "unclassified"
	},
	{
		name: "Fiber One Bread",
		department: "unclassified"
	},
	{
		name: "SkinnyPop Popcorn",
		department: "unclassified"
	},
	{
		name: "Swiss Miss Hot Cocoa Mix",
		department: "unclassified"
	},
	{
		name: "Joan of Arc Kidney Beans",
		department: "unclassified"
	},
	{
		name: "Kikkoman Black Bean Sauce",
		department: "unclassified"
	},
	{
		name: "Parisian French Bread",
		department: "unclassified"
	},
	{
		name: "Aunt Jemima French Toast",
		department: "unclassified"
	},
	{
		name: "Amy''s Chili",
		department: "unclassified"
	},
	{
		name: "Santa Cruz Juice",
		department: "unclassified"
	},
	{
		name: "Tasteeos Cereal",
		department: "unclassified"
	},
	{
		name: "Ambrosia Devon Custard",
		department: "unclassified"
	},
	{
		name: "McCormick Whole Cloves",
		department: "unclassified"
	},
	{
		name: "Del Monte Peach Chunks",
		department: "unclassified"
	},
	{
		name: "Louisiana Wing Sauce",
		department: "unclassified"
	},
	{
		name: "Dutch Farms Eggs",
		department: "unclassified"
	},
	{
		name: "Hodgson Mill Milled Flax Seed",
		department: "unclassified"
	},
	{
		name: "Hungry Jack Pancake Mix",
		department: "unclassified"
	},
	{
		name: "Twix Ice Cream Bars",
		department: "unclassified"
	},
	{
		name: "Crunchmaster Crackers",
		department: "unclassified"
	},
	{
		name: "Orville Redenbacher''s Popcorn",
		department: "unclassified"
	},
	{
		name: "Tostitos Light Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Buitoni Fettuccine",
		department: "unclassified"
	},
	{
		name: "Lee Kum Kee Sriracha Chili Sauce",
		department: "unclassified"
	},
	{
		name: "Cento Artichoke Hearts",
		department: "unclassified"
	},
	{
		name: "Uncle Bens Brown Rice",
		department: "unclassified"
	},
	{
		name: "Tones Beef Base",
		department: "unclassified"
	},
	{
		name: "DaVinci Orzo",
		department: "unclassified"
	},
	{
		name: "Philadelphia Cheesecake",
		department: "unclassified"
	},
	{
		name: "Frenchs French Fried Onions",
		department: "unclassified"
	},
	{
		name: "Del Monte Diced Peaches",
		department: "unclassified"
	},
	{
		name: "Once Again Honey",
		department: "unclassified"
	},
	{
		name: "Bays English Muffins",
		department: "unclassified"
	},
	{
		name: "Griffins Jelly",
		department: "unclassified"
	},
	{
		name: "Tootsie Roll Candy",
		department: "unclassified"
	},
	{
		name: "Bertolli\\u00AE Riserva Asiago Cheese with Artichokes Sauce",
		department: "unclassified"
	},
	{
		name: "Nakano Seasoned Red Wine Vinegar",
		department: "unclassified"
	},
	{
		name: "McCormick Barbecue Seasoning",
		department: "unclassified"
	},
	{
		name: "McCormick Crushed Red Pepper",
		department: "unclassified"
	},
	{
		name: "Organic Valley Egg Whites",
		department: "unclassified"
	},
	{
		name: "Krusteaz Cornbread Mix",
		department: "unclassified"
	},
	{
		name: "Darigold Whipping Cream",
		department: "unclassified"
	},
	{
		name: "Hatch Green Chili Enchilada Sauce",
		department: "unclassified"
	},
	{
		name: "Olivio Spreadable Butter",
		department: "unclassified"
	},
	{
		name: "Kretschmer Wheat Germ",
		department: "unclassified"
	},
	{
		name: "Bertolli\\u00AE Riserva Porcini Mushrooms with White Truffle Oil Sauce",
		department: "unclassified"
	},
	{
		name: "Bertolli\\u00AE Riserva Balsamic Vinegar with Caramelized Onions Sauce",
		department: "unclassified"
	},
	{
		name: "Gerber Carrots",
		department: "unclassified"
	},
	{
		name: "Frontier Black Peppercorns",
		department: "unclassified"
	},
	{
		name: "Bob Evans Ham Steaks",
		department: "unclassified"
	},
	{
		name: "Arizona Iced Tea",
		department: "unclassified"
	},
	{
		name: "Sara Lee Virginia Brand Baked Ham",
		department: "unclassified"
	},
	{
		name: "McCormick Cumin Seed",
		department: "unclassified"
	},
	{
		name: "Dagoba Cacao Powder",
		department: "unclassified"
	},
	{
		name: "West Soy Seitan",
		department: "unclassified"
	},
	{
		name: "MCP Fruit Pectin",
		department: "unclassified"
	},
	{
		name: "Endangered Species Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Fresh Family Size Italian Style Turkey Meatballs",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms Turkey Meatballs",
		department: "unclassified"
	},
	{
		name: "Healthy Choice Ham",
		department: "unclassified"
	},
	{
		name: "Samuel Adams Beer",
		department: "unclassified"
	},
	{
		name: "Heinz Horseradish Sauce",
		department: "unclassified"
	},
	{
		name: "Hormel Canadian Style Bacon",
		department: "unclassified"
	},
	{
		name: "Bobs Red Mill Coconut Flour",
		department: "unclassified"
	},
	{
		name: "Olivia's Croutons",
		department: "unclassified"
	},
	{
		name: "Real Lemon Lemon Juice",
		department: "unclassified"
	},
	{
		name: "Whatchamacallit Candy Bars",
		department: "unclassified"
	},
	{
		name: "Wheatena Cereal",
		department: "unclassified"
	},
	{
		name: "Martha White Yellow Corn Muffin Mix",
		department: "unclassified"
	},
	{
		name: "Mug Cream Soda",
		department: "unclassified"
	},
	{
		name: "Clabber Girl Corn Starch",
		department: "unclassified"
	},
	{
		name: "Life Savers Hard Candy",
		department: "unclassified"
	},
	{
		name: "Santitas Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Tostitos Restaurant Style Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Progresso Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Lawry's Chili Seasoning Mix",
		department: "unclassified"
	},
	{
		name: "Weight Watchers Bread",
		department: "unclassified"
	},
	{
		name: "La Preferida Pinto Beans",
		department: "unclassified"
	},
	{
		name: "Applegate Farms Salami",
		department: "unclassified"
	},
	{
		name: "Old El Paso Black Beans",
		department: "unclassified"
	},
	{
		name: "belVita  Breakfast Biscuits",
		department: "unclassified"
	},
	{
		name: "Bartenura Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Morton Popcorn Salt",
		department: "unclassified"
	},
	{
		name: "Honey Nut Clusters Cereal",
		department: "unclassified"
	},
	{
		name: "Wymans Wild Blueberries",
		department: "unclassified"
	},
	{
		name: "Carrington Farms Flax Seeds",
		department: "unclassified"
	},
	{
		name: "Cape Cod Select Cranberries",
		department: "unclassified"
	},
	{
		name: "C&H Pure Cane Sugar",
		department: "unclassified"
	},
	{
		name: "Star Natural Rice Vinegar",
		department: "unclassified"
	},
	{
		name: "Sunsweet Prune Juice",
		department: "unclassified"
	},
	{
		name: "Zatarains Creole Mustard",
		department: "unclassified"
	},
	{
		name: "Chips Deluxe Cookies",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Hamburger Buns",
		department: "unclassified"
	},
	{
		name: "Boca Meatless Ground Crumbles",
		department: "unclassified"
	},
	{
		name: "De Cecco Fusilli",
		department: "unclassified"
	},
	{
		name: "Goya Butter Beans",
		department: "unclassified"
	},
	{
		name: "Weight Watchers Chicken Breasts",
		department: "unclassified"
	},
	{
		name: "Red Vines Licorice",
		department: "unclassified"
	},
	{
		name: "Tyson Pork Loin",
		department: "unclassified"
	},
	{
		name: "Johnsonville Bratwurst Patties",
		department: "unclassified"
	},
	{
		name: "DeLallo Roman Beans",
		department: "unclassified"
	},
	{
		name: "Spangler Candy Canes",
		department: "unclassified"
	},
	{
		name: "Eden Quinoa",
		department: "unclassified"
	},
	{
		name: "Better Than Bouillon Au Jus Base",
		department: "unclassified"
	},
	{
		name: "Albers Quick Grits",
		department: "unclassified"
	},
	{
		name: "bionaturae Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "Marco Polo Sour Cherry Syrup",
		department: "unclassified"
	},
	{
		name: "Green Giant Peas",
		department: "unclassified"
	},
	{
		name: "Cake Mate Icing",
		department: "unclassified"
	},
	{
		name: "SunSpire Unsweetened Carob Chips",
		department: "unclassified"
	},
	{
		name: "Dietz & Watson Smoked Ham",
		department: "unclassified"
	},
	{
		name: "Toblerone Swiss Chocolate",
		department: "unclassified"
	},
	{
		name: "Spice Islands Cream of Tartar",
		department: "unclassified"
	},
	{
		name: "Glutino Crackers",
		department: "unclassified"
	},
	{
		name: "Konriko Creole Seasoning",
		department: "unclassified"
	},
	{
		name: "Zevia Cola",
		department: "unclassified"
	},
	{
		name: "Mission Corn Tortillas",
		department: "unclassified"
	},
	{
		name: "Ronzoni Penne Rigate",
		department: "unclassified"
	},
	{
		name: "Multi-Grain Krispies Cereal",
		department: "unclassified"
	},
	{
		name: "Bob''s Red Mill Wheat Bran",
		department: "unclassified"
	},
	{
		name: "Guerrero Flour Tortillas",
		department: "unclassified"
	},
	{
		name: "Birds Eye Fresh Frozen Vegetables",
		department: "unclassified"
	},
	{
		name: "Nature Valley Granola Bar",
		department: "unclassified"
	},
	{
		name: "Delverde Bucatini",
		department: "unclassified"
	},
	{
		name: "Country Bobs All Purpose Sauce",
		department: "unclassified"
	},
	{
		name: "Aunt Jemima Corn Meal Mix",
		department: "unclassified"
	},
	{
		name: "McCormick Peppercorn Medley Grinder",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Ground Coriander",
		department: "unclassified"
	},
	{
		name: "Spice Islands Coriander",
		department: "unclassified"
	},
	{
		name: "Once Again Tahini",
		department: "unclassified"
	},
	{
		name: "El Pinto Salsa",
		department: "unclassified"
	},
	{
		name: "Village Harvest Quinoa",
		department: "unclassified"
	},
	{
		name: "Tiparos Fish Sauce",
		department: "unclassified"
	},
	{
		name: "Organic Valley Ricotta Cheese",
		department: "unclassified"
	},
	{
		name: "Lee Kum Kee Black Bean Garlic Sauce",
		department: "unclassified"
	},
	{
		name: "Haagen-Dazs Ice Cream",
		department: "unclassified"
	},
	{
		name: "Tres Agaves Agave Nectar",
		department: "unclassified"
	},
	{
		name: "Wholly Guacamole Guacamole",
		department: "unclassified"
	},
	{
		name: "Polly-O Ricotta Cheese",
		department: "unclassified"
	},
	{
		name: "Domino Pure Cane Sugar",
		department: "unclassified"
	},
	{
		name: "Tone''s Garlic Powder",
		department: "unclassified"
	},
	{
		name: "honey wheat English muffins",
		department: "unclassified"
	},
	{
		name: "Tyson Cornish Game Hens",
		department: "unclassified"
	},
	{
		name: "Nestle Cookie Dough",
		department: "unclassified"
	},
	{
		name: "McCormick Pure Ground Black Pepper",
		department: "unclassified"
	},
	{
		name: "Blue Bunny Premium Ice Cream",
		department: "unclassified"
	},
	{
		name: "Country Hearth Bread",
		department: "unclassified"
	},
	{
		name: "San Giorgio Rotini",
		department: "unclassified"
	},
	{
		name: "Oscar Mayer Cotto Salami",
		department: "unclassified"
	},
	{
		name: "Roland Crab Meat",
		department: "unclassified"
	},
	{
		name: "lye water",
		department: "unclassified"
	},
	{
		name: "Lawrys Garlic Powder",
		department: "unclassified"
	},
	{
		name: "Franken Berry Cereal",
		department: "unclassified"
	},
	{
		name: "Kraft Pepper Jack",
		department: "unclassified"
	},
	{
		name: "DeLallo Balsamic Vinegar of Modena",
		department: "unclassified"
	},
	{
		name: "Sorrento Ricotta Cheese",
		department: "unclassified"
	},
	{
		name: "Ronzoni Elbow Macaroni",
		department: "unclassified"
	},
	{
		name: "Twizzlers Candy",
		department: "unclassified"
	},
	{
		name: "Quaker Barley",
		department: "unclassified"
	},
	{
		name: "Herdez Salsa Casera, Medium",
		department: "unclassified"
	},
	{
		name: "Josephs Pita Bread",
		department: "unclassified"
	},
	{
		name: "DeLallo Fettuccine",
		department: "unclassified"
	},
	{
		name: "Keystone Light Beer",
		department: "unclassified"
	},
	{
		name: "Shake n Bake Coating Mix",
		department: "unclassified"
	},
	{
		name: "Johnsonville Beer Brats",
		department: "unclassified"
	},
	{
		name: "Freshlike Cut Green Beans",
		department: "unclassified"
	},
	{
		name: "Lundberg Brown Rice",
		department: "unclassified"
	},
	{
		name: "Golden Crisp Cereal",
		department: "unclassified"
	},
	{
		name: "Bertolli Vodka Sauce",
		department: "unclassified"
	},
	{
		name: "Badia Cilantro",
		department: "unclassified"
	},
	{
		name: "Le Sueur Tender Baby Whole Carrots",
		department: "unclassified"
	},
	{
		name: "Badia Adobo Seasoning",
		department: "unclassified"
	},
	{
		name: "Bueno Green Chile",
		department: "unclassified"
	},
	{
		name: "Mahatma Brown Rice",
		department: "unclassified"
	},
	{
		name: "Swanson Broth",
		department: "unclassified"
	},
	{
		name: "Francesco Rinaldi Alfredo Sauce",
		department: "unclassified"
	},
	{
		name: "Watkins Basil Leaves",
		department: "unclassified"
	},
	{
		name: "La Victoria Salsa",
		department: "unclassified"
	},
	{
		name: "A Taste of Thai Fish Sauce",
		department: "unclassified"
	},
	{
		name: "Snapple Raspberry Iced Tea",
		department: "unclassified"
	},
	{
		name: "Buitoni Linguine",
		department: "unclassified"
	},
	{
		name: "Bellino Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Tecate Beer",
		department: "unclassified"
	},
	{
		name: "Green Giant Vegetables",
		department: "unclassified"
	},
	{
		name: "Jolly Rancher Hard Candy",
		department: "unclassified"
	},
	{
		name: "Cascadian Farm Garden Peas",
		department: "unclassified"
	},
	{
		name: "Cinnabon Bread",
		department: "unclassified"
	},
	{
		name: "Sweet Tree Coconut Palm Sugar",
		department: "unclassified"
	},
	{
		name: "Goya Arborio Rice",
		department: "unclassified"
	},
	{
		name: "Pamelas Wheat-Free Bread Mix",
		department: "unclassified"
	},
	{
		name: "Alessi Balsamic Vinegar",
		department: "unclassified"
	},
	{
		name: "Sara Lee Country Potato Bakery Bread",
		department: "unclassified"
	},
	{
		name: "DeMet''s  Turtles",
		department: "unclassified"
	},
	{
		name: "Bob Evans Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "Tropical Jam",
		department: "unclassified"
	},
	{
		name: "Carapelli Premium Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "Peanut Butter Filled Cookies",
		department: "unclassified"
	},
	{
		name: "Ronzoni Linguine",
		department: "unclassified"
	},
	{
		name: "DeLallo Mezzi Rigatoni",
		department: "unclassified"
	},
	{
		name: "Riunite Lambrusco",
		department: "unclassified"
	},
	{
		name: "Maple Pecan Crunch Cereal",
		department: "unclassified"
	},
	{
		name: "Gerber Applesauce",
		department: "unclassified"
	},
	{
		name: "Bakers Baking Chocolate Squares",
		department: "unclassified"
	},
	{
		name: "Frontier\\u00AE Chili Powder",
		department: "unclassified"
	},
	{
		name: "Frontier Chili Powder",
		department: "unclassified"
	},
	{
		name: "Bubbies Sauerkraut",
		department: "unclassified"
	},
	{
		name: "Arrowhead Mills Organic Quinoa",
		department: "unclassified"
	},
	{
		name: "Tropicana Lemonade",
		department: "unclassified"
	},
	{
		name: "San Giorgio Rigatoni",
		department: "unclassified"
	},
	{
		name: "Cento Crushed Tomatoes",
		department: "unclassified"
	},
	{
		name: "Darigold Sour Cream",
		department: "unclassified"
	},
	{
		name: "Herdez Jalapenos",
		department: "unclassified"
	},
	{
		name: "Simply Organic All-Purpose Seasoning",
		department: "unclassified"
	},
	{
		name: "Big Red Chewing Gum",
		department: "unclassified"
	},
	{
		name: "McCormick Jamaican Jerk Seasoning",
		department: "unclassified"
	},
	{
		name: "Kohinoor Basmati Rice",
		department: "unclassified"
	},
	{
		name: "Tabasco Salsa",
		department: "unclassified"
	},
	{
		name: "Durkee Ground Black Pepper",
		department: "unclassified"
	},
	{
		name: "Premio Chicken Sausage",
		department: "unclassified"
	},
	{
		name: "Athenos Hummus",
		department: "unclassified"
	},
	{
		name: "Spice Islands Tarragon",
		department: "unclassified"
	},
	{
		name: "Boars Head Ham",
		department: "unclassified"
	},
	{
		name: "Pillsbury Original Biscuits",
		department: "unclassified"
	},
	{
		name: "Pibb Soda",
		department: "unclassified"
	},
	{
		name: "Cheese Nips Crackers",
		department: "unclassified"
	},
	{
		name: "Glutino Bagel Chips",
		department: "unclassified"
	},
	{
		name: "McVities Biscuits",
		department: "unclassified"
	},
	{
		name: "Buddig Turkey",
		department: "unclassified"
	},
	{
		name: "Lee Kum Kee Oyster Flavored Sauce",
		department: "unclassified"
	},
	{
		name: "Wilton Decorating Icing",
		department: "unclassified"
	},
	{
		name: "Minute Maid Cherry Limeade",
		department: "unclassified"
	},
	{
		name: "McCormick Crystallized Ginger",
		department: "unclassified"
	},
	{
		name: "Nabisco Cookies",
		department: "unclassified"
	},
	{
		name: "Planters Spanish Peanuts",
		department: "unclassified"
	},
	{
		name: "Naked Coconut Water",
		department: "unclassified"
	},
	{
		name: "Sugar in the Raw Natural Cane Turbinado Sugar",
		department: "unclassified"
	},
	{
		name: "Hersheys Chocolates",
		department: "unclassified"
	},
	{
		name: "Cento Anchovies",
		department: "unclassified"
	},
	{
		name: "Spice Islands Whole Nutmeg",
		department: "unclassified"
	},
	{
		name: "lotus root slices",
		department: "unclassified"
	},
	{
		name: "DeLallo Jumbo Shells",
		department: "unclassified"
	},
	{
		name: "Aunt Jemima Self-Rising Flour",
		department: "unclassified"
	},
	{
		name: "Lindt Chocolate Truffles",
		department: "unclassified"
	},
	{
		name: "Spice Islands Crystallized Ginger",
		department: "unclassified"
	},
	{
		name: "Simply Organic Garam Masala",
		department: "unclassified"
	},
	{
		name: "Garden of Eatin Corn Chips",
		department: "unclassified"
	},
	{
		name: "Green River Soda",
		department: "unclassified"
	},
	{
		name: "Cascadian Farm Edamame",
		department: "unclassified"
	},
	{
		name: "Hy-Vee Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "Sun-Maid Raisin Bread",
		department: "unclassified"
	},
	{
		name: "Hormel Ham",
		department: "unclassified"
	},
	{
		name: "Jones Dairy Farm Pork Sausage",
		department: "unclassified"
	},
	{
		name: "Pringles Potato Crisps",
		department: "unclassified"
	},
	{
		name: "Pepperidge Farm Cookie Collection",
		department: "unclassified"
	},
	{
		name: "Jiffy Pie Crust Mix",
		department: "unclassified"
	},
	{
		name: "Hersheys Baking Chocolate",
		department: "unclassified"
	},
	{
		name: "Ortega Tostada Shells",
		department: "unclassified"
	},
	{
		name: "One-Pie Pumpkin",
		department: "unclassified"
	},
	{
		name: "Landis Beef Steaks",
		department: "unclassified"
	},
	{
		name: "Hidden Valley Dressing",
		department: "unclassified"
	},
	{
		name: "Crosse & Blackwell Seafood Cocktail Sauce",
		department: "unclassified"
	},
	{
		name: "Ferrara Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Del Monte Pineapple Chunks",
		department: "unclassified"
	},
	{
		name: "Spice Classics Garlic Powder",
		department: "unclassified"
	},
	{
		name: "Bob Evans Bacon",
		department: "unclassified"
	},
	{
		name: "Del Monte Apricot Halves",
		department: "unclassified"
	},
	{
		name: "Kikkoman Curry Sauce",
		department: "unclassified"
	},
	{
		name: "Three Rivers Cornmeal Mix",
		department: "unclassified"
	},
	{
		name: "Goya Green Split Peas",
		department: "unclassified"
	},
	{
		name: "Las Palmas Red Chile Sauce",
		department: "unclassified"
	},
	{
		name: "Goya Whole Green Peas",
		department: "unclassified"
	},
	{
		name: "Tree Top Natural Apple Sauce",
		department: "unclassified"
	},
	{
		name: "Crown Pilot Crackers",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Extra Thin Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Tantillo Lemon Juice",
		department: "unclassified"
	},
	{
		name: "Mighty Leaf Green Tea",
		department: "unclassified"
	},
	{
		name: "Domata Flour",
		department: "unclassified"
	},
	{
		name: "Jacobs Crackers",
		department: "unclassified"
	},
	{
		name: "Breyers Ice  Cream",
		department: "unclassified"
	},
	{
		name: "Frontier Paprika",
		department: "unclassified"
	},
	{
		name: "Sunsweet Prunes",
		department: "unclassified"
	},
	{
		name: "Hellmann's Creamy Dijon Mustard",
		department: "unclassified"
	},
	{
		name: "Garden of Eatin Tortilla Chips",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Cream Style Horseradish",
		department: "unclassified"
	},
	{
		name: "Orgran Custard Powder",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Extra Thin Yellow Corn Tortillas",
		department: "unclassified"
	},
	{
		name: "Spice Islands Sage",
		department: "unclassified"
	},
	{
		name: "Hodgson Mill Unprocessed Wheat Bran",
		department: "unclassified"
	},
	{
		name: "Hodgson Mill Rye Flour",
		department: "unclassified"
	},
	{
		name: "Green & Black''s Cocoa Powder",
		department: "unclassified"
	},
	{
		name: "PEZ Candy",
		department: "unclassified"
	},
	{
		name: "McCormick Homestyle Gravy Mix",
		department: "unclassified"
	},
	{
		name: "Pictsweet Seasoning Blend",
		department: "unclassified"
	},
	{
		name: "Superior Touch Chicken Base",
		department: "unclassified"
	},
	{
		name: "Hillshire Farm Ham",
		department: "unclassified"
	},
	{
		name: "Lipton Iced Tea Mix",
		department: "unclassified"
	},
	{
		name: "Fantastic World Foods Black Beans",
		department: "unclassified"
	},
	{
		name: "Ritter Sport Dark Chocolate",
		department: "unclassified"
	},
	{
		name: "Lotus Foods Jasmine Rice",
		department: "unclassified"
	},
	{
		name: "Del Monte Golden Sweet Corn",
		department: "unclassified"
	},
	{
		name: "Wild Oats Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "Grace BBQ Sauce",
		department: "unclassified"
	},
	{
		name: "Nilla Pie Crust",
		department: "unclassified"
	},
	{
		name: "Napoleon Artichokes",
		department: "unclassified"
	},
	{
		name: "Gerber Apples",
		department: "unclassified"
	},
	{
		name: "House Of Tsang Peanut Sauce",
		department: "unclassified"
	},
	{
		name: "Dole Seven Lettuces",
		department: "unclassified"
	},
	{
		name: "Spice Islands Rosemary",
		department: "unclassified"
	},
	{
		name: "Goya Cooking Wine",
		department: "unclassified"
	},
	{
		name: "Sara Lee Bread",
		department: "unclassified"
	},
	{
		name: "On The Border Salsa",
		department: "unclassified"
	},
	{
		name: "S&B Curry Powder",
		department: "unclassified"
	},
	{
		name: "Ball Pickle Crisp Granules",
		department: "unclassified"
	},
	{
		name: "Krave Cereal",
		department: "unclassified"
	},
	{
		name: "Creamette Egg Noodles",
		department: "unclassified"
	},
	{
		name: "Goya Kidney Beans",
		department: "unclassified"
	},
	{
		name: "Tiger Seasoning",
		department: "unclassified"
	},
	{
		name: "Crunchy Corn Bran Cereal",
		department: "unclassified"
	},
	{
		name: "Air Heads Sour Candy",
		department: "unclassified"
	},
	{
		name: "Mrs Grimes Black Beans",
		department: "unclassified"
	},
	{
		name: "La Tourangelle Avocado Oil",
		department: "unclassified"
	},
	{
		name: "Mission\\u00AE Guacamole Flavored Dip",
		department: "unclassified"
	},
	{
		name: "Frosted Toast Crunch Cereal",
		department: "unclassified"
	},
	{
		name: "Perugina Chocolates",
		department: "unclassified"
	},
	{
		name: "Quisp Cereal",
		department: "unclassified"
	},
	{
		name: "Lipton Iced Tea Brew",
		department: "unclassified"
	},
	{
		name: "Butterfinger Candy Pieces",
		department: "unclassified"
	},
	{
		name: "Reeses Puffs Cereal",
		department: "unclassified"
	},
	{
		name: "Colavita Capellini",
		department: "unclassified"
	},
	{
		name: "Cuties Juice",
		department: "unclassified"
	},
	{
		name: "Nestle Candy Bars",
		department: "unclassified"
	},
	{
		name: "College Inn Broth",
		department: "unclassified"
	},
	{
		name: "Litehouse Red Onion",
		department: "unclassified"
	},
	{
		name: "Dannon Yogurt",
		department: "unclassified"
	},
	{
		name: "Del Monte Asparagus",
		department: "unclassified"
	},
	{
		name: "Tyson Chicken Wings",
		department: "unclassified"
	},
	{
		name: "La Choy Bean Sprouts",
		department: "unclassified"
	},
	{
		name: "Dreyer''s Ice Cream",
		department: "unclassified"
	},
	{
		name: "POM 100% Juice",
		department: "unclassified"
	},
	{
		name: "Cacique Cotija",
		department: "unclassified"
	},
	{
		name: "Famous Amos Cookies",
		department: "unclassified"
	},
	{
		name: "Yuengling Lager",
		department: "unclassified"
	},
	{
		name: "Grace Jerk Seasoning",
		department: "unclassified"
	},
	{
		name: "Ronco Elbow Macaroni",
		department: "unclassified"
	},
	{
		name: "Little Debbie Swiss Cake Rolls",
		department: "unclassified"
	},
	{
		name: "Rosarita Whole Black Beans",
		department: "unclassified"
	},
	{
		name: "Barney Butter Almond Butter",
		department: "unclassified"
	},
	{
		name: "Jolly Rancher Jelly Beans",
		department: "unclassified"
	},
	{
		name: "Droste Cocoa",
		department: "unclassified"
	},
	{
		name: "Smarties candy rolls",
		department: "unclassified"
	},
	{
		name: "Smarties candy roll",
		department: "unclassified"
	},
	{
		name: "Smarties candy",
		department: "unclassified"
	},
	{
		name: "chunky pizza sauce",
		department: "unclassified"
	},
	{
		name: "Toll House Cookies",
		department: "unclassified"
	},
	{
		name: "Sociables Crackers",
		department: "unclassified"
	},
	{
		name: "low fat spicy mayonnaise",
		department: "unclassified"
	},
	{
		name: "Gorton's Fish Sandwich Fillets",
		department: "unclassified"
	},
	{
		name: "Saffron Road Chicken Tenders",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White Turkey",
		department: "unclassified"
	},
	{
		name: "Skinny Pop Popcorn",
		department: "unclassified"
	},
	{
		name: "Hood Whipping Cream",
		department: "unclassified"
	},
	{
		name: "Q Club Soda",
		department: "unclassified"
	},
	{
		name: "yam cake",
		department: "unclassified"
	},
	{
		name: "whole green peperoncini",
		department: "unclassified"
	},
	{
		name: "Tones Cayenne Pepper",
		department: "unclassified"
	},
	{
		name: "caramel filled chocolate chips",
		department: "unclassified"
	},
	{
		name: "spinach beet",
		department: "unclassified"
	},
	{
		name: "shredded bamboo",
		department: "unclassified"
	},
	{
		name: "scarlet runner bean",
		department: "unclassified"
	},
	{
		name: "roasted portobello",
		department: "unclassified"
	},
	{
		name: "Progresso Whole Peeled Tomatoes",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Crushed Rosemary",
		department: "unclassified"
	},
	{
		name: "pasilla negro",
		department: "unclassified"
	},
	{
		name: "palmetto leaves",
		department: "unclassified"
	},
	{
		name: "pablano chile",
		department: "unclassified"
	},
	{
		name: "oxeye daisy leaves",
		department: "unclassified"
	},
	{
		name: "oba leaf",
		department: "unclassified"
	},
	{
		name: "Spice Islands\\u00AE Cilantro",
		department: "unclassified"
	},
	{
		name: "nopal leaves",
		department: "unclassified"
	},
	{
		name: "non fat quark",
		department: "unclassified"
	},
	{
		name: "no sodium green beans",
		department: "unclassified"
	},
	{
		name: "Mrs Grimes Chili Beans",
		department: "unclassified"
	},
	{
		name: "moong meat",
		department: "unclassified"
	},
	{
		name: "mexican green tomato",
		department: "unclassified"
	},
	{
		name: "mashed boiled yuca",
		department: "unclassified"
	},
	{
		name: "lychee nut",
		department: "unclassified"
	},
	{
		name: "long coriander",
		department: "unclassified"
	},
	{
		name: "lemon blossoms",
		department: "unclassified"
	},
	{
		name: "japanese greens",
		department: "unclassified"
	},
	{
		name: "Hatch Diced Tomatoes",
		department: "unclassified"
	},
	{
		name: "Green Giant Asparagus Spears",
		department: "unclassified"
	},
	{
		name: "MaSeCa\\u00AE Instant Corn Masa Flour",
		department: "unclassified"
	},
	{
		name: "grapevine leaves",
		department: "unclassified"
	},
	{
		name: "dried whole calendula flowers",
		department: "unclassified"
	},
	{
		name: "dried dragon eye",
		department: "unclassified"
	},
	{
		name: "Campbells Baked Beans",
		department: "unclassified"
	},
	{
		name: "bunching onion",
		department: "unclassified"
	},
	{
		name: "Birds Eye Green Beans",
		department: "unclassified"
	},
	{
		name: "apple blossoms",
		department: "unclassified"
	},
	{
		name: "american ginseng root",
		department: "unclassified"
	},
	{
		name: "50% reduced sodium black beans",
		department: "unclassified"
	},
	{
		name: "silken low-fat tofu",
		department: "unclassified"
	},
	{
		name: "mori nu low-fat tofu",
		department: "unclassified"
	},
	{
		name: "meatless patties",
		department: "unclassified"
	},
	{
		name: "seafood bouillon",
		department: "unclassified"
	},
	{
		name: "reserved cooking liquid from rigatoni",
		department: "unclassified"
	},
	{
		name: "redcued sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "nonfat vegetable stock",
		department: "unclassified"
	},
	{
		name: "GOYA\\u00AE White Cooking Wine",
		department: "unclassified"
	},
	{
		name: "McCormick Beef Base",
		department: "unclassified"
	},
	{
		name: "knorr veget broth",
		department: "unclassified"
	},
	{
		name: "knorr vegetable broth",
		department: "unclassified"
	},
	{
		name: "Knorr Vegetable Broth",
		department: "unclassified"
	},
	{
		name: "knorr beef broth",
		department: "unclassified"
	},
	{
		name: "Knorr Beef Broth",
		department: "unclassified"
	},
	{
		name: "instant chicken bouillon low sodium",
		department: "unclassified"
	},
	{
		name: "concentrated low sodium chicken broth",
		department: "unclassified"
	},
	{
		name: "Theo Chocolate",
		department: "unclassified"
	},
	{
		name: "Ritz  Chips",
		department: "unclassified"
	},
	{
		name: "Reeses Peanut Butter",
		department: "unclassified"
	},
	{
		name: "reduced sodium club crackers",
		department: "unclassified"
	},
	{
		name: "prepared instant custard",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE HARVESTLAND\\u00AE Ground Chicken",
		department: "unclassified"
	},
	{
		name: "low-fat creamed spinach",
		department: "unclassified"
	},
	{
		name: "Tyson Boneless Buffalo Style Chicken Wyngz",
		department: "unclassified"
	},
	{
		name: "luxury chocolate",
		department: "unclassified"
	},
	{
		name: "low sodium keebler club crackers",
		department: "unclassified"
	},
	{
		name: "low sodium buttery round crackers",
		department: "unclassified"
	},
	{
		name: "low fat pringles",
		department: "unclassified"
	},
	{
		name: "low-fat oreo cookie crumbs",
		department: "unclassified"
	},
	{
		name: "low fat honey mustard vinaigrette",
		department: "unclassified"
	},
	{
		name: "espresso buttercream",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE HARVESTLAND\\u00AE PERFECT PORTIONS\\u00AE Boneless, Skinless Chicken Breast",
		department: "unclassified"
	},
	{
		name: "weakfish",
		department: "unclassified"
	},
	{
		name: "PERDUE\\u00AE Boneless, Skinless Chicken Thighs",
		department: "unclassified"
	},
	{
		name: "stone crab",
		department: "unclassified"
	},
	{
		name: "scamp fillets",
		department: "unclassified"
	},
	{
		name: "paddlefish roe",
		department: "unclassified"
	},
	{
		name: "osetra",
		department: "unclassified"
	},
	{
		name: "opakapaka fillet",
		department: "unclassified"
	},
	{
		name: "mahi fillet",
		department: "unclassified"
	},
	{
		name: "hamachi fillets",
		department: "unclassified"
	},
	{
		name: "grenadier fillets",
		department: "unclassified"
	},
	{
		name: "Bumble Bee Oysters",
		department: "unclassified"
	},
	{
		name: "bronzini fillets",
		department: "unclassified"
	},
	{
		name: "boneless yellow snapper",
		department: "unclassified"
	},
	{
		name: "blowfish tails",
		department: "unclassified"
	},
	{
		name: "black clam",
		department: "unclassified"
	},
	{
		name: "alaskan claws",
		department: "unclassified"
	},
	{
		name: "whole wheat uncooked lasagna noodles",
		department: "unclassified"
	},
	{
		name: "whole wheat seashell pasta",
		department: "unclassified"
	},
	{
		name: "whole wheat cannelloni",
		department: "unclassified"
	},
	{
		name: "whole wheat blend spaghetti",
		department: "unclassified"
	},
	{
		name: "whole wheat blend rotini",
		department: "unclassified"
	},
	{
		name: "vegetable spaghetti",
		department: "unclassified"
	},
	{
		name: "uncooked low-fat ramen noodles",
		department: "unclassified"
	},
	{
		name: "smooth pasta",
		department: "unclassified"
	},
	{
		name: "rigatoni shells",
		department: "unclassified"
	},
	{
		name: "ridged ziti",
		department: "unclassified"
	},
	{
		name: "Soy Vay\\u00AE Citrus \\u2018N Ginger Dressing & Sauce",
		department: "unclassified"
	},
	{
		name: "noodle pillows",
		department: "unclassified"
	},
	{
		name: "mezzani",
		department: "unclassified"
	},
	{
		name: "mezza ziti",
		department: "unclassified"
	},
	{
		name: "low fat noodles",
		department: "unclassified"
	},
	{
		name: "instant low-fat chinese noodles",
		department: "unclassified"
	},
	{
		name: "hong kong noodles",
		department: "unclassified"
	},
	{
		name: "good-quality tortellini",
		department: "unclassified"
	},
	{
		name: "fettuccine noodle mix",
		department: "unclassified"
	},
	{
		name: "dried fideos",
		department: "unclassified"
	},
	{
		name: "barilla piccolini mini",
		department: "unclassified"
	},
	{
		name: "Barilla Orzo",
		department: "unclassified"
	},
	{
		name: "Barilla Farfalle",
		department: "unclassified"
	},
	{
		name: "baby basmati rice",
		department: "unclassified"
	},
	{
		name: "sunflower tropical birdseed mix",
		department: "unclassified"
	},
	{
		name: "blood pudding",
		department: "unclassified"
	},
	{
		name: "veal stew",
		department: "unclassified"
	},
	{
		name: "Tyson Chicken Breast Tenders",
		department: "unclassified"
	},
	{
		name: "smoked low-fat turkey sausage",
		department: "unclassified"
	},
	{
		name: "smithfield ham",
		department: "unclassified"
	},
	{
		name: "roast dripping",
		department: "unclassified"
	},
	{
		name: "rib end pork loin",
		department: "unclassified"
	},
	{
		name: "reduced sodium lean ham steak",
		department: "unclassified"
	},
	{
		name: "pork rib end roast",
		department: "unclassified"
	},
	{
		name: "meat concentrate",
		department: "unclassified"
	},
	{
		name: "low sodium bacon crumbled",
		department: "unclassified"
	},
	{
		name: "low-fat turkey pastrami",
		department: "unclassified"
	},
	{
		name: "low-fat turkey ham",
		department: "unclassified"
	},
	{
		name: "low-fat turkey chili",
		department: "unclassified"
	},
	{
		name: "low-fat smoked ham",
		department: "unclassified"
	},
	{
		name: "low-fat deli roast beef",
		department: "unclassified"
	},
	{
		name: "low-fat bacon slices",
		department: "unclassified"
	},
	{
		name: "lobes of foie gras",
		department: "unclassified"
	},
	{
		name: "lamb fries",
		department: "unclassified"
	},
	{
		name: "hamburger dripping",
		department: "unclassified"
	},
	{
		name: "ham dripping",
		department: "unclassified"
	},
	{
		name: "gator meat",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Turkey Breast for Scallopini & Milanesa",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE Traditional Turkey Bratwurst",
		department: "unclassified"
	},
	{
		name: "cubed venison steak",
		department: "unclassified"
	},
	{
		name: "danish fars meatballs",
		department: "unclassified"
	},
	{
		name: "cubed bison meat",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Mild Italian Turkey Sausage Roll",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farm\\u00AE 93/7 Lean Ground Turkey",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Sweet Italian Turkey Sausage Links",
		department: "unclassified"
	},
	{
		name: "capacola",
		department: "unclassified"
	},
	{
		name: "calf fries",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Hot Italian Turkey Sausage Links",
		department: "unclassified"
	},
	{
		name: "boneless beefsteak",
		department: "unclassified"
	},
	{
		name: "bombay duck",
		department: "unclassified"
	},
	{
		name: "Armour Bacon",
		department: "unclassified"
	},
	{
		name: "alligator sirloin",
		department: "unclassified"
	},
	{
		name: "Dennisons Chili Con Carne",
		department: "unclassified"
	},
	{
		name: "Armour Chili",
		department: "unclassified"
	},
	{
		name: "temple orange",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Boneless Skinless Turkey Breasts",
		department: "unclassified"
	},
	{
		name: "Santa Cruz Lemonade",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Lean Original Turkey Breakfast Sausage",
		department: "unclassified"
	},
	{
		name: "Shady Brook Farms\\u00AE Turkey Breakfast Sausage Links",
		department: "unclassified"
	},
	{
		name: "hydrated lime",
		department: "unclassified"
	},
	{
		name: "rapsberry sherbet",
		department: "unclassified"
	},
	{
		name: "low-fat vania ice cream",
		department: "unclassified"
	},
	{
		name: "low-fat orange sherbet",
		department: "unclassified"
	},
	{
		name: "low-fat chocolate fudge ice cream",
		department: "unclassified"
	},
	{
		name: "Klondike Ice Cream Bars",
		department: "unclassified"
	},
	{
		name: "Hidden Valley\\u00AE Original Ranch\\u00AE Light Cucumber Dressing",
		department: "unclassified"
	},
	{
		name: "cappuccino mocha fudge low-fat ice cream",
		department: "unclassified"
	},
	{
		name: "Breyers Caramel Praline Crunch Ice Cream",
		department: "unclassified"
	},
	{
		name: "whole wheat dumpling wrappers",
		department: "unclassified"
	},
	{
		name: "wild cherry pepsi",
		department: "unclassified"
	},
	{
		name: "shochu juice",
		department: "unclassified"
	},
	{
		name: "serrano juice",
		department: "unclassified"
	},
	{
		name: "seitan juice",
		department: "unclassified"
	},
	{
		name: "pickel juice",
		department: "unclassified"
	},
	{
		name: "non-dairy amaretto flavored creamer",
		department: "unclassified"
	},
	{
		name: "mussel juice",
		department: "unclassified"
	},
	{
		name: "Millstone Coffee",
		department: "unclassified"
	},
	{
		name: "margarita cocktail",
		department: "unclassified"
	},
	{
		name: "mai tai cocktail mix",
		department: "unclassified"
	},
	{
		name: "low-fat ginger ale",
		department: "unclassified"
	},
	{
		name: "Lipton Green Tea Sweetened Iced Tea Mix",
		department: "unclassified"
	},
	{
		name: "key lime soda",
		department: "unclassified"
	},
	{
		name: "jasmine herbal tea bag",
		department: "unclassified"
	},
	{
		name: "jasmine blend tea bags",
		department: "unclassified"
	},
	{
		name: "japanese gomashio",
		department: "unclassified"
	},
	{
		name: "japanese genmaicha green tea",
		department: "unclassified"
	},
	{
		name: "healthy request tomato juice",
		department: "unclassified"
	},
	{
		name: "gunpowder green tea leaves",
		department: "unclassified"
	},
	{
		name: "five alive juice",
		department: "unclassified"
	},
	{
		name: "fireweed juice",
		department: "unclassified"
	},
	{
		name: "extra spicy bloody mary mix",
		department: "unclassified"
	},
	{
		name: "Crystal Light Iced Tea Mix",
		department: "unclassified"
	},
	{
		name: "citrus tea leaves",
		department: "unclassified"
	},
	{
		name: "chilled tonic",
		department: "unclassified"
	},
	{
		name: "beefamato juice",
		department: "unclassified"
	},
	{
		name: "Arizona Diet Green Tea",
		department: "unclassified"
	},
	{
		name: "white low-fat cheese",
		department: "unclassified"
	},
	{
		name: "unsweetend low-fat coconut milk",
		department: "unclassified"
	},
	{
		name: "unripened cheese",
		department: "unclassified"
	},
	{
		name: "thick low-fat plain yogurt",
		department: "unclassified"
	},
	{
		name: "sweetend low-fat plain yogurt",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE Fresh Italian Style Turkey Meatballs",
		department: "unclassified"
	},
	{
		name: "singles low-fat cheese",
		department: "unclassified"
	},
	{
		name: "shredded kraft low-fat cheese",
		department: "unclassified"
	},
	{
		name: "365 Everyday Value\\u00AE Organic Teriyaki Sauce",
		department: "unclassified"
	},
	{
		name: "red raspberry low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "plan low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "plain white low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "plain organic low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "plain low-fat sour cream",
		department: "unclassified"
	},
	{
		name: "pasteurized process cheese food",
		department: "unclassified"
	},
	{
		name: "organic 2% low-fat milk",
		department: "unclassified"
	},
	{
		name: "nonfat sharp cheddar cheese",
		department: "unclassified"
	},
	{
		name: "nonfat cherry yogurt",
		department: "unclassified"
	},
	{
		name: "nonfat pizza cheese",
		department: "unclassified"
	},
	{
		name: "nonfat lemon flavored yogurt",
		department: "unclassified"
	},
	{
		name: "nonfat key lime pie yogurt",
		department: "unclassified"
	},
	{
		name: "nonfat block cream cheese",
		department: "unclassified"
	},
	{
		name: "nonfat berry yogurt",
		department: "unclassified"
	},
	{
		name: "non-flavored low-fat milk",
		department: "unclassified"
	},
	{
		name: "low-fat tropical yogurt",
		department: "unclassified"
	},
	{
		name: "Mocha Mix Non-Dairy Coffee Creamer",
		department: "unclassified"
	},
	{
		name: "low sodium butter",
		department: "unclassified"
	},
	{
		name: "low-fat thickened cream",
		department: "unclassified"
	},
	{
		name: "low-fat provolone cheese slices",
		department: "unclassified"
	},
	{
		name: "low-fat liquid coffee creamer",
		department: "unclassified"
	},
	{
		name: "low-fat fromage blanc",
		department: "unclassified"
	},
	{
		name: "Honeysuckle White\\u00AE 93/7 Lean Ground Turkey",
		department: "unclassified"
	},
	{
		name: "low-fat egg substitute",
		department: "unclassified"
	},
	{
		name: "low-fat dairy-free margarine",
		department: "unclassified"
	},
	{
		name: "low-fat caramel yogurt",
		department: "unclassified"
	},
	{
		name: "fruit-flavored low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "friendship low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "flavoured low-fat plain yogurt",
		department: "unclassified"
	},
	{
		name: "cubed low-fat cheddar cheese",
		department: "unclassified"
	},
	{
		name: "creamy evaporated low-fat milk",
		department: "unclassified"
	},
	{
		name: "carnation low-fat evaporated milk",
		department: "unclassified"
	},
	{
		name: "artificially sweetened low-fat yogurt",
		department: "unclassified"
	},
	{
		name: "4% low-fat cheese",
		department: "unclassified"
	},
	{
		name: "1% low-fat evaporated milk",
		department: "unclassified"
	},
	{
		name: "yuzu syrup",
		department: "unclassified"
	},
	{
		name: "Wish-Bone Light Thousand Island Dressing",
		department: "unclassified"
	},
	{
		name: "watermelon pickle",
		department: "unclassified"
	},
	{
		name: "verjuice vinaigrette",
		department: "unclassified"
	},
	{
		name: "Spike Vegit Magic!",
		department: "unclassified"
	},
	{
		name: "365 Everyday Value Organic 100% Italian Extra Virgin Olive Oil",
		department: "unclassified"
	},
	{
		name: "toasted caraway",
		department: "unclassified"
	},
	{
		name: "taco fresco seasoning",
		department: "unclassified"
	},
	{
		name: "spiedie marinade",
		department: "unclassified"
	},
	{
		name: "spicy citrus marinade",
		department: "unclassified"
	},
	{
		name: "sodium free herb salad dressing",
		department: "unclassified"
	},
	{
		name: "Smuckers Peanut Butter",
		department: "unclassified"
	},
	{
		name: "Smart Balance Light Mayonnaise",
		department: "unclassified"
	},
	{
		name: "Simply Organic Lemon Pepper",
		department: "unclassified"
	},
	{
		name: "Ragu Robusto! Chopped Tomato, Olive Oil & Garlic Pasta Sauce",
		department: "unclassified"
	},
	{
		name: "real simple vinaigrette",
		department: "unclassified"
	},
	{
		name: "prepared low-fat salsa",
		department: "unclassified"
	},
	{
		name: "prepared low-fat pizza sauce",
		department: "unclassified"
	},
	{
		name: "pickled mango",
		department: "unclassified"
	},
	{
		name: "Whole Foods Market Gluten-Free Bakehouse Angel Food Cake",
		department: "unclassified"
	},
	{
		name: "pazzo marinade",
		department: "unclassified"
	},
	{
		name: "Olivado Avocado Oil",
		department: "unclassified"
	},
	{
		name: "Odense Pure Almond Paste",
		department: "unclassified"
	},
	{
		name: "nonstick spray with starch",
		department: "unclassified"
	},
	{
		name: "Newmans Own Balsamic Vinaigrette",
		department: "unclassified"
	},
	{
		name: "neutral vinaigrette",
		department: "unclassified"
	},
	{
		name: "mugi miso",
		department: "unclassified"
	},
	{
		name: "mostarda de frutti mista",
		department: "unclassified"
	},
	{
		name: "McCormick Cracked Black Pepper",
		department: "unclassified"
	},
	{
		name: "Mezzetta\\u00AE Minced Garlic",
		department: "unclassified"
	},
	{
		name: "low sodium mayonnaise",
		department: "unclassified"
	},
	{
		name: "low-fat vanilla custard sauce",
		department: "unclassified"
	},
	{
		name: "low-fat tomato vinaigrette",
		department: "unclassified"
	},
	{
		name: "low-fat nayonnaise",
		department: "unclassified"
	},
	{
		name: "ice cream mix",
		department: "unclassified"
	},
	{
		name: "low fat ranch dressing mix",
		department: "unclassified"
	},
	{
		name: "low fat chunky mushroom pasta sauce",
		department: "unclassified"
	},
	{
		name: "lorann gourmet flavoring",
		department: "unclassified"
	},
	{
		name: "liquid rennin",
		department: "unclassified"
	},
	{
		name: "liquid fruitsource",
		department: "unclassified"
	},
	{
		name: "liquid citric acid",
		department: "unclassified"
	},
	{
		name: "liquid amino acid supplement",
		department: "unclassified"
	},
	{
		name: "kim chee liquid",
		department: "unclassified"
	},
	{
		name: "kikoman low sodium soy sauce",
		department: "unclassified"
	},
	{
		name: "Jim Beam Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "Hunts Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "hickory flavored dry rub seasonings",
		department: "unclassified"
	},
	{
		name: "hickory blend jerky seasoning",
		department: "unclassified"
	},
	{
		name: "guava syrup",
		department: "unclassified"
	},
	{
		name: "garlicky barbecue marinade",
		department: "unclassified"
	},
	{
		name: "french sea salt",
		department: "unclassified"
	},
	{
		name: "Flavour Creations Coffee Flavoring",
		department: "unclassified"
	},
	{
		name: "fine-quality fermented soy sauce",
		department: "unclassified"
	},
	{
		name: "dry marinade mix",
		department: "unclassified"
	},
	{
		name: "dry jerk rub",
		department: "unclassified"
	},
	{
		name: "dry gravy maker mix",
		department: "unclassified"
	},
	{
		name: "Dat''l Do-It Hot Sauce",
		department: "unclassified"
	},
	{
		name: "chocolate raspberry sauce",
		department: "unclassified"
	},
	{
		name: "clementine vinaigrette",
		department: "unclassified"
	},
	{
		name: "chocolate-hazelnut paste",
		department: "unclassified"
	},
	{
		name: "chinese vinaigrette",
		department: "unclassified"
	},
	{
		name: "carribean jerk marinade",
		department: "unclassified"
	},
	{
		name: "Carolina Treet Barbecue Sauce",
		department: "unclassified"
	},
	{
		name: "caribbean rub",
		department: "unclassified"
	},
	{
		name: "british mixed spice",
		department: "unclassified"
	},
	{
		name: "Blaze Balsamic Glaze",
		department: "unclassified"
	},
	{
		name: "ragu cheesy sauce",
		department: "unclassified"
	},
	{
		name: "Bertolli Balsamic Vinegar of Modena",
		department: "unclassified"
	},
	{
		name: "turmeric oil",
		department: "unclassified"
	},
	{
		name: "andouille seasoning",
		department: "unclassified"
	},
	{
		name: "Adams Peanut Butter",
		department: "unclassified"
	},
	{
		name: "abbamele",
		department: "unclassified"
	},
	{
		name: "nestles nestum cereal",
		department: "unclassified"
	},
	{
		name: "multigrain cluster cereal",
		department: "unclassified"
	},
	{
		name: "low-fat maple syrup",
		department: "unclassified"
	},
	{
		name: "flax and fiber crunch cereal",
		department: "unclassified"
	},
	{
		name: "Fiber One Pancake Mix",
		department: "unclassified"
	},
	{
		name: "dry infant cereal",
		department: "unclassified"
	},
	{
		name: "crushed flake cereal",
		department: "unclassified"
	},
	{
		name: "crisp small cereal",
		department: "unclassified"
	},
	{
		name: "barbados molasses",
		department: "unclassified"
	},
	{
		name: "Aunt Jemima Syrup",
		department: "unclassified"
	},
	{
		name: "whole wheat submarine loaves",
		department: "unclassified"
	},
	{
		name: "whole wheat pie crusts",
		department: "unclassified"
	},
	{
		name: "whole wheat matzot",
		department: "unclassified"
	},
	{
		name: "whole wheat biscuit dough",
		department: "unclassified"
	},
	{
		name: "warm buns",
		department: "unclassified"
	},
	{
		name: "almond shortbread cookies",
		department: "unclassified"
	},
	{
		name: "sourdough rounds",
		department: "unclassified"
	},
	{
		name: "sourdough crepes",
		department: "unclassified"
	},
	{
		name: "sourdough cornbread",
		department: "unclassified"
	},
	{
		name: "sourdough biscuits",
		department: "unclassified"
	},
	{
		name: "smoky chile cornbread",
		department: "unclassified"
	},
	{
		name: "reduced-calorie sweetener",
		department: "unclassified"
	},
	{
		name: "Pillsbury  Bread Flour",
		department: "unclassified"
	},
	{
		name: "phyllo pastry leaves",
		department: "unclassified"
	},
	{
		name: "Salers Apertif",
		department: "unclassified"
	},
	{
		name: "party-style pumpernickel",
		department: "unclassified"
	},
	{
		name: "party pumpernickel",
		department: "unclassified"
	},
	{
		name: "nonfat whole wheat tortillas",
		department: "unclassified"
	},
	{
		name: "muffalata bun",
		department: "unclassified"
	},
	{
		name: "moo shu shells",
		department: "unclassified"
	},
	{
		name: "microwave cornbread",
		department: "unclassified"
	},
	{
		name: "low-fat sub roll",
		department: "unclassified"
	},
	{
		name: "low-fat garlic-flavored croutons",
		department: "unclassified"
	},
	{
		name: "low-fat english muffin",
		department: "unclassified"
	},
	{
		name: "low-fat apple pie filling",
		department: "unclassified"
	},
	{
		name: "leftover crust",
		department: "unclassified"
	},
	{
		name: "italian sandwich hogie rolls",
		department: "unclassified"
	},
	{
		name: "instant gluten flour",
		department: "unclassified"
	},
	{
		name: "half baked buns",
		department: "unclassified"
	},
	{
		name: "grams cracker crumb",
		department: "unclassified"
	},
	{
		name: "gluten-free chocolate cake",
		department: "unclassified"
	},
	{
		name: "deli onion bun",
		department: "unclassified"
	},
	{
		name: "crusty long rolls",
		department: "unclassified"
	},
	{
		name: "cornbread slices",
		department: "unclassified"
	},
	{
		name: "Buena Vida Whole Wheat Tortillas",
		department: "unclassified"
	},
	{
		name: "artisan levain",
		department: "unclassified"
	},
	{
		name: "Combier",
		department: "unclassified"
	},
	{
		name: "chicken vegetable baby food",
		department: "unclassified"
	},
	{
		name: "baby food cereal",
		department: "unclassified"
	},
	{
		name: "Miller  Beer",
		department: "unclassified"
	},
	{
		name: "Piper-Heidsieck Champagne",
		department: "unclassified"
	},
	{
		name: "rosella juice",
		department: "unclassified"
	},
	{
		name: "Pacifico Beer",
		department: "unclassified"
	},
	{
		name: "oktoberfest lager",
		department: "unclassified"
	},
	{
		name: "Michael Collins Irish Whiskey",
		department: "unclassified"
	},
	{
		name: "Little Black Dress Chardonnay",
		department: "unclassified"
	},
	{
		name: "godiva dark chocolate flavored liqueur",
		department: "unclassified"
	},
	{
		name: "Coronita Beer",
		department: "unclassified"
	}
];

var ingredients1 = [
	"Asparagus",
	"Broccoli",
	"Carrots",
	"Cauliflower",
	"Celery",
	"Corn",
	"Cucumbers",
	"Lettuce / Greens",
	"Mushrooms",
	"Onions",
	"Peppers",
	"Potatoes",
	"Spinach",
	"Squash",
	"Zucchini",
	"Tomatoes*",
	"BBQ sauce",
	"Gravy",
	"Honey",
	"Hot sauce",
	"Jam / Jelly / Preserves",
	"Ketchup / Mustard",
	"Pasta sauce",
	"Relish",
	"Salad dressin",
	"Salsa",
	"Soy sauce",
	"Steak sauce",
	"Syrup",
	"Worcestershire sauce",
	"Butter / Margarine",
	"Cottage cheese",
	"Half & half",
	"Milk",
	"Sour cream",
	"Whipped cream",
	"Yogurt",
	"Bleu cheese",
	"Cheddar",
	"Cream cheese",
	"Feta",
	"Goat cheese",
	"Mozzarella",
	"Parmesan",
	"Provolone",
	"Ricotta",
	"Sandwich slices",
	"Swiss",
	"Bacon / Sausage",
	"Beef",
	"Chicken",
	"Ground beef / Turkey",
	"Ham / Pork",
	"Hot dogs",
	"Lunchmeat",
	"Turkey",
	"Catfish",
	"Crab",
	"Lobster",
	"Mussels",
	"Oysters",
	"Salmon",
	"Shrimp",
	"Tilapia",
	"Tuna",
	"Beer",
	"Club soda / Tonic",
	"Champagne",
	"Gin",
	"Juice",
	"Mixers",
	"Red wine / White wine",
	"Rum",
	"Saké",
	"Soda pop",
	"Sports drink",
	"Whiskey",
	"Vodka",
	"Bagels / Croissants",
	"Buns / Rolls",
	"Cake / Cookies",
	"Donuts / Pastries",
	"Fresh bread",
	"Pie! Pie! Pie!",
	"Pita bread",
	"Sliced bread",
	"Baking powder / Soda",
	"Bread crumbs",
	"Cake / Brownie mix",
	"Cake icing / Decorations",
	"Chocolate chips / Cocoa",
	"Flour",
	"Shortening",
	"Sugar",
	"Sugar substitute",
	"Yeast",
	"Candy / Gum",
	"Cookies",
	"Crackers",
	"Dried fruit",
	"Granola bars / Mix",
	"Nuts / Seeds",
	"Oatmeal",
	"Popcorn",
	"Potato / Corn chips",
	"Pretzels",
	"Burger night",
	"Chili night",
	"Pizza night",
	"Spaghetti night",
	"Taco night",
	"Take-out deli food",
	"Baby food",
	"Diapers",
	"Formula",
	"Lotion",
	"Baby wash",
	"Wipes",
	"Cat food / Treats",
	"Cat litter",
	"Dog food / Treats",
	"Flea treatment",
	"Pet shampoo",
	"Apples",
	"Avocados",
	"Bananas",
	"Berries",
	"Cherries",
	"Grapefruit",
	"Grapes",
	"Kiwis",
	"Lemons / Limes",
	"Melon",
	"Nectarines",
	"Oranges",
	"Peaches",
	"Pears",
	"Plums",
	"Bagels",
	"Chip dip",
	"Eggs / Fake eggs",
	"English muffins",
	"Fruit juice",
	"Hummus",
	"Ready-bake breads",
	"Tofu",
	"Tortillas",
	"Breakfasts",
	"Burritos",
	"Fish sticks",
	"Fries / Tater tots",
	"Ice cream / Sorbet",
	"Juice concentrate",
	"Pizza",
	"Pizza Rolls",
	"Popsicles",
	"TV dinners",
	"Vegetables",
	"Bouillon cubes",
	"Cereal",
	"Coffee / Filters",
	"Instant potatoes",
	"Lemon / Lime juice",
	"Mac & cheese",
	"Olive oil",
	"Packaged meals",
	"Pancake / Waffle mix",
	"Pasta",
	"Peanut butter",
	"Pickles",
	"Rice",
	"Tea",
	"Vegetable oil",
	"Vinegar",
	"Applesauce",
	"Baked beans",
	"Broth",
	"Fruit",
	"Olives",
	"Tinned meats",
	"Tuna / Chicken",
	"Soup / Chili",
	"Tomatoes",
	"Veggies",
	"Basil",
	"Black pepper",
	"Cilantro",
	"Cinnamon",
	"Garlic",
	"Ginger",
	"Mint",
	"Oregano",
	"Paprika",
	"Parsley",
	"Red pepper",
	"Salt",
	"Vanilla extract",
	"Antiperspirant / Deodorant",
	"Bath soap / Hand soap",
	"Condoms / Other b.c.",
	"Cosmetics",
	"Cotton swabs / Balls",
	"Facial cleanser",
	"Facial tissue",
	"Feminine products",
	"Floss",
	"Hair gel / Spray",
	"Lip balm",
	"Moisturizing lotion",
	"Mouthwash",
	"Razors / Shaving cream",
	"Shampoo / Conditioner",
	"Sunblock",
	"Toilet paper",
	"Toothpaste",
	"Vitamins / Supplements",
	"Allergy",
	"Antibiotic",
	"Antidiarrheal",
	"Aspirin",
	"Antacid",
	"Band-aids / Medical",
	"Cold / Flu / Sinus",
	"Pain reliever",
	"Prescription pick-up",
	"Aluminum foil",
	"Napkins",
	"Non-stick spray",
	"Paper towels",
	"Plastic wrap",
	"Sandwich / Freezer bags",
	"Wax paper",
	"Air freshener",
	"Bathroom cleaner",
	"Bleach / Detergent",
	"Dish / Dishwasher soap",
	"Garbage bags",
	"Glass cleaner",
	"Mop head / Vacuum bags",
	"Sponges / Scrubbers",
	"CDRs / DVDRs",
	"Notepad / Envelopes",
	"Glue / Tape",
	"Printer paper",
	"Pens / Pencils",
	"Postage stamps",
	"Arsenic",
	"Asbestos",
	"Cigarettes",
	"Radionuclides",
	"Vinyl chloride",
	"Automotive",
	"Batteries",
	"Charcoal / Propane",
	"Flowers / Greeting card",
	"Insect repellent",
	"Light bulbs",
	"Newspaper / Magazine",
	"Random impulse buy"
];

var ingredients3$1 = [
	{
		name: "medium russet potatoes, sliced into sticks",
		departmentId: "department_id"
	},
	{
		name: "tablespoons vegetable oil, divided",
		departmentId: "department_id"
	},
	{
		name: "salt & freshly ground black pepper, to taste",
		departmentId: "department_id"
	},
	{
		name: "scallions",
		departmentId: "department_id"
	},
	{
		name: "ounces cheese curds or 6 ounces fresh mozzarella cheese, diced",
		departmentId: "department_id"
	},
	{
		name: "1 box Pillsbury™ refrigerated pie crusts, softened as directed on box",
		departmentId: "department_id"
	},
	{
		name: "6 cups thinly sliced, peeled apples (6 medium)",
		departmentId: "department_id"
	},
	{
		name: "3/4 cup sugar",
		departmentId: "department_id"
	},
	{
		name: "2 tablespoons all-purpose flour",
		departmentId: "department_id"
	},
	{
		name: "3/4 teaspoon ground cinnamon",
		departmentId: "department_id"
	},
	{
		name: "1/4 teaspoon salt",
		departmentId: "department_id"
	},
	{
		name: "1/8 teaspoon ground nutmeg",
		departmentId: "department_id"
	},
	{
		name: "1 tablespoon lemon juice",
		departmentId: "department_id"
	},
	{
		name: "apple",
		departmentId: "department_id"
	},
	{
		name: "banana",
		departmentId: "department_id"
	},
	{
		name: "orange",
		departmentId: "department_id"
	},
	{
		name: "grapes",
		departmentId: "department_id"
	},
	{
		name: "beef roast",
		departmentId: "department_id"
	},
	{
		name: "brown gravy mix",
		departmentId: "department_id"
	},
	{
		name: "dried Italian salad dressing mix",
		departmentId: "department_id"
	},
	{
		name: "dry ranch dressing mix",
		departmentId: "department_id"
	},
	{
		name: "water",
		departmentId: "department_id"
	},
	{
		name: "black pepper",
		departmentId: "department_id"
	},
	{
		name: "extra-virgin olive oil",
		departmentId: "department_id"
	},
	{
		name: "kosher salt",
		departmentId: "department_id"
	},
	{
		name: "kosher salt and freshly ground black",
		departmentId: "department_id"
	}
];

var mealCalendar = [
	{
		id: "week1",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Grilled Honey & Ginger Marinated Flank Steaks with Mashed Potatoes, Tossed Salad and Rolls",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Chicken Parmesan Balls & Spaghetti with Caesar Salad and Breadsticks",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Slow Cooker Cola Chicken with Leftover Mashed Potato Puff, Green Beans and Peaches",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Grilled Pork Chocps with Baked Potato, Steamed Broccoli and Strawberries",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Skillet Goulash with Cornbread, Corn and Apple Slices",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Tilapia with Corn on the Cob, Couscous and Pears",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Teriyaki Chicken with Fried Rice, Peas and Pineapple",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week2",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Skillet Cube Steaks with Mashed Potatoes, Caesar Salad and Pears (make extra mashed potatoes)",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Sweet-n-Sour Chicken with Fried Rice, Broccolie & Rice Dip and Pineapple",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Shepard's Pie with Deviled Eggs, Rolls and Peaches",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Chicken Quesadillas with Salsa & Chips and Refried Beans",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Roast with Potatoes, Carrots and Rolls",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Shrimp Scampi with Steamed Rice, Tossed Salad and Rice",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Barbecue Meatballs with French Fries, Green Beans and Apple Slices",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week3",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Grilled Steak with Twice Baked Potatoes, Steamed Asparagus and Mandarin Oranges",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Beef Taco Bake, Corn on the Cob and Apple Slices",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Spaghetti & Meatballs with Tossed Salad and Breadsticks",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Slow Cooker Country Style Barbecue Ribs with French Fries, Pototoe Salad, Carrot Sticks, Grapes and Apple Slices",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Meatloaf with Mashed Potatoes, Green Beans and Peaches",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Salmon with Steamed Rice, Steamed Broccoli and Pears",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Fried Chicken with Leftover Mashed Potatoes, Carrot Sticks, Broccoli, & Ranch Dip and Rolls",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week4",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Chicken Parmesan with Spaghetti, Tossed Salad and Garlic Bread",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Sloppy Joes with French Fries, Peas and Fruit Salad",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Shake-N-Bake Pork Chops with Twice Baked Potoates, Green Beans and Broccoli Salad",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Tacos with Refried Beans and Mexican Tomato and Corn Salad",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "BBQ Chicken Kebabs with Potato Salad, Corn on the Cob and Strawberries",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Shrimp Scampi with Roasted Potatoes and Steamed Broccoli",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Turkey Cutlets with Mashed Potatoes, Microwave Fresh Asparagus and Rolls",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week5",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Ham with Cheesy Potato Casserole, Green Bean Casserole, Deviled Eggs and Rolls",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Egg Salad Sandwiches with Peas and Apple Slices",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Potato & Ham Casserole with Tossed Salad and Mandarin Oranges",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Ground Turkey or Beef Stroganoff with Green Beans, Peaches and Rolls",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "BBQ Biscuit Cups with French Fries and Poppyseed Spinach & Strawberry Salad",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Sweet & Sour Meatballs with Steamed Rice, Steamed Broccoli and Pineapple",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Baked Ziti with Caesar Salad and Garlic Bread",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week6",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Chicken Marsala with Mashed Potatoes and Steamed Asparagus",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Cheeseburgers with Potato Salad, Carrot Sticks and Grapes",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Grilled Pork Chops with Buttered Noodles, Corn on Cob and Applesauce",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Asian Tilapia & Veggie Foil Packets with Steamed Rice and Pears",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Lasagna with Caesar Salad and Garlic Bread",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Meatloaf with Sweet Potatoes, Green Beans and Mandarin Oranges",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Pot Roast with Roasted Potatoes, Roasted Carrots and Rolls",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week7",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Lasagna with Tossed Salad and Garlic Bread",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Pulled Pork with French Fries, Veggies & ranch dip and Fruit Salad",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Slow Cocker Barbecue Chicken with Roasted Sweet Potatoes, Corn on Cob and Cucumber Salad",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Shrimp Fettucine Alfredo with Steamed Broccoli and Breadsticks",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Chicken Noodle Soup with Grilled Cheese Sandwiches and Grapes & Apple Slices",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Pizza with Tossed Salad and Mandarin Oranges",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Pork Tenderloin with Mashed Potatoes, Green Beans and Rolls",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week8",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Smoked Brisket with Potato Salad, Baked Beans and Texas Toast",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Enchiladas with Refried Beans and Chips & Salsa",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Chopped Beef Sandwiches with Chips, Broccoli Salad Carrot Sticks and Strawberries",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Chicken & Pepper Stir Fry with Steamed Rice and Pineapple",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Slow Cocker Cola Chicken with French Fries, Green Beans and Pears",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Spaghetti & Meatballs with Caesar Salad and Breadsticks",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Grilled Sausage with Corn on Cob, Coleslaw and Strawberries",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week9",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Grilled Pork Chops with Twice Baked Potatoes, Green Beans Strawberries",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Orange Chicken Meatballs with Steamed Rice, Steamed Broccoli and Mandarin Oranges",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Manicotti with Tossed Salad and Garlic Bread",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Asian Salmon in Foil with Roasted Vegetables and Strawberries",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Chicken Cordon Bleu with Roasted Potatoes, Peas and Pears",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Chicken Fried Rice with Egg Rolls",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Smoked Pork Roast with Mashed Potatoes, Corn on Cob and Peaches",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week10",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Grilled Honey Mustard Chicken with Mustard Chicken, Green Beans and Rolls",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Best Chicken Ever with Steamed Rice, Steamed Broccoli and Pears",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Beef Taco Casserole with Corn and Peaches",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Classic Baked Ziti with Tossed Salad and Garlic Bread",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Sloppy Joes with French Fries, Carrot Sticks and Fruit Salad",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Grilled Brats with Corn on Cob, Baked Beans and  Strawberries & Blueberries",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Broccoli Beef with Steamed Rice",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week11",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Smoked Chicken with Potato Salad, Cucumber Salad and Strawberries",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Spaghetti & Meatballs with Caesar Salad and Garlic Bread",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Smoked Sausage & Potatoes with Tossed Salad",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Chicken Quesadillas with Refried Beans and Chips & Salsa",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Mongolian Beef with Broccoli and Steamed Rice",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Cheeseburgers with French Fries, Carrot Sticks and Strawberries",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Grilled Steaks with Baked Potatoes and Grilled Vegetable Kabobs",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week12",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Grilled Honey Mustard Chicken with Green Bean & Potato Salad and Fresh Fruit",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Grilled Hamburgers with Baked Beans, Chips and Fresh Fruit",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Teriyaki Chicken Meatballs with Hibachi Noodles, Steamed Broccoli and Pineapple",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Beef Taco Bake with Corn and Peaches",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Open Faced Turkey Sandwich with Mashed Potatoes and Green Beans",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Chicken Parmigiana with Spaghetti, Tossed Salad and Garlic Bread",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Beef Kabobs w/ mushrooms, red onion & bell peppers with Baked Potato and Fresh Fruit",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week13",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Meatloaf with  Mashed Potatoes, Corn on Cob and Fresh Fruit",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Baked Chicken with Tossed Salad and Fresh Fruit",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Grilled Sausage with Potato Salad, Baked Beans and Fresh Fruit",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "BLTs/ PBJ for kids with Carrots & bell peppers and Fresh Fruit",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Slow Cooker Baked Ziti with Caesar Salad and Garlic Bread",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Barbecue Meatballs with Pasta Salad",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Poached Salmon with Steamed Rice, Cucumber Salad and Fresh Fruit",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week14",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Cheeseburgers with French Fries, Peas and Applesauce",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Hamburger Cream Gravy with Mashed Potatoes and Tossed Salad",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Slow Cooker Tasty Drumsticks with Coleslaw and Fruit Salad",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Italian Sausage Pasta with Caesar Salad",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Tacos with Refried Beans and Chips & Salsa",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Campfire Hot Dogs with Baked Beans, Fresh Fruit and S’mores",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Grilled Pork Chops with Potato Salad, Corn of Cob and Watermelon",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week15",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Pork Loin with Potato Casserole and Grilled Vegetable Kabob",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Spaghetti & Meat Sauce with Tossed Salad and Breadsticks",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Baked Turkey Breast with Mashed Potatoes and Green Beans",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Chicken Strips with French Fries, Carrot Sticks and Fresh Fruit",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Slow Cooker Roast, Potatoes, & Carrots with Rolls",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Sloppy Joes with Cucumber Salad and Fresh Fruit",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Smoked Whole Chicken with Broccoli Salad, Baked Beans and Fresh Fruit",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week16",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Slow Cooker Roast with Potatoes, Carrots and Rolls",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Teriyaki Chicken with Steamed Rice and Broccoli",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Shrimp Scampi with Spaghetti and Caesar Salad",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Beef Taco Bake with Corn, Tossed Salad and Peaches",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Grilled Pork Chops with Cheesy Potato Casserole, Green Beans and Pears",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Baked Salmon with Mashed Potatoes and Peas",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Barbecue Meatballs with Potato Salad, Corn on Cob and Fresh Fruit",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week17",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Sweet and Sour Chicken with Rice and Pineapple",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Spaghetti Pie with Salad and Breadsticks",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Shake N Bake Pork Chops with Twice Baked Potatoes, Corn on Cob and Applesauce",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Goulash with Salad, Peaches and Biscuit",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Slow Cooker Pop Chicken with Mashed Potatoes and Green Beans",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Pizza Quesadillas with Carrot Sticks and Grapes",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Baked Teriyaki Chicken Meatballs with Rice, Peas and Pears",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week18",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Barbecue Chicken with Corn on Cob, Coleslaw and Peaches",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Spaghetti & Meat Sauce with Salad and Breadsticks",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Teriyaki Salmon with Mashed Potatoes, Steamed Asparagus/Green and Beans Pears",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Sloppy Joes with French Fries, Veggies & Ranch and Apple Slices",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Baked Orange Chicken Meatballs with Steamed Rice and Broccoli",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Tacos with Refried Beans and Chips & Salsa",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Grilled Brats/Hot Dogs with Potato Salad, Macoroni & Cheese and Strawberries",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week19",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Smoked Sausage & Potatoes with Green Beans and Tossed Sala",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Chicken Noodle Soup with Grilled Cheese and Apple Slices",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Slow Cooker Barbecue Pork Ribs with Potato Salad and Baked Beans",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Chicken Quesadillas with Corn and Chips & Salsa",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Cheeseburgers with French Fries, Peas and Applesauce",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Meatloaf with Mashed Potatoes, Green Beans and Peaches",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Pizza with Tossed Salad and Apple Slices",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	},
	{
		id: "week20",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Enchiladas with Refried Beans and Chips & Salsa",
					day: "Sunday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Chicken Fried Rice and Egg Rolls",
					day: "Monday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Slow Cooker Beef Stew with Tossed Salad and Rolls",
					day: "Tuesday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Broccoli Beef with Steamed Rice and Pineapple",
					day: "Wednesday",
					time: "7:00-8:30"
				}
			],
			[
				{
					tag: "lunch",
					text: "Pizza Quesadillas with Carrot Sticks and Apple Slices",
					day: "Thursday",
					time: "12:30-14:00"
				}
			],
			[
				{
					tag: "dinner",
					text: "Shepherd’s Pie with Tossed Salad and Clementines",
					day: "Friday",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Grilled Steaks with Mashed Potato Puffs and Green Beans",
					day: "Saturday",
					time: "7:00-8:30"
				}
			]
		]
	}
];

var firstVeganGLMC = [
	{
		id: "First-Vegan-Grocery-List",
		recipes: [
			[
				{
					tag: "breakfast",
					text: "Oatmeal with Dried Fruit, Flax Meal, and Cinnamon",
					day: "Day First",
					time: "7:00-8:30"
				},
				{
					tag: "lunch",
					text: "Pasta la Caprese",
					day: "Day First",
					time: "12:30-14:00"
				},
				{
					tag: "lunch",
					text: "Green Smoothie",
					day: "Day First",
					time: "12:30-14:00"
				},
				{
					tag: "dinner",
					text: "Split Pea Soup",
					day: "Day First",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "One piece of Whole Wheat Garlic Bread",
					day: "Day First",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Mixed Greens Salad with Balsamic Vinaigrette",
					day: "Day First",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Snacks",
					day: "Day First",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Apple with Almond Butter (or other nut butter)",
					day: "Day First",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "High-fiber, Low-Sugar Cereal with Almond Milk and Banana",
					day: "Day Two",
					time: "7:00-8:30"
				},
				{
					tag: "lunch",
					text: "Vegan Chili",
					day: "Day Two",
					time: "12:30-14:00"
				},
				{
					tag: "lunch",
					text: "Cornbread",
					day: "Day Two",
					time: "12:30-14:00"
				},
				{
					tag: "lunch",
					text: "Caesar Salad",
					day: "Day Two",
					time: "12:30-14:00"
				},
				{
					tag: "dinner",
					text: "Butternut Squash Ravioli",
					day: "Day Two",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Snacks",
					day: "Day Two",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Crackers with Nut-Butter",
					day: "Day Two",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Oatmeal with Dried Fruit, Flax Meal, and Cinnamon",
					day: "Day Three",
					time: "7:00-8:30"
				},
				{
					tag: "lunch",
					text: "Roasted Vegetable Sandwich on Whole Grain Bread with White Bean Spread",
					day: "Day Three",
					time: "12:30-14:00"
				},
				{
					tag: "dinner",
					text: "Tropical Quinoa Stir Fry",
					day: "Day Three",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Snacks",
					day: "Day Three",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Fruit Smoothie",
					day: "Day Three",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "High-fiber Cereal with Nondairy Milk and Banana",
					day: "Day Four",
					time: "7:00-8:30"
				},
				{
					tag: "lunch",
					text: "Three Bean Salad with Whole Grain Pasta and Veggies",
					day: "Day Four",
					time: "12:30-14:00"
				},
				{
					tag: "dinner",
					text: "Whole Wheat Lasagna with Kale and Tofu Ricotta",
					day: "Day Four",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Steamed Veggies",
					day: "Day Four",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Snacks",
					day: "Day Four",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Veggies with Hummus",
					day: "Day Four",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Scrambled Tofu and Whole Grain Toast",
					day: "Day Five",
					time: "7:00-8:30"
				},
				{
					tag: "breakfast",
					text: "Strawberries",
					day: "Day Five",
					time: "7:00-8:30"
				},
				{
					tag: "lunch",
					text: "Bulgur Tabbouli",
					day: "Day Five",
					time: "12:30-14:00"
				},
				{
					tag: "lunch",
					text: "Hummus with Vegetable Sticks",
					day: "Day Five",
					time: "12:30-14:00"
				},
				{
					tag: "dinner",
					text: "Amaranth Polenta",
					day: "Day Five",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "White Beans Cooked with Garlic and Onions",
					day: "Day Five",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Snacks",
					day: "Day Five",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "A Few Slices of Melon",
					day: "Day Five",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Whole Wheat Toast with Nut Butter, Maple Syrup, and Raisins",
					day: "Day Six",
					time: "7:00-8:30"
				},
				{
					tag: "lunch",
					text: "Asian Noodle Salad",
					day: "Day Six",
					time: "12:30-14:00"
				},
				{
					tag: "lunch",
					text: "Spinach Salad with Mangos and Almonds",
					day: "Day Six",
					time: "12:30-14:00"
				},
				{
					tag: "breakfast",
					text: "Lentils with Onions and Brown Rice",
					day: "Day Six",
					time: "18:00-19:30"
				},
				{
					tag: "breakfast",
					text: "Sauteed Broccoli",
					day: "Day Six",
					time: "18:00-19:30"
				},
				{
					tag: "breakfast",
					text: "Snacks",
					day: "Day Six",
					time: "18:00-19:30"
				},
				{
					tag: "breakfast",
					text: "Fruit Smoothie",
					day: "Day Six",
					time: "18:00-19:30"
				}
			],
			[
				{
					tag: "breakfast",
					text: "Vegan Pancakes with banana slices",
					day: "Day Seven",
					time: "7:00-8:30"
				},
				{
					tag: "lunch",
					text: "Butternut Squash, Apple and Onion Soup",
					day: "Day Seven",
					time: "12:30-14:00"
				},
				{
					tag: "lunch",
					text: "Guacamole with Vegetable Sticks",
					day: "Day Seven",
					time: "12:30-14:00"
				},
				{
					tag: "lunch",
					text: "Slice of Whole Grain Bread",
					day: "Day Seven",
					time: "12:30-14:00"
				},
				{
					tag: "dinner",
					text: "Black Bean Burgers",
					day: "Day Seven",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Potato Salad with Lemon Dill Dressing",
					day: "Day Seven",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Veggie Juice",
					day: "Day Seven",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Snacks",
					day: "Day Seven",
					time: "18:00-19:30"
				},
				{
					tag: "dinner",
					text: "Apple or Pear",
					day: "Day Seven",
					time: "18:00-19:30"
				}
			]
		]
	}
];

var files = {
  departments: departments$1,
  grocery: grocery,
  ingredients: ingredients,
  ingredients1: ingredients1,
  ingredients3: ingredients3$1,
  mealCalendar: mealCalendar,
  firstVeganGLMC: firstVeganGLMC
};

// const staticData = require('@groceristar/sd-wrapper')


const departments$2 = files.departments;
const groceries = files.grocery;
const ingredients$1 = files.ingredients;
const users$1 = files.users;

console.log(departments$2);
console.log(groceries);

var files$1 = {
  departments: departments$2,
  groceries,
  ingredients: ingredients$1,
  users: users$1
};

const {
  __get: __get$2,
  __find: __find$1,
  // __l,
  __generateId: __generateId$1
} = utils;

const {
  departments: departments$3,
  groceries: groceries$1,
  ingredients: ingredients$2,
  users: users$2
} = files$1;

// @TODO can we update our methods - but we'll need to go step by step,
// don't worry, will update @hirdbluebird
// because these methods used in our react projects.
// so I propose do it very carefully
const getIngredients = function () {
  return ingredients$2
};

// __l(getGrocery());

const getUsers = function () {
  return users$2

};

const getDepartments = () => {
  return departments$3
};

const getGroceryById = function (id) {
  return [ lodash.find(groceries$1, ['id', id]) ]
};

const filterGroceriesByName = (groceries, name) => lodash.filter(groceries, (item) => {
  return item.name === name
});

const getGroceryByName = function (name) {
  return filterGroceriesByName(groceries$1, name)
};

// @TODO we spot the same problem twice. It's a regression error.
// we need to address that. And i think it's a good candidate for test coverage + adding raven.
// @TODO second issue - i don't like that. looks not fancy.
const getGroceryByNameWithDepAndIng = function (name) {
  // __l(grocerieszzz);

  // @TODO maybe we shall move this function away. OR have another method, not getGrocery, that will repack things as we need it here....
  // we did few times a similar manipulations
  // for example, first step will be to use this: getGroceryByName
  // let newGrocerieszzz = filterGroceriesByName(groceries, name)

  // let zizua = getGroceryByName(name);
  // let result = []
  // zizua['departments'].forEach(  function (department) {
  //
  //
  //     result.push({
  //       'department': department,
  //       'ingredients': getAllIngredientsByOneDepartment(department)
  //     })
  //   })
  //   return result
  // return NEW_grocerieszzz;
  // console.log(NEW_grocerieszzz);

  // -----

  let result = [];
  // maybe instead of getting all groceries from getGrocery. because...
  // it's just a bad turn around @TODO change that.
  // NEW_grocerieszzz[0]['departments'].forEach(
  //   function (department) {
  //     // @TODO add let ingredients = const getAllIngredientsByOneDepartment(department)
  //     result.push({
  //       'department': department,
  //       'ingredients': getAllIngredientsByOneDepartment(department)
  //     })
  //   })
  return result
};

// Where we're using this methods?
// -----------------------------------

const getGroceriesWithDepIngKey = () => {
  // let result = []
  // let result = _.map(groceries, function (grocery) {
  //   // @TODO change variable name
  //   // grocery.id = __generateId()
  //   // grocery.departments = groceryDepIng;
  //   return getGroceryByNameWithDepAndIngKey(grocery.name)
  // })
  let departmentId = __generateId$1();
  // return result


  return {
    'name': 'name',
    'groceryId': 'groceryId',
    'messages': {},
    'ingridients': {},
    'departments': {
      'id': departmentId,
      'name': '',
      'type': '',
      'ingredients': {}
    }
  }


};

const getGroceryByNameWithDepAndIngKey = name => {
  let groceryId = __generateId$1();

  let grocery = filterGroceriesByName(groceries$1, name);

  // @TODO this is not a clean turn around for this method
  // grocery[0]['departments'].forEach(
  //   function (department) {
  //     let departmentId = __generateId()
  //     let departmentType = ''
  //     // @TODO i don't like that we're searching for things by names,
  //     // we need to replace it later with separated methods that will assign items between files via id
  //     let dep = _.find(departments, (o) => {
  //       return o.name === department
  //     })
  //     if (dep != undefined) {
  //       departmentType = dep.type
  //     }
  //     let ingredients = getAllIngredientsByOneDepartmentKey(department, groceryId)
  //     result.push({
  //       'id': departmentId,
  //       'name': department,
  //       'type': departmentType,
  //       'ingredients': ingredients
  //     })
  //   })


  // return {
  //   'name': name,
  //   'groceryId': groceryId,
  //   'messages': {},
  //   'departments': []
  // }



};

const getAllIngredientsByOneDepartmentKey = function (department, groceryId) {
  let ingredients = getIngredients();

  // @TODO it looks like a separated method for me
  // var ingredientsList =
  //   _.filter(ingredients, function (item) {
  //     return item.department === department
  //   })

  let ingredientsList = filterIngrListByDep(ingredients, department);

  return lodash.map(ingredientsList, item => {
    let ingredientId = __generateId$1();

    return [
      ingredientId,
      item.name,
      `/del/ing/${ingredientId}/${groceryId}`
    ]
  })
};

// -----------------------------------
const filterIngrListByDep = (ingredients, department) => lodash.filter(ingredients, item => {
  return item.department === department
});
// strange turnaround. @TODO can we
const getGroceryListsWithCountDepartments = function () {
  // return _.map(groceries, item => {
  //   const object = {
  //     id: item.id,
  //     name: item.name,
  //     departmentsCount: item.departments.length
  //   }
  //   delete object.departments // @TODO ????
  //   return object
  // })

};

// i assume this cannot work, because we don't have groceries variable... @TODO
const getAllDepartments = function () {
  const departments = [];

  // @TODO this is an example what should be updated. loooooks so bad and unreadable
  lodash.forEach(lodash.range(0, groceries$1.length), value =>
    departments.push(...lodash.map(groceries$1[value]['departments']))
  );
  return departments
};

const getAllIngredientsByOneDepartment = function (department) {
  let ingredients = getIngredients();

  let ingredientsList = filterIngrListByDep(ingredients, department);

  return lodash.map(ingredientsList, 'name')
};

const getCountIngOfDepartment = function () {
  // let result = []
  let departments = getDepartments();

  let result = lodash.map(departments, function (department) {
    let ingredientsByOneDepartment = getAllIngredientsByOneDepartment(department.name);
    return {
      ...department,
      countIngredients: ingredientsByOneDepartment.length
    }
  });

  return result
};

const getKeyArrayDepAndIng = function () {
  let keys = [];

  // @TODO does this functions doing a similar thing or not?
  let departments = getAllDepartmentsWithId();
  let ingredients = getAllIngredientsWithId();

  // _.map(ingredients, ingredient => {
  //   _.forEach(departments,function(department){
  //     if(ingredient.department === department.name) {
  //       keys.push({
  //       [department.key] : ingredient.key,
  //       })
  //     }
  //   })
  //   return;
  // })
  lodash.forEach(departments, function (department) {
    lodash.forEach(ingredients, function (ingredient) {
      // @TODO can be redo later with lodash methods
      if (ingredient.department === department.name) {
        keys.push({
          [department.key]: ingredient.key
        });
      }
    });
  });

  return keys
};
// --------------------------------------------

const getAllDepartmentList = function () {
  return lodash.map(departments$3, item => ({
    key: __generateId$1(),
    departmentName: item
  }))
};

const getAllIngredientsWithId = function () {
  // let result = []
  let ingredients = getIngredients();

  // let result = _.map(ingredients, function (ingredient) {
  //   return {
  //     key: __generateId(),
  //     ...ingredient
  //   }
  // })
  let result = getResult(ingredients);

  return result
};

// @TODO we need to figure out why we have this method and getAllDepartmentList
// i assume we using them in different react projects.
const getAllDepartmentsWithId = function () {
  // let result = []
  // let result = _.map(departments, function (department) {
  //   return {
  //     key: __generateId(),
  //     ...department
  //   }
  // })
  let result = getResult(departments$3);

  return result
};
// ------------------------------

const getResult = (property) => lodash.map(property, (p) => ({
  key: __generateId$1(),
  ...p
}));

const getAllIngredientsList = function (department) {
  const ingredients = this.getAllIngredientsByOneDepartment(department);

  return ingredients.map(item => ({
    key: __generateId$1(),
    name: item,
    isChecked: false,
    departmentID: __generateId$1(),
    order: 0
  }))
};

const getAllGrocery = function () {
  return lodash.map(groceries$1, item => ({
    key: __generateId$1(),
    ...item
  }))
};

const getAllGroceryDepartment = function (departmentArray) {
  const departmentArrayObject = departmentArray.map(item => ({
    key: __generateId$1(),
    departmentName: item,
    isChecked: false
  }));

  return departmentArrayObject
};

const createNewGroceryList = function (newDepartment) {
  const nameExists = lodash.find(
    groceries$1,
    item => item.name === newDepartment.name
  );
};

// TODO OMG, this method looks so sad...
const getGroceryListsByDepartment = department => {
  let groceryList = [];
  if (department) {
    // what we're doing? camelCase? explain @TODO
    // const capitalisedDepartment = department[0].toUpperCase() + department.toLowerCase().substr(1)
    // groceries.map(grocery => {
    //   if (grocery.departments.includes(department.toLowerCase()) ||
    //     grocery.departments.includes(department.toUpperCase()) ||
    //     grocery.departments.includes(capitalisedDepartment)
    //   ) {
    //     groceryList.push({
    //       name: grocery.name,
    //       id: grocery.id
    //     })
    //   }
    // })
    return groceryList
  }
  return groceryList
};

// @TODO should work now.
function newGroceryList (newDepartment) {
  // const groceriesFile = fs.createWriteStream('./data/Grocery/grocery.json')
  // const newGrocery = [ ...groceries, newDepartment ]

  // groceriesFile.write(JSON.stringify(newGrocery, null, 2))
  // groceries = newGrocery
}

var groceristar = {
  getIngredients,
  // getGrocery,
  getUsers,
  getDepartments,
  getGroceryById,
  getGroceryByName,
  getGroceryByNameWithDepAndIng,
  getGroceryListsWithCountDepartments,
  getAllDepartments,
  getAllIngredientsByOneDepartment,
  getAllDepartmentList,
  getAllIngredientsList,
  getAllGrocery,
  getAllGroceryDepartment,
  createNewGroceryList,
  getGroceryListsByDepartment,
  newGroceryList,
  getResult,
  getAllIngredientsByOneDepartmentKey,
  getGroceryByNameWithDepAndIngKey,
  getGroceriesWithDepIngKey,
  getAllIngredientsWithId,
  getKeyArrayDepAndIng,
  getAllDepartmentsWithId,
  getCountIngOfDepartment,
  __find: __find$1
};

// const staticData = require('@groceristar/sd-wrapper')
const ingredients3$2 = files.ingredients3;
const menus$1 = files.menu;
const recipes$1 = files.recipes;
const nutritions1$1 = files.nutritions;
const nutritions2$1 = files.nutritions2;
const departments$4 = files.departments;
const users$3 = files.users;
// require('@groceristar/sd-wrapper/dist/data/Recipe4/recipe.json')

var files$2 = {
  ingredients3: ingredients3$2,
  menus: menus$1,
  recipes: recipes$1,
  nutritions1: nutritions1$1,
  nutritions2: nutritions2$1,
  departments: departments$4,
  users: users$3
};

const {
  __find: __find$2,
  // __get,
  __generateDate: __generateDate$1,
  __generateId: __generateId$2
} = utils;

const files$3 = {
  ingredients3,
  menus,
  recipes,
  nutritions1,
  nutritions2,
  departments,
  users
} = files$2;

// @TODO update this method, use stuff from utils.js
const getFiveRandomId = function () {
  return [
    __generateId$2(),
    __generateId$2(),
    __generateId$2(),
    __generateId$2(),
    __generateId$2()
  ]
};

const getRecipes = function () {
  let recipes = __get(files$3.recipes);
  // let recipes = []
  let randomFiveIds = getFiveRandomId();

  let result =
      lodash.map(recipes, (recipe, index) => {
        // console.log(ingredientsId);
        return {
          ...recipe,
          created_at: __generateDate$1(),
          updated_at: __generateDate$1(),
          id: __generateId$2(),
          ingredients: randomFiveIds,
          diets: randomFiveIds,
          courses: randomFiveIds,
          cuisines: randomFiveIds,
          holidays: randomFiveIds,
          nutritions: randomFiveIds
        }
      });
  return result
};

// @TODO delete file menu.json from main set of files, but create a note at some place,
// that Menu file is no longer needed because we replace it with fake data. you can use method ABC in order to generate that data.
const getMenuGenerator = (numberOfWeeks) => {
  let result;
  result = lodash.times(numberOfWeeks, (index) => ({
    id: __generateId$2(),
    title: `Weekly menu ${index}`,
    date: __generateDate$1(),
    description: `description for Weekly menu ${index}`,
    notes: `This is a chef notes for wm ${index}`
  }));
  return result
};

// @TODO replace it later. may need it at utils.js
const getNRecipes = (n) => {
  return lodash.slice(recipes, n)
};

/**
 * Fetches one recipe by title
 * @param  {string} title title of the recipe
 * @return {object}       recipe object
 */
const getRecipeByTitle = (title) => {
  let recipes = __get(files$3.recipes);
  return lodash.filter(recipes, recipe => recipe.title === title)[0]
  // return []
};

/**
 * Fetches random recipe
 * @return {object} recipe object
 */
const getRandomRecipe = (n = 1) => {
  let recipes = getNRecipes(20);
  return lodash.sampleSize(recipes, n)
};

/**
 * Fetches first five recipes
 * @return {array} recipe objects
 */
// @TODO can be updated in order to change the number of recipes that we can return
const getFirstFiveRecipes = () => {
  let recipes = getNRecipes(5);

  let result = lodash.map(recipes, item => ({
    key: __generateId$2(),
    recipe: item
  }));

  return result
};

const getFiveRandomIngredients = () => {
  let result = lodash.map(getRandomRecipe(5), (recipe) => ({
    'id': __generateId$2(),
    'ingredient': recipe['ingredients']
  }));
  return result
};

var chickenKyiv = {
  getNRecipes,
  getRecipeByTitle,
  getRandomRecipe,
  getFirstFiveRecipes,
  getFiveRandomIngredients,
  getMenuGenerator,
  getRecipes,
  // files,
  __find: __find$2
};

var src = {
  groceristar: groceristar,
  chickenKyiv: chickenKyiv
};
var src_1 = src.groceristar;
var src_2 = src.chickenKyiv;

exports.chickenKyiv = src_2;
exports.default = src;
exports.groceristar = src_1;
