# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'aas_demo/version'

Gem::specification.new do |s|
  s.name          = "aas_demo"
  s.version       = AasDemo::VERSION
  s.authors       = ["YesVideo"]
  s.email         = ["aas@yesvideo.com"]
  s.summary       = "Demo web app for YesVideo Archive as a Service."
  s.license       = "MIT"

  s.files        = `git ls-files`.split("\n").reject { |f| f =~ /^testapp|^jquery-ui/ }

  s.files         = Dir["{app,config,lib}/**/*"] + ["LICENSE.txt", "README.md"]
  s.require_paths = ["lib"]

  s.add_development_dependency "bundler", "~> 1.5"
  s.add_development_dependency "rake"
  s.add_dependency "railties", "~> 3.1"
end
