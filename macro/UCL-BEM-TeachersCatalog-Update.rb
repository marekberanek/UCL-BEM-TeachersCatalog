#encoding: utf-8

require "uu_os_client"
require 'json'

#UCL-BEM-TeachersCatalog Update - Client script for catalog updating represented by JSON file

tcConfigUri = "ues:UCL-BT:UCL/VYUCUJICI:CONFIG"
tcDataUri = "ues:UCL-BT:UCL/VYUCUJICI:DATA"
property_entity = 'ues:#{system}:ues.core.property.userproperty[34]:'
teachers = []

QOSWAIT = 1.5 #seconds

def loadConfig(uri)
  tcConfigJSON = UU::OS::Property.get_value(uri).data.read
  return JSON.parse(tcConfigJSON)
rescue UU::OS::QoS::QoSLimitException
  if count < 5
    #wait for some time
    sleep(QOSWAIT)
    count += 1
    #retry previous command
    retry
  else
    puts e.code
    exit
  end
end

def retrieveTeachersList (stateType, mar, location)
  query = "stateType = " + stateType + " and metaArtifactCode = '" + mar +"' order by name"
  listOfTeachers = UU::OS::ArtifactSearch.query(location, :query => query)
  return listOfTeachers
end

def getPropertyValue (artifactCode, propertyCode)
  puts "Retrieving value from #{propertyCode}"
  result = UU::OS::Property.get_value "#{artifactCode}:#{propertyCode}"
  return result
rescue UU::OS::QoS::QoSLimitException
  if count < 5
    #wait for some time
    sleep(QOSWAIT)
    count += 1
    #retry previous command
    retry
  else
    puts e.code
    exit
  end
end

UU::OS::Security::Session.login('/Users/marekberanek/Documents/uuProjects/UCL-BEM-TeachersCatalog/server/access')

durartionStartAll = Time.now


@tcConfig = loadConfig(tcConfigUri)
result = retrieveTeachersList @tcConfig["data"]["stateType"], @tcConfig["data"]["mar"], @tcConfig["data"]["location"]

@teachers = []

for item in result
  teacher = Hash.new

  puts "Starting processing #{item.name} [#{item.code}]"
  durartionStart = Time.now

  art = "ues:UCL-BT:#{item.code}"

  artPropertyList = UU::OS::Property.get_entry_list(art, :query => "entityTypeUri = '#{property_entity}'",
                                                    :recursive => true)

  artPropertyList.each{ |property|
    if property.code == "EMP_NAME"
      teacher["EMP_NAME"] = property.value
    end
    if property.code == "EMP_SURNAME"
      teacher["EMP_SURNAME"] = property.value
    end
    if property.code == "EMP_TBN"
      teacher["EMP_TBN"] = property.value
    end
    if property.code == "EMP_TAN"
      teacher["EMP_TAN"] = property.value
    end
    if property.code == "EMP_EID"
      teacher["EMP_EID"] = property.value
    end
    if property.code == "EMP_RAN"
      teacher["EMP_RAN"] = property.value
    end
    if property.code == "EMP_WL"
      teacher["EMP_WL"] = property.value
    end
    if property.code == "EMP_WH"
      teacher["EMP_WH"] = property.value
      teacher["EMP_WH_REL"] = (property.value.to_f / 40).to_f
    end
    if property.code == "EMP_DEP"
      teacher["EMP_DEP"] = property.value
    end
    if property.code == "SYS.PPL/UID"
      teacher["SYS.PPL/UID"] = property.value
    end
    if property.code == "EMP_PC"
      teacher["EMP_PC"] = property.value
    end
    if property.code == "EMP_PC"
      teacher["EMP_PC"] = property.value
    end
  }

  teacher["CODE"] = item.code # artifact code
  teacher["PHOTO"] = ""

  teachers << teacher
  puts teacher

  durationFinish = Time.now
  duration = durationFinish - durartionStart

  puts "#{item.name} [#{item.code}] processed - duration: #{duration}"
end

# Update AP DATA with updated JSON
tc_binary=UU::OS::REST::BinaryValue.new(teachers.to_json)
UU::OS::Property.set_value(tcDataUri, tc_binary)


# Save teachers array to JSON file
File.open("teachers.json","wb") {|f|
  f << teachers.to_json
}

durationFinishAll = Time.now
durationAll = durationFinishAll - durartionStartAll

puts "Processed - duration: #{durationAll}"


UU::OS::Security::Session.logout()