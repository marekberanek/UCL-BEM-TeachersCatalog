/**
 * @class Represents widget UCL Teachers Catalog Widget001.
 *
 */
function uuWidget() {
//UU Widget standard template
    var myWidget = new UUWidget({
        loginToken: "/Users/marekberanek/Documents/uuProjects/UCL-BEM-TeachersCatalog/server/access",                   //Comment for Server!!!
        success: function (env) {
            var myTC = new UCL_BEM_TeachersCatalog_Widget001(env);
        },
        error: function (env) {
            $('<div></div>').html('Widget not ready for use!').appendTo('body');
        }
    });
};


/**
 * Search value in array
 * @returns index
 */

function search(nameKey, myArray){
  for (var i=0; i < myArray.length; i++) {
    if (myArray[i].code === nameKey) {
      return i;
    }
  }
};

/**
 * @class UCL_BEM_TeachersCatalog_Widget001 client.
 */

var UCL_BEM_TeachersCatalog_Widget001 = UUClass({

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
      env.urlVariables.options = env.urlVariables.options || {"mode": "debug", "lang": "cz"};
      env.urlVariables.options.lang = env.urlVariables.options.lang || 'cz';
      env.urlVariables.options.mode = env.urlVariables.options.mode || 'standard';  //'debug'
      env.urlVariables.width = env.urlVariables.width || '900';  //'debug'
      env.urlVariables.height = env.urlVariables.height || '500';  //'debug'
      env.urlVariables.referreruri = env.urlVariables.referreruri || '';


      //Widget properties
      this.id = "#PLUS4U-UCL-BEM-TeachersCatalog-Widget001";        //Widget id
      this.tc = env.urlVariables.data.tc         //Specified Teachers Catalogue
      this.loginToken = env.loginToken;          //User Login Token
      this.debug = (env.urlVariables.options.mode === 'debug') ? true : false;
      this.lang = env.urlVariables.options.lang;
      this.width = env.urlVariables.width;
      this.height = env.urlVariables.height;
      (this.debug) && (console.log(JSON.stringify(env)));

      this.cTC = {};       //Teachers Catalog Configuration Structure

      //build Widget main <div>
      $('<div></div>')
        .attr('id', this.id.substring(1))
        .appendTo('body');

      this
        .errorMsg({'type': 'info', 'message': 'Teachers Catalog is loading..', 'time': 3 * 1000})
        .serverLoadConfig();

    } catch (e) {
      (this.debug) && (console.error(e));
    }
  },

  /**
   * Load UCL Teachers Catalog configuration data
   * @memberof UCL_BEM_TeachersCatalog
   * @instance
   */

  serverLoadConfig: function (param) {
    var uuDTO = { //build uuDTO
      schema: "UU/OS/DTO",
      uri: new Date(),
      data: {
        status: "",
        body: {"tc": this.tc}
      }
    };
    var myself = this;
    $.ajax({
      type: 'POST',
      url: 'UCL-BEM-TeachersCatalog/getTCConfig',
      cache: false,
      contentType: false,
      headers: {
        'TOKEN': this.loginToken
      },
      data: JSON.stringify(uuDTO),
      success: function (data, textStatus, jqXHR) {
        (myself.debug) && (console.log(JSON.stringify(data)));
        myself.cTC = jQuery.parseJSON(data);
        myself.loadTeachersList()

      },
      error: function (jqXHR, textStatus, errorThrown) {
        ("#teachersCatalog-spinner").hide();
        myself.errorMsg({
          'type': 'error',
          'message': 'UCL Teachers Catalog in not available!',
          'time': 24 * 60 * 60 * 1000
        });
        (myself.debug) && (console.log(JSON.stringify(jqXHR) + "\n" + textStatus + "\n" + errorThrown));
      }
    });

  },

  /**
   * Build  Core Teachers Catalog GUI.
   * @memberof UCL_BEM_TeachersCatalog
   * @instance
   * @returns {UCL_BEM_TeachersCatalog}
   */

  buildTeachersCatalogGUI: function (param) {
    try {
      var tc = this.cTC.data.body.config;

      // build TC
      $('<div></div>').attr('id','teachersCatalog').appendTo(this.id);

      // build TC splitter with list and content panel
      var catalogWidth = this.width-30;
      var catalogHeight = this.height-30;
      $('<div></div>').attr('id','catalogSplitter').appendTo('#teachersCatalog');
      $('<div></div>').attr('style','overflow:hidden;').attr('id', 'catalogListPanel').appendTo('#catalogSplitter');
      $('<div></div>').attr('style','border:none;').attr('id','catalogListBox').appendTo('#catalogListPanel');
      $('<div></div>').attr('style','overflow:hidden;').attr('id', 'catalogContentPanel').appendTo('#catalogSplitter');
      $("#catalogSplitter").jqxSplitter({ width: catalogWidth, height: catalogHeight, splitBarSize: 5, theme: 'uuTheme', panels: [{ size: '40%'}] });


    } catch (e) {
      (this.debug) && (console.error(e));
    } finally {
      return this;
    }

  },

  loadTeachersList: function (param) {
    var uuDTO = { //build uuDTO
      schema: "UU/OS/DTO",
      uri: new Date(),
      data: {
        status: "",
        body: {
          "tc": this.tc,
          "location": this.cTC.data.body.config.location,
          "mar": this.cTC.data.body.config.mar,
          "stateType": this.cTC.data.body.config.stateType
          }
      }
    };
    var myself = this;

    myself.buildTeachersCatalogGUI();

    $('<div id="teachersCatalog-spinner"></div>')
        .appendTo("#catalogSplitter");

    var remove = uuSpinner("teachersCatalog-spinner",14,25,12,4,"#fff");


    $.ajax({
      type: 'POST',
      url: 'UCL-BEM-TeachersCatalog/getTeachersList',
      cache: false,
      contentType: false,
      headers: {
        'TOKEN': this.loginToken
      },
      data: JSON.stringify(uuDTO),
      success: function (data, textStatus, jqXHR) {
        (myself.debug) && (console.log(JSON.stringify(data)));
        myself.cTC.teachers = jQuery.parseJSON(data);
        myself.build();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        ("#teachersCatalog-spinner").hide();
        myself.errorMsg({
          'type': 'error',
          'message': 'Get teachers list is not available!',
          'time': 24 * 60 * 60 * 1000
        });
        (myself.debug) && (console.log(JSON.stringify(jqXHR) + "\n" + textStatus + "\n" + errorThrown));
      }
    });

    },

    /**
     * Build Teachers Catalog GUI.
     * @memberof UCL_BEM_TeachersCatalog
     * @instance
     * @returns {UCL_BEM_TeachersCatalog}
     */

    build: function (param) {
      try {
        var tc = this.cTC.data.body.config;
        var labels = {};
        if (this.lang === "cz") {
          labels = this.cTC.data.body.config.labels.cz;
        } else {
          labels = this.cTC.data.body.config.labels.en;
        }

        var teachersList = this.cTC.teachers.data.body.teachersList;

        // prepare data
        var data = new Array();

        var j = 0;
        for (var i = 0; i < teachersList.length; i++) {
          var row = {};
          if (teachersList[i].department !== "")
          {
            row["code"] = teachersList[i].code;
            row["degreeBefore"] = teachersList[i].degreeBefore;
            row["firstName"] = teachersList[i].firstName;
            row["lastName"] = teachersList[i].lastName;
            row["degreeAfter"] = teachersList[i].degreeAfter;
            row["department"] = teachersList[i].department;
            var personalCard = teachersList[i].personalPortal;
            var personalPortal = personalCard.match(/(\w+)/);
            row["personalPortal"] = personalPortal[1]+"/PORTAL";
            row["businessCard"] = teachersList[i].businessCard;
            row["photo"] = teachersList[i].photo;
            row["sendMessage"] = teachersList[i].sendMessage;
            row["address"] = teachersList[i].address;
            row["email"] = teachersList[i].email;
            row["phone"] = teachersList[i].phone;
            data[j] = row;
            j++;
          }
        }


        var source =
        {
          localdata: data,
          datatype: "array"
        };

        var dataAdapter = new $.jqx.dataAdapter(source);




        // Panel with detailed information about teacher
        // First name, last name, degree before and after, title, department, phone, e-mail, link to personal portal, link to personal card
        var updatePanel = function (index) {
          var container = $('<div style="margin: 5px;"></div>');
          var datarecord = data[index];
          var degreeBefore = "<div class='jqx-widget-uuTheme' style='margin: 10px;'><b>" + labels.degreeBefore + ":</b> " + datarecord.degreeBefore + "</div>";
          var firstName = "<div class='jqx-widget-uuTheme' style='margin: 10px;'><b>" + labels.firstName + ":</b> " + datarecord.firstName + "</div>";
          var lastName = "<div class='jqx-widget-uuTheme' style='margin: 10px;'><b>" + labels.lastName + ":</b> " + datarecord.lastName + "</div>";
          var degreeAfter = "<div class='jqx-widget-uuTheme' style='margin: 10px;'><b>" + labels.degreeAfter + ":</b> " + datarecord.degreeAfter + "</div>";
          var address = "<div class='jqx-widget-uuTheme' style='margin: 10px;'><b>" + labels.address + ":</b> " + datarecord.address + "</div>";
          var phone = "<div class='jqx-widget-uuTheme' style='margin: 10px;'><b>" + labels.phone + ":</b> " + datarecord.phone + "</div>";
          var email = "<div class='jqx-widget-uuTheme' style='margin: 10px;'><b>" + labels.email + ":</b> <a href='mailto:" + datarecord.email + "'>" + datarecord.email + "</a></div>";

          var button = function (opt) {
            var el = $('<a class="button bg-holder" href="' + opt.url + '" target="_new"><span class="icon"><span class="glyphs"></span></span><span class="text"></span></a>');
            if (opt.type) el.addClass("button-" + opt.type);
            if (opt.text) el.find(".text").text(opt.text);
            else el.find(".text").remove();
            if (opt.glyph) el.find(".glyphs").text(opt.glyph);
            else el.find(".icon").remove();
            el.addClass("color-" + opt.color + "-bg");
            return el;
          }

          var sendMessageLink = "";

          if (datarecord.sendMessage !== "") {
            // Activity Icon
            var glyph = String.fromCharCode(0xe000 + 39);

            //sendMessageLink = "<a target='_new' style='color:blue;' href='https://plus4u.net/ues/sesm?SessFree=" + datarecord.sendMessage + "'>" + labels.sendMessage + "</a>";
            sendMessageLink = $("<div align='center' class='jqx-widget-uuTheme' style='margin: 10px;'></div>");
            sendMessageLink.append(button({ type: "", text: labels.sendMessage, glyph: glyph, color: "steel", url: "https://plus4u.net/ues/sesm?SessFree=" + datarecord.sendMessage }));
          }


          // Set department link and name
          var departmentLink = "";

          if (datarecord.department !== "") {
            var departmentArtifactCodeURI = datarecord.department;
            var departmentCode = departmentArtifactCodeURI.match(/\w+\:.{6}[\[]\d+[\]]\:(.+)[\[]\d+[\]]/);

            departmentLink = "<a target='_new' style='color:blue;' href='https://plus4u.net/ues/sesm?SessFree=" + departmentArtifactCodeURI + "'>";

            switch (departmentCode[1]) {
              case "EDU.DIT/PORTAL":
                departmentLink += labels.dit + "</a>";
                break;
              case "EDU.DEM/PORTAL":
                departmentLink += labels.dem + "</a>";
                break;
              case "EDU.DLA/PORTAL":
                departmentLink += labels.dla + "</a>";
                break;
              default:
                departmentLink = "";
            }
          }


          var department = "<div class='jqx-widget-uuTheme' style='margin: 10px;'>" + departmentLink + "</div>";
          var sendMessage = "<div class='jqx-widget-uuTheme' style='margin: 10px;'>" + sendMessageLink + "</div>";
          var personalPortal = "<div class='jqx-widget-uuTheme' style='margin: 10px;'><a target='_new' href='https://plus4u.net/ues/sesm?SessFree=ues:UCL-BT:" + datarecord.personalPortal + "'>" + labels.personalPortal + "</a></div>";
          var businessCard = "<div class='jqx-widget-uuTheme' style='margin: 10px;'><a target='_new' href='https://plus4u.net/ues/sesm?SessFree=ues:UCL-BT:" + datarecord.businessCard + "'>" + labels.businessCard + "</a></div>";

          (datarecord.degreeBefore !== "") && container.append(degreeBefore);
          (datarecord.firstName !== "") && container.append(firstName);
          (datarecord.lastName !== "") && container.append(lastName);
          (datarecord.degreeAfter !== "") && container.append(degreeAfter);
          (datarecord.address !== "") && container.append(address);
          (datarecord.phone !== "") && container.append(phone);
          (datarecord.email !== "") && container.append(email);
          // (datarecord.department !== "") && container.append(department);
          // (datarecord.personalPortal !== "") && container.append(personalPortal);
          (datarecord.businessCard !== "") && container.append(businessCard);
          (datarecord.sendMessage !== "") && container.append(sendMessageLink);

          $("#catalogContentPanel").html(container.html());

          }

        $('#catalogListBox').on('select', function (event) {
          index = search(event.args.item.value, data)
          updatePanel(index);
        });

        // Create jqxListBox
        $('#catalogListBox').jqxListBox({ filterable: true, filterPlaceHolder: labels.filterPlaceHolder, selectedIndex: 0, theme: "uuTheme", source: dataAdapter, displayMember: "lastName", valueMember: "code", height: '100%', width: '100%',
          renderer: function (index, label, value) {
            var datarecord = data[index];

            departmentName = "";

            if (datarecord.department !== "") {
              var departmentArtifactCodeURI = datarecord.department;
              var departmentCode = departmentArtifactCodeURI.match(/\w+\:.{6}[\[]\d+[\]]\:(.+)[\[]\d+[\]]/);

              switch (departmentCode[1]) {
                case "EDU.DIT/PORTAL":
                  departmentName = labels.dit;
                  break;
                case "EDU.DEM/PORTAL":
                  departmentName = labels.dem;
                  break;
                case "EDU.DLA/PORTAL":
                  departmentName = labels.dla;
                  break;
                default:
                  departmentName = "";
              }
            }

            var img = '<img height="50" width="40" src="data:image/jpeg;base64, ' + datarecord.photo + '"/>';

            var table = "";

            if (datarecord.photo !== "") {
              table = '<table style="min-width: 130px;"><tr><td style="width:40px;" rowspan="2">' + img + '</td><td>' + datarecord.firstName + " " + datarecord.lastName + '</td></tr><tr><td>' + departmentName + '</td></tr></table>';
            } else {
              table = '<table style="min-width: 130px;"><tr><td>' + datarecord.firstName + " " + datarecord.lastName + '</td></tr><tr><td>' + departmentName + '</td></tr></table>';
            }
            return table;
          }
        });

        updatePanel(0);

        // Hide spinner
        $("#teachersCatalog-spinner").hide();

      } catch (e) {
          (this.debug) && (console.error(e));
      } finally {
          return this;
      }
    },

    /**
     * Widget Error Message.
     * @method
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