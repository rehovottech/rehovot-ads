require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'RehovottechCapacitorAds'
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
  # Unity LevelPlay mediation SDK. Bump together with levelPlayVersion in android/build.gradle.
  # Network adapters (IronSourceUnityAdsAdapter, IronSourceAdMobAdapter, ...) go in each game's Podfile.
  s.dependency 'IronSourceSDK/Ads', '~> 9.6'
  s.frameworks = 'AppTrackingTransparency', 'AdSupport'
end
