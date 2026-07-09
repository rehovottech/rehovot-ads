Pod::Spec.new do |s|
  s.name = 'CapacitorAds'
  s.version = '0.1.0'
  s.summary = 'Reusable Capacitor ad bridge for native SDK backends.'
  s.license = 'MIT'
  s.homepage = 'https://github.com/rehovottech/capacitor-ads'
  s.author = 'Rehovot Tech'
  s.source = { :git => 'https://github.com/rehovottech/capacitor-ads.git', :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift}'
  s.ios.deployment_target = '13.0'
  s.swift_version = '5.9'
  s.dependency 'Capacitor'
end
