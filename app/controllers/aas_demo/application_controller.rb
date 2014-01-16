module AasDemo
  class ApplicationController < ActionController::Base
    caches_page :partial

    def partial
      render file: File.expand_path(File.join('../../../../app/assets/aas_demo/partials', "#{params[:partial]}.html"), __FILE__)
    end
  end
end
