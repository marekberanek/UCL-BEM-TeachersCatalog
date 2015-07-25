# encoding: UTF-8
require "uu_os_client"

# získání URI osobní role přihlášeného uživatele
UU::OS::Security::Session.login('/Users/marekberanek/Documents/uuProjects/UCL-BEM-TeachersCatalog/server/access')

personal_role_uri = UU::OS::Security::Session.get_personal_role

#attributes = UU::OS::PersonalAccessRole.get_attributes(personal_role_uri)

#puts attributes

#terUri = 'ues:UCL-BT:UCL-BT'
artifactCode = 'ues:UCL-BT:UCL.MKT/DOPORUC'
#UU::OS::Artifact.set_presentation_attributes(artifactCode, :artifact_display_mode => UU::OS::Artifact::ArtifactDisplayMode::SIMPLE,
#                                             :control_bar_display_mode => UU::OS::Artifact::ArtifactControlBarDisplayMode::VISIBLE,
#                                              :header_display_mode => UU::OS::Artifact::ArtifactHeaderDisplayMode::TWO_LINES,
#                                              :artifact_display_mode => UU::OS::Artifact::ArtifactDisplayMode::ADVANCED)

#properties = UU::OS::Artifact.get_presentation_attributes(artifactCode)

#puts properties
#list = UU::OS::PersonalAccessRole.get_personal_access_role_list(terUri, :query => "universeId = '6-11-1'")

#property = UU::OS::Property.get_value("ues:UCL-BT:UCL.MKT/DOPORUC:BGIMAGE")
#property = UU::OS::Property.get_value("ues:VPH-BT:JAH:TEST")

#puts property

bv = UU::OS::Property.get_value("ues:VPH-BT:JAH:TEST")
File.open("tulips.png","wb") {|f|
  f<< bv.data.read
}

UU::OS::Security::Session.logout()