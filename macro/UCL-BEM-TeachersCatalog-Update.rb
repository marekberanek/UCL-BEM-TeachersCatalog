#encoding: utf-8

require "uu_os_client"
require 'json'
require 'base64'

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
  #query = "stateType = " + stateType + " and metaArtifactCode = '" + mar +"' and code='ucl061/KARTA' order by name"

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

def getPhoto(pc)
  pcAttributes = UU::OS::Property.get_value("#{pc}:UU.BEM/PIC/ATTRIBUTES").data.read
  plus4uPeopleCard = JSON.parse(pcAttributes)["UU_BEM_PIC_PLUS4U_PEOPLE_CARD"]
  if plus4uPeopleCard[-1] == ":"
    apPhotoBT = "#{plus4uPeopleCard}UU.PLUS4UPPL/PHOTO_BT"
  else
    apPhotoBT = "#{plus4uPeopleCard}:UU.PLUS4UPPL/PHOTO_BT"
  end
  bvPhoto = UU::OS::Property.get_value(apPhotoBT).data.read

  return bvPhoto
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

def getSendMessage(pc)
  pcAttributes = UU::OS::Property.get_value("#{pc}:UU.BEM/PIC/ATTRIBUTES").data.read
  plus4uPeopleCard = JSON.parse(pcAttributes)["UU_BEM_PIC_PLUS4U_PEOPLE_CARD"]
  ucUri = UU::OS::UESURIBuilder.parse_uesuri(plus4uPeopleCard).set_use_case_code('CONTACT_USER_CS').to_uesuri

  return ucUri
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

def getPlus4UPeopleCardAttributes(pc)
  pcAttributes = UU::OS::Property.get_value("#{pc}:UU.BEM/PIC/ATTRIBUTES").data.read
  return pcAttributes
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
  }

  teacher["CODE"] = item.code # artifact code
  teacher["PHOTO"] = ""
  teacher["SEND_MESSAGE"] = ""
  teacher["ADDRESS"] = ""
  teacher["PHONE"] = ""
  teacher["EMAIL"] = ""

  teachers << teacher

  durationFinish = Time.now
  duration = durationFinish - durartionStart

  puts "#{item.name} [#{item.code}] processed - duration: #{duration}"
end

# Update AP DATA with updated JSON
tc_binary=UU::OS::REST::BinaryValue.new(teachers.to_json)
UU::OS::Property.set_value(tcDataUri, tc_binary)

puts "JSON file with raw data updated"

for item in teachers
  puts "Starting processing #{item["EMP_SURNAME"]}"
  durartionStart = Time.now

  if (item["EMP_PC"] != nil && item["EMP_PC"] != "")
    bv = getPhoto(item["EMP_PC"])
    item["PHOTO"] = Base64.encode64(bv)
    item["SEND_MESSAGE"] = getSendMessage(item["EMP_PC"])

    # Process JSON with Plus4U People Card Attributes
    pcAttributes = getPlus4UPeopleCardAttributes(item["EMP_PC"])
    phoneDefault = JSON.parse(pcAttributes)["UU_BEM_PIC_PHONE_DEFAULT"]
    emailDefault = JSON.parse(pcAttributes)["UU_BEM_PIC_EMAIL_DEFAULT"]
    addressDefault = JSON.parse(pcAttributes)["UU_BEM_PIC_ADDRESS_DEFAULT"]

    addressList = JSON.parse(pcAttributes)["UU_BEM_PIC_ADDRESS_LIST"]
    phoneList = JSON.parse(pcAttributes)["UU_BEM_PIC_PHONE_LIST"]
    emailList = JSON.parse(pcAttributes)["UU_BEM_PIC_EMAIL_LIST"]

    if (addressDefault != nil)
      item["ADDRESS"] = addressList[addressDefault]["UU_BEM_PIC_ADDRESS_LINE"]
    end
    if (phoneDefault != nil)
      item["PHONE"] = phoneList[phoneDefault]["UU_BEM_PIC_PHONE"]
    end
    if (emailDefault != nil)
      item["EMAIL"] = emailList[emailDefault]["UU_BEM_PIC_EMAIL"]
    end
  end

  durationFinish = Time.now
  duration = durationFinish - durartionStart
  puts "#{item["EMP_SURNAME"]} processed - duration: #{duration}"
end

# Update AP DATA with updated JSON
tc_binary=UU::OS::REST::BinaryValue.new(teachers.to_json)
UU::OS::Property.set_value(tcDataUri, tc_binary)

puts "JSON file with photos updated"


jsonString = '{"cols": [{"label":"Příjmení a jméno"},'
jsonString << '{"label":"Katedra","type":"uesuri"},{"label":"Vizitka","type":"uesuri"},{"label":"Osobní portál","type":"uesuri"}],'
jsonString << '"rows": ['

i = 0

for item in teachers
  jsonString << '{"c": ['
  jsonString << '{"v": "' + item["EMP_TBN"] + ' ' + item["EMP_SURNAME"] + " " + item["EMP_NAME"] + ', ' + item["EMP_TAN"] + '"},'
  jsonString << '{"v": "' + item["EMP_DEP"].to_s + '"},'
  jsonString << '{"v": "ues:UCL-BT:' + item["SYS.PPL/UID"] + '"},'
  jsonString << '{"v": "ues:UCL-BT:' + item["CODE"] + '"}'
  if i < (teachers.count-1)
    jsonString << ']},'
  else
    jsonString << ']}'
  end
  i += 1
end

jsonString << ']}'

puts jsonString


# Save teachers array to JSON file
File.open("teachers.json","wb") {|f|
  f << teachers.to_json
}

durationFinishAll = Time.now
durationAll = durationFinishAll - durartionStartAll

puts "Processed - duration: #{durationAll}"


UU::OS::Security::Session.logout()