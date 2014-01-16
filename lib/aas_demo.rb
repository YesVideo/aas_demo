require "aas_demo/version"

module AasDemo
  class Engine < ::Rails::Engine
    isolate_namespace AasDemo
  end
end
