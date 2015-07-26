# encoding: UTF-8
require "uu_os_client"

def addMissingProperties(artCode)
  #Založení chybějících AP
  UU::OS::Property.create( "#{artCode}:EMP/PD",
                           :name => 'Person Card',
                           :code => 'EMP_PC',
                           :type => 'REFERENCE'
  )

  UU::OS::Property.create( "#{artCode}:EMP/EDU",
                           :name => 'Year (Completed)',
                           :code => 'EMP_CYE',
                           :type => 'SHORT_TEXT'
  )

  UU::OS::Property.create( "#{artCode}:EMP/WD",
                           :name => 'Employee Number',
                           :code => 'EMP_EID',
                           :type => 'SHORT_TEXT'
  )

  UU::OS::Property.create( "#{artCode}:EMP/WD",
                           :name => 'Department',
                           :code => 'EMP_DEP',
                           :type => 'REFERENCE'
  )

  UU::OS::Property.create( "#{artCode}:EMP/WD",
                           :name => 'Rank',
                           :code => 'EMP_RAN',
                           :type => 'SHORT_TEXT'
  )

  UU::OS::Property.create( "#{artCode}:EMP/WD",
                           :name => 'TGA Student Card',
                           :code => 'EMP_TSC',
                           :type => 'REFERENCE'
  )

  UU::OS::Property.create( "#{artCode}:EMP/WD",
                           :name => 'TGA Lector Card',
                           :code => 'EMP_TLC',
                           :type => 'REFERENCE'
  )
end

def deleteMissingProperties(artCode)
  #Smazání chybějících AP
  UU::OS::Property.delete("#{artCode}:EMP_PC")
  UU::OS::Property.delete( "#{artCode}:EMP_CYE")
  UU::OS::Property.delete( "#{artCode}:EMP_EID")
  UU::OS::Property.delete( "#{artCode}:EMP_DEP")
  UU::OS::Property.delete( "#{artCode}:EMP_RAN")
  UU::OS::Property.delete( "#{artCode}:EMP_TSC")
  UU::OS::Property.delete( "#{artCode}:EMP_TLC")
end

# získání URI osobní role přihlášeného uživatele
UU::OS::Security::Session.login('/Users/marekberanek/Documents/uuProjects/UCL-BEM-TeachersCatalog/server/access')

stateType = "active"
mar = "PPLMMD/EC"
location = "ues:UCL-BT:UCL-BT"
query = "stateType = " + stateType + " and metaArtifactCode = '" + mar +"' order by name"

listOfTeachers = UU::OS::ArtifactSearch.query(location, :query => query)

output = ""

i = 0
for item in listOfTeachers
  if item.code != "ucl025/KARTA"
    #addMissingProperties("ues:UCL-BT:#{item.code}")
    puts "Deleting properties from #{item.code}"
    deleteMissingProperties("ues:UCL-BT:#{item.code}")
  end
  #output << "#{item.code};#{item.name};#{item.location_uri}\n"
end

#File.open("teachers.csv","wb") {|f|
#  f << output
#}


UU::OS::Security::Session.logout()