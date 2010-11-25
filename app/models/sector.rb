# == Schema Information
#
# Table name: sectors
#
#  id         :integer         not null, primary key
#  name       :string(255)     
#  created_at :datetime        
#  updated_at :datetime        
#

class Sector < ActiveRecord::Base

  has_and_belongs_to_many :projects

end
