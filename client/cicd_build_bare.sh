
clear

adb shell am force-stop pt.lasige.enhmessageme

git add .

git commit -m "Dummy commit"



npm version patch --no-git-tag-version

./increment_version_app_json.sh patch



git add .

git commit -m "Dummy commit"






npx expo prebuild --clean

RESULT=$?
if [ $RESULT != 0 ]; then
    echo "Aborting on $RESULT, command failed:"
    echo "npx expo prebuild ..."
    exit $RESULT
fi

npx patch-package

RESULT=$?
if [ $RESULT != 0 ]; then
    echo "Aborting on $RESULT, command failed:"
    echo "npx expo prebuild ..."
    exit $RESULT
fi

npx expo run:android

RESULT=$?
if [ $RESULT != 0 ]; then
    echo "Aborting on $RESULT, command failed:"
    echo "eas build ..."
    exit $RESULT
fi



