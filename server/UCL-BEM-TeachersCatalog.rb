#encoding: utf-8

#UCL-BEM-TeachersCatalog Catalog - Class

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
    tcConfigJSON = UU::OS::Property.get_value(@tcConfigUri).data.read

    @tcConfig = JSON.parse(tcConfigJSON)
  end

  # Get property value from teacher
  # @return [object] value
  def getTeacherPropertyValue artifact, property
    return UU::OS::Property.get_value("ues:UCL-BT:#{artifact}:#{property}")
  end

  # Get list of appropriate teachers
  # @return [JSON] list of appropriate teachers
  def getListOfTeachers location, mar, stateType
    query = "stateType = " + stateType + " and metaArtifactCode = '" + mar +"' order by name"
    #query = "code= 'UCL/UP'"
    listOfTeachers = UU::OS::ArtifactSearch.query(location, :query => query)

    teachers = []

    i = 0
    for item in listOfTeachers
      teacher = Hash.new
      teacher["code"] = item.code
      teacher["name"] = item.name
      teacher["firstName"] = item.name.split(" ").last
      if (item.name.split(" ").length > 2)
        teacher["lastName"] = item.name.split(" ")[0] + " " +item.name.split(" ")[1]
      else
        teacher["lastName"] = item.name.split(" ").first
      end
      teacher["degreeBefore"] = ""
      teacher["degreeAfter"] = ""
      teacher["department"] = ""
      teacher["title"] = ""
      teacher["phone"] = ""
      teacher["email"] = ""
      teacher["personalPortal"] = item.code.split("/")[0] + "/PORTAL"
      teacher["businessCard"] = ""
      teachers << teacher
    end

    jsonTeachers = JSON.pretty_generate(teachers)

    return jsonTeachers
  end

  # Get Teachers Catalog Configuration.
  # @return [JSON] configuration of Teachers Catalog
  def getConfig
    loadConfig()

    return @tcConfig['data'].to_json
  end

end

