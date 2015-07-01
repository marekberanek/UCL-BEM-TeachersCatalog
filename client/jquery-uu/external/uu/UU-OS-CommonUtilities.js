 /*
 * UU Common Utilities
 */

// OOP in JS
var UUClass = function(def) {
  // if constructor not exist, create new one
  var constructor = def.hasOwnProperty('constructor') ? def.constructor : function() {};
  for (var name in UUClass.Initializers) {
    UUClass.Initializers[name].call(constructor, def[name], def);
  }
  return constructor;
};

UUClass.Initializers = {    
  Extends: function(parent) {
    if (parent) {
      var F = function() {};
      this._superClass = F.prototype = parent.prototype;
      this.prototype = new F;
    }
  },  
  Mixins: function(mixins, def) {
    //add mixin method to constructor
    this.mixin = function(mixin) {
      for (var key in mixin) {
        if (key in UUClass.Initializers) continue;
          this.prototype[key] = mixin[key];
        }
      this.prototype.constructor = this;
    };
    //expand prototype
    var objects = [def].concat(mixins || []);
    for (var i = 0, l = objects.length; i < l; i++) {
      this.mixin(objects[i]);
    }
  }
};

//UU Widget Class
var UUWidget = new UUClass ({
  constructor: function(param) {
    this.environment={};
    this.environment.loginStatus=false;
    this.environment.loginToken ='';
    this.environment.urlVariables={};
    
    this.pObject = param || {};
    
    this.pObject.success = (typeof(this.pObject.success)==="function") ? this.pObject.success :
      function(env){alert("Default UUWidget Success function:\n"+JSON.stringify(env));};
    this.pObject.error = (typeof(this.pObject.error)==="function") ? this.pObject.error :
      function(env){alert("Default UUWidget Error function:\n"+JSON.stringify(env));};
  
    this
    .getUrlVariables()
    .login();
  },
  getUrlVariables: function(){
    //build urlVariables from window.location.search (?prop1=value1&prop2=value2...propN=valueN)
    var urlVariablesSection =  decodeURIComponent(window.location.search.substring(1)); //drop leading ?
    var urlVariablesPairs = urlVariablesSection.length ? urlVariablesSection.split("&") : [];
    for (var i=0;i<urlVariablesPairs.length;i++) {
      var urlVariablePair = urlVariablesPairs[i].split("=");
      try {
        var value = JSON.parse(urlVariablePair[1]);
      } catch(e) {
        value=urlVariablePair[1];
      }    
      this.environment.urlVariables[urlVariablePair[0]]=value;
    }
    return(this);
  },
  login: function(){
    if (typeof(this.pObject.loginToken) === 'string' ) {
      this.environment.loginStatus=true;
      this.environment.loginToken=this.pObject.loginToken;
      this.pObject.success(this.environment);
    } else {
      var myself=this;
      $.ajax({
        type:'GET',
        url:'https://plus4u.net/ues/uiwcp/ues/core/security/session/UESSession/login',
        success:function (data) {
          myself.environment.loginToken=data;
          myself.environment.loginStatus=true; 
          myself.pObject.success(myself.environment);
        },
        error:function () {myself.pObject.error(myself.environment);},
      });
    }
    return(this);
  }
});

//UU common utilities

function uuPad(n, width, z) {
//leading zeros (resp. z characters))
  z = z || '0';   //dafault value z
  n = n + '';     //convert to string
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function uuTimeRangeMinutes(from,to) {
  from = 1*from || 0;
  to = 1*to || 60*24;
  var hoursB = Math.floor(from / 60);
  var minutesB = from - (hoursB * 60);
  var hoursE = Math.floor(to / 60);
  var minutesE = to - (hoursE * 60);
  var hoursD = Math.floor((to-from) / 60);
  var minutesD = to-from - (hoursD * 60); 
  var timeRange = 
    uuPad(hoursB, 2)+":"+uuPad(minutesB, 2)+                              
    " - "+uuPad(hoursE, 2)+":"+uuPad(minutesE, 2)+
    "  ("+uuPad(hoursD, 2)+":"+uuPad(minutesD, 2)+
  ")"
  return timeRange
}

function uuSpinner(holderid, R1, R2, count, stroke_width, colour) {
//spinner
  var sectorsCount = count || 12,
  color = colour || "rainbow",
  width = stroke_width || 6,
  r1 = Math.min(R1, R2) || 20,
  r2 = Math.max(R1, R2) || 40,
  cx = r2 + width,
  cy = r2 + width,
  r = Raphael(holderid, r2 * 2 + width * 2, r2 * 2 + width * 2),
                    
  sectors = [],
  opacity = [],
  beta = 2 * Math.PI / sectorsCount,

  pathParams = {stroke: color, "stroke-width": width, "stroke-linecap": "round"};
  
  Raphael.getColor.reset();
  for (var i = 0; i < sectorsCount; i++) {
    var alpha = beta * i - Math.PI / 2,
    cos = Math.cos(alpha),
    sin = Math.sin(alpha);
    opacity[i] = 1 / sectorsCount * i;
    sectors[i] = r.path([["M", cx + r1 * cos, cy + r1 * sin], ["L", cx + r2 * cos, cy + r2 * sin]]).attr(pathParams);
    if (color === "rainbow") {
      sectors[i].attr("stroke", Raphael.getColor());
    }
  }
  var tick;
  (function ticker() {
    opacity.unshift(opacity.pop());
    for (var i = 0; i < sectorsCount; i++) {
      sectors[i].attr("opacity", opacity[i]);
    }
    r.safari();
    tick = setTimeout(ticker, 1000 / sectorsCount);
  })();
  return function () {
    clearTimeout(tick);
    r.remove();
  };
}

// $.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
//     _title: function(title) {
//         if (!this.options.title ) {
//             title.html("&#160;");
//         } else {
//             title.html(this.options.title);
//         }
//     }
// }));




