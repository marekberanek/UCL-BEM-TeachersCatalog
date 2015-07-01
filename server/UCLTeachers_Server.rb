#encoding: utf-8

#Unicorn Universe Process - Management - Server

require "sinatra/base" #web server framework
require "erb" #standard ruby templating engine
require 'json'
require 'time'

require 'uu_os_client' #
require 'uu_objectstore'
require File.dirname(__FILE__)+'/UUP_MNG_Rating'

# Main server Sinatra::Base class
class UUP_MNG_Server < Sinatra::Base
  #enable static sources serving from the directory ./static
  set :static, true
  set :public_folder, File.dirname(__FILE__) + '/../client'

  #enable Error Handling in Development mode
  set :show_exceptions, false
  set :raise_errors, false


  set :server, 'webrick'

  #enable remote calls - Comment for runtime!!!
  set :remote, true
  set :bind, "0.0.0.0"
  set :port, 80 #http://localhost

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
    "UUP MNG Widget001 - Server ("+DateTime.now().to_s+")"
  end

  get '/env' do
    env.to_json
  end

  get '/request' do
    request.env.to_json
  end

  get '/simulateError' do
    raise "UUP_MNG_Widget001_Server_SomethingIsWrong!"
  end

  #default uuWidget Starting Rout 
  get '/getContent' do
    options = (!params[:options].nil?) ? JSON.parse(params[:options], symbolize_names: true) : {}
    widgetType = (!options[:wt].nil?) ? options[:wt] : "Rating"
    widgetFile = "UUP_MNG_Widget001_#{widgetType}.htm"
    send_file(File.join(settings.public_folder, widgetFile));
  end

  before '/UUP_MNG_rating/*' do
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

    #login as User, get Personal role, extract uuID, logout
    (!request.env["HTTP_TOKEN"]) && (raise "UUP_MNG_rating_LoginTokenMissing")
    (UU::OS::Security::Session.login(request.env["HTTP_TOKEN"])) || (raise "UUP_MNG_rating_UserLoginFail")
    @uuID = UU::OS::Security::Session.get_personal_role.artifact_code
    UU::OS::Security::Session.logout() #+4U logout

    #obtain and check input parameters uuDTO_in (json)
    @inp = request.body.read
    @inp.force_encoding('UTF-8')
    (@inp.encoding.name != 'UTF-8') && (raise "UUP_MNG_rating_InputParametersIsNotUTF-8 ("+@inp.encoding.name+")")
    @uuDTO_in = JSON.parse(@inp)

    # test - correct input parameters
    (
        (!@uuDTO_in) ||
        (!@uuDTO_in.key?("data")) ||
        (!@uuDTO_in["data"].key?("body")) ||
        (!@uuDTO_in["data"]["body"].key?("ratingID"))
    ) && (raise "UUP_MNG_rating_WrongInputParameterJSON")

    #random uuID for testing
    #@uuID = "#{(rand(10)+1).to_s}-1"

    #create instance of Rating
    @myRating = UUP_MNG_Rating.new @uuDTO_in["data"]["body"]["ratingID"], @uuID

  end

  post '/UUP_MNG_rating/loadUserData' do
    #serve Rating User Data

    @uuDTO_out["data"]["body"] = @myRating.loadUserData

    UU::OS::Security::Session.logout() #+4U logout
    @uuDTO_out.to_json

  end

  post '/UUP_MNG_rating/vote' do
    #serve Rating User Vote

    # test - correct input parameters - rating
    (
        (!@uuDTO_in["data"]["body"].key?("rating"))
    ) && (raise "UUP_MNG_rating_vote_RatingValueMissing")

    @uuDTO_out["data"]["body"] = @myRating.vote(@uuDTO_in["data"]["body"]["rating"])

    UU::OS::Security::Session.logout() #+4U logout
    @uuDTO_out.to_json

  end

end

#run on http://localhost
UUP_MNG_Server.run! #Comment for runtime!!!