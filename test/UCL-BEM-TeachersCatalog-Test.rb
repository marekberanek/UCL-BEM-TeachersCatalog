#encoding: utf-8

require 'uu_os_client' # uu
require 'json'
require 'time'

require File.dirname(__FILE__)+'/../server/UCL-BEM-TeachersCatalog'

#start +4U session
UU::OS::Security::Session.login '/Users/marekberanek/Documents/uuProjects/UCL-BEM-TeachersCatalog/server/access'

#create instance of Meeting Room Schedule
myTC = UCL_BEM_TeachersCatalog.new "ues:UCL-BT:UCL/VYUCUJICI", "6-11-1"

#puts myTC.getConfig()

puts myTC.getListOfTeachers("ues:UCL-BT:UCL.EMP", "PPLMMD/EC", "active")

#puts myTC.getTeacherPropertyValue "UCL-BT:ucl279/KARTA", "EMP_NAME"
