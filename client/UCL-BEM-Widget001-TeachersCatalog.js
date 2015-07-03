/**
 * @class Represents widget UCL Teachers Catalog Widget001.
 */
function uuWidget() {
//UU Widget standard template
//env = {"loginStatus":"","loginToken":"","urlVariables":{"data":{},"Options":{},...}} 
    var myWidget = new UUWidget({
        loginToken: "/Users/marekberanek/Documents/uuProjects/UCL-BEM-TeachersCatalog/server/access",                   //Comment for Server!!!
        success: function (env) {
            var myRating = new UCL_BEM_TeachersCatalog_Widget001(env);
        },
        error: function (env) {
            $('<div></div>').html('Widget not ready for use!').appendTo('body');
        }
    });
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
            env.urlVariables.options = env.urlVariables.options || {"mode": "debug"};
            env.urlVariables.options.wt = env.urlVariables.options.wt || 'Catalog';
            env.urlVariables.options.mode = env.urlVariables.options.mode || 'standard';  //'debug'
            env.urlVariables.referreruri = env.urlVariables.referreruri || '';

            //Widget properties
            this.id = "#PLUS4U-UCL-BEM-TeachersCatalog-Widget001";        //Widget id
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
     * @memberof UCL_BEM_TeachersCatalog
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
            myself.build();
        },
        error: function(jqXHR,textStatus,errorThrown){
            myself.errorMsg({'type':'error','message':'UCL Teachers Catalog in not available!','time':24*60*60*1000});
            (myself.debug) && (console.log(JSON.stringify(jqXHR)+"\n"+textStatus+"\n"+errorThrown));
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

        // build TC
        $('<div></div>').attr('id','teachersCatalog').appendTo(this.id);

        // build TC splitter with listbox and content panel
        var catalogWidth = tc.width;
        var catalogHeight = tc.height;
        $('<div></div>').attr('id','catalogSplitter').appendTo('#teachersCatalog');
        $('<div></div>').attr('style','overflow:hidden;').attr('id', 'catalogListPanel').appendTo('#catalogSplitter');
        $('<div></div>').attr('style','border:none;').attr('id','catalogListBox').appendTo('#catalogListPanel');
        $('<div></div>').attr('style','overflow:hidden;').attr('id', 'catalogContentPanel').appendTo('#catalogSplitter');
        $("#catalogSplitter").jqxSplitter({  width: catalogWidth, height: catalogHeight, panels: [{ size: '40%'}] });

        //Not ready
        //$('<div id="meetingRoomTabContent-spinner"></div>').attr('class',"meetingRoomTabContentSpinner").appendTo("#catalogContentPanel");
        //uuSpinner("meetingRoomTabContent-spinner");

        //$("#meetingRoomTabContent-spinner").show();


        // prepare data
        var data = new Array()
        var firstNames = ["Nancy", "Andrew", "Janet", "Margaret", "Steven", "Michael", "Robert", "Laura", "Anne"];
        var lastNames = ["Davolio", "Fuller", "Leverling", "Peacock", "Buchanan", "Suyama", "King", "Callahan", "Dodsworth"];
        var titles = ["Sales Representative", "Vice President, Sales", "Sales Representative", "Sales Representative", "Sales Manager", "Sales Representative", "Sales Representative", "Inside Sales Coordinator", "Sales Representative"];
        var titleofcourtesy = ["Ms.", "Dr.", "Ms.", "Mrs.", "Mr.", "Mr.", "Mr.", "Ms.", "Ms."];
        var birthdate = ["08-Dec-48", "19-Feb-52", "30-Aug-63", "19-Sep-37", "04-Mar-55", "02-Jul-63", "29-May-60", "09-Jan-58", "27-Jan-66"];
        var hiredate = ["01-May-92", "14-Aug-92", "01-Apr-92", "03-May-93", "17-Oct-93", "17-Oct-93", "02-Jan-94", "05-Mar-94", "15-Nov-94"];
        var address = ["507 - 20th Ave. E. Apt. 2A", "908 W. Capital Way", "722 Moss Bay Blvd.", "4110 Old Redmond Rd.", "14 Garrett Hill", "Coventry House", "Miner Rd.", "Edgeham Hollow", "Winchester Way", "4726 - 11th Ave. N.E.", "7 Houndstooth Rd."];
        var city = ["Seattle", "Tacoma", "Kirkland", "Redmond", "London", "London", "London", "Seattle", "London"];
        var postalcode = ["98122", "98401", "98033", "98052", "SW1 8JR", "EC2 7JR", "RG1 9SP", "98105", "WG2 7LT"];
        var country = ["USA", "USA", "USA", "USA", "UK", "UK", "UK", "USA", "UK"];
        var homephone = ["(206) 555-9857", "(206) 555-9482", "(206) 555-3412", "(206) 555-8122", "(71) 555-4848", "(71) 555-7773", "(71) 555-5598", "(206) 555-1189", "(71) 555-4444"];
        var notes = ["Education includes a BA in psychology from Colorado State University in 1970.  She also completed 'The Art of the Cold Call.'  Nancy is a member of Toastmasters International.",
          "Andrew received his BTS commercial in 1974 and a Ph.D. in international marketing from the University of Dallas in 1981.  He is fluent in French and Italian and reads German.  He joined the company as a sales representative, was promoted to sales manager in January 1992 and to vice president of sales in March 1993.  Andrew is a member of the Sales Management Roundtable, the Seattle Chamber of Commerce, and the Pacific Rim Importers Association.",
          "Janet has a BS degree in chemistry from Boston College (1984).  She has also completed a certificate program in food retailing management.  Janet was hired as a sales associate in 1991 and promoted to sales representative in February 1992.",
          "Margaret holds a BA in English literature from Concordia College (1958) and an MA from the American Institute of Culinary Arts (1966).  She was assigned to the London office temporarily from July through November 1992.",
          "Steven Buchanan graduated from St. Andrews University, Scotland, with a BSC degree in 1976.  Upon joining the company as a sales representative in 1992, he spent 6 months in an orientation program at the Seattle office and then returned to his permanent post in London.  He was promoted to sales manager in March 1993.  Mr. Buchanan has completed the courses 'Successful Telemarketing' and 'International Sales Management.'  He is fluent in French.",
          "Michael is a graduate of Sussex University (MA, economics, 1983) and the University of California at Los Angeles (MBA, marketing, 1986).  He has also taken the courses 'Multi-Cultural Selling' and 'Time Management for the Sales Professional.'  He is fluent in Japanese and can read and write French, Portuguese, and Spanish.",
          "Robert King served in the Peace Corps and traveled extensively before completing his degree in English at the University of Michigan in 1992, the year he joined the company.  After completing a course entitled 'Selling in Europe,' he was transferred to the London office in March 1993.",
          "Laura received a BA in psychology from the University of Washington.  She has also completed a course in business French.  She reads and writes French.",
          "Anne has a BA degree in English from St. Lawrence College.  She is fluent in French and German."];
        var k = 0;
        for (var i = 0; i < firstNames.length; i++) {
          var row = {};
          row["firstname"] = firstNames[k];
          row["lastname"] = lastNames[k];
          row["title"] = titles[k];
          row["titleofcourtesy"] = titleofcourtesy[k];
          row["birthdate"] = birthdate[k];
          row["hiredate"] = hiredate[k];
          row["address"] = address[k];
          row["city"] = city[k];
          row["postalcode"] = postalcode[k];
          row["country"] = country[k];
          row["homephone"] = homephone[k];
          row["notes"] = notes[k];
          data[i] = row;
          k++;
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
          var container = $('<div style="margin: 5px;"></div>')
          var datarecord = data[index];
          var degreeBefore = "<div style='margin: 10px;'><b>Degree Before:</b> " + "</div>";
          var firstName = "<div style='margin: 10px;'><b>First Name:</b> " + datarecord.firstname + "</div>";
          var lastName = "<div style='margin: 10px;'><b>Last Name:</b> " + datarecord.lastname + "</div>";
          var degreeAfter = "<div style='margin: 10px;'><b>Degree After:</b> " + "</div>";
          var department = "<div style='margin: 10px;'><b>Department:</b> " + datarecord.title + "</div>";
          var title = "<div style='margin: 10px;'><b>Title:</b> " + datarecord.address + "</div>";
          var phone = "<div style='margin: 10px;'><b>Phone:</b> " + datarecord.homephone + "</div>";
          var email = "<div style='margin: 10px;'><b>E-mail:</b> " + datarecord.homephone + "</div>";
          var personalPortal = "<div style='margin: 10px;'><b>Personal Portal:</b> " + "</div>";
          var businessCard = "<div style='margin: 10px;'><b>Business Card:</b> " + "</div>";
          container.append(degreeBefore);
          container.append(firstName);
          container.append(lastName);
          container.append(degreeAfter);
          container.append(department);
          container.append(title);
          container.append(phone);
          container.append(email);
          container.append(personalPortal);
          container.append(businessCard);
          $("#catalogContentPanel").html(container.html());
        }
        $('#catalogListBox').on('select', function (event) {
          updatePanel(event.args.index);
        });

        // Create jqxListBox
        $('#catalogListBox').jqxListBox({ filterable: true, filterPlaceHolder: "Search surname", selectedIndex: 0, theme: "ui-start", source: dataAdapter, displayMember: "lastname", valueMember: "firstname", itemHeight: 70, height: '100%', width: '100%',
          renderer: function (index, label, value) {
            var datarecord = data[index];
            var imgurl = '../../images/' + label.toLowerCase() + '.png';
            var img = '<img height="50" width="40" src="' + imgurl + '"/>';
            var table = '<table style="min-width: 130px;"><tr><td style="width: 40px;" rowspan="2">' +
              img + '</td><td>' + datarecord.firstname + " " + datarecord.lastname + '</td></tr><tr><td>' +
              datarecord.title + '</td></tr></table>';
            return table;
          }
        });

       // $("#meetingRoomTabContent-spinner").hide();

        updatePanel(0);



      } catch (e) {
          (this.debug) && (console.error(e));
      } finally {
          return this;
      }
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