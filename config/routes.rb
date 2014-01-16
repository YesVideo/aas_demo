AasDemo::Engine.routes.draw do
  get 'partials/:partial' => 'application#partial'
end
