require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'CapacitorAds'
  s.version = package['version']
  s.summary = package['description']
  s.license = 'MIT'
  s.homepage = 'https://github.com/rehovottech/capacitor-ads'
  s.author = 'Rehovot Tech'
  s.source = { :git => 'https://github.com/rehovottech/capacitor-ads.git', :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m}'
  s.ios.deployment_target = '15.0'
  s.swift_version = '5.9'
  s.dependency 'Capacitor'
  # Unity Ads SDK (Unity Grow / Monetization). Bump together with the Android version in android/build.gradle.
  s.dependency 'UnityAds', '~> 4.20'
  s.frameworks = 'AppTrackingTransparency', 'AdSupport'
end
