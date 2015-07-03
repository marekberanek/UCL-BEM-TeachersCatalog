/**
 * @class Represents widget UCL Teachers Catalog Widget001.
 */
function uuWidget() {
//UU Widget standard template
//env = {"loginStatus":"","loginToken":"","urlVariables":{"data":{},"Options":{},...}} 
    var myWidget = new UUWidget({
        loginToken: "/Users/marekberanek/Documents/uuProjects/UCL-BEM-TeachersCatalog/server/access",                   //Comment for Server!!!
        success: function (env) {
            var myRating = new UCL_TC_Widget001(env);
        },
        error: function (env) {
            $('<div></div>').html('Widget not ready for use!').appendTo('body');
        }
    });
};

/**
 * @class UCL_TC__Widget001 client.
 */
var UCL_TC_Widget001 = UUClass({

    /**
     * @constructor
     * @param {json} env
     * env.urlVariable.data={"tc":"UU:URI:TC.."}
     * env.urlVariable.options={'wt':'Catalog','mode':'standard|debug','ratingID':'ID'}
     * set 'mode':'debug' anable conditional alert, console.log!
     */
    constructor: function (env) {
        try {
            //Default Widget urlVariables
            env = env || {};
            env.urlVariables = env.urlVariables || {};
            env.urlVariables.data = env.urlVariables.data || {};
            env.urlVariables.data.tc = env.urlVariables.data.tc || {};
            env.urlVariables.options = env.urlVariables.options || {"mode": "debug"};
            env.urlVariables.options.wt = env.urlVariables.options.wt || 'Catalog';
            env.urlVariables.options.mode = env.urlVariables.options.mode || 'standard';  //'debug'
            env.urlVariables.referreruri = env.urlVariables.referreruri || '';

            //Widget properties
            this.id = "#UCLTeachers_Widget001";        //Widget id
            this.tc = env.urlVariables.data.tc         //Specified Teachers Catalogue
            this.loginToken = env.loginToken;          //User Login Token
            this.ratingID = env.urlVariables.referreruri + '/' + env.urlVariables.options.ratingID;   //Rating ID
            this.debug = (env.urlVariables.options.mode === 'debug') ? true : false;
            (this.debug) && (console.log(JSON.stringify(env)));

            this.cTC = {};       //Teachers Catalog Configuration Structure

            //build Widget main <div>
            $('<div></div>')
                .attr('id', this.id.substring(1))
                .appendTo('body');

            this
                .errorMsg({'type':'info','message':'Welcome, UCL Teachers Catalog is loading..','time':5*1000})
                .serverLoadConfig();

        } catch (e) {
            (this.debug) && (console.error(e));
        }
    },

    /**
     * Load UCL Teachers Catalog configuration data
     * @member of UCL_TC_Catalog
     * @instance
     */

    serverLoadConfig: function (param)
    {
        var uuDTO = { //build uuDTO
        schema: "UU/OS/DTO",
        uri:new Date(),
        data: {
            status:"",
            body:{"tc":this.tc}
        }
    };
    var myself = this;
    $.ajax({
        type: 'POST',
        url: 'UCL-BEM-TeachersCatalog/getTCConfig',
        cache: false,
        contentType: false,
        headers: {
            'TOKEN':this.loginToken
        },
        data: JSON.stringify(uuDTO),
        success:function(data,textStatus,jqXHR){
            (myself.debug) && (console.log(JSON.stringify(data)));
            myself.cTC = jQuery.parseJSON(data);
            //myself.cMC = jQuery.parseJSON(data);
            // myself.build();
        },
        error: function(jqXHR,textStatus,errorThrown){
            myself.errorMsg({'type':'error','message':'UCL Teachers Catalog in not available!','time':24*60*60*1000});
            (myself.debug) && (console.log(JSON.stringify(jqXHR)+"\n"+textStatus+"\n"+errorThrown));
        }
    });

    },

    /**
     * Widget Error Message.
     * @method
     * @memberof EBC_MCS_MeetingCentre
     * @instance
     * @param {json} param = { 'message':'string(simple html)','type':'error|info','time':'miliseconds','remove':'yes|no'}
     */
    errorMsg: function (param) {
        try {
            //default values & param validation
            param = param || {};
            param['remove'] = param['remove'] ||  'yes';
            param['time'] = param['time'] || 5*1000;
            isNaN(param['time']) && (param['time']=5*1000);
            param['type'] = param['type'] || 'error';
            param['message'] = param['message'] ||
                ((param['type']==='error') ? '<strong>Alert: </strong>This is en error!':'<strong>Hey! </strong>This is e message.');
            //build Widget error & info box
            var state = (param['type']==='error') ? 'ui-state-error':'ui-state-highlight';
            var icon =  (param['type']==='error') ? 'ui-icon-alert':'ui-icon-info';
            myself=this;
            var dt=new Date();
            (param['remove']==='yes') && $('*[id^='+this.id.substring(1)+'-error-]').remove();
            $('<div id="'+this.id.substring(1)+'-error-'+dt.getTime()+'"></div>').html(
                '<div class="ui-widget">'+
                '<div class="'+state+' ui-corner-all" style="margin-top: 20px; padding: 0 .7em;">'+
                '<p><span class="ui-icon '+icon+'" style="float: left; margin-right: .3em; width: 20px; height: 20px"></span>'+
                param['message']+
                '</p>'+
                '</div>'+
                '</div>'
            )
                .click(function(){$(myself.id+'-error-'+dt.getTime()).remove();})   //remove on click
                .appendTo(this.id);
            setTimeout(function(){ $(myself.id+'-error-'+dt.getTime()).remove(); }, param['time']); //remove on timeout
        } catch (e){
        } finally {
            return(this);
        }
    }
});