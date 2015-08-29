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
    @tcDataUri = @tc+":DATA"

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

  def convertNull2Empty(value)
    if value == nil
      value = ""
    end

    return value
  end

  # Get list of appropriate teachers
  # @return [JSON] list of appropriate teachers
  def getListOfTeachers location, mar, stateType
    query = "stateType = " + stateType + " and metaArtifactCode = '" + mar +"' order by name"
    #query = "code= 'UCL/UP'"
    #listOfTeachers = UU::OS::ArtifactSearch.query(location, :query => query)

    listOfTeachers = JSON.parse(UU::OS::Property.get_value(@tcDataUri).data.read)

    teachers = []

    i = 0
    for item in listOfTeachers
      teacher = Hash.new
      teacher["code"] = item["CODE"]
      teacher["firstName"] = convertNull2Empty(item["EMP_NAME"])
      teacher["lastName"] = convertNull2Empty(item["EMP_SURNAME"])
      teacher["degreeBefore"] = convertNull2Empty(item["EMP_TBN"])
      teacher["degreeAfter"] = convertNull2Empty(item["EMP_TAN"])
      teacher["department"] = convertNull2Empty(item["EMP_DEP"])
      teacher["rank"] = convertNull2Empty(item["EMP_RAN"])
      teacher["personalPortal"] = convertNull2Empty(item["CODE"])
      teacher["businessCard"] = convertNull2Empty(item["SYS.PPL/UID"])
      teacher["personCard"] = convertNull2Empty(item["EMP_PC"])
      teacher["photo"] = convertNull2Empty(item["PHOTO"])
      teacher["sendMessage"] = convertNull2Empty(item["SEND_MESSAGE"])
      teacher["address"] = convertNull2Empty(item["ADDRESS"])
      teacher["phone"] = convertNull2Empty(item["PHONE"])
      teacher["email"] = convertNull2Empty(item["EMAIL"])

      teachers << teacher
    end

    jsonTeachers = JSON.pretty_generate(teachers)

    return jsonTeachers
  rescue UU::OS::QoS::QoSLimitException
    if count < 5
      #wait for some time
      sleep(QOSWAIT)
      count += 1
      #retry previous command
      retry
    end
  end

  # Get Teachers Catalog Configuration.
  # @return [JSON] configuration of Teachers Catalog
  def getConfig
    loadConfig()

    return @tcConfig['data'].to_json
  end

end

