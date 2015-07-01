/**
 * @class Represents widget uuP Management Widget001 - Rating.
 */
function uuWidget() {
//UU Widget standard template
//env = {"loginStatus":"","loginToken":"","urlVariables":{"data":{},"Options":{},...}} 
    var myWidget = new UUWidget({
        loginToken: "/Users/marekberanek/Documents/uuProjects/UU Management Widget - Server V01/server/access",                   //Comment for Server!!!
        success: function (env) {
            var myRating = new UUP_MNG_Widgett001_Rating(env);
        },
        error: function (env) {
            $('<div></div>').html('Widget not ready for use!').appendTo('body');
        }
    });
};

/**
 * @class UUP_MNG_Widgett001_Rating client.
 */
var UUP_MNG_Widgett001_Rating = UUClass({

    /**
     * @constructor
     * @param {json} env
     * env.urlVariable.data={}
     * env.urlVariable.options={'wt':'Rating','mode':'standard|debug','ratingID':'ID'}
     * set 'mode':'debug' anable conditional alert, console.log!
     */
    constructor: function (env) {
        try {
            //Default Widget urlVariables
            env = env || {};
            env.urlVariables = env.urlVariables || {};
            env.urlVariables.options = env.urlVariables.options || {"mode": "debug"};
            env.urlVariables.options.wt = env.urlVariables.options.wt || 'Rating';
            env.urlVariables.options.mode = env.urlVariables.options.mode || 'standard';  //'debug'
            env.urlVariables.referreruri = env.urlVariables.referreruri || '';
            env.urlVariables.options.ratingID = env.urlVariables.options.ratingID || '001';

            //Widget properties
            this.id = "#UUP_MNG_Widget001";            //Widget id
            this.loginToken = env.loginToken;          //User Login Token
            this.ratingID = env.urlVariables.referreruri + '/' + env.urlVariables.options.ratingID;   //Rating ID
            this.debug = (env.urlVariables.options.mode === 'debug') ? true : false;
            (this.debug) && (console.log(JSON.stringify(env)));

            this.cRating = {};       //Rating properties

            //build Widget main <div>
            $('<div></div>')
                .attr('id', this.id.substring(1))
                .appendTo('body');

            this.serverLoadUserData();

        } catch (e) {
            (this.debug) && (console.error(e));
        }
    },

    /**
     * Load Rating data for user.
     */
    serverLoadUserData: function () {
        var uuDTO = { //build uuDTO
            schema: "UU/OS/DTO",
            uri: new Date(),
            data: {
                status: "",
                body: {
                    "ratingID": this.ratingID
                }
            }
        };
        var myself = this;
        $.ajax({
            type: 'POST',
            url: 'UUP_MNG_rating/loadUserData',
            cache: false,
            contentType: false,
            headers: {
                'TOKEN': this.loginToken
            },
            data: JSON.stringify(uuDTO),
            success: function (data, textStatus, jqXHR) {
                (myself.debug) && (console.log(JSON.stringify(data)));
                myself.cRating = jQuery.parseJSON(data);
                myself.display();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                (myself.debug) && (console.log(JSON.stringify(jqXHR) + "\n" + textStatus + "\n" + errorThrown));
            }
        });
    },

    /**
     * User vote.
     */
    serverVote: function () {
        var uuDTO = { //build uuDTO
            schema: "UU/OS/DTO",
            uri: new Date(),
            data: {
                status: "",
                body: {
                    ratingID: this.ratingID,
                    rating: this.cRating.data.body.rating
                }
            }
        };
        var myself = this;
        $.ajax({
            type: 'POST',
            url: 'UUP_MNG_rating/vote',
            cache: false,
            contentType: false,
            headers: {
                'TOKEN': this.loginToken
            },
            data: JSON.stringify(uuDTO),
            success: function (data, textStatus, jqXHR) {
                (myself.debug) && (console.log(JSON.stringify(data)));
                myself.cRating = jQuery.parseJSON(data);
                myself.display();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                (myself.debug) && (console.log(JSON.stringify(jqXHR) + "\n" + textStatus + "\n" + errorThrown));
            }
        });
    },

    /**
     * Display rating data for user.
     */
    display: function () {

        //alert (JSON.stringify(this.cRating));
        $(this.id).html('<div id="rating"></div>');

        if (this.cRating.data.body.allowedToVote === "yes") {

            $('#rating').jqxRating({
                value: this.cRating.data.body.rating
            });
            var myself = this;
            $('#rating').bind('change', function (event) {
                $('#rating').unbind('change');
                myself.cRating.data.body.rating = event.value;
                myself.serverVote();
            });
        } else {

            $('#rating').jqxRating({
                value: this.cRating.data.body.rating,
                disabled: true
            });
        }

    }

});