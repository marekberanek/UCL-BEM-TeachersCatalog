#encoding: utf-8

#UCL Teachers Catalog - Server

require "sinatra/base" #web server framework
require "erb" #standard ruby templating engine
require 'json'
require 'time'

require 'uu_os_client' #
require File.dirname(__FILE__)+'/UCL-BEM-TeachersCatalog'

# Main server Sinatra::Base class
class UCL_BEM_TeachersCatalog_Server < Sinatra::Base
  #enable static sources serving from the directory ./static
  set :static, true
  set :public_folder, File.dirname(__FILE__) + '/../client'

  #enable Error Handling in Development mode
  set :show_exceptions, false
  set :raise_errors, false

  set :server, 'webrick'

  #enable remote calls - Comment for runtime!!!
  set :remote, true
 # set :bind, "0.0.0.0"
 # set :port, 81 #http://localhost

  def buildError
    (!@uuDTO_out) && (
    @uuDTO_out=JSON.parse '
        {
          "schema":"UU/OS/DTO",
          "uri":"'+DateTime.now.to_s+'",
          "data":{
            "status":"",
            "body":{}       
          }
        }    
      '
    )

    @uuDTO_out["data"]["status"]=status.to_s
    @uuDTO_out["data"]["body"]["message"]=env['sinatra.error'].message
    @uuDTO_out["data"]["body"]["backtrace"]=env['sinatra.error'].backtrace

    UU::OS::Security::Session.logout() #+4U logout

    return @uuDTO_out.to_json
  end

  #routes 
  error do
    #500 error handler
    buildError
  end

  not_found do
    #404 error handler
    buildError
  end

  get '/' do
    "UCL BEM Teachers Catalog Widget001 - Server ("+DateTime.now().to_s+")"
  end

  get '/env' do
    env.to_json
  end

  get '/request' do
    request.env.to_json
  end

  get '/simulateError' do
    raise "UCL_BEM_TeachersCatalog_Widget001_Server_SomethingIsWrong!"
  end


  #default uuWidget Starting Rout
  #for testing, call: localhost:81/getContent?options={"mode":"debug", "lang":"en"}&data={"tc":"ues:UCL-BT:UCL/VYUCUJICI"}
  #localhost:9292/getContent?options=%7B%22mode%22%3A%22debug%22%2C%20%22lang%22%3A%22en%22%7D&data=%7B%22tc%22%3A%22ues%3AUCL-BT%3AUCL%2FVYUCUJICI%22%7D
  get '/getContent' do
    options = (!params[:options].nil?) ? JSON.parse(params[:options], symbolize_names: true) : {}
    widgetFile = "UCL-BEM-Widget001-TeachersCatalog.htm"
    send_file(File.join(settings.public_folder, widgetFile));
  end

  before '/UCL-BEM-TeachersCatalog/*' do
    cache_control :no_cache, :max_age => 0
    #build uuDTO
    @uuDTO_out=JSON.parse '
      {
        "scheme":"UU/OS/DTO",
        "uri":"'+DateTime.now.to_s+'",
        "data":{
          "status":"200",
          "body":{}
        }
      }
    '

    begin
      #login as User, get Personal role, extract uuID, logout
      (!request.env["HTTP_TOKEN"]) && (raise "UCL_BEM_TeachersCatalog_LoginTokenMissing")

      (UU::OS::Security::Session.login(request.env["HTTP_TOKEN"])) || (raise "UCL_BEM_TeachersCatalog_UserLoginFail")
      @uuID = UU::OS::Security::Session.get_personal_role.artifact_code
      UU::OS::Security::Session.logout() #+4U logout

      #obtain and check input parameters uuDTO_in (json)
      @inp = request.body.read
      @inp.force_encoding('UTF-8')
      (@inp.encoding.name != 'UTF-8') && (raise "UCL_BEM_TeachersCatalog_InputParametersIsNotUTF-8 ("+@inp.encoding.name+")")
      @uuDTO_in = JSON.parse(@inp)

      # test - correct input parameters
      (
          (!@uuDTO_in) ||
          (!@uuDTO_in.key?("data")) ||
          (!@uuDTO_in["data"].key?("body"))
      ) && (raise "UCL_BEM_TeachersCatalog_before_WrongInputParameterJSON")

      #test - Teachers Catalog missing
      (!@uuDTO_in['data']['body'].key?('tc')) && (raise "UCL_BEM_TeachersCatalog_before_TeachersCatalogMissing")

      #create instance of Teachers Catalog
      (UU::OS::Security::Session.login('/Users/marekberanek/Documents/uuProjects/UCL-BEM-TeachersCatalog/server/access')) || (raise "UCL_BEM_TeachersCatalog_before_uuEELoginFail") #Comment for server

      @myTC = UCL_BEM_TeachersCatalog.new @uuDTO_in["data"]["body"]["tc"], @uuID
    end
  end

  post '/UCL-BEM-TeachersCatalog/getTCConfig' do

    #get Config, Clients, UserProfile
    @uuDTO_out["data"]["body"]={}
    @uuDTO_out["data"]["body"]["config"] = JSON.parse @myTC.getConfig
    #@uuDTO_out["data"]["body"]["config"] = @myTC.getConfig

    UU::OS::Security::Session.logout() #+4U logout
    @uuDTO_out.to_json
  end

  post '/UCL-BEM-TeachersCatalog/getTeachersList' do
  #serve Teachers List

    begin
      #test - MAR Missing, stateType Missing
      (!@uuDTO_in['data']['body'].key?('location')) && (raise "UCL_BEM_TeachersCatalog_getTeachersList_LocationMissing")
      (!@uuDTO_in['data']['body'].key?('mar')) && (raise "UCL_BEM_TeachersCatalog_getTeachersList_MARMissing")
      (!@uuDTO_in['data']['body'].key?('stateType')) && (raise "UCL_BEM_TeachersCatalog_getTeachersList_StateTypeMissing")

      #get Teachers List
      @uuDTO_out["data"]["body"]={}

      @uuDTO_out["data"]["body"]["teachersList"]= JSON.parse @myTC.getListOfTeachers @uuDTO_in['data']['body']['location'], @uuDTO_in['data']['body']['mar'], @uuDTO_in['data']['body']['stateType']
      UU::OS::Security::Session.logout() #+4U logout
      @uuDTO_out.to_json
    end
  end

end

#run on http://localhost
#UCL_BEM_TeachersCatalog_Server.run! #Comment for runtime!!!