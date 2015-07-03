#encoding: utf-8

#UCL-BEM-TeachersCatalog Catalog - Class

#require "bundler/setup"
require "uu_os_client"
require 'json'
require 'time'

class UCL_BEM_TeachersCatalog
  #initialize teachersCatalog, uuID


  def initialize teachersCatalog, uuID
    #construct Teachers Catalog



    @uuID = uuID
    @tc = teachersCatalog
    @tcConfigUri = @tc+":CONFIG"

    @tcConfig = {}

  end

  # Configuration
  # Load Teachers Catalog Configuration
  def loadConfig

  #"{
  #  "mar": "UCL-BT:UCLMMD/POZ",
  #      "stateType": [
  #      { "code" : "ues_UPTODATE" },
  #      { "code" : "ues_OUTOFDATE" }
  #  ]
  #  }"


    tcConfigJSON = UU::OS::Property.get_value(@tcConfigUri).data.read

    @tcConfig = JSON.parse(tcConfigJSON)

  end

  # Get Teachers Catalog Configuration.
  # @return [JSON] configuration of Teachers Catalog
  def getConfig
    "UCL BEM Teachers Catalog Widget001 - Server ("+DateTime.now().to_s+")"
    loadConfig()

    return @tcConfig['data'].to_json
  end

end

