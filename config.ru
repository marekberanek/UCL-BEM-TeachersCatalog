require './server/UCLTeachers_Server.rb'

map "/" do
  run UCLTeachers_Server
end