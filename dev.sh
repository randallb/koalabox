#! /bin/bash

rm -Rf ~/Library/Developer/Xcode/DerivedData/koalabox-axpqcspigtoulzakbzmcawhnhqfl/Build/Products/Debug/koalabox.app
yarn run concurrently "cd web; yarn dev" "cd server; yarn dev" "cd native; yarn react-native run-macos"
