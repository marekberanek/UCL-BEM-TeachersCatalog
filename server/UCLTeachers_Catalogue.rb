#encoding: utf-8

#UUP MNG Rating - Class

#require "bundler/setup"
require "uu_os_client"
require "uu_objectstore"
require 'json'
require 'time'

class UUP_MNG_Rating
  #initialize ratingID, uuID

  #loadUserData
  #vote

  #@param ratingID string (uesURI) - ID of rating uuObject
  #@param uuID string - user uuID
  def initialize ratingID, uuID
    #construct Rating

    @uuID = uuID.to_sym
    @rID = ratingID

    @objectStoreUUEE="/"+"access"
    @objectStoreUri = "ues:DEV0111-BT:R01-S14"
    @schemaUri = "#{@objectStoreUri}:UUP_MNG_RATING"

  end

  #@return json { "rating":"value", "allowedToVote":"yes|no"
  def loadUserData
    #load User Data

    #start +4U session & init ObjectStore
    UU::OS::Security::Session.login(File.join(File.dirname(__FILE__), @objectStoreUUEE))
    os = UU::ObjectStore::ObjectStore.init(@objectStoreUri)
    begin
      rating_uuObject = os.load(
          :schemaUri => @schemaUri,
          :dataKey => @rID
      )
    rescue UU::OS::REST::MainEntityException => e
      rating_uuObject = UU::ObjectStore::ObjectStore::UUObject.new(
          :schemaUri => @schemaUri,
          :dataKey => @rID
      )
      rating_uuObject.data = {
          :count => '0',
          :sum => '0',
          :rating => '0',
          :voters => {}
      }
    ensure
      os.close
    end

    return {
        :rating => rating_uuObject.data[:rating],
        :allowedToVote => !rating_uuObject.data[:voters].key?(@uuID) ? "yes" : "no"
    }

  end

  #@param rating string - rating value (user vote)
  #@return json { "rating":"value", "allowedToVote":"yes|no"
  def vote rating
    #vote

    #start +4U session & init ObjectStore
    UU::OS::Security::Session.login(File.join(File.dirname(__FILE__), @objectStoreUUEE))
    os = UU::ObjectStore::ObjectStore.init(@objectStoreUri)
    begin
      begin
        rating_uuObject = os.load(
            :schemaUri => @schemaUri,
            :dataKey => @rID
        )
      rescue UU::OS::REST::MainEntityException => e
        rating_uuObject = UU::ObjectStore::ObjectStore::UUObject.new(
            :schemaUri => @schemaUri,
            :dataKey => @rID
        )
        rating_uuObject.data = {
            :count => '0',
            :sum => '0',
            :rating => '0',
            :voters => {}
        }
      end

      count = rating_uuObject.data[:count].to_i
      sum =rating_uuObject.data[:sum].to_i
      allowedToVote="no"

      if (!rating_uuObject.data[:voters].key?(@uuID))
        count += 1
        sum += rating.to_i
        rating_uuObject.data[:count] = count
        rating_uuObject.data[:sum] = sum
        rating_uuObject.data[:rating] = (1.0*sum/count).to_s
        rating_uuObject.data[:voters][@uuID] = {:rating => rating, :ts => Time.now}
        begin
          os.save(rating_uuObject)
        rescue UU::ObjectStore::ObjectStore::ObjectStoreException => e
          allowedToVote="yes"
        end
      end

    ensure
      os.close
    end
    return {
        :rating => rating_uuObject.data[:rating],
        :allowedToVote => allowedToVote
    }

  end

end

